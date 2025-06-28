// Cryptocurrency API service for real-time prices
export interface CryptoPriceData {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

class CryptoApiService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache: Map<string, { data: CryptoPriceData[], timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute cache

  private coinGeckoIds = {
    bitcoin: 'bitcoin',
    ethereum: 'ethereum',
    litecoin: 'litecoin',
    solana: 'solana',
    monero: 'monero',
    usdt: 'tether',
    usdc: 'usd-coin',
    dai: 'dai',
    tron: 'tron'
  };

  async fetchPrices(): Promise<CryptoPriceData[]> {
    const cacheKey = 'crypto_prices';
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const coinIds = Object.values(this.coinGeckoIds).join(',');
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }

      const data = await response.json();
      
      const prices: CryptoPriceData[] = Object.entries(this.coinGeckoIds).map(([key, coinId]) => ({
        id: key,
        symbol: key.toUpperCase(),
        current_price: data[coinId]?.usd || 0,
        price_change_percentage_24h: data[coinId]?.usd_24h_change || 0
      }));

      // Cache the results
      this.cache.set(cacheKey, { data: prices, timestamp: Date.now() });
      
      return prices;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      
      // Return fallback prices if API fails
      return this.getFallbackPrices();
    }
  }

  private getFallbackPrices(): CryptoPriceData[] {
    return [
      { id: 'bitcoin', symbol: 'BTC', current_price: 43250.00, price_change_percentage_24h: 2.5 },
      { id: 'ethereum', symbol: 'ETH', current_price: 2650.00, price_change_percentage_24h: 1.8 },
      { id: 'litecoin', symbol: 'LTC', current_price: 72.50, price_change_percentage_24h: -0.5 },
      { id: 'solana', symbol: 'SOL', current_price: 98.75, price_change_percentage_24h: 3.2 },
      { id: 'monero', symbol: 'XMR', current_price: 165.30, price_change_percentage_24h: 1.1 },
      { id: 'usdt', symbol: 'USDT', current_price: 1.00, price_change_percentage_24h: 0.0 },
      { id: 'usdc', symbol: 'USDC', current_price: 1.00, price_change_percentage_24h: 0.0 },
      { id: 'dai', symbol: 'DAI', current_price: 1.00, price_change_percentage_24h: 0.0 },
      { id: 'tron', symbol: 'TRX', current_price: 0.105, price_change_percentage_24h: 0.8 }
    ];
  }

  // Get price for a specific cryptocurrency
  async getPrice(cryptoId: string): Promise<number> {
    const prices = await this.fetchPrices();
    const crypto = prices.find(p => p.id === cryptoId);
    return crypto?.current_price || 0;
  }

  // Get 24h change for a specific cryptocurrency
  async getPriceChange(cryptoId: string): Promise<number> {
    const prices = await this.fetchPrices();
    const crypto = prices.find(p => p.id === cryptoId);
    return crypto?.price_change_percentage_24h || 0;
  }
}

export const cryptoApiService = new CryptoApiService();