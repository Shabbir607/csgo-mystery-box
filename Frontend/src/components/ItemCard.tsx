import React, { memo } from 'react';
import { CSGOItem } from '../types';
import { Star } from 'lucide-react';

interface ItemCardProps {
  item: CSGOItem;
  isRevealed?: boolean;
  className?: string;
}

const rarityColors: Record<string, string> = {
  'consumer grade': 'from-gray-400 to-gray-500',
  'industrial grade': 'from-blue-400 to-blue-500',
  'mil-spec grade': 'from-blue-600 to-blue-700',
  'restricted': 'from-purple-500 to-purple-600',
  'classified': 'from-pink-500 to-pink-600',
  'covert': 'from-red-500 to-red-600',
  'extraordinary': 'from-orange-500 to-red-500',
  'contraband': 'from-yellow-400 to-yellow-500',
  'base grade': 'from-gray-500 to-gray-600',
  'high grade': 'from-cyan-400 to-cyan-500',
  'remarkable': 'from-indigo-500 to-indigo-600',
  'exotic': 'from-fuchsia-500 to-fuchsia-600',
  'master': 'from-rose-500 to-rose-600',
  'superior': 'from-emerald-500 to-emerald-600',
  'exceptional': 'from-teal-500 to-teal-600',
  'distinguished': 'from-lime-500 to-lime-600',
  'common': 'from-gray-400 to-gray-500',
  'unknown': 'from-neutral-500 to-neutral-600',
};

const ItemCard = memo(function ItemCard({ item, isRevealed = true, className = '' }: ItemCardProps) {
  const rarityKey = item.rarity?.name?.toLowerCase() || 'unknown';
  const bgGradient = rarityColors[rarityKey] || 'from-gray-600 to-gray-700';
  const borderColor = item.rarity?.color || '#ffffff30';
  const price = typeof item.price === 'number' ? item.price : parseFloat(item.price ?? '0');
  const isHighTier = ['extraordinary', 'covert', 'contraband'].includes(rarityKey);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent
        border-2 hover:bg-white/15 transition-all duration-500 group cursor-pointer
        ${className}
      `}
      style={{ borderColor }}
    >
      {/* Background Effects */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

      {/* CleanCase Badge for High-Tier Items */}
      {isHighTier && (
        <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500/90 to-orange-600/90 backdrop-blur-sm">
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
      )}

      {/* Rarity Indicator */}
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br ${bgGradient} shadow-lg`} />

      {/* Item Image */}
      <div className="relative p-6 flex items-center justify-center">
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/2893916/pexels-photo-2893916.jpeg?auto=compress&cs=tinysrgb&w=400';
            }}
          />
          {isHighTier && (
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${bgGradient} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`} />
          )}
        </div>
      </div>

      {/* Item Info */}
      <div className="relative p-4 pt-0 space-y-3">
        <h3 className="text-white font-semibold text-sm leading-tight truncate group-hover:text-orange-100 transition-colors duration-300">
          {item.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${bgGradient} text-white font-bold capitalize shadow-lg`}>
            {item.rarity?.name || 'Unknown'}
          </div>
          <div className="text-right">
            <div className="text-orange-400 font-bold text-sm">${price.toFixed(2)}</div>
          </div>
        </div>

        {item.float != null && !isNaN(Number(item.float)) && (
          <div className="text-xs text-gray-400 font-mono">
            Float: {parseFloat(item.float as any).toFixed(4)}
          </div>
        )}

        {/* CleanCase Authenticity Mark */}
        <div className="flex items-center justify-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-white/10 flex items-center justify-center overflow-hidden p-0.5">
            <img
              src="/download.webp"
              alt="CleanCase Logo"
              className="w-full h-full object-contain filter brightness-0 invert opacity-20"
              loading="lazy"
            />
          </div>
          <span className="text-xs text-center text-white/20 font-bold tracking-widest">CLEANCASE</span>
        </div>
      </div>

      {/* Hover Glow */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

      {isHighTier && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Star className="w-4 h-4 text-orange-400 animate-pulse" />
        </div>
      )}
    </div>
  );
});

export default ItemCard;
