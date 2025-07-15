import React, { useState, useEffect } from 'react';
import { X, Shield, Eye, Code, CheckCircle, AlertCircle, Copy, ExternalLink, Zap, Lock, Globe, Star } from 'lucide-react';
import { provablyFairService } from '../services/provablyFairService';
import { randomOrgService } from '../services/randomOrgApi';
import type { GameResult } from '../services/randomOrgApi';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId?: string;
}

export default function ProvablyFairModal({ isOpen, onClose, gameId }: ProvablyFairModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'verify' | 'documentation' | 'api'>('overview');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [selectedGameId, setSelectedGameId] = useState(gameId || '');
  const [serverSeedInput, setServerSeedInput] = useState('');
  const [clientSeedInput, setClientSeedInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [apiQuota, setApiQuota] = useState<{ bitsLeft: number; requestsLeft: number } | null>(null);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadGameResults();
      checkApiQuota();
    }
  }, [isOpen]);

  const loadGameResults = () => {
    const results = provablyFairService.getAllGameResults();
    setGameResults(results);
    if (gameId && results.length > 0) {
      setSelectedGameId(gameId);
    }
  };

  const checkApiQuota = async () => {
    try {
      const quota = await randomOrgService.checkQuota();
      setApiQuota(quota);
    } catch (error) {
      console.error('Failed to check API quota:', error);
    }
  };

  const handleVerifyGame = async () => {
    if (!selectedGameId) return;

    setIsVerifying(true);
    try {
      const result = await provablyFairService.verifyGame(selectedGameId, serverSeedInput || undefined);
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({
        isValid: false,
        details: {
          serverSeedMatches: false,
          hashMatches: false,
          outcomeMatches: false,
          randomOrgVerified: false
        }
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${label} copied!`);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const selectedGame = gameResults.find(g => g.gameId === selectedGameId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm mt-3">
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-6xl mx-4 h-[90vh] rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Provably Fair System</h2>
                <p className="text-green-400 text-sm">Powered by Random.org & Cryptographic Verification</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-300"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Copy Success Notification */}
          {copySuccess && (
            <div className="absolute top-20 right-8 z-50 px-4 py-2 rounded-lg bg-green-500 text-white font-semibold animate-fade-in">
              {copySuccess}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/20">
            {[
              { key: 'overview', name: 'Overview', icon: Eye },
              { key: 'verify', name: 'Verify Games', icon: CheckCircle },
              { key: 'documentation', name: 'Documentation', icon: Code },
              { key: 'api', name: 'Random.org API', icon: Globe }
            ].map(({ key, name, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 transition-all duration-300 ${activeTab === key
                    ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-b-2 border-green-400 text-green-400'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{name}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4">Cryptographically Secure Gaming</h3>
                  <p className="text-gray-300 max-w-3xl mx-auto">
                    Our provably fair system uses Random.org's atmospheric noise-based true random numbers
                    combined with cryptographic hashing to ensure complete transparency and verifiability.
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/30">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center mb-4">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">Random.org Integration</h4>
                    <p className="text-green-300 text-sm">
                      True randomness from atmospheric noise, not pseudo-random algorithms
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">HMAC-SHA256</h4>
                    <p className="text-blue-300 text-sm">
                      Cryptographic hashing ensures seeds cannot be manipulated after commitment
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-400/30">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-4">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">Full Transparency</h4>
                    <p className="text-orange-300 text-sm">
                      All seeds, hashes, and Random.org responses are stored for verification
                    </p>
                  </div>
                </div>

                {/* Process Flow */}
                <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <h4 className="text-white font-bold text-xl mb-6 flex items-center space-x-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <span>How It Works</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        step: 1,
                        title: 'Server Seed Generation',
                        description: 'Random.org generates a true random server seed using atmospheric noise',
                        color: 'from-purple-400 to-purple-600'
                      },
                      {
                        step: 2,
                        title: 'Seed Commitment',
                        description: 'Server seed is hashed with SHA-256 and committed before game starts',
                        color: 'from-blue-400 to-blue-600'
                      },
                      {
                        step: 3,
                        title: 'Client Input',
                        description: 'Player provides client seed or uses auto-generated seed',
                        color: 'from-green-400 to-green-600'
                      },
                      {
                        step: 4,
                        title: 'Game Outcome',
                        description: 'Random.org generates game numbers, combined with seeds via HMAC',
                        color: 'from-orange-400 to-orange-600'
                      }
                    ].map((item) => (
                      <div key={item.step} className="p-4 rounded-xl bg-white/10 border border-white/20">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center mb-3`}>
                          <span className="text-white font-bold text-sm">{item.step}</span>
                        </div>
                        <h5 className="text-white font-semibold mb-2">{item.title}</h5>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Games */}
                {gameResults.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                    <h4 className="text-white font-bold text-xl mb-4">Recent Provably Fair Games</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {gameResults.slice(0, 5).map((game) => (
                        <div key={game.gameId} className="p-4 rounded-xl bg-white/10 border border-white/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-semibold">Game ID: {game.gameId.slice(-8)}</p>
                              <p className="text-gray-400 text-sm">
                                {new Date(game.seeds.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
                                Verified
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedGameId(game.gameId);
                                  setActiveTab('verify');
                                }}
                                className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors duration-300"
                              >
                                Verify
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Verify Tab */}
            {activeTab === 'verify' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Verify Game Results</h3>
                  <p className="text-gray-400">
                    Independently verify any game outcome using the original seeds and Random.org data
                  </p>
                </div>

                {/* Game Selection */}
                <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <h4 className="text-white font-bold mb-4">Select Game to Verify</h4>
                  <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400/50"
                  >
                    <option value="">Select a game...</option>
                    {gameResults.map((game) => (
                      <option key={game.gameId} value={game.gameId}>
                        {game.gameId} - {new Date(game.seeds.timestamp).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Game Details */}
                {selectedGame && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                      <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
                        <Lock className="w-5 h-5 text-green-400" />
                        <span>Game Information</span>
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <label className="text-gray-400 text-sm">Game ID</label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 font-mono text-white text-sm">
                              {selectedGame.gameId}
                            </div>
                            <button
                              onClick={() => copyToClipboard(selectedGame.gameId, 'Game ID')}
                              className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-gray-400 text-sm">Server Seed Hash (Commitment)</label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 font-mono text-white text-sm break-all">
                              {selectedGame.verificationData.serverSeedHash}
                            </div>
                            <button
                              onClick={() => copyToClipboard(selectedGame.verificationData.serverSeedHash, 'Server Seed Hash')}
                              className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-gray-400 text-sm">Client Seed</label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 font-mono text-white text-sm">
                              {selectedGame.seeds.clientSeed}
                            </div>
                            <button
                              onClick={() => copyToClipboard(selectedGame.seeds.clientSeed, 'Client Seed')}
                              className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-gray-400 text-sm">Nonce</label>
                          <div className="p-3 rounded-lg bg-white/10 border border-white/20 font-mono text-white text-sm">
                            {selectedGame.seeds.nonce}
                          </div>
                        </div>

                        <div>
                          <label className="text-gray-400 text-sm">Random.org Completion Time</label>
                          <div className="p-3 rounded-lg bg-white/10 border border-white/20 font-mono text-white text-sm">
                            {selectedGame.randomOrgResponse.result.random.completionTime}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                      <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>Verification</span>
                      </h4>

                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="text-gray-400 text-sm">Server Seed (Revealed After Game)</label>
                          <input
                            type="text"
                            value={serverSeedInput}
                            onChange={(e) => setServerSeedInput(e.target.value)}
                            placeholder="Enter server seed to verify..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-400/50 font-mono text-sm"
                          />
                        </div>

                        <button
                          onClick={handleVerifyGame}
                          disabled={isVerifying || !selectedGameId}
                          className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${isVerifying || !selectedGameId
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                            }`}
                        >
                          {isVerifying ? 'Verifying...' : 'Verify Game'}
                        </button>
                      </div>

                      {/* Verification Results */}
                      {verificationResult && (
                        <div className="space-y-3">
                          <h5 className="text-white font-semibold">Verification Results:</h5>

                          {[
                            { key: 'serverSeedMatches', label: 'Server Seed Hash Matches' },
                            { key: 'hashMatches', label: 'Combined Hash Matches' },
                            { key: 'outcomeMatches', label: 'Outcome Calculation Matches' },
                            { key: 'randomOrgVerified', label: 'Random.org Response Valid' }
                          ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                              <span className="text-white text-sm">{label}</span>
                              <div className={`flex items-center space-x-2 ${verificationResult.details[key] ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {verificationResult.details[key] ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <AlertCircle className="w-4 h-4" />
                                )}
                                <span className="text-sm font-semibold">
                                  {verificationResult.details[key] ? 'PASS' : 'FAIL'}
                                </span>
                              </div>
                            </div>
                          ))}

                          <div className={`p-4 rounded-xl border-2 ${verificationResult.isValid
                              ? 'bg-green-500/20 border-green-400'
                              : 'bg-red-500/20 border-red-400'
                            }`}>
                            <div className="flex items-center space-x-2">
                              {verificationResult.isValid ? (
                                <CheckCircle className="w-6 h-6 text-green-400" />
                              ) : (
                                <AlertCircle className="w-6 h-6 text-red-400" />
                              )}
                              <span className={`font-bold ${verificationResult.isValid ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {verificationResult.isValid ? 'GAME VERIFIED' : 'VERIFICATION FAILED'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documentation Tab */}
            {activeTab === 'documentation' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Technical Documentation</h3>
                  <p className="text-gray-400">
                    Complete technical specification of our provably fair system
                  </p>
                </div>

                {/* Algorithm Explanation */}
                <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <h4 className="text-white font-bold text-xl mb-4 flex items-center space-x-2">
                    <Code className="w-6 h-6 text-blue-400" />
                    <span>Algorithm Specification</span>
                  </h4>

                  <div className="space-y-6">
                    <div>
                      <h5 className="text-white font-semibold mb-3">1. Server Seed Generation</h5>
                      <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                        <code className="text-green-400 text-sm font-mono">
                          {`// Random.org API call for true randomness
const serverSeed = await randomOrg.generateString({
  length: 64,
  characters: 'a-zA-Z0-9'
});

// Immediate commitment via SHA-256
const commitment = SHA256(serverSeed);`}
                        </code>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-white font-semibold mb-3">2. Game Execution</h5>
                      <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                        <code className="text-green-400 text-sm font-mono">
                          {`// Combine seeds using HMAC-SHA256
const combinedHash = HMAC_SHA256(
  serverSeed, 
  clientSeed + ':' + nonce
);

// Get true random numbers from Random.org
const randomNumbers = await randomOrg.generateIntegers({
  min: gameMin,
  max: gameMax,
  count: 1
});

// Calculate outcome
const outcome = calculateOutcome(randomNumbers[0], gameParams);`}
                        </code>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-white font-semibold mb-3">3. Verification Process</h5>
                      <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                        <code className="text-green-400 text-sm font-mono">
                          {`// Verify server seed commitment
const verifyCommitment = SHA256(revealedServerSeed) === commitment;

// Verify combined hash
const verifyHash = HMAC_SHA256(
  revealedServerSeed,
  clientSeed + ':' + nonce
) === storedCombinedHash;

// Verify Random.org response authenticity
const verifyRandomOrg = validateRandomOrgSignature(response);`}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mathematical Probability */}
                <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <h4 className="text-white font-bold text-xl mb-4">Mathematical Probability</h4>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-white font-semibold mb-2">Case Opening Probability</h5>
                      <p className="text-gray-300 text-sm mb-3">
                        Each item has a defined probability percentage. The Random.org number (0-99999) is converted to a percentage:
                      </p>
                      <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                        <code className="text-blue-400 text-sm font-mono">
                          percentage = (randomNumber / 99999) * 100
                        </code>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-white font-semibold mb-2">Item Selection Algorithm</h5>
                      <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                        <code className="text-blue-400 text-sm font-mono">
                          {`let cumulative = 0;
for (let i = 0; i < items.length; i++) {
  cumulative += items[i].probability;
  if (percentage <= cumulative) {
    return items[i]; // Selected item
  }
}`}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Measures */}
                <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <h4 className="text-white font-bold text-xl mb-4">Security Measures</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-semibold mb-3">Cryptographic Security</h5>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• SHA-256 for seed commitments</li>
                        <li>• HMAC-SHA256 for seed combination</li>
                        <li>• Random.org atmospheric noise</li>
                        <li>• Immutable seed storage</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-white font-semibold mb-3">Transparency Features</h5>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Pre-game seed commitments</li>
                        <li>• Post-game seed revelation</li>
                        <li>• Complete API response storage</li>
                        <li>• Independent verification tools</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Random.org API Integration</h3>
                  <p className="text-gray-400">
                    Real-time status and technical details of our Random.org integration
                  </p>
                </div>

                {/* API Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                      <h4 className="text-white font-bold">API Status</h4>
                    </div>
                    <p className="text-green-300 text-sm mb-2">Connected to Random.org</p>
                    <p className="text-green-400 text-xs">True randomness from atmospheric noise</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                    <h4 className="text-white font-bold mb-4">API Quota</h4>
                    {apiQuota ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Bits Remaining:</span>
                          <span className="text-white font-mono">{apiQuota.bitsLeft.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Requests Remaining:</span>
                          <span className="text-white font-mono">{apiQuota.requestsLeft.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Loading quota information...</p>
                    )}
                  </div>
                </div>

                {/* API Endpoints */}
                <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <h4 className="text-white font-bold text-xl mb-4">API Endpoints Used</h4>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                      <h5 className="text-green-400 font-semibold mb-2">generateStrings</h5>
                      <p className="text-gray-300 text-sm mb-2">Used for server seed generation</p>
                      <code className="text-blue-400 text-xs font-mono">
                        POST https://api.random.org/json-rpc/4/invoke
                      </code>
                    </div>

                    <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                      <h5 className="text-green-400 font-semibold mb-2">generateIntegers</h5>
                      <p className="text-gray-300 text-sm mb-2">Used for game outcome numbers</p>
                      <code className="text-blue-400 text-xs font-mono">
                        POST https://api.random.org/json-rpc/4/invoke
                      </code>
                    </div>

                    <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                      <h5 className="text-green-400 font-semibold mb-2">getUsage</h5>
                      <p className="text-gray-300 text-sm mb-2">Used for quota monitoring</p>
                      <code className="text-blue-400 text-xs font-mono">
                        POST https://api.random.org/json-rpc/4/invoke
                      </code>
                    </div>
                  </div>
                </div>

                {/* Rate Limiting */}
                <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <h4 className="text-white font-bold text-xl mb-4">Rate Limiting & Error Handling</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-semibold mb-3">Rate Limiting</h5>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Minimum 1 second between requests</li>
                        <li>• Request queue management</li>
                        <li>• Automatic retry with backoff</li>
                        <li>• Quota monitoring and alerts</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-white font-semibold mb-3">Fallback Systems</h5>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Web Crypto API backup</li>
                        <li>• Graceful degradation</li>
                        <li>• Error logging and monitoring</li>
                        <li>• Automatic service recovery</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sample Response */}
                <div className="p-6 rounded-2xl bg-white/10 border border-white/20">
                  <h4 className="text-white font-bold text-xl mb-4">Sample API Response</h4>

                  <div className="p-4 rounded-lg bg-black/30 border border-white/10 overflow-x-auto">
                    <pre className="text-green-400 text-xs font-mono">
                      {`{
  "jsonrpc": "2.0",
  "result": {
    "random": {
      "data": [42857],
      "completionTime": "2025-01-27T10:30:45.123Z"
    },
    "bitsUsed": 17,
    "bitsLeft": 999983,
    "requestsLeft": 999,
    "advisoryDelay": 1000
  },
  "id": 1706351445123
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/20 p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden p-0.5">
                <img
                  src="/download.webp"
                  alt="CleanCase Logo"
                  className="w-full h-full object-contain filter brightness-0 invert"
                />
              </div>
              <span className="text-sm font-bold text-orange-400">CleanCase</span>
              <Star className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-400">Provably Fair Gaming</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}