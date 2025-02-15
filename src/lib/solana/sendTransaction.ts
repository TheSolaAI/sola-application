import { Connection, VersionedTransaction, PublicKey, TransactionMessage,ComputeBudgetProgram} from "@solana/web3.js";
import { ConnectedSolanaWallet } from "@privy-io/react-auth"

export async function sendTransactionWithPriority(
    wallet: ConnectedSolanaWallet,
    transaction: string,
    fee: number,
    connection: Connection
) {
    try {
        const txnBuffer = Buffer.from(transaction, "base64");
        const txn = VersionedTransaction.deserialize(txnBuffer);
        let txnIx = TransactionMessage.decompile(txn.message).instructions;

        const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 });
        const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: Math.floor(fee) });

        const newMessage = new TransactionMessage({
            payerKey: new PublicKey(wallet.address),
            recentBlockhash: txn.message.recentBlockhash,
            instructions: [computeUnitLimitIx, computePriceIx, ...txnIx],
        }).compileToV0Message();

        const newTxn = new VersionedTransaction(newMessage);

        wallet.signTransaction(newTxn)
        const signature = await connection.sendTransaction(newTxn, { skipPreflight: false });
        console.log("Transaction sent:", signature);
        return signature;
    }
    catch (error:any) { 
        if (error.message?.includes("0x1771") || error.message?.includes("6001")) {
            console.log("Max Slippage hit");
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return null
        }
    }
}
