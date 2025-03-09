import axios from 'axios';
import { TokenGate } from '../../types/token_data';

const url = ;

export const tokenGate = async (address: string) => {
  try {
    let verify_url = `${url}/api/wallet/verify/access`;
    const response = await axios.post(verify_url, {
      address,
    });
    let data: TokenGate = response.data;
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const nftGate = async (address: string) => {
  try {
    let verify_url = `${url}/api/wallet/verify/access`;
    const response = await axios.post(verify_url, {
      address,
    });
    let data: TokenGate = response.data;
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
};
