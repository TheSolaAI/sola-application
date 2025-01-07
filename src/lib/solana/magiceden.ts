import axios from 'axios';
import { Collection } from '../../types/magicEden';
import { NFTCollectionCard } from '../../types/messageCard';

export const fetchMagicEdenLaunchpadCollections = async (
  limit: number = 100,
): Promise<Collection[]> => {
  const url = `https://api-mainnet.magiceden.dev/v2/launchpad/collections?limit=${limit}`;

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
  const url = process.env.DATA_SERVICE_URL + 'data/nft/symbol';
  const url2 = 'https://api-mainnet.magiceden.io/collections/' + nft_symbol;

  try {
    const response = await axios.post<Collection[]>(url, {
      nft_symbol: nft_symbol,
    });
    const response2 = await axios.get<Collection[]>(url2, {
      headers: {
        accept: 'application/json',
      },
    });

    let data: any = response.data;
    let data2: any = response2.data;

    let name = nft_name;
    let price: number = data['floor_price'];
    let image = data2["image"]
    let listed = data['listed_count'];
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
