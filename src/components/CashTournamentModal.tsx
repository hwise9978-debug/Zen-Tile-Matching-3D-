import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, ShieldCheck, CheckCircle2, History, AlertCircle, Sparkles, Building2, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CashTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onWithdraw: (amount: number, method: string, recipient: string) => void;
  withdrawalHistory: Array<{
    id: string;
    amount: number;
    method: string;
    recipient: string;
    status: 'COMPLETED' | 'PENDING';
    date: string;
  }>;
}

export const CashTournamentModal: React.FC<CashTournamentModalProps> = ({
  isOpen,
  onClose,
  balance,
  onWithdraw,
  withdrawalHistory
}) => {
  const [activeTab, setActiveTab] = useState<'WITHDRAW' | 'HISTORY' | 'ARCHITECTURE'>('WITHDRAW');
  const [selectedMethod, setSelectedMethod] = useState<'CashApp' | 'BankWire' | 'DirectDeposit'>('CashApp');
  const [recipientInput, setRecipientInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleQuickAmount = (pct: number) => {
    const val = (balance * pct).toFixed(2);
    setWithdrawAmount(val);
  };

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(withdrawAmount);
    if (isNaN(num) || num <= 0 || num > balance) {
      return;
    }
    if (!recipientInput.trim()) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const methodName =
        selectedMethod === 'BankWire'
          ? 'Wire Transfer (1-Day Wait)'
          : selectedMethod === 'DirectDeposit'
          ? 'Direct Deposit (ACH)'
          : 'Cash App';

      onWithdraw(num, methodName, recipientInput.trim());
      setIsSubmitting(false);

      if (selectedMethod === 'BankWire') {
        setSuccessMessage(`$${num.toFixed(2)} Express Wire Transfer sent to ${recipientInput}! With wire transfer you wait only 1 day to receive your money with $0.00 withdrawal fees! (Tracking: WIRE-1DAY-${Date.now().toString(36).toUpperCase()})`);
      } else if (selectedMethod === 'DirectDeposit') {
        setSuccessMessage(`$${num.toFixed(2)} Direct Deposit (ACH) transfer sent to ${recipientInput}! Processed within 1 day with $0.00 withdrawal fees! (Tracking: ACH-${Date.now().toString(36).toUpperCase()})`);
      } else {
        setSuccessMessage(`$${num.toFixed(2)} sent to Cash App ($${recipientInput.replace(/^\$/, '')}) with $0.00 withdrawal fee!`);
      }
      setWithdrawAmount('');
      setRecipientInput('');
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-stone-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
                Prize Vault & Cashout
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans font-medium">
                  0% Fees · No Deposit
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Direct prize earnings from completing tile puzzle levels
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

        {/* Balance Card Banner */}
        <div className="px-6 pt-5 pb-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-stone-900 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider block">
                Available Cash Balance
              </span>
              <div className="text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1 mt-0.5">
                <span>${balance.toFixed(2)}</span>
                <span className="text-xs text-emerald-400 font-sans font-semibold">USD</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Legit prize pool · $0.00 withdrawal fee guaranteed</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-stone-500 block">Level Wins</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">+$1.50 / lvl</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-6 gap-2">
          <button
            onClick={() => { setActiveTab('WITHDRAW'); setSuccessMessage(null); }}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'WITHDRAW'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Instant Cashout
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'HISTORY'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Payout History ({withdrawalHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('ARCHITECTURE')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'ARCHITECTURE'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Developer Backend Guide
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === 'WITHDRAW' && (
            <div>
              {successMessage ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 py-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Payout Initiated!</h3>
                    <p className="text-xs text-emerald-300/90 mt-1 max-w-sm mx-auto">
                      {successMessage}
                    </p>
                  </div>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="px-4 py-2 bg-emerald-500 text-stone-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors"
                  >
                    Send Another Payout
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
                  {/* Payout Method Selector */}
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                      Select Payout Method (No Withdrawal Fees)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'CashApp', label: 'Cash App', time: 'Instant · $0 Fee', icon: '💵', desc: '$CashTag' },
                        { id: 'BankWire', label: 'Wire Transfer', time: 'Wait 1 Day Only', icon: '🏦', desc: 'Bank Wire' },
                        { id: 'DirectDeposit', label: 'Direct Deposit', time: 'Wait 1 Day Only', icon: '🏛️', desc: 'ACH Direct' }
                      ].map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setSelectedMethod(method.id as any);
                            setRecipientInput('');
                          }}
                          className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                            selectedMethod === method.id
                              ? 'border-amber-400 bg-amber-500/15 text-white shadow-md'
                              : 'border-white/10 bg-white/5 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <span className="text-xl">{method.icon}</span>
                          <span className="leading-tight text-xs font-bold">{method.label}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                            method.id === 'CashApp' ? 'text-emerald-400 bg-emerald-500/20' : 'text-amber-300 bg-amber-500/20'
                          }`}>
                            {method.time}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Account Handle */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-stone-300">
                        {selectedMethod === 'CashApp'
                          ? '$CashTag Handle (No email/Gmail needed)'
                          : selectedMethod === 'BankWire'
                          ? 'Bank Name, Routing & Account Number'
                          : 'Bank Routing & Account Number (ACH)'}
                      </label>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        {selectedMethod === 'CashApp' ? '⚡ Instant 0% Fee' : '⚡ Wait Only 1 Day'}
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={
                        selectedMethod === 'CashApp'
                          ? '$yourcashtag'
                          : selectedMethod === 'BankWire'
                          ? 'Chase Bank, Routing #123456789, Acct #987654321'
                          : 'Routing #123456789, Account #987654321'
                      }
                      value={recipientInput}
                      onChange={e => setRecipientInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-600 text-sm focus:outline-none focus:border-amber-400"
                    />
                    {selectedMethod === 'BankWire' && (
                      <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 font-medium">
                        <span>✓</span>
                        <span>Express Wire Guarantee: With wire transfer you wait only 1 day to receive your money.</span>
                      </p>
                    )}
                    {selectedMethod === 'DirectDeposit' && (
                      <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 font-medium">
                        <span>✓</span>
                        <span>Direct Deposit Guarantee: Funds deposited to your bank within 1 day with $0.00 withdrawal fees.</span>
                      </p>
                    )}
                    {selectedMethod === 'CashApp' && (
                      <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1 font-medium">
                        <span>✓</span>
                        <span>Instant Cash App Payout: Zero deposit required, 0% fees, paid instantly to your $cashtag!</span>
                      </p>
                    )}
                  </div>

                  {/* Amount to Withdraw */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-stone-300">
                        Withdraw Amount ($ USD)
                      </label>
                      <span className="text-[11px] text-stone-400">
                        Max: ${balance.toFixed(2)}
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-stone-400 font-mono text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.50"
                        max={balance}
                        required
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-600 text-sm font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Quick percentage buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleQuickAmount(0.25)}
                        className="flex-1 py-1 text-[11px] font-semibold bg-white/5 hover:bg-white/10 rounded-lg text-stone-300"
                      >
                        25%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAmount(0.5)}
                        className="flex-1 py-1 text-[11px] font-semibold bg-white/5 hover:bg-white/10 rounded-lg text-stone-300"
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAmount(1.0)}
                        className="flex-1 py-1 text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg"
                      >
                        All (100%)
                      </button>
                    </div>
                  </div>

                  {/* Fee Disclosure Notice */}
                  <div className="p-3 rounded-xl bg-stone-900/80 border border-white/5 text-[11px] text-stone-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Requested Payout:</span>
                      <span className="text-white font-mono">${(parseFloat(withdrawAmount) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deposit Requirement:</span>
                      <span className="text-emerald-400 font-semibold">$0.00 (None)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transfer & Withdrawal Fee:</span>
                      <span className="text-emerald-400 font-semibold">$0.00 (Zero Fees)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Time / Wait:</span>
                      <span className="text-amber-300 font-bold font-mono">
                        {selectedMethod === 'BankWire' ? 'Wait only 1 day (Express Wire)' : 'Instant (within minutes)'}
                      </span>
                    </div>
                    <div className="border-t border-white/5 pt-1 flex justify-between font-bold text-white">
                      <span>You Receive:</span>
                      <span className="text-emerald-400 font-mono">${(parseFloat(withdrawAmount) || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || balance <= 0 || (parseFloat(withdrawAmount) || 0) > balance}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      balance > 0 && (parseFloat(withdrawAmount) || 0) <= balance
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-[0.98]'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <span>Transferring Legit Funds...</span>
                    ) : (
                      <>
                        <span>Withdraw ${withdrawAmount || '0.00'} Now</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="space-y-2">
              {withdrawalHistory.length === 0 ? (
                <div className="py-12 text-center text-stone-500">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No payouts requested yet.</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Clear puzzle levels to earn cash prizes and withdraw anytime!
                  </p>
                </div>
              ) : (
                withdrawalHistory.map(tx => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-stone-900 border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          ${tx.amount.toFixed(2)} USD
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                          {tx.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 block mt-0.5">
                        {tx.method} · {tx.recipient}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {new Date(tx.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'ARCHITECTURE' && (
            <div className="space-y-3 text-xs text-stone-300">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Real-World Production Cashout Blueprint
                </h4>
                <p className="text-stone-400 leading-relaxed text-[11px]">
                  How real-money mobile games (e.g. Skillz, AviaGames, Papaya) pay out real legal currency to players without requiring deposits:
                </p>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-3 rounded-xl bg-stone-900 border border-white/5">
                  <span className="font-semibold text-white block">1. Skill-Based Legal Exemption</span>
                  <p className="text-stone-400 mt-0.5">
                    Unlike chance/gambling, tile matching games are legal games of skill in 40+ US states. Players earn cash prizes through skill competitions or sponsored reward pools.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-white/5">
                  <span className="font-semibold text-white block">2. Automated Cash App / ACH Banking APIs & Stripe Connect</span>
                  <p className="text-stone-400 mt-0.5">
                    Developers link their corporate payout treasury via instant payout endpoints (Cash App API, Stripe Connect, or modern FedNow/ACH rails). When a player hits "Withdraw", the server dispatches the funds directly to their $cashtag or bank with $0.00 player fees.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-white/5">
                  <span className="font-semibold text-white block">3. In-Game Ad Revenue Pool</span>
                  <p className="text-stone-400 mt-0.5">
                    "No-deposit" models fund the cash vault directly through Google AdMob rewarded video ads, interstitial sponsorships, and brand prize integrations, passing 30-50% back directly to winning players!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-white/5">
                  <span className="font-semibold text-white block">4. 1-Day Wire Transfer Processing</span>
                  <p className="text-stone-400 mt-0.5">
                    Express wire payouts leverage Same-Day ACH / FedNow real-time clearing networks so players wait only 1 day to receive money directly into their bank accounts with 0% withdrawal fees.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
