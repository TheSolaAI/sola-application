import axios from 'axios';
import { Collection } from '../../types/magicEden';

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
      return (
        currentDate <= launchDate
      );
    });

    console.log('Fetched Future Collections:', futureCollections);
    return futureCollections;
  } catch (error) {
    console.error('Error fetching Magic Eden collections:', error);
    throw error;
  }
};
