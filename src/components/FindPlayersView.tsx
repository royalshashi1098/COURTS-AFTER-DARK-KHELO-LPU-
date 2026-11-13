import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Clock,
  Award,
  CheckCircle2,
  Send,
  X,
  UserCheck,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import type { PlayerProfile, SportType, StudentUser } from '../types/index.ts';

interface FindPlayersViewProps {
  players: PlayerProfile[];
  onAddPlayer: (playerData: Partial<PlayerProfile> & { name: string; regNo: string }) => void;
  currentUser: StudentUser;
  onSendNotification: (title: string, body: string) => void;
}

const SPORTS_LIST: SportType[] = [
  'All',
  'Badminton',
  'Basketball',
  'Football',
  'Cricket',
  'Swimming',
  'Squash',
  'Tennis',
  'Volleyball',
  'Table Tennis',
  'Martial Arts',
  'Athletics',
];

export const FindPlayersView: React.FC<FindPlayersViewProps> = ({
  players,
  onAddPlayer,
  currentUser,
  onSendNotification,
}) => {
  const [selectedSport, setSelectedSport] = useState<SportType>('All');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invitedPlayerIds, setInvitedPlayerIds] = useState<string[]>([]);

  // Form states for adding player listing
  const [postSport, setPostSport] = useState<SportType>('Badminton');
  const [postSkill, setPostSkill] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Varsity Athlete'>('Intermediate');
  const [postTime, setPostTime] = useState<'Early Morning (6-9 AM)' | 'Afternoon (2-5 PM)' | 'Evening (5-8 PM)' | 'Late Evening (8-10 PM)' | 'Weekends'>('Evening (5-8 PM)');
  const [postGroupSize, setPostGroupSize] = useState<'Singles (1v1)' | 'Doubles (2v2)' | 'Team (Full Squad)' | 'Casual Practice'>('Doubles (2v2)');
  const [postBio, setPostBio] = useState('');
  const [postLookingFor, setPostLookingFor] = useState('');

  const filteredPlayers = players.filter((p) => {
    if (selectedSport !== 'All' && p.sport !== selectedSport) return false;
    if (selectedSkill !== 'All' && p.skillLevel !== selectedSkill) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSchool = p.school.toLowerCase().includes(q);
      const matchBio = p.bio.toLowerCase().includes(q);
      const matchLooking = p.lookingFor.toLowerCase().includes(q);
      return matchName || matchSchool || matchBio || matchLooking;
    }
    return true;
  });

  const handleSendInvite = (player: PlayerProfile) => {
    if (invitedPlayerIds.includes(player.id)) return;
    setInvitedPlayerIds([...invitedPlayerIds, player.id]);

    onSendNotification(
      'Match Team-Up Request Sent',
      `You invited ${player.name} (${player.sport}) for a session at LPU sports arena.`
    );
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPlayer({
      name: currentUser.name,
      regNo: currentUser.regNo,
      school: currentUser.school,
      sport: postSport,
      skillLevel: postSkill,
      preferredTime: postTime,
      groupSizePreferred: postGroupSize,
      bio: postBio || 'Regular player looking for sporting partners on campus.',
      lookingFor: postLookingFor || 'Match partner',
      availabilityDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    });
    setShowCreateModal(false);
    onSendNotification(
      'Player Listing Posted',
      `Your sports request for ${postSport} has been published on the community board.`
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            LPU Student Sports Community
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Find Players & Partners
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Team up for badminton doubles, basketball half-court runs, football scrimmages, or squash matches across campus.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post Player Wanted</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#0D172A] p-4 rounded-2xl border border-slate-800 mb-8 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by school, sport, or keyword..."
              className="w-full bg-[#080E1E] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#CCFF00]"
            />
          </div>

          {/* Skill Filter */}
          <div className="flex items-center gap-2 sm:w-56">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
            >
              <option value="All">All Skill Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Varsity Athlete">Varsity Athlete</option>
            </select>
          </div>
        </div>

        {/* Sport Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {SPORTS_LIST.map((sport) => {
            const isSelected = selectedSport === sport;
            return (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#CCFF00] text-black font-bold shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sport}
              </button>
            );
          })}
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlayers.map((player) => {
          const hasInvited = invitedPlayerIds.includes(player.id);

          return (
            <div
              key={player.id}
              className="rounded-2xl bg-[#0D172A] border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-md"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F1F3D] to-[#1E3A8A] border border-[#CCFF00]/30 flex items-center justify-center font-black text-sm text-[#CCFF00]">
                      {player.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{player.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        LPU ID: {player.regNoMasked}
                      </span>
                    </div>
                  </div>

                  {player.isSampleProfile ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                      Sample Profile
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase flex items-center gap-1">
                      <UserCheck className="w-2.5 h-2.5" />
                      Student Post
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 uppercase">
                    {player.sport}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-200">
                    {player.skillLevel}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300">
                    {player.groupSizePreferred}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed italic">
                  "{player.bio}"
                </p>

                {/* Looking For Highlight */}
                <div className="mt-3 p-2.5 rounded-xl bg-[#080E1E] border border-slate-800/80 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Looking For:
                  </span>
                  <span className="font-semibold text-white mt-0.5 block">
                    {player.lookingFor}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{player.preferredTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[11px] text-slate-400">School: {player.school}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleSendInvite(player)}
                  disabled={hasInvited}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    hasInvited
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-slate-800 hover:bg-[#CCFF00] hover:text-black text-white'
                  }`}
                >
                  {hasInvited ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Team-Up Invite Sent</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Team-Up Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-16 bg-[#0D172A] rounded-2xl border border-slate-800 p-8">
          <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No players match your filters</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your sport or skill filter, or create your own player wanted listing to kick off a match.
          </p>
        </div>
      )}

      {/* Post Player Wanted Modal */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0D172A] border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Post Player Wanted Listing</h3>
            <p className="text-xs text-slate-400 mb-5">
              Connect with fellow LPU students for games. Your personal contact number is never made public.
            </p>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Sport *</label>
                <select
                  value={postSport}
                  onChange={(e) => setPostSport(e.target.value as SportType)}
                  className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {SPORTS_LIST.filter((s) => s !== 'All').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Skill Level</label>
                  <select
                    value={postSkill}
                    onChange={(e) => setPostSkill(e.target.value as any)}
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Varsity Athlete">Varsity Athlete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Preferred Time</label>
                  <select
                    value={postTime}
                    onChange={(e) => setPostTime(e.target.value as any)}
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Early Morning (6-9 AM)">Early Morning (6-9 AM)</option>
                    <option value="Afternoon (2-5 PM)">Afternoon (2-5 PM)</option>
                    <option value="Evening (5-8 PM)">Evening (5-8 PM)</option>
                    <option value="Late Evening (8-10 PM)">Late Evening (8-10 PM)</option>
                    <option value="Weekends">Weekends</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">What are you looking for? *</label>
                <input
                  type="text"
                  required
                  value={postLookingFor}
                  onChange={(e) => setPostLookingFor(e.target.value)}
                  placeholder="e.g. 1 doubles partner for 6-7 PM slots at Block 28"
                  className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Short Bio & Playstyle</label>
                <textarea
                  rows={3}
                  value={postBio}
                  onChange={(e) => setPostBio(e.target.value)}
                  placeholder="Tell potential teammates about your stamina, position, and availability..."
                  className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#CCFF00] text-black font-extrabold uppercase tracking-wider"
                >
                  Post Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
