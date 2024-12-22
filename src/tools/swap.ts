export const swapTokensParms = {
  type: 'object',
  properties: {
    quantity: {
      type: 'number',
      description: 'Quantity of the token to swap',
    },
    tokenA: {
      type: 'string',
      description: 'The token that the user wants to swap',
    },
    tokenB: {
      type: 'string',
      description: 'The token that the user want to receive',
    },
  },
  required: ['quantity', 'tokenA', 'tokenB'],
};

export const swapTokensFunction = async ({
  quantity,
  tokenA,
  tokenB,
}: {
  [key: string]: any;
}) => {
  const payload = {
    input_token: tokenA,
    output_token: tokenB,
    amount: quantity,
  };

  try {
    const res = await fetch('http://127.0.0.1:8000/swap-api/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { result: 'result swap falied' };
    }

    const result = await res.json();

    return { result };
  } catch (err: any) {
    console.error('Error occurred during swap:', err.message);
    return {
      result: {
        answer: 'Error occurred during swap',
        signature: '',
      },
    };
  }
};
