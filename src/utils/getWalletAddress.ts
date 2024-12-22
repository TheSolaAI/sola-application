export async function getWalletAddress() {
    try {
        const res = await fetch('http://127.0.0.1:8001/wallet-api/create-wallet', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!res.ok) {
          return { result: 'Failed to get the wallet address' };
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
}