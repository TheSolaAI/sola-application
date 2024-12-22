export const transferTokensParms = {
  type: 'object',
  properties: {
    quantity: {
      type: 'number',
      description: 'Quantity of the token to send.',
    },
    token: {
      type: 'string',
      description: 'The token that the user wants to send.',
    },
    destination: {
      type: 'string',
      description: 'The destination wallet address.',
    },
  },
  required: ['quantity', 'token', 'destination'],
};

export const transferTokensFunction = async ({
  quantity,
  token,
  destination,
}: {
  [key: string]: any;
}) => {
  const payload = {
    destination: destination,
    token: token,
    amount: quantity,
  };

  try {
    const res = await fetch('http://127.0.0.1:8001/wallet-api/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { result: 'The token transfer failled' };
    }

    const txResult = await res.json();
    console.log(txResult)
    // const checkStatus = await fetch(
    //   'http://127.0.0.1:8001/wallet-api/tx-status',
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(txResult['data']['transaction-id']),
    //   }
    // );

    // const txStatus = await checkStatus.json();
    return { txResult };
  } catch (err: any) {
    console.error('Error occurred during the transfer:', err.message);
    return {
      result: {
        answer: 'Error occurred during the transfer',
        signature: '',
      },
    };
  }
};
