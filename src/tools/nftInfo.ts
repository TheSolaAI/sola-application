export const nftInfoParms = {
    type: 'object',
    properties: {
      symbol: {
        type: 'string',
        description: 'The name of the NFT or the symbol of the NFT',
      }
    },
    required: ['symbol'],
  };
  
  export const nftInfoFunction = async ({
    symbol
  }: {
    [key: string]: any;
  }) => {
    const payload = {
        symbol:symbol
    };
  
    try {
      const res = await fetch('http://127.0.0.1:8002/data-api/nft-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        return { result: 'Failed to get that NFT details, try other NFT' };
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
  