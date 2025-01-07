import axios from 'axios';
import { Collection } from '../../types/magicEden';
import { NFTCollectionCard, TrendingNFTCard } from '../../types/messageCard';

export const fetchMagicEdenLaunchpadCollections = async (
  limit: number = 100,
): Promise<Collection[]> => {
  const url = `/api/v2/launchpad/collections?limit=${limit}`;

  try {
    const response = await axios.get<Collection[]>(url, {
      headers: {
        accept: 'application/json',
      },
    });

    const currentDate = new Date();
    console.log('Today', currentDate.getDate());
    console.log(response.data);

    const futureCollections = response.data.filter((collection) => {
      const launchDate = new Date(collection.launchDatetime);
      return currentDate <= launchDate;
    });

    console.log('Fetched Future Collections:', futureCollections);
    return futureCollections;
  } catch (error) {
    console.error('Error fetching Magic Eden collections:', error);
    throw error;
  }
};

export const fetchMagicEdenNFTPrice = async (
  nft_name: string,
  nft_symbol: string,
): Promise<NFTCollectionCard> => {
  const url = `/api/v2/collections/${nft_symbol}/stats`
  const url2 = `/api/collections/${nft_symbol}`;
  console.log(url);
  console.log(url2);
  try {
    const response = await axios.get<Collection[]>(url, {
      headers: {
        accept: 'application/json',
      },
    });
    let data: any = response.data;
    console.log(data);
    const response2 = await axios.get<Collection[]>(url2, {
      headers: {
        accept: 'application/json',
      },
    });

    
    let data2: any = response2.data;

    
    console.log(data2);

    let name = nft_name;
    let price: number = data['floorPrice']/1000000000;
    let image = data2["image"]
    let listed = data['listedCount'];
    let symbol = nft_symbol

    let nft_card: NFTCollectionCard = {
      symbol: symbol,
      title: name,
      price: price.toFixed(2),
      image: image,
      listed: listed,
    };

    return nft_card;
  } catch (error) {
    console.error('Error fetching Magic Eden collections:', error);
    throw error;
  }
};

export const fetchTrendingNFTs = async () =>{ 
  const url = process.env.DATA_SERVICE_URL + "data/nft/top_nft"
  try {
    const response = await axios.get<[]>(url, {
      headers: {
        accept: 'application/json',
      },
    });

    let data: TrendingNFTCard[] = response.data;
    return data
  }
  catch (error) {
    console.error('Error fetching  Trending collections:', error);
    throw error;
  }
};
