import axios, { AxiosRequestConfig } from "axios";
import { TokenData } from "../../types/token_data";


const data_service_url = process.env.DATA_SERVICE_URL;

export async function getTokenData(
    params:any,
): Promise<TokenData | null> {
  console.log(params)
  try {
    const response = await axios.post<any>(
      data_service_url +'data/token/address',
      params,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    console.log(response.data);
      const token_data: TokenData = response.data;
      console.log(token_data);
        return token_data;
        
      } catch (error) {
        console.error('Error fetching assets:', error);
        return null;
      }
    
};