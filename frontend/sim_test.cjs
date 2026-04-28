const { Horizon, rpc, Contract, Address, xdr, nativeToScVal, BASE_FEE, TransactionBuilder } = require('@stellar/stellar-sdk');

const STELLAR_CONFIG = {
    network: "TESTNET",
    networkPassphrase: "Test SDF Network ; September 2015",
    horizonUrl: "https://horizon-testnet.stellar.org",
    rpcUrl: "https://soroban-testnet.stellar.org",
    paymentContractId: "CCXYFFC72UXDTVZP7TJSONO2X6OWCW7BBZCVSTQEY7ZTAKEXU3XQW44L",
    assets: {
        USDC: { contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA" }
    }
};

async function main() {
    // Generate a random account for testing
    const walletAddress = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"; // dummy
    
    const server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
    // Since we just want to simulate, the sequence number doesn't matter too much, but we need an account that exists.
    // Let's use the USDC issuer as dummy since it exists.
    const source = await server.loadAccount(walletAddress);

    const contract = new Contract(STELLAR_CONFIG.paymentContractId);
    const op = contract.call(
        'create_order',
        new Address(walletAddress).toScVal(),
        new Address(STELLAR_CONFIG.assets.USDC.contractId).toScVal(),
        nativeToScVal(100000000, { type: 'i128' }),
        xdr.ScVal.scvSymbol('order_1234')
    );

    let tx = new TransactionBuilder(source, {
        fee: BASE_FEE,
        networkPassphrase: STELLAR_CONFIG.networkPassphrase
    })
    .addOperation(op)
    .setTimeout(30)
    .build();

    const rpcServer = new rpc.Server(STELLAR_CONFIG.rpcUrl);
    const sim = await rpcServer.simulateTransaction(tx);
    console.log(JSON.stringify(sim, null, 2));
}

main().catch(console.error);
