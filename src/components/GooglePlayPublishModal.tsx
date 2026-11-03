import React, { useState } from 'react';
import {
  Smartphone,
  DollarSign,
  ShoppingBag,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Calculator,
  Tag,
  FileText,
  CreditCard,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface GooglePlayPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulatePurchase?: (itemName: string, cost: number, coinsGranted: number, boostersGranted: number) => void;
}

export const GooglePlayPublishModal: React.FC<GooglePlayPublishModalProps> = ({
  isOpen,
  onClose,
  onSimulatePurchase
}) => {
  const [activeTab, setActiveTab] = useState<'MONETIZE' | 'STORE_LISTING' | 'BUILD_AAB' | 'TEST_BILLING'>('MONETIZE');
  const [appPrice, setAppPrice] = useState<number>(2.99);
  const [projectedSales, setProjectedSales] = useState<number>(2500);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://zen-tile-match.web.app';

  // Google Play 15% tier fee (first $1M USD each year)
  const grossRevenue = appPrice * projectedSales;
  const googleFee = grossRevenue * 0.15;
  const developerPayout = grossRevenue * 0.85;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    sound.playTileSelect();
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePurchaseTest = (item: { id: string; name: string; price: number; coins: number; boosters: number }) => {
    setPurchasingItem(item.id);
    setTimeout(() => {
      setPurchasingItem(null);
      sound.playVictory();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      if (onSimulatePurchase) {
        onSimulatePurchase(item.name, item.price, item.coins, item.boosters);
      }
    }, 1200);
  };

  const storeListing = {
    title: 'Zen Tile Match 3D: Relaxing Puzzle',
    shortDesc: 'Match tactile 3D tiles & aim bubbles in relaxing zen soundscapes. Win real rewards!',
    fullDesc: `Step into a world of peaceful tranquility and tactile puzzle mastery with Zen Tile Match 3D!

Immerse yourself in two distinct, relaxing game modes:
1. 3D Zen Tile Stack: Tap exposed tiles to group 3 identical symbols into your collector dock. Plan your moves through layered geometric stacks.
2. Bubble Match Shooter: Aim and bounce vibrant orbs against walls to trigger satisfying chain reactions and floating orphan drops.

Key Features:
- 100% Native 60fps Experience: Fluid animations, particle cascades, and responsive haptic feedback.
- Offline Play Supported: Play anytime, anywhere without an active internet connection.
- 5 Distinct Visual Themes: Zen Garden, Cosmic Gems, Sakura Bloom, Ancient Temple, and Sunset Horizon.
- Genuine Rewards: Earn coins and boosters as you progress through hand-crafted campaign levels.
- Zero Frustration: Balanced difficulty curves with free undo, shuffle, and auto-match boosters.

Download Zen Tile Match 3D today and discover the ultimate zen puzzle escape!`,
    category: 'Games > Puzzle & Casual',
    contentRating: 'Everyone (PEGI 3 / ESRB E)',
    privacyPolicyUrl: `${currentHost}/privacy-policy.html`,
    assetLinksUrl: `${currentHost}/.well-known/assetlinks.json`
  };

  const terminalCommands = `# 1. Install Google's official Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize the Android project using your live web manifest
bubblewrap init --manifest="${currentHost}/manifest.webmanifest"

# 3. Build the production Android App Bundle (.aab)
bubblewrap build

# Your signed .aab is generated at:
# ./app-release-signed.aab
# Ready to upload to Google Play Console!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-950 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950/50 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight font-display">
                  Sell on Google Play Store
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold">
                  Official Console Hub
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Monetization, pricing tiers, Google Play Billing & .AAB bundle builder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/10 bg-stone-900/60 px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('MONETIZE')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'MONETIZE'
                ? 'border-emerald-400 text-emerald-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Monetization & Payouts</span>
          </button>

          <button
            onClick={() => setActiveTab('BUILD_AAB')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'BUILD_AAB'
                ? 'border-emerald-400 text-emerald-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Build .AAB (Bubblewrap)</span>
          </button>

          <button
            onClick={() => setActiveTab('STORE_LISTING')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'STORE_LISTING'
                ? 'border-emerald-400 text-emerald-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Play Store Listing</span>
          </button>

          <button
            onClick={() => setActiveTab('TEST_BILLING')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'TEST_BILLING'
                ? 'border-emerald-400 text-emerald-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Test Play Billing</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'MONETIZE' && (
            <div className="space-y-6">
              {/* How to Sell on Google Play Overview */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-cyan-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Official Google Play Developer Requirements</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="font-bold text-emerald-300">1. Play Console Account</span>
                    <p className="text-stone-300 text-[11px] leading-relaxed">
                      Register once at <a href="https://play.google.com/console/signup" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">play.google.com/console</a> ($25 one-time registration fee).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="font-bold text-emerald-300">2. Merchant Profile</span>
                    <p className="text-stone-300 text-[11px] leading-relaxed">
                      Link your bank account under <strong>Settings &gt; Payments Profile</strong> to receive direct automatic monthly revenue payouts.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="font-bold text-emerald-300">3. 85% Developer Revenue</span>
                    <p className="text-stone-300 text-[11px] leading-relaxed">
                      Google takes only a 15% tier service fee on your first $1,000,000 USD earned each year. You pocket 85%!
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="font-bold text-emerald-300">4. Privacy Policy Compliance</span>
                    <p className="text-stone-300 text-[11px] leading-relaxed">
                      Already generated and live in this app at <code className="text-emerald-400 text-[10px]">/privacy-policy.html</code>!
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Revenue Calculator */}
              <div className="p-5 rounded-2xl bg-stone-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Play Store Revenue & Price Calculator</h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    85% Net Payout
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Slider 1: App Price */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">Game Download Price:</span>
                      <span className="font-bold text-white font-mono">${appPrice.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.99}
                      max={9.99}
                      step={0.50}
                      value={appPrice}
                      onChange={e => setAppPrice(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>$0.99</span>
                      <span>$2.99</span>
                      <span>$4.99</span>
                      <span>$9.99</span>
                    </div>
                  </div>

                  {/* Slider 2: Estimated Sales */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">Estimated Downloads:</span>
                      <span className="font-bold text-white font-mono">{projectedSales.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={25000}
                      step={500}
                      value={projectedSales}
                      onChange={e => setProjectedSales(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>500</span>
                      <span>5,000</span>
                      <span>15,000</span>
                      <span>25,000</span>
                    </div>
                  </div>
                </div>

                {/* Projection Results Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-stone-400 block">Gross Sales</span>
                    <span className="text-base font-bold text-white font-mono">
                      ${grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20">
                    <span className="text-[10px] text-rose-400 block">Google Fee (15%)</span>
                    <span className="text-base font-bold text-rose-300 font-mono">
                      -${googleFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-400 font-semibold block">Your Bank Deposit (85%)</span>
                    <span className="text-lg font-black text-emerald-300 font-mono">
                      ${developerPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons to Google Play Console */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://play.google.com/console"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Open Google Play Console</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setActiveTab('BUILD_AAB')}
                  className="flex-1 py-3 px-4 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Generate .AAB Package</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'BUILD_AAB' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Build Android App Bundle (.aab) with Bubblewrap</h3>
                  </div>
                  <button
                    onClick={() => handleCopy(terminalCommands, 'commands')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold"
                  >
                    {copiedField === 'commands' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Script!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Google Play requires applications to be uploaded as <strong>Android App Bundles (.aab)</strong>. Google's official CLI tool <strong>Bubblewrap</strong> compiles this live PWA into a production-signed .aab in three simple terminal commands:
                </p>

                <div className="relative">
                  <pre className="p-3.5 rounded-xl bg-black/70 border border-white/10 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                    {terminalCommands}
                  </pre>
                </div>
              </div>

              {/* Ready Configuration Artifacts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-300">Generated Verification & Manifest Files</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-stone-900 border border-white/10 flex items-start justify-between">
                    <div>
                      <span className="font-bold text-white block">Digital Asset Links</span>
                      <span className="text-[11px] text-stone-400 block mt-0.5">/.well-known/assetlinks.json</span>
                      <span className="text-[10px] text-emerald-400 font-semibold block mt-1">✓ Installed & Live</span>
                    </div>
                    <a
                      href="/.well-known/assetlinks.json"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-stone-300 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-900 border border-white/10 flex items-start justify-between">
                    <div>
                      <span className="font-bold text-white block">Bubblewrap TWA Manifest</span>
                      <span className="text-[11px] text-stone-400 block mt-0.5">/twa-manifest.json</span>
                      <span className="text-[10px] text-emerald-400 font-semibold block mt-1">✓ Configured for Play Billing</span>
                    </div>
                    <a
                      href="/twa-manifest.json"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-stone-300 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Upload to Google Play Console Guidance */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-bold text-emerald-300 block">Next Steps in Google Play Console</span>
                <ol className="text-xs text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Go to <strong>Play Console &gt; Create App</strong> and choose <strong>Game &gt; Paid</strong> (or Free with in-app purchases).</li>
                  <li>Click <strong>Release &gt; Production &gt; Create new release</strong>.</li>
                  <li>Drag and drop your newly built <code className="text-emerald-400">app-release-signed.aab</code>.</li>
                  <li>Complete the Store Listing fields (copy from the <em>Play Store Listing</em> tab above).</li>
                  <li>Click <strong>Send for review</strong>. Reviews usually complete within 24 to 48 hours!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'STORE_LISTING' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block">Game Title (30 characters max)</span>
                  <span className="text-sm font-bold text-white">{storeListing.title}</span>
                </div>
                <button
                  onClick={() => handleCopy(storeListing.title, 'title')}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  {copiedField === 'title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'title' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block">Short Description (80 characters max)</span>
                  <span className="text-xs font-medium text-stone-300">{storeListing.shortDesc}</span>
                </div>
                <button
                  onClick={() => handleCopy(storeListing.shortDesc, 'shortDesc')}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  {copiedField === 'shortDesc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'shortDesc' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 block">Full Description (SEO Optimized)</span>
                  <button
                    onClick={() => handleCopy(storeListing.fullDesc, 'fullDesc')}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    {copiedField === 'fullDesc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'fullDesc' ? 'Copied Description' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  value={storeListing.fullDesc}
                  className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-stone-300 text-xs font-mono select-all focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Privacy Policy URL</span>
                    <span className="text-xs font-mono text-emerald-400 truncate max-w-[200px] block">
                      {storeListing.privacyPolicyUrl}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(storeListing.privacyPolicyUrl, 'privacy')}
                    className="px-2.5 py-1 bg-stone-800 rounded-lg text-stone-200 text-[11px]"
                  >
                    {copiedField === 'privacy' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Content Rating</span>
                    <span className="text-xs font-bold text-white block">Everyone / PEGI 3</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    All Ages
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TEST_BILLING' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-white/10">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Google Play In-App Purchases (IAP) Test Bench</span>
                </h3>
                <p className="text-[11px] text-stone-400 mt-1">
                  Test simulated Google Play Billing transactions. Purchasing adds coins and boosters to your active game account immediately!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'pack_starter',
                    name: 'Starter Coin Pouch',
                    price: 0.99,
                    coins: 1000,
                    boosters: 2,
                    badge: 'Popular',
                    desc: '1,000 Coins + 2x Boosters'
                  },
                  {
                    id: 'pack_master',
                    name: 'Zen Master Vault',
                    price: 2.99,
                    coins: 4000,
                    boosters: 6,
                    badge: 'Best Value',
                    desc: '4,000 Coins + 6x Boosters'
                  },
                  {
                    id: 'pack_vip',
                    name: 'VIP Golden Pass',
                    price: 4.99,
                    coins: 10000,
                    boosters: 15,
                    badge: 'Ultimate',
                    desc: '10,000 Coins + 15x Boosters'
                  }
                ].map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-stone-900/90 border border-emerald-500/20 flex flex-col justify-between space-y-3 relative overflow-hidden"
                  >
                    {item.badge && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {item.badge}
                      </span>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => handlePurchaseTest(item)}
                      disabled={purchasingItem === item.id}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {purchasingItem === item.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                          <span>Processing Play Billing...</span>
                        </>
                      ) : (
                        <>
                          <span>Buy with Google Play (${item.price.toFixed(2)})</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
