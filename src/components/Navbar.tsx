import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Sparkles,
  Users,
  Shield,
  Menu,
  X,
  Bell,
  MapPin,
  Flame,
  QrCode,
  Lock,
  LogOut,
  User,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import type { PushNotification, StudentUser } from '../types/index.ts';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: StudentUser;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  notifications: PushNotification[];
  onMarkNotificationsRead: () => void;
  bookingCount: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
  count?: number;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
  notifications,
  onMarkNotificationsRead,
  bookingCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const baseNavItems: NavItem[] = [
    { id: 'facilities', label: 'Nearby Playgrounds', icon: MapPin },
    { id: 'book', label: 'Reserve Slot', icon: Calendar, badge: 'Live' },
    { id: 'assistant', label: 'AI Concierge', icon: Sparkles, highlight: true },
    { id: 'players', label: 'Find Players', icon: Users },
    { id: 'tournaments', label: 'Brackets & Teams', icon: Trophy },
    { id: 'my-bookings', label: 'My Passes', icon: QrCode, count: bookingCount },
  ];

  // Admin Dashboard nav item only accessible if authenticated as admin
  const navItems: NavItem[] = isAdmin
    ? [...baseNavItems, { id: 'admin', label: 'Admin Dashboard', icon: Shield, isAdmin: true }]
    : baseNavItems;

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#080E1E]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('facilities')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            aria-label="KHELO LPU Home"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F1F3D] to-[#1E3A8A] border border-[#CCFF00]/40 flex items-center justify-center shadow-lg group-hover:border-[#CCFF00] transition">
              <Flame className="w-5 h-5 text-[#CCFF00] group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#CCFF00] rounded-full animate-ping opacity-75" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white">KHELO</span>
                <span className="font-black text-base tracking-wider text-[#CCFF00]">LPU</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block leading-none tracking-tight">
                Lovely Professional University
              </span>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#CCFF00] text-black shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-black' : item.highlight ? 'text-[#CCFF00]' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-[#CCFF00]/20 text-[#CCFF00] rounded-full">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-black text-[#CCFF00]' : 'bg-[#CCFF00] text-black'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Install PWA, Notifications, Admin Login / Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button in Header */}
          <PWAInstallButton variant="header" />

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                if (!showNotifMenu && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
              aria-label="View match updates and booking reminders"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#CCFF00] text-black text-[10px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0D172A] border border-slate-700 shadow-2xl p-4 z-50 text-slate-100 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#CCFF00]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Live Updates</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{notifications.length} alerts</span>
                </div>

                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifMenu(false);
                        if (n.link) handleNavClick(n.link.replace('/', ''));
                      }}
                      className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition cursor-pointer border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                        <span>{n.title}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-snug">{n.body}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowNotifMenu(false)}
                  className="mt-3 w-full py-1.5 text-center text-xs text-slate-400 hover:text-white border-t border-slate-800 pt-2 cursor-pointer"
                >
                  Close notifications
                </button>
              </div>
            )}
          </div>

          {/* Student Info Pill (when not admin) */}
          {!isAdmin && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <User className="w-3.5 h-3.5 text-[#CCFF00]" />
              <div className="text-left">
                <span className="block text-[11px] font-bold text-white leading-tight">
                  {currentUser.name}
                </span>
                <span className="block text-[9px] text-slate-400 font-mono">
                  Reg #{currentUser.regNo}
                </span>
              </div>
            </div>
          )}

          {/* Restricted Admin Authentication Section */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                }`}
                title="Sports Officer Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
              <button
                onClick={onAdminLogout}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer"
                title="Logout from Admin Mode"
                aria-label="Logout Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 text-amber-400 text-xs font-bold transition cursor-pointer shadow-sm"
              title="Restricted Sports Officer Authentication"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white cursor-pointer"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#080E1E] px-4 pt-3 pb-6 space-y-1.5 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#CCFF00] text-black font-bold shadow'
                    : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-black' : item.highlight ? 'text-[#CCFF00]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-black text-[#CCFF00]' : 'bg-[#CCFF00]/20 text-[#CCFF00]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800 mt-2 space-y-2">
            {isAdmin ? (
              <button
                onClick={() => {
                  onAdminLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-bold cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-rose-400" />
                  Logout Admin Session
                </span>
                <span>Exit</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAdminLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-bold cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Sports Officer Admin Login
                </span>
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
