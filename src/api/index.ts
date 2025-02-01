import axios from 'axios';
import axiosRetry from 'axios-retry';

const auth_service_url = process.env.AUTH_SERVICE_URL;
const dbClient = axios.create({
  baseURL: auth_service_url,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosRetry(dbClient, {
  retries: 3, 
  retryDelay: (retryCount) => {
    console.log(`Retrying request... Attempt ${retryCount}`);
    return retryCount * 1000;
  },
  retryCondition: (error) => {
    return error.code === 'ECONNABORTED' || axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
  },
});

export default dbClient;
