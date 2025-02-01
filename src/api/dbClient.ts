import axios from 'axios';
import axiosRetry from 'axios-retry';

const authServiceUrl = process.env.AUTH_SERVICE_URL;
if (!authServiceUrl) {
  throw new Error('AUTH_SERVICE_URL environment variable is not defined');
}

const dbClient = axios.create({
  baseURL: authServiceUrl,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosRetry(dbClient, {
  retries: 3,
  retryDelay: (retryCount) => {
    const delay = axiosRetry.exponentialDelay(retryCount);
    console.log(
      `Retrying request... Attempt ${retryCount}, waiting ${delay}ms`,
    );
    return delay;
  },
  retryCondition: (error) => {
    if (error.code === 'ECONNABORTED' || axiosRetry.isNetworkError(error)) {
      return true;
    }
    if (error.response && error.response.status >= 500) {
      return true;
    }
    return false;
  },
});

export default dbClient;
