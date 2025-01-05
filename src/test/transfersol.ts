import { transferSolTx } from "../lib/solana/transferSol";



async function testTransferSolTx() { 
    const from = 'FHsQyxcRZZFJ8sRJwXmcNfcoNoRiCWGJPtZPGsaskDDm';
    const to = '9is85us6rMpZVv63peUFbqq113YnQSNyTT1qGp3DtAru';
    const amount = 1;

    const transaction = await transferSolTx(from, to, amount);
    console.log('Transaction:', transaction);
    
}
testTransferSolTx();
