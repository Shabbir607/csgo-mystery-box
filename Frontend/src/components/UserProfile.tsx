import React from 'react';
import { User } from '../types';
import { User as UserIcon, Calendar, Trophy, Package, TrendingUp, ArrowLeft, Star } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onBack: () => void;
}

export default function UserProfile({ user, onBack }: UserProfileProps) {
  const memberSince = user.joinDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const totalValue = user.inventory.reduce((sum, item) => sum + item.price, 0);
  const averageValue = user.inventory.length > 0 ? totalValue / user.inventory.length : 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
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
              Profile
            </h1>
          </div>
          <p className="text-sm text-orange-400 font-medium tracking-wide">CleanCase Member</p>
        </div>
        
        <div className="w-32" /> {/* Spacer for centering */}
      </div>

      {/* Profile Card */}
      <div className="mb-10 p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="flex items-center space-x-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Star className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <h2 className="text-4xl font-black text-white">{user.username}</h2>
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-400/30">
                <span className="text-orange-400 font-bold">Level {user.level}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="text-white font-semibold">{memberSince}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Cases Opened</p>
                  <p className="text-white font-semibold">{user.totalOpened}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{user.inventory.length}</div>
          <div className="text-sm text-gray-400">Items Owned</div>
        </div>
        
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-400/30 shadow-xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-green-400 mb-1">${totalValue.toFixed(2)}</div>
          <div className="text-sm text-green-300">Portfolio Value</div>
        </div>
        
        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md border border-orange-400/30 shadow-xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-4 overflow-hidden p-2">
            <img 
              src="/download.webp" 
              alt="CleanCase Logo" 
              className="w-full h-full object-contain filter brightness-0 invert"
            />
          </div>
          <div className="text-2xl font-bold text-orange-400 mb-1">${averageValue.toFixed(2)}</div>
          <div className="text-sm text-orange-300">Avg. Item Value</div>
        </div>
        
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-400/30 shadow-xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mb-1">{user.level}</div>
          <div className="text-sm text-purple-300">Current Level</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mb-10">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="w-6 h-6 text-orange-400" />
          <h3 className="text-2xl font-bold text-white">Achievements</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'First Case', description: 'Opened your first case', completed: user.totalOpened > 0 },
            { name: 'Case Collector', description: 'Opened 10 cases', completed: user.totalOpened >= 10 },
            { name: 'Member', description: 'Reached Level 10', completed: user.level >= 10 },
            { name: 'High Roller', description: 'Own items worth $500+', completed: totalValue >= 500 },
            { name: 'Legendary Hunter', description: 'Own a legendary item', completed: user.inventory.some(item => item.rarity === 'legendary') },
            { name: 'Knife Master', description: 'Own a knife', completed: user.inventory.some(item => item.rarity === 'knife') },
          ].map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                achievement.completed
                  ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-400/30'
                  : 'bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-400/20'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  achievement.completed ? 'bg-orange-500' : 'bg-gray-500'
                }`}>
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <h4 className={`font-bold ${achievement.completed ? 'text-orange-400' : 'text-gray-400'}`}>
                  {achievement.name}
                </h4>
              </div>
              <p className="text-sm text-gray-400">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CleanCase Branding Footer */}
      <div className="text-center pt-8 border-t border-white/10">
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
        <p className="text-xs text-gray-400">Profile • Member Experience</p>
      </div>
    </div>
  );
}