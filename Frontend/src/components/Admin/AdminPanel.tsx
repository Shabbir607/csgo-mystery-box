import React, { useEffect, useState } from 'react';
import { ArrowLeft, Settings, Package, Users, BarChart3, Star, Plus, Edit, Trash2, Save, X, Target, Search, Filter, UserCheck, UserX, Crown, Shield, Calendar, TrendingUp, TrendingDown, DollarSign, Eye, Ban, Wallet, Mail, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { CSGOCase, CSGOItem, User } from '../../types';
import ItemCard from '../ItemCard';
import WeaponManager from './WeaponManager';
import axios from 'axios';
import { showSuccess } from '../../toast';
import { toast } from 'react-toastify';
import { useToast } from '../ToastContext';

interface AdminPanelProps {
  onBack: () => void;
  cases: CSGOCase[];
  AllCases: CSGOCase[];
  onUpdateCases: (cases: CSGOCase[]) => void;
}

export default function AdminPanel({ onBack, cases, onUpdateCases, caseResponse, AllCases, fetchCases, refCase, nextPageCases }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'cases' | 'weapons' | 'users' | 'analytics'>('cases');
  const [selectedCase, setSelectedCase] = useState<CSGOCase | null>(null);
  const [editingItem, setEditingItem] = useState<CSGOItem | null>(null);
  const [showAddCase, setShowAddCase] = useState(false);
  const [showWeaponManager, setShowWeaponManager] = useState(false);

  // User management states
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'banned' | 'verified' | 'unverified'>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [addFundsReason, setAddFundsReason] = useState('');
  const [isFetchingCase, setIsFetchingCase] = useState(false);
  const [AnalyticsData, setAnalyticsData] = useState(null);
  console.log("AnalyticsData", AnalyticsData)

  const { showToast } = useToast();

  const [allUsers, setAllUsers] = useState<any[]>([]);
  console.log("All Users", allUsers)
  console.log("View User", selectedUser)

  useEffect(() => {
    const handleScroll = () => {
      const container = refCase.current;
      if (!container || isFetchingCase || !nextPageCases) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setIsFetchingCase(true);
        fetchCases(nextPageCases, true).finally(() => setIsFetchingCase(false));
      }
    };

    const container = refCase.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [nextPageCases, isFetchingCase]);

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
    market_hash_name: '',
    description: '',
    image: '',
    status: 'active',
    price: null,
    rental: false,
  });

  const [itemForm, setItemForm] = useState({
    name: '',
    rarity: 'common' as CSGOItem['rarity'],
    price: '',
    image: '',
    probability: ''
  });

  const resetCaseForm = () => {
    setCaseForm({
      name: '',
      market_hash_name: '',
      description: '',
      image: '',
      status: 'active',
      price: null,
      rental: false,
    });
  };

  const resetItemForm = () => {
    setItemForm({ name: '', rarity: 'common', price: '', image: '', probability: '' });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = sessionStorage.getItem('auth_token');

    if (!token) {
      showToast("Auth Token not Found", "info");
      return;
    }

    try {
      const response = await axios.get('https://production.gameonha.com/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Analytics Response:', response);
      setAnalyticsData(response?.data);

    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to fetch Analytics. Please Try Again.';

      console.error('Failed to fetch Analytics:', message);
      showToast(message, "error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = sessionStorage.getItem('auth_token');

    if (!token) {
      showToast("Auth Token not Found", "info");
      return;
    }

    try {
      const response = await axios.get('https://production.gameonha.com/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response);
      setAllUsers(response?.data?.users?.data);

    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to Fetch users. Please Try Again.';

      console.error('Failed to fetch users:', message);
      showToast(message, "error");
    }
  };

  const handleSaveCase = async () => {
    if (!caseForm.name.trim()) {
      showToast("Please Enter a Case Name", "info");
      return;
    }

    if (!caseForm.image.trim()) {
      showToast("Please Enter an image URL", "info");
      return;
    }

    if (caseForm.price !== null && (isNaN(caseForm.price) || caseForm.price < 0)) {
      showToast("Please Enter a valid Price", "info");
      return;
    }

    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      showToast("Auth Token not Found", "info");
      return;
    }

    try {
      const response = await fetch("https://production.gameonha.com/api/admin/crates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: caseForm.name.trim(),
          market_hash_name: caseForm.market_hash_name?.trim() || caseForm.name.trim(),
          description: caseForm.description?.trim() || null,
          image: caseForm.image.trim(),
          price: caseForm.price,
          rental: caseForm.rental ?? 0,
          status: caseForm.status || "inactive",
          type: "Case"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API error:", data);
        showToast("Failed to Save Case", "error");
        return;
      }

      showToast("Case Create Successfully!", "success");
      resetCaseForm();
      setShowAddCase(false);
      fetchCases();
    } catch (error) {
      console.error("Error saving case:", error);
      showToast("Something went wrong While saving the Case.", "error");
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    const token = sessionStorage.getItem('auth_token');
    const baseURL = 'https://production.gameonha.com';

    if (!token) {
      showToast("Auth Token not Found", "info");
      return;
    }

    try {
      await axios.delete(`${baseURL}/api/admin/crates/${caseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCases();
      showToast('Case Deleted Successfully.', "success");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to delete the case.';
      console.error('Delete error:', message);
      showToast(message, "error");
    }
  };

  const handleSelectWeaponsForCase = (weapons: CSGOItem[]) => {
    if (!selectedCase) return;

    const updatedCases = AllCases?.map(c =>
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
  const filteredUsers = allUsers.filter(user => {
    const searchTerm = userSearchTerm.toLowerCase();

    const name = user.name?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';

    const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);

    let matchesFilter = true;

    switch (userFilter) {
      case 'active':
        matchesFilter = user.status === 'active';
        break;
      case 'banned':
        matchesFilter = user.status === 'banned';
        break;
      case 'verified':
        matchesFilter = user.is_verified === true;
        break;
      case 'unverified':
        matchesFilter = user.is_verified === false;
        break;
      default:
        matchesFilter = true;
    }
    return matchesSearch && matchesFilter;
  });

  const handleUserAction = async (
    userId: string,
    action: 'ban' | 'unban' | 'makeAdmin' | 'removeAdmin' | 'view' | 'edit' | 'addFunds' | 'verify' | 'unverify'
  ) => {
    const user = allUsers?.find(u => u.id === userId);
    if (!user) return;

    if (action === 'view') {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        showToast("Auth Token not Found", "info");
        return;
      }

      try {
        const response = await axios.get(`https://production.gameonha.com/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSelectedUser(response.data);
        setShowUserModal(true);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        showToast('Failed to load user Details. Please Try Again.', "error");
      }

      return;
    }

    if (action === 'edit') {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        showToast("Auth Token not Found", "info");
        return;
      }

      try {
        const response = await axios.get(`https://production.gameonha.com/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response?.data?.user;
        setSelectedUser(userData);

        setEditUserForm({
          username: userData.name || '',
          email: userData.email || '',
          level: userData.details?.level || 0,
          verified: userData?.is_verified || false,
          twoFactorEnabled: userData?.two_factor_enabled || false,
        });

        setShowEditUserModal(true);
      } catch (error) {
        console.error('Failed to load User for Editing:', error);
        showToast('Failed to load User. Please Try Again.', "error");
      }
      return;
    }

    if (action === 'addFunds') {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        showToast("Auth Token not Found", "info");
        return;
      }

      try {
        const response = await axios.get(`https://production.gameonha.com/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        const userData = response?.data?.user;

        setSelectedUser({
          id: userData?.id,
          username: userData?.name,
          email: userData?.email,
          balance: parseFloat(userData?.details?.balance || '0'),
        });

        setAddFundsAmount('');
        setAddFundsReason('');
        setShowAddFundsModal(true);
      } catch (error) {
        console.error('Failed to Fetch User for Adding Funds:', error);
        showToast('Failed to load User. Please Try Again.', "error");
      }
      return;
    }

    if (action === 'makeAdmin') {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        showToast("Auth Token not Found", "info");
        return;
      }

      try {
        await axios.put(`https://production.gameonha.com/api/admin/users/${userId}/make-admin`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        fetchUsers();
        showToast('User successfully made Admin.', "success");
      } catch (error) {
        console.error('Failed to make Admin:', error);
        showToast('Failed to make Admin. Please Try Again.', "error");
      }
      return;
    }

    if (action === 'removeAdmin') {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        showToast("Auth Token not Found", "info");
        return;
      }

      try {
        await axios.put(`https://production.gameonha.com/api/admin/users/${userId}/unmake-admin`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        fetchUsers();
        showToast('User successfully Remove From Admin.', "success");
      } catch (error) {
        console.error('Failed to make admin:', error);
        showToast('Failed to UnMake Admin. Please Try Again.', "error");
      }
      return;
    }

    if (action === 'ban' || action === 'unban') {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        showToast("Auth Token not Found", "info");
        return;
      }

      const newStatus = action === 'ban' ? 'banned' : 'active';

      try {
        await axios.post(
          `https://production.gameonha.com/api/admin/users/${userId}`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        fetchUsers();
        showToast(`User status updated to ${newStatus}`, "success");
      } catch (error) {
        console.error(`Failed to update status to ${newStatus}:`, error);
        showToast('Failed to Update user status. Please, Try Again.', "error");
      }
      return;
    }

  };

  const handleAddFunds = async () => {
    const amount = parseFloat(addFundsAmount);

    if (isNaN(amount) || amount <= 0) {
      showToast("Please Enter a valid Amount", "info");
      return;
    }

    const token = sessionStorage.getItem('auth_token');
    if (!token) {
      showToast("Auth Token not Found", "info");
      return;
    }

    const userId = selectedUser?.id;
    if (!userId) return;

    try {
      const response = await axios.patch(
        `https://production.gameonha.com/api/admin/users/${userId}/add-funds`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      console.log(response)
      fetchUsers();
      showToast('Funds Added Successfully!', "success");

      setShowAddFundsModal(false);
      setAddFundsAmount('');
      setAddFundsReason('');
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Failed to Add Funds:', error?.response?.data || error);
      showToast('Failed to Add funds. Please Try Again.', "error");
    }
  };

  const handleEditUser = async () => {
    if (!editUserForm.username.trim() || !editUserForm.email.trim()) {
      showToast('Username and Email are Required', "info");
      return;
    }

    const token = sessionStorage.getItem('auth_token');
    if (!token) {
       showToast("Auth Token not Found", "info");
      return;
    }

    const payload = {
      name: editUserForm.username.trim(),
      email: editUserForm.email.trim(),
      is_verified: editUserForm.verified,
      two_factor_enabled: editUserForm.twoFactorEnabled,
      level: editUserForm.level,
    };

    try {
      const res = await axios.post(
        `https://production.gameonha.com/api/admin/users/${selectedUser?.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      console.log("Update response:", res.data);
      fetchUsers();
      showToast('User Updated Successfully!', "success");
      setShowEditUserModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('User Update Failed:', error?.response?.data || error);
      showToast('Failed to Update User. Please Try Again.', "error");
    }
  };

  const totalItems = AllCases?.reduce((sum, c) => sum + (c.items?.length || 0), 0);

  const totalValue = AllCases?.reduce((sum, c) => {
    const itemsValue = c.items?.reduce((itemSum, item) => {
      const price = typeof item.price === "number" ? item.price : parseFloat(item.price);
      return itemSum + (!isNaN(price) ? price : 0);
    }, 0);
    return sum + (itemsValue || 0);
  }, 0);

  const formattedTotal = totalValue?.toFixed(2);

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
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center space-x-2 ${activeTab === key
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
              <div className="text-2xl font-bold text-white mb-1">{AllCases?.length}</div>
              <div className="text-sm text-gray-400">Total Cases</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {AllCases?.filter(c => c?.status === "active").length}
              </div>
              <div className="text-sm text-green-300">Active Cases</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{totalItems}</div>
              <div className="text-sm text-blue-300">Total Items</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">${formattedTotal}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[32rem] overflow-y-auto scrollbar-hide" ref={refCase}>
            {AllCases?.map((caseItem) => (
              <div key={caseItem.id} className="p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold text-lg truncate">{caseItem?.name}</h4>
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
                  src={caseItem?.image}
                  alt={caseItem?.name}
                  className="w-full h-32 object-cover rounded-xl mb-4"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-orange-400 font-bold">
                      ${
                        !isNaN(parseFloat(caseItem?.price)) && isFinite(caseItem.price)
                          ? parseFloat(caseItem?.price).toFixed(2)
                          : "0.00"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Items:</span>
                    <span className="text-white">{caseItem.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={caseItem?.status === "active" ? 'text-green-400' : 'text-red-400'}>
                      {caseItem.status === "active" ? 'Active' : 'InActive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isFetchingCase && (
            <div className="flex justify-center mt-4 space-x-1">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0s]"></div>
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.1s]"></div>
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.4s]"></div>
            </div>
          )}
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
            onSelectWeapons={() => { }}
            selectedWeapons={[]}
            selectedCase={selectedCase}
            setSelectedCase={setSelectedCase}
          />
        </div>
      )}

      {/* Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-8">
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl text-center">
              <div className="text-2xl font-bold text-white mb-1">{allUsers.length}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{allUsers?.filter(u => u.status === 'active').length}</div>
              <div className="text-sm text-green-300">Active Users</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md border border-red-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">{allUsers.filter(u => u.status === 'banned').length}</div>
              <div className="text-sm text-red-300">Banned Users</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{allUsers.filter(u => u.is_verified).length}</div>
              <div className="text-sm text-blue-300">Verified Users</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-400/30 shadow-xl text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">{allUsers.filter(u => u.role?.name === 'admin').length}</div>
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
            <div className="relative">
              <div className="flex items-center space-x-3 bg-white/5 border border-white/20 rounded-xl px-4 py-2 backdrop-blur-md shadow-xl hover:border-orange-400/50 transition duration-200">
                <Filter className="w-4 h-4 text-gray-300" />
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value as any)}
                  className="bg-transparent text-white font-medium text-sm appearance-none pr-6 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="text-sm text-white bg-gray-800">
                    All Users
                  </option>
                  <option value="active" className="text-sm text-green-400 bg-gray-800">
                    ✅ Active Users
                  </option>
                  <option value="banned" className="text-sm text-red-400 bg-gray-800">
                    🔒 Banned Users
                  </option>
                  <option value="verified" className="text-sm text-blue-400 bg-gray-800">
                    ☑️ Verified Users
                  </option>
                  <option value="unverified" className="text-sm text-yellow-300 bg-gray-800">
                    ⚠️ Unverified Users
                  </option>
                </select>
              </div>

              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-xs">
                ▼
              </div>
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
                  {filteredUsers?.map((user) => {
                    const balance = parseFloat(user.details?.balance ?? '0');
                    const totalSpent = parseFloat(user.details?.total_spent ?? '0');
                    const lastLogin = user.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A';
                    const totalOpened = user.details?.cases_opened ?? 0;

                    return (
                      <tr key={user.id} className="border-t border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                              {user.role?.name === 'admin' ? <Crown className="w-4 h-4 text-white" /> : <Users className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-semibold">{user?.name}</span>
                                {user?.is_verified && <CheckCircle className="w-4 h-4 text-green-400" />}
                              </div>
                              <div className="text-gray-400 text-sm">{user?.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {user?.status === "active" ? (
                              <UserCheck className="w-4 h-4 text-green-400" />
                            ) : (
                              <UserX className="w-4 h-4 text-red-400" />
                            )}
                            <span className={user?.status === "active" ? 'text-green-400' : 'text-red-400'}>
                              {user?.status}
                            </span>
                            {user.role?.name === 'admin' && (
                              <div className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                                ADMIN
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-white font-mono">${balance.toFixed(2)}</td>
                        <td className="px-6 py-4 text-white">{totalOpened}</td>
                        <td className="px-6 py-4 text-orange-400 font-mono">${totalSpent.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{lastLogin}</td>

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
                            {user.role?.name !== 'admin' ? (
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
                    );
                  })}
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
              <div className="text-2xl font-bold text-green-400 mb-1">
                ${AnalyticsData?.total_revenue?.toLocaleString() ?? 'Loading...'}
              </div>
              <div className="text-sm text-green-300">Total Revenue</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">+{AnalyticsData?.revenue_growth}%</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-400/30 shadow-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">{AnalyticsData?.total_users.toLocaleString()}</div>
              <div className="text-sm text-blue-300">Total Users</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-blue-400 text-sm">
                  +{AnalyticsData.user_growth}%</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-400/30 shadow-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400 mb-1">{AnalyticsData?.cases_opened_this_month.toLocaleString()}</div>
              <div className="text-sm text-purple-300">Cases Opened</div>
              <div className="text-purple-300 text-sm mt-2">This Month</div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md border border-orange-400/30 shadow-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-400 mb-1">{AnalyticsData?.conversion_rate}%</div>
              <div className="text-sm text-orange-300">Conversion Rate</div>
              <div className="text-orange-300 text-sm mt-2">
                Avg. ${AnalyticsData?.conversion_avg}
              </div>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              <span>Daily Revenue (Last 7 Days)</span>
            </h3>
            <div className="space-y-4">
              {AnalyticsData.daily_revenue.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="text-white font-semibold">{new Date(day.date).toLocaleDateString()}</div>
                    <div className="text-gray-400">{day.users} users</div>
                    <div className="text-gray-400">{day.cases} cases</div>
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
                {AnalyticsData.top_spenders?.map((spender, index) => (
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
                {AnalyticsData.popular_cases?.map((caseData, index) => (
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
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto mt-3">
          <div className="flex min-h-screen items-center justify-center px-4 py-16">
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
                  {/* Case Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Case Name *</label>
                    <input
                      type="text"
                      value={caseForm.name}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                      placeholder="Name"
                      required
                    />
                  </div>

                  {/* Market Hash Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Market Hash Name *</label>
                    <input
                      type="text"
                      value={caseForm.market_hash_name}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, market_hash_name: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                      placeholder="Market Hash Name"
                    />
                  </div>

                  {/* Image URL */}
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

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={caseForm.price ?? ""}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, price: e.target.value ? parseFloat(e.target.value) : null }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                    <textarea
                      value={caseForm.description}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400/50 h-24 resize-none"
                      placeholder="Description"
                    />
                  </div>

                  {/* Rental */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="rental"
                      checked={caseForm.rental}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, rental: e.target.checked }))}
                      className="w-4 h-4 text-orange-600 bg-white/10 border-white/20 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="rental" className="text-white">Rental</label>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={caseForm.status === "active"}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, status: e.target.checked ? "active" : "inactive" }))}
                      className="w-4 h-4 text-orange-600 bg-white/10 border-white/20 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="isActive" className="text-white">Active Case</label>
                  </div>
                </div>

                {/* Action Buttons */}
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
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto mt-3">
          <div className="flex min-h-screen items-center justify-center px-4 py-16">
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
                      <div className="text-white font-semibold">{selectedUser?.user?.name}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <div className="text-white">{selectedUser?.user?.email}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <div className={selectedUser?.user?.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                        {selectedUser?.user?.status}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Level</label>
                      <div className="text-white">{selectedUser?.user?.details?.level || 0}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Verified</label>
                      <div className={selectedUser?.user?.is_verified
                        ? 'text-green-400' : 'text-red-400'}>
                        {selectedUser?.user?.is_verified ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Current Balance</label>
                      <div className="text-green-400 font-bold">
                        ${parseFloat(selectedUser?.user?.details?.balance || '0').toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Total Spent</label>
                      <div className="text-orange-400 font-bold">
                        ${parseFloat(selectedUser?.user?.details?.total_spent || '0').toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Total Won</label>
                      <div className="text-blue-400 font-bold">
                        ${parseFloat(selectedUser?.user?.details?.total_won || '0').toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Inventory Value</label>
                      <div className="text-purple-400 font-bold">
                        ${parseFloat(selectedUser?.user?.details?.inventory_value || '0').toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Cases Opened</label>
                      <div className="text-white">{selectedUser?.user?.details?.cases_opened ?? 0}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Join Date</label>
                      <div className="text-white">
                        {selectedUser?.user?.join_date ? new Date(selectedUser?.user?.join_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Last Login</label>
                      <div className="text-white">
                        {selectedUser?.user?.last_login ? new Date(selectedUser?.user?.last_login).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">IP Address</label>
                      <div className="text-white font-mono">{selectedUser?.user?.ip_address ?? 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Country</label>
                      <div className="text-white">{selectedUser?.user?.country ?? 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">2FA Enabled</label>
                      <div className={selectedUser.twoFactorEnabled ? 'text-green-400' : 'text-red-400'}>
                        {selectedUser?.user?.two_factor_enabled ? 'Yes' : 'No'}
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
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsModal && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto mt-3">
          <div className="flex min-h-screen items-center justify-center px-4 py-16">
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
                    <p className="text-blue-400 font-semibold">Adding Funds To:</p>
                    <p className="text-white text-lg font-bold">{selectedUser?.username}</p>
                    <p className="text-gray-400 text-sm">
                      Current Balance: ${selectedUser?.balance}
                    </p>
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
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto mt-3">
          <div className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-md mx-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-6">
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
        </div>
      )}

      {/* Weapon Manager Modal */}
      {showWeaponManager && selectedCase && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto mt-3">
          <div className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-7xl mx-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="space-y-4">
                {/* Case Name */}
                <div className="p-6 border-b border-white/20 shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                      <Target className="w-6 h-6 text-orange-400" />
                      <span>Manage Items : {selectedCase.name}</span>
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

                {/* Scrollable Content */}
                <div className="p-6 flex-1">
                  <WeaponManager
                    onSelectWeapons={handleSelectWeaponsForCase}
                    selectedWeapons={selectedCase?.items}
                    selectedCase={selectedCase}
                    setSelectedCase={setSelectedCase}
                  />
                </div>
              </div>
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