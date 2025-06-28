import React, { useState, useRef } from 'react';
import { CSGOItem } from '../../types';
import { csgoWeapons, getWeaponsByRarity, getAllRarities, getRarityColor, getRarityDisplayName } from '../../data/csgoWeapons';
import ItemCard from '../ItemCard';
import { Search, Filter, Plus, Edit, Trash2, Save, X, GripVertical, Target, Percent } from 'lucide-react';

interface WeaponManagerProps {
  onSelectWeapons: (weapons: CSGOItem[]) => void;
  selectedWeapons: CSGOItem[];
}

export default function WeaponManager({ onSelectWeapons, selectedWeapons }: WeaponManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [draggedItem, setDraggedItem] = useState<CSGOItem | null>(null);
  const [editingProbability, setEditingProbability] = useState<string | null>(null);
  const [probabilityValue, setProbabilityValue] = useState('');
  const dragCounter = useRef(0);

  const filteredWeapons = csgoWeapons.filter(weapon => {
    const matchesSearch = weapon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || weapon.rarity === filterRarity;
    return matchesSearch && matchesRarity;
  });

  const handleDragStart = (e: React.DragEvent, weapon: CSGOItem) => {
    setDraggedItem(weapon);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', weapon.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (draggedItem) {
      const existingItem = selectedWeapons.find(w => w.id === draggedItem.id);
      if (!existingItem) {
        onSelectWeapons([...selectedWeapons, { ...draggedItem, probability: 1.0 }]);
      }
      setDraggedItem(null);
    }
  };

  const handleRemoveWeapon = (weaponId: string) => {
    onSelectWeapons(selectedWeapons.filter(w => w.id !== weaponId));
  };

  const handleUpdateProbability = (weaponId: string, probability: number) => {
    onSelectWeapons(selectedWeapons.map(w => 
      w.id === weaponId ? { ...w, probability } : w
    ));
  };

  const startEditingProbability = (weaponId: string, currentProbability: number) => {
    setEditingProbability(weaponId);
    setProbabilityValue(currentProbability.toString());
  };

  const saveProbability = () => {
    if (editingProbability) {
      const probability = parseFloat(probabilityValue);
      if (!isNaN(probability) && probability >= 0 && probability <= 100) {
        handleUpdateProbability(editingProbability, probability);
      }
      setEditingProbability(null);
      setProbabilityValue('');
    }
  };

  const cancelEditingProbability = () => {
    setEditingProbability(null);
    setProbabilityValue('');
  };

  const totalProbability = selectedWeapons.reduce((sum, weapon) => sum + (weapon.probability || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Weapons Database */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-orange-400" />
            <span>CSGO Weapons Database</span>
          </h3>
          <div className="text-sm text-gray-400">
            {filteredWeapons.length} weapons
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-white/10 border border-white/20">
          <div className="flex items-center space-x-2 flex-1 min-w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search weapons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-orange-400/50"
            >
              <option value="all">All Rarities</option>
              {getAllRarities().map(rarity => (
                <option key={rarity} value={rarity}>
                  {getRarityDisplayName(rarity)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weapons Grid */}
        <div className="h-96 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredWeapons.map((weapon) => (
              <div
                key={weapon.id}
                draggable
                onDragStart={(e) => handleDragStart(e, weapon)}
                className="relative group cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-200"
              >
                <ItemCard item={weapon} className="h-48" />
                
                {/* Drag Indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="p-1 rounded bg-black/50 backdrop-blur-sm">
                    <GripVertical className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Probability Display */}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm">
                  <span className="text-xs text-white font-mono">
                    {weapon.probability?.toFixed(2)}%
                  </span>
                </div>

                {/* Selected Indicator */}
                {selectedWeapons.some(w => w.id === weapon.id) && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-orange-400 bg-orange-500/20 flex items-center justify-center">
                    <div className="text-orange-400 font-bold text-sm">SELECTED</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Weapons for Case */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-400" />
            <span>Case Items</span>
          </h3>
          <div className="text-sm">
            <span className={`font-bold ${totalProbability > 100 ? 'text-red-400' : totalProbability < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
              {totalProbability.toFixed(2)}%
            </span>
            <span className="text-gray-400 ml-1">total</span>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`min-h-96 p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${
            draggedItem 
              ? 'border-orange-400 bg-orange-500/10' 
              : 'border-white/20 bg-white/5'
          }`}
        >
          {selectedWeapons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Drag & Drop Weapons</h4>
              <p className="text-gray-400 text-sm">
                Drag weapons from the database to add them to this case
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedWeapons.map((weapon, index) => (
                <div
                  key={weapon.id}
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors duration-200"
                >
                  {/* Weapon Preview */}
                  <div className="w-16 h-16">
                    <ItemCard item={weapon} className="w-full h-full" />
                  </div>

                  {/* Weapon Info */}
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">{weapon.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${getRarityColor(weapon.rarity)} text-white font-bold capitalize`}>
                        {weapon.rarity}
                      </div>
                      <span className="text-orange-400 font-bold text-sm">${weapon.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Probability Editor */}
                  <div className="flex items-center space-x-2">
                    {editingProbability === weapon.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={probabilityValue}
                          onChange={(e) => setProbabilityValue(e.target.value)}
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-20 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-orange-400/50"
                          autoFocus
                        />
                        <button
                          onClick={saveProbability}
                          className="p-1 rounded bg-green-500 hover:bg-green-600 transition-colors duration-200"
                        >
                          <Save className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={cancelEditingProbability}
                          className="p-1 rounded bg-red-500 hover:bg-red-600 transition-colors duration-200"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditingProbability(weapon.id, weapon.probability || 0)}
                        className="flex items-center space-x-1 px-3 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 transition-colors duration-200"
                      >
                        <Percent className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-400 font-mono text-sm">
                          {(weapon.probability || 0).toFixed(2)}%
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveWeapon(weapon.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Probability Summary */}
        {selectedWeapons.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
            <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <Percent className="w-4 h-4 text-orange-400" />
              <span>Probability Summary</span>
            </h4>
            
            <div className="space-y-2">
              {getAllRarities().map(rarity => {
                const rarityWeapons = selectedWeapons.filter(w => w.rarity === rarity);
                const rarityTotal = rarityWeapons.reduce((sum, w) => sum + (w.probability || 0), 0);
                
                if (rarityWeapons.length === 0) return null;
                
                return (
                  <div key={rarity} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded bg-gradient-to-r ${getRarityColor(rarity)}`} />
                      <span className="text-gray-300 text-sm capitalize">{rarity}</span>
                      <span className="text-gray-400 text-xs">({rarityWeapons.length} items)</span>
                    </div>
                    <span className="text-white font-mono text-sm">{rarityTotal.toFixed(2)}%</span>
                  </div>
                );
              })}
              
              <div className="border-t border-white/20 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className={`font-mono font-bold ${
                    totalProbability > 100 ? 'text-red-400' : 
                    totalProbability < 100 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {totalProbability.toFixed(2)}%
                  </span>
                </div>
                {totalProbability !== 100 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {totalProbability > 100 
                      ? 'Total exceeds 100% - adjust probabilities' 
                      : 'Total below 100% - add more items or increase probabilities'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}