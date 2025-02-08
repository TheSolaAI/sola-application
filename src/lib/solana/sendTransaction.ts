import axios from 'axios';

import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
let rpc = process.env.SOLANA_RPC

export async function sendTransaction(wallet:ConnectedSolanaWallet,transaction:string) { 
    const txnBuffer = Buffer.from(transaction, "base64")
    const txn = VersionedTransaction.deserialize(txnBuffer);
    

}
async function getPriorityFee() { 
    
}