import { lst_data } from './lst';
//check types
export const fetchLSTAddress = async (lst_symbol: string) => {
  let lst_data_array = lst_data;
  let address = '';
  lst_data_array.forEach((lst: any) => {
    if (lst.symbol == lst_symbol) {
      address = lst.address;
    }
  });
  return address;
};
