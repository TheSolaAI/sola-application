import { customMessageCards } from '../lib/chat-message/customMessageCards';
import { messageCard } from '../lib/chat-message/messageCard';
import { depositLulo, getAssetsLulo, withdrawLulo } from '../lib/solana/lulo';
import { responseToOpenai } from '../lib/utils/response';
import useAppState from '../models/AppState.ts';
import { AssetsParams, DepositParams, WithdrawParams } from '../types/lulo';
import { LuloCard, TransactionCard } from '../types/messageCard';
import useChatHandler from '../hooks/handleAddMessage';
import { tokenList } from '../config/tokens/tokenMapping';
import { Connection } from '@solana/web3.js';
import { useRoomStore } from '../models/RoomState.ts';
import { agentMessage } from '../lib/chat-message/agentMessage';

export const useLuloActions = () => {
  const { appWallet } = useAppState();
  const rpc = process.env.SOLANA_RPC;
  const { handleAddMessage } = useChatHandler();
  const { setMessageList } = useRoomStore();

  const handleUserAssetsLulo = async () => {
    if (!appWallet) return null;
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );

    // await handleAddMessage(agentMessage(`Fetching your Lulo Assets`));

    const params: AssetsParams = {
      owner: `${appWallet.address}`,
    };
    const assets = await getAssetsLulo(params);

    if (!assets) {
      await handleAddMessage(
        messageCard('Oops! Unable to fetch your Lulo assets'),
      );

      return responseToOpenai(
        'tell the user that they dont have any assets in lulo right now',
      );
    }

    let luloCardItem: LuloCard = assets;

    await handleAddMessage(customMessageCards('luloCard', luloCardItem));

    return responseToOpenai(
      'tell the user that their lulo assets are successfully fetched',
    );
  };

  //TODO: Structure the Message Types
  const handleDepositLulo = async (
    amount: number,
    token: 'USDT' | 'USDS' | 'USDC',
  ) => {
    if (!appWallet) return null;
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );

    // await handleAddMessage(agentMessage(`Agent is depositing the asset`));

    const params: DepositParams = {
      owner: `${appWallet.address}`,
      depositAmount: amount,
      mintAddress: tokenList[token].MINT,
    };

    const connection = new Connection(rpc);

    const transaction_array = await depositLulo(params);
    if (!transaction_array) {
      await handleAddMessage(
        messageCard(`Deposit failed. Check your balance.`),
      );

      return responseToOpenai(
        `tell the user that they dont have ${amount} worth of this ${token}`,
      );
    }

    for (const transaction in transaction_array) {
      let tx = transaction_array[transaction];
      let { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      tx.message.recentBlockhash = blockhash;
      let txCard: TransactionCard = {
        title: `1}`,
        status: '1',
        link: `1`,
      };
      try {
        const signedTransaction = await appWallet.signTransaction(
          transaction_array[transaction],
        );
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
        );
        txCard = {
          title: `Deposit ${amount} ${token}`,
          status: 'Transaction Sent',
          link: `https://solscan.io/tx/${signature}`,
        };
      } catch (error: any) {
        error.getLogs();
      }

      // TODO: Handle dynamic status

      setMessageList((prev) => [
        ...prev,
        {
          type: 'transaction',
          card: txCard,
        },
      ]);
    }
    return responseToOpenai(
      'tell the user that transaction is sent to blockchain',
    );
  };

  //TODO: Handle Message display
  const handleWithdrawLulo = async (
    amount: number,
    token: 'USDT' | 'USDS' | 'USDC',
  ) => {
    if (!appWallet) return null;
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );
    // await handleAddMessage(agentMessage(`Agent is withdrawing the asset`));

    let all = false;

    const assetParams: AssetsParams = {
      owner: `${appWallet.address}`,
    };
    let withdrawAmount = amount;
    const connection = new Connection(rpc);

    let assets = await getAssetsLulo(assetParams);
    if (assets) {
      let asset_list = assets.tokenBalance;
      asset_list.map((asset) => {
        if (asset.mint === tokenList[token].MINT) {
          if (asset.balance > 0) {
            if (asset.balance - amount < 100) {
              all = true;
              withdrawAmount = asset.balance;
              handleAddMessage(
                agentMessage(
                  `Lulo total must be greater than 100. Withdrawing ${Math.ceil(withdrawAmount)} ${token}`,
                ),
              );
            }
          }
        }
      });
    }

    withdrawAmount = Math.ceil(withdrawAmount);

    const params: WithdrawParams = {
      owner: `${appWallet.address}`,
      withdrawAmount: withdrawAmount,
      mintAddress: tokenList[token].MINT,
      withdrawAll: all,
    };

    try {
      const transaction_array = await withdrawLulo(params);

      if (!transaction_array) {
        await handleAddMessage(
          messageCard(`Withdrawal failed. Check your balance.`),
        );

        return responseToOpenai(
          `tell the user that withdraw of ${withdrawAmount} of the token ${token} failed due to less balance.`,
        );
      }

      for (const transaction in transaction_array) {
        let tx = transaction_array[transaction];
        let { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        tx.message.recentBlockhash = blockhash;

        const signedTransaction = await appWallet.signTransaction(
          transaction_array[transaction],
        );

        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
        );

        // TODO: Handle dynamic status
        let txCard: TransactionCard = {
          title: `Withdraw ${withdrawAmount} ${token}`,
          status: 'Sent transaction',
          link: `https://solscan.io/tx/${signature}`,
        };

        setMessageList((prev) => [
          ...prev,
          {
            type: 'transaction',
            card: txCard,
          },
        ]);
      }
      return responseToOpenai(
        'The transaction is sent . ask what the user wants to do next',
      );
    } catch (error) {
      console.error('error while performing the swap, ', error);
      return responseToOpenai(
        'Just tell the user that Swap failed and ask them to try later after some time',
      );
    }
  };
  return { handleUserAssetsLulo, handleDepositLulo, handleWithdrawLulo };
};
