import axios from 'axios';
import axiosRetry from 'axios-retry';

const dbClient = axios.create({
  baseURL: 'https://auth-service.solaai.tech/api/v1/auth',
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
