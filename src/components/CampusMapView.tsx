import React, { useState, useRef, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Footprints,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Info,
  CheckCircle2,
  X,
  ExternalLink,
  Filter,
  Layers,
  ChevronRight,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CAMPUS_ANCHORS, calculateHaversineDistance, estimateWalkingMinutes } from '../utils/distanceUtils.ts';
import type { CampusAnchor, Coordinates, Facility, SportType } from '../types/index.ts';

interface CampusMapViewProps {
  playgrounds: Facility[];
  selectedHostel: string;
  selectedBlock: string;
  onOpenDetails: (facility: Facility) => void;
  onSelectForBooking: (facility: Facility) => void;
  onAdminAddCoordinates?: (facility: Facility) => void;
}

// Bounding box for LPU Campus coordinates (approximate bounds)
const LPU_BOUNDS = {
  minLat: 31.2415,
  maxLat: 31.2525,
  minLng: 75.7005,
  maxLng: 75.7090,
};

const POPULAR_SPORTS: string[] = [
  'All Sports',
  'Badminton',
  'Basketball',
  'Football',
  'Cricket',
  'Volleyball',
  'Tennis',
  'Gymnasium',
  'Open Play & General Sports',
];

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  playgrounds,
  selectedHostel,
  selectedBlock,
  onOpenDetails,
  onSelectForBooking,
  onAdminAddCoordinates,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activePin, setActivePin] = useState<Facility | null>(null);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [showRadius, setShowRadius] = useState(true);
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'Available' | 'Limited Slots'>('all');
  const [viewLayout, setViewLayout] = useState<'full' | 'split'>('full');

  const containerRef = useRef<HTMLDivElement>(null);

  // Active anchor for student based on hostel/block
  const activeAnchor: CampusAnchor | undefined =
    selectedHostel && selectedHostel !== 'All'
      ? CAMPUS_ANCHORS.find((a) => a.name.includes(selectedHostel) || a.id.toUpperCase() === selectedHostel.toUpperCase())
      : selectedBlock && selectedBlock !== 'All'
      ? CAMPUS_ANCHORS.find((a) => a.name.includes(selectedBlock) || a.id.toLowerCase() === selectedBlock.toLowerCase())
      : undefined;

  // Project lat/lng into SVG 900x600 viewBox
  const project = (coords: Coordinates) => {
    const latSpan = LPU_BOUNDS.maxLat - LPU_BOUNDS.minLat;
    const lngSpan = LPU_BOUNDS.maxLng - LPU_BOUNDS.minLng;

    const x = ((coords.lng - LPU_BOUNDS.minLng) / lngSpan) * 820 + 40;
    const y = ((LPU_BOUNDS.maxLat - coords.lat) / latSpan) * 520 + 40;

    return { x, y };
  };

  const verifiedPlaygrounds = playgrounds.filter((p) => p.hasVerifiedCoordinates && p.coordinates);
  const unverifiedPlaygrounds = playgrounds.filter((p) => !p.hasVerifiedCoordinates || !p.coordinates);

  // Filtered playgrounds based on user selections
  const matchingPlaygrounds = verifiedPlaygrounds.filter((p) => {
    const matchesSport =
      sportFilter === 'All Sports' ||
      p.sport === sportFilter ||
      (p.supportedSports && p.supportedSports.includes(sportFilter as SportType));
    const matchesAvailability =
      availabilityFilter === 'all' || p.availabilityStatus === availabilityFilter;
    return matchesSport && matchesAvailability;
  });

  const anchorPos = activeAnchor ? project(activeAnchor.coordinates) : null;

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only trigger drag on SVG background or left click
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActivePin(null);
  };

  const handleNudgePan = (dx: number, dy: number) => {
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Interactive Filter & Control Toolbar */}
      <div className="p-4 bg-[#0D172A] border border-slate-800 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Header Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm tracking-wide">
                  Interactive Campus Playground Map
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#CCFF00] text-black font-extrabold">
                  {matchingPlaygrounds.length} Mapped
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Click any venue pin to view live availability, facilities, and book instantly. Pan by dragging the map.
              </p>
            </div>
          </div>

          {/* Right Controls: Pan Nudges, Zoom, View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Split Mode Toggle Button */}
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setViewLayout('full')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  viewLayout === 'full'
                    ? 'bg-[#CCFF00] text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Full-width Map View"
              >
                Full Map
              </button>
              <button
                onClick={() => setViewLayout('split')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  viewLayout === 'split'
                    ? 'bg-[#CCFF00] text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Split Map + Venue List Mode"
              >
                Split View
              </button>
            </div>

            {/* Walking Radius Toggle */}
            {activeAnchor && (
              <button
                onClick={() => setShowRadius(!showRadius)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  showRadius
                    ? 'bg-[#CCFF00] text-black font-bold shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>Walking Rings</span>
              </button>
            )}

            {/* Pan Directional Controls */}
            <div className="hidden sm:flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 gap-0.5">
              <button
                onClick={() => handleNudgePan(50, 0)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                title="Pan Left"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleNudgePan(0, 50)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                title="Pan Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleNudgePan(0, -50)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                title="Pan Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleNudgePan(-50, 0)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                title="Pan Right"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => setZoom((z) => Math.min(Number((z + 0.25).toFixed(2)), 2.5))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-300 select-none">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.max(Number((z - 0.25).toFixed(2)), 0.75))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded ml-0.5 cursor-pointer"
                title="Reset Map Pan and Zoom"
                aria-label="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Buttons Bar: By Sport and By Availability */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* Sports Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-[#CCFF00]" />
              Sport:
            </span>
            {POPULAR_SPORTS.map((sport) => {
              const isSelected = sportFilter === sport;
              return (
                <button
                  key={sport}
                  onClick={() => setSportFilter(sport)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#CCFF00] text-black font-bold shadow'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {sport}
                </button>
              );
            })}
          </div>

          {/* Availability Filter Chips */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-bold text-slate-400 uppercase tracking-wider mr-1">Live Slots:</span>
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-2 py-0.5 rounded-lg font-medium transition cursor-pointer ${
                availabilityFilter === 'all'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAvailabilityFilter('Available')}
              className={`px-2 py-0.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                availabilityFilter === 'Available'
                  ? 'bg-emerald-500/30 border border-emerald-500/60 text-emerald-300 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Available Only
            </button>
            <button
              onClick={() => setAvailabilityFilter('Limited Slots')}
              className={`px-2 py-0.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                availabilityFilter === 'Limited Slots'
                  ? 'bg-amber-500/30 border border-amber-500/60 text-amber-300 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-amber-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Limited Slots
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Container (Split or Full Width) */}
      <div
        className={`grid gap-4 ${
          viewLayout === 'split' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
        }`}
      >
        {/* Interactive SVG Canvas Area */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative rounded-2xl bg-[#070D1A] border-2 border-slate-800 overflow-hidden shadow-2xl select-none cursor-grab active:cursor-grabbing ${
            viewLayout === 'split' ? 'lg:col-span-2 min-h-[580px]' : 'min-h-[620px]'
          } flex items-center justify-center`}
        >
          {/* SVG Canvas with Zoom and Pan Transform */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out origin-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            <svg
              viewBox="0 0 900 600"
              className="w-full h-auto select-none pointer-events-auto"
              style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.6))' }}
            >
              <defs>
                <radialGradient id="walkRadiusGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.22" />
                  <stop offset="70%" stopColor="#CCFF00" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
                </radialGradient>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Campus Grid Background */}
              <rect width="900" height="600" fill="#080E1E" />
              <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" strokeOpacity="0.6" />
              </pattern>
              <rect width="900" height="600" fill="url(#campusGrid)" />

              {/* Grand Trunk Road (GT Road NH-1) Highway */}
              <path
                d="M 20 540 Q 250 480 880 340"
                fill="none"
                stroke="#475569"
                strokeWidth="14"
                strokeLinecap="round"
                strokeOpacity="0.7"
              />
              <path
                d="M 20 540 Q 250 480 880 340"
                fill="none"
                stroke="#CCFF00"
                strokeWidth="1.5"
                strokeDasharray="10 8"
                strokeOpacity="0.5"
              />
              <text x="260" y="475" fill="#94A3B8" fontSize="10" fontWeight="bold" letterSpacing="1">
                JALANDHAR - DELHI G.T. ROAD (NH-1)
              </text>

              {/* Campus Internal Central Road Spine */}
              <path
                d="M 200 480 C 260 380, 360 280, 520 180 C 600 130, 720 90, 820 60"
                fill="none"
                stroke="#334155"
                strokeWidth="6"
                strokeDasharray="4 4"
              />

              {/* Sector Zones Outlines */}
              {/* Central Unipolis Area */}
              <rect x="360" y="240" width="180" height="130" rx="16" fill="#0F1F3D" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 4" fillOpacity="0.6" />
              <text x="450" y="310" textAnchor="middle" fill="#60A5FA" fontSize="11" fontWeight="bold" opacity="0.8">
                CENTRAL UNIPOLIS ARENA
              </text>

              {/* Shanti Devi Mittal Sports Complex Area (Block 28-30) */}
              <rect x="290" y="190" width="140" height="95" rx="12" fill="#0F1F3D" stroke="#10B981" strokeWidth="1" fillOpacity="0.5" />
              <text x="360" y="225" textAnchor="middle" fill="#34D399" fontSize="10" fontWeight="bold" opacity="0.8">
                BLOCK 28-30 MITTAL COMPLEX
              </text>

              {/* Boys Hostels Cluster Area (BH-1 to 6) */}
              <rect x="180" y="330" width="170" height="120" rx="14" fill="#0D1B2A" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" fillOpacity="0.5" />
              <text x="265" y="380" textAnchor="middle" fill="#94A3B8" fontSize="10" fontWeight="bold" opacity="0.7">
                BOYS HOSTELS (BH-1 TO 6)
              </text>

              {/* Boys Studio 11 & 12 Sector (BS-11, BS-12) */}
              <rect x="140" y="440" width="120" height="75" rx="10" fill="#0D1B2A" stroke="#CCFF00" strokeWidth="1" strokeDasharray="2 2" fillOpacity="0.4" />
              <text x="200" y="475" textAnchor="middle" fill="#CCFF00" fontSize="9" fontWeight="bold" opacity="0.8">
                BS-11 & BS-12 SECTOR
              </text>

              {/* Girls Hostels Cluster Area (GH-1 to 6) */}
              <rect x="150" y="60" width="180" height="110" rx="14" fill="#0D1B2A" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" fillOpacity="0.5" />
              <text x="240" y="105" textAnchor="middle" fill="#94A3B8" fontSize="10" fontWeight="bold" opacity="0.7">
                GIRLS HOSTELS (GH-1 TO 6)
              </text>

              {/* East Sector Cricket & Athletics Area */}
              <rect x="580" y="220" width="200" height="150" rx="16" fill="#0F1F3D" stroke="#84CC16" strokeWidth="1" strokeDasharray="4 4" fillOpacity="0.5" />
              <text x="680" y="275" textAnchor="middle" fill="#A3E635" fontSize="10" fontWeight="bold" opacity="0.8">
                EAST CRICKET OVAL & NETS
              </text>

              {/* Campus Anchor Reference Markers */}
              {CAMPUS_ANCHORS.map((anchor) => {
                const pos = project(anchor.coordinates);
                const isSelected = activeAnchor?.id === anchor.id;

                return (
                  <g key={anchor.id} transform={`translate(${pos.x}, ${pos.y})`}>
                    {isSelected ? (
                      <>
                        <circle r="16" fill="#CCFF00" fillOpacity="0.25">
                          <animate attributeName="r" values="10;22;10" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="fill-opacity" values="0.4;0.05;0.4" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle r="7" fill="#CCFF00" stroke="#000" strokeWidth="2" />
                        <text y="-14" textAnchor="middle" fill="#CCFF00" fontSize="10" fontWeight="black" filter="url(#neonGlow)">
                          YOUR LOCATION: {anchor.name}
                        </text>
                      </>
                    ) : (
                      <>
                        <circle r="3" fill="#64748B" opacity="0.5" />
                        <text y="-5" textAnchor="middle" fill="#64748B" fontSize="8" opacity="0.6">
                          {anchor.id.toUpperCase()}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Walking Radius Rings around Selected Anchor */}
              {activeAnchor && anchorPos && showRadius && (
                <g transform={`translate(${anchorPos.x}, ${anchorPos.y})`}>
                  {/* 300m walking radius ring (~4 mins walk) */}
                  <circle r="60" fill="url(#walkRadiusGrad)" stroke="#CCFF00" strokeWidth="1.2" strokeDasharray="4 3" strokeOpacity="0.75" />
                  <text x="64" y="4" fill="#CCFF00" fontSize="9" fontWeight="bold">
                    300m (~4 min walk)
                  </text>

                  {/* 600m walking radius ring (~8 mins walk) */}
                  <circle r="120" fill="none" stroke="#CCFF00" strokeWidth="0.8" strokeDasharray="6 4" strokeOpacity="0.35" />
                  <text x="124" y="4" fill="#A3E635" fontSize="9" opacity="0.75">
                    600m (~8 min walk)
                  </text>
                </g>
              )}

              {/* Verified Venue Marker Pins */}
              {verifiedPlaygrounds.map((playground) => {
                const pos = project(playground.coordinates!);
                const isActive = activePin?.id === playground.id;
                const isHovered = hoveredPinId === playground.id;
                const isMatching = matchingPlaygrounds.some((m) => m.id === playground.id);
                const isAvailable = playground.availabilityStatus === 'Available';

                // Calculate distance to active anchor if present
                const dist = activeAnchor
                  ? calculateHaversineDistance(
                      activeAnchor.coordinates.lat,
                      activeAnchor.coordinates.lng,
                      playground.coordinates!.lat,
                      playground.coordinates!.lng
                    )
                  : null;
                const mins = dist !== null ? estimateWalkingMinutes(dist) : null;

                return (
                  <g
                    key={playground.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer transition-all duration-200"
                    style={{ opacity: isMatching ? 1 : 0.22 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePin(playground);
                    }}
                    onMouseEnter={() => setHoveredPinId(playground.id)}
                    onMouseLeave={() => setHoveredPinId(null)}
                  >
                    {/* Active/Selected Pulsing Ring */}
                    {isActive && (
                      <g>
                        <circle r="26" fill="#CCFF00" fillOpacity="0.3">
                          <animate attributeName="r" values="20;32;20" dur="1.8s" repeatCount="indefinite" />
                          <animate attributeName="fill-opacity" values="0.45;0.1;0.45" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                        <circle r="22" fill="none" stroke="#CCFF00" strokeWidth="2.5" />
                      </g>
                    )}

                    {/* Hover Glow */}
                    {isHovered && !isActive && (
                      <circle r="18" fill="#CCFF00" fillOpacity="0.25" stroke="#CCFF00" strokeWidth="1.5" />
                    )}

                    {/* Marker Pin Base Pill */}
                    <circle
                      r={isActive ? 13 : isHovered ? 12 : 9.5}
                      fill={isAvailable ? '#10B981' : '#F59E0B'}
                      stroke="#FFFFFF"
                      strokeWidth={isActive ? 3 : 2}
                      className="shadow-xl"
                    />

                    {/* Live Status Indicator Center Dot */}
                    <circle
                      r={isActive ? 4 : 3}
                      fill="#FFFFFF"
                    />

                    {/* Venue Label Text */}
                    <text
                      y={isActive ? 22 : 20}
                      textAnchor="middle"
                      fill={isActive ? '#CCFF00' : isHovered ? '#FFFFFF' : '#CBD5E1'}
                      fontSize={isActive ? 10 : 8.5}
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow"
                    >
                      {playground.name.length > 20
                        ? playground.name.substring(0, 18) + '...'
                        : playground.name}
                    </text>

                    {/* Walking Time Badge */}
                    {mins !== null && (
                      <text
                        y={isActive ? 32 : 29}
                        textAnchor="middle"
                        fill="#A3E635"
                        fontSize="8"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        ~{mins} min walk
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Popup Card for Selected Pin */}
          {activePin && (
            <div
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-[#0D172A]/95 backdrop-blur-md border-2 border-[#CCFF00] rounded-2xl p-5 shadow-2xl z-30 animate-fadeIn text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#CCFF00] text-black uppercase">
                      {activePin.sport}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {activePin.classification}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        activePin.availabilityStatus === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : activePin.availabilityStatus === 'Limited Slots'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          activePin.availabilityStatus === 'Available'
                            ? 'bg-emerald-400 animate-pulse'
                            : 'bg-amber-400'
                        }`}
                      />
                      {activePin.availabilityStatus}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-white text-base mt-1.5 leading-snug">
                    {activePin.name}
                  </h4>
                  <span className="text-xs text-slate-400 block mt-0.5 font-medium">
                    {activePin.campusBlock}
                  </span>
                </div>
                <button
                  onClick={() => setActivePin(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Close pin preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Venue Details & Live Facilities Available */}
              <div className="py-3 space-y-2 text-xs">
                {/* Proximity notice */}
                {activeAnchor && activePin.coordinates && (
                  <div className="flex items-center gap-1.5 text-[#CCFF00] font-bold bg-[#CCFF00]/10 p-2 rounded-xl border border-[#CCFF00]/25">
                    <Footprints className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {calculateHaversineDistance(
                        activeAnchor.coordinates.lat,
                        activeAnchor.coordinates.lng,
                        activePin.coordinates.lat,
                        activePin.coordinates.lng
                      )}m from {activeAnchor.name} (~
                      {estimateWalkingMinutes(
                        calculateHaversineDistance(
                          activeAnchor.coordinates.lat,
                          activeAnchor.coordinates.lng,
                          activePin.coordinates.lat,
                          activePin.coordinates.lng
                        )
                      )} min walk)
                    </span>
                  </div>
                )}

                {/* Facilities & Specs */}
                <div className="space-y-1 text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <strong className="text-white shrink-0">Courts / Pitches:</strong>
                    <span>{activePin.publishedQuantity || `${activePin.courtCount} Courts`}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <strong className="text-white shrink-0">Equipment / Surface:</strong>
                    <span className="text-slate-300 line-clamp-2">{activePin.equipmentInfo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activePin.openingHours}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-semibold">{activePin.fees}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-0.5">
                    <strong>Hostels Nearby:</strong> {activePin.nearbyHostels.join(', ')}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Prominent Direct "Book Now" Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onSelectForBooking(activePin)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#CCFF00]/20 transition cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Now</span>
                </button>

                <button
                  onClick={() => onOpenDetails(activePin)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1 transition cursor-pointer"
                  title="View full facility guidelines & gallery"
                >
                  <Info className="w-4 h-4" />
                  <span>Details</span>
                </button>

                {activePin.mapLink && (
                  <a
                    href={activePin.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Open Google Maps GPS coordinates"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Map Overlays: Legend & Navigation Hint */}
          <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1.5 z-10 pointer-events-none hidden sm:block">
            <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-1">
              Live Map Status
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Available for Student Play</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Limited Slots / Intramural</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-[#CCFF00] inline-block" />
              <span>Walking Distance Isochrone</span>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 pointer-events-none hidden md:flex items-center gap-1.5">
            <Move className="w-3 h-3 text-[#CCFF00]" />
            <span>Drag to pan across LPU • Scroll/buttons to zoom</span>
          </div>
        </div>

        {/* Split View Right Side Drawer / Venue List (Only when viewLayout === 'split') */}
        {viewLayout === 'split' && (
          <div className="bg-[#0D172A] rounded-2xl border border-slate-800 p-4 space-y-3 overflow-hidden flex flex-col max-h-[580px] shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#CCFF00]" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Venues ({matchingPlaygrounds.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {sportFilter}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {matchingPlaygrounds.map((fac) => {
                const isSelected = activePin?.id === fac.id;
                return (
                  <div
                    key={fac.id}
                    onClick={() => setActivePin(fac)}
                    className={`p-3 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0F1F3D] border-[#CCFF00] shadow-md'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-white truncate max-w-[170px]">
                          {fac.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            fac.availabilityStatus === 'Available'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {fac.availabilityStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="text-[#CCFF00] font-bold">{fac.sport}</span>
                        <span>•</span>
                        <span className="truncate">{fac.campusBlock}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {fac.courtCount} {fac.courtCount === 1 ? 'Court' : 'Courts'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectForBooking(fac);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-[10px] uppercase tracking-wider transition cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Unverified Coordinates Physical Inspection Notice */}
      {unverifiedPlaygrounds.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#0D172A] border border-amber-600/40 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">
                {unverifiedPlaygrounds.length} Playground Coordinates Pending Physical GPS Verification
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                These grounds (including {unverifiedPlaygrounds.map((p) => p.name).join(', ')}) are open for student play on campus, but their GPS pins are omitted from the map until exact coordinates are verified by the LPU Sports Board.
              </p>
            </div>
          </div>

          {onAdminAddCoordinates && (
            <button
              onClick={() => onAdminAddCoordinates(unverifiedPlaygrounds[0])}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider shrink-0 transition cursor-pointer"
            >
              Verify Coordinates (Admin)
            </button>
          )}
        </div>
      )}
    </div>
  );
};
