export type TokenData = {
    image:string
    metadata: {
        description: string;
        name: string;
        symbol: string;
        token_standard: string;
    },
    price:number,
    marketcap: number,
    volume: number;
    price_change_24h: number;
}

