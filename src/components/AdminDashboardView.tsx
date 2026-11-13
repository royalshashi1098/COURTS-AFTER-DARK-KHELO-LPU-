import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  Award,
  Lock,
  UserCheck,
  Plus,
  MapPin,
  X,
  Footprints,
  Compass,
  Home,
  Building,
  Image as ImageIcon,
  Phone,
} from 'lucide-react';
import type { Booking, Facility, StudentUser, Tournament, SportType, FacilityType, AccessStatus } from '../types/index.ts';

interface AdminDashboardViewProps {
  facilities: Facility[];
  bookings: Booking[];
  tournaments: Tournament[];
  currentUser: StudentUser;
  onCreateFacility: (facilityData: Partial<Facility>) => Promise<boolean>;
  onUpdateFacility: (facilityId: string, updates: Partial<Facility>) => Promise<boolean>;
  onCancelBooking: (bookingId: string) => void;
  onUpdateMatchScore: (
    tournamentId: string,
    matchId: string,
    winnerId: string,
    team1Score: string,
    team2Score: string
  ) => Promise<boolean>;
  initialFacilityToVerify?: Facility | null;
}

const ALL_SPORTS: SportType[] = [
  'Badminton',
  'Basketball',
  'Football',
  'Cricket',
  'Swimming',
  'Gymnasium',
  'Squash',
  'Tennis',
  'Volleyball',
  'Table Tennis',
  'Martial Arts',
  'Athletics',
  'Open Play & General Sports',
];

const ALL_FACILITY_TYPES: FacilityType[] = [
  'Open Playing Ground',
  'Hostel Recreational Court',
  'Outdoor Court',
  'Indoor Arena',
  'Practice Turf & Nets',
  'Championship Stadium',
  'Aquatic Centre',
  'Fitness Center',
];

const ALL_ACCESS_STATUSES: AccessStatus[] = [
  'Open Free Play',
  'Demo Reservation Required',
  'Hostel Residents Only',
  'Coached & Team Sessions',
];

const HOSTEL_OPTIONS = [
  'BH-1', 'BH-2', 'BH-3', 'BH-4', 'BH-5', 'BH-6', 'BH-7', 'BH-8',
  'GH-1', 'GH-2', 'GH-3', 'GH-4', 'GH-5', 'GH-6',
  'Uni-Apartments',
];

const BLOCK_OPTIONS = [
  'Block 13', 'Block 28', 'Block 29', 'Block 30',
  'Block 32', 'Block 33', 'Block 34', 'Block 36',
  'Block 38', 'Block 55', 'Unipolis',
];

const PHOTO_PRESETS = [
  { label: 'Outdoor Grass Field', url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Synthetic Turf Pitch', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Outdoor Basketball Court', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Indoor Badminton Arena', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Volleyball Court', url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Olympic Pool', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Fitness Center / Gym', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80' },
];

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  facilities,
  bookings,
  tournaments,
  currentUser,
  onCreateFacility,
  onUpdateFacility,
  onCancelBooking,
  onUpdateMatchScore,
  initialFacilityToVerify,
}) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'bookings' | 'referee'>('facilities');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Playground Edit / Create State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    name: '',
    sport: 'Football' as SportType,
    supportedSports: ['Football', 'Open Play & General Sports'] as SportType[],
    classification: 'Outdoor' as 'Indoor' | 'Outdoor',
    facilityType: 'Open Playing Ground' as FacilityType,
    exactLocation: '',
    campusBlock: '',
    hasVerifiedCoordinates: true,
    lat: '31.2460',
    lng: '75.7040',
    nearbyHostels: [] as string[],
    nearbyAcademicBlocks: [] as string[],
    publishedQuantity: '1 Verified Pitch',
    courtCount: 1,
    description: '',
    equipmentInfo: 'Equipment available from caretaker with LPU Student ID.',
    image: PHOTO_PRESETS[0].url,
    mapLink: '',
    openingHours: '06:00 AM - 09:30 PM',
    fees: 'Free of charge for bona fide LPU students',
    accessStatus: 'Open Free Play' as AccessStatus,
    accessRules: 'Valid LPU Student ID required\nProper sports shoes mandatory\nRespect hostel quiet hours',
    availabilityStatus: 'Available' as 'Available' | 'Limited Slots' | 'Maintenance' | 'Events Only',
    officialSource: 'LPU Sports Board Administration 2026',
    isVerified: true,
  });

  // If prompted with an initial facility to verify (e.g. from the map/directory)
  useEffect(() => {
    if (initialFacilityToVerify) {
      handleOpenEditModal(initialFacilityToVerify);
    }
  }, [initialFacilityToVerify]);

  const handleOpenCreateModal = () => {
    setEditingFacility(null);
    setFormData({
      name: '',
      sport: 'Football',
      supportedSports: ['Football'],
      classification: 'Outdoor',
      facilityType: 'Open Playing Ground',
      exactLocation: 'Near Boys Hostel 7, East Campus Sector, LPU Main Campus',
      campusBlock: 'BH-7 Quadrangle',
      hasVerifiedCoordinates: true,
      lat: '31.2465',
      lng: '75.7065',
      nearbyHostels: ['BH-7', 'BH-8'],
      nearbyAcademicBlocks: ['Block 55'],
      publishedQuantity: '1 Regulation Field',
      courtCount: 1,
      description: 'Lush open outdoor grass field for student football, frisbee, and intramural practice.',
      equipmentInfo: 'Bring personal football. Goalposts with mesh rigged.',
      image: PHOTO_PRESETS[0].url,
      mapLink: 'https://www.google.com/maps/search/?api=1&query=LPU+Sports+Grounds',
      openingHours: '06:00 AM - 09:00 PM',
      fees: 'Free for LPU students',
      accessStatus: 'Open Free Play',
      accessRules: 'Valid LPU Student ID required\nClean athletic shoes mandatory\nDispose of trash in bins',
      availabilityStatus: 'Available',
      officialSource: 'LPU DSW Sports Council Inspection',
      isVerified: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      sport: facility.sport,
      supportedSports: facility.supportedSports || [facility.sport],
      classification: facility.classification,
      facilityType: facility.facilityType,
      exactLocation: facility.exactLocation,
      campusBlock: facility.campusBlock,
      hasVerifiedCoordinates: facility.hasVerifiedCoordinates,
      lat: facility.coordinates?.lat ? String(facility.coordinates.lat) : '31.2460',
      lng: facility.coordinates?.lng ? String(facility.coordinates.lng) : '75.7040',
      nearbyHostels: facility.nearbyHostels || [],
      nearbyAcademicBlocks: facility.nearbyAcademicBlocks || [],
      publishedQuantity: facility.publishedQuantity,
      courtCount: facility.courtCount,
      description: facility.description,
      equipmentInfo: facility.equipmentInfo,
      image: facility.image,
      mapLink: facility.mapLink,
      openingHours: facility.openingHours,
      fees: facility.fees,
      accessStatus: facility.accessStatus,
      accessRules: facility.accessRules.join('\n'),
      availabilityStatus: facility.availabilityStatus,
      officialSource: facility.officialSource,
      isVerified: facility.isVerified,
    });
    setIsCreateModalOpen(true);
  };

  const handleToggleHostel = (hostel: string) => {
    setFormData((prev) => ({
      ...prev,
      nearbyHostels: prev.nearbyHostels.includes(hostel)
        ? prev.nearbyHostels.filter((h) => h !== hostel)
        : [...prev.nearbyHostels, hostel],
    }));
  };

  const handleToggleBlock = (block: string) => {
    setFormData((prev) => ({
      ...prev,
      nearbyAcademicBlocks: prev.nearbyAcademicBlocks.includes(block)
        ? prev.nearbyAcademicBlocks.filter((b) => b !== block)
        : [...prev.nearbyAcademicBlocks, block],
    }));
  };

  const handleToggleSupportedSport = (sport: SportType) => {
    setFormData((prev) => ({
      ...prev,
      supportedSports: prev.supportedSports.includes(sport)
        ? prev.supportedSports.filter((s) => s !== sport)
        : [...prev.supportedSports, sport],
    }));
  };

  const handleSavePlaygroundForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Playground/facility name is required.' });
      return;
    }

    if (currentUser.role !== 'admin') {
      setFeedbackMsg({
        type: 'error',
        text: 'Action restricted: Only verified LPU Sports Officers can mutate facility records. Please switch to the Admin role in the top header.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const parsedLat = parseFloat(formData.lat);
    const parsedLng = parseFloat(formData.lng);
    const hasValidCoords =
      formData.hasVerifiedCoordinates &&
      !isNaN(parsedLat) &&
      !isNaN(parsedLng) &&
      parsedLat > 31.0 &&
      parsedLat < 31.5;

    const payload: Partial<Facility> = {
      name: formData.name.trim(),
      sport: formData.sport,
      supportedSports: formData.supportedSports.length > 0 ? formData.supportedSports : [formData.sport],
      classification: formData.classification,
      facilityType: formData.facilityType,
      exactLocation: formData.exactLocation.trim(),
      campusBlock: formData.campusBlock.trim() || 'Central Campus',
      coordinates: hasValidCoords ? { lat: parsedLat, lng: parsedLng } : undefined,
      hasVerifiedCoordinates: hasValidCoords,
      nearbyHostels: formData.nearbyHostels,
      nearbyAcademicBlocks: formData.nearbyAcademicBlocks,
      publishedQuantity: formData.publishedQuantity.trim() || '1 Unit',
      courtCount: Number(formData.courtCount) || 1,
      description: formData.description.trim(),
      equipmentInfo: formData.equipmentInfo.trim(),
      image: formData.image.trim(),
      mapLink:
        formData.mapLink.trim() ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.name + ' LPU')}`,
      openingHours: formData.openingHours.trim(),
      fees: formData.fees.trim(),
      accessStatus: formData.accessStatus,
      accessRules: formData.accessRules
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      availabilityStatus: formData.availabilityStatus,
      officialSource: formData.officialSource.trim(),
      isVerified: formData.isVerified,
      lastVerificationDate: new Date().toISOString().split('T')[0],
    };

    let success = false;
    if (editingFacility) {
      success = await onUpdateFacility(editingFacility.id, payload);
    } else {
      success = await onCreateFacility(payload);
    }

    setIsSubmitting(false);

    if (success) {
      setFeedbackMsg({
        type: 'success',
        text: editingFacility
          ? `Playground "${formData.name}" successfully updated and verified in university database.`
          : `New playground "${formData.name}" successfully registered in verified campus directory.`,
      });
      setIsCreateModalOpen(false);
      setEditingFacility(null);
    } else {
      setFeedbackMsg({
        type: 'error',
        text: 'Server rejected the request. Ensure user role is set to sports administrator.',
      });
    }
  };

  // Referee scoring form
  const [selectedTourId, setSelectedTourId] = useState(tournaments[0]?.id || '');
  const [selectedMatchId, setSelectedMatchId] = useState(tournaments[0]?.matches[0]?.id || '');
  const [team1ScoreInput, setTeam1ScoreInput] = useState('21-18, 21-15');
  const [team2ScoreInput, setTeam2ScoreInput] = useState('18-21, 15-21');
  const [winnerTeamIdInput, setWinnerTeamIdInput] = useState('');

  const currentTour = tournaments.find((t) => t.id === selectedTourId) || tournaments[0];
  const currentMatch = currentTour?.matches.find((m) => m.id === selectedMatchId) || currentTour?.matches[0];

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTour || !currentMatch || !winnerTeamIdInput) {
      setFeedbackMsg({ type: 'error', text: 'Please select the winning team.' });
      return;
    }

    if (currentUser.role !== 'admin') {
      setFeedbackMsg({
        type: 'error',
        text: 'Action restricted: Only LPU Sports Officers / Referees can advance tournament match brackets.',
      });
      return;
    }

    setIsSubmitting(true);
    const success = await onUpdateMatchScore(
      currentTour.id,
      currentMatch.id,
      winnerTeamIdInput,
      team1ScoreInput,
      team2ScoreInput
    );
    setIsSubmitting(false);

    if (success) {
      setFeedbackMsg({
        type: 'success',
        text: `Updated match #${currentMatch.matchNumber} scores and advanced winner.`,
      });
    } else {
      setFeedbackMsg({
        type: 'error',
        text: 'Server rejected referee update. Ensure user has admin role.',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Admin Title & Security Status Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            LPU Sports Officer & Grounds Administration Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Facility & Playground Verification Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Register new outdoor grounds, manage verified GPS coordinates, associate nearby hostels/blocks, and update availability status.
          </p>
        </div>

        {/* Security Role Badge with Authorization Notice */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-right shrink-0">
          <div className="flex items-center justify-end gap-2 text-slate-300">
            <Lock className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>Server Authorization:</span>
            <span
              className={`font-black uppercase px-2 py-0.5 rounded text-[11px] ${
                currentUser.role === 'admin'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {currentUser.role === 'admin'
              ? '✓ Full write authorization for campus playgrounds'
              : '⚠️ Student mode (read-only) • Click "Switch to Sports Officer" in header'}
          </span>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div
          role="alert"
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'facilities'
                ? 'bg-[#CCFF00] text-black shadow'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Playgrounds & Facilities ({facilities.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-[#CCFF00] text-black shadow'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Reservations Log ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('referee')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'referee'
                ? 'bg-[#CCFF00] text-black shadow'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Referee Scoring Desk
          </button>
        </div>

        {activeTab === 'facilities' && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-[#CCFF00]/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Playground</span>
          </button>
        )}
      </div>

      {/* 1. FACILITIES MANAGEMENT TAB */}
      {activeTab === 'facilities' && (
        <div className="space-y-4">
          <div className="bg-[#0D172A] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#080E1E] text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Playground / Facility</th>
                    <th className="py-3.5 px-4">Type & Environment</th>
                    <th className="py-3.5 px-4">Location & Coordinates</th>
                    <th className="py-3.5 px-4">Nearby Hostels / Blocks</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Verified</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {facilities.map((fac) => (
                    <tr key={fac.id} className="hover:bg-slate-800/40 transition">
                      {/* Name & Sport */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="font-bold text-sm text-white">{fac.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-[#CCFF00] font-mono">{fac.sport}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400">{fac.accessStatus}</span>
                        </div>
                      </td>

                      {/* Type & Indoor/Outdoor */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-200 block font-medium">{fac.facilityType}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{fac.classification}</span>
                      </td>

                      {/* Location & GPS */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 truncate max-w-[160px]">{fac.campusBlock}</div>
                        {fac.hasVerifiedCoordinates && fac.coordinates ? (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {fac.coordinates.lat.toFixed(4)}, {fac.coordinates.lng.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            Coords Unverified
                          </span>
                        )}
                      </td>

                      {/* Hostels & Blocks */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-slate-300 truncate max-w-[160px]">
                          <strong>Hostels:</strong> {fac.nearbyHostels.join(', ') || 'Campus wide'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          <strong>Blocks:</strong> {fac.nearbyAcademicBlocks.join(', ') || 'N/A'}
                        </div>
                      </td>

                      {/* Availability */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            fac.availabilityStatus === 'Available'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : fac.availabilityStatus === 'Limited Slots'
                              ? 'bg-amber-400/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {fac.availabilityStatus}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {fac.isVerified ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Unverified
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block">{fac.lastVerificationDate}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(fac)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-[#CCFF00] hover:text-black text-white text-xs font-bold transition cursor-pointer"
                        >
                          Edit & Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEMO BOOKINGS AUDIT TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-[#0D172A] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">Demo Reservations Audit Log</h3>
              <p className="text-xs text-slate-400">All demonstration bookings created across campus.</p>
            </div>
            <span className="text-xs font-mono text-[#CCFF00]">{bookings.length} total entries</span>
          </div>

          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{b.facilityName}</span>
                    <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-[#CCFF00]">
                      Court #{b.courtNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'Confirmed'
                          ? 'text-emerald-400 bg-emerald-500/20'
                          : 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Student: <strong className="text-white">{b.studentName}</strong> (Reg #{b.studentRegNo})
                    </span>
                    <span>
                      Contact Phone: <a
                        href={`tel:${(b.phoneNumber || '9876543210').replace(/\D/g, '')}`}
                        className="font-mono text-[#CCFF00] hover:underline font-bold inline-flex items-center gap-1 ml-1"
                        title="Call student"
                      >
                        <Phone className="w-3 h-3 text-[#CCFF00]" />
                        +91 {b.phoneNumber || '9876543210'}
                      </a>
                    </span>
                    <span>
                      Date: <strong className="text-white">{b.date}</strong>
                    </span>
                    <span>
                      Slot: <strong className="text-white">{b.slotTime}</strong>
                    </span>
                  </div>
                </div>

                {b.status === 'Confirmed' && (
                  <button
                    onClick={() => onCancelBooking(b.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. REFEREE SCORING TAB */}
      {activeTab === 'referee' && currentTour && (
        <form
          onSubmit={handleScoreSubmit}
          className="bg-[#0D172A] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5 max-w-2xl mx-auto"
        >
          <div>
            <h3 className="font-bold text-white text-base">Match Referee Scoring Desk</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit official match set scores and advance the winning team in the playoff tree.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">Tournament</label>
              <select
                value={selectedTourId}
                onChange={(e) => {
                  setSelectedTourId(e.target.value);
                  const t = tournaments.find((tour) => tour.id === e.target.value);
                  if (t && t.matches.length > 0) {
                    setSelectedMatchId(t.matches[0].id);
                  }
                }}
                className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">Select Match</label>
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                {currentTour.matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.round} - Match #{m.matchNumber}: {m.team1.name} vs {m.team2.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentMatch && (
            <div className="p-4 rounded-xl bg-[#080E1E] border border-slate-800 space-y-4 text-xs">
              <div className="text-center pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">
                  {currentMatch.team1.name} vs {currentMatch.team2.name}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {currentMatch.venue} • {currentMatch.scheduledTime}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {currentMatch.team1.name} Score:
                  </label>
                  <input
                    type="text"
                    value={team1ScoreInput}
                    onChange={(e) => setTeam1ScoreInput(e.target.value)}
                    placeholder="e.g. 21-17, 21-19"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {currentMatch.team2.name} Score:
                  </label>
                  <input
                    type="text"
                    value={team2ScoreInput}
                    onChange={(e) => setTeam2ScoreInput(e.target.value)}
                    placeholder="e.g. 17-21, 19-21"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Select Winner to Advance *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWinnerTeamIdInput(currentMatch.team1.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      winnerTeamIdInput === currentMatch.team1.id
                        ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                        : 'bg-slate-900 text-white border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {currentMatch.team1.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWinnerTeamIdInput(currentMatch.team2.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      winnerTeamIdInput === currentMatch.team2.id
                        ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                        : 'bg-slate-900 text-white border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {currentMatch.team2.name}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !winnerTeamIdInput}
                className="w-full py-3 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs uppercase tracking-wider transition disabled:opacity-40 cursor-pointer"
              >
                {isSubmitting ? 'Saving to server...' : 'Submit Official Score & Advance Winner'}
              </button>
            </div>
          )}
        </form>
      )}

      {/* 4. MODAL: CREATE / EDIT PLAYGROUND FACILITY (Full Fields) */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
        >
          <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-[#0D172A] border border-slate-700 p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#CCFF00] block mb-1">
                  LPU Sports Registry Management
                </span>
                <h3 className="text-xl font-black text-white">
                  {editingFacility ? 'Edit Playground & Verified Coordinates' : 'Register New Campus Playground'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ensure all details, coordinates, and hostel associations match physical university inspections.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingFacility(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlaygroundForm} className="space-y-6 pt-5 text-xs">
              {/* Row 1: Name and Primary Sport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">
                    Playground / Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. BH-7 East Sector Open Football Ground"
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Primary Sport *</label>
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value as SportType })}
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#CCFF00]"
                  >
                    {ALL_SPORTS.filter((s) => s !== 'All').map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Facility Type, Environment, Published Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Facility Type</label>
                  <select
                    value={formData.facilityType}
                    onChange={(e) => setFormData({ ...formData, facilityType: e.target.value as FacilityType })}
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {ALL_FACILITY_TYPES.map((ft) => (
                      <option key={ft} value={ft}>
                        {ft}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Environment</label>
                  <div className="flex items-center gap-1 bg-[#080E1E] p-1 rounded-xl border border-slate-700">
                    {(['Outdoor', 'Indoor'] as const).map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setFormData({ ...formData, classification: cls })}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition text-center ${
                          formData.classification === cls
                            ? 'bg-[#CCFF00] text-black shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Published Quantity</label>
                  <input
                    type="text"
                    value={formData.publishedQuantity}
                    onChange={(e) => setFormData({ ...formData, publishedQuantity: e.target.value })}
                    placeholder="e.g. 1 Full Pitch (60m x 40m)"
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Row 3: Supported Sports Chips (Multi-select) */}
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1.5">
                  Supported Sports (Can host multiple sports)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SPORTS.filter((s) => s !== 'All').map((sport) => {
                    const isSelected = formData.supportedSports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => handleToggleSupportedSport(sport)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          isSelected
                            ? 'bg-[#CCFF00] text-black font-bold'
                            : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                        }`}
                      >
                        {sport}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Exact Location & Campus Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Exact Campus Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.exactLocation}
                    onChange={(e) => setFormData({ ...formData, exactLocation: e.target.value })}
                    placeholder="e.g. Central quadrangle between BH-1 and BH-2, LPU"
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Campus Block Anchor</label>
                  <input
                    type="text"
                    value={formData.campusBlock}
                    onChange={(e) => setFormData({ ...formData, campusBlock: e.target.value })}
                    placeholder="e.g. Block 28 or BH-2 Courtyard"
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Row 5: GPS Coordinates & Verification Toggle */}
              <div className="p-4 rounded-2xl bg-[#080E1E] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#CCFF00]" />
                    <span className="font-bold text-white text-xs">Geographic Campus Coordinates</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasVerifiedCoordinates}
                      onChange={(e) => setFormData({ ...formData, hasVerifiedCoordinates: e.target.checked })}
                      className="w-4 h-4 rounded text-[#CCFF00] focus:ring-0"
                    />
                    <span className="text-xs text-slate-300 font-semibold">Verified Physical GPS Coordinates</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-mono mb-1">
                      Latitude (e.g. 31.2460)
                    </label>
                    <input
                      type="text"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      placeholder="31.2460"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-mono mb-1">
                      Longitude (e.g. 75.7040)
                    </label>
                    <input
                      type="text"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      placeholder="75.7040"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Note: If coordinates are unverified, checkmark should be left empty. The platform will honestly report walking distance as unverified and avoid rendering arbitrary pins on the map.
                </p>
              </div>

              {/* Row 6: Associated Nearby Hostels */}
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1.5 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Associate Nearby Hostels (Walking Proximity)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HOSTEL_OPTIONS.map((hostel) => {
                    const isSelected = formData.nearbyHostels.includes(hostel);
                    return (
                      <button
                        key={hostel}
                        type="button"
                        onClick={() => handleToggleHostel(hostel)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-[#CCFF00] text-black font-bold'
                            : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                        }`}
                      >
                        {hostel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 7: Associated Nearby Academic Blocks */}
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  <span>Associate Nearby Academic Blocks</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BLOCK_OPTIONS.map((block) => {
                    const isSelected = formData.nearbyAcademicBlocks.includes(block);
                    return (
                      <button
                        key={block}
                        type="button"
                        onClick={() => handleToggleBlock(block)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-blue-400 text-black font-bold'
                            : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                        }`}
                      >
                        {block}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 8: Photo / Image URL with Presets */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold uppercase flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Playground Photo URL</span>
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 self-center mr-1">Quick Presets:</span>
                  {PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-[#CCFF00]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 9: Access Status, Availability, Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Access Status</label>
                  <select
                    value={formData.accessStatus}
                    onChange={(e) => setFormData({ ...formData, accessStatus: e.target.value as AccessStatus })}
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {ALL_ACCESS_STATUSES.map((as) => (
                      <option key={as} value={as}>
                        {as}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Availability Status</label>
                  <select
                    value={formData.availabilityStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availabilityStatus: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Available">Available (Open for play)</option>
                    <option value="Limited Slots">Limited Slots</option>
                    <option value="Maintenance">Maintenance (Temporarily Closed)</option>
                    <option value="Events Only">Events Only (Varsity Tournament)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="e.g. 06:00 AM - 09:30 PM"
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Row 10: Access Rules & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">
                    Access Rules & Eligibility (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.accessRules}
                    onChange={(e) => setFormData({ ...formData, accessRules: e.target.value })}
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Description & Notes</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              {/* Row 11: Verification Source & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1">Official Information Source</label>
                  <input
                    type="text"
                    value={formData.officialSource}
                    onChange={(e) => setFormData({ ...formData, officialSource: e.target.value })}
                    placeholder="e.g. LPU Sports Board Inspection Notification 2026"
                    className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="w-4 h-4 rounded text-[#CCFF00]"
                    />
                    <span className="text-slate-200 font-bold text-xs">Mark as Physically Verified by Sports Board</span>
                  </label>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingFacility(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-40"
                >
                  {isSubmitting
                    ? 'Saving to University Records...'
                    : editingFacility
                    ? 'Update Playground Record'
                    : 'Register Playground in Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
