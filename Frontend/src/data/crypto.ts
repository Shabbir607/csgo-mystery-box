import { CryptoCurrency } from '../types';

export const supportedCryptos: CryptoCurrency[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    minDeposit: 0.0001,
    minWithdraw: 0.001,
    withdrawFee: 0.0005,
    confirmations: 3,
    rate: 43250.00 // Will be updated with real-time data
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    minDeposit: 0.001,
    minWithdraw: 0.01,
    withdrawFee: 0.005,
    confirmations: 12,
    rate: 2650.00
  },
  {
    id: 'litecoin',
    name: 'Litecoin',
    symbol: 'LTC',
    icon: 'Ł',
    minDeposit: 0.01,
    minWithdraw: 0.1,
    withdrawFee: 0.01,
    confirmations: 6,
    rate: 72.50
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    minDeposit: 0.1,
    minWithdraw: 1,
    withdrawFee: 0.01,
    confirmations: 1,
    rate: 98.75
  },
  {
    id: 'monero',
    name: 'Monero',
    symbol: 'XMR',
    icon: 'ɱ',
    minDeposit: 0.01,
    minWithdraw: 0.1,
    withdrawFee: 0.005,
    confirmations: 10,
    rate: 165.30
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    network: 'ERC-20',
    icon: '₮',
    minDeposit: 1,
    minWithdraw: 10,
    withdrawFee: 5,
    confirmations: 12,
    rate: 1.00
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    network: 'ERC-20',
    icon: '$',
    minDeposit: 1,
    minWithdraw: 10,
    withdrawFee: 5,
    confirmations: 12,
    rate: 1.00
  },
  {
    id: 'dai',
    name: 'Dai',
    symbol: 'DAI',
    network: 'ERC-20',
    icon: '◈',
    minDeposit: 1,
    minWithdraw: 10,
    withdrawFee: 5,
    confirmations: 12,
    rate: 1.00
  },
  {
    id: 'tron',
    name: 'Tron',
    symbol: 'TRX',
    icon: '⚡',
    minDeposit: 10,
    minWithdraw: 100,
    withdrawFee: 1,
    confirmations: 20,
    rate: 0.105
  }
];

// Generate unique deposit addresses for each cryptocurrency
export const generateDepositAddress = (cryptoId: string): string => {
  const addresses = {
    bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ethereum: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
    litecoin: 'LTC1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    solana: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    monero: '4AdUndXHHZ6cfufTMvppY6JwXNouMBzSkbLYfpAV5Usx3skxNgYeYTRJ5CA1qdGqVZ',
    usdt: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
    usdc: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
    dai: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
    tron: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH'
  };
  
  return addresses[cryptoId] || addresses.bitcoin;
};

// Validate cryptocurrency addresses
export const validateAddress = (address: string, cryptoId: string): boolean => {
  const patterns = {
    bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
    ethereum: /^0x[a-fA-F0-9]{40}$/,
    litecoin: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
    solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    monero: /^4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/,
    usdt: /^0x[a-fA-F0-9]{40}$/,
    usdc: /^0x[a-fA-F0-9]{40}$/,
    dai: /^0x[a-fA-F0-9]{40}$/,
    tron: /^T[A-Za-z1-9]{33}$/
  };
  
  return patterns[cryptoId]?.test(address) || false;
};