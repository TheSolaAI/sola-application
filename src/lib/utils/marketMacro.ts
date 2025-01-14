import axios from 'axios'

const url = process.env.PROXY_SERVER2_URL
export const getMarketData = async () => {
    if (!url) { 
        return;
    }
  let market_url = url + 'market';
  const response = await axios.get(market_url);
  return response.data;
};
