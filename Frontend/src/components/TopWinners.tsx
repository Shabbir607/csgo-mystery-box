import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Star, Crown, Gem, Zap } from 'lucide-react';
import { useToast } from './ToastContext';

interface Winner {
  id: string;
  username: string;
  item: string;
  value: number;
  timeAgo: string;
  rarity: 'epic' | 'legendary' | 'knife';
  rarityColor: string;
  isNew?: boolean;
}

export default function TopWinners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) throw new Error('Missing Auth Token');

      const response = await fetch('https://production.gameonha.com/api/top-winners', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('FetchWinners API Response:', data);

      const formattedWinners: Winner[] = data?.top_winners?.map((winner: any, index: number) => ({
        id: `winner-${index}-${Date.now()}`,
        username: winner.username || 'Anonymous',
        item: winner.weapon || 'Unknown Item',
        value: parseFloat(winner.price?.replace('$', '') || '0'),
        timeAgo: winner.time_ago || 'just now',
        rarity: convertTagToRarity(winner.tag),
        rarityColor: winner.rarity_color || '#ffffff',
        isNew: false
      }));

      setWinners(formattedWinners.slice(0, 15));

    } catch (err: any) {
      showToast(err.message || 'Failed to fetch winners.', "error");
      console.error('fetchWinners error:', err);
    }
  };

  const convertTagToRarity = (tag: string): Winner['rarity'] => {
    const normalized = tag?.toLowerCase();
    if (normalized === 'contraband' || normalized === 'legendary') return 'legendary';
    if (normalized === 'knife') return 'knife';
    return 'epic';
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'knife': return <Crown className="w-3 h-3" />;
      case 'legendary': return <Gem className="w-3 h-3" />;
      case 'epic': return <Trophy className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="p-6 rounded-3xl liquid-glass">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-pulse">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white font-bold text-lg">Top Winners</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-xs font-medium text-orange-400">HIGH VALUE</span>
        </div>
      </div>

      {/* Winners List */}
      <div className="space-y-3 overflow-y-auto pr-2">
        {winners.map((winner, index) => (
          <div
            key={winner.id}
            className={`p-4 rounded-2xl transition-all duration-500 ${winner.isNew
              ? 'glass-morphism-orange border border-orange-400/50 animate-bounce-in shadow-lg shadow-orange-500/20'
              : 'glass-morphism hover:glass-morphism-strong'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: winner.rarityColor }}
                >
                  <div className="text-white text-xs">
                    {getRarityIcon(winner.rarity)}
                  </div>
                </div>
                <span className="text-white font-semibold text-sm truncate max-w-24">{winner.username}</span>
                {winner.isNew && (
                  <div className="px-2 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold animate-pulse">
                    NEW!
                  </div>
                )}
                {index < 3 && (
                  <div className="px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold">
                    TOP {index + 1}
                  </div>
                )}
              </div>
              <span
                className={`font-bold text-sm ${winner.value >= 1000
                  ? 'text-yellow-400'
                  : winner.value >= 500
                    ? 'text-orange-400'
                    : winner.value >= 200
                      ? 'text-purple-400'
                      : 'text-green-400'
                  }`}
              >
                {formatValue(winner.value)}
              </span>
            </div>

            <p className="text-white/80 text-xs mb-1 truncate" title={winner.item}>
              {winner.item}
            </p>

            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-xs">{winner.timeAgo}</p>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-orange-400" />
                <span className="text-orange-400 text-xs font-bold">
                  {winner.rarity === 'knife'
                    ? 'KNIFE!'
                    : winner.rarity === 'legendary'
                      ? 'LEGENDARY!'
                      : 'EPIC!'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-white font-bold text-lg">
              {winners.filter(w => w.value >= 500).length}
            </div>
            <div className="text-gray-400 text-xs">$500+ Wins</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">
              {formatValue(winners.reduce((sum, w) => sum + w.value, 0))}
            </div>
            <div className="text-gray-400 text-xs">Total Won</div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 font-semibold text-sm">Premium Winners</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Powered by <span className="text-orange-400 font-semibold">CleanCase</span>
          </p>
        </div>
      </div>
    </div>
  );
}
