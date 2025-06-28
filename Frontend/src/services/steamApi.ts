// Steam API service for authentication and trade management
export interface SteamUser {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
}

export interface TradeOffer {
  tradeofferid: string;
  accountid_other: number;
  message: string;
  expiration_time: number;
  trade_offer_state: number;
  items_to_give?: TradeItem[];
  items_to_receive?: TradeItem[];
  is_our_offer: boolean;
  time_created: number;
  time_updated: number;
}

export interface TradeItem {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  missing: boolean;
}

class SteamApiService {
  private baseUrl = 'https://api.steampowered.com';
  private apiKey = import.meta.env.VITE_STEAM_API_KEY || 'demo_key'; // Use Vite environment variable

  // Generate Steam OAuth URL for authentication
  generateSteamAuthUrl(returnUrl: string): string {
    const steamOpenIdUrl = 'https://steamcommunity.com/openid/login';
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnUrl,
      'openid.realm': window.location.origin,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });
    
    return `${steamOpenIdUrl}?${params.toString()}`;
  }

  // Extract Steam ID from OpenID response
  extractSteamId(openIdResponse: string): string | null {
    const match = openIdResponse.match(/\/id\/(\d+)/);
    return match ? match[1] : null;
  }

  // Get Steam user information
  async getSteamUser(steamId: string): Promise<SteamUser | null> {
    try {
      // In a real implementation, this would be a server-side call
      // For demo purposes, we'll simulate the response
      return this.getMockSteamUser(steamId);
    } catch (error) {
      console.error('Error fetching Steam user:', error);
      return null;
    }
  }

  // Validate Steam trade URL
  validateTradeUrl(tradeUrl: string): boolean {
    const tradeUrlPattern = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[a-zA-Z0-9_-]+$/;
    return tradeUrlPattern.test(tradeUrl);
  }

  // Extract partner ID and token from trade URL
  parseTradeUrl(tradeUrl: string): { partnerId: string; token: string } | null {
    const match = tradeUrl.match(/partner=(\d+)&token=([a-zA-Z0-9_-]+)/);
    if (match) {
      return {
        partnerId: match[1],
        token: match[2]
      };
    }
    return null;
  }

  // Send trade offer (server-side operation)
  async sendTradeOffer(
    partnerId: string,
    token: string,
    items: any[],
    message: string
  ): Promise<{ success: boolean; tradeOfferId?: string; error?: string }> {
    try {
      // In production, this would be a server-side API call
      // For demo purposes, we'll simulate the response
      const tradeOfferId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        tradeOfferId
      };
    } catch (error) {
      console.error('Error sending trade offer:', error);
      return {
        success: false,
        error: 'Failed to send trade offer'
      };
    }
  }

  // Get trade offer status
  async getTradeOfferStatus(tradeOfferId: string): Promise<{
    status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
    message?: string;
  }> {
    try {
      // In production, this would query the Steam API
      // For demo purposes, we'll simulate different statuses
      const statuses = ['pending', 'accepted', 'declined'] as const;
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        status: randomStatus,
        message: `Trade offer ${tradeOfferId} is ${randomStatus}`
      };
    } catch (error) {
      console.error('Error getting trade offer status:', error);
      return {
        status: 'pending',
        message: 'Unable to check status'
      };
    }
  }

  // Mock Steam user data for demo
  private getMockSteamUser(steamId: string): SteamUser {
    const mockUsers = [
      {
        steamid: steamId,
        personaname: 'CleanCase_User',
        profileurl: `https://steamcommunity.com/profiles/${steamId}`,
        avatar: 'https://avatars.steamstatic.com/b5bd56c1aa4644a474a2e4972be27ef9e82e517e.jpg',
        avatarmedium: 'https://avatars.steamstatic.com/b5bd56c1aa4644a474a2e4972be27ef9e82e517e_medium.jpg',
        avatarfull: 'https://avatars.steamstatic.com/b5bd56c1aa4644a474a2e4972be27ef9e82e517e_full.jpg'
      }
    ];
    
    return mockUsers[0];
  }

  // Check if Steam is available
  async checkSteamAvailability(): Promise<boolean> {
    try {
      // In production, this would check Steam API availability
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get estimated delivery time for items
  getEstimatedDeliveryTime(): Date {
    // Steam trades typically take 1-15 minutes
    const deliveryTime = new Date();
    deliveryTime.setMinutes(deliveryTime.getMinutes() + Math.floor(Math.random() * 14) + 1);
    return deliveryTime;
  }
}

export const steamApiService = new SteamApiService();