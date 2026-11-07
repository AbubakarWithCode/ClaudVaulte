import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { PlanTier, UpgradeRequest } from '../../types';
import {
  X,
  Zap,
  Check,
  Shield,
  CreditCard,
  Building2,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Loader2,
  Copy,
  AlertCircle,
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlanId?: 'pro' | 'business';
}

const PLANS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free Starter',
    storageLabel: '5 GB',
    storageBytes: 5 * 1024 * 1024 * 1024,
    pricePKR: 0,
    priceUSD: 0,
    period: 'forever',
    features: ['5 GB High-Speed Storage', 'Standard 100MB file uploads', 'Public link sharing', 'Basic file preview'],
  },
  {
    id: 'pro',
    name: 'Pro Cloud',
    storageLabel: '100 GB',
    storageBytes: 100 * 1024 * 1024 * 1024,
    pricePKR: 1499,
    priceUSD: 4.99,
    period: '/ month',
    popular: true,
    features: [
      '100 GB Enterprise NVMe Cloud Storage',
      'Max 5 GB single file uploads',
      'Password-protected link sharing',
      'Instant 4K video & media streaming',
      'Priority 24/7 dedicated support',
    ],
  },
  {
    id: 'business',
    name: 'Business Vault',
    storageLabel: '1 TB (1,000 GB)',
    storageBytes: 1024 * 1024 * 1024 * 1024,
    pricePKR: 4999,
    priceUSD: 19.99,
    period: '/ month',
    features: [
      '1,000 GB (1 TB) Mass Storage',
      'Unlimited file upload size',
      'Multi-team folders & organization',
      'Full revision history & trash retention',
      'Dedicated SLA & custom domain support',
    ],
  },
];

export default function UpgradeModal({ isOpen, onClose, defaultPlanId = 'pro' }: UpgradeModalProps) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<'pro' | 'business'>(defaultPlanId);
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa' | 'sadapay' | 'bank' | 'card'>('jazzcash');
  const [trxId, setTrxId] = useState('');
  const [senderInfo, setSenderInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmitRequest = async (instantActivate: boolean = false) => {
    if (!user) return;
    if (!instantActivate && !trxId.trim()) {
      setError('Please provide a valid Transaction ID / Reference Number.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newRequest: UpgradeRequest = {
      requestId,
      userId: user.uid,
      userEmail: user.email || '',
      userName: user.displayName || userProfile?.displayName || 'User',
      planId: selectedPlan.id as 'pro' | 'business',
      planName: selectedPlan.name,
      storageBytes: selectedPlan.storageBytes,
      amount: currency === 'PKR' ? selectedPlan.pricePKR : selectedPlan.priceUSD,
      currency,
      paymentMethod,
      trxId: instantActivate ? `INSTANT_DEMO_${Date.now()}` : trxId.trim(),
      notes: senderInfo.trim() || (instantActivate ? 'Activated via Instant Demo' : ''),
      status: instantActivate ? 'approved' : 'pending',
      createdAt: now,
      updatedAt: now,
    };

    try {
      // 1. Save upgrade request in Firestore
      await setDoc(doc(db, 'upgradeRequests', requestId), newRequest);

      // 2. If instant activation is selected, also boost the user's storage limit immediately!
      if (instantActivate) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(
          userDocRef,
          {
            storageLimit: selectedPlan.storageBytes,
            plan: selectedPlan.id,
            planStatus: 'active',
            updatedAt: now,
          },
          { merge: true }
        );
        await refreshUserProfile();
      }

      setSubmitting(false);
      setSuccess(true);
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.message || 'Failed to submit payment request.');
      handleFirestoreError(err, OperationType.WRITE, `upgradeRequests/${requestId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Upgrade Your Cloud Storage</h2>
              <p className="text-xs text-blue-100">
                Unlock high-capacity cloud storage with instant local & international payment options
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency switch */}
            <div className="flex bg-black/20 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCurrency('PKR')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currency === 'PKR' ? 'bg-white text-blue-600' : 'text-white/80 hover:text-white'
                }`}
              >
                PKR (Rs)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currency === 'USD' ? 'bg-white text-blue-600' : 'text-white/80 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {success ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Request Submitted!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Your plan upgrade request has been registered. If you used instant activation, your quota of{' '}
                  <strong className="text-blue-600">{selectedPlan.storageLabel}</strong> is now live on your account!
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm mx-auto text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage Capacity:</span>
                  <span className="font-bold text-emerald-600">{selectedPlan.storageLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {currency === 'PKR' ? `Rs. ${selectedPlan.pricePKR}` : `$${selectedPlan.priceUSD}`}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Plan Selection Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  1. Select Your Storage Plan
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PLANS.filter((p) => p.id !== 'free').map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id as 'pro' | 'business')}
                        className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-md shadow-blue-500/10'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                            MOST POPULAR
                          </span>
                        )}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{plan.name}</h4>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                                {currency === 'PKR' ? `Rs. ${plan.pricePKR}` : `$${plan.priceUSD}`}
                              </span>
                              <span className="text-xs text-slate-400">{plan.period}</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-xs rounded-xl">
                            {plan.storageLabel}
                          </span>
                        </div>

                        <ul className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  2. Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('jazzcash')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'jazzcash'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-rose-500" />
                    <span className="text-xs">JazzCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('easypaisa')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'easypaisa'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs">Easypaisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('sadapay')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'sadapay'
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-cyan-500" />
                    <span className="text-xs">SadaPay / Bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs">Card / Online</span>
                  </button>
                </div>

                {/* Account Details for selected method */}
                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Account Details to Send Payment:</span>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      Amount: {currency === 'PKR' ? `Rs. ${selectedPlan.pricePKR}` : `$${selectedPlan.priceUSD}`}
                    </span>
                  </div>

                  {paymentMethod === 'jazzcash' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">JazzCash Account</p>
                          <p className="font-mono font-bold text-slate-900 dark:text-white">0300 1234567</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('03001234567', 'jazz')}
                          className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 font-semibold"
                        >
                          {copiedKey === 'jazz' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'jazz' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">Account Title: <strong>CloudVault SaaS Storage</strong></p>
                    </div>
                  )}

                  {paymentMethod === 'easypaisa' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Easypaisa Account</p>
                          <p className="font-mono font-bold text-slate-900 dark:text-white">0345 1234567</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('03451234567', 'ep')}
                          className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 font-semibold"
                        >
                          {copiedKey === 'ep' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'ep' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">Account Title: <strong>CloudVault SaaS Storage</strong></p>
                    </div>
                  )}

                  {paymentMethod === 'sadapay' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">SadaPay IBAN</p>
                          <p className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                            PK64SADA00001234567890
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('PK64SADA00001234567890', 'sada')}
                          className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1 font-semibold"
                        >
                          {copiedKey === 'sada' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'sada' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">Bank: <strong>SadaPay MFB</strong> | Title: <strong>CloudVault SaaS</strong></p>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        Instant Online Card Simulation
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Supports Visa, Mastercard, UnionPay and American Express with instant webhook confirmation.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction ID & Submission */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  3. Enter Payment Proof / TRX ID
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. TRX982736412 / Receipt ID"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={senderInfo}
                      onChange={(e) => setSenderInfo(e.target.value)}
                      placeholder="Sender Name / Phone (Optional)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  {/* Standard Submit */}
                  <button
                    type="button"
                    onClick={() => handleSubmitRequest(false)}
                    disabled={submitting}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Submit Payment Proof ({currency === 'PKR' ? `Rs. ${selectedPlan.pricePKR}` : `$${selectedPlan.priceUSD}`})</span>
                  </button>

                  {/* Instant Demo Activation */}
                  <button
                    type="button"
                    onClick={() => handleSubmitRequest(true)}
                    disabled={submitting}
                    title="Instantly activates this storage tier on your account for live testing"
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Instant Demo Activate (Test Now)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
