import React, { memo } from 'react';
import { CSGOItem } from '../types';
import { Star } from 'lucide-react';

interface ItemCardProps {
  item: CSGOItem;
  isRevealed?: boolean;
  className?: string;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  uncommon: 'from-green-400 to-green-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-yellow-400 to-yellow-500',
  knife: 'from-orange-400 to-red-500',
};

const rarityBorders = {
  common: 'border-gray-400/30',
  uncommon: 'border-green-400/30',
  rare: 'border-blue-400/30',
  epic: 'border-purple-400/30',
  legendary: 'border-yellow-400/30',
  knife: 'border-orange-400/30',
};

const rarityGlow = {
  common: 'shadow-gray-500/20',
  uncommon: 'shadow-green-500/20',
  rare: 'shadow-blue-500/20',
  epic: 'shadow-purple-500/20',
  legendary: 'shadow-yellow-500/20',
  knife: 'shadow-orange-500/30',
};

const ItemCard = memo(function ItemCard({ item, isRevealed = true, className = '' }: ItemCardProps) {
  const isHighTier = ['legendary', 'knife'].includes(item.rarity);
  
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent
        border-2 hover:bg-white/15 transition-all duration-500 group cursor-pointer
        ${rarityBorders[item.rarity]} hover:${rarityBorders[item.rarity].replace('/30', '/50')}
        ${rarityGlow[item.rarity]} hover:shadow-2xl
        ${className}
      `}
    >
      {/* Background Effects */}
      <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[item.rarity]} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
      
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
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br ${rarityColors[item.rarity]} shadow-lg`} />
      
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
          {/* Glow Effect for High-Tier Items */}
          {isHighTier && (
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${rarityColors[item.rarity]} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`} />
          )}
        </div>
      </div>
      
      {/* Item Info */}
      <div className="relative p-4 pt-0 space-y-3">
        <h3 className="text-white font-semibold text-sm leading-tight truncate group-hover:text-orange-100 transition-colors duration-300">
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${rarityColors[item.rarity]} text-white font-bold capitalize shadow-lg`}>
            {item.rarity}
          </div>
          <div className="text-right">
            <div className="text-orange-400 font-bold text-sm">${item.price.toFixed(2)}</div>
          </div>
        </div>
        
        {item.float && (
          <div className="text-xs text-gray-400 font-mono">
            Float: {item.float.toFixed(4)}
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
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${rarityColors[item.rarity]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      {/* High-Tier Sparkle Effect */}
      {isHighTier && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Star className="w-4 h-4 text-orange-400 animate-pulse" />
        </div>
      )}
    </div>
  );
});

export default ItemCard;