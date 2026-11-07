import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Cloud,
  Shield,
  Zap,
  FolderLock,
  Share2,
  HardDrive,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Lock,
  Eye,
  Server,
  Star,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Modern Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Cloud<span className="text-blue-600">Vault</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#security" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Security
            </a>
            <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Reviews
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Cloud Storage & File Organization</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Your Files. Your Cloud.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Your Control.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Store, preview, organize, and share documents, high-res photos, videos, and archives with 5 GB free cloud storage powered by real Firebase infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Get Started Free (5 GB Included)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore Features</span>
            </a>
          </div>

          {/* Cloud Storage Dashboard Mockup Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-3 bg-gradient-to-b from-slate-200/60 to-slate-300/30 dark:from-slate-800/60 dark:to-slate-900/40 shadow-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
              {/* Simulated window top bar */}
              <div className="h-10 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-mono text-slate-400">cloudvault.app/dashboard</span>
                <div className="w-12" />
              </div>

              {/* Mock Dashboard body */}
              <div className="p-6 text-left grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Mock sidebar */}
                <div className="hidden md:block col-span-1 space-y-3 border-r border-slate-100 dark:border-slate-800 pr-4">
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-600">
                    <Cloud className="w-4 h-4" />
                    <span>CloudVault</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-semibold">
                      Overview
                    </div>
                    <div className="p-2 text-slate-500">My Files</div>
                    <div className="p-2 text-slate-500">My Folders</div>
                    <div className="p-2 text-slate-500">Shared Links</div>
                  </div>
                  <div className="pt-6">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 text-[11px]">
                      <div className="flex justify-between font-semibold">
                        <span>Storage</span>
                        <span>1.4 GB / 5 GB</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="w-1/4 h-full bg-blue-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock main area */}
                <div className="col-span-1 md:col-span-3 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Active Cloud Vault</h4>
                      <p className="text-[11px] text-slate-400">Encrypted AES-256 cloud partition</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-lg text-[10px] font-bold">
                      LIVE SYNCED
                    </span>
                  </div>

                  {/* Grid of sample files */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="h-16 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs mb-2">
                        IMG_2026.png
                      </div>
                      <p className="text-xs font-semibold truncate">Q3_Product_Design.png</p>
                      <p className="text-[10px] text-slate-400">4.2 MB • Image</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="h-16 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 font-bold text-xs mb-2">
                        PDF
                      </div>
                      <p className="text-xs font-semibold truncate">Annual_Report_2026.pdf</p>
                      <p className="text-[10px] text-slate-400">12.8 MB • PDF</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="h-16 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-xs mb-2">
                        DOCX
                      </div>
                      <p className="text-xs font-semibold truncate">Client_Contract.docx</p>
                      <p className="text-[10px] text-slate-400">850 KB • Document</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Engineered for Speed, Reliability, and Simplicity
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Everything you need to store your digital files without friction, intrusive ads, or complex storage limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl w-fit shadow-md shadow-blue-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Instant Resumable Uploads</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Drag and drop multiple files simultaneously with real-time transfer progress, size validation, and mime-type detection.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="p-3 bg-purple-600 text-white rounded-2xl w-fit shadow-md shadow-purple-500/20">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Public & Private Link Sharing</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Generate shareable links with a single click. Configure view-only or download permissions, and revoke access whenever you want.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl w-fit shadow-md shadow-emerald-500/20">
                <FolderLock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Directory Organization</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Create custom color-coded folders, move files between directories, and manage your files just like a desktop operating system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl space-y-5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Zero-Trust Architecture</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Enterprise-grade security guarding every single byte.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                CloudVault enforces rigorous Firestore security rules and scoped Cloud Storage path tokens. No unauthorized user can list, read, or tamper with your files.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Strict Tenant Isolation</h4>
                    <p className="text-[11px] text-slate-400">Files and metadata are restricted to authenticated owners.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Encrypted at Rest & in Transit</h4>
                    <p className="text-[11px] text-slate-400">SSL/TLS 1.3 transport security with AES-256 cloud encryption.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-blue-500/10 blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pricing</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Transparent, Fair Storage Plans
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Start with 5 GB free forever. Upgrade seamlessly as your storage needs scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border-2 border-blue-500 relative shadow-xl space-y-6 flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                Current Plan
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Free Starter</h3>
                  <p className="text-xs text-slate-500 mt-1">Perfect for personal files and backups</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs text-slate-400">/ forever</span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>5 GB Secure Cloud Storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Multi-File Drag & Drop Uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Folder Hierarchy Organization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Public Share Links</span>
                  </div>
                </div>
              </div>

              <Link
                to={user ? '/dashboard' : '/register'}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl text-center shadow-md transition-colors"
              >
                {user ? 'Go to Dashboard' : 'Sign Up Free'}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pro Vault</h3>
                  <p className="text-xs text-slate-500 mt-1">For freelancers and creators</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$9</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>2 TB (2,000 GB) Storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Priority High-Speed Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Custom Link Expiration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>30-Day Version History</span>
                  </div>
                </div>
              </div>

              <button
                disabled
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold rounded-xl text-center"
              >
                Coming Soon
              </button>
            </div>

            {/* Business Plan */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enterprise Team</h3>
                  <p className="text-xs text-slate-500 mt-1">For teams, agencies, and studios</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$24</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>10 TB High-Capacity Storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Multi-User Roles & Audit Logs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Dedicated SLA Support</span>
                  </div>
                </div>
              </div>

              <button
                disabled
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold rounded-xl text-center"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Trusted by Professionals Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "CloudVault replaced my fragmented storage services. The speed of file uploads and clean interface makes organizing client assets effortless."
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Marcus Vance</p>
                <p className="text-[10px] text-slate-400">Lead Product Designer</p>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "The sharing controls are clean and straightforward. Generating a link and sending it to partners takes literally 3 seconds."
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Sarah Lin</p>
                <p className="text-[10px] text-slate-400">Engineering Manager</p>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "Real Firebase authentication and accurate storage accounting. I love knowing exactly how many bytes I have left."
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">David K.</p>
                <p className="text-[10px] text-slate-400">Independent Filmmaker</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white">CloudVault</span>
            </div>
            <p className="text-xs text-slate-400">
              Modern cloud storage SaaS for high performance file synchronization and privacy.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <div className="space-y-2 text-xs">
              <div><Link to="/login" className="hover:text-white">Sign In</Link></div>
              <div><Link to="/register" className="hover:text-white">Create Account</Link></div>
              <div><Link to="/dashboard" className="hover:text-white">Dashboard</Link></div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Product</h4>
            <div className="space-y-2 text-xs">
              <div><a href="#features" className="hover:text-white">Features</a></div>
              <div><a href="#security" className="hover:text-white">Security Architecture</a></div>
              <div><a href="#pricing" className="hover:text-white">5 GB Free Tier</a></div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Security</h4>
            <p className="text-xs text-slate-400">
              Protected by Firebase Authentication & Firestore ABAC rules.
            </p>
            <div className="mt-3 text-[11px] text-slate-500">
              © {new Date().getFullYear()} CloudVault Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
