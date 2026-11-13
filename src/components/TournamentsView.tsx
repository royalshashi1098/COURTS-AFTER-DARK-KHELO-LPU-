import React, { useState } from 'react';
import {
  Trophy,
  Shield,
  Users,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  Bell,
  X,
  UserPlus,
  Phone,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { validateLpuRegNo, validatePhoneNumber } from '../utils/bookingRules.ts';
import type { SportsTeam, StudentUser, Tournament, TournamentMatch } from '../types/index.ts';

interface TournamentsViewProps {
  tournaments: Tournament[];
  teams: SportsTeam[];
  currentUser: StudentUser;
  onCreateTeam: (teamData: any) => void;
  onJoinTeam: (teamId: string, memberData: any) => void;
  onSendNotification: (title: string, body: string) => void;
  onSelectVenueForBooking?: (venueName: string) => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  tournaments,
  teams,
  currentUser,
  onCreateTeam,
  onJoinTeam,
  onSendNotification,
}) => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    tournaments.length > 0 ? tournaments[0].id : ''
  );
  const [activeTab, setActiveTab] = useState<'brackets' | 'teams'>('brackets');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState<SportsTeam | null>(null);

  // Reminders tracked
  const [matchReminders, setMatchReminders] = useState<string[]>([]);

  // Team creation form
  const [teamName, setTeamName] = useState('');
  const [teamSport, setTeamSport] = useState('Badminton');
  const [teamSchool, setTeamSchool] = useState(currentUser.school);
  const [captainName, setCaptainName] = useState(currentUser.name);
  const [captainRegNo, setCaptainRegNo] = useState(currentUser.regNo);
  const [captainPhone, setCaptainPhone] = useState('9876543210');
  const [jerseyColor, setJerseyColor] = useState('#CCFF00');
  const [teamMotto, setTeamMotto] = useState('');
  const [teamError, setTeamError] = useState<string | null>(null);

  // Join team form
  const [joinPosition, setJoinPosition] = useState('Player');

  const currentTournament =
    tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0];

  const handleToggleReminder = (match: TournamentMatch) => {
    if (matchReminders.includes(match.id)) {
      setMatchReminders(matchReminders.filter((id) => id !== match.id));
      onSendNotification(
        'Reminder Cancelled',
        `Cancelled match alert for ${match.team1.name} vs ${match.team2.name}.`
      );
    } else {
      setMatchReminders([...matchReminders, match.id]);
      onSendNotification(
        'Match Reminder Set!',
        `You will receive a notification 30 minutes before ${match.team1.name} vs ${match.team2.name} at ${match.venue}.`
      );

      // Trigger Web Notification API if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`KHELO LPU: Reminder Set for Match #${match.matchNumber}`, {
          body: `${match.team1.name} vs ${match.team2.name} at ${match.venue} (${match.scheduledTime})`,
          icon: '/pwa-192x192.png',
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError(null);

    if (!validateLpuRegNo(captainRegNo)) {
      setTeamError('Please enter a valid 8-digit LPU Registration Number.');
      return;
    }

    if (!validatePhoneNumber(captainPhone)) {
      setTeamError('Please enter a valid 10-digit mobile number for team coordination.');
      return;
    }

    onCreateTeam({
      name: teamName,
      sport: teamSport,
      schoolDepartment: teamSchool,
      captainName,
      captainRegNo,
      captainPhone,
      jerseyColor,
      motto: teamMotto,
    });
    setShowCreateTeamModal(false);
    onSendNotification(
      'Sports Team Created!',
      `Team "${teamName}" is now registered for LPU inter-school fixtures.`
    );
  };

  const handleJoinTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showJoinTeamModal) return;

    onJoinTeam(showJoinTeamModal.id, {
      memberName: currentUser.name,
      memberRegNo: currentUser.regNo,
      role: 'Player',
      position: joinPosition,
    });

    onSendNotification(
      'Joined Team Roster',
      `You joined ${showJoinTeamModal.name} as a ${joinPosition}.`
    );
    setShowJoinTeamModal(null);
  };

  // Group matches by round
  const qfMatches = currentTournament?.matches.filter((m) => m.round === 'Quarterfinals') || [];
  const sfMatches = currentTournament?.matches.filter((m) => m.round === 'Semifinals') || [];
  const finalMatches = currentTournament?.matches.filter((m) => m.round === 'Finals') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            LPU Inter-Department & Hostel Leagues
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Tournaments, Brackets & Teams
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Follow live playoff progression, track match scores, set instant reminders, and register your school sports team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Student Team</span>
          </button>
        </div>
      </div>

      {/* Main Switcher: Brackets vs Teams */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('brackets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'brackets'
              ? 'bg-[#CCFF00] text-black shadow'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Live Match Brackets</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'teams'
              ? 'bg-[#CCFF00] text-black shadow'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Student Teams ({teams.length})</span>
        </button>
      </div>

      {/* BRACKETS TAB */}
      {activeTab === 'brackets' && currentTournament && (
        <div className="space-y-6">
          {/* Tournament Overview Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0F1F3D] to-[#0A162B] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#CCFF00] text-black uppercase">
                  {currentTournament.sport}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                  {currentTournament.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {currentTournament.status}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-2">
                {currentTournament.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" />
                  {currentTournament.venue}
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Prize: {currentTournament.prizePool}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {currentTournament.startDate} to {currentTournament.endDate}
                </span>
              </div>
            </div>

            {/* Tournament Selector Dropdown */}
            <div className="sm:text-right shrink-0">
              <label htmlFor="tournament-select" className="text-[10px] font-mono text-slate-400 block mb-1">
                Select Championship:
              </label>
              <select
                id="tournament-select"
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Interactive Tournament Bracket Visualizer */}
          <div className="overflow-x-auto pb-4 scrollbar-thin">
            <div className="min-w-[760px] grid grid-cols-3 gap-6 bg-[#080E1E] p-6 rounded-2xl border border-slate-800">
              {/* Column 1: Quarterfinals */}
              <div className="space-y-4">
                <div className="text-center pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Quarterfinals
                  </h3>
                  <span className="text-[10px] text-slate-400">Best of 3 sets</span>
                </div>

                <div className="space-y-4">
                  {qfMatches.map((m) => {
                    const hasReminder = matchReminders.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className="rounded-xl bg-[#0D172A] border border-slate-800 p-3.5 shadow-md hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                          <span className="font-mono">Match #{m.matchNumber} • {m.scheduledTime}</span>
                          <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                            m.status === 'Completed' ? 'bg-slate-800 text-slate-400' : m.status === 'Live' ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {m.status}
                          </span>
                        </div>

                        {/* Team 1 */}
                        <div className={`p-2 rounded-lg flex items-center justify-between text-xs font-bold mb-1.5 ${
                          m.team1.isWinner ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60' : 'bg-slate-900 text-slate-200'
                        }`}>
                          <span className="truncate max-w-[140px]">{m.team1.name}</span>
                          <span className="font-mono text-xs">{m.team1.score || '-'}</span>
                        </div>

                        {/* Team 2 */}
                        <div className={`p-2 rounded-lg flex items-center justify-between text-xs font-bold ${
                          m.team2.isWinner ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60' : 'bg-slate-900 text-slate-200'
                        }`}>
                          <span className="truncate max-w-[140px]">{m.team2.name}</span>
                          <span className="font-mono text-xs">{m.team2.score || '-'}</span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[120px]">{m.venue}</span>
                          <button
                            onClick={() => handleToggleReminder(m)}
                            className={`p-1 rounded hover:bg-slate-800 flex items-center gap-1 ${hasReminder ? 'text-[#CCFF00]' : 'text-slate-400'}`}
                            title="Toggle match notification reminder"
                          >
                            <Bell className="w-3 h-3" />
                            <span>{hasReminder ? 'Alert Set' : 'Remind'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Semifinals */}
              <div className="space-y-4">
                <div className="text-center pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Semifinals
                  </h3>
                  <span className="text-[10px] text-slate-400">Winners advance to Grand Final</span>
                </div>

                <div className="space-y-8 pt-4">
                  {sfMatches.map((m) => {
                    const hasReminder = matchReminders.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className="rounded-xl bg-[#0D172A] border-2 border-slate-800 hover:border-[#CCFF00]/40 p-3.5 shadow-lg transition"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                          <span className="font-mono">SF #{m.matchNumber} • {m.scheduledTime}</span>
                          <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                            m.status === 'Completed' ? 'bg-slate-800 text-slate-400' : m.status === 'Live' ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {m.status}
                          </span>
                        </div>

                        {/* Team 1 */}
                        <div className={`p-2 rounded-lg flex items-center justify-between text-xs font-bold mb-1.5 ${
                          m.team1.isWinner ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60' : 'bg-slate-900 text-slate-200'
                        }`}>
                          <span className="truncate max-w-[140px]">{m.team1.name}</span>
                          <span className="font-mono text-xs">{m.team1.score || '-'}</span>
                        </div>

                        {/* Team 2 */}
                        <div className={`p-2 rounded-lg flex items-center justify-between text-xs font-bold ${
                          m.team2.isWinner ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60' : 'bg-slate-900 text-slate-200'
                        }`}>
                          <span className="truncate max-w-[140px]">{m.team2.name}</span>
                          <span className="font-mono text-xs">{m.team2.score || '-'}</span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[120px]">{m.venue}</span>
                          <button
                            onClick={() => handleToggleReminder(m)}
                            className={`p-1 rounded hover:bg-slate-800 flex items-center gap-1 ${hasReminder ? 'text-[#CCFF00]' : 'text-slate-400'}`}
                          >
                            <Bell className="w-3 h-3" />
                            <span>{hasReminder ? 'Alert Set' : 'Remind'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 3: Grand Final */}
              <div className="space-y-4">
                <div className="text-center pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#CCFF00] flex items-center justify-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    Championship Final
                  </h3>
                  <span className="text-[10px] text-slate-400">University Title & Chancellor Cup</span>
                </div>

                <div className="pt-12">
                  {finalMatches.map((m) => {
                    const hasReminder = matchReminders.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className="rounded-2xl bg-gradient-to-b from-[#0F1F3D] to-[#080E1E] border-2 border-[#CCFF00] p-4 shadow-2xl"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                          <span className="font-bold text-[#CCFF00]">{m.scheduledTime}</span>
                          <span className="font-bold px-2 py-0.5 rounded text-[9px] bg-[#CCFF00] text-black">
                            {m.status}
                          </span>
                        </div>

                        {/* Finalist 1 */}
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between text-xs font-bold mb-2">
                          <span className="text-white truncate max-w-[140px]">{m.team1.name}</span>
                          <span className="font-mono text-xs">{m.team1.score || 'TBD'}</span>
                        </div>

                        {/* Finalist 2 */}
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between text-xs font-bold">
                          <span className="text-white truncate max-w-[140px]">{m.team2.name}</span>
                          <span className="font-mono text-xs">{m.team2.score || 'TBD'}</span>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                          <span className="font-semibold text-white">{m.venue}</span>
                          <button
                            onClick={() => handleToggleReminder(m)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              hasReminder ? 'bg-[#CCFF00] text-black' : 'bg-slate-800 text-white hover:bg-slate-700'
                            }`}
                          >
                            <Bell className="w-3 h-3" />
                            <span>{hasReminder ? 'Alert Active' : 'Set Final Alert'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEAMS TAB */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-2xl bg-[#0D172A] border border-slate-800 p-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition"
            >
              <div>
                {/* Team Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-sm shadow-md"
                      style={{ backgroundColor: team.jerseyColor }}
                    >
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{team.name}</h3>
                      <span className="text-xs text-[#CCFF00] font-semibold">{team.sport}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {team.members.length}/{team.maxRosterSize} players
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-1 italic">
                  "{team.motto}"
                </p>

                <div className="mt-3 p-3 rounded-xl bg-[#080E1E] border border-slate-800/80 text-xs space-y-1.5">
                  <div className="text-slate-400 text-[11px]">
                    School: <strong className="text-white">{team.schoolDepartment}</strong>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Captain: <strong className="text-white">{team.captainName}</strong> (Reg #{team.captainRegNo})
                  </div>
                  {/* Creator / Captain Contact with One-Tap Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
                      <span>+91 {team.captainPhone || '9876543210'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${(team.captainPhone || '9876543210').replace(/\D/g, '')}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-[10px] flex items-center gap-1 transition"
                        title={`Call ${team.captainName}`}
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                      <a
                        href={`https://wa.me/91${(team.captainPhone || '9876543210').replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hi ${team.captainName}, I am an LPU student reaching out regarding joining team "${team.name}" on KHELO LPU.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1 transition"
                        title={`WhatsApp ${team.captainName}`}
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                {/* Team Roster List */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Current Squad Roster:
                  </span>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {team.members.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-slate-900/60 px-2.5 py-1 rounded-lg text-slate-300"
                      >
                        <span>{m.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {m.role} {m.position ? `(${m.position})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setShowJoinTeamModal(team)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-[#CCFF00] hover:text-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Request to Join Team</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0D172A] border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowCreateTeamModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Create Student Sports Team</h3>
            <p className="text-xs text-slate-400 mb-5">
              Form an intramural, departmental, or hostel sports team for LPU leagues.
            </p>

            {teamError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{teamError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. CSE Cyber Smashers or BH-4 Warriors"
                  className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Sport *</label>
                  <select
                    value={teamSport}
                    onChange={(e) => setTeamSport(e.target.value)}
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#CCFF00]"
                  >
                    <option value="Badminton">Badminton</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Tennis">Tennis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Jersey Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={jerseyColor}
                      onChange={(e) => setJerseyColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                    />
                    <span className="font-mono text-slate-300">{jerseyColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">School / Hostel / Department</label>
                <input
                  type="text"
                  value={teamSchool}
                  onChange={(e) => setTeamSchool(e.target.value)}
                  placeholder="e.g. School of Computer Science & Engineering"
                  className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Captain Name *</label>
                  <input
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Captain Reg No (8-digit ID) *</label>
                  <input
                    type="text"
                    required
                    pattern="[1-9][0-9]{7}"
                    maxLength={8}
                    value={captainRegNo}
                    onChange={(e) => setCaptainRegNo(e.target.value)}
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
              </div>

              {/* Mandatory Captain Phone Number for Team Coordination */}
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">
                  Captain / Coordinator Mobile Number * (Visible to Squad)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-mono text-xs select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={captainPhone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setCaptainPhone(cleaned);
                      if (teamError) setTeamError(null);
                    }}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2 bg-[#080E1E] border border-slate-700 rounded-xl text-white font-mono tracking-wider focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Required 10-digit Indian mobile number. Team members can tap to Call or WhatsApp you directly.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Team Motto / Bio</label>
                <input
                  type="text"
                  value={teamMotto}
                  onChange={(e) => setTeamMotto(e.target.value)}
                  placeholder="e.g. Play with passion, represent LPU"
                  className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold uppercase tracking-wider cursor-pointer shadow-lg"
                >
                  Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinTeamModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-[#0D172A] border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowJoinTeamModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Join {showJoinTeamModal.name}
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Submit your student profile to Captain {showJoinTeamModal.captainName}.
            </p>

            {/* Captain Contact Card with One-Tap Actions */}
            <div className="p-3 mb-4 rounded-xl bg-[#080E1E] border border-slate-800 text-xs">
              <div className="text-[11px] text-slate-400 mb-1">Team Captain & Coordinator:</div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">{showJoinTeamModal.captainName}</span>
                <span className="font-mono text-[10px] text-slate-400">Reg #{showJoinTeamModal.captainRegNo}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                  <Phone className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>+91 {showJoinTeamModal.captainPhone || '9876543210'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${(showJoinTeamModal.captainPhone || '9876543210').replace(/\D/g, '')}`}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/91${(showJoinTeamModal.captainPhone || '9876543210').replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hi ${showJoinTeamModal.captainName}, I am ${currentUser.name} (Reg #${currentUser.regNo}). I would like to join your team "${showJoinTeamModal.name}" on KHELO LPU.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <form onSubmit={handleJoinTeamSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Player Name & Reg No:</span>
                <span className="font-bold text-white block">{currentUser.name} (Reg #{currentUser.regNo})</span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Preferred Position / Role</label>
                <input
                  type="text"
                  required
                  value={joinPosition}
                  onChange={(e) => setJoinPosition(e.target.value)}
                  placeholder="e.g. Striker / Point Guard / Doubles Shuttler"
                  className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoinTeamModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  Confirm Joining
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
