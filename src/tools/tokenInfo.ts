export const tokenInfoParms = {
  type: 'object',
  properties: {
    symbol: {
      type: 'string',
      description: 'The name of the Token or the symbol of the Token',
    },
  },
  required: ['symbol'],
};

export const tokenInfoFunction = async ({ symbol }: { [key: string]: any }) => {
  const payload = {
    symbol: symbol,
  };

  try {
    const res = await fetch('http://127.0.0.1:8002/data-api/token-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { result: 'Failed to get that Token details, try other Token' };
    }

    const result = await res.json();

    return { result };
  } catch (err: any) {
    console.error('Error occurred while fetching the details:', err.message);
    return {
      result: {
        answer: 'Error occurred',
      },
    };
  }
};
