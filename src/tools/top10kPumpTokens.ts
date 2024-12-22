export const top10kPumpTokensParms = {
    type: 'object',
    properties: {
      chain: {
        type: 'string',
        description: 'The name of the protocol from which the user wants to get details',
      },
    },
  };
  

export const top10kPumpTokensFunction = async ({
}: {
  [key: string]: any;
}) => {
  try {
    const res = await fetch('http://127.0.0.1:8002/data-api/top-pump-tokens-gt-10k-mc', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { result: 'Failed to get the top tokens in pump fun' };
    }

    const result = await res.json();

    return { result };
  } catch (err: any) {
    console.error('Error occurred while getting top tokens in pump fun:', err.message);
    return {
      result: {
        answer: 'Error occurred',
      },
    };
  }
};
