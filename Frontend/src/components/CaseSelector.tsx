import React, { memo } from 'react';
import { CSGOCase } from '../types';
import { Sparkles, Star } from 'lucide-react';

interface CaseSelectorProps {
  cases: CSGOCase[];
  selectedCase: CSGOCase | null;
  onSelectCase: (caseItem: CSGOCase) => void;
}

const CaseCard = memo(function CaseCard({ 
  caseItem, 
  isSelected, 
  onSelect, 
  index 
}: { 
  caseItem: CSGOCase; 
  isSelected: boolean; 
  onSelect: (caseItem: CSGOCase) => void; 
  index: number;
}) {
  return (
    <div
      onClick={() => onSelect(caseItem)}
      className={`
        relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-700
        group h-[520px] flex flex-col animate-liquid-morph
        ${isSelected 
          ? 'glass-morphism-orange shadow-2xl shadow-orange-500/30 border-2 border-orange-400/50 scale-105' 
          : 'liquid-glass hover:glass-morphism-strong border-2 border-white/20 hover:border-orange-400/30 hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-105 hover:-translate-y-2'
        }
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Liquid Glass Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Floating Glass Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-orange-400/10 to-orange-600/10 animate-liquid-float opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              width: `${8 + Math.random() * 16}px`,
              height: `${8 + Math.random() * 16}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${6 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Premium Badge with Glass Effect */}
      <div className="absolute top-4 left-4 flex items-center space-x-1 px-3 py-1.5 rounded-full glass-morphism-orange backdrop-blur-xl z-10 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <Star className="w-3 h-3 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wide">Premium</span>
      </div>

      {/* CleanCase Watermark */}
      <div className="absolute top-4 right-4 w-6 h-6 rounded-full glass-morphism flex items-center justify-center overflow-hidden p-1 z-10 opacity-40 group-hover:opacity-100 transition-all duration-500">
        <img 
          src="/download.webp" 
          alt="CleanCase Logo" 
          className="w-full h-full object-contain filter brightness-0 invert"
          loading="lazy"
        />
      </div>
      
      {/* Case Image Container with Enhanced Hover Animation */}
      <div className="relative flex-1 flex items-center justify-center p-8 pt-16">
        <div className="relative">
          {/* Liquid Glass Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/20 to-orange-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-glow-pulse" />
          
          <img
            src={caseItem.image}
            alt={caseItem.name}
            className="w-32 h-32 object-contain drop-shadow-2xl transform group-hover:rotate-6 group-hover:scale-125 transition-all duration-700 relative z-10"
            loading="lazy"
          />
          
          {/* Additional Glass Reflection */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
        </div>
      </div>
      
      {/* Case Info with Liquid Glass */}
      <div className="relative p-6 pb-8 flex flex-col justify-end glass-morphism rounded-b-3xl">
        {/* Case Name */}
        <h3 className="text-white font-bold text-lg mb-4 group-hover:text-orange-100 transition-colors duration-500 text-center line-clamp-2">
          {caseItem.name}
        </h3>
        
        {/* Price Display with Glass Effect */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2 px-4 py-2.5 rounded-full glass-morphism-orange border border-orange-400/30 hover:border-orange-400/50 transition-all duration-500 group-hover:scale-110">
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center overflow-hidden p-0.5">
              <img 
                src="/download.webp" 
                alt="CleanCase Logo" 
                className="w-full h-full object-contain filter brightness-0 invert"
                loading="lazy"
              />
            </div>
            <span className="text-orange-100 font-bold text-lg">${caseItem.price.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Liquid Glass CTA Button */}
        <button className="w-full py-3.5 px-6 rounded-2xl glass-button text-white font-bold transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform group-hover:scale-105 flex items-center justify-center space-x-2 mb-3 group/btn">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center overflow-hidden p-0.5 group-hover/btn:bg-white/30 transition-all duration-500">
            <img 
              src="/download.webp" 
              alt="CleanCase Logo" 
              className="w-full h-full object-contain filter brightness-0 invert"
              loading="lazy"
            />
          </div>
          <span>Select Case</span>
        </button>
        
        {/* CleanCase Signature */}
        <div className="text-xs text-gray-300 font-medium text-center">
          <span className="text-orange-400">CleanCase</span> Experience
        </div>
      </div>
      
      {/* Selection Indicator with Liquid Glass */}
      {isSelected && (
        <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/50 overflow-hidden p-1.5 z-20 animate-glow-pulse">
          <img 
            src="/download.webp" 
            alt="CleanCase Logo" 
            className="w-full h-full object-contain filter brightness-0 invert"
            loading="lazy"
          />
        </div>
      )}

      {/* Serial Number with Glass Effect */}
      <div className="absolute bottom-2 left-4 text-xs font-mono text-white/30 glass-morphism px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-500">
        CC-{String(index + 1).padStart(3, '0')}
      </div>
    </div>
  );
});

export default function CaseSelector({ cases, selectedCase, onSelectCase }: CaseSelectorProps) {
  return (
    <div className="w-full">
      {/* Liquid Glass Grid container for cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {cases.map((caseItem, index) => (
          <CaseCard
            key={caseItem.id}
            caseItem={caseItem}
            isSelected={selectedCase?.id === caseItem.id}
            onSelect={onSelectCase}
            index={index}
          />
        ))}
      </div>

      {/* Liquid Glass Trust Indicators */}
      <div className="text-center">
        <div className="liquid-glass rounded-2xl p-6 inline-block">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <span>Authentic CSGO Odds</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
              <span>CleanCase Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
              <span>Premium Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}