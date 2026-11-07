import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
  setDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UpgradeRequest } from '../types';
import {
  ShieldAlert,
  Users,
  HardDrive,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  ExternalLink,
  Smartphone,
  CreditCard,
  Building2,
  Loader2,
  Check,
} from 'lucide-react';

const ADMIN_EMAIL = 'abubakartaj69@gmail.com';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'calculator'>('requests');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [requestsList, setRequestsList] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Calculator state
  const [projectedUsers, setProjectedUsers] = useState<number>(50);
  const [avgPlanPricePKR, setAvgPlanPricePKR] = useState<number>(1499);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Listen to Users and Upgrade Requests
  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    // 1. Listen to users collection
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as UserProfile);
        });
        setUsersList(list);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
        setLoading(false);
      }
    );

    // 2. Listen to upgradeRequests collection
    const qRequests = query(collection(db, 'upgradeRequests'), orderBy('createdAt', 'desc'));
    const unsubRequests = onSnapshot(
      qRequests,
      (snapshot) => {
        const list: UpgradeRequest[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as UpgradeRequest);
        });
        setRequestsList(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'upgradeRequests');
      }
    );

    return () => {
      unsubUsers();
      unsubRequests();
    };
  }, [isAdmin]);

  // Handle Approve Request
  const handleApproveRequest = async (req: UpgradeRequest) => {
    setActionLoadingId(req.requestId);
    try {
      const now = new Date().toISOString();

      // 1. Update request status in upgradeRequests
      await updateDoc(doc(db, 'upgradeRequests', req.requestId), {
        status: 'approved',
        updatedAt: now,
      });

      // 2. Boost the user's storage limit and plan in users/{userId}
      await setDoc(
        doc(db, 'users', req.userId),
        {
          storageLimit: req.storageBytes,
          plan: req.planId,
          planStatus: 'active',
          updatedAt: now,
        },
        { merge: true }
      );

      setActionLoadingId(null);
    } catch (err: any) {
      setActionLoadingId(null);
      console.error('Error approving request:', err);
    }
  };

  // Handle Reject Request
  const handleRejectRequest = async (req: UpgradeRequest) => {
    setActionLoadingId(req.requestId);
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'upgradeRequests', req.requestId), {
        status: 'rejected',
        updatedAt: now,
      });
      setActionLoadingId(null);
    } catch (err: any) {
      setActionLoadingId(null);
      console.error('Error rejecting request:', err);
    }
  };

  // Manual Quota Change for Any User
  const handleSetUserQuota = async (targetUser: UserProfile, newBytes: number, planLabel: string) => {
    setActionLoadingId(targetUser.userId);
    try {
      await updateDoc(doc(db, 'users', targetUser.userId), {
        storageLimit: newBytes,
        plan: planLabel.toLowerCase(),
        planStatus: 'active',
        updatedAt: new Date().toISOString(),
      });
      setActionLoadingId(null);
    } catch (err: any) {
      setActionLoadingId(null);
      console.error('Error updating quota:', err);
    }
  };

  // If user is not admin
  if (!isAdmin) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This dashboard and SaaS earning management portal is restricted to the platform owner:
          </p>
          <p className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 pt-1">
            {ADMIN_EMAIL}
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Currently signed in as: <strong>{user?.email || 'Guest'}</strong>
        </p>
      </div>
    );
  }

  // Calculations
  const totalUsersCount = usersList.length;
  const totalStorageLimitBytes = usersList.reduce((acc, u) => acc + (u.storageLimit || 0), 0);
  const totalStorageUsedBytes = usersList.reduce((acc, u) => acc + (u.storageUsed || 0), 0);
  const pendingRequestsCount = requestsList.filter((r) => r.status === 'pending').length;

  const totalRevenuePKR = requestsList
    .filter((r) => r.status === 'approved' && r.currency === 'PKR')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalRevenueUSD = requestsList
    .filter((r) => r.status === 'approved' && r.currency === 'USD')
    .reduce((acc, r) => acc + r.amount, 0);

  const filteredRequests = requestsList.filter((r) => {
    if (requestFilter === 'all') return true;
    return r.status === requestFilter;
  });

  const filteredUsers = usersList.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.displayName.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
              Master Admin
            </span>
            <span className="text-xs text-slate-300">CloudVault SaaS & Earning Control</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">Platform Admin & Monetization Hub</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage registered users, approve subscription upgrades, and monitor revenue
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'requests' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Upgrade Requests ({pendingRequestsCount})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            All Users ({totalUsersCount})
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'calculator' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Earning Calculator
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Registered Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalUsersCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Free quota: 50,000 MAU free tier</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Storage Limit</span>
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{formatBytes(totalStorageLimitBytes)}</p>
          <p className="text-[11px] text-slate-400">Used: {formatBytes(totalStorageUsedBytes)} across platform</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Approved Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            Rs. {totalRevenuePKR.toLocaleString()} {totalRevenueUSD > 0 && `+ $${totalRevenueUSD}`}
          </p>
          <p className="text-[11px] text-slate-400">From paid subscription upgrades</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Upgrade Proofs</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500">{pendingRequestsCount}</p>
          <p className="text-[11px] text-slate-400">Awaiting your approval click</p>
        </div>
      </div>

      {/* Tab 1: Upgrade Requests Queue */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Subscription Upgrade Queue</h2>
              <p className="text-xs text-slate-400">
                Review payment proof submissions (JazzCash, Easypaisa, SadaPay, Card) and 1-click approve
              </p>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRequestFilter(filter)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    requestFilter === filter
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No upgrade requests found matching '{requestFilter}'.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Plan & Storage</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method & TRX ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequests.map((req) => (
                    <tr key={req.requestId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-medium">
                        <p className="text-slate-900 dark:text-white font-bold">{req.userName || 'User'}</p>
                        <p className="text-[11px] text-slate-400">{req.userEmail}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-blue-600">{req.planName}</span>
                        <p className="text-[11px] text-slate-400">{formatBytes(req.storageBytes)}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {req.currency === 'PKR' ? `Rs. ${req.amount}` : `$${req.amount}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 capitalize">
                          {req.paymentMethod === 'jazzcash' && <Smartphone className="w-3.5 h-3.5 text-rose-500" />}
                          {req.paymentMethod === 'easypaisa' && <Smartphone className="w-3.5 h-3.5 text-emerald-500" />}
                          {req.paymentMethod === 'sadapay' && <Building2 className="w-3.5 h-3.5 text-cyan-500" />}
                          {req.paymentMethod === 'card' && <CreditCard className="w-3.5 h-3.5 text-indigo-500" />}
                          <span>{req.paymentMethod}</span>
                        </div>
                        <p className="font-mono text-[10px] text-slate-500 mt-0.5">TRX: {req.trxId}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Pending Proof
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveRequest(req)}
                              disabled={actionLoadingId === req.requestId}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              {actionLoadingId === req.requestId ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req)}
                              disabled={actionLoadingId === req.requestId}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {req.status === 'approved' && (
                          <span className="text-[11px] text-emerald-600 font-semibold">Active Quota Granted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Quota Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Registered Users & Storage Quotas</h2>
              <p className="text-xs text-slate-400">
                Directly boost or adjust storage limits for any registered user in 1 click
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user email or name..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Current Usage</th>
                  <th className="py-3 px-4">Assigned Limit</th>
                  <th className="py-3 px-4">Plan Status</th>
                  <th className="py-3 px-4 text-right">Quick Set Quota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const usedPct = Math.min(100, Math.round(((u.storageUsed || 0) / (u.storageLimit || 1)) * 100));
                  return (
                    <tr key={u.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {u.displayName?.charAt(0) || u.email?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white font-bold">{u.displayName}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatBytes(u.storageUsed || 0)}
                        </p>
                        <p className="text-[10px] text-slate-400">{usedPct}% of allocated limit</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">
                          {formatBytes(u.storageLimit || 0)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {u.plan || 'Free'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleSetUserQuota(u, 5 * 1024 * 1024 * 1024, 'free')}
                            title="Reset to 5 GB Free"
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            5 GB
                          </button>
                          <button
                            onClick={() => handleSetUserQuota(u, 100 * 1024 * 1024 * 1024, 'pro')}
                            title="Grant 100 GB Pro"
                            className="px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            100 GB
                          </button>
                          <button
                            onClick={() => handleSetUserQuota(u, 1024 * 1024 * 1024 * 1024, 'business')}
                            title="Grant 1 TB Business"
                            className="px-2 py-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            1 TB
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: SaaS Earning & Profit Calculator */}
      {activeTab === 'calculator' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>SaaS Business & Revenue Projection Model</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              See your projected monthly and annual profit margin based on paying subscribers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Interactive Inputs */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Paid Users: <strong className="text-blue-600">{projectedUsers} Subscribers</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={projectedUsers}
                  onChange={(e) => setProjectedUsers(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 users</span>
                  <span>100 users</span>
                  <span>500 users</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Average Monthly Subscription Fee (PKR)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={avgPlanPricePKR}
                    onChange={(e) => setAvgPlanPricePKR(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => setAvgPlanPricePKR(1499)}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-[11px] font-semibold rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Pro (Rs 1,499)
                  </button>
                  <button
                    onClick={() => setAvgPlanPricePKR(4999)}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-[11px] font-semibold rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    1 TB (Rs 4,999)
                  </button>
                </div>
              </div>

              {/* Cloud cost analysis */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Google Cloud Storage Cost:</p>
                <p className="text-[11px] text-slate-500">
                  Google charges ~$0.026 per GB/month (~Rs. 720 per 100 GB). Since users rarely use 100% of their quota immediately, your actual cloud cost is typically ~Rs. 300 to 450 per user!
                </p>
              </div>
            </div>

            {/* Profit Projections Output */}
            {(() => {
              const grossRevenueMonthlyPKR = projectedUsers * avgPlanPricePKR;
              const estimatedCloudCostPKR = projectedUsers * 450; // Average actual storage bill
              const netProfitMonthlyPKR = Math.max(0, grossRevenueMonthlyPKR - estimatedCloudCostPKR);
              const netProfitYearlyPKR = netProfitMonthlyPKR * 12;

              return (
                <div className="p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl shadow-xl space-y-4">
                  <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Projected Profit Margin
                  </span>

                  <div>
                    <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold">Monthly Net Profit (MRR)</p>
                    <p className="text-3xl font-black text-white mt-1">
                      Rs. {netProfitMonthlyPKR.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-200 mt-0.5">
                      (~${Math.round(netProfitMonthlyPKR / 278)} USD / month)
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/20">
                    <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold">Annual Projected Earnings</p>
                    <p className="text-2xl font-black text-amber-300 mt-1">
                      Rs. {netProfitYearlyPKR.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-200 mt-0.5">
                      (~${Math.round(netProfitYearlyPKR / 278).toLocaleString()} USD / year)
                    </p>
                  </div>

                  <div className="p-3 bg-black/20 rounded-xl text-[11px] text-blue-100 space-y-0.5">
                    <p>✓ <strong>Gross Income:</strong> Rs. {grossRevenueMonthlyPKR.toLocaleString()} / mo</p>
                    <p>✓ <strong>Estimated Storage Cost:</strong> Rs. {estimatedCloudCostPKR.toLocaleString()} / mo</p>
                    <p className="text-amber-300 font-bold">✓ Net Profit Margin: ~65% - 75% pure profit</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
