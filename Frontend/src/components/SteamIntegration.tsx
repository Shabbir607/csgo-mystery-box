import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Shield, Clock, CheckCircle, XCircle, AlertTriangle, Stamp as Steam, Link, Unlink, Copy, RefreshCw, Package, Send, Star } from 'lucide-react';
import { User, SteamAccount, SteamWithdrawal, CSGOItem } from '../types';
import { steamApiService } from '../services/steamApi';

interface SteamIntegrationProps {
  onBack: () => void;
  user: User;
  onUpdateUser: (user: User) => void;
}

export default function SteamIntegration({ onBack, user, onUpdateUser }: SteamIntegrationProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'withdraw' | 'history'>('link');
  const [isLinking, setIsLinking] = useState(false);
  const [tradeUrl, setTradeUrl] = useState('');
  const [tradeUrlError, setTradeUrlError] = useState('');
  const [selectedItems, setSelectedItems] = useState<CSGOItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<SteamWithdrawal[]>([]);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Mock withdrawal history
  useEffect(() => {
    const mockWithdrawals: SteamWithdrawal[] = [
      {
        id: 'sw1',
        userId: user.username,
        items: user.inventory.slice(0, 2),
        totalValue: user.inventory.slice(0, 2).reduce((sum, item) => sum + item.price, 0),
        status: 'completed',
        steamTradeOfferId: 'demo_123456789',
        createdAt: new Date(Date.now() - 86400000),
        completedAt: new Date(Date.now() - 86000000),
        estimatedDelivery: new Date(Date.now() - 86000000)
      },
      {
        id: 'sw2',
        userId: user.username,
        items: user.inventory.slice(2, 3),
        totalValue: user.inventory.slice(2, 3).reduce((sum, item) => sum + item.price, 0),
        status: 'processing',
        steamTradeOfferId: 'demo_987654321',
        createdAt: new Date(Date.now() - 3600000),
        estimatedDelivery: new Date(Date.now() + 900000)
      }
    ];
    setWithdrawals(mockWithdrawals);
  }, [user.inventory, user.username]);

  // const handleSteamLogin = async () => {
  //   setIsLinking(true);
  //   try {
  //     // In production, this would redirect to Steam OAuth
  //     // For demo purposes, we'll simulate the linking process
  //     await new Promise(resolve => setTimeout(resolve, 2000));
      
  //     const mockSteamAccount: SteamAccount = {
  //       steamId: '76561198000000000',
  //       steamUsername: 'CleanCase_User',
  //       profileUrl: 'https://steamcommunity.com/profiles/76561198000000000',
  //       avatarUrl: 'https://avatars.steamstatic.com/b5bd56c1aa4644a474a2e4972be27ef9e82e517e.jpg',
  //       isLinked: true,
  //       linkedDate: new Date(),
  //       isTradeUrlValid: false,
  //       lastSync: new Date()
  //     };

  //     const updatedUser = { ...user, steamAccount: mockSteamAccount };
  //     onUpdateUser(updatedUser);
  //   } catch (error) {
  //     console.error('Steam linking failed:', error);
  //   } finally {
  //     setIsLinking(false);
  //   }
  // };
const handleSteamLogin = () => {
  setIsLinking(true);

  const width = 600;
  const height = 700;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  const steamWindow = window.open(
    'http://localhost:8000/api/steam/redirect',
    'SteamLogin',
    `width=${width},height=${height},top=${top},left=${left}`
  );

  const handleMessage = (event: MessageEvent) => {
    // Validate source origin (important for security!)
    if (event.origin !== 'http://localhost:8000') {
      return;
    }

    const { token, steamAccount } = event.data;

    if (token && steamAccount) {
      // Store token (you can use sessionStorage or localStorage)
      sessionStorage.setItem('auth_token', token);

      // Update user with linked Steam account
      const updatedUser = { ...user, steamAccount };
      onUpdateUser(updatedUser);
    }

    setIsLinking(false);
    window.removeEventListener('message', handleMessage);
    steamWindow?.close();
  };

  // Listen for messages from the popup
  window.addEventListener('message', handleMessage);
};

  const handleUnlinkSteam = () => {
    const updatedUser = { ...user, steamAccount: undefined };
    onUpdateUser(updatedUser);
  };

  const handleTradeUrlSubmit = () => {
    if (!steamApiService.validateTradeUrl(tradeUrl)) {
      setTradeUrlError('Invalid trade URL format');
      return;
    }

    if (user.steamAccount) {
      const updatedSteamAccount = {
        ...user.steamAccount,
        tradeUrl,
        isTradeUrlValid: true,
        lastSync: new Date()
      };
      const updatedUser = { ...user, steamAccount: updatedSteamAccount };
      onUpdateUser(updatedUser);
      setTradeUrlError('');
    }
  };

  const handleItemSelection = (item: CSGOItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleWithdrawItems = async () => {
    if (!user.steamAccount?.tradeUrl || selectedItems.length === 0) return;

    setIsProcessingWithdrawal(true);
    try {
      const tradeUrlData = steamApiService.parseTradeUrl(user.steamAccount.tradeUrl);
      if (!tradeUrlData) {
        throw new Error('Invalid trade URL');
      }

      const result = await steamApiService.sendTradeOffer(
        tradeUrlData.partnerId,
        tradeUrlData.token,
        selectedItems,
        `CleanCase withdrawal - ${selectedItems.length} items`
      );

      if (result.success && result.tradeOfferId) {
        const newWithdrawal: SteamWithdrawal = {
          id: `sw_${Date.now()}`,
          userId: user.username,
          items: [...selectedItems],
          totalValue: selectedItems.reduce((sum, item) => sum + item.price, 0),
          status: 'pending',
          steamTradeOfferId: result.tradeOfferId,
          createdAt: new Date(),
          estimatedDelivery: steamApiService.getEstimatedDeliveryTime()
        };

        setWithdrawals(prev => [newWithdrawal, ...prev]);
        
        // Remove items from user inventory
        const updatedUser = {
          ...user,
          inventory: user.inventory.filter(item => 
            !selectedItems.some(selected => selected.id === item.id)
          )
        };
        onUpdateUser(updatedUser);
        
        setSelectedItems([]);
        setShowWithdrawModal(false);
        setActiveTab('history');
      } else {
        throw new Error(result.error || 'Failed to create trade offer');
      }
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const getStatusIcon = (status: SteamWithdrawal['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing': case 'sent': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'pending': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'failed': case 'cancelled': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: SteamWithdrawal['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': case 'sent': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const totalSelectedValue = selectedItems.reduce((sum, item) => sum + item.price, 0);

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
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Steam className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Steam Integration
            </h1>
          </div>
          <p className="text-sm text-blue-400 font-medium tracking-wide">Withdraw Items to Steam</p>
        </div>
        
        <div className="w-32" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2 p-2 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          {[
            { key: 'link', name: 'Steam Account', icon: Link },
            { key: 'withdraw', name: 'Withdraw Items', icon: Send },
            { key: 'history', name: 'Withdrawal History', icon: Clock }
          ].map(({ key, name, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-2 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-2xl shadow-blue-500/30 transform scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Steam Account Linking */}
      {activeTab === 'link' && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          {!user.steamAccount?.isLinked ? (
            <div className="text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Steam className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Link Your Steam Account</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Connect your Steam account to withdraw items directly to your Steam inventory
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>Secure OAuth</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Instant Withdrawals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-orange-400" />
                    <span>Direct to Inventory</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSteamLogin}
                disabled={isLinking}
                className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-3 mx-auto ${
                  isLinking
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105'
                }`}
              >
                {isLinking ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Steam className="w-5 h-5" />
                )}
                <span>{isLinking ? 'Connecting...' : 'Connect with Steam'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Steam Account Info */}
              <div className="flex items-center space-x-6 p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30">
                <img
                  src={user.steamAccount.avatarUrl}
                  alt="Steam Avatar"
                  className="w-16 h-16 rounded-full border-2 border-green-400"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-xl font-bold text-white">{user.steamAccount.steamUsername}</h4>
                    <div className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
                      LINKED
                    </div>
                  </div>
                  <p className="text-green-300 text-sm">Steam ID: {user.steamAccount.steamId}</p>
                  <p className="text-green-300 text-sm">Linked: {user.steamAccount.linkedDate.toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-3">
                  <a
                    href={user.steamAccount.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={handleUnlinkSteam}
                    className="p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors duration-300"
                  >
                    <Unlink className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Trade URL Setup */}
              <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Link className="w-5 h-5 text-blue-400" />
                  <span>Steam Trade URL</span>
                  {user.steamAccount.isTradeUrlValid && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </h4>
                
                <p className="text-gray-400 text-sm mb-4">
                  Your trade URL is required to send items to your Steam inventory. 
                  <a 
                    href="https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 ml-1"
                  >
                    Get your trade URL here
                  </a>
                </p>

                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={tradeUrl || user.steamAccount.tradeUrl || ''}
                    onChange={(e) => setTradeUrl(e.target.value)}
                    placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                    className={`flex-1 bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none ${
                      tradeUrlError ? 'border-red-400/50' : 'border-white/20 focus:border-blue-400/50'
                    }`}
                  />
                  <button
                    onClick={handleTradeUrlSubmit}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Save
                  </button>
                </div>
                
                {tradeUrlError && (
                  <p className="text-red-400 text-sm mt-2">{tradeUrlError}</p>
                )}
                
                {user.steamAccount.isTradeUrlValid && (
                  <div className="mt-4 p-3 rounded-lg bg-green-500/20 border border-green-400/30">
                    <p className="text-green-400 text-sm flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Trade URL is valid and ready for withdrawals</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Item Withdrawal */}
      {activeTab === 'withdraw' && (
        <div className="space-y-8">
          {!user.steamAccount?.isLinked ? (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl text-center">
              <Steam className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Steam Account Required</h3>
              <p className="text-gray-400 mb-6">Link your Steam account to withdraw items</p>
              <button
                onClick={() => setActiveTab('link')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                Link Steam Account
              </button>
            </div>
          ) : !user.steamAccount.isTradeUrlValid ? (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Trade URL Required</h3>
              <p className="text-gray-400 mb-6">Set up your Steam trade URL to withdraw items</p>
              <button
                onClick={() => setActiveTab('link')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
              >
                Setup Trade URL
              </button>
            </div>
          ) : user.inventory.length === 0 ? (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Items to Withdraw</h3>
              <p className="text-gray-400">Open some cases to get items for withdrawal</p>
            </div>
          ) : (
            <>
              {/* Selection Summary */}
              {selectedItems.length > 0 && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold">Selected Items</h4>
                      <p className="text-blue-300 text-sm">
                        {selectedItems.length} items • ${totalSelectedValue.toFixed(2)} total value
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedItems([])}
                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm transition-colors duration-300"
                      >
                        Clear Selection
                      </button>
                      <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
                      >
                        Withdraw Selected
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Grid */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Package className="w-6 h-6 text-blue-400" />
                  <span>Your Inventory</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {user.inventory.map((item, index) => {
                    const isSelected = selectedItems.some(selected => selected.id === item.id);
                    return (
                      <div
                        key={`${item.id}-${index}`}
                        onClick={() => handleItemSelection(item)}
                        className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/30 border-2 border-blue-400 transform scale-105'
                            : 'bg-white/10 border border-white/20 hover:bg-white/20 hover:border-blue-400/50'
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-20 object-contain mb-3"
                        />
                        <h4 className="text-white font-semibold text-sm mb-1 truncate">{item.name}</h4>
                        <p className="text-blue-400 font-bold text-sm">${item.price.toFixed(2)}</p>
                        
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Withdrawal History */}
      {activeTab === 'history' && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <span>Withdrawal History</span>
          </h3>

          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">No Withdrawals Yet</h4>
              <p className="text-gray-400">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(withdrawal.status)}
                      <div>
                        <h4 className="text-white font-semibold">
                          {withdrawal.items.length} Items • ${withdrawal.totalValue.toFixed(2)}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {withdrawal.createdAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold capitalize ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                      {withdrawal.status === 'processing' && (
                        <p className="text-gray-400 text-sm">
                          ETA: {withdrawal.estimatedDelivery.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
                    {withdrawal.items.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg bg-white/10 text-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-12 object-contain mb-2"
                        />
                        <p className="text-white text-xs truncate">{item.name}</p>
                        <p className="text-blue-400 text-xs font-bold">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {withdrawal.steamTradeOfferId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Trade Offer ID:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono">{withdrawal.steamTradeOfferId}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(withdrawal.steamTradeOfferId!)}
                          className="p-1 rounded hover:bg-white/10 transition-colors duration-300"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdrawal Confirmation Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Confirm Withdrawal</h3>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-2xl bg-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Items:</span>
                    <span className="text-white font-bold">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Value:</span>
                    <span className="text-green-400 font-bold text-xl">${totalSelectedValue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-400/30">
                  <p className="text-blue-300 text-sm">
                    Items will be sent to your Steam account via trade offer. 
                    You'll need to accept the trade offer in Steam to receive your items.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdrawItems}
                  disabled={isProcessingWithdrawal}
                  className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    isProcessingWithdrawal
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {isProcessingWithdrawal ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <p className="text-xs text-gray-400">Steam Integration • Instant Withdrawals • Secure Trading</p>
      </div>
    </div>
  );
}