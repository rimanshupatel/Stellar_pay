#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String, Symbol,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum OrderStatus {
    Pending = 0,
    Paid = 1,
    Released = 2,
    Refunded = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Order {
    pub merchant: Address,
    pub token: Address,
    pub amount: i128,
    pub status: OrderStatus,
    pub buyer: Option<Address>,
    pub tx_hash: Option<String>,
}

#[contracttype]
pub enum DataKey {
    Order(Symbol),
}

#[contract]
pub struct StellarPayContract;

#[contractimpl]
impl StellarPayContract {
    /// Merchant creates an order on-chain, storing the terms. No funds are moved yet.
    pub fn create_order(
        env: Env,
        merchant: Address,
        token_address: Address,
        amount: i128,
        ref_id: Symbol,
    ) {
        merchant.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let order_key = DataKey::Order(ref_id.clone());
        if env.storage().persistent().has(&order_key) {
            panic!("order already exists");
        }

        let order = Order {
            merchant: merchant.clone(),
            token: token_address.clone(),
            amount,
            status: OrderStatus::Pending,
            buyer: None,
            tx_hash: None,
        };
        env.storage().persistent().set(&order_key, &order);

        env.events().publish(
            (symbol_short!("create"), ref_id),
            (merchant, token_address, amount),
        );
    }

    /// Buyer marks the order as paid, pulling funds into the contract escrow.
    pub fn mark_paid(
        env: Env,
        buyer: Address,
        ref_id: Symbol,
        tx_hash: String,
    ) {
        buyer.require_auth();

        let order_key = DataKey::Order(ref_id.clone());
        let mut order: Order = env
            .storage()
            .persistent()
            .get(&order_key)
            .unwrap_or_else(|| panic!("order not found"));

        if order.status != OrderStatus::Pending {
            panic!("order is not pending");
        }

        // Transfer funds from buyer to the contract
        let token = token::Client::new(&env, &order.token);
        token.transfer(&buyer, &env.current_contract_address(), &order.amount);

        // Update status to Paid and save buyer info
        order.status = OrderStatus::Paid;
        order.buyer = Some(buyer.clone());
        order.tx_hash = Some(tx_hash.clone());
        env.storage().persistent().set(&order_key, &order);

        env.events().publish(
            (symbol_short!("paid"), ref_id),
            (buyer, tx_hash),
        );
    }

    /// Merchant releases the funds to themselves after fulfilling the order.
    pub fn release_funds(env: Env, merchant: Address, ref_id: Symbol) {
        merchant.require_auth();

        let order_key = DataKey::Order(ref_id.clone());
        let mut order: Order = env
            .storage()
            .persistent()
            .get(&order_key)
            .unwrap_or_else(|| panic!("order not found"));

        if order.merchant != merchant {
            panic!("only the merchant can release this order");
        }

        if order.status != OrderStatus::Paid {
            panic!("order is not paid");
        }

        // Update status to prevent double-release
        order.status = OrderStatus::Released;
        env.storage().persistent().set(&order_key, &order);

        // Transfer funds from contract to merchant
        let token = token::Client::new(&env, &order.token);
        token.transfer(&env.current_contract_address(), &merchant, &order.amount);

        env.events().publish((symbol_short!("release"), ref_id), merchant);
    }

    /// Merchant can refund the order, sending funds back to the buyer.
    pub fn refund_funds(env: Env, merchant: Address, ref_id: Symbol) {
        merchant.require_auth();

        let order_key = DataKey::Order(ref_id.clone());
        let mut order: Order = env
            .storage()
            .persistent()
            .get(&order_key)
            .unwrap_or_else(|| panic!("order not found"));

        if order.merchant != merchant {
            panic!("only the merchant can refund this order");
        }

        if order.status != OrderStatus::Paid && order.status != OrderStatus::Pending {
            panic!("order cannot be refunded");
        }

        // If it was paid, transfer funds back to buyer
        if order.status == OrderStatus::Paid {
            if let Some(buyer) = &order.buyer {
                let token = token::Client::new(&env, &order.token);
                token.transfer(&env.current_contract_address(), buyer, &order.amount);
            }
        }

        order.status = OrderStatus::Refunded;
        env.storage().persistent().set(&order_key, &order);

        env.events().publish((symbol_short!("refund"), ref_id), order.buyer);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Events};
    use soroban_sdk::{token, vec, IntoVal, Symbol, String};

    #[test]
    fn test_escrow_flow() {
        let env = Env::default();
        let contract_id = env.register_contract(None, StellarPayContract);
        let client = StellarPayContractClient::new(&env, &contract_id);

        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract(token_admin.clone());
        let token_client = token::Client::new(&env, &token_contract);
        let token_admin_client = token::StellarAssetClient::new(&env, &token_contract);

        let buyer = Address::generate(&env);
        let merchant = Address::generate(&env);
        let ref_id = Symbol::new(&env, "order_123");
        let tx_hash = String::from_str(&env, "dummy_tx_hash");

        // Mint tokens to buyer
        token_admin_client.mint(&buyer, &1000);
        assert_eq!(token_client.balance(&buyer), 1000);

        env.mock_all_auths();

        // 1. CREATE ORDER (Merchant)
        client.create_order(&merchant, &token_contract, &100, &ref_id);

        // Verify balances unchanged
        assert_eq!(token_client.balance(&buyer), 1000);
        assert_eq!(token_client.balance(&contract_id), 0);

        // 2. MARK PAID (Buyer)
        client.mark_paid(&buyer, &ref_id, &tx_hash);

        // Verify balances after payment
        assert_eq!(token_client.balance(&buyer), 900);
        assert_eq!(token_client.balance(&contract_id), 100);

        // 3. RELEASE FUNDS (Merchant)
        client.release_funds(&merchant, &ref_id);

        // Verify balances after release
        assert_eq!(token_client.balance(&contract_id), 0);
        assert_eq!(token_client.balance(&merchant), 100);
    }

    #[test]
    fn test_escrow_refund() {
        let env = Env::default();
        let contract_id = env.register_contract(None, StellarPayContract);
        let client = StellarPayContractClient::new(&env, &contract_id);

        let token_admin = Address::generate(&env);
        let token_contract = env.register_stellar_asset_contract(token_admin.clone());
        let token_client = token::Client::new(&env, &token_contract);
        let token_admin_client = token::StellarAssetClient::new(&env, &token_contract);

        let buyer = Address::generate(&env);
        let merchant = Address::generate(&env);
        let ref_id = Symbol::new(&env, "order_456");
        let tx_hash = String::from_str(&env, "dummy_tx_hash2");

        token_admin_client.mint(&buyer, &1000);

        env.mock_all_auths();

        client.create_order(&merchant, &token_contract, &100, &ref_id);
        client.mark_paid(&buyer, &ref_id, &tx_hash);
        assert_eq!(token_client.balance(&buyer), 900);
        assert_eq!(token_client.balance(&contract_id), 100);

        // REFUND
        client.refund_funds(&merchant, &ref_id);

        // Verify balances after refund
        assert_eq!(token_client.balance(&contract_id), 0);
        assert_eq!(token_client.balance(&buyer), 1000);
    }
}
