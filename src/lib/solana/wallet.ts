const helius_api_key = import.meta.env.VITE_HELIUS_API_KEY;
const url = `https://mainnet.helius-rpc.com/?api-key=${helius_api_key}`;

export const fetchFilteredAssets = async (
  key: string,
  ownerAddress: string
) => {
  if (!ownerAddress) {
    console.log('No address provided');
    return [];
  }
  if (import.meta.env.VITE_HELIUS_API_KEY) {
    console.log('Helius API key not found');
    return [];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'searchAssets',
      params: {
        ownerAddress: ownerAddress,
        tokenType: 'all',
        displayOptions: {
          showNativeBalance: true,
          showInscription: false,
          showCollectionMetadata: false,
        },
      },
    }),
  });

  const { result } = await response.json();

  const nativeSolToken = {
    imageLink: '/Solana_logo.png',
    id: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    balance: result.nativeBalance.lamports,
    decimals: 9,
    pricePerToken: result.nativeBalance.price_per_sol,
    totalPrice: result.nativeBalance.total_price,
  };

  const filteredAssets = result.items
    .filter((item: any) => item.interface === 'FungibleToken')
    .map((item: any) => {
      const {
        content: {
          links: { image },
        },
        content: {
          metadata: { symbol },
        },
        id,
        token_info: {
          balance,
          decimals,
          price_info: { price_per_token, total_price } = {},
        },
      } = item;

      return {
        imageLink: image,
        id,
        symbol,
        balance,
        decimals,
        pricePerToken: price_per_token,
        totalPrice: total_price,
      };
    });

  filteredAssets.push(nativeSolToken);

  const sortedAssets = filteredAssets.sort(
    (a: any, b: any) => b.totalPrice - a.totalPrice
  );

  return sortedAssets;
};
