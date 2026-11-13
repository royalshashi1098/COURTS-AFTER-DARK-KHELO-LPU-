import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Trash2,
  Footprints,
  Info,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import type { Booking } from '../types/index.ts';

interface MyBookingsViewProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onNavigateToBooking: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onCancelBooking,
  onNavigateToBooking,
}) => {
  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);

  const activeBookings = bookings.filter((b) => b.status === 'Confirmed');
  const pastOrCancelledBookings = bookings.filter((b) => b.status !== 'Confirmed');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5" />
            Digital Sports Passes
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            My Campus Facility Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your active passes, verify arena entry instructions, or cancel demo slots to free up space.
          </p>
        </div>

        <button
          onClick={onNavigateToBooking}
          className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shrink-0 cursor-pointer"
        >
          Reserve New Slot
        </button>
      </div>

      {/* Demonstration Storage Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/40 text-xs text-amber-200 mb-8 flex items-start gap-3 shadow-md">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white block mb-0.5">Demonstration Prototype Storage Note:</strong>
          These passes are stored in the KHELO LPU server prototype database with live conflict checking. They provide an end-to-end interactive demonstration for students and faculty. Please carry your physical LPU Student RFID Card and proper footwear to campus arenas.
        </div>
      </div>

      {/* Active Passes Section */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Active Reservations ({activeBookings.length})
          </h2>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Ready for Arena Turnstile
          </span>
        </div>

        {activeBookings.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-[#0D172A] border border-slate-800 p-8">
            <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No active facility passes</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              You haven't reserved any facility slots yet.
            </p>
            <button
              onClick={onNavigateToBooking}
              className="px-4 py-2 rounded-xl bg-[#CCFF00] text-black font-bold text-xs uppercase tracking-wider"
            >
              Reserve a Slot Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl bg-[#0D172A] border border-slate-700/80 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#CCFF00]">
                        {b.sport} • Court #{b.courtNumber}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{b.facilityName}</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Confirmed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 py-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Date</span>
                      <span className="font-bold text-white">{b.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Time Window</span>
                      <span className="font-bold text-[#CCFF00]">{b.slotTime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Student</span>
                      <span className="text-white truncate block">{b.studentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">LPU Reg No</span>
                      <span className="font-mono text-white">{b.studentRegNo}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 block uppercase">Contact Phone</span>
                      <span className="font-mono font-bold text-white text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#CCFF00]" />
                        +91 {b.phoneNumber || 'Not supplied'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                    <span>Gear: {b.equipmentRentalRequested ? 'Equipment Requested' : 'Self Gear'}</span>
                    <span className="font-mono text-[10px] text-slate-400">ID: {b.id.slice(-6)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPass(b)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>View Digital Pass</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Cancel this demo booking and release slot to other students?')) {
                        onCancelBooking(b.id);
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel Slot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past / Cancelled History */}
      {pastOrCancelledBookings.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Past & Cancelled Passes ({pastOrCancelledBookings.length})
          </h2>
          <div className="space-y-2">
            {pastOrCancelledBookings.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400"
              >
                <div>
                  <span className="font-semibold text-slate-300 block">
                    {b.facilityName} (Court #{b.courtNumber})
                  </span>
                  <span className="text-[11px]">
                    {b.date} • {b.slotTime}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Digital Pass Modal */}
      {selectedPass && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0F1F3D] to-[#080E1E] border-2 border-[#CCFF00] p-6 shadow-2xl text-slate-100">
            <div className="text-center pb-4 border-b border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Lovely Professional University • Campus Sports Board
              </span>
              <h3 className="text-lg font-black text-white mt-1">{selectedPass.facilityName}</h3>
              <span className="text-xs font-bold text-[#CCFF00]">
                {selectedPass.sport} • Court #{selectedPass.courtNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Student Name</span>
                <span className="font-bold text-white">{selectedPass.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">LPU Reg No</span>
                <span className="font-mono font-bold text-white">{selectedPass.studentRegNo}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Date</span>
                <span className="font-bold text-[#CCFF00]">{selectedPass.date}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Slot Time</span>
                <span className="font-bold text-white">{selectedPass.slotTime}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 text-[10px] uppercase block">Registered Phone</span>
                <span className="font-mono font-bold text-white flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#CCFF00]" />
                  +91 {selectedPass.phoneNumber || 'Not supplied'}
                </span>
              </div>
            </div>

            {/* QR Section */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 bg-white p-2 rounded-xl mb-2">
                <QrCode className="w-full h-full text-black" />
              </div>
              <span className="font-mono text-xs text-emerald-400 font-bold">
                TOKEN: {selectedPass.id}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Scan at arena entrance turnstile with student RFID
              </span>
            </div>

            <button
              onClick={() => setSelectedPass(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
