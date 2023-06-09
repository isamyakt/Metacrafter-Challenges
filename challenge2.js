// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");


// Making a keypair and getting the private key
// const newPair = Keypair.generate();
// console.log(newPair);

// paste your secret that is logged here
const DEMO_FROM_SECRET_KEY = new Uint8Array(
  // paste your secret key array here
    [
        177, 214, 250, 190,  60,  50,  21,  75, 179, 190, 245,
        124, 110, 221, 193, 189,   7,   4,  63, 191,  80,  50,
        85,  31, 128,  99, 172, 167,  41, 180, 229, 228, 154,
        238,  54, 201, 242, 160, 153,  12, 193, 106, 120,  67,
        15, 233,  42,  78,  96, 136, 244,   6, 236,  64,  60,
        250,  18,   4,  66, 191, 141,  45, 170,  76
    ]            
);

const RECEIVER_SECRET_KEY = new Uint8Array(
    // paste your secret key array here
      [
          177, 214, 250, 190,  60,  50,  21,  75, 179, 190, 245,
          124, 110, 221, 193, 189,   7,   4,  63, 191,  80,  50,
          85,  31, 128,  99, 172, 167,  41, 180, 229, 228, 154,
          238,  54, 201, 242, 160, 153,  12, 193, 106, 120,  67,
          15, 233,  42,  78,  96, 136, 244,   6, 236,  64,  60,
          250,  18,   4,  66, 191, 141,  45, 170,  76
      ]            
  );

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
    var to = Keypair.fromSecretKey(RECEIVER_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();


    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    const TO_WALLET_BAL = await connection.getBalance(new PublicKey(to.publicKey));
    console.log("Airdrop completed for the Sender account");
    let fiftyPercent = (parseInt(TO_WALLET_BAL) / LAMPORTS_PER_SOL) * 0.5;

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: fiftyPercent * LAMPORTS_PER_SOL
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is', signature);

    console.log("Checking wallet balances after fifty percent transfer!");
    const WALLET_BAL_FROM = await connection.getBalance(from.publicKey);
    const WALLET_BAL_TO = await connection.getBalance(to.publicKey);
    console.log("From Wallet Balance : " + (parseInt(WALLET_BAL_FROM) / LAMPORTS_PER_SOL) + " SOL");
    console.log("To Wallet Balance : " + (parseInt(WALLET_BAL_TO) / LAMPORTS_PER_SOL) + " SOL");
}

transferSol();