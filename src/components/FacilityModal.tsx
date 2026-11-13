import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Sparkles,
  Footprints,
  Info,
  Camera,
} from 'lucide-react';
import type { Facility } from '../types/index.ts';

interface FacilityModalProps {
  facility: Facility | null;
  onClose: () => void;
  onSelectForBooking: (facility: Facility) => void;
}

export const FacilityModal: React.FC<FacilityModalProps> = ({
  facility,
  onClose,
  onSelectForBooking,
}) => {
  const [activePhoto, setActivePhoto] = useState<string>(facility?.image || '');

  useEffect(() => {
    if (facility) {
      setActivePhoto(facility.image);
    }
  }, [facility]);

  if (!facility) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="facility-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0D172A] border border-slate-700 shadow-2xl text-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Image */}
        <div className="relative h-56 w-full shrink-0 bg-slate-900">
          <img
            src={activePhoto || facility.image}
            alt={facility.name}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D172A] via-black/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white transition border border-white/20"
            aria-label="Close facility details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#CCFF00] text-black uppercase">
                {facility.sport}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-white border border-slate-600">
                {facility.classification}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {facility.availabilityStatus}
              </span>
            </div>
            <h2 id="facility-modal-title" className="text-xl sm:text-2xl font-black text-white">
              {facility.name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Published Capacity & Quantity */}
          <div className="bg-[#080E1E] p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                Official Published Capacity
              </span>
              <p className="text-base font-bold text-[#CCFF00] mt-1">
                {facility.publishedQuantity}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Target configuration: {facility.suitableForGroup}
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-mono text-slate-300 shrink-0">
              {facility.courtCount} {facility.courtCount > 1 ? 'Units / Courts' : 'Unit'}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              Facility Overview
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              {facility.description}
            </p>
          </div>

          {/* Ground Photographs Gallery */}
          {facility.gallery && facility.gallery.length > 0 && (
            <div className="bg-[#080E1E] p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <Camera className="w-4 h-4 text-[#CCFF00]" />
                  <span>Ground Photographs ({facility.gallery.length})</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  On-Site GPS Photos
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {facility.gallery.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhoto(photo)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer group text-left ${
                      activePhoto === photo
                        ? 'border-[#CCFF00] shadow-md shadow-[#CCFF00]/20 ring-1 ring-[#CCFF00]'
                        : 'border-slate-700/60 hover:border-slate-500'
                    }`}
                    aria-label={`View photograph ${idx + 1}`}
                  >
                    <img
                      src={photo}
                      alt={`${facility.name} photograph ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                      #{idx + 1}
                    </span>
                    {activePhoto === photo && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#CCFF00] text-[9px] text-black font-extrabold uppercase">
                        Viewing
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Click any photo thumbnail to view it in full resolution in the header banner.
              </p>
            </div>
          )}

          {/* Location & Map Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
                <MapPin className="w-4 h-4 text-[#CCFF00]" />
                <span>Exact Campus Location</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-normal">
                {facility.exactLocation}
              </p>
              <a
                href={facility.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#CCFF00] hover:underline"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
                <Clock className="w-4 h-4 text-[#CCFF00]" />
                <span>Operating Hours & Fees</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                <strong>Hours:</strong> {facility.openingHours}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                <strong>Fees:</strong> {facility.fees}
              </p>
            </div>
          </div>

          {/* Equipment & Footwear Rules */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-xs">
              <Footprints className="w-4 h-4 text-[#CCFF00]" />
              <span>Footwear, Dress Code & Equipment</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Equipment:</strong> {facility.equipmentInfo}
            </p>
            <div>
              <strong className="text-xs text-slate-200 block mb-1.5">Mandatory Campus Access Rules:</strong>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {facility.accessRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking Process & Official Verification */}
          <div className="bg-[#080E1E] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#CCFF00]" />
                Booking Process
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified: {facility.lastVerificationDate}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {facility.bookingProcess}
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              <strong>Official Source:</strong> {facility.officialSource}
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onSelectForBooking(facility);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Proceed to Reserve Slot
          </button>
        </div>
      </div>
    </div>
  );
};
