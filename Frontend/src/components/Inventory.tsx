import React, { useState, useMemo, useCallback } from 'react';
import { CSGOItem } from '../types';
import ItemCard from './ItemCard';
import { Package, Sparkles, Star, DollarSign, Filter, Search } from 'lucide-react';

interface InventoryProps {
  items: CSGOItem[];
  onSellItem: (itemId: string, price: number) => void;
}

export default function Inventory({ items, onSellItem }: InventoryProps) {
  const [selectedItem, setSelectedItem] = useState<CSGOItem | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rarity'>('price');

  // Memoized calculations for better performance
  const totalValue = useMemo(() => 
    items.reduce((sum, item) => sum + item.price, 0), 
    [items]
  );

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity;
        return matchesSearch && matchesRarity;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price':
            return b.price - a.price;
          case 'rarity':
            const rarityOrder = { knife: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
          default:
            return 0;
        }
      });
  }, [items, searchTerm, filterRarity, sortBy]);

  const handleSellItem = useCallback((sellPrice: number) => {
    if (selectedItem) {
      onSellItem(selectedItem.id, sellPrice);
      setShowSellModal(false);
      setSelectedItem(null);
    }
  }, [selectedItem, onSellItem]);

  const openSellModal = useCallback((item: CSGOItem) => {
    setSelectedItem(item);
    setShowSellModal(true);
  }, []);

  // Memoized stats calculations
  const stats = useMemo(() => ({
    totalItems: items.length,
    legendaryCount: items.filter(item => ['legendary', 'knife'].includes(item.rarity)).length,
    averageValue: items.length > 0 ? totalValue / items.length : 0,
    highestValue: items.length > 0 ? Math.max(...items.map(item => item.price)) : 0
  }), [items, totalValue]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30 overflow-hidden p-2">
            <img 
              src="/download.webp" 
              alt="CleanCase Logo" 
              className="w-full h-full object-contain filter brightness-0 invert"
              loading="lazy"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                Inventory
              </h2>
              <Sparkles className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-sm text-orange-400 font-medium tracking-wide">CleanCase Inventory</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-xs text-orange-400 font-medium uppercase tracking-wide">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto shadow-2xl">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 overflow-hidden p-1.5">
              <img 
                src="/download.webp" 
                alt="CleanCase Logo" 
                className="w-full h-full object-contain filter brightness-0 invert"
                loading="lazy"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Your Inventory Awaits</h3>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              Begin your journey with CleanCase exclusive cases. Each opening brings you closer to legendary items.
            </p>
            
            <div className="pt-6">
              <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-400/30">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center overflow-hidden p-0.5">
                  <img 
                    src="/download.webp" 
                    alt="CleanCase Logo" 
                    className="w-full h-full object-contain filter brightness-0 invert"
                    loading="lazy"
                  />
                </div>
                <span className="text-orange-400 font-semibold">CleanCase Experience</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.totalItems}</div>
              <div className="text-sm text-gray-400">Items</div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md border border-orange-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">{stats.legendaryCount}</div>
              <div className="text-sm text-orange-300">Legendary+</div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">${stats.averageValue.toFixed(2)}</div>
              <div className="text-sm text-green-300">Avg. Value</div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">${stats.highestValue.toFixed(2)}</div>
              <div className="text-sm text-purple-300">Highest Value</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-400/50"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
                <option value="knife">Knife</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-400/50"
              >
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="rarity">Rarity</option>
              </select>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="relative group">
                <ItemCard item={item} className="h-56" />
                
                {/* Sell Button */}
                <button
                  onClick={() => openSellModal(item)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <span className="text-white font-bold">Sell Item</span>
                    <p className="text-green-400 text-sm">${(item.price * 0.85).toFixed(2)}</p>
                  </div>
                </button>
                
                {/* CleanCase Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500/80 to-orange-600/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center overflow-hidden p-0.5">
                    <img 
                      src="/download.webp" 
                      alt="CleanCase Logo" 
                      className="w-full h-full object-contain filter brightness-0 invert"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wide">CC</span>
                </div>
                
                {/* Item Number */}
                <div className="absolute bottom-2 right-2 text-xs font-mono text-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  #{String(index + 1).padStart(3, '0')}
                </div>
              </div>
            ))}
          </div>

          {/* CleanCase Branding Footer */}
          <div className="text-center pt-8 border-t border-white/10">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden p-0.5">
                <img 
                  src="/download.webp" 
                  alt="CleanCase Logo" 
                  className="w-full h-full object-contain filter brightness-0 invert"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-bold text-orange-400">CleanCase</span>
              <Sparkles className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-xs text-gray-400">Inventory • Excellence Redefined</p>
          </div>
        </div>
      )}

      {/* Sell Item Modal */}
      {showSellModal && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4">
                  <ItemCard item={selectedItem} className="w-full h-full" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedItem.name}</h3>
                <p className="text-gray-400">Confirm sale of this item</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/10">
                  <span className="text-gray-400">Market Value:</span>
                  <span className="text-white font-bold">${selectedItem.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-green-500/20 border border-green-400/30">
                  <span className="text-green-400">You'll Receive:</span>
                  <span className="text-green-400 font-bold text-xl">${(selectedItem.price * 0.85).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 text-center">15% marketplace fee applies</p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleSellItem(selectedItem.price * 0.85)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300"
                >
                  Confirm Sale
                </button>
                <button
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}