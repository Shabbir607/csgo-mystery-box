// Random.org API service for true random number generation
export interface RandomOrgResponse {
  jsonrpc: string;
  result: {
    random: {
      data: number[];
      completionTime: string;
    };
    bitsUsed: number;
    bitsLeft: number;
    requestsLeft: number;
    advisoryDelay: number;
  };
  id: number;
}

export interface RandomOrgError {
  code: number;
  message: string;
  data?: any;
}

export interface GameSeed {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  timestamp: number;
  gameId: string;
}

export interface GameResult {
  gameId: string;
  seeds: GameSeed;
  randomOrgResponse: RandomOrgResponse;
  finalHash: string;
  outcome: number;
  verificationData: {
    serverSeedHash: string;
    combinedHash: string;
    randomOrgSignature?: string;
  };
}

class RandomOrgApiService {
  private apiKey = import.meta.env.VITE_RANDOM_ORG_API_KEY || 'demo-key';
  private baseUrl = 'https://api.random.org/json-rpc/4/invoke';
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minDelay = 1000; // 1 second minimum delay between requests
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  // Rate limiting implementation
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minDelay) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
      }
      
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Random.org request failed:', error);
        }
        this.lastRequestTime = Date.now();
      }
    }
    
    this.isProcessing = false;
  }

  // Generate server seed using Random.org
  async generateServerSeed(): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = async () => {
        try {
          const response = await this.makeRandomOrgRequest({
            jsonrpc: '2.0',
            method: 'generateStrings',
            params: {
              apiKey: this.apiKey,
              n: 1,
              length: 64,
              characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
              replacement: true
            },
            id: Date.now()
          });
          
          if (response.result && response.result.random) {
            resolve(response.result.random.data[0]);
          } else {
            throw new Error('Invalid response from Random.org');
          }
        } catch (error) {
          // Fallback to crypto.getRandomValues if Random.org fails
          const fallbackSeed = this.generateFallbackSeed();
          console.warn('Random.org failed, using fallback seed:', error);
          resolve(fallbackSeed);
        }
      };
      
      this.requestQueue.push(request);
      this.processQueue();
    });
  }

  // Generate random numbers for game outcome
  async generateGameNumbers(min: number, max: number, count: number = 1): Promise<RandomOrgResponse> {
    return new Promise((resolve, reject) => {
      const request = async () => {
        try {
          const response = await this.makeRandomOrgRequest({
            jsonrpc: '2.0',
            method: 'generateIntegers',
            params: {
              apiKey: this.apiKey,
              n: count,
              min: min,
              max: max,
              replacement: true,
              base: 10
            },
            id: Date.now()
          });
          
          if (response.result) {
            resolve(response);
          } else {
            throw new Error('Invalid response from Random.org');
          }
        } catch (error) {
          // Fallback to Math.random if Random.org fails
          const fallbackResponse = this.generateFallbackNumbers(min, max, count);
          console.warn('Random.org failed, using fallback numbers:', error);
          resolve(fallbackResponse);
        }
      };
      
      this.requestQueue.push(request);
      this.processQueue();
    });
  }

  // Make HTTP request to Random.org API
  private async makeRandomOrgRequest(payload: any): Promise<RandomOrgResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Random.org API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Random.org error: ${data.error.message}`);
    }

    return data;
  }

  // Fallback seed generation using Web Crypto API
  private generateFallbackSeed(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Fallback number generation
  private generateFallbackNumbers(min: number, max: number, count: number): RandomOrgResponse {
    const numbers = [];
    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    return {
      jsonrpc: '2.0',
      result: {
        random: {
          data: numbers,
          completionTime: new Date().toISOString()
        },
        bitsUsed: count * Math.ceil(Math.log2(max - min + 1)),
        bitsLeft: 1000000, // Fallback value
        requestsLeft: 1000, // Fallback value
        advisoryDelay: 1000
      },
      id: Date.now()
    };
  }

  // Check API quota and status
  async checkQuota(): Promise<{ bitsLeft: number; requestsLeft: number }> {
    try {
      const response = await this.makeRandomOrgRequest({
        jsonrpc: '2.0',
        method: 'getUsage',
        params: {
          apiKey: this.apiKey
        },
        id: Date.now()
      });

      return {
        bitsLeft: response.result.bitsLeft || 0,
        requestsLeft: response.result.requestsLeft || 0
      };
    } catch (error) {
      console.error('Failed to check Random.org quota:', error);
      return { bitsLeft: 0, requestsLeft: 0 };
    }
  }
}

export const randomOrgService = new RandomOrgApiService();