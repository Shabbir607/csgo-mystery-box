import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import CaseSelector from './components/CaseSelector';
import CaseOpener from './components/CaseOpener';
import Inventory from './components/Inventory';
import UserProfile from './components/UserProfile';
import Settings from './components/Settings';
import CryptoWallet from './components/CryptoWallet';
import SteamIntegration from './components/SteamIntegration';
import AdminPanel from './components/Admin/AdminPanel';
import LoginModal from './components/Auth/LoginModal';
import { CryptoCurrency, CSGOCase, CSGOItem, User } from './types';
import { cases as initialCases } from './data/cases';
import { Sparkles } from 'lucide-react';
import axios from 'axios';
import { useToast } from './components/ToastContext';
type View = 'cases' | 'opening' | 'inventory' | 'profile' | 'settings' | 'crypto' | 'admin' | 'steam';

// Local storage keys
const STORAGE_KEYS = {
  USER: 'cleancase_user',
  CASES: 'cleancase_cases',
  SELECTED_CASE: 'cleancase_selected_case',
  CURRENT_VIEW: 'cleancase_current_view',
  USER_INVENTORY: 'cleancase_user_inventory', // New key for persistent inventory
  USER_BALANCE: 'cleancase_user_balance', // New key for persistent balance
  USER_STATS: 'cleancase_user_stats' // New key for persistent stats
} as const;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<CSGOCase[]>(initialCases);
  const [AllCases, setAllCases] = useState<CSGOCase[]>([]);
  const [HomeCases, setHomeCases] = useState<CSGOCase[]>([]);
  const [caseResponse, setCaseResponse] = useState(null);
  const [nextPageHome, setNextPageHome] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<CSGOCase | null>(null);
  const [currentView, setCurrentView] = useState<View>('cases');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPageCases, setNextPageCases] = useState<string | null>(null);
  const CaseContainerRef = useRef<HTMLDivElement | null>(null);
  const HomeContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFetchingHome, setIsFetchingHome] = useState(false);
  const [supportedCryptos, setSupportedCryptos] = useState<CryptoCurrency[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency | undefined>(undefined);
  console.log("User", user)
  console.log("AllCases", AllCases)
  console.log("HomeCases", HomeCases)

  const { showToast } = useToast();

  // Memoized loading component
  const LoadingScreen = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="liquid-glass rounded-3xl p-12 text-center animate-liquid-morph">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-6 animate-glow-pulse overflow-hidden p-3">
          <img
            src="/download.webp"
            alt="CleanCase Logo"
            className="w-full h-full object-contain filter brightness-0 invert"
            loading="eager"
          />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent mb-3">
          CleanCase
        </h1>
        <p className="text-gray-300">Loading your premium experience...</p>

        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-orange-400/20 to-orange-600/20 animate-liquid-float"
              style={{
                width: `${15 + Math.random() * 25}px`,
                height: `${15 + Math.random() * 25}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${6 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  ), []);

  // Helper function to get persistent user data
  const getPersistentUserData = useCallback((username: string) => {
    try {
      const inventory = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.USER_INVENTORY}_${username}`) || '[]');
      const balance = parseFloat(localStorage.getItem(`${STORAGE_KEYS.USER_BALANCE}_${username}`) || '0');
      const stats = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.USER_STATS}_${username}`) || '{}');

      return {
        inventory,
        balance: balance || (username.toLowerCase() === 'admin' ? 1000 : 100), // Default balance
        totalOpened: stats.totalOpened || 0,
        level: stats.level || (username.toLowerCase() === 'admin' ? 99 : 1),
        joinDate: stats.joinDate ? new Date(stats.joinDate) : new Date()
      };
    } catch (error) {
      console.error('Error loading persistent user data:', error);
      return {
        inventory: [],
        balance: username.toLowerCase() === 'admin' ? 1000 : 100,
        totalOpened: 0,
        level: username.toLowerCase() === 'admin' ? 99 : 1,
        joinDate: new Date()
      };
    }
  }, []);

  // Helper function to save persistent user data
  const savePersistentUserData = useCallback((username: string, userData: Partial<User>) => {
    try {
      if (userData.inventory) {
        localStorage.setItem(`${STORAGE_KEYS.USER_INVENTORY}_${username}`, JSON.stringify(userData.inventory));
      }
      if (userData.balance !== undefined) {
        localStorage.setItem(`${STORAGE_KEYS.USER_BALANCE}_${username}`, userData.balance.toString());
      }
      if (userData.totalOpened !== undefined || userData.level !== undefined || userData.joinDate) {
        const stats = {
          totalOpened: userData.totalOpened,
          level: userData.level,
          joinDate: userData.joinDate
        };
        localStorage.setItem(`${STORAGE_KEYS.USER_STATS}_${username}`, JSON.stringify(stats));
      }
    } catch (error) {
      console.error('Error saving persistent user data:', error);
    }
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        // Load user data
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          const userData = JSON.parse(storedUser);

          // Load persistent data for this user
          const persistentData = getPersistentUserData(userData.username);

          const fullUserData: User = {
            ...userData,
            ...persistentData,
            joinDate: persistentData.joinDate
          };

          setUser(fullUserData);
        }

        // Load cases data
        const storedCases = localStorage.getItem(STORAGE_KEYS.CASES);
        if (storedCases) {
          const parsedCases = JSON.parse(storedCases);
          const customCases = parsedCases.filter((c: CSGOCase) =>
            !initialCases.some(initial => initial.id === c.id)
          );
          setCases([...initialCases, ...customCases]);
        }

        // Load selected case
        const storedSelectedCase = localStorage.getItem(STORAGE_KEYS.SELECTED_CASE);
        if (storedSelectedCase) {
          setSelectedCase(JSON.parse(storedSelectedCase));
        }

        // Load current view
        const storedView = localStorage.getItem(STORAGE_KEYS.CURRENT_VIEW);
        if (storedView && ['cases', 'opening', 'inventory', 'profile', 'settings', 'crypto', 'admin', 'steam'].includes(storedView)) {
          setCurrentView(storedView as View);
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
        // Clear corrupted data
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, [getPersistentUserData]);

  // Optimized localStorage save functions
  const saveToStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const fetchAuthenticatedUser = useCallback(async (): Promise<User | null> => {
    const token = sessionStorage.getItem('auth_token');

    if (!token) {
      showToast("Session Expired. Please login again.", "error");
      handleLogout();
      setShowLoginModal(true);
      return null;
    }

    try {
      const response = await axios.get(
        'https://production.gameonha.com/api/user',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 200 && response.data) {
        const userData = response.data;
        const persistentData = getPersistentUserData(userData.name);

        const user: User = {
          username: userData.name || 'Unknown',
          isAdmin: userData.isAdmin === true,
          ...persistentData
        };

        setUser(user);
        return user;
      } else {
        console.warn("Unexpected Response Format:", response);
        return null;
      }
    } catch (error: any) {
      console.error("Error Fetching Authenticated User:", error?.response?.data || error.message);
    }
  }, [getPersistentUserData, showToast, hasCheckedAuth]);

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');

    if (!token && !hasCheckedAuth) {
      fetchAuthenticatedUser();
      setHasCheckedAuth(true);
    }

    if (token && !hasCheckedAuth) {
      setHasCheckedAuth(true);
    }
  }, [hasCheckedAuth, fetchAuthenticatedUser]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async (url = 'https://production.gameonha.com/api/admin/crates?page=1', append = false) => {
    try {
      const token = sessionStorage.getItem('auth_token');

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      console.log(data);

      const cratesData = data?.crates?.data || [];

      setCaseResponse(data?.crates || null);
      setAllCases(prev => (append ? [...prev, ...cratesData] : cratesData));
      setNextPageCases(data?.crates?.next_page_url || null);
    } catch (err: any) {
      showToast(err.message || 'Failed to Fetch Cases', "error");
    }
  };

  useEffect(() => {
    FetchHomeCases();
  }, []);

  const FetchHomeCases = async (url = 'https://production.gameonha.com/api/cases?page=1', append = false) => {
    try {
      const token = sessionStorage.getItem('auth_token');

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      console.log(data);

      const cratesData = data?.crates?.data || [];

      setHomeCases(prev => (append ? [...prev, ...cratesData] : cratesData));
      setNextPageHome(data?.crates?.next_page_url || null);
    } catch (err: any) {
      showToast(err.message || 'Failed to Fetch HomeCases', "error");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const container = HomeContainerRef.current;
      if (!container || isFetchingHome || !nextPageHome) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setIsFetchingHome(true);
        FetchHomeCases(nextPageHome, true).finally(() => setIsFetchingHome(false));
      }
    };

    const container = HomeContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [nextPageHome, isFetchingHome]);

  useEffect(() => {
    FetchCurrencies();
  }, []);

  const FetchCurrencies = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');

      const response = await fetch('https://production.gameonha.com/api/currencies', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('FetchCurrencies API Response:', data);
      setSupportedCryptos(data?.data);
      setSelectedCrypto(data?.data?.[0]);

    } catch (err: any) {
      showToast(err.message || 'Failed to fetch FetchCurrencies.', "error");
      console.error('FetchCurrencies error:', err);
    }
  };

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      // Save basic user info
      const basicUserData = {
        username: user.username,
        isAdmin: user.isAdmin,
        steamAccount: user.steamAccount
      };
      saveToStorage(STORAGE_KEYS.USER, basicUserData);

      // Save persistent data separately
      savePersistentUserData(user.username, {
        inventory: user.inventory,
        balance: user.balance,
        totalOpened: user.totalOpened,
        level: user.level,
        joinDate: user.joinDate
      });
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user, saveToStorage, savePersistentUserData]);

  // Save cases data to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CASES, cases);
  }, [cases, saveToStorage]);

  // Save selected case to localStorage whenever it changes
  useEffect(() => {
    if (selectedCase) {
      saveToStorage(STORAGE_KEYS.SELECTED_CASE, selectedCase);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_CASE);
    }
  }, [selectedCase, saveToStorage]);

  // Save current view to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_VIEW, currentView);
  }, [currentView, saveToStorage]);

  // Optimized authentication functions
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      let response;

      try {
        response = await axios.post(
          'https://production.gameonha.com/api/login',
          { email, password },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (error) {
        console.warn('Normal login failed. Trying Admin login...');

        response = await axios.post(
          'https://production.gameonha.com/api/admin/login',
          { email, password },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
      }
      console.log("UserHaii", response);
      const token = response.data?.token;
      if (!token) {
        console.error("No Token Found in login Response", response.data);
        showToast(response?.data?.message || "Login failed: Token not Received.", "error");
        return;
      }
      sessionStorage.setItem('auth_token', token);

      const persistentData = getPersistentUserData(email);
      const mockUser: User = {
        username: response.data.user?.name || 'Unknown',
        isAdmin: response.data.isAdmin === true,
        ...persistentData
      };

      sessionStorage.setItem('User_id', response.data?.user?.id);
      setUser(mockUser);
      setShowLoginModal(false);

    } catch (error: any) {
      const message =
        error?.response?.data?.message;
      if (message) {
        showToast(message, "error");
      }
    }
  }, [getPersistentUserData]);

  const handleRegister = useCallback(
    async (
      username: string,
      email: string,
      password: string,
      confirmPassword: string
    ) => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await axios.post(
          'https://production.gameonha.com/api/register',
          {
            username,
            email,
            password,
            password_confirmation: confirmPassword,
          },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
        const responseData = response.data?.user || response.data;
        console.log("Processed Response Data:", responseData);
        showToast("User Registered Successfully", "info")
        setShowLoginModal(true);

      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error.message ||
          "Registration failed. Please Try Again.";
        console.error("Registration error:", message);
        showToast("Registration failed !", message, "error");
      }
    },
    [getPersistentUserData]
  );

  const handleLogout = useCallback(async () => {
    const token = sessionStorage.getItem('auth_token');
    if (!token) {
      console.warn('No Token Found in SessionStorage. Skipping logout API.');
    }

    try {
      if (token) {

        const response = await axios.post(
          'https://production.gameonha.com/api/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );

        console.log("Logout API Response:", response.data);
      }
    } catch (error: any) {
      console.warn('Logout API failed:', error?.response?.data || error.message);
    }

    // Always clear session data regardless
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('User_id');
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_CASE);
    saveToStorage(STORAGE_KEYS.CURRENT_VIEW, 'cases');

    setUser(null);
    setSelectedCase(null);
    setCurrentView('cases');
  }, [saveToStorage]);

  const handleSelectCase = useCallback((caseItem: CSGOCase) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setSelectedCase(caseItem);
    setCurrentView('opening');
  }, [user]);

  const handleOpenCase = useCallback((item: CSGOItem, cost: number) => {
    if (!user) return;

    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance - cost,
      inventory: [...prev.inventory, item],
      totalOpened: prev.totalOpened + 1
    }) : null);
  }, [user]);

  const handleSellItem = useCallback((itemId: string, price: number) => {
    if (!user) return;

    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance + price,
      inventory: prev.inventory.filter(item => item.id !== itemId)
    }) : null);
  }, [user]);

  const handleAddFunds = useCallback((amount: number) => {
    if (!user) return;

    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance + amount
    }) : null);
  }, [user]);

  const handleBalanceUpdate = useCallback((amount: number) => {
    if (!user) return;

    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance + amount
    }) : null);
  }, [user]);

  const handleBackToCases = useCallback(() => {
    setSelectedCase(null);
    setCurrentView('cases');
  }, []);

  const handleViewChange = useCallback((view: View) => {
    if (!user && ['inventory', 'profile', 'settings', 'crypto', 'admin', 'steam'].includes(view)) {
      setShowLoginModal(true);
      return;
    }

    if (view === 'admin' && (!user || !user.isAdmin)) {
      return;
    }

    setCurrentView(view);
    if (view !== 'opening') {
      setSelectedCase(null);
    }
  }, [user]);

  const handleUpdateCases = useCallback((newCases: CSGOCase[]) => {
    setCases(newCases);

    if (selectedCase) {
      const updatedSelectedCase = newCases.find(c => c.id === selectedCase.id);
      if (updatedSelectedCase) {
        setSelectedCase(updatedSelectedCase);
      }
    }
  }, [selectedCase]);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  // Memoized background effects
  const backgroundEffects = useMemo(() => (
    <div className="absolute inset-0">
      {/* Main Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-full filter blur-3xl animate-liquid-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-400/8 to-orange-500/3 rounded-full filter blur-3xl animate-liquid-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-orange-500/5 to-transparent rounded-full animate-liquid-float" style={{ animationDelay: '4s' }} />

      {/* Floating Glass Particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full glass-morphism animate-liquid-float"
          style={{
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${8 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  ), []);

  // Simple loading screen
  if (isLoading) {
    return LoadingScreen;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Liquid Glass Background Effects */}
      {backgroundEffects}

      {/* Grid Pattern with Glass Effect */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <Header
        balance={user?.balance || 0}
        onViewChange={handleViewChange}
        currentView={currentView}
        onAddFunds={handleAddFunds}
        user={user}
        onShowLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />
      <main className="relative z-10 pt-32 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section - Only show on cases view */}
          {(currentView === 'cases' || currentView === 'opening') && (
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 overflow-hidden p-2">
                  <img
                    src="/download.webp"
                    alt="CleanCase Logo"
                    className="w-full h-full object-contain filter brightness-0 invert"
                    loading="eager"
                  />
                </div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent tracking-tight">
                  CleanCase
                </h1>
                <Sparkles className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
                Experience the pinnacle of CSGO case opening. Exclusive cases, authentic odds, unparalleled elegance.
              </p>
              <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span>Authentic CSGO Odds</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>CleanCase Certified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Superior Design</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs - Only show on main views */}
          {currentView !== 'opening' && currentView !== 'profile' && currentView !== 'settings' && currentView !== 'crypto' && currentView !== 'admin' && currentView !== 'steam' && (
            <div className="flex justify-center mb-12">
              <div className="flex space-x-2 p-2 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                <button
                  onClick={() => handleViewChange('cases')}
                  className={`w-55 px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-2 ${currentView === 'cases'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl shadow-orange-500/30 transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center overflow-hidden p-1">
                    <img
                      src="/download.webp"
                      alt="CleanCase Logo"
                      className="w-full h-full object-contain filter brightness-0 invert"
                      loading="lazy"
                    />
                  </div>
                  <span>Premium Cases</span>
                </button>
                <button
                  onClick={() => handleViewChange('inventory')}
                  className={`w-55 px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-2 ${currentView === 'inventory'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl shadow-orange-500/30 transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Inventory ({user?.inventory.length || 0})</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex justify-center">
            {currentView === 'cases' && (
              <CaseSelector
                cases={HomeCases}
                selectedCase={selectedCase}
                onSelectCase={handleSelectCase}
                HomeContainerRef={HomeContainerRef}
                isFetchingHome={isFetchingHome}
              />
            )}

            {currentView === 'opening' && selectedCase && user && (
              <CaseOpener
                selectedCase={selectedCase}
                balance={user.balance}
                onOpenCase={handleOpenCase}
                onBack={handleBackToCases}
                onSelectCase={handleSelectCase}
                HomeContainerRef={HomeContainerRef}
                isFetchingHome={isFetchingHome}
                cases={HomeCases}
              />
            )}

            {currentView === 'inventory' && user && (
              <Inventory
                items={user.inventory}
                onSellItem={handleSellItem}
              />
            )}

            {currentView === 'profile' && user && (
              <UserProfile
                user={user}
                onBack={() => handleViewChange('cases')}
              />
            )}

            {currentView === 'settings' && (
              <Settings
                onBack={() => handleViewChange('cases')}
                handleLogout={handleLogout}
              />
            )}

            {currentView === 'crypto' && user && (
              <CryptoWallet
                onBack={() => handleViewChange('cases')}
                userBalance={user.balance}
                FetchCurrencies={FetchCurrencies}
                onBalanceUpdate={handleBalanceUpdate}
                selectedCrypto={selectedCrypto}
                setSelectedCrypto={setSelectedCrypto}
                supportedCryptos={supportedCryptos}
                setSupportedCryptos={setSupportedCryptos}
              />
            )}

            {currentView === 'steam' && user && (
              <SteamIntegration
                onBack={() => handleViewChange('cases')}
                user={user}
                onUpdateUser={handleUpdateUser}
              />
            )}

            {currentView === 'admin' && user?.isAdmin && (
              <AdminPanel
                onBack={() => handleViewChange('cases')}
                cases={cases}
                AllCases={AllCases}
                fetchCases={fetchCases}
                caseResponse={caseResponse}
                onUpdateCases={handleUpdateCases}
                refCase={CaseContainerRef}
                nextPageCases={nextPageCases}
              />
            )}
          </div>
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}

      />

      {/* Liquid Glass Footer */}
      <footer className="relative z-10 border-t border-white/10 glass-morphism">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden p-1.5 animate-glow-pulse">
                <img
                  src="/download.webp"
                  alt="CleanCase Logo"
                  className="w-full h-full object-contain filter brightness-0 invert"
                  loading="lazy"
                />
              </div>
              <div>
                <span className="text-white font-bold">CleanCase</span>
                <p className="text-xs text-orange-400">Premium CSGO Experience</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-300">© 2025 CleanCase. Excellence Redefined.</p>
              <p className="text-xs bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent font-semibold">
                Authentic • Exclusive • Elegant
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;