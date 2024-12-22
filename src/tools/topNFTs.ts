export const topNFTsParms = {
    type: 'object',
    properties: {
      chain: {
        type: 'string',
        description: 'The name of the blockchain from which the user wants to get details',
      },
    },
  };
  

export const topNFTsFunction = async ({
}: {
  [key: string]: any;
}) => {
  try {
    const res = await fetch('http://127.0.0.1:8002/data-api/top-nfts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { result: 'Failed to get the top trading NFTs' };
    }

    const result = await res.json();

    return { result };
  } catch (err: any) {
    console.error('Error occurred while getting the nfts:', err.message);
    return {
      result: {
        answer: 'Error occurred',
      },
    };
  }
};
