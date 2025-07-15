import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Monitor, Moon, Sun, Bell, BellOff, Shield, Star } from 'lucide-react';
import { useToast } from './ToastContext';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack, handleLogout }: SettingsProps) {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    theme: 'dark',
    notifications: true,
    autoPlay: false,
    showAnimations: true,
    language: 'en'
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

   const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      showToast("Please Enter both Password fields.", "info");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not Match.", "info");
      return;
    }

    const token = sessionStorage.getItem("auth_token");
    const userId = sessionStorage.getItem("User_id");

    if (!token || !userId) {
      showToast("Missing Authentication or user ID. Please log in Again.", "error");
      return;
    }

    try {
      const response = await fetch(`https://production.gameonha.com/api/admin/users/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update Password");
      }

      showToast("Password Updated Successfully! Login Again", "success");
      handleLogout();
      setNewPassword('');
      setConfirmPassword('');

    } catch (error: any) {
      console.error("Error Updating Password:", error);
      showToast(error.message || "Something went wrong.", "error");
    }
  };

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
              Settings
            </h1>
          </div>
          <p className="text-sm text-orange-400 font-medium tracking-wide">Customize Your CleanCase Experience</p>
        </div>

        <div className="w-32" /> {/* Spacer for centering */}
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Audio Settings */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white" />}
            </div>
            <h3 className="text-2xl font-bold text-white">Audio & Sound</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10">
              <div>
                <h4 className="text-white font-semibold">Sound Effects</h4>
                <p className="text-sm text-gray-400">Enable case opening and UI sounds</p>
              </div>
              <button
                onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                className={`w-14 h-8 rounded-full transition-all duration-300 ${settings.soundEnabled ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 ${settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  } mt-1`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10">
              <div>
                <h4 className="text-white font-semibold">Auto-Play Animations</h4>
                <p className="text-sm text-gray-400">Automatically play case opening animations</p>
              </div>
              <button
                onClick={() => updateSetting('autoPlay', !settings.autoPlay)}
                className={`w-14 h-8 rounded-full transition-all duration-300 ${settings.autoPlay ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 ${settings.autoPlay ? 'translate-x-7' : 'translate-x-1'
                  } mt-1`} />
              </button>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Display & Theme</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/10">
              <h4 className="text-white font-semibold mb-3">Theme Preference</h4>
              <div className="flex space-x-4">
                {[
                  { key: 'dark', name: 'Dark', icon: Moon },
                  { key: 'light', name: 'Light', icon: Sun },
                  { key: 'auto', name: 'Auto', icon: Monitor }
                ].map(({ key, name, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => updateSetting('theme', key)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${settings.theme === key
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10">
              <div>
                <h4 className="text-white font-semibold">Animations</h4>
                <p className="text-sm text-gray-400">Enable enhanced visual effects and transitions</p>
              </div>
              <button
                onClick={() => updateSetting('showAnimations', !settings.showAnimations)}
                className={`w-14 h-8 rounded-full transition-all duration-300 ${settings.showAnimations ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 ${settings.showAnimations ? 'translate-x-7' : 'translate-x-1'
                  } mt-1`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              {settings.notifications ? <Bell className="w-5 h-5 text-white" /> : <BellOff className="w-5 h-5 text-white" />}
            </div>
            <h3 className="text-2xl font-bold text-white">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10">
              <div>
                <h4 className="text-white font-semibold">Push Notifications</h4>
                <p className="text-sm text-gray-400">Receive notifications about new cases and promotions</p>
              </div>
              <button
                onClick={() => updateSetting('notifications', !settings.notifications)}
                className={`w-14 h-8 rounded-full transition-all duration-300 ${settings.notifications ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 ${settings.notifications ? 'translate-x-7' : 'translate-x-1'
                  } mt-1`} />
              </button>
            </div>
          </div>
        </div>

        {/* Account & Security */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Account & Security</h3>
          </div>

          <div className="space-y-4">
            {/* Change Password Button */}
            <button
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="w-full text-left p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              <h4 className="text-white font-semibold">Change Password</h4>
              <p className="text-sm text-gray-400">Update your account password</p>
            </button>

            {/* Password Input Fields */}
            {showPasswordFields && (
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 space-y-4">
                <div>
                  <label className="text-white text-sm">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="text-white text-sm">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none"
                    placeholder="Confirm new password"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                {successMsg && <p className="text-green-400 text-sm">{successMsg}</p>}

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all duration-300"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}

            {/* Other Settings */}
            <button className="w-full text-left p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300">
              <h4 className="text-white font-semibold">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
            </button>

            <button className="w-full text-left p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300">
              <h4 className="text-white font-semibold">Privacy Settings</h4>
              <p className="text-sm text-gray-400">Manage your data and privacy preferences</p>
            </button>
          </div>
        </div>

        {/* Language & Region */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden p-2">
              <img
                src="/download.webp"
                alt="CleanCase Logo"
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <h3 className="text-2xl font-bold text-white">Language & Region</h3>
          </div>

          <div className="p-4 rounded-2xl bg-white/10">
            <h4 className="text-white font-semibold mb-3">Language</h4>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400/50"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ru">Русский</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-10 text-center">
        <button className="px-12 py-4 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-3 mx-auto">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden p-1">
            <img
              src="/download.webp"
              alt="CleanCase Logo"
              className="w-full h-full object-contain filter brightness-0 invert"
            />
          </div>
          <span>Save Settings</span>
        </button>
      </div>

      {/* CleanCase Branding Footer */}
      <div className="text-center pt-8 mt-12 border-t border-white/10">
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
        <p className="text-xs text-gray-400">Settings • Personalized Experience</p>
      </div>
    </div>
  );
}