import React, { useState } from 'react';
import { ArrowLeft, Settings, Package, Users, BarChart3, Star, Plus, Edit, Trash2, Save, X, Target, Search, Filter, UserCheck, UserX, Crown, Shield, Calendar, TrendingUp, TrendingDown, DollarSign, Eye, Ban, Wallet, Mail, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { CSGOCase, CSGOItem, User } from '../../types';
import ItemCard from '../ItemCard';
import WeaponManager from './WeaponManager';

interface AdminPanelProps {
  onBack: () => void;
  cases: CSGOCase[];
  onUpdateCases: (cases: CSGOCase[]) => void;
}

// Mock user data for demonstration
const mockUsers = [
  {
    id: '1',
    username: 'SkinHunter2024',
    email: 'skinhunter@example.com',
    balance: 1250.75,
    totalOpened: 45,
    level: 12,
    joinDate: new Date('2024-01-15'),
    lastLogin: new Date('2024-12-15'),
    isAdmin: false,
    status: 'active',
    totalSpent: 2340.50,
    totalWon: 1890.25,
    inventoryValue: 3200.80,
    ipAddress: '192.168.1.100',
    country: 'United States',
    verified: true,
    twoFactorEnabled: false
  },
  {
    id: '2',
    username: 'ProGamer_Mike',
    email: 'mike@example.com',
    balance: 89.30,
    totalOpened: 23,
    level: 8,
    joinDate: new Date('2024-02-20'),
    lastLogin: new Date('2024-12-14'),
    isAdmin: false,
    status: 'active',
    totalSpent: 1150.00,
    totalWon: 980.50,
    inventoryValue: 1450.75,
    ipAddress: '10.0.0.50',
    country: 'Canada',
    verified: true,
    twoFactorEnabled: true
  },
  {
    id: '3',
    username: 'CaseKing_77',
    email: 'caseking@example.com',
    balance: 2890.45,
    totalOpened: 156,
    level: 25,
    joinDate: new Date('2023-11-10'),
    lastLogin: new Date('2024-12-15'),
    isAdmin: false,
    status: 'active',
    totalSpent: 8750.00,
    totalWon: 7200.30,
    inventoryValue: 12500.90,
    ipAddress: '172.16.0.25',
    country: 'United Kingdom',
    verified: true,
    twoFactorEnabled: true
  },
  {
    id: '4',
    username: 'LuckyShot_99',
    email: 'lucky@example.com',
    balance: 45.20,
    totalOpened: 8,
    level: 3,
    joinDate: new Date('2024-12-01'),
    lastLogin: new Date('2024-12-13'),
    isAdmin: false,
    status: 'active',
    totalSpent: 320.00,
    totalWon: 280.75,
    inventoryValue: 450.30,
    ipAddress: '203.0.113.15',
    country: 'Australia',
    verified: false,
    twoFactorEnabled: false
  },
  {
    id: '5',
    username: 'BannedUser123',
    email: 'banned@example.com',
    balance: 0.00,
    totalOpened: 12,
    level: 5,
    joinDate: new Date('2024-10-15'),
    lastLogin: new Date('2024-11-20'),
    isAdmin: false,
    status: 'banned',
    totalSpent: 500.00,
    totalWon: 150.00,
    inventoryValue: 0.00,
    ipAddress: '198.51.100.42',
    country: 'Germany',
    verified: false,
    twoFactorEnabled: false
  }
];

// Mock analytics data
const mockAnalytics = {
  totalRevenue: 125750.80,
  totalUsers: 1247,
  activeUsers: 892,
  totalCasesOpened: 8934,
  averageSpendPerUser: 89.50,
  conversionRate: 12.5,
  revenueGrowth: 15.8,
  userGrowth: 8.3,
  dailyStats: [
    { date: '2024-12-09', revenue: 2340.50, users: 45, casesOpened: 156 },
    { date: '2024-12-10', revenue: 2890.75, users: 52, casesOpened: 189 },
    { date: '2024-12-11', revenue: 3120.30, users: 48, casesOpened: 203 },
    { date: '2024-12-12', revenue: 2750.90, users: 41, casesOpened: 178 },
    { date: '2024-12-13', revenue: 3450.20, users: 58, casesOpened: 234 },
    { date: '2024-12-14', revenue: 4120.80, users: 67, casesOpened: 289 },
    { date: '2024-12-15', revenue: 3890.45, users: 61, casesOpened: 267 }
  ],
  topSpenders: [
    { username: 'CaseKing_77', totalSpent: 8750.00 },
    { username: 'WhalePlayer', totalSpent: 6890.50 },
    { username: 'HighRoller88', totalSpent: 5430.75 },
    { username: 'SkinCollector', totalSpent: 4920.30 },
    { username: 'LegendaryHunter', totalSpent: 4150.80 }
  ],
  popularCases: [
    { name: 'Spectrum Case', opens: 2340, revenue: 5850.00 },
    { name: 'Chroma Case', opens: 1890, revenue: 5197.50 },
    { name: 'Revolution Case', opens: 1560, revenue: 7800.00 },
    { name: 'Prisma Case', opens: 1234, revenue: 5553.00 },
    { name: 'Operation Hydra Case', opens: 987, revenue: 3207.75 }
  ]
};

export default function AdminPanel({ onBack, cases, onUpdateCases }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'cases' | 'weapons' | 'users' | 'analytics'>('cases');
  const [selectedCase, setSelectedCase] = useState<CSGOCase | null>(null);
  const [editingItem, setEditingItem] = useState<CSGOItem | null>(null);
  const [showAddCase, setShowAddCase] = useState(false);
  const [showWeaponManager, setShowWeaponManager] = useState(false);
  
  // User management states
  const [users, setUsers] = useState(mockUsers);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'banned' | 'verified' | 'unverified'>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [addFundsReason, setAddFundsReason] = useState('');
  
  // Edit user form
  const [editUserForm, setEditUserForm] = useState({
    username: '',
    email: '',
    level: 1,
    verified: false,
    twoFactorEnabled: false
  });

  // Form states
  const [caseForm, setCaseForm] = useState({
    name: '',
    price: '',
    image: '',
    isActive: true
  });

  const [itemForm, setItemForm] = useState({
    name: '',
    rarity: 'common' as CSGOItem['rarity'],
    price: '',
    image: '',
    probability: ''
  });

  const resetCaseForm = () => {
    setCaseForm({ name: '', price: '', image: '', isActive: true });
  };

  const resetItemForm = () => {
    setItemForm({ name: '', rarity: 'common', price: '', image: '', probability: '' });
  };

  const handleSaveCase = () => {
    const price = parseFloat(caseForm.price);
    
    if (!caseForm.name.trim()) {
      alert('Please enter a case name');
      return;
    }
    
    if (!caseForm.image.trim()) {
      alert('Please enter an image URL');
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const newCase: CSGOCase = {
      id: `case-${Date.now()}`,
      name: caseForm.name.trim(),
      price: price,
      image: caseForm.image.trim(),
      items: [],
      isActive: caseForm.isActive
    };

    onUpdateCases([...cases, newCase]);
    resetCaseForm();
    setShowAddCase(false);
  };

  const handleDeleteCase = (caseId: string) => {
    if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) return;
    
    onUpdateCases(cases.filter(c => c.id !== caseId));
    
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(null);
    }
  };

  const handleSelectWeaponsForCase = (weapons: CSGOItem[]) => {
    if (!selectedCase) return;

    const updatedCases = cases.map(c => 
      c.id === selectedCase.id 
        ? { ...c, items: weapons }
        : c
    );

    onUpdateCases(updatedCases);
    
    const updatedSelectedCase = updatedCases.find(c => c.id === selectedCase.id);
    if (updatedSelectedCase) {
      setSelectedCase(updatedSelectedCase);
    }
  };

  // User management functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    let matchesFilter = true;
    
    switch (userFilter) {
      case 'active':
        matchesFilter = user.status === 'active';
        break;
      case 'banned':
        matchesFilter = user.status === 'banned';
        break;
      case 'verified':
        matchesFilter = user.verified;
        break;
      case 'unverified':
        matchesFilter = !user.verified;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const handleUserAction = (userId: string, action: 'ban' | 'unban' | 'makeAdmin' | 'removeAdmin' | 'view' | 'edit' | 'addFunds' | 'verify' | 'unverify') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (action === 'view') {
      setSelectedUser(user);
      setShowUserModal(true);
      return;
    }

    if (action === 'edit') {
      setSelectedUser(user);
      setEditUserForm({
        username: user.username,
        email: user.email,
        level: user.level,
        verified: user.verified,
        twoFactorEnabled: user.twoFactorEnabled
      });
      setShowEditUserModal(true);
      return;
    }

    if (action === 'addFunds') {
      setSelectedUser(user);
      setAddFundsAmount('');
      setAddFundsReason('');
      setShowAddFundsModal(true);
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        switch (action) {
          case 'ban':
            return { ...u, status: 'banned' };
          case 'unban':
            return { ...u, status: 'active' };
          case 'makeAdmin':
            return { ...u, isAdmin: true };
          case 'removeAdmin':
            return { ...u, isAdmin: false };
          case 'verify':
            return { ...u, verified: true };
          case 'unverify':
            return { ...u, verified: false };
          default:
            return u;
        }
      }
      return u;
    }));
  };

  const handleAddFunds = () => {
    const amount = parseFloat(addFundsAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!addFundsReason.trim()) {
      alert('Please provide a reason for adding funds');
      return;
    }

    setUsers(prev => prev.map(user => 
      user.id === selectedUser.id 
        ? { ...user, balance: user.balance + amount }
        : user
    ));

    // Log the transaction (in a real app, this would go to a database)
    console.log(`Admin added $${amount} to ${selectedUser.username}. Reason: ${addFundsReason}`);
    
    setShowAddFundsModal(false);
    setAddFundsAmount('');
    setAddFundsReason('');
    setSelectedUser(null);
  };

  const handleEditUser = () => {
    if (!editUserForm.username.trim() || !editUserForm.email.trim()) {
      alert('Username and email are required');
      return;
    }

    setUsers(prev => prev.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            username: editUserForm.username.trim(),
            email: editUserForm.email.trim(),
            level: editUserForm.level,
            verified: editUserForm.verified,
            twoFactorEnabled: editUserForm.twoFactorEnabled
          }
        : user
    ));

    setShowEditUserModal(false);
    setSelectedUser(null);
  };

  const totalItems = cases.reduce((sum, c) => sum + c.items.length, 0);
  const totalValue = cases.reduce((sum, c) => sum + c.items.reduce((itemSum, item) => itemSum + item.price, 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto">
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
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center shadow-2xl shadow-red-500/30">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          <p className="text-sm text-red-400 font-medium tracking-wide">CleanCase Management</p>
        </div>
        
        <div className="w-32" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2 p-2 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          {[
            { key: 'cases', name: 'Cases', icon: Package },
            { key: 'weapons', name: 'Weapons', icon: Target },
            { key: 'users', name: 'Users', icon: Users },
            { key: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map(({ key, name, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-2 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-2xl shadow-red-500/30 transform scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cases Management */}
      {activeTab === 'cases' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl text-center">
              <div className="text-2xl font-bold text-white mb-1">{cases.length}</div>
              <div className="text-sm text-gray-400">Total Cases</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{cases.filter(c => c.isActive !== false).length}</div>
              <div className="text-sm text-green-300">Active Cases</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{totalItems}</div>
              <div className="text-sm text-blue-300">Total Items</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">${totalValue.toFixed(0)}</div>
              <div className="text-sm text-purple-300">Total Value</div>
            </div>
          </div>

          {/* Add Case Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Manage Cases</h3>
            <button
              onClick={() => setShowAddCase(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-2 shadow-xl hover:shadow-2xl"
            >
              <Plus className="w-5 h-5" />
              <span>Add Case</span>
            </button>
          </div>

          {/* Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem) => (
              <div key={caseItem.id} className="p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold text-lg truncate">{caseItem.name}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCase(caseItem);
                        setShowWeaponManager(true);
                      }}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors duration-300"
                      title="Manage Items"
                    >
                      <Target className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCase(caseItem.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors duration-300"
                      title="Delete Case"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <img
                  src={caseItem.image}
                  alt={caseItem.name}
                  className="w-full h-32 object-cover rounded-xl mb-4"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-orange-400 font-bold">${caseItem.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Items:</span>
                    <span className="text-white">{caseItem.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={caseItem.isActive !== false ? 'text-green-400' : 'text-red-400'}>
                      {caseItem.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weapons Management */}
      {activeTab === 'weapons' && (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">CSGO Weapons Database</h3>
            <p className="text-gray-400">Comprehensive collection of CSGO weapons and skins with authentic rarities and probabilities</p>
          </div>
          
          <WeaponManager 
            onSelectWeapons={() => {}} 
            selectedWeapons={[]} 
          />
        </div>
      )}

      {/* Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-8">
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl text-center">
              <div className="text-2xl font-bold text-white mb-1">{users.length}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{users.filter(u => u.status === 'active').length}</div>
              <div className="text-sm text-green-300">Active Users</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md border border-red-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">{users.filter(u => u.status === 'banned').length}</div>
              <div className="text-sm text-red-300">Banned Users</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{users.filter(u => u.verified).length}</div>
              <div className="text-sm text-blue-300">Verified Users</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">{users.filter(u => u.isAdmin).length}</div>
              <div className="text-sm text-purple-300">Admins</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="flex items-center space-x-2 flex-1 min-w-64">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-orange-400/50"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">User</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Balance</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Cases Opened</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Total Spent</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Last Login</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-white/10 hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            {user.isAdmin ? <Crown className="w-4 h-4 text-white" /> : <Users className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-semibold">{user.username}</span>
                              {user.verified && <CheckCircle className="w-4 h-4 text-green-400" />}
                            </div>
                            <div className="text-gray-400 text-sm">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {user.status === 'active' ? (
                            <UserCheck className="w-4 h-4 text-green-400" />
                          ) : (
                            <UserX className="w-4 h-4 text-red-400" />
                          )}
                          <span className={user.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                            {user.status}
                          </span>
                          {user.isAdmin && (
                            <div className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                              ADMIN
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-mono">${user.balance.toFixed(2)}</td>
                      <td className="px-6 py-4 text-white">{user.totalOpened}</td>
                      <td className="px-6 py-4 text-orange-400 font-mono">${user.totalSpent.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{user.lastLogin.toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUserAction(user.id, 'view')}
                            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors duration-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'edit')}
                            className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-colors duration-300"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'addFunds')}
                            className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors duration-300"
                            title="Add Funds"
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'ban')}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors duration-300"
                              title="Ban User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, 'unban')}
                              className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors duration-300"
                              title="Unban User"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          {!user.isAdmin ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'makeAdmin')}
                              className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors duration-300"
                              title="Make Admin"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, 'removeAdmin')}
                              className="p-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 transition-colors duration-300"
                              title="Remove Admin"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-400/30 shadow-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">${mockAnalytics.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-green-300">Total Revenue</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">+{mockAnalytics.revenueGrowth}%</span>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-400/30 shadow-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">{mockAnalytics.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-blue-300">Total Users</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-blue-400 text-sm">+{mockAnalytics.userGrowth}%</span>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-400/30 shadow-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400 mb-1">{mockAnalytics.totalCasesOpened.toLocaleString()}</div>
              <div className="text-sm text-purple-300">Cases Opened</div>
              <div className="text-purple-300 text-sm mt-2">This Month</div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md border border-orange-400/30 shadow-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-400 mb-1">{mockAnalytics.conversionRate}%</div>
              <div className="text-sm text-orange-300">Conversion Rate</div>
              <div className="text-orange-300 text-sm mt-2">Avg. ${mockAnalytics.averageSpendPerUser}</div>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              <span>Daily Revenue (Last 7 Days)</span>
            </h3>
            <div className="space-y-4">
              {mockAnalytics.dailyStats.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="text-white font-semibold">{new Date(day.date).toLocaleDateString()}</div>
                    <div className="text-gray-400">{day.users} users</div>
                    <div className="text-gray-400">{day.casesOpened} cases</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        style={{ width: `${(day.revenue / 5000) * 100}%` }}
                      />
                    </div>
                    <div className="text-green-400 font-bold">${day.revenue.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Spenders and Popular Cases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Spenders */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span>Top Spenders</span>
              </h3>
              <div className="space-y-3">
                {mockAnalytics.topSpenders.map((spender, index) => (
                  <div key={spender.username} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-white font-semibold">{spender.username}</span>
                    </div>
                    <span className="text-yellow-400 font-bold">${spender.totalSpent.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Cases */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-400" />
                <span>Popular Cases</span>
              </h3>
              <div className="space-y-3">
                {mockAnalytics.popularCases.map((caseData, index) => (
                  <div key={caseData.name} className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{caseData.name}</span>
                      <span className="text-blue-400 font-bold">${caseData.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{caseData.opens} opens</span>
                      <div className="w-24 bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-1 rounded-full"
                          style={{ width: `${(caseData.opens / 2500) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Case Modal */}
      {showAddCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Add New Case</h3>
                <button
                  onClick={() => {
                    setShowAddCase(false);
                    resetCaseForm();
                  }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Case Name *</label>
                  <input
                    type="text"
                    value={caseForm.name}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                    placeholder="Enter case name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={caseForm.price}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Image URL *</label>
                  <input
                    type="url"
                    value={caseForm.image}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={caseForm.isActive}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 bg-white/10 border-white/20 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isActive" className="text-white">Active Case</label>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleSaveCase}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Case</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddCase(false);
                    resetCaseForm();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl mx-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Username</label>
                    <div className="text-white font-semibold">{selectedUser.username}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <div className="text-white">{selectedUser.email}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div className={selectedUser.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                      {selectedUser.status}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Level</label>
                    <div className="text-white">{selectedUser.level}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Verified</label>
                    <div className={selectedUser.verified ? 'text-green-400' : 'text-red-400'}>
                      {selectedUser.verified ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Current Balance</label>
                    <div className="text-green-400 font-bold">${selectedUser.balance.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Total Spent</label>
                    <div className="text-orange-400 font-bold">${selectedUser.totalSpent.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Total Won</label>
                    <div className="text-blue-400 font-bold">${selectedUser.totalWon.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Inventory Value</label>
                    <div className="text-purple-400 font-bold">${selectedUser.inventoryValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Cases Opened</label>
                    <div className="text-white">{selectedUser.totalOpened}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Join Date</label>
                    <div className="text-white">{selectedUser.joinDate.toLocaleDateString()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Last Login</label>
                    <div className="text-white">{selectedUser.lastLogin.toLocaleDateString()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">IP Address</label>
                    <div className="text-white font-mono">{selectedUser.ipAddress}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Country</label>
                    <div className="text-white">{selectedUser.country}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">2FA Enabled</label>
                    <div className={selectedUser.twoFactorEnabled ? 'text-green-400' : 'text-red-400'}>
                      {selectedUser.twoFactorEnabled ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Wallet className="w-6 h-6 text-green-400" />
                  <span>Add Funds</span>
                </h3>
                <button
                  onClick={() => setShowAddFundsModal(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="mb-6 p-4 rounded-2xl bg-blue-500/20 border border-blue-400/30">
                <div className="text-center">
                  <p className="text-blue-400 font-semibold">Adding funds to:</p>
                  <p className="text-white text-lg font-bold">{selectedUser.username}</p>
                  <p className="text-gray-400 text-sm">Current Balance: ${selectedUser.balance.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400/50"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Reason *</label>
                  <textarea
                    value={addFundsReason}
                    onChange={(e) => setAddFundsReason(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400/50 h-24 resize-none"
                    placeholder="Enter reason for adding funds (e.g., compensation, bonus, etc.)"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-yellow-500/20 border border-yellow-400/30">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-semibold mb-1">Important:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• This action will be logged for audit purposes</li>
                      <li>• Funds will be added immediately to user's balance</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleAddFunds}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Add Funds</span>
                </button>
                <button
                  onClick={() => setShowAddFundsModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Edit className="w-6 h-6 text-yellow-400" />
                  <span>Edit User</span>
                </h3>
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username *</label>
                  <input
                    type="text"
                    value={editUserForm.username}
                    onChange={(e) => setEditUserForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email *</label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Level</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editUserForm.level}
                    onChange={(e) => setEditUserForm(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={editUserForm.verified}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, verified: e.target.checked }))}
                      className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500"
                    />
                    <label htmlFor="verified" className="text-white">Verified Account</label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="twoFactor"
                      checked={editUserForm.twoFactorEnabled}
                      onChange={(e) => setEditUserForm(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="twoFactor" className="text-white">Two-Factor Authentication</label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleEditUser}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weapon Manager Modal */}
      {showWeaponManager && selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-7xl mx-4 h-[90vh] rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Target className="w-6 h-6 text-orange-400" />
                  <span>Manage Items: {selectedCase.name}</span>
                </h3>
                <button
                  onClick={() => {
                    setShowWeaponManager(false);
                    setSelectedCase(null);
                  }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 h-full overflow-hidden">
              <WeaponManager 
                onSelectWeapons={handleSelectWeaponsForCase}
                selectedWeapons={selectedCase.items}
              />
            </div>
          </div>
        </div>
      )}

      {/* CleanCase Branding Footer */}
      <div className="text-center pt-8 mt-12 border-t border-white/10">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <Settings className="w-2 h-2 text-white" />
          </div>
          <span className="text-sm font-bold text-red-400">CleanCase Admin</span>
          <Star className="w-4 h-4 text-red-400" />
        </div>
        <p className="text-xs text-gray-400">Administrative Control Panel</p>
      </div>
    </div>
  );
}