import React from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  Globe2,
  Languages,
  Activity,
  LogIn,
  LogOut,
  UserCheck,
  Database,
} from 'lucide-react';
import { LanguageCode, UserRole } from '../types/civic';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activePortal: 'citizen' | 'authority' | 'transparency';
  onPortalChange: (portal: 'citizen' | 'authority' | 'transparency') => void;
  activeLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeHazardsCount: number;
  onOpenHazardsModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePortal,
  onPortalChange,
  activeLanguage,
  onLanguageChange,
  userRole,
  onRoleChange,
  activeHazardsCount,
  onOpenHazardsModal,
  onOpenAuthModal,
}) => {
  const { user, profile, signOut, isConfigured } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-[#1E293B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#059669] flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg tracking-tight text-white">
                  CivicAI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 bg-[#059669]/20 text-[#10B981] border border-[#059669]/30 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Supabase Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                From Citizen Voice to Civic Action
              </p>
            </div>
          </div>

          {/* Portal Switcher Tabs */}
          <nav className="flex items-center gap-1 bg-[#1E293B] p-1 rounded-md border border-slate-700/60">
            <button
              onClick={() => onPortalChange('citizen')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                activePortal === 'citizen'
                  ? 'bg-[#059669] text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Citizen Portal</span>
              <span className="sm:hidden">Citizen</span>
            </button>

            <button
              onClick={() => onPortalChange('authority')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                activePortal === 'authority'
                  ? 'bg-[#059669] text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Authority Command</span>
              <span className="sm:hidden">Authority</span>
            </button>

            <button
              onClick={() => onPortalChange('transparency')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                activePortal === 'transparency'
                  ? 'bg-[#059669] text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Transparency</span>
              <span className="sm:hidden">Transparency</span>
            </button>
          </nav>

          {/* Right Controls: Hazards, Language, User Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Hazard Alerts Indicator */}
            {activeHazardsCount > 0 && (
              <button
                onClick={onOpenHazardsModal}
                className="flex items-center gap-1.5 bg-[#DC2626]/20 border border-[#DC2626]/40 hover:bg-[#DC2626]/30 text-rose-300 px-2.5 py-1.5 rounded-full text-xs font-semibold animate-pulse transition"
                title="Active Public Safety Hazard Dispatches"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Safety Alerts:</span>
                <span className="bg-[#DC2626] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {activeHazardsCount}
                </span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="relative flex items-center bg-[#1E293B] rounded border border-slate-700/60 px-2 py-1 text-xs text-slate-300">
              <Languages className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <select
                value={activeLanguage}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-[#0F172A] text-white">English (EN)</option>
                <option value="kn" className="bg-[#0F172A] text-white">ಕನ್ನಡ (KN)</option>
                <option value="hi" className="bg-[#0F172A] text-white">हिंदी (HI)</option>
              </select>
            </div>

            {/* Auth Session / Profile State */}
            {user ? (
              <div className="flex items-center gap-2 bg-[#1E293B] rounded border border-slate-700/60 px-2.5 py-1 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center font-bold text-[10px] text-white">
                  {(profile?.name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="font-semibold text-white text-xs truncate max-w-[100px]">
                    {profile?.name || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-400 uppercase font-medium">
                    {profile?.role || userRole}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-slate-400 hover:text-rose-300 p-1 rounded"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
