import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  Flame,
  CheckCircle2,
  Trophy,
  Users,
  Footprints,
  Navigation,
  Compass,
  Home,
  Building,
  RotateCcw,
  Map as MapIcon,
  List as ListIcon,
  Columns as SplitIcon,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  Sun,
  X,
} from 'lucide-react';
import { FacilityCard } from './FacilityCard.tsx';
import { CampusMapView } from './CampusMapView.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import {
  CAMPUS_ANCHORS,
  filterAndSortPlaygrounds,
  calculatePlaygroundProximity,
  getCampusAnchor,
  type ProximityResult,
} from '../utils/distanceUtils.ts';
import type { Facility, SportType, FacilityType, AccessStatus, Coordinates } from '../types/index.ts';

interface DirectoryViewProps {
  facilities: Facility[];
  onOpenDetails: (facility: Facility) => void;
  onSelectForBooking: (facility: Facility) => void;
  onNavigateToAssistant: () => void;
  onNavigateToPlayers: () => void;
  onNavigateToAdminWithFacility?: (facility: Facility) => void;
}

const SPORTS: SportType[] = [
  'All',
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

const FACILITY_TYPES: { id: FacilityType; label: string }[] = [
  { id: 'All', label: 'All Facility Types' },
  { id: 'Open Playing Ground', label: 'Open Grounds & Lawns' },
  { id: 'Hostel Recreational Court', label: 'Hostel Resident Courts' },
  { id: 'Outdoor Court', label: 'Outdoor Hardcourts' },
  { id: 'Indoor Arena', label: 'Indoor Arenas' },
  { id: 'Practice Turf & Nets', label: 'Turfs & Practice Nets' },
  { id: 'Championship Stadium', label: 'Championship Stadiums' },
  { id: 'Aquatic Centre', label: 'Aquatic Centre' },
  { id: 'Fitness Center', label: 'Fitness Center & Gym' },
];

const ACCESS_STATUSES: { id: AccessStatus; label: string }[] = [
  { id: 'All', label: 'All Access Rules' },
  { id: 'Open Free Play', label: 'Open Free Play (Walk-in)' },
  { id: 'Demo Reservation Required', label: 'Reservation Required' },
  { id: 'Hostel Residents Only', label: 'Hostel Residents Only' },
  { id: 'Coached & Team Sessions', label: 'Team / Coached Only' },
];

const HOSTELS = [
  { id: 'All', name: 'All Hostels & Residences' },
  { id: 'BH-1', name: 'Boys Hostel 1 (BH-1)' },
  { id: 'BH-2', name: 'Boys Hostel 2 (BH-2)' },
  { id: 'BH-3', name: 'Boys Hostel 3 (BH-3)' },
  { id: 'BH-4', name: 'Boys Hostel 4 (BH-4)' },
  { id: 'BH-5', name: 'Boys Hostel 5 (BH-5)' },
  { id: 'BH-6', name: 'Boys Hostel 6 (BH-6)' },
  { id: 'BH-7', name: 'Boys Hostel 7 (BH-7)' },
  { id: 'BH-8', name: 'Boys Hostel 8 (BH-8)' },
  { id: 'GH-1', name: 'Girls Hostel 1 (GH-1)' },
  { id: 'GH-2', name: 'Girls Hostel 2 (GH-2)' },
  { id: 'GH-3', name: 'Girls Hostel 3 (GH-3)' },
  { id: 'GH-4', name: 'Girls Hostel 4 (GH-4)' },
  { id: 'GH-5', name: 'Girls Hostel 5 (GH-5)' },
  { id: 'GH-6', name: 'Girls Hostel 6 (GH-6)' },
  { id: 'Uni-Apartments', name: 'Uni-Apartments & Faculty Residences' },
];

const ACADEMIC_BLOCKS = [
  { id: 'All', name: 'All Academic Blocks' },
  { id: 'Block 13', name: 'Block 13 (Uni-Mall & Fitness)' },
  { id: 'Block 28', name: 'Block 28 (Mittal Indoor Sports Complex)' },
  { id: 'Block 29', name: 'Block 29 (Basketball Arena & Dojo)' },
  { id: 'Block 30', name: 'Block 30 (Olympic Aquatic Centre)' },
  { id: 'Block 32', name: 'Block 32 (Polytechnic & Diploma)' },
  { id: 'Block 33', name: 'Block 33 (CSE & IT Engineering)' },
  { id: 'Block 34', name: 'Block 34 (School of Design & Architecture)' },
  { id: 'Block 36', name: 'Block 36 (Mechanical & Aerospace Engineering)' },
  { id: 'Block 38', name: 'Block 38 (Agriculture & Bioengineering)' },
  { id: 'Block 55', name: 'Block 55-58 (Mittal School of Business & Law)' },
  { id: 'Unipolis', name: 'Baldev Raj Mittal Unipolis (Central Grounds)' },
];

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  facilities,
  onOpenDetails,
  onSelectForBooking,
  onNavigateToAssistant,
  onNavigateToPlayers,
  onNavigateToAdminWithFacility,
}) => {
  // Discovery filter state
  const [selectedHostel, setSelectedHostel] = useState<string>('All');
  const [selectedBlock, setSelectedBlock] = useState<string>('All');
  const [selectedSport, setSelectedSport] = useState<SportType>('All');
  const [selectedClassification, setSelectedClassification] = useState<string>('All');
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>('All');
  const [selectedAccessStatus, setSelectedAccessStatus] = useState<string>('All');
  const [maxWalkingMins, setMaxWalkingMins] = useState<number>(0); // 0 = any
  const [searchQuery, setSearchQuery] = useState('');

  // Optional device geolocation
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // View presentation mode: 'list' | 'map' | 'split'
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('split');

  // Ref to scroll to discovery panel
  const discoverySectionRef = useRef<HTMLDivElement>(null);

  const scrollToDiscovery = () => {
    discoverySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Optional Geolocation Trigger (respects user choice, never forced)
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsLoading(false);
        // Deselect manual hostel when GPS is enabled
        setSelectedHostel('All');
        setSelectedBlock('All');
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? 'Location permission denied. You can manually select your hostel or academic block below.'
            : 'Unable to acquire accurate GPS fix. Please select your hostel.'
        );
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleClearGps = () => {
    setUserCoords(null);
    setGpsError(null);
  };

  // Quick Preset Category Activators
  const handlePresetFilter = (preset: string) => {
    scrollToDiscovery();
    switch (preset) {
      case 'hostel':
        // Activate common boys/girls hostel filter if not selected
        if (selectedHostel === 'All') setSelectedHostel('BH-2');
        setSelectedBlock('All');
        setSelectedClassification('All');
        setSelectedFacilityType('All');
        break;
      case 'block':
        if (selectedBlock === 'All') setSelectedBlock('Block 33');
        setSelectedHostel('All');
        setSelectedClassification('All');
        setSelectedFacilityType('All');
        break;
      case 'nearest':
        if (selectedHostel === 'All' && selectedBlock === 'All') {
          setSelectedHostel('BH-3');
        }
        setMaxWalkingMins(10);
        break;
      case 'open-grounds':
        setSelectedClassification('Outdoor');
        setSelectedFacilityType('Open Playing Ground');
        break;
      case 'indoor':
        setSelectedClassification('Indoor');
        setSelectedFacilityType('Indoor Arena');
        break;
      case 'play-now':
        setSelectedAccessStatus('Open Free Play');
        setSearchQuery('');
        break;
      default:
        break;
    }
  };

  const handleResetFilters = () => {
    setSelectedHostel('All');
    setSelectedBlock('All');
    setSelectedSport('All');
    setSelectedClassification('All');
    setSelectedFacilityType('All');
    setSelectedAccessStatus('All');
    setMaxWalkingMins(0);
    setSearchQuery('');
    setUserCoords(null);
    setGpsError(null);
  };

  // Run pure, decoupled proximity calculation and filtering
  const processedPlaygrounds = useMemo(() => {
    return filterAndSortPlaygrounds(facilities, {
      query: searchQuery,
      hostel: selectedHostel,
      academicBlock: selectedBlock,
      sport: selectedSport,
      classification: selectedClassification,
      facilityType: selectedFacilityType,
      accessStatus: selectedAccessStatus,
      maxWalkingMins: maxWalkingMins > 0 ? maxWalkingMins : undefined,
      userCoords,
    });
  }, [
    facilities,
    searchQuery,
    selectedHostel,
    selectedBlock,
    selectedSport,
    selectedClassification,
    selectedFacilityType,
    selectedAccessStatus,
    maxWalkingMins,
    userCoords,
  ]);

  const activeAnchorName =
    userCoords
      ? 'My Current GPS Location'
      : selectedHostel !== 'All'
      ? getCampusAnchor(selectedHostel)?.name || selectedHostel
      : selectedBlock !== 'All'
      ? getCampusAnchor(selectedBlock)?.name || selectedBlock
      : null;

  const verifiedCount = processedPlaygrounds.filter((p) => p.hasVerifiedCoordinates).length;
  const unverifiedCount = processedPlaygrounds.length - verifiedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section: Nearby Playgrounds Headline */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#080E1E] via-[#0F1F3D] to-[#0A162B] border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-black uppercase tracking-wider mb-4">
            <Footprints className="w-4 h-4" />
            LPU Playground & Sports Discovery Engine
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Discover Playgrounds & Sports Near Your <span className="text-[#CCFF00]">Hostel & Block</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Find outdoor grounds, floodlit courts, open playing lawns, and indoor arenas within walking distance of Lovely Professional University residences and academic blocks.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={scrollToDiscovery}
              className="px-6 py-3.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-xs uppercase tracking-wider transition shadow-xl shadow-[#CCFF00]/15 flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Find Nearby Playgrounds</span>
            </button>

            <button
              onClick={() => onSelectForBooking(facilities[0])}
              className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#CCFF00]" />
              <span>Reserve Court Slot</span>
            </button>

            <button
              onClick={onNavigateToAssistant}
              className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#CCFF00]" />
              <span>Ask Sports AI</span>
            </button>
          </div>
        </div>

        {/* 7 Quick Discovery Feature Category Pills */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Quick Discovery Shortcuts:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePresetFilter('hostel')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                selectedHostel !== 'All'
                  ? 'bg-[#CCFF00] text-black font-bold shadow'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Playgrounds near my hostel</span>
            </button>

            <button
              onClick={() => handlePresetFilter('block')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                selectedBlock !== 'All'
                  ? 'bg-[#CCFF00] text-black font-bold shadow'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>Playgrounds near my academic block</span>
            </button>

            <button
              onClick={() => handlePresetFilter('nearest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                maxWalkingMins > 0
                  ? 'bg-[#CCFF00] text-black font-bold shadow'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <Footprints className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nearest sports facilities (&lt; 10 min)</span>
            </button>

            <button
              onClick={() => handlePresetFilter('open-grounds')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                selectedFacilityType === 'Open Playing Ground'
                  ? 'bg-[#CCFF00] text-black font-bold shadow'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Open grounds & outdoor playing spaces</span>
            </button>

            <button
              onClick={() => handlePresetFilter('indoor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                selectedClassification === 'Indoor'
                  ? 'bg-[#CCFF00] text-black font-bold shadow'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-purple-400" />
              <span>Indoor sports facilities</span>
            </button>

            <button
              onClick={() => handlePresetFilter('play-now')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                selectedAccessStatus === 'Open Free Play'
                  ? 'bg-[#CCFF00] text-black font-bold shadow'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Find a place to play now (Free walk-in)</span>
            </button>

            <button
              onClick={onNavigateToPlayers}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-900/80 text-slate-300 hover:text-[#CCFF00] hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Find players near me</span>
            </button>
          </div>
        </div>
      </div>

      {/* PWA Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Main Nearby Discovery & Filter Engine */}
      <div
        ref={discoverySectionRef}
        className="bg-[#0D172A] rounded-2xl border border-slate-800 p-5 space-y-5 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#CCFF00]" />
              <span>Hostel & Academic Block Playground Discovery</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your residence or block to calculate verified walking times and discover nearest grounds.
            </p>
          </div>

          {/* View Mode Toggle: List / Map / Split */}
          <div className="flex items-center gap-1 bg-[#080E1E] p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#CCFF00] text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hidden md:flex ${
                viewMode === 'split'
                  ? 'bg-[#CCFF00] text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Split View"
            >
              <SplitIcon className="w-3.5 h-3.5" />
              <span>Map & List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#CCFF00] text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Campus Map</span>
            </button>
          </div>
        </div>

        {/* 1. Hostel & Block Anchor Selectors + Optional Device GPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Hostel Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>My Hostel or Residence</span>
            </label>
            <select
              value={selectedHostel}
              onChange={(e) => {
                setSelectedHostel(e.target.value);
                if (e.target.value !== 'All') {
                  setUserCoords(null);
                }
              }}
              className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
            >
              {HOSTELS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Block Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>My Academic Block</span>
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                if (e.target.value !== 'All') {
                  setUserCoords(null);
                }
              }}
              className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
            >
              {ACADEMIC_BLOCKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Device GPS button (Optional feature, not a requirement) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optional GPS Location</span>
            </label>
            {userCoords ? (
              <div className="flex items-center gap-2 bg-[#080E1E] border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-emerald-400">
                <span className="truncate">GPS Active ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)})</span>
                <button
                  onClick={handleClearGps}
                  className="text-slate-400 hover:text-white shrink-0 ml-auto p-1"
                  title="Clear GPS location"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequestLocation}
                disabled={gpsLoading}
                className="w-full bg-[#080E1E] hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-300 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className={`w-3.5 h-3.5 text-[#CCFF00] ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Acquiring GPS...' : 'Use My Current Location'}</span>
              </button>
            )}
          </div>
        </div>

        {/* GPS Error Notification if permission denied (gracefully handled) */}
        {gpsError && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
            <span>{gpsError}</span>
            <button onClick={() => setGpsError(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 2. Secondary Filter Bar: Walking Distance, Facility Type, Access Status, Indoor/Outdoor, Keyword */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Walking Distance Threshold */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Max Walking Distance
            </label>
            <select
              value={maxWalkingMins}
              onChange={(e) => setMaxWalkingMins(Number(e.target.value))}
              className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
            >
              <option value={0}>Any Distance</option>
              <option value={5}>Within 5 min walk (&lt; 400m)</option>
              <option value={10}>Within 10 min walk (&lt; 800m)</option>
              <option value={15}>Within 15 min walk (&lt; 1.2km)</option>
            </select>
          </div>

          {/* Facility Type Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Facility Classification
            </label>
            <select
              value={selectedFacilityType}
              onChange={(e) => setSelectedFacilityType(e.target.value)}
              className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
            >
              {FACILITY_TYPES.map((ft) => (
                <option key={ft.id} value={ft.id}>
                  {ft.label}
                </option>
              ))}
            </select>
          </div>

          {/* Access Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Access Status
            </label>
            <select
              value={selectedAccessStatus}
              onChange={(e) => setSelectedAccessStatus(e.target.value)}
              className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
            >
              {ACCESS_STATUSES.map((as) => (
                <option key={as.id} value={as.id}>
                  {as.label}
                </option>
              ))}
            </select>
          </div>

          {/* Indoor / Outdoor Segmented Buttons */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Environment
            </label>
            <div className="flex items-center gap-1 bg-[#080E1E] p-1 rounded-xl border border-slate-700">
              {['All', 'Outdoor', 'Indoor'].map((classification) => (
                <button
                  key={classification}
                  onClick={() => setSelectedClassification(classification)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                    selectedClassification === classification
                      ? 'bg-[#CCFF00] text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {classification}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Search Input & Reset Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by playground name, hostel (BH-1, GH-2), block (Block 33, 28), or sport..."
              className="w-full bg-[#080E1E] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#CCFF00]"
              aria-label="Search campus playgrounds and sports facilities"
            />
          </div>

          {(selectedHostel !== 'All' ||
            selectedBlock !== 'All' ||
            selectedSport !== 'All' ||
            selectedClassification !== 'All' ||
            selectedFacilityType !== 'All' ||
            selectedAccessStatus !== 'All' ||
            maxWalkingMins > 0 ||
            searchQuery ||
            userCoords) && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* 4. Sport Filter Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {SPORTS.map((sport) => {
            const isSelected = selectedSport === sport;
            return (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#CCFF00] text-black font-bold shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                {sport}
              </button>
            );
          })}
        </div>

        {/* Results Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 gap-2">
          <div className="flex items-center gap-2">
            <span>
              Found <strong className="text-white">{processedPlaygrounds.length}</strong> matching playgrounds & facilities
            </span>
            {activeAnchorName && (
              <span className="px-2 py-0.5 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] text-[11px] font-semibold flex items-center gap-1">
                <Footprints className="w-3 h-3" />
                Sorted by distance from {activeAnchorName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {verifiedCount} with Verified GPS Coordinates
            </span>
            {unverifiedCount > 0 && (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {unverifiedCount} Unverified Coordinates
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Content: Campus Map View / List View / Split View */}
      {viewMode === 'map' && (
        <CampusMapView
          playgrounds={processedPlaygrounds}
          selectedHostel={selectedHostel}
          selectedBlock={selectedBlock}
          onOpenDetails={onOpenDetails}
          onSelectForBooking={onSelectForBooking}
          onAdminAddCoordinates={onNavigateToAdminWithFacility}
        />
      )}

      {viewMode === 'split' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <CampusMapView
              playgrounds={processedPlaygrounds}
              selectedHostel={selectedHostel}
              selectedBlock={selectedBlock}
              onOpenDetails={onOpenDetails}
              onSelectForBooking={onSelectForBooking}
              onAdminAddCoordinates={onNavigateToAdminWithFacility}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ListIcon className="w-4 h-4 text-[#CCFF00]" />
                <span>Searchable Playgrounds & Facilities Directory</span>
              </h3>
              <span className="text-xs text-slate-400">
                {activeAnchorName ? `Ordered by proximity to ${activeAnchorName}` : 'Alphabetical & Category Order'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedPlaygrounds.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  onOpenDetails={onOpenDetails}
                  onSelectForBooking={onSelectForBooking}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedPlaygrounds.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onOpenDetails={onOpenDetails}
              onSelectForBooking={onSelectForBooking}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {processedPlaygrounds.length === 0 && (
        <div className="text-center py-16 bg-[#0D172A] rounded-2xl border border-slate-800 p-8 shadow-xl">
          <MapPin className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No playgrounds found matching your active filters</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto mb-5">
            {activeAnchorName
              ? `No sports facilities within the selected parameters near ${activeAnchorName}. Try widening your walking distance threshold or selecting 'All' for sport.`
              : 'Try checking for a different sport type or reset all discovery filters.'}
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs uppercase tracking-wider transition"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
