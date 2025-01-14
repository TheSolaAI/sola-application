import axios from 'axios'


const url = "http://localhost:3001/"

export const getMarketData = async () => {
    if (!url) { 
        return;
    }
  let market_url = url + 'market';
  const response = await axios.get(market_url);
  return response.data;
};

 
