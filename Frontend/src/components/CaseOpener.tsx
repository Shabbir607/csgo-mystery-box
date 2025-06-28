import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CSGOCase, CSGOItem } from '../types';
import ItemCard from './ItemCard';
import TopWinners from './TopWinners';
import ProvablyFairModal from './ProvablyFairModal';
import { RotateCcw, Play, Zap, Sparkles, Star, X, Trophy, Crown, Gem, Users, TrendingUp, Gift, Minus, Plus, Package, Shield } from 'lucide-react';
import { provablyFairService } from '../services/provablyFairService';

interface CaseOpenerProps {
  selectedCase: CSGOCase;
  balance: number;
  onOpenCase: (item: CSGOItem, cost: number) => void;
  onBack: () => void;
}

export default function CaseOpener({ selectedCase, balance, onOpenCase, onBack }: CaseOpenerProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [wonItems, setWonItems] = useState<CSGOItem[]>([]);
  const [bestItem, setBestItem] = useState<CSGOItem | null>(null);
  const [spinItems, setSpinItems] = useState<CSGOItem[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'slowing' | 'stopped'>('idle');
  const [spinOffset, setSpinOffset] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState<'entering' | 'revealing' | 'celebrating'>('entering');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showProvablyFairModal, setShowProvablyFairModal] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const spinContainerRef = useRef<HTMLDivElement>(null);

  // Audio context and sound generation
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Sound generation functions
  const playCardRollingSound = (duration: number = 2000, intensity: number = 1) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    // Create multiple oscillators for rich card rolling sound
    const oscillators: OscillatorNode[] = [];
    const startTime = ctx.currentTime;
    const endTime = startTime + duration / 1000;

    // Main rolling frequency
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      
      // Card flipping frequencies (simulating paper/cardboard)
      osc.frequency.setValueAtTime(200 + i * 50, startTime);
      osc.frequency.exponentialRampToValueAtTime(80 + i * 20, endTime);
      
      // Volume envelope for rolling effect
      oscGain.gain.setValueAtTime(0, startTime);
      oscGain.gain.linearRampToValueAtTime(0.1 * intensity, startTime + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.001, endTime);
      
      osc.type = 'sawtooth';
      osc.start(startTime);
      osc.stop(endTime);
      
      oscillators.push(osc);
    }

    // Add noise for card texture
    const bufferSize = ctx.sampleRate * (duration / 1000);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1 * intensity;
    }
    
    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    
    noiseSource.buffer = noiseBuffer;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gainNode);
    
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, startTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, endTime);
    
    noiseGain.gain.setValueAtTime(0, startTime);
    noiseGain.gain.linearRampToValueAtTime(0.3 * intensity, startTime + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, endTime);
    
    noiseSource.start(startTime);
    noiseSource.stop(endTime);

    // Master volume control
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
  };

  const playCardStopSound = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    // Sharp stop sound (card hitting surface)
    const osc = ctx.createOscillator();
    osc.connect(gainNode);
    
    const startTime = ctx.currentTime;
    const duration = 0.15;
    
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(50, startTime + duration);
    
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.type = 'square';
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const playVictorySound = (rarity: string) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    // Different victory sounds based on rarity
    const rarityConfig = {
      knife: { baseFreq: 800, duration: 1.5, volume: 0.4 },
      legendary: { baseFreq: 600, duration: 1.2, volume: 0.35 },
      epic: { baseFreq: 500, duration: 1.0, volume: 0.3 },
      rare: { baseFreq: 400, duration: 0.8, volume: 0.25 },
      uncommon: { baseFreq: 350, duration: 0.6, volume: 0.2 },
      common: { baseFreq: 300, duration: 0.5, volume: 0.15 }
    };

    const config = rarityConfig[rarity as keyof typeof rarityConfig] || rarityConfig.common;
    const startTime = ctx.currentTime;

    // Ascending chord progression
    [0, 0.2, 0.4, 0.6].forEach((delay, index) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      
      const freq = config.baseFreq * (1 + index * 0.25);
      osc.frequency.setValueAtTime(freq, startTime + delay);
      
      oscGain.gain.setValueAtTime(0, startTime + delay);
      oscGain.gain.linearRampToValueAtTime(config.volume, startTime + delay + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + delay + config.duration);
      
      osc.type = 'sine';
      osc.start(startTime + delay);
      osc.stop(startTime + delay + config.duration);
    });
  };

  // Calculate actual drop rates from the selected case items (admin panel probabilities)
  const calculateActualDropRates = () => {
    if (!selectedCase || !selectedCase.items || selectedCase.items.length === 0) {
      return {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        knife: 0
      };
    }

    // Group items by rarity and sum their probabilities (from admin panel)
    const rarityTotals = selectedCase.items.reduce((acc, item) => {
      const probability = item.probability || 0;
      acc[item.rarity] = (acc[item.rarity] || 0) + probability;
      return acc;
    }, {} as Record<string, number>);

    return {
      common: rarityTotals.common || 0,
      uncommon: rarityTotals.uncommon || 0,
      rare: rarityTotals.rare || 0,
      epic: rarityTotals.epic || 0,
      legendary: rarityTotals.legendary || 0,
      knife: rarityTotals.knife || 0
    };
  };

  // Demo mode weights (significantly better odds - but customer doesn't know)
  const demoRarityWeights = {
    common: 45.0,       // Reduced from actual
    uncommon: 25.0,     // Increased from actual
    rare: 15.0,         // Increased from actual
    epic: 8.0,          // Increased from actual
    legendary: 6.0,     // Increased from actual
    knife: 1.0,         // Increased from actual (400x better!)
  };

  // Quantity pricing with discounts
  const getQuantityPrice = () => {
    const basePrice = selectedCase.price;
    if (quantity >= 10) return basePrice * 0.85; // 15% discount
    if (quantity >= 5) return basePrice * 0.9;   // 10% discount
    return basePrice;
  };

  const getTotalPrice = () => {
    return getQuantityPrice() * quantity;
  };

  const getDiscount = () => {
    if (quantity >= 10) return 15;
    if (quantity >= 5) return 10;
    return 0;
  };

  const getSavings = () => {
    const originalTotal = selectedCase.price * quantity;
    const discountedTotal = getTotalPrice();
    return originalTotal - discountedTotal;
  };

  // Quantity change handlers with proper event handling
  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (isOpening) return; // Prevent changes during opening
    setQuantity(Math.max(1, Math.min(50, newQuantity)));
  }, [isOpening]);

  const handleQuickSelect = useCallback((qty: number) => {
    if (isOpening) return; // Prevent changes during opening
    setQuantity(qty);
  }, [isOpening]);

  useEffect(() => {
    generateSpinItems();
  }, [selectedCase]);

  const generateSpinItems = () => {
    const items: CSGOItem[] = [];
    const totalItems = 100; // More items for smoother animation
    
    for (let i = 0; i < totalItems; i++) {
      const randomItem = getWeightedRandomItem();
      if (randomItem) {
        items.push({ 
          ...randomItem, 
          id: `spin-${Date.now()}-${i}`,
          // Add slight price variation for realism
          price: randomItem.price * (0.8 + Math.random() * 0.4),
          float: randomItem.rarity !== 'knife' ? Math.random() : undefined,
        });
      } else {
        // Fallback placeholder item if no valid item found
        items.push({
          id: `placeholder-${Date.now()}-${i}`,
          name: 'Unknown Item',
          rarity: 'common',
          price: 0.01,
          image: '',
          description: 'Placeholder item'
        });
      }
    }
    
    setSpinItems(items);
  };

  const getWeightedRandomItem = (): CSGOItem | null => {
    // Check if selectedCase or items array is empty
    if (!selectedCase || !selectedCase.items || selectedCase.items.length === 0) {
      return null;
    }

    // Use actual item probabilities or demo weights
    if (isDemoMode) {
      // Use demo weights for better odds
      const weights = demoRarityWeights;
      const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      let random = Math.random() * totalWeight;

      // Group items by rarity for better selection
      const itemsByRarity = selectedCase.items.reduce((acc, item) => {
        if (!acc[item.rarity]) acc[item.rarity] = [];
        acc[item.rarity].push(item);
        return acc;
      }, {} as Record<string, CSGOItem[]>);

      // Select rarity first, then random item from that rarity
      for (const [rarity, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0 && itemsByRarity[rarity]?.length > 0) {
          const rarityItems = itemsByRarity[rarity];
          return rarityItems[Math.floor(Math.random() * rarityItems.length)];
        }
      }
    } else {
      // Use actual item probabilities from admin panel
      const totalProbability = selectedCase.items.reduce((sum, item) => sum + (item.probability || 0), 0);
      
      // If no probabilities are set, fall back to equal distribution
      if (totalProbability === 0) {
        return selectedCase.items[Math.floor(Math.random() * selectedCase.items.length)];
      }
      
      let random = Math.random() * totalProbability;

      for (const item of selectedCase.items) {
        random -= (item.probability || 0);
        if (random <= 0) {
          return item;
        }
      }
    }

    // Fallback to most common item
    return selectedCase.items.find(item => item.rarity === 'common') || selectedCase.items[0] || null;
  };

  const handleOpenCase = useCallback(async (isDemo: boolean = false) => {
    const totalCost = getTotalPrice();
    if (balance < totalCost || isOpening) return;

    setIsDemoMode(isDemo);
    setIsOpening(true);
    setWonItems([]);
    setBestItem(null);
    setShowCelebration(false);
    setAnimationPhase('idle');
    
    // Initialize provably fair game
    try {
      const gameInit = await provablyFairService.initializeGame();
      setCurrentGameId(gameInit.gameId);
      
      // Generate new spin items for this opening
      generateSpinItems();
      
      // For multiple cases, we'll generate multiple items but show the best one in animation
      const winningItems: CSGOItem[] = [];
      
      // Play the provably fair game
      const gameResult = await provablyFairService.playGame(gameInit.gameId, 'case', {
        items: selectedCase.items
      });
      
      // Get the winning item based on the provably fair outcome
      const winningItem = selectedCase.items[gameResult.outcome];
      
      if (winningItem) {
        for (let i = 0; i < quantity; i++) {
          // For multiple cases, use the same winning item or generate additional ones
          const item = i === 0 ? winningItem : getWeightedRandomItem();
          if (item) {
            winningItems.push({
              ...item,
              id: `won-${Date.now()}-${i}`,
              price: item.price * (0.8 + Math.random() * 0.4),
              float: item.rarity !== 'knife' ? Math.random() : undefined,
            });
          }
        }
      }

      if (winningItems.length === 0) {
        setIsOpening(false);
        return;
      }

      // Find the best item to show in the animation
      const bestWinningItem = winningItems.reduce((best, current) => 
        current.price > best.price ? current : best
      );

      setWonItems(winningItems);
      setBestItem(bestWinningItem);

      // Calculate where the winning item should be positioned
      const itemWidth = 160; // Width of each item card + margin
      const containerWidth = spinContainerRef.current?.offsetWidth || 800;
      const centerPosition = containerWidth / 2;
      
      // Place winning item at a specific position in the spin
      const winningIndex = 75; // Position in the spin array
      const newSpinItems = [...spinItems];
      newSpinItems[winningIndex] = bestWinningItem;
      setSpinItems(newSpinItems);

      // Calculate final offset to land on winning item
      const finalOffset = -(winningIndex * itemWidth - centerPosition + itemWidth / 2);
      
      setTimeout(() => {
        setAnimationPhase('spinning');
        setSpinOffset(-3000); // Initial fast spin
        
        // Play initial fast rolling sound
        playCardRollingSound(2000, 1.0);
      }, 100);

      setTimeout(() => {
        setAnimationPhase('slowing');
        setSpinOffset(finalOffset); // Slow down to winning position
        
        // Play slower rolling sound as it decelerates
        playCardRollingSound(2500, 0.7);
      }, 2000);

      setTimeout(() => {
        setAnimationPhase('stopped');
        setShowCelebration(true);
        setCelebrationPhase('entering');
        
        // Play card stop sound
        playCardStopSound();
        
        // Celebration sequence with victory sound
        setTimeout(() => {
          setCelebrationPhase('revealing');
          playVictorySound(bestWinningItem.rarity);
        }, 800);
        
        setTimeout(() => setCelebrationPhase('celebrating'), 1600);
        
        // Add all items to inventory
        winningItems.forEach(item => {
          onOpenCase(item, totalCost / quantity);
        });
        
        setIsOpening(false);
      }, 4500);
      
    } catch (error) {
      console.error('Failed to initialize provably fair game:', error);
      setIsOpening(false);
    }
  }, [balance, getTotalPrice, isOpening, quantity, selectedCase, spinItems, onOpenCase]);

  const resetCase = useCallback(() => {
    setAnimationPhase('idle');
    setWonItems([]);
    setBestItem(null);
    setShowCelebration(false);
    setCelebrationPhase('entering');
    setSpinOffset(0);
    setIsDemoMode(false);
    setCurrentGameId(null);
    generateSpinItems();
  }, []);

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'knife': return <Crown className="w-6 h-6" />;
      case 'legendary': return <Gem className="w-6 h-6" />;
      case 'epic': return <Trophy className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'knife': return 'from-orange-400 via-red-500 to-pink-500';
      case 'legendary': return 'from-yellow-400 via-yellow-500 to-orange-500';
      case 'epic': return 'from-purple-400 via-purple-500 to-pink-500';
      case 'rare': return 'from-blue-400 via-blue-500 to-cyan-500';
      case 'uncommon': return 'from-green-400 via-green-500 to-emerald-500';
      default: return 'from-gray-400 via-gray-500 to-slate-500';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'knife': return 'text-orange-400';
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      case 'uncommon': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  // Get actual drop rates for display (from admin panel probabilities)
  const actualDropRates = calculateActualDropRates();

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Case Opening Area */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={onBack}
              className="flex items-center space-x-3 px-6 py-3 rounded-2xl glass-morphism hover:glass-morphism-strong text-white transition-all duration-300 shadow-xl hover:shadow-2xl group"
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-semibold">Back to Cases</span>
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden p-1 animate-glow-pulse">
                  <img 
                    src="/download.webp" 
                    alt="CleanCase Logo" 
                    className="w-full h-full object-contain filter brightness-0 invert"
                  />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                  {selectedCase.name}
                </h2>
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-sm text-orange-400 font-medium tracking-wide">CleanCase Experience</p>
            </div>
            
            <div className="flex items-center space-x-3 px-6 py-3 rounded-2xl glass-morphism-orange shadow-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden p-1.5">
                <img 
                  src="/download.webp" 
                  alt="CleanCase Logo" 
                  className="w-full h-full object-contain filter brightness-0 invert"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-orange-400 font-medium uppercase tracking-wide">Base Price</span>
                <span className="text-white font-bold text-lg">${selectedCase.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Provably Fair Verification Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowProvablyFairModal(true)}
              className="flex items-center space-x-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30 text-green-400 hover:from-green-500/30 hover:to-green-600/30 hover:border-green-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl group"
            >
              <Shield className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold">Verify if the game is fair</span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </button>
          </div>

          {/* Quantity Selector */}
          <div className="mb-8 p-6 rounded-3xl liquid-glass">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-xl flex items-center space-x-2">
                <Package className="w-6 h-6 text-orange-400" />
                <span>Quantity Selection</span>
              </h3>
              {getDiscount() > 0 && (
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold animate-pulse">
                  🎉 {getDiscount()}% DISCOUNT!
                </div>
              )}
            </div>
            
            {/* Quick Select Buttons */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[1, 2, 3, 5, 10].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => handleQuickSelect(qty)}
                  disabled={isOpening}
                  className={`relative p-4 rounded-2xl font-bold transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${
                    quantity === qty
                      ? 'glass-button text-white shadow-lg shadow-orange-500/30'
                      : 'glass-morphism text-white/70 hover:text-white hover:glass-morphism-strong'
                  } ${isOpening ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
                  style={{ pointerEvents: isOpening ? 'none' : 'auto' }}
                >
                  <div className="text-lg">{qty}x</div>
                  {qty >= 5 && (
                    <div className="text-xs text-green-400 mt-1 font-semibold">
                      {qty === 5 ? '10% OFF' : '15% OFF'}
                    </div>
                  )}
                  {qty >= 5 && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Manual Quantity Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={isOpening || quantity <= 1}
                className={`p-3 rounded-xl glass-morphism hover:glass-morphism-strong text-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${
                  isOpening || quantity <= 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                }`}
                style={{ pointerEvents: (isOpening || quantity <= 1) ? 'none' : 'auto' }}
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="px-6 py-3 rounded-xl glass-morphism text-white font-bold text-xl min-w-20 text-center">
                {quantity}
              </div>
              
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isOpening || quantity >= 50}
                className={`p-3 rounded-xl glass-morphism hover:glass-morphism-strong text-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${
                  isOpening || quantity >= 50 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                }`}
                style={{ pointerEvents: (isOpening || quantity >= 50) ? 'none' : 'auto' }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {/* Price Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl glass-morphism text-center">
                <p className="text-white/70 text-sm mb-1">Unit Price</p>
                <p className="text-white font-bold text-lg">${getQuantityPrice().toFixed(2)}</p>
                {getDiscount() > 0 && (
                  <p className="text-green-400 text-xs">
                    <span className="line-through text-gray-500">${selectedCase.price.toFixed(2)}</span> -{getDiscount()}%
                  </p>
                )}
              </div>
              
              <div className="p-4 rounded-2xl glass-morphism-orange text-center border border-orange-400/30">
                <p className="text-orange-400 text-sm mb-1 font-semibold">Total Cost</p>
                <p className="text-white font-bold text-2xl">${getTotalPrice().toFixed(2)}</p>
                {getSavings() > 0 && (
                  <p className="text-green-400 text-xs font-semibold">
                    Save ${getSavings().toFixed(2)}!
                  </p>
                )}
              </div>
              
              <div className="p-4 rounded-2xl glass-morphism text-center">
                <p className="text-white/70 text-sm mb-1">You'll Get</p>
                <p className="text-green-400 font-bold text-lg">{quantity} Items</p>
                <p className="text-green-300 text-xs">Added to inventory</p>
              </div>
            </div>
          </div>

          {/* Case Opening Animation */}
          <div className="relative mb-10">
            <div 
              ref={spinContainerRef}
              className="h-72 rounded-3xl liquid-glass overflow-hidden relative shadow-2xl animate-liquid-morph"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-600/5" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
              
              {/* CleanCase Branding */}
              <div className="absolute top-4 left-6 flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center overflow-hidden p-0.5">
                  <img 
                    src="/download.webp" 
                    alt="CleanCase Logo" 
                    className="w-full h-full object-contain filter brightness-0 invert opacity-30"
                  />
                </div>
                <span className="text-sm font-bold text-white/30 tracking-widest">CLEANCASE</span>
              </div>
              
              {/* Quantity Indicator */}
              {quantity > 1 && (
                <div className="absolute top-4 right-6 px-3 py-1 rounded-full glass-morphism-orange border border-orange-400/30">
                  <span className="text-orange-400 font-bold text-sm">{quantity}x Cases</span>
                </div>
              )}
              
              {/* Spinning Items */}
              <div 
                className="flex items-center h-full transition-transform ease-out px-4"
                style={{
                  transform: `translateX(${spinOffset}px)`,
                  transitionDuration: animationPhase === 'spinning' ? '2s' : 
                                     animationPhase === 'slowing' ? '2.5s' : '0s',
                  transitionTimingFunction: animationPhase === 'slowing' ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'linear',
                }}
              >
                {spinItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex-shrink-0 mx-2">
                    <ItemCard item={item} className="w-36 h-52" />
                  </div>
                ))}
              </div>

              {/* Center Line Indicator */}
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 transform -translate-x-1/2 z-10 shadow-2xl shadow-orange-500/50" />
              <div className="absolute top-6 left-1/2 w-0 h-0 border-l-6 border-r-6 border-b-10 border-transparent border-b-orange-400 transform -translate-x-1/2 z-10 drop-shadow-2xl" />
              
              {/* Winning highlight effect */}
              {animationPhase === 'stopped' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent animate-pulse" />
              )}
            </div>

            {/* MODERN SLEEK CELEBRATION MODAL */}
            {showCelebration && bestItem && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-50 p-4">
                {/* Smooth Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95" />
                
                {/* Floating Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute rounded-full bg-gradient-to-r ${getRarityGradient(bestItem.rarity)} opacity-20 animate-float-slow`}
                      style={{
                        width: `${20 + Math.random() * 40}px`,
                        height: `${20 + Math.random() * 40}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${8 + Math.random() * 4}s`
                      }}
                    />
                  ))}
                </div>

                {/* Main Modal Container */}
                <div className={`w-full max-w-2xl mx-auto rounded-3xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl overflow-hidden relative transition-all duration-1000 ${
                  celebrationPhase === 'entering' ? 'scale-50 opacity-0' :
                  celebrationPhase === 'revealing' ? 'scale-95 opacity-90' :
                  'scale-100 opacity-100'
                }`}>
                  
                  {/* Animated Border */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${getRarityGradient(bestItem.rarity)} opacity-30 animate-pulse`} />
                  <div className="absolute inset-[2px] rounded-3xl bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-xl" />

                  {/* Close Button */}
                  <button
                    onClick={resetCase}
                    className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center group z-20"
                  >
                    <X className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
                  </button>

                  <div className="relative z-10 p-12 text-center">
                    {/* Rarity Icon Header */}
                    <div className={`mb-8 transition-all duration-1000 delay-300 ${
                      celebrationPhase === 'celebrating' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    }`}>
                      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${getRarityGradient(bestItem.rarity)} flex items-center justify-center mb-4 shadow-2xl animate-pulse`}>
                        <div className="text-white">
                          {getRarityIcon(bestItem.rarity)}
                        </div>
                      </div>
                      <h3 className={`text-2xl font-bold bg-gradient-to-r ${getRarityGradient(bestItem.rarity)} bg-clip-text text-transparent uppercase tracking-wider`}>
                        {bestItem.rarity === 'knife' ? 'LEGENDARY KNIFE' :
                         bestItem.rarity === 'legendary' ? 'LEGENDARY ITEM' :
                         bestItem.rarity === 'epic' ? 'EPIC ITEM' :
                         'RARE ITEM'}
                      </h3>
                      {quantity > 1 && (
                        <p className="text-white/70 mt-2">Best item from {quantity} cases opened!</p>
                      )}
                    </div>

                    {/* Item Display */}
                    <div className={`mb-8 transition-all duration-1000 delay-500 ${
                      celebrationPhase === 'celebrating' ? 'scale-100 opacity-100' : 'scale-80 opacity-0'
                    }`}>
                      <div className="relative">
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${getRarityGradient(bestItem.rarity)} opacity-20 blur-2xl animate-pulse`} />
                        
                        <div className="w-80 h-96 mx-auto mb-6 relative">
                          <ItemCard 
                            item={bestItem} 
                            className="w-full h-full transform hover:scale-105 transition-transform duration-500 shadow-2xl" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className={`space-y-6 transition-all duration-1000 delay-700 ${
                      celebrationPhase === 'celebrating' ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{bestItem.name}</h2>
                        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${getRarityGradient(bestItem.rarity)} bg-opacity-20 border border-white/20`}>
                          <span className="text-white font-semibold capitalize">{bestItem.rarity}</span>
                          {bestItem.float && (
                            <span className="text-white/70 text-sm">Float: {bestItem.float.toFixed(4)}</span>
                          )}
                        </div>
                      </div>

                      {/* Value Display */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl blur-lg animate-pulse" />
                        <div className="relative bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-400/30">
                          <p className="text-sm text-green-400 mb-1 uppercase tracking-wide">Market Value</p>
                          <p className="text-4xl font-black text-green-400">
                            ${bestItem.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Multiple Items Summary */}
                      {quantity > 1 && (
                        <div className="p-4 rounded-2xl glass-morphism border border-white/20">
                          <p className="text-white/70 text-sm mb-2">Total Items Received:</p>
                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold">{quantity} Items</span>
                            <span className="text-orange-400 font-bold">
                              ${wonItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)} Total Value
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Provably Fair Info */}
                      {currentGameId && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-semibold text-sm">Provably Fair</span>
                            </div>
                            <button
                              onClick={() => {
                                setShowProvablyFairModal(true);
                                resetCase();
                              }}
                              className="px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm transition-colors duration-300"
                            >
                              Verify
                            </button>
                          </div>
                          <p className="text-green-300 text-xs mt-1">Game ID: {currentGameId.slice(-8)}</p>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-4">
                        <button
                          onClick={resetCase}
                          className={`w-full px-8 py-4 rounded-2xl bg-gradient-to-r ${getRarityGradient(bestItem.rarity)} text-white font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-3`}
                        >
                          <Sparkles className="w-6 h-6" />
                          <span className="text-lg">OPEN MORE CASES</span>
                          <Sparkles className="w-6 h-6" />
                        </button>
                      </div>

                      {/* CleanCase Branding */}
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden p-1">
                            <img 
                              src="/download.webp" 
                              alt="CleanCase Logo" 
                              className="w-full h-full object-contain filter brightness-0 invert"
                            />
                          </div>
                          <span className="text-orange-400 font-bold">CleanCase</span>
                          <span className="text-white/50">Premium Experience</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls with Demo Button */}
          <div className="text-center space-y-6">
            {/* Main Open Button */}
            <button
              type="button"
              onClick={() => handleOpenCase(false)}
              disabled={balance < getTotalPrice() || isOpening}
              className={`
                px-12 py-6 rounded-3xl font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl focus:outline-none focus:ring-2 focus:ring-orange-400/50
                ${balance < getTotalPrice() || isOpening
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed pointer-events-none'
                  : 'glass-button text-white hover:shadow-orange-500/30'
                }
              `}
              style={{ pointerEvents: (balance < getTotalPrice() || isOpening) ? 'none' : 'auto' }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden p-1">
                  <img 
                    src="/download.webp" 
                    alt="CleanCase Logo" 
                    className="w-full h-full object-contain filter brightness-0 invert"
                  />
                </div>
                <span>
                  {isOpening ? 'Opening Cases...' : `Open ${quantity}x Cases - $${getTotalPrice().toFixed(2)}`}
                </span>
                <Play className="w-6 h-6" />
              </div>
            </button>

            {/* Demo Button (looks like a regular secondary option) */}
            <div className="flex items-center justify-center space-x-4">
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
              <span className="text-white/50 text-sm">or</span>
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
            </div>

            <button
              type="button"
              onClick={() => handleOpenCase(true)}
              disabled={balance < getTotalPrice() || isOpening}
              className={`
                px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50
                ${balance < getTotalPrice() || isOpening
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed pointer-events-none'
                  : 'glass-morphism hover:glass-morphism-strong text-white border border-white/30 hover:border-orange-400/50'
                }
              `}
              style={{ pointerEvents: (balance < getTotalPrice() || isOpening) ? 'none' : 'auto' }}
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Demo - $${getTotalPrice().toFixed(2)}</span>
              </div>
            </button>
            
            {balance < getTotalPrice() && (
              <p className="text-red-400 font-semibold">Insufficient balance</p>
            )}

            {/* Referral Button */}
            <button
              type="button"
              onClick={() => setShowReferralModal(true)}
              className="px-6 py-3 rounded-2xl glass-morphism hover:glass-morphism-strong text-white font-medium transition-all duration-300 flex items-center space-x-2 mx-auto focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            >
              <Gift className="w-5 h-5" />
              <span>Refer Friends & Earn</span>
            </button>

            {/* CleanCase Branding */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Powered by <span className="text-orange-400 font-bold">CleanCase</span> Technology
              </p>
            </div>
          </div>
        </div>

        {/* Top Winners Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Live Winners Component */}
            <TopWinners />

            {/* Odds Display - Now showing actual case drop rates from admin panel */}
            <div className="p-6 rounded-3xl liquid-glass">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Star className="w-5 h-5 text-orange-400" />
                <h4 className="text-white font-bold">Drop Rates</h4>
                <Star className="w-5 h-5 text-orange-400" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Common</span>
                  <span className="text-gray-300 font-bold">{actualDropRates.common.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Uncommon</span>
                  <span className="text-green-300 font-bold">{actualDropRates.uncommon.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Rare</span>
                  <span className="text-blue-300 font-bold">{actualDropRates.rare.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">Epic</span>
                  <span className="text-purple-300 font-bold">{actualDropRates.epic.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400">Legendary</span>
                  <span className="text-yellow-300 font-bold">{actualDropRates.legendary.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-400">Knife</span>
                  <span className="text-orange-300 font-bold">{actualDropRates.knife.toFixed(2)}%</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  <span className="text-orange-400 font-semibold">CleanCase</span> admin configured odds
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provably Fair Modal */}
      <ProvablyFairModal
        isOpen={showProvablyFairModal}
        onClose={() => setShowProvablyFairModal(false)}
        gameId={currentGameId || undefined}
      />

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-3xl liquid-glass border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Gift className="w-6 h-6 text-orange-400" />
                  <span>Refer & Earn</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">Earn 10% Commission</h4>
                  <p className="text-gray-400 text-sm">
                    Invite friends and earn 10% of their case opening costs forever!
                  </p>
                </div>

                <div className="p-4 rounded-2xl glass-morphism">
                  <p className="text-white/70 text-sm mb-2">Your Referral Code:</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20">
                      <span className="text-orange-400 font-mono font-bold">CLEAN2024</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText('CLEAN2024')}
                      className="px-4 py-3 rounded-lg glass-button text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg glass-morphism">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold">1</span>
                    </div>
                    <span className="text-white text-sm">Share your referral code</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg glass-morphism">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 font-bold">2</span>
                    </div>
                    <span className="text-white text-sm">Friends sign up & open cases</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg glass-morphism">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <span className="text-orange-400 font-bold">3</span>
                    </div>
                    <span className="text-white text-sm">You earn 10% commission</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30">
                  <div className="text-center">
                    <p className="text-green-400 font-bold">Total Earned</p>
                    <p className="text-white text-2xl font-black">$0.00</p>
                    <p className="text-green-300 text-sm">0 referrals</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="w-full py-3 rounded-2xl glass-button text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                >
                  Start Referring
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Contents Preview */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden p-1">
              <img 
                src="/download.webp" 
                alt="CleanCase Logo" 
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
              Collection Items
            </h3>
            <Sparkles className="w-6 h-6 text-orange-400" />
          </div>
          <p className="text-gray-400">Discover the items waiting in this exclusive case</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {selectedCase.items.map((item) => (
            <ItemCard key={item.id} item={item} className="h-56" />
          ))}
        </div>
      </div>
    </div>
  );
}