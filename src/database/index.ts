import axios from 'axios';

const dbClient = axios.create({
  baseURL: 'https://auth-service.solaai.tech/api/v1/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default dbClient;
