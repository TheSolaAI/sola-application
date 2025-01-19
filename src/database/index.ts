import axios from 'axios';

const dbClient = axios.create({
  baseURL: 'http://144.202.21.83:8000/api/v1/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default dbClient;
