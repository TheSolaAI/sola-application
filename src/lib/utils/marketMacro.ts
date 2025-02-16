import ApiClient from '../../api/ApiClient';

const url = import.meta.env.VITE_DATA_SERVICE_URL;

export const getMarketData = async () => {
  if (!url) {
    return;
  }
  let market_url = url + 'data/market/market';
  const response = await ApiClient.get<any>(market_url);
  return response.data;
};
