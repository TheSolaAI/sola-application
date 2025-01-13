export type TokenData = {
    image:string
    metadata: {
        description: string;
        name: string;
        symbol: string;
        token_standard: string;
    },
    price:number,
    marketcap:number
}

export type LSTData = {
    logo_uri: string,
    symbol: string,
    url: string,
    apy: number,
    address:string
}

export type RugCheck = {
    score: number;
    issues:[]
}


