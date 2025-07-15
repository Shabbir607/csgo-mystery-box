import React, { useState, useRef, useEffect } from 'react';
import { Wallet, User, Settings, Sparkles, ChevronDown, Plus, LogIn, Shield, LogOut, Stamp as Steam } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  balance: number;
  onViewChange: (view: 'cases' | 'opening' | 'inventory' | 'profile' | 'settings' | 'crypto' | 'admin' | 'steam') => void;
  currentView: string;
  onAddFunds: (amount: number) => void;
  user: UserType | null;
  onShowLogin: () => void;
  onLogout: () => void;
}

export default function Header({ balance, onViewChange, currentView, onAddFunds, user, onShowLogin, onLogout }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleMenuToggle = () => {
    setShowUserMenu(prev => !prev);
  };

  const handleMenuItemClick = (action: () => void) => {
    setShowUserMenu(false);
    action();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-all duration-500 group"
            onClick={() => onViewChange('cases')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30 overflow-hidden p-2 group-hover:shadow-orange-500/50 transition-all duration-500">
              <img
                src="/download.webp"
                alt="CleanCase Logo"
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent group-hover:from-orange-100 group-hover:to-orange-300 transition-all duration-500">
              CleanCase
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {[
              { name: 'Cases', key: 'cases' },
              { name: 'Inventory', key: 'inventory' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => onViewChange(item.key as any)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-500 relative overflow-hidden ${currentView === item.key
                    ? 'glass-button text-white shadow-lg shadow-orange-500/30'
                    : 'glass-morphism text-white/80 hover:text-white hover:glass-morphism-strong'
                  }`}
              >
                <span className="relative z-10">{item.name}</span>
                {currentView === item.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-600/20 animate-glass-shimmer" />
                )}
              </button>
            ))}
          </nav>

          {/* User Area */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Balance Display */}
                <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl glass-morphism hover:glass-morphism-strong transition-all duration-500">
                  <Wallet className="w-4 h-4 text-orange-400" />
                  <div className="flex flex-col">
                    <span className="text-xs text-orange-400 font-medium uppercase tracking-wide">Balance</span>
                    <span className="text-white font-bold">${Number(balance || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Deposit Button */}
                <button
                  onClick={() => onViewChange('crypto')}
                  className="glass-button px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-300 flex items-center space-x-2 hover:shadow-orange-500/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>Deposit</span>
                </button>

                {/* Steam Button */}
                <button
                  onClick={() => onViewChange('steam')}
                  className={`p-2.5 rounded-xl transition-all duration-500 ${currentView === 'steam'
                      ? 'glass-button text-white shadow-lg shadow-blue-500/30'
                      : 'glass-morphism hover:glass-morphism-strong text-blue-400 hover:text-blue-300'
                    }`}
                  title="Steam Integration"
                >
                  <Steam className="w-5 h-5" />
                </button>

                {/* Admin Button */}
                {user.isAdmin && (
                  <button
                    onClick={() => onViewChange('admin')}
                    className="p-2.5 rounded-xl glass-morphism hover:glass-morphism-strong text-red-400 hover:text-red-300 transition-all duration-500"
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={handleMenuToggle}
                    className="flex items-center space-x-2 p-2.5 rounded-xl glass-morphism hover:glass-morphism-strong transition-all duration-500 group"
                  >
                    <User className="w-5 h-5 text-white group-hover:text-orange-400 transition-colors duration-500" />
                    <ChevronDown className={`w-4 h-4 text-white/70 group-hover:text-orange-400 transition-all duration-500 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl glass-morphism-strong border border-white/30 shadow-2xl overflow-hidden animate-scale-in z-[9999]"
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b border-white/20 glass-morphism-orange">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{user.username}</p>
                            <p className="text-xs text-orange-200">Level {user.level}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={() => handleMenuItemClick(() => onViewChange('profile'))}
                          className="w-full text-left px-3 py-2.5 rounded-lg text-white transition-all duration-300 flex items-center space-x-3 hover:bg-white/10"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </button>
                        <button
                          onClick={() => handleMenuItemClick(() => onViewChange('steam'))}
                          className="w-full text-left px-3 py-2.5 rounded-lg text-white transition-all duration-300 flex items-center space-x-3 hover:bg-white/10"
                        >
                          <Steam className="w-4 h-4" />
                          <span>Steam Integration</span>
                        </button>
                        <button
                          onClick={() => handleMenuItemClick(() => onViewChange('settings'))}
                          className="w-full text-left px-3 py-2.5 rounded-lg text-white transition-all duration-300 flex items-center space-x-3 hover:bg-white/10"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>

                        <div className="border-t border-white/20 my-2" />

                        <button
                          onClick={() => handleMenuItemClick(onLogout)}
                          className="w-full text-left px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-300 flex items-center space-x-3"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onShowLogin}
                className="glass-button flex items-center space-x-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-500 hover:shadow-orange-500/40"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
      </div>
    </header>
  );
}