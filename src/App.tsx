import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { DirectoryView } from './components/DirectoryView.tsx';
import { FacilityModal } from './components/FacilityModal.tsx';
import { BookingFlow } from './components/BookingFlow.tsx';
import { AssistantView } from './components/AssistantView.tsx';
import { FindPlayersView } from './components/FindPlayersView.tsx';
import { TournamentsView } from './components/TournamentsView.tsx';
import { MyBookingsView } from './components/MyBookingsView.tsx';
import { AdminDashboardView } from './components/AdminDashboardView.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { LPU_FACILITIES, INITIAL_COMMUNITY_PLAYERS, INITIAL_TEAMS, INITIAL_TOURNAMENTS } from './data/lpuData.ts';
import type { Booking, Facility, PlayerProfile, PushNotification, SportsTeam, StudentUser, Tournament } from './types/index.ts';
import { ShieldCheck, Flame, Heart, ExternalLink, HelpCircle, Lock, Shield } from 'lucide-react';
import { db, testFirestoreConnection } from './firebase.ts';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('facilities');

  // Core domain data
  const [facilities, setFacilities] = useState<Facility[]>(LPU_FACILITIES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [players, setPlayers] = useState<PlayerProfile[]>(INITIAL_COMMUNITY_PLAYERS);
  const [teams, setTeams] = useState<SportsTeam[]>(INITIAL_TEAMS);
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);

  // Navigation targets
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<Facility | null>(null);
  const [preselectedFacilityForBooking, setPreselectedFacilityForBooking] = useState<Facility | null>(null);
  const [facilityToVerify, setFacilityToVerify] = useState<Facility | null>(null);

  // Admin authentication state modal
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // User state: check persistent localStorage for Sports Officer admin session
  const [currentUser, setCurrentUser] = useState<StudentUser>(() => {
    const isSavedAdmin = typeof window !== 'undefined' && localStorage.getItem('khelo_admin_auth') === 'true';
    if (isSavedAdmin) {
      return {
        id: 'user-admin-12627803',
        name: 'Sports Officer (Admin)',
        regNo: '12627803',
        school: 'LPU Directorate of Student Welfare & Sports Board',
        role: 'admin',
        email: 'admin.12627803@lpu.in',
      };
    }
    return {
      id: 'user-12201948',
      name: 'Aarav Sharma',
      regNo: '12201948',
      school: 'School of Computer Science & Engineering',
      role: 'student',
      email: 'aarav.12201948@lpu.in',
    };
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch facilities, bookings, players, teams, and tournaments from backend
  const loadData = async () => {
    try {
      const [facRes, bookRes, playerRes, teamRes, tourRes, notifRes] = await Promise.all([
        fetch('/api/facilities').catch(() => null),
        fetch('/api/bookings').catch(() => null),
        fetch('/api/players').catch(() => null),
        fetch('/api/teams').catch(() => null),
        fetch('/api/tournaments').catch(() => null),
        fetch('/api/notifications').catch(() => null),
      ]);

      if (facRes?.ok) {
        const d = await facRes.json();
        if (d.success && Array.isArray(d.data)) setFacilities(d.data);
      }
      if (bookRes?.ok) {
        const d = await bookRes.json();
        if (d.success && Array.isArray(d.data)) setBookings(d.data);
      }
      if (playerRes?.ok) {
        const d = await playerRes.json();
        if (d.success && Array.isArray(d.data)) setPlayers(d.data);
      }
      if (teamRes?.ok) {
        const d = await teamRes.json();
        if (d.success && Array.isArray(d.data)) setTeams(d.data);
      }
      if (tourRes?.ok) {
        const d = await tourRes.json();
        if (d.success && Array.isArray(d.data)) setTournaments(d.data);
      }
      if (notifRes?.ok) {
        const d = await notifRes.json();
        if (d.success && Array.isArray(d.data)) setNotifications(d.data);
      }
    } catch (e) {
      console.warn('Backend fetch failed, using cached initial state:', e);
    }
  };

  useEffect(() => {
    testFirestoreConnection();
    loadData();
  }, []);

  const handleAdminLoginSuccess = () => {
    localStorage.setItem('khelo_admin_auth', 'true');
    setCurrentUser({
      id: 'user-admin-12627803',
      name: 'Sports Officer (Admin)',
      regNo: '12627803',
      school: 'LPU Directorate of Student Welfare & Sports Board',
      role: 'admin',
      email: 'admin.12627803@lpu.in',
    });
    setCurrentTab('admin');
    showToast('Authenticated as Sports Officer (ID: 12627803). Admin controls unlocked.');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('khelo_admin_auth');
    setCurrentUser({
      id: 'user-12201948',
      name: 'Aarav Sharma',
      regNo: '12201948',
      school: 'School of Computer Science & Engineering',
      role: 'student',
      email: 'aarav.12201948@lpu.in',
    });
    if (currentTab === 'admin') {
      setCurrentTab('facilities');
    }
    showToast('Logged out from Sports Officer session.');
  };

  const handleSelectFacilityForBooking = (facility: Facility) => {
    setPreselectedFacilityForBooking(facility);
    setCurrentTab('book');
  };

  const handleBookingCreated = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    showToast(`Slot reserved for ${newBooking.facilityName} (Court #${newBooking.courtNumber}).`);
    try {
      setDoc(doc(db, 'bookings', newBooking.id), newBooking).catch((e) => {
        console.warn('Firestore booking persist notice:', e);
      });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
        );
        showToast('Demo booking cancelled and slot released.');
        try {
          updateDoc(doc(db, 'bookings', bookingId), { status: 'Cancelled' }).catch(() => {});
        } catch {}
      }
    } catch {
      showToast('Failed to cancel booking.');
    }
  };

  const handleAddPlayer = async (playerData: any) => {
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
      if (res.ok) {
        const d = await res.json();
        setPlayers((prev) => [d.data, ...prev]);
        showToast('Player wanted listing published to community board.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTeam = async (teamData: any) => {
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      if (res.ok) {
        const d = await res.json();
        setTeams((prev) => [d.data, ...prev]);
        showToast(`Team "${teamData.name}" created successfully.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinTeam = async (teamId: string, memberData: any) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      if (res.ok) {
        const d = await res.json();
        setTeams((prev) => prev.map((t) => (t.id === teamId ? d.data : t)));
        showToast('Added to team squad roster.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFacility = async (facilityData: Partial<Facility>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify(facilityData),
      });
      if (res.ok) {
        const d = await res.json();
        setFacilities((prev) => [d.data, ...prev]);
        showToast(`Playground "${d.data.name}" registered in campus directory.`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleUpdateFacility = async (facilityId: string, updates: Partial<Facility>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/facilities/${facilityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const d = await res.json();
        setFacilities((prev) => prev.map((f) => (f.id === facilityId ? d.data : f)));
        showToast('Facility status updated in university database.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleUpdateMatchScore = async (
    tournamentId: string,
    matchId: string,
    winnerTeamId: string,
    team1Score: string,
    team2Score: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify({ winnerTeamId, team1Score, team2Score }),
      });
      if (res.ok) {
        const d = await res.json();
        setTournaments((prev) => prev.map((t) => (t.id === tournamentId ? d.data : t)));
        showToast('Match score updated and winner advanced.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSendNotification = (title: string, body: string) => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      timestamp: 'Just now',
      type: 'announcement',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(title);
  };

  const handleMarkNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch('/api/notifications/mark-read', { method: 'POST' }).catch(() => {});
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080E1E] text-slate-100 font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Offline Toast Banner */}
      <OfflineIndicator />

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed top-20 right-4 z-50 bg-[#0D172A] border-2 border-[#CCFF00] text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn"
        >
          <Flame className="w-4 h-4 text-[#CCFF00] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        isAdmin={currentUser.role === 'admin'}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onAdminLogout={handleAdminLogout}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        bookingCount={bookings.filter((b) => b.status === 'Confirmed').length}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {currentTab === 'facilities' && (
          <DirectoryView
            facilities={facilities}
            onOpenDetails={(fac) => setSelectedFacilityForModal(fac)}
            onSelectForBooking={handleSelectFacilityForBooking}
            onNavigateToAssistant={() => setCurrentTab('assistant')}
            onNavigateToPlayers={() => setCurrentTab('players')}
            onNavigateToAdminWithFacility={(fac) => {
              setFacilityToVerify(fac);
              if (currentUser.role === 'admin') {
                setCurrentTab('admin');
              } else {
                showToast('Please authenticate with Sports Officer credentials to verify grounds.');
                setShowAdminLoginModal(true);
              }
            }}
          />
        )}

        {currentTab === 'book' && (
          <BookingFlow
            facilities={facilities}
            preselectedFacility={preselectedFacilityForBooking}
            currentUser={currentUser}
            onBookingCreated={handleBookingCreated}
            onViewMyBookings={() => setCurrentTab('my-bookings')}
          />
        )}

        {currentTab === 'assistant' && (
          <AssistantView
            onSelectFacilityForBooking={handleSelectFacilityForBooking}
            onOpenFacilityModal={(fac) => setSelectedFacilityForModal(fac)}
          />
        )}

        {currentTab === 'players' && (
          <FindPlayersView
            players={players}
            onAddPlayer={handleAddPlayer}
            currentUser={currentUser}
            onSendNotification={handleSendNotification}
          />
        )}

        {currentTab === 'tournaments' && (
          <TournamentsView
            tournaments={tournaments}
            teams={teams}
            currentUser={currentUser}
            onCreateTeam={handleCreateTeam}
            onJoinTeam={handleJoinTeam}
            onSendNotification={handleSendNotification}
          />
        )}

        {currentTab === 'my-bookings' && (
          <MyBookingsView
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onNavigateToBooking={() => setCurrentTab('book')}
          />
        )}

        {currentTab === 'admin' && (
          currentUser.role === 'admin' ? (
            <AdminDashboardView
              facilities={facilities}
              bookings={bookings}
              tournaments={tournaments}
              currentUser={currentUser}
              onCreateFacility={handleCreateFacility}
              onUpdateFacility={handleUpdateFacility}
              onCancelBooking={handleCancelBooking}
              onUpdateMatchScore={handleUpdateMatchScore}
              initialFacilityToVerify={facilityToVerify}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-[#0D172A] border border-amber-500/30 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">Sports Officer Access Restricted</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The LPU Sports Board administration dashboard is restricted to authorized Sports Officers. Please log in with your university credentials.
              </p>
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Sports Officer Login</span>
              </button>
            </div>
          )
        )}
      </main>

      {/* Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Facility Details Modal */}
      <FacilityModal
        facility={selectedFacilityForModal}
        onClose={() => setSelectedFacilityForModal(null)}
        onSelectForBooking={handleSelectFacilityForBooking}
      />

      {/* Footer with University Sports Disclaimers & PWA Standard Notes */}
      <footer className="mt-16 border-t border-slate-800 bg-[#060B18] text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#CCFF00] flex items-center justify-center font-black text-black text-xs">
                  K
                </div>
                <span className="font-extrabold text-white text-base">
                  KHELO <span className="text-[#CCFF00]">LPU</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The official student sports discovery and demonstration booking platform for Lovely Professional University.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Facilities Oct 2026</span>
              </div>
            </div>

            {/* Col 2: Campus Complexes */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white block mb-3">
                Campus Complexes
              </span>
              <ul className="space-y-2 text-xs">
                <li>Block 28 Shanti Devi Mittal Indoor Stadium</li>
                <li>Block 30 Olympic Aquatic Centre</li>
                <li>Baldev Raj Mittal Unipolis Grounds</li>
                <li>East Sector Cricket Oval & Practice Nets</li>
                <li>Block 13 Uni-Fitness Centre & Gym</li>
              </ul>
            </div>

            {/* Col 3: PWA & Security */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white block mb-3">
                PWA & Architecture
              </span>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>• Installable Progressive Web App (PWA)</li>
                <li>• Service Worker precaching & offline access</li>
                <li>• Strict conflict checking engine</li>
                <li>• Server-side Gemini 3.8 Flash API route</li>
                <li>• HTTPS secured deployment</li>
              </ul>
            </div>

            {/* Col 4: Prototype Disclaimer */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-3">
                Demonstration Disclaimer
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Facility rules, locations, and timings are verified against LPU DSW Sports Board bulletins. Slot reservations run in an interactive demonstration simulation and are not connected to the live university ERP/UMS database.
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                This platform installs via standard PWA web protocols and does not produce an Android APK or iOS App Store binary.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 Lovely Professional University • Department of Youth Capital & Student Welfare.
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentTab('facilities')} className="hover:text-white">Facilities</button>
              <button onClick={() => setCurrentTab('book')} className="hover:text-white">Book Slot</button>
              <button onClick={() => setCurrentTab('assistant')} className="hover:text-white">Sports AI</button>
              <button onClick={() => setCurrentTab('tournaments')} className="hover:text-white">Brackets</button>
              <button onClick={() => setCurrentTab('admin')} className="hover:text-white">Admin</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
