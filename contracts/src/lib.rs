#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, token};

#[contract]
pub struct PaymentContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentEvent {
    pub from: Address,
    pub to: Address,
    pub token: Address,
    pub amount: i128,
    pub ref_id: Symbol,
}

#[contractimpl]
impl PaymentContract {
    // initialize is not strictly needed if we don't store state, but good for pattern
    pub fn pay(env: Env, from: Address, to: Address, token: Address, amount: i128, ref_id: Symbol) {
        from.require_auth();
        
        let client = token::Client::new(&env, &token);
        
        // Transfer funds from 'from' to 'to'
        // 'from' must have authorized this contract to transfer? 
        // OR 'from' calls this contract and 'pay' calls 'transfer_from'?
        // Standard token interface: 'transfer' sends from caller. 
        // If we use 'transfer_from', we need allowance.
        // If we just want to log the event, 'from' should probably transfer to 'to' directly?
        // But we want to ensure the event is tied to the transfer.
        // So: 'from' calls THIS contract. THIS contract calls 'token.transfer_from(from, to, amount)'.
        // For this to work, 'from' must approve this contract.
        // EASIER: 'from' calls 'token.transfer' directly. 
        // BUT we want the 'ref_id' on-chain for the backend to see "This payment is for Order XYZ".
        // Soroban Token 'transfer' doesn't take memos.
        
        // So, we use 'transfer_from'.
        // Flow: 
        // 1. User approves Contract to spend Amount.
        // 2. User calls Contract.pay(to, amount, ref_id).
        // 3. Contract calls Token.transfer_from(from, to, amount).
        // 4. Contract emits event.
        
        client.transfer_from(&env.current_contract_address(), &from, &to, &amount);

        // Publish event
        env.events().publish(
            (Symbol::new(&env, "payment"), from, to), 
            (token, amount, ref_id)
        );
    }
}

#[cfg(test)]
mod test;
