import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Star, Crown, Gem, Zap } from 'lucide-react';

interface Winner {
  id: string;
  username: string;
  item: string;
  value: number;
  timeAgo: string;
  rarity: 'epic' | 'legendary' | 'knife';
  isNew?: boolean;
}

// Realistic usernames that sound authentic
const realisticUsernames = [
  'SkinHunter2024', 'ProGamer_Mike', 'CaseKing_77', 'LuckyShot_99', 'SkinsCollector',
  'CleanCase_VIP', 'RareHunter', 'GoldenEagle', 'ShadowBlade', 'FireStorm_X',
  'IceBreaker', 'ThunderBolt', 'NightRider', 'BlazeFury', 'StormChaser',
  'CrimsonWolf', 'SilverBullet', 'GhostRecon', 'VenomStrike', 'PhoenixRising',
  'DragonSlayer', 'WildCard_88', 'AceOfSpades', 'KingCobra', 'BlackMamba',
  'RedViper', 'BlueFalcon', 'GreenArrow', 'WhiteShark', 'GoldRush_21',
  'DiamondHands', 'PlatinumPlayer', 'EliteGamer', 'MasterChief', 'WarriorKing',
  'BattleAxe', 'SteelTitan', 'IronFist', 'BronzeBeast', 'SilverSurfer',
  'CopperCoin', 'GoldMiner', 'RubyRed', 'EmeraldGreen', 'SapphireBlue',
  'TopazYellow', 'AmethystPurple', 'OnyxBlack', 'PearlWhite', 'CrystalClear'
];

// High-value CSGO items (only legendary, epic, and knife items worth $50+)
const highValueItems = [
  // Knives (Ultra Rare) - All worth $50+
  { name: 'Karambit | Fade', rarity: 'knife' as const, basePrice: 1500, variance: 0.3 },
  { name: 'Butterfly Knife | Crimson Web', rarity: 'knife' as const, basePrice: 2200, variance: 0.4 },
  { name: 'M9 Bayonet | Doppler', rarity: 'knife' as const, basePrice: 800, variance: 0.25 },
  { name: 'Bayonet | Tiger Tooth', rarity: 'knife' as const, basePrice: 650, variance: 0.2 },
  { name: 'Flip Knife | Marble Fade', rarity: 'knife' as const, basePrice: 420, variance: 0.3 },
  { name: 'Gut Knife | Doppler', rarity: 'knife' as const, basePrice: 280, variance: 0.25 },
  { name: 'Huntsman Knife | Fade', rarity: 'knife' as const, basePrice: 380, variance: 0.2 },
  { name: 'Falchion Knife | Crimson Web', rarity: 'knife' as const, basePrice: 320, variance: 0.3 },
  { name: 'Shadow Daggers | Fade', rarity: 'knife' as const, basePrice: 250, variance: 0.25 },
  { name: 'Bowie Knife | Tiger Tooth', rarity: 'knife' as const, basePrice: 480, variance: 0.2 },
  { name: 'Talon Knife | Doppler', rarity: 'knife' as const, basePrice: 750, variance: 0.3 },
  { name: 'Ursus Knife | Fade', rarity: 'knife' as const, basePrice: 420, variance: 0.25 },
  { name: 'Stiletto Knife | Tiger Tooth', rarity: 'knife' as const, basePrice: 680, variance: 0.2 },

  // Legendary (Very Rare) - High-value only
  { name: 'AK-47 | Fire Serpent', rarity: 'legendary' as const, basePrice: 125, variance: 0.4 },
  { name: 'AWP | Dragon Lore', rarity: 'legendary' as const, basePrice: 2500, variance: 0.5 },
  { name: 'M4A4 | Howl', rarity: 'legendary' as const, basePrice: 1800, variance: 0.4 },
  { name: 'SSG 08 | Blood in the Water', rarity: 'legendary' as const, basePrice: 450, variance: 0.3 },
  { name: 'AK-47 | Redline (StatTrak)', rarity: 'legendary' as const, basePrice: 185, variance: 0.3 },
  { name: 'AWP | Asiimov (StatTrak)', rarity: 'legendary' as const, basePrice: 295, variance: 0.25 },
  { name: 'M4A1-S | Cyrex (StatTrak)', rarity: 'legendary' as const, basePrice: 165, variance: 0.3 },
  { name: 'AK-47 | Vulcan (StatTrak)', rarity: 'legendary' as const, basePrice: 385, variance: 0.4 },
  { name: 'AWP | Hyper Beast (StatTrak)', rarity: 'legendary' as const, basePrice: 142, variance: 0.3 },
  { name: 'M4A4 | Desolate Space (StatTrak)', rarity: 'legendary' as const, basePrice: 128, variance: 0.4 },

  // Epic (Rare) - Only high-value epic items worth $50+
  { name: 'AK-47 | Vulcan (Factory New)', rarity: 'epic' as const, basePrice: 185, variance: 0.3 },
  { name: 'AWP | Asiimov (Factory New)', rarity: 'epic' as const, basePrice: 95, variance: 0.25 },
  { name: 'Glock-18 | Fade (Factory New)', rarity: 'epic' as const, basePrice: 285, variance: 0.4 },
  { name: 'Desert Eagle | Blaze (Factory New)', rarity: 'epic' as const, basePrice: 195, variance: 0.3 },
  { name: 'USP-S | Kill Confirmed (Factory New)', rarity: 'epic' as const, basePrice: 132, variance: 0.25 },
  { name: 'M4A1-S | Cyrex (Factory New)', rarity: 'epic' as const, basePrice: 118, variance: 0.3 },
  { name: 'AK-47 | Redline (StatTrak FN)', rarity: 'epic' as const, basePrice: 225, variance: 0.4 },
  { name: 'AWP | Hyper Beast (Factory New)', rarity: 'epic' as const, basePrice: 142, variance: 0.3 },
  { name: 'M4A4 | Desolate Space (Factory New)', rarity: 'epic' as const, basePrice: 128, variance: 0.4 },
  { name: 'P90 | Asiimov (StatTrak FN)', rarity: 'epic' as const, basePrice: 112, variance: 0.3 }
];

// Realistic timing patterns for high-value wins (less frequent)
const getRealisticTimeAgo = () => {
  const patterns = [
    '2 minutes ago', '5 minutes ago', '8 minutes ago', '12 minutes ago', '18 minutes ago',
    '25 minutes ago', '32 minutes ago', '45 minutes ago', '1 hour ago', '1.5 hours ago',
    '2 hours ago', '3 hours ago', '4 hours ago', '6 hours ago', '8 hours ago',
    '12 hours ago', '18 hours ago', '1 day ago'
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
};

// Generate realistic high-value winner
const generateHighValueWinner = (): Winner => {
  // Weighted rarity selection for high-value items (more realistic for top winners)
  const rarityWeights = {
    epic: 60,        // 60% chance (high-value epic items)
    legendary: 35,   // 35% chance (legendary items)
    knife: 5         // 5% chance (knives - very rare)
  };

  let random = Math.random() * 100;
  let selectedRarity: Winner['rarity'] = 'epic';

  for (const [rarity, weight] of Object.entries(rarityWeights)) {
    random -= weight;
    if (random <= 0) {
      selectedRarity = rarity as Winner['rarity'];
      break;
    }
  }

  // Get items of selected rarity
  const itemsOfRarity = highValueItems.filter(item => item.rarity === selectedRarity);
  const selectedItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
  
  // Calculate realistic price with variance (ensure minimum $50)
  const priceVariance = 1 + (Math.random() - 0.5) * selectedItem.variance;
  const finalPrice = Math.max(50, selectedItem.basePrice * priceVariance);

  return {
    id: `winner-${Date.now()}-${Math.random()}`,
    username: realisticUsernames[Math.floor(Math.random() * realisticUsernames.length)],
    item: selectedItem.name,
    value: finalPrice,
    timeAgo: getRealisticTimeAgo(),
    rarity: selectedRarity,
    isNew: true
  };
};

export default function TopWinners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Initialize with some high-value winners
  useEffect(() => {
    const initialWinners: Winner[] = [];
    for (let i = 0; i < 12; i++) {
      const winner = generateHighValueWinner();
      winner.isNew = false; // Don't animate initial winners
      winner.timeAgo = getRealisticTimeAgo();
      initialWinners.push(winner);
    }
    
    // Sort by value (highest first) for top winners display
    initialWinners.sort((a, b) => b.value - a.value);
    setWinners(initialWinners);
  }, []);

  // Add new high-value winners periodically (less frequent for premium items)
  useEffect(() => {
    if (!isLive) return;

    const addNewWinner = () => {
      const newWinner = generateHighValueWinner();
      
      setWinners(prev => {
        const updated = [newWinner, ...prev];
        
        // Remove isNew flag from previous winners
        const withoutNew = updated.map((winner, index) => ({
          ...winner,
          isNew: index === 0 ? true : false
        }));
        
        // Keep only the most recent 15 winners, sorted by value
        return withoutNew.slice(0, 15).sort((a, b) => b.value - a.value);
      });

      // Remove the "new" flag after animation
      setTimeout(() => {
        setWinners(prev => prev.map(winner => 
          winner.id === newWinner.id ? { ...winner, isNew: false } : winner
        ));
      }, 3000);
    };

    // Longer intervals for high-value wins (30-90 seconds)
    const getRandomInterval = () => 30000 + Math.random() * 60000;
    
    const scheduleNext = () => {
      setTimeout(() => {
        addNewWinner();
        scheduleNext();
      }, getRandomInterval());
    };

    scheduleNext();
  }, [isLive]);

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'knife': return 'from-orange-400 via-red-500 to-pink-500';
      case 'legendary': return 'from-yellow-400 via-yellow-500 to-orange-500';
      case 'epic': return 'from-purple-400 via-purple-500 to-pink-500';
      default: return 'from-purple-400 via-purple-500 to-pink-500';
    }
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
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
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
          <span className="text-xs font-medium text-orange-400">
            HIGH VALUE
          </span>
        </div>
      </div>
      
      {/* Winners List */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {winners.map((winner, index) => (
          <div 
            key={winner.id}
            className={`p-4 rounded-2xl transition-all duration-500 ${
              winner.isNew 
                ? 'glass-morphism-orange border border-orange-400/50 animate-bounce-in shadow-lg shadow-orange-500/20' 
                : 'glass-morphism hover:glass-morphism-strong'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getRarityGradient(winner.rarity)} flex items-center justify-center`}>
                  <div className="text-white text-xs">
                    {getRarityIcon(winner.rarity)}
                  </div>
                </div>
                <span className="text-white font-semibold text-sm truncate max-w-24">
                  {winner.username}
                </span>
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
              <span className={`font-bold text-sm ${
                winner.value >= 1000 ? 'text-yellow-400' :
                winner.value >= 500 ? 'text-orange-400' :
                winner.value >= 200 ? 'text-purple-400' :
                'text-green-400'
              }`}>
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
                  {winner.rarity === 'knife' ? 'KNIFE!' : 
                   winner.rarity === 'legendary' ? 'LEGENDARY!' : 'EPIC!'}
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