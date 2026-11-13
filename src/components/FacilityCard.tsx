import React from 'react';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  Users,
  Footprints,
  AlertTriangle,
  Play,
  Home,
  Building,
  Camera,
} from 'lucide-react';
import type { Facility } from '../types/index.ts';
import type { ProximityResult } from '../utils/distanceUtils.ts';

interface FacilityCardProps {
  facility: Facility & { proximity?: ProximityResult };
  onOpenDetails: (facility: Facility) => void;
  onSelectForBooking: (facility: Facility) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  onOpenDetails,
  onSelectForBooking,
}) => {
  const isAvailable = facility.availabilityStatus === 'Available';
  const isLimited = facility.availabilityStatus === 'Limited Slots';
  const isOpenPlay = facility.accessStatus === 'Open Free Play';

  return (
    <div className="group rounded-2xl bg-[#0D172A] border border-slate-800 hover:border-[#CCFF00]/40 transition-all duration-300 overflow-hidden flex flex-col shadow-lg hover:shadow-2xl">
      {/* Top Image Banner with Sport & Facility Type Tags */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={facility.image}
          alt={facility.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D172A] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center max-w-[70%]">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/70 backdrop-blur-md text-[#CCFF00] border border-[#CCFF00]/30 tracking-wide uppercase">
            {facility.sport}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 backdrop-blur-md text-white border border-slate-700">
            {facility.facilityType}
          </span>
          {facility.gallery && facility.gallery.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/80 backdrop-blur-md text-slate-200 border border-slate-700 flex items-center gap-1">
              <Camera className="w-3 h-3 text-[#CCFF00]" />
              <span>{facility.gallery.length} Photos</span>
            </span>
          )}
        </div>

        {/* Status Pill */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-md ${
              isAvailable
                ? 'bg-emerald-500/90 text-black'
                : isLimited
                ? 'bg-amber-400/90 text-black'
                : 'bg-rose-500/90 text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {facility.availabilityStatus}
          </span>
        </div>

        {/* Quantity and Campus Block Overlay */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold text-white truncate max-w-[70%] text-[11px]">
            {facility.publishedQuantity}
          </span>
          <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded font-mono text-slate-300">
            {facility.campusBlock}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Walking Distance / Proximity Pill */}
          {facility.proximity && (
            <div className="mb-2">
              {facility.proximity.isCalculated ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] text-[11px] font-bold">
                  <Footprints className="w-3 h-3" />
                  <span>{facility.proximity.label}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                  <MapPin className="w-2.5 h-2.5 text-slate-500" />
                  <span>{facility.proximity.label}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-white group-hover:text-[#CCFF00] transition-colors leading-snug">
              {facility.name}
            </h3>
          </div>

          <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {facility.description}
          </p>

          {/* Key Facts List */}
          <div className="mt-3.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
              <span className="truncate">{facility.exactLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{facility.openingHours}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white">{facility.accessStatus}</span>
            </div>
          </div>

          {/* Nearby Hostels & Academic Blocks Tags */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 text-[11px]">
            {facility.nearbyHostels.length > 0 && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Home className="w-3 h-3 text-[#CCFF00] shrink-0" />
                <span className="text-slate-400">Near Hostels:</span>
                <span className="text-slate-200 font-semibold truncate">
                  {facility.nearbyHostels.join(', ')}
                </span>
              </div>
            )}
            {facility.nearbyAcademicBlocks.length > 0 && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Building className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="text-slate-400">Near Blocks:</span>
                <span className="text-slate-200 font-semibold truncate">
                  {facility.nearbyAcademicBlocks.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Verification Badge */}
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Verified {facility.lastVerificationDate}</span>
            </div>
            {facility.hasVerifiedCoordinates ? (
              <span className="text-[10px] text-emerald-400 font-mono">GPS Verified</span>
            ) : (
              <span className="text-[10px] text-amber-400 font-mono">Coords Pending</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 flex items-center gap-2 border-t border-slate-800">
          <button
            onClick={() => onOpenDetails(facility)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center justify-center gap-1 cursor-pointer"
            aria-label={`View full details and rules for ${facility.name}`}
          >
            <Info className="w-3.5 h-3.5" />
            Rules & Hours
          </button>

          {isOpenPlay ? (
            <button
              onClick={() => onOpenDetails(facility)}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
              aria-label={`Open free play at ${facility.name}`}
            >
              <Play className="w-3 h-3 fill-current" />
              Open Play
            </button>
          ) : (
            <button
              onClick={() => onSelectForBooking(facility)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-bold text-xs uppercase tracking-wider transition shadow-md active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              aria-label={`Book demo slot for ${facility.name}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Reserve Slot
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
