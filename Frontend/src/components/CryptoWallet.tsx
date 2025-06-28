import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft, Copy, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { supportedCryptos, generateDepositAddress, validateAddress } from '../data/crypto';
import { cryptoApiService } from '../services/cryptoApi';
import { CryptoCurrency, Transaction } from '../types';

interface CryptoWalletProps {
  onBack: () => void;
  userBalance: number;
  onBalanceUpdate: (amount: number) => void;
}

export default function CryptoWallet({ onBack, userBalance, onBalanceUpdate }: CryptoWalletProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>(supportedCryptos[0]);
  const [amount, setAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [depositAddress, setDepositAddress] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<Map<string, { price: number; change: number }>>(new Map());
  const [addressError, setAddressError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx1',
      type: 'deposit',
      currency: 'BTC',
      amount: 0.0023,
      usdAmount: 99.48,
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      txHash: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
      status: 'completed',
      confirmations: 6,
      maxConfirmations: 3,
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 'tx2',
      type: 'withdraw',
      currency: 'ETH',
      amount: 0.0377,
      usdAmount: 100.00,
      address: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      status: 'confirming',
      confirmations: 8,
      maxConfirmations: 12,
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: 'tx3',
      type: 'deposit',
      currency: 'SOL',
      amount: 1.5,
      usdAmount: 148.13,
      address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      status: 'pending',
      confirmations: 0,
      maxConfirmations: 1,
      timestamp: new Date(Date.now() - 900000)
    }
  ]);

  // Load real-time crypto prices
  const loadCryptoPrices = async () => {
    try {
      const prices = await cryptoApiService.fetchPrices();
      const priceMap = new Map();
      
      prices.forEach(price => {
        priceMap.set(price.id, {
          price: price.current_price,
          change: price.price_change_percentage_24h
        });
      });
      
      setCryptoPrices(priceMap);
    } catch (error) {
      console.error('Failed to load crypto prices:', error);
    }
  };

  // Initialize component
  useEffect(() => {
    loadCryptoPrices();
    setDepositAddress(generateDepositAddress(selectedCrypto.id));
    
    // Auto-refresh prices every 1 minute (60 seconds)
    const interval = setInterval(loadCryptoPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update deposit address when crypto changes
  useEffect(() => {
    setDepositAddress(generateDepositAddress(selectedCrypto.id));
    setAmount('');
    setWithdrawAddress('');
    setAddressError('');
  }, [selectedCrypto]);

  // Validate withdrawal address
  useEffect(() => {
    if (withdrawAddress && activeTab === 'withdraw') {
      const isValid = validateAddress(withdrawAddress, selectedCrypto.id);
      setAddressError(isValid ? '' : `Invalid ${selectedCrypto.name} address format`);
    } else {
      setAddressError('');
    }
  }, [withdrawAddress, selectedCrypto, activeTab]);

  // Get current price for selected crypto
  const getCurrentPrice = () => {
    const priceData = cryptoPrices.get(selectedCrypto.id);
    return priceData?.price || selectedCrypto.rate;
  };

  // Get price change for selected crypto
  const getPriceChange = () => {
    const priceData = cryptoPrices.get(selectedCrypto.id);
    return priceData?.change || 0;
  };

  const currentPrice = getCurrentPrice();
  const priceChange = getPriceChange();
  const usdAmount = parseFloat(amount) * currentPrice;
  const isValidAmount = parseFloat(amount) >= (activeTab === 'deposit' ? selectedCrypto.minDeposit : selectedCrypto.minWithdraw);
  const isValidWithdrawAddress = !addressError && withdrawAddress.length > 0;

  const handleDeposit = () => {
    if (!isValidAmount) return;
    
    const newTransaction: Transaction = {
      id: `tx${Date.now()}`,
      type: 'deposit',
      currency: selectedCrypto.symbol,
      amount: parseFloat(amount),
      usdAmount: usdAmount,
      address: depositAddress,
      status: 'pending',
      confirmations: 0,
      maxConfirmations: selectedCrypto.confirmations,
      timestamp: new Date()
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setAmount('');
    setActiveTab('history');
    
    // Simulate deposit confirmation after 5 seconds
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => 
        tx.id === newTransaction.id 
          ? { ...tx, status: 'confirming', confirmations: 1 }
          : tx
      ));
    }, 5000);
    
    // Simulate completion after 15 seconds
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => 
        tx.id === newTransaction.id 
          ? { ...tx, status: 'completed', confirmations: selectedCrypto.confirmations }
          : tx
      ));
      onBalanceUpdate(usdAmount);
    }, 15000);
  };

  const handleWithdraw = () => {
    if (!isValidAmount || !isValidWithdrawAddress || usdAmount > userBalance) return;
    
    const newTransaction: Transaction = {
      id: `tx${Date.now()}`,
      type: 'withdraw',
      currency: selectedCrypto.symbol,
      amount: parseFloat(amount),
      usdAmount: usdAmount,
      address: withdrawAddress,
      status: 'pending',
      confirmations: 0,
      maxConfirmations: selectedCrypto.confirmations,
      timestamp: new Date()
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    onBalanceUpdate(-usdAmount);
    setAmount('');
    setWithdrawAddress('');
    setActiveTab('history');
    
    // Simulate withdrawal processing
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => 
        tx.id === newTransaction.id 
          ? { ...tx, status: 'confirming', confirmations: 1, txHash: `0x${Math.random().toString(16).substr(2, 64)}` }
          : tx
      ));
    }, 3000);
    
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => 
        tx.id === newTransaction.id 
          ? { ...tx, status: 'completed', confirmations: selectedCrypto.confirmations }
          : tx
      ));
    }, 10000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'confirming': return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'confirming': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={onBack}
          className="flex items-center space-x-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-semibold">Back to CleanCase</span>
        </button>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 overflow-hidden p-1.5">
              <img 
                src="/download.webp" 
                alt="CleanCase Logo" 
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
              Crypto Wallet
            </h1>
            <Wallet className="w-6 h-6 text-orange-400" />
          </div>
          <p className="text-sm text-orange-400 font-medium tracking-wide">Secure Cryptocurrency Transactions</p>
        </div>
        
        <div className="w-32" /> {/* Spacer for centering */}
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2 p-2 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          {[
            { key: 'deposit', name: 'Deposit', icon: ArrowDownLeft },
            { key: 'withdraw', name: 'Withdraw', icon: ArrowUpRight },
            { key: 'history', name: 'History', icon: Clock }
          ].map(({ key, name, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-2 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl shadow-orange-500/30 transform scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Copy Success Notification */}
      {copySuccess && (
        <div className="fixed top-24 right-4 z-50 px-4 py-2 rounded-lg bg-green-500 text-white font-semibold animate-fade-in">
          {copySuccess}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cryptocurrency Selection */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-orange-400" />
                <span>Select Cryptocurrency</span>
              </h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div className="text-xs text-gray-400">Live</div>
              </div>
            </div>
            
            <div className="space-y-3">
              {supportedCryptos.map((crypto) => {
                const priceData = cryptoPrices.get(crypto.id);
                const currentPrice = priceData?.price || crypto.rate;
                const priceChange = priceData?.change || 0;
                
                return (
                  <button
                    key={crypto.id}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`w-full p-4 rounded-2xl transition-all duration-300 flex items-center justify-between ${
                      selectedCrypto.id === crypto.id
                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-400/30'
                        : 'bg-white/10 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                        {crypto.icon}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold">{crypto.name}</div>
                        <div className="text-sm text-gray-400">
                          {crypto.symbol} {crypto.network && `(${crypto.network})`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">${formatPrice(currentPrice)}</div>
                      <div className={`text-xs flex items-center space-x-1 ${
                        priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {priceChange >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(priceChange).toFixed(2)}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transaction Form */}
        <div className="lg:col-span-2">
          {activeTab === 'deposit' && (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <ArrowDownLeft className="w-6 h-6 text-green-400" />
                <span>Deposit {selectedCrypto.name}</span>
                <div className="text-sm font-normal text-gray-400">
                  (${formatPrice(currentPrice)})
                </div>
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Amount ({selectedCrypto.symbol})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min: ${selectedCrypto.minDeposit} ${selectedCrypto.symbol}`}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                  />
                  {amount && (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        ≈ ${usdAmount.toFixed(2)} USD
                      </p>
                      {!isValidAmount && (
                        <p className="text-sm text-red-400">
                          Minimum: {selectedCrypto.minDeposit} {selectedCrypto.symbol}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">Deposit Address</h4>
                    <button
                      onClick={() => copyToClipboard(depositAddress)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-300"
                    >
                      <Copy className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 font-mono text-sm text-white break-all">
                    {depositAddress}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setShowQR(!showQR)}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors duration-300"
                      >
                        {showQR ? 'Hide QR' : 'Show QR'}
                      </button>
                      <div className="text-xs text-gray-400">
                        Min confirmations: {selectedCrypto.confirmations}
                      </div>
                    </div>
                    <div className="text-xs text-green-400">
                      Network: {selectedCrypto.network || selectedCrypto.name}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-yellow-500/20 border border-yellow-400/30">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="text-sm text-yellow-200">
                      <p className="font-semibold mb-1">Important Notes:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Only send {selectedCrypto.name} to this address</li>
                        <li>• Minimum deposit: {selectedCrypto.minDeposit} {selectedCrypto.symbol}</li>
                        <li>• Requires {selectedCrypto.confirmations} network confirmations</li>
                        {selectedCrypto.network && <li>• Network: {selectedCrypto.network}</li>}
                        <li>• Deposits are automatically credited after confirmation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDeposit}
                  disabled={!isValidAmount}
                  className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
                    isValidAmount
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isValidAmount ? 'Generate Deposit' : `Minimum ${selectedCrypto.minDeposit} ${selectedCrypto.symbol}`}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <ArrowUpRight className="w-6 h-6 text-red-400" />
                <span>Withdraw {selectedCrypto.name}</span>
                <div className="text-sm font-normal text-gray-400">
                  (${formatPrice(currentPrice)})
                </div>
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Amount ({selectedCrypto.symbol})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min: ${selectedCrypto.minWithdraw} ${selectedCrypto.symbol}`}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                  />
                  {amount && (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        ≈ ${usdAmount.toFixed(2)} USD
                      </p>
                      {!isValidAmount && (
                        <p className="text-sm text-red-400">
                          Minimum: {selectedCrypto.minWithdraw} {selectedCrypto.symbol}
                        </p>
                      )}
                      {usdAmount > userBalance && (
                        <p className="text-sm text-red-400">
                          Insufficient balance
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Withdrawal Address
                  </label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder={`Enter ${selectedCrypto.name} address`}
                    className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none ${
                      addressError ? 'border-red-400/50 focus:border-red-400/50' : 'border-white/20 focus:border-orange-400/50'
                    }`}
                  />
                  {addressError && (
                    <p className="text-sm text-red-400 mt-2">{addressError}</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-white/10">
                  <h4 className="text-white font-semibold mb-3">Transaction Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white">{amount || '0'} {selectedCrypto.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network Fee:</span>
                      <span className="text-white">{selectedCrypto.withdrawFee} {selectedCrypto.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">USD Value:</span>
                      <span className="text-white">${usdAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2">
                      <span className="text-gray-400">You'll Receive:</span>
                      <span className="text-white font-bold">
                        {amount ? Math.max(0, parseFloat(amount) - selectedCrypto.withdrawFee).toFixed(8) : '0'} {selectedCrypto.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/30">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div className="text-sm text-red-200">
                      <p className="font-semibold mb-1">Withdrawal Warning:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Double-check the withdrawal address</li>
                        <li>• Withdrawals cannot be reversed</li>
                        <li>• Minimum withdrawal: {selectedCrypto.minWithdraw} {selectedCrypto.symbol}</li>
                        <li>• Processing time: 10-30 minutes</li>
                        <li>• Network fee: {selectedCrypto.withdrawFee} {selectedCrypto.symbol}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={!isValidAmount || !isValidWithdrawAddress || usdAmount > userBalance}
                  className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
                    isValidAmount && isValidWithdrawAddress && usdAmount <= userBalance
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {usdAmount > userBalance ? 'Insufficient Balance' : 
                   !isValidWithdrawAddress ? 'Invalid Address' :
                   !isValidAmount ? `Minimum ${selectedCrypto.minWithdraw} ${selectedCrypto.symbol}` :
                   'Confirm Withdrawal'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Clock className="w-6 h-6 text-blue-400" />
                <span>Transaction History</span>
              </h3>

              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-6 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(tx.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-semibold capitalize">{tx.type}</span>
                            <span className="text-orange-400 font-bold">{tx.currency}</span>
                            {tx.status === 'confirming' && (
                              <div className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                                {tx.confirmations}/{tx.maxConfirmations}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {tx.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.currency}
                        </div>
                        <div className="text-sm text-gray-400">
                          ${tx.usdAmount.toFixed(2)} USD
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`capitalize font-semibold ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Address:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-xs">
                            {tx.address.slice(0, 8)}...{tx.address.slice(-8)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(tx.address)}
                            className="p-1 rounded hover:bg-white/10 transition-colors duration-300"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      {tx.status !== 'pending' && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Confirmations:</span>
                          <span className="text-white">
                            {tx.confirmations}/{tx.maxConfirmations}
                          </span>
                        </div>
                      )}
                      {tx.txHash && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Transaction:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-mono text-xs">
                              {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(tx.txHash!)}
                              className="p-1 rounded hover:bg-white/10 transition-colors duration-300"
                            >
                              <Copy className="w-3 h-3 text-gray-400" />
                            </button>
                            <button className="p-1 rounded hover:bg-white/10 transition-colors duration-300">
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">No Transactions Yet</h4>
                    <p className="text-gray-400">Your transaction history will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CleanCase Branding Footer */}
      <div className="text-center pt-8 mt-12 border-t border-white/10">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden p-0.5">
            <img 
              src="/download.webp" 
              alt="CleanCase Logo" 
              className="w-full h-full object-contain filter brightness-0 invert"
            />
          </div>
          <span className="text-sm font-bold text-orange-400">CleanCase</span>
          <Star className="w-4 h-4 text-orange-400" />
        </div>
        <p className="text-xs text-gray-400">Secure Crypto Wallet • Real-Time Prices • Instant Transactions</p>
      </div>
    </div>
  );
}