import { depositLulo, withdrawLulo } from '../lib/solana/lulo';
import { DepositParams, WithdrawParams } from '../types/lulo';

async function testDepositLulo() {
  const params: DepositParams = {
    owner: '3sJGHo9xricr9FGG84iiZ6hDQxH1p5xfGtAoYfrxQcei',
    depositAmount: 100,
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  };
  const response = await depositLulo(params);
  console.log(response);
}

async function testWithdrawLulo() {
  const params: WithdrawParams = {
    owner: '3sJGHo9xricr9FGG84iiZ6hDQxH1p5xfGtAoYfrxQcei',
    withdrawAmount: 100,
    mintAddress: 'USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA',
    withdrawAll: false,
  };
  const response = await withdrawLulo(params);
  console.log(response);
}

testDepositLulo();
testWithdrawLulo();
