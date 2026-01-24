import pkg from '@stellar/stellar-sdk';
const {
    Networks,
    TransactionBuilder,
    BASE_FEE,
    StrKey,
    Operation,
    ScVal,
    xdr,
    Address,
    hash,
    SorobanDataBuilder,
    Keypair,
    rpc
} = pkg;
console.log('XDR keys matching Wasm/Args:', Object.keys(pkg.xdr).filter(k => k.includes('Wasm') || k.includes('Args')));
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { STELLAR_CONFIG } from '../src/stellarConfig.js';

// We need a keypair to sign the deployment.
// Using a throwaway or specific deployer key would be best, but for now we can ask the user or generate one.
// Let's generate a random one and fund it if needed? 
// OR, since we don't have user interaction easily in this script, let's hardcode a funded key or use the one from config if we had one.
// I'll generate a random one and Friendbot fund it.

const SERVER_URL = STELLAR_CONFIG.horizonUrl; // Horizon is not enough for Soroban RPC?
// For Soroban deployment we typically use an RPC server (Soroban RPC), not Horizon.
// Testnet Soroban RPC: https://soroban-testnet.stellar.org

const RPC_URL = 'https://soroban-testnet.stellar.org:443';

const server = new rpc.Server(RPC_URL);

async function fundAccount(publicKey) {
    const response = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
    const data = await response.json();
    console.log('Friendbot response:', data);
}



async function main() {
    console.log("Starting deployment...");

    // 1. Setup Deployer
    const pair = Keypair.random();
    console.log("Generated Deployer Key:", pair.publicKey());
    console.log("Secret:", pair.secret());

    console.log("Funding deployer...");
    await fundAccount(pair.publicKey());
    console.log("Funded.");

    // 2. Read Wasm
    const wasmPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../contracts/target/wasm32-unknown-unknown/release/contracts.wasm');
    console.log("Reading WASM from:", wasmPath);
    const wasm = await readFile(wasmPath);

    // 3. Upload Contract Code (Install)
    const account = await server.getAccount(pair.publicKey());

    // Prepare transaction
    // Upload Wasm
    const operation = Operation.restoreFootprint({});
    // Wait, deploying involves:
    // 1. Upload Wasm (InvokeHostFunction -> UploadWasm)
    // 2. Create Contract (InvokeHostFunction -> CreateContract)

    // Actually, let's use the 'installContractCode' helper if available or build the Op manually.
    // Using Operation.invokeHostFunction

    const uploadTx = new TransactionBuilder(account, { fee: BASE_FEE })
        .setNetworkPassphrase(Networks.TESTNET)
        .addOperation(Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeUploadContractWasm(wasm),
            auth: [],
        }))
        .setTimeout(30)
        .build();

    // Simulate to get footprint
    let prepared = await server.prepareTransaction(uploadTx);

    // Sign and Submit
    prepared.sign(pair);
    let result = await server.sendTransaction(prepared);

    if (result.status !== "PENDING" && result.status !== "SUCCESS") {
        // If error or PENDING (wait for logic) 
        // Soroban RPC returns PENDING often.
    }

    // Monitor status
    let status = result.status;
    let txHash = result.hash;
    console.log(`Upload Tx Hash: ${txHash}`);

    // Poll for completion
    // ... (Simplified polling for brevity, assuming standard completion or helper usage)
    // For proper polling:
    async function waitForTransaction(hash) {
        let status;
        for (let i = 0; i < 20; i++) {
            let res = await server.getTransaction(hash);
            console.log(`  Status: ${res.status}`);
            if (res.status === 'SUCCESS') return res;
            if (res.status === 'FAILED') throw new Error('Tx Failed');
            await new Promise(r => setTimeout(r, 2000));
        }
        throw new Error('Timeout');
    }

    let res = await waitForTransaction(txHash);
    // Get WASM Hash ? 
    // It's in the return value of the host function.
    // Parse result... 
    // Actually, we can pre-calculate the WASM hash simply by hashing the code, 
    // but let's extract it from the simulation or result if possible.
    // The 'result' from getTransaction has resultMeta.

    // EASIER: Just calculat SHA256 of wasm buffer.
    const crypto = await import('crypto');
    const wasmHash = crypto.createHash('sha256').update(wasm).digest();
    console.log("Wasm Hash:", wasmHash.toString('hex'));

    // 4. Instantiate Contract
    console.log("Instantiating Contract...");

    // Reload account for sequence number
    const account2 = await server.getAccount(pair.publicKey());

    const createTx = new TransactionBuilder(account2, { fee: BASE_FEE })
        .setNetworkPassphrase(Networks.TESTNET)
        .addOperation(Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeCreateContract(
                new xdr.CreateContractArgs({
                    deployer: xdr.ContractExecutable.contractExecutableWasm(wasmHash),
                    salt: xdr.Salt.fromXDR(crypto.randomBytes(32)) // random salt
                })
            ),
            auth: [],
        }))
        .setTimeout(30)
        .build();

    const preparedCreate = await server.prepareTransaction(createTx);
    preparedCreate.sign(pair);
    const resultCreate = await server.sendTransaction(preparedCreate);
    console.log(`Create Tx Hash: ${resultCreate.hash}`);

    const resCreate = await waitForTransaction(resultCreate.hash);

    // Extract Contract ID
    // The result value of the function is the Contract Address.
    // We need to parse the xdr return value.
    // ... Parsing xdr ...

    // Let's assume user will check logs or I will try to parse.
    // But strictly, we can find the CreatedContract event or return value.

    console.log("DEPLOYMENT COMPLETE (Please check logs for Contract ID if not parsed below)");
    // If I can't parse easily here without more boilerplate, I'll ask user to verify.
    // But wait, I need the ID to put in the config!

    // Let's try to get it.
    if (resCreate.returnValue) {
        // It's an xdr.ScVal
        // Decode...
        console.log("Return Value (XDR):", resCreate.returnValue.toXDR('base64'));
        const address = Address.fromScVal(resCreate.returnValue);
        console.log("CONTRACT ID:", address.toString());
    }
}

main().catch(err => console.error(err));
