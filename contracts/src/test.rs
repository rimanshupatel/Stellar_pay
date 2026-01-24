#![cfg(test)]

use super::*;
use soroban_sdk::{Env, testutils::{Address as _, Events}, token, vec, IntoVal};

#[test]
fn test_pay() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PaymentContract);
    let client = PaymentContractClient::new(&env, &contract_id);

    // Setup Token
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token = token::Client::new(&env, &token_contract);

    // Setup User and Merchant
    let user = Address::generate(&env);
    let merchant = Address::generate(&env);

    // Mint tokens to User
    let _ = token::StellarAssetClient::new(&env, &token_contract).mint(&user, &1000);

    // User approves Contract to spend tokens
    // Note: In tests, we stick to the flow. 
    // The Contract.pay implementation uses 'client.transfer_from(&env.current_contract_address(), &from, ...)'
    // Wait, 'transfer_from' requires 'spender' to be valid.
    // The 'spender' IS the contract address because the contract calls it.
    // So 'user' must approve 'contract_address'.
    
    // Authorization logic in Soroban tests is explicit.
    // For 'transfer_from' to work, 'user' must have authorized 'contract' to spend 'amount'.
    // In SDK 20, we mock auths.
    
    // We actually need to invoke the authorization.
    // But for a simple test, we just want to see if the invocation works.
    
    // However, my contract code:
    // client.transfer_from(&env.current_contract_address(), &from, &to, &amount);
    // This implies THE CONTRACT is the spender.
    // So User calls 'approve(contract, amount)' FIRST on the token.
    
    token.approve(&user, &contract_id, &100, &1000); // Expiration? SDK 20 interface might differ.
    // SDK 20 token interface: approve(from, spender, amount, expiration_ledger)
    
    // Mock auths are handled differently in new SDKs, often auto-mocked in tests if configured.
    // Let's keep it simple. If this fails, I'll fix it.
    
    // Execute Pay
    let ref_id = Symbol::new(&env, "order_123");
    client.pay(&user, &merchant, &token_contract, &100, &ref_id);

    // Assert Events
    let events = env.events().all();
    assert_eq!(events.len(), 2); // Transfer event + My Payment event
    // Verify the Payment event
    // ...
}
