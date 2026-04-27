#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum OrderStatus {
    Pending = 0,
    Released = 1,
    Refunded = 2,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Order {
    pub buyer: Address,
    pub merchant: Address,
    pub token: Address,
    pub amount: i128,
    pub status: OrderStatus,
}

#[contracttype]
pub enum DataKey {
    Order(Symbol),
}

#[contract]
pub struct StellarPayContract;

#[contractimpl]
impl StellarPayContract {
    /// Buyer deposits funds into the contract, creating a new escrow order.
    pub fn deposit(
        env: Env,
        buyer: Address,
        merchant: Address,
        token_address: Address,
        amount: i128,
        ref_id: Symbol,
    ) {
        buyer.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let order_key = DataKey::Order(ref_id.clone());
        if env.storage().persistent().has(&order_key) {
            panic!("order already exists");
        }

        // Transfer funds from buyer to the contract
        let token = token::Client::new(&env, &token_address);
        token.transfer(&buyer, &env.current_contract_address(), &amount);

        // Save order to storage
        let order = Order {
            buyer: buyer.clone(),
            merchant: merchant.clone(),
            token: token_address.clone(),
            amount,
            status: OrderStatus::Pending,
        };
        env.storage().persistent().set(&order_key, &order);

        // Emit deposit event
        env.events().publish(
            (symbol_short!("deposit"), ref_id),
            (buyer, merchant, token_address, amount),
        );
    }

    /// Merchant releases the funds to themselves after fulfilling the order.
    pub fn release(env: Env, merchant: Address, ref_id: Symbol) {
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

        if order.status != OrderStatus::Pending {
            panic!("order is not pending");
        }

        // Update status to prevent double-release
        order.status = OrderStatus::Released;
        env.storage().persistent().set(&order_key, &order);

        // Transfer funds from contract to merchant
        let token = token::Client::new(&env, &order.token);
        token.transfer(&env.current_contract_address(), &merchant, &order.amount);

        // Emit release event
        env.events().publish((symbol_short!("release"), ref_id), merchant);
    }

    /// Merchant can refund the order, sending funds back to the buyer.
    pub fn refund(env: Env, merchant: Address, ref_id: Symbol) {
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

        if order.status != OrderStatus::Pending {
            panic!("order is not pending");
        }

        // Update status to prevent double-refund
        order.status = OrderStatus::Refunded;
        env.storage().persistent().set(&order_key, &order);

        // Transfer funds from contract back to buyer
        let token = token::Client::new(&env, &order.token);
        token.transfer(&env.current_contract_address(), &order.buyer, &order.amount);

        // Emit refund event
        env.events().publish((symbol_short!("refund"), ref_id), order.buyer);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Events};
    use soroban_sdk::{token, vec, IntoVal, Symbol};

    #[test]
    fn test_deposit_and_release() {
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

        // Mint tokens to buyer
        token_admin_client.mint(&buyer, &1000);
        assert_eq!(token_client.balance(&buyer), 1000);

        // Mock auth for buyer's deposit
        // In actual Freighter usage, buyer signs the transaction calling deposit.
        // The contract's token::Client::transfer will require auth from buyer.
        env.mock_all_auths();

        // DEPOSIT
        client.deposit(&buyer, &merchant, &token_contract, &100, &ref_id);

        // Verify balances after deposit
        assert_eq!(token_client.balance(&buyer), 900);
        assert_eq!(token_client.balance(&contract_id), 100);

        // RELEASE
        client.release(&merchant, &ref_id);

        // Verify balances after release
        assert_eq!(token_client.balance(&contract_id), 0);
        assert_eq!(token_client.balance(&merchant), 100);

        // Verify Events
        let events = env.events().all();
        // The events list includes token transfer events and our custom events.
        // In a real test, we would iterate and find our specific events to assert.
        assert!(events.len() > 0);
    }

    #[test]
    fn test_deposit_and_refund() {
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

        token_admin_client.mint(&buyer, &1000);

        env.mock_all_auths();

        // DEPOSIT
        client.deposit(&buyer, &merchant, &token_contract, &100, &ref_id);
        assert_eq!(token_client.balance(&buyer), 900);
        assert_eq!(token_client.balance(&contract_id), 100);

        // REFUND
        client.refund(&merchant, &ref_id);

        // Verify balances after refund
        assert_eq!(token_client.balance(&contract_id), 0);
        assert_eq!(token_client.balance(&buyer), 1000);
    }
}
