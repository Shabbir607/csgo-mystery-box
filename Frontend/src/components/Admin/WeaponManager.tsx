import React, { useState, useRef, useEffect } from 'react';
import { CSGOItem } from '../../types';
// import { csgoWeapons, getWeaponsByRarity, getAllRarities, getRarityColor, getRarityDisplayName } from '../../data/csgoWeapons';
import ItemCard from '../ItemCard';
import { Search, Filter, Plus, Trash2, Save, X, GripVertical, Target, Percent } from 'lucide-react';
import Select from 'react-select';
import { useToast } from '../ToastContext';

interface WeaponManagerProps {
  onSelectWeapons: (weapons: CSGOItem[]) => void;
  selectedWeapons: CSGOItem[];
  selectedCase: any;
  setSelectedCase: (c: any) => void;
}

export default function WeaponManager({ onSelectWeapons, selectedWeapons, selectedCase, setSelectedCase }: WeaponManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [draggedItem, setDraggedItem] = useState<CSGOItem | null>(null);
  const [editingProbability, setEditingProbability] = useState<string | null>(null);
  const [probabilityValue, setProbabilityValue] = useState('');
  const [showAddWeapon, setShowAddWeapon] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [totalWeapons, setTotalWeapons] = useState(0);
  const [editingWeapon, setEditingWeapon] = useState<CSGOItem | null>(null);
  const [showCasePicker, setShowCasePicker] = useState(false);

  console.log("setSelectedCase in WeaponManager:", selectedCase);

  const { showToast } = useToast();

  const dragCounter = useRef(0);

  interface WeaponFormType {
    name: string;
    description: string;
    image: string;
    rarity_id: string;
    price: string;
    probability: string;
  }

  const [AllCases, setAllCases] = useState<CSGOCase[]>([]);
  const [nextPageCases, setNextPageCases] = useState<string | null>(null);
  const CaseContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFetchingCase, setIsFetchingCase] = useState(false);
  console.log("setSelectedCase in AllCases:", AllCases);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async (url = 'https://production.gameonha.com/api/admin/crates?page=1', append = false) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      //  showToast("Auth Token not Found", "info");

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

      // setCaseResponse(data?.crates || null);
      setAllCases(prev => (append ? [...prev, ...cratesData] : cratesData));
      setNextPageCases(data?.crates?.next_page_url || null);
    } catch (err: any) {
      showToast(err.message || 'Failed to Fetch Cases', "error");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const container = CaseContainerRef.current;
      if (!container || isFetchingCase || !nextPageCases) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setIsFetchingCase(true);
        fetchCases(nextPageCases, true).finally(() => setIsFetchingCase(false));
      }
    };

    const container = CaseContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [nextPageCases, isFetchingCase]);

  const [weapons, setWeapons] = useState<CSGOItem[]>([]);
  console.log("Weapons", weapons)

  const fetchWeapons = async (url = 'https://production.gameonha.com/api/admin/base-weapons?page=1', append = false) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      //  showToast("Auth Token not Found", "info");

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      console.log("...", data)
      setTotalWeapons(data?.data?.total || 0);
      const newWeapons = data?.data?.data || [];
      setWeapons(prev => append ? [...prev, ...newWeapons] : newWeapons);
      setNextPageUrl(data?.data?.next_page_url || null);
    } catch (err: any) {
      showToast(err.message || 'Failed to Fetch Weapons', "error");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container || isFetchingMore || !nextPageUrl) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setIsFetchingMore(true);
        fetchWeapons(nextPageUrl, true).finally(() => setIsFetchingMore(false));
      }
    };

    const container = scrollContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [nextPageUrl, isFetchingMore]);

  useEffect(() => {
    fetchWeapons();
  }, []);

  const [rarities, setRarities] = useState([]);
  console.log("RARITIES", rarities)

  useEffect(() => {
    const fetchRarities = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) throw new Error('Missing Auth Token');

        const res = await fetch('https://production.gameonha.com/api/admin/rarities', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log('RARITIES FULL RESPONSE:', data);
        setRarities(data?.rarities || []);
      } catch (err: any) {
        console.error('Error Fetching Rarities:', err);
        showToast(err.message || 'Failed to Fetch Rarities', "error");
      }
    };
    fetchRarities();
  }, []);

  // Form states
  const [weaponForm, setweaponForm] = useState<WeaponFormType>({
    name: '',
    description: '',
    image: '',
    rarity_id: '',
    price: '',
    probability: '',
  });

  const resetCaseForm = () => {
    setweaponForm({ name: '', price: '', image: '', description: '', rarity_id: '', probability: '' });
  };

  const handleSubmit = async () => {
    const token = sessionStorage.getItem('auth_token');

    const payload = {
      name: weaponForm.name,
      description: weaponForm.description,
      image: weaponForm.image,
      rarity_id: weaponForm.rarity_id,
      price: parseFloat(weaponForm.price) || null,
      probability: weaponForm.probability !== '' ? parseFloat(weaponForm.probability) : null,
    };

    console.log("Payload", payload);

    try {
      const url = editingWeapon
        ? `https://production.gameonha.com/api/admin/base-weapons/${editingWeapon.id}`
        : 'https://production.gameonha.com/api/admin/base-weapons';

      const method = editingWeapon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Failed to Save Weapon");
      }

      const result = await res.json();
      console.log("Weapon Response", result);

      fetchWeapons();
      setShowAddWeapon(false);
      setEditingWeapon(null);
      resetCaseForm();
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
      console.error("Submit error:", err);
    }
  };

  const handleDeleteWeapon = async (weapon) => {
    const token = sessionStorage.getItem('auth_token');

    const payload = {
      name: weapon.name,
      description: weapon.description,
      image: weapon.image,
      rarity_id: weapon.rarity_id,
      price: parseFloat(weapon.price) || null,
      probability: weapon.probability !== '' ? parseFloat(weaponForm.probability) : null,
    };

    try {
      const res = await fetch(`https://production.gameonha.com/api/admin/base-weapons/${weapon.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete weapon');
      }

      const result = await res.json();
      console.log('Deleted:', result);
      fetchWeapons();
    } catch (error) {
      showToast('Error deleting weapon: ' + error.message, "error");
    }
  };

  const rarityOptions = rarities.map((rarity: any) => ({
    value: rarity.id,
    label: rarity.name,
    color: rarity.color,
  }));

  const customStyles = {
    control: (styles: any) => ({
      ...styles,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderColor: 'rgba(255,255,255,0.2)',
      padding: '8px',
      borderRadius: '12px',
      color: 'white',
    }),
    menu: (styles: any) => ({
      ...styles,
      backgroundColor: '#1f1f1f',
      borderRadius: '12px',
    }),
    option: (styles: any, { data, isFocused, isSelected }: any) => ({
      ...styles,
      backgroundColor: isSelected
        ? data.color
        : isFocused
          ? 'rgba(255,255,255,0.1)'
          : 'transparent',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 12px',
    }),
    singleValue: (styles: any) => ({
      ...styles,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'white',
    }),
  };

  const formatOptionLabel = ({ label, color }: any) => (
    <div className="flex items-center gap-2">
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      ></span>
      <span>{label}</span>
    </div>
  );

  const handleCaseSelectAndDrop = (selectedOption: any) => {
    setSelectedCase(selectedOption.value);
    setShowCasePicker(false);
  };

  const getAllRarities = (): string[] => {
    const rarities = weapons?.map(w => w.rarity?.name?.toLowerCase()).filter(Boolean);
    return Array.from(new Set(rarities));
  };

  const getRarityDisplayName = (rarity: string): string => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const filteredWeapons = weapons.filter((weapon) => {
    const matchesSearch = weapon.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity =
      filterRarity === 'all' || weapon.rarity?.name?.toLowerCase() === filterRarity;

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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;

    if (!draggedItem) return;

    if (!selectedCase) {
      setShowCasePicker(true);
      setDraggedItem(null);
      return;
    }

    const alreadyExists = selectedWeapons?.find(w => w.id === draggedItem.id);
    if (alreadyExists) {
      showToast("Weapon Already Exit !!", "info")
      setDraggedItem(null);
      return;
    }

    const newWeapons = [...selectedWeapons, draggedItem];

    onSelectWeapons(newWeapons);
    setDraggedItem(null);

    const token = sessionStorage.getItem("auth_token");
    if (!token) {
       showToast("Auth Token not Found", "info");
      return;
    }

    try {
      const response = await fetch(`https://production.gameonha.com/api/admin/crates/${selectedCase.id}/assign-weapons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weapon_ids: [draggedItem.id],
        }),
      });
      console.log("DragResponse", response)

      if (!response.ok) {
        const err = await response.json();
        console.error("Assign Failed:", err);
        showToast(err?.message || "Failed to Assign weapons to Case", "error");
        return;
      }

      const updatedCase = {
        ...selectedCase,
        items: [...(selectedCase.items || []), draggedItem]
      };
      setSelectedCase(updatedCase);
      showToast("Weapons Assigned to case Successfully", "success");
    } catch (error) {
      console.error("API Error:", error);
      showToast("An error Occurred while Assigning Weapons", "error");
    }
  };

  const handleRemoveWeapon = async (weaponId: string) => {
    const token = sessionStorage.getItem("auth_token");
    if (!token || !selectedCase?.id) {
       showToast("Auth Token Or Case not Found", "info");
      return;
    }

    try {
      const response = await fetch(
        `https://production.gameonha.com/api/admin/crates/${selectedCase.id}/unassign-weapons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            weapon_ids: [weaponId],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to Unassign Weapon");
      }
      const updatedWeapons = selectedWeapons.filter((w) => w.id !== weaponId);
      onSelectWeapons(updatedWeapons);

      const updatedCase = {
        ...selectedCase,
        items: selectedCase.items.filter((w) => w.id !== weaponId)
      };
      setSelectedCase(updatedCase);

      showToast("Weapon Successfully Unassigned from Case", "success");
    } catch (error: any) {
      console.error("Unassign error:", error);
      showToast(error.message || "Error unassigning weapon", "error");
    }
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

  const saveProbability = async () => {
    if (!editingProbability) return;

    const probability = parseFloat(probabilityValue);
    if (isNaN(probability) || probability < 0 || probability > 100) return;
    try {

      const token = sessionStorage.getItem('auth_token');
      if (!token) {
         showToast("Auth Token not Found", "info");
        return;
      }

      const res = await fetch(`https://production.gameonha.com/api/admin/crates/${selectedCase.id}/update-drop-rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rates: [
            {
              weapon_id: editingProbability,
              drop_rate: probability,
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || 'Failed to Update Probability');
      }
      handleUpdateProbability(editingProbability, probability);

      const updatedItems = selectedCase.items.map((item) =>
        item.id === editingProbability ? { ...item, probability } : item
      );
      setSelectedCase({ ...selectedCase, items: updatedItems });

      showToast('Probability Updated Successfully', "success");
    } catch (err: any) {
      showToast(err.message || 'Error updating probability', "error");
      console.error('API Error:', err);
    } finally {
      setEditingProbability(null);
      setProbabilityValue('');
    }
  };

  const cancelEditingProbability = () => {
    setEditingProbability(null);
    setProbabilityValue('');
  };

  const RarityOptions = [
    { value: 'all', label: 'All Rarities', color: '#9ca3af' }, // gray
    ...getAllRarities().map(r => {
      const rarityData = rarities.find(rar => rar.name.toLowerCase() === r);
      return {
        value: r,
        label: getRarityDisplayName(r),
        color: rarityData?.color || '#9ca3af',
      };
    }),
  ]

  const totalProbability = selectedWeapons.reduce((sum, weapon) => sum + (weapon.probability || 0), 0);

  const formatCaseOption = ({ label, value }: any) => (
    <div className="flex flex-col space-y-1">
      <span className="text-white font-medium">{label}</span>
      <span className="text-gray-400 text-sm">ID : {value.id}</span>
    </div>
  );

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
            {totalWeapons} weapons
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
            <Select
              value={RarityOptions?.find(opt => opt.value === filterRarity)}
              onChange={(selectedOption) => {
                setFilterRarity(selectedOption?.value || 'all');
              }}
              options={RarityOptions}
              styles={customStyles}
              formatOptionLabel={formatOptionLabel}
              placeholder="Filter by Rarity"
              isSearchable={false}
            />
          </div>
        </div>

        {/* Weapons Grid */}
        <div className="h-[32rem] overflow-y-auto scrollbar-hide" ref={scrollContainerRef}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredWeapons?.map((weapon) => (
              <div
                key={`filtered-${weapon.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, weapon)}
                className="relative group cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-200"
              >
                <ItemCard item={weapon} className="h-48" />

                {/* Drag Indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingWeapon(weapon);
                      setweaponForm({ ...weapon });
                      setShowAddWeapon(true);
                    }}
                    className="p-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors duration-300"
                    title="Edit Weapon"
                  >
                    <Target className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWeapon(weapon)}
                    className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors duration-300"
                    title="Delete Weapon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-1 rounded-lg bg-black/50 backdrop-blur-sm">
                    <GripVertical className="w-4 h-4 text-white" />
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

        {isFetchingMore && (
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0s]"></div>
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.1s]"></div>
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.3s]"></div>
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>

      {/* Selected Weapons for Case */}
      <div className="space-y-6">
        {/* Add Weapon Button */}
        <div className="flex justify-end items-center">
          <button
            onClick={() => {
              setEditingWeapon(null);
              resetCaseForm();
              setShowAddWeapon(true);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-2 shadow-xl hover:shadow-2xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Weapon</span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-400" />
            <span>Case Items</span>
          </h3>
          <div className="text-sm">
            <span className={`font-bold ${totalProbability > 100 ? 'text-red-400' : totalProbability < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
              {totalProbability?.toFixed(2)}%
            </span>
            <span className="text-gray-400 ml-1">Total</span>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`h-80 overflow-y-auto scrollbar-hide p-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${draggedItem
            ? 'border-orange-400 bg-orange-500/10'
            : 'border-white/20 bg-white/5'
            }`}
        >
          {selectedCase?.items?.length === 0 ? (
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
              {selectedCase?.items?.map((weapon, index) => (
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
                    <h4 className="text-white font-semibold text-sm">{weapon?.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div
                        className="text-xs px-2 py-1 rounded text-white font-bold capitalize"
                        style={{
                          background: weapon.rarity?.color
                            ? `linear-gradient(to right, ${weapon.rarity.color}, ${weapon.rarity.color})`
                            : 'linear-gradient(to right, #4b5563, #374151)'
                        }}
                      >
                        {weapon.rarity?.name || 'Unknown'}
                      </div>
                      <span className="text-orange-400 font-bold text-sm">
                        ${!isNaN(Number(weapon.price)) ? Number(weapon.price).toFixed(2) : '0.00'}
                      </span>
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
              {[...new Set(selectedWeapons.map(w => w.rarity?.name))].filter(Boolean).map(rarityName => {
                const rarityWeapons = selectedWeapons.filter(w => w.rarity?.name === rarityName);
                const rarityTotal = rarityWeapons.reduce((sum, w) => sum + (w.probability || 0), 0);

                const rarityColor = rarityWeapons[0]?.rarity?.color || '#4b5563';

                return (
                  <div key={rarityName} className="flex items-center justify-between bg-black/30 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{
                          background: `linear-gradient(to right, ${rarityColor}, ${rarityColor})`
                        }}
                      />
                      <span className="text-gray-300 text-sm capitalize">{rarityName}</span>
                      <span className="text-gray-400 text-xs">({rarityWeapons.length} items)</span>
                    </div>
                    <span className="text-white font-mono text-sm">{rarityTotal.toFixed(2)}%</span>
                  </div>
                );
              })}

              <div className="border-t border-white/20 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className={`font-mono font-bold ${totalProbability > 100 ? 'text-red-400' :
                    totalProbability < 100 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                    {totalProbability.toFixed(2)}%
                  </span>
                </div>
                {totalProbability !== 100 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {totalProbability > 100
                      ? 'Total exceeds 100% - Adjust Probabilities'
                      : 'Total Below 100% - Add more items or increase Probabilities'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddWeapon && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto mt-3">
          <div className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-md mx-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    {editingWeapon ? 'Edit Weapon' : 'Add New Weapon'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddWeapon(false);
                      setEditingWeapon(null);
                      resetCaseForm();
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Form fields - same as before */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Weapon Name *</label>
                    <input
                      type="text"
                      value={weaponForm.name}
                      onChange={(e) => setweaponForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                      placeholder="Enter Weapon name"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Price ($) *</label>
                    <input
                      type="number"
                      step="0.00"
                      min="0"
                      value={weaponForm.price}
                      onChange={(e) => setweaponForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Image URL *</label>
                    <input
                      type="url"
                      value={weaponForm.image}
                      onChange={(e) => setweaponForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>

                  {/* Probability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Probability (%) *</label>
                    <input
                      type="number"
                      step="0.00"
                      min="0.01"
                      value={weaponForm.probability}
                      onChange={(e) => setweaponForm(prev => ({ ...prev, probability: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Rarity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Select Rarity *</label>
                    <Select
                      value={rarityOptions.find((r: any) => r.value === weaponForm.rarity_id)}
                      onChange={(selectedOption) =>
                        setweaponForm((prev) => ({ ...prev, rarity_id: selectedOption?.value }))
                      }
                      options={rarityOptions}
                      styles={customStyles}
                      formatOptionLabel={formatOptionLabel}
                      placeholder="Select a rarity"
                      isSearchable={false}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                    <textarea
                      value={weaponForm.description}
                      onChange={(e) => setweaponForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400/50 h-24 resize-none"
                      placeholder="Enter Description"
                      required
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingWeapon ? 'Update Weapon' : 'Save Weapon'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddWeapon(false);
                      setEditingWeapon(null);
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

      {showCasePicker && (
        <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div
              ref={CaseContainerRef}
              className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md max-w-md w-full"
            >

              <h3 className="text-white text-lg font-semibold mb-4">
                Select a Case to Assign Weapon
              </h3>

              <Select
                options={AllCases?.map((c: any) => ({
                  label: c.name,
                  value: c,
                }))}
                styles={customStyles}
                placeholder="Choose a Case"
                onChange={handleCaseSelectAndDrop}
                formatOptionLabel={formatCaseOption}
              />

              {selectedCase && (
                <label className="flex items-center mt-4 space-x-2">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="form-checkbox h-5 w-5 text-green-500 rounded-md"
                  />
                  <span className="text-green-400 text-sm font-medium">
                    {selectedCase.name} is selected
                  </span>
                </label>
              )}

              <button
                onClick={() => {
                  setShowCasePicker(false);
                }}
                className="mt-5 text-sm text-red-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}