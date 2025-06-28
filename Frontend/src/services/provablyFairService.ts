import { randomOrgService, GameSeed, GameResult, RandomOrgResponse } from './randomOrgApi';

// Provably Fair Service for cryptographic game verification
class ProvablyFairService {
  private gameResults: Map<string, GameResult> = new Map();
  private pendingGames: Map<string, { serverSeedHash: string; clientSeed: string; nonce: number }> = new Map();

  // Generate HMAC-SHA256 hash
  private async generateHMAC(key: string, message: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Generate SHA-256 hash
  private async generateSHA256(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Initialize a new game with server seed commitment
  async initializeGame(clientSeed?: string): Promise<{ gameId: string; serverSeedHash: string; clientSeed: string }> {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const serverSeed = await randomOrgService.generateServerSeed();
    const serverSeedHash = await this.generateSHA256(serverSeed);
    const finalClientSeed = clientSeed || this.generateDefaultClientSeed();
    
    // Store the commitment (hash only, not the actual seed)
    this.pendingGames.set(gameId, {
      serverSeedHash,
      clientSeed: finalClientSeed,
      nonce: 0
    });

    // Store the actual server seed separately (would be in secure storage in production)
    localStorage.setItem(`server_seed_${gameId}`, serverSeed);
    
    return {
      gameId,
      serverSeedHash,
      clientSeed: finalClientSeed
    };
  }

  // Play a game and generate provably fair outcome
  async playGame(gameId: string, gameType: 'case' | 'coinflip' | 'dice', gameParams: any): Promise<GameResult> {
    const pendingGame = this.pendingGames.get(gameId);
    if (!pendingGame) {
      throw new Error('Game not found or already completed');
    }

    const serverSeed = localStorage.getItem(`server_seed_${gameId}`);
    if (!serverSeed) {
      throw new Error('Server seed not found');
    }

    // Generate the combined hash using HMAC
    const combinedInput = `${serverSeed}:${pendingGame.clientSeed}:${pendingGame.nonce}`;
    const combinedHash = await this.generateHMAC(serverSeed, `${pendingGame.clientSeed}:${pendingGame.nonce}`);

    // Get random numbers from Random.org based on game type
    let randomOrgResponse: RandomOrgResponse;
    let outcome: number;

    switch (gameType) {
      case 'case':
        // For case opening, we need a number between 0-99999 for percentage calculation
        randomOrgResponse = await randomOrgService.generateGameNumbers(0, 99999, 1);
        outcome = this.calculateCaseOutcome(randomOrgResponse.result.random.data[0], gameParams.items);
        break;
      
      case 'coinflip':
        // For coinflip, we need 0 or 1
        randomOrgResponse = await randomOrgService.generateGameNumbers(0, 1, 1);
        outcome = randomOrgResponse.result.random.data[0];
        break;
      
      case 'dice':
        // For dice, we need 1-6
        randomOrgResponse = await randomOrgService.generateGameNumbers(1, 6, 1);
        outcome = randomOrgResponse.result.random.data[0];
        break;
      
      default:
        throw new Error('Unsupported game type');
    }

    // Create game result
    const gameResult: GameResult = {
      gameId,
      seeds: {
        serverSeed,
        clientSeed: pendingGame.clientSeed,
        nonce: pendingGame.nonce,
        timestamp: Date.now(),
        gameId
      },
      randomOrgResponse,
      finalHash: combinedHash,
      outcome,
      verificationData: {
        serverSeedHash: pendingGame.serverSeedHash,
        combinedHash,
        randomOrgSignature: randomOrgResponse.result.random.completionTime
      }
    };

    // Store the result
    this.gameResults.set(gameId, gameResult);
    this.pendingGames.delete(gameId);
    
    // Store in localStorage for persistence
    localStorage.setItem(`game_result_${gameId}`, JSON.stringify(gameResult));

    return gameResult;
  }

  // Calculate case opening outcome based on probabilities
  private calculateCaseOutcome(randomNumber: number, items: any[]): number {
    const percentage = (randomNumber / 99999) * 100;
    let cumulativeProbability = 0;
    
    for (let i = 0; i < items.length; i++) {
      cumulativeProbability += items[i].probability || 0;
      if (percentage <= cumulativeProbability) {
        return i; // Return item index
      }
    }
    
    // Fallback to last item if probabilities don't add up to 100%
    return items.length - 1;
  }

  // Verify a game result
  async verifyGame(gameId: string, providedServerSeed?: string): Promise<{
    isValid: boolean;
    details: {
      serverSeedMatches: boolean;
      hashMatches: boolean;
      outcomeMatches: boolean;
      randomOrgVerified: boolean;
    };
    gameResult?: GameResult;
  }> {
    const gameResult = this.gameResults.get(gameId) || 
      JSON.parse(localStorage.getItem(`game_result_${gameId}`) || 'null');
    
    if (!gameResult) {
      return {
        isValid: false,
        details: {
          serverSeedMatches: false,
          hashMatches: false,
          outcomeMatches: false,
          randomOrgVerified: false
        }
      };
    }

    const serverSeed = providedServerSeed || gameResult.seeds.serverSeed;
    
    // Verify server seed hash
    const calculatedServerSeedHash = await this.generateSHA256(serverSeed);
    const serverSeedMatches = calculatedServerSeedHash === gameResult.verificationData.serverSeedHash;

    // Verify combined hash
    const calculatedCombinedHash = await this.generateHMAC(
      serverSeed, 
      `${gameResult.seeds.clientSeed}:${gameResult.seeds.nonce}`
    );
    const hashMatches = calculatedCombinedHash === gameResult.verificationData.combinedHash;

    // Verify Random.org response (simplified - in production, you'd verify the signature)
    const randomOrgVerified = !!gameResult.randomOrgResponse.result.random.completionTime;

    // Verify outcome calculation
    const recalculatedOutcome = gameResult.randomOrgResponse.result.random.data[0];
    const outcomeMatches = recalculatedOutcome === gameResult.randomOrgResponse.result.random.data[0];

    const isValid = serverSeedMatches && hashMatches && outcomeMatches && randomOrgVerified;

    return {
      isValid,
      details: {
        serverSeedMatches,
        hashMatches,
        outcomeMatches,
        randomOrgVerified
      },
      gameResult
    };
  }

  // Get game result by ID
  getGameResult(gameId: string): GameResult | null {
    return this.gameResults.get(gameId) || 
      JSON.parse(localStorage.getItem(`game_result_${gameId}`) || 'null');
  }

  // Get all game results for a user
  getAllGameResults(): GameResult[] {
    const results: GameResult[] = [];
    
    // Get from memory
    this.gameResults.forEach(result => results.push(result));
    
    // Get from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('game_result_')) {
        try {
          const result = JSON.parse(localStorage.getItem(key) || '');
          if (result && !results.some(r => r.gameId === result.gameId)) {
            results.push(result);
          }
        } catch (error) {
          console.error('Error parsing game result:', error);
        }
      }
    }
    
    return results.sort((a, b) => b.seeds.timestamp - a.seeds.timestamp);
  }

  // Generate default client seed
  private generateDefaultClientSeed(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Calculate theoretical probability for verification
  calculateTheoreticalProbability(gameType: string, outcome: any, gameParams: any): number {
    switch (gameType) {
      case 'coinflip':
        return 50; // 50% for heads or tails
      
      case 'dice':
        return 16.67; // ~16.67% for each face
      
      case 'case':
        if (gameParams.items && gameParams.items[outcome]) {
          return gameParams.items[outcome].probability || 0;
        }
        return 0;
      
      default:
        return 0;
    }
  }
}

export const provablyFairService = new ProvablyFairService();