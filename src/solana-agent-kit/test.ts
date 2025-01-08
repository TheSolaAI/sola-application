import { SolanaAgentKit,} from "solana-agent-kit";

const agent = new SolanaAgentKit(
    "priv",
    "https://api.mainnet-beta.solana.com",
    {
        OPENAI_API_KEY:""
    }
)




//pyth-price-feed
//todo!() add a crypto.token/sol list

export const getPythPrice = async (symbol: string)=>
{
    const priceFeedID = await agent.getPythPriceFeedID(symbol);
    const price = await agent.getPythPrice(priceFeedID);
    return price;
}

export const getTokenReport = async (mintAddress: string) => {
    let initial_report = await agent.fetchTokenReportSummary(mintAddress);
    let json_data = JSON.parse(JSON.stringify(initial_report));
    let top_holders: [] = json_data.top_holders;
    let top_holders_array:any = [];
    top_holders.forEach((holder: any)=> {
        let amount = holder.uiAmount;
        let owner = holder.owner;
        let insider = holder.insider
        top_holders_array.push({
            address: owner,
            amount: amount,
            insider: insider
        })
    })
    return top_holders_array;
}


export const getJupiterToken = async (tokenAddress: string) => {
    const tokenData = await agent.getTokenDataByAddress(tokenAddress);
    let address = tokenData?.address;
    let name = tokenData?.name;
    let symbol = tokenData?.symbol;
    let logoURI = tokenData?.logoURI;
    let priceInfo = await getDexDetails(tokenAddress);
    if (!priceInfo) {
        return console.error('Price data not found');
    }
    let price = priceInfo.price;
    let marketCap = priceInfo.marketcap;

    return {
        address: address,
        name: name,
        symbol: symbol,
        logoURI: logoURI,
        price: price,
        marketCap: marketCap,
    }
};

export const getJupiterTokenSymbol = async (ticker: string) => {
    const tokenData = await agent.getTokenDataByTicker(ticker);
    if (!tokenData) {
    return console.error('Token data not found');
    }
    let address = tokenData?.address;
    let name = tokenData?.name;
    let symbol = tokenData?.symbol;
    let logoURI = tokenData?.logoURI;

    let priceInfo = await getDexDetails(address);
    if (!priceInfo) {
        return console.error('Price data not found');
    }
    let price = priceInfo.price;
    let marketCap = priceInfo.marketcap;

    return {
        address: address,
        name: name,
        symbol: symbol,
        logoURI: logoURI,
        price: price,
        marketCap: marketCap,
    }
};

const getDexDetails = async (tokenAddress: string) => {
    let dexApi = `https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`

    const response = await fetch(
        dexApi,
    );
    let result = await response.json();

    if (!result.pairs || result.pairs.length === 0) {
        return null;
    }
  
    let solanaPairs = result.pairs
        .filter((pair: any) => pair.chainId === "solana")
        .sort((a: any, b: any) => (b.fdv || 0) - (a.fdv || 0));

    let coin = solanaPairs[0]
    let price = coin.priceUsd;
    let marketcap = coin.marketCap;
    return {
        price: price,
        marketcap: marketcap,
    };
    
}