import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Footprints,
  Download,
  Share2,
  Phone,
} from 'lucide-react';
import { STANDARD_SLOTS, validateLpuRegNo, validatePhoneNumber } from '../utils/bookingRules.ts';
import type { Booking, Facility, StudentUser } from '../types/index.ts';

interface BookingFlowProps {
  facilities: Facility[];
  preselectedFacility: Facility | null;
  currentUser: StudentUser;
  onBookingCreated: (booking: Booking) => void;
  onViewMyBookings: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  facilities,
  preselectedFacility,
  currentUser,
  onBookingCreated,
  onViewMyBookings,
}) => {
  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Setup & Slot, 2: Student Details & Confirm, 3: Pass View

  // Form selections
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    preselectedFacility?.id || (facilities.length > 0 ? facilities[0].id : '')
  );

  // Default to today in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(STANDARD_SLOTS[4] || '16:00 - 17:00');
  const [selectedCourt, setSelectedCourt] = useState<number>(1);

  // Student Demonstration details
  const [studentName, setStudentName] = useState(currentUser.name);
  const [studentRegNo, setStudentRegNo] = useState(currentUser.regNo);
  const [schoolDept, setSchoolDept] = useState(currentUser.school);
  const [contactEmail, setContactEmail] = useState(currentUser.email);
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [rentalEquipment, setRentalEquipment] = useState(false);
  const [acknowledgedDisclaimer, setAcknowledgedDisclaimer] = useState(true);

  // Conflict and status state
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing bookings for conflict check preview
  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExistingBookings(data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch existing bookings:', err));
  }, []);

  // Update when preselectedFacility changes
  useEffect(() => {
    if (preselectedFacility) {
      setSelectedFacilityId(preselectedFacility.id);
    }
  }, [preselectedFacility]);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  // Calculate court conflict state for current date & slot
  const isCourtTaken = (courtNum: number) => {
    return existingBookings.some(
      (b) =>
        b.facilityId === selectedFacilityId &&
        b.courtNumber === courtNum &&
        b.date === selectedDate &&
        b.slotTime === selectedSlot &&
        b.status !== 'Cancelled'
    );
  };

  const handleProceedToDetails = () => {
    // Check if the currently chosen court is taken
    if (isCourtTaken(selectedCourt)) {
      setConflictError(
        `Court ${selectedCourt} is already occupied on ${selectedDate} for ${selectedSlot}. Please pick an open court.`
      );
      return;
    }
    setConflictError(null);
    setStep(2);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    if (!validateLpuRegNo(studentRegNo)) {
      setConflictError('Please enter a valid 8-digit LPU Registration Number (e.g. 12201948).');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setConflictError('Please enter a valid 10-digit mobile phone number (e.g. 9876543210).');
      return;
    }

    if (!acknowledgedDisclaimer) {
      setConflictError('Please acknowledge the demonstration prototype notice.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: selectedFacility.id,
          courtNumber: selectedCourt,
          date: selectedDate,
          slotTime: selectedSlot,
          studentName,
          studentRegNo,
          schoolDepartment: schoolDept,
          contactEmail,
          phoneNumber,
          equipmentRentalRequested: rentalEquipment,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setConflictError(resData.message || 'Slot conflict detected.');
        } else {
          setConflictError(resData.message || 'Failed to complete booking.');
        }
        setIsSubmitting(false);
        return;
      }

      setConfirmedBooking(resData.data);
      onBookingCreated(resData.data);
      setStep(3);
    } catch (err: unknown) {
      console.error(err);
      setConflictError('Network error connecting to booking service. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Step Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">
          Demonstration Reservation Flow
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Reserve Sports Facility Slot
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
          Experience real conflict checking, court assignment, and instant digital pass issuance for LPU campus arenas.
        </p>

        {/* Multi-step Breadcrumb */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 text-xs font-bold">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${step === 1 ? 'bg-[#CCFF00] text-black' : 'bg-slate-800 text-slate-400'}`}>
            <span>1</span>
            <span>Facility & Slot</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${step === 2 ? 'bg-[#CCFF00] text-black' : 'bg-slate-800 text-slate-400'}`}>
            <span>2</span>
            <span>Student Details</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${step === 3 ? 'bg-[#CCFF00] text-black' : 'bg-slate-800 text-slate-400'}`}>
            <span>3</span>
            <span>Digital Sports Pass</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Facility, Date, Slot & Court */}
      {step === 1 && (
        <div className="bg-[#0D172A] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6 animate-fadeIn">
          {/* Facility Selector */}
          <div>
            <label htmlFor="facility-select" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Campus Facility
            </label>
            <select
              id="facility-select"
              value={selectedFacilityId}
              onChange={(e) => {
                setSelectedFacilityId(e.target.value);
                setSelectedCourt(1);
                setConflictError(null);
              }}
              className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.sport} — {f.name} ({f.campusBlock})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Facility Preview Card */}
          {selectedFacility && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <img
                src={selectedFacility.image}
                alt={selectedFacility.name}
                className="w-full sm:w-28 h-20 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#CCFF00] uppercase">{selectedFacility.sport}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-white font-mono">{selectedFacility.campusBlock}</span>
                  <span className="text-[10px] text-emerald-400">Verified: {selectedFacility.lastVerificationDate}</span>
                </div>
                <h4 className="font-bold text-white text-sm mt-0.5">{selectedFacility.name}</h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1">{selectedFacility.description}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-amber-300">
                  <Footprints className="w-3.5 h-3.5" />
                  <span>{selectedFacility.accessRules[0]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label htmlFor="booking-date" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Choose Date
            </label>
            <input
              id="booking-date"
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setConflictError(null);
              }}
              className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
            />
          </div>

          {/* Time Slot Picker Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Time Window (1-Hour Slot)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STANDARD_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setSelectedSlot(slot);
                      setConflictError(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#CCFF00] text-black shadow-lg scale-102'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{slot}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Court Selector with Real-time Occupancy Indicator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Select Court / Unit
              </label>
              <span className="text-[11px] text-slate-400">
                Green = Open, Red = Reserved
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Array.from({ length: selectedFacility.courtCount || 1 }, (_, i) => i + 1).map((courtNum) => {
                const taken = isCourtTaken(courtNum);
                const isChosen = selectedCourt === courtNum;

                return (
                  <button
                    key={courtNum}
                    type="button"
                    disabled={taken}
                    onClick={() => {
                      setSelectedCourt(courtNum);
                      setConflictError(null);
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      taken
                        ? 'bg-rose-950/30 border-rose-800/60 text-rose-400 opacity-60 cursor-not-allowed'
                        : isChosen
                        ? 'bg-[#CCFF00] border-[#CCFF00] text-black shadow-lg scale-105'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <span>Court #{courtNum}</span>
                    <span className="text-[10px] font-normal">
                      {taken ? '❌ Reserved' : isChosen ? 'Selected' : '✅ Available'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {conflictError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-700 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{conflictError}</span>
            </div>
          )}

          {/* Next Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleProceedToDetails}
              className="px-6 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Student Info</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Student Details & Conflict Confirmation */}
      {step === 2 && (
        <form onSubmit={handleSubmitBooking} className="bg-[#0D172A] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6 animate-fadeIn">
          {/* Reservation Summary */}
          <div className="p-4 rounded-xl bg-[#080E1E] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#CCFF00] font-bold uppercase tracking-wider block text-[10px]">
                Selected Facility Slot
              </span>
              <p className="font-bold text-white text-sm mt-0.5">
                {selectedFacility.name} — Court #{selectedCourt}
              </p>
              <p className="text-slate-400 mt-0.5">
                {selectedDate} • {selectedSlot} • {selectedFacility.campusBlock}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-[#CCFF00] hover:underline font-semibold"
            >
              Change Slot
            </button>
          </div>

          {/* Student Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="student-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Student Full Name *
              </label>
              <input
                id="student-name-input"
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div>
              <label htmlFor="student-reg-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                LPU Registration Number * (8-digit ID)
              </label>
              <input
                id="student-reg-input"
                type="text"
                required
                pattern="[1-9][0-9]{7}"
                maxLength={8}
                value={studentRegNo}
                onChange={(e) => {
                  setStudentRegNo(e.target.value);
                  setConflictError(null);
                }}
                placeholder="e.g. 12201948"
                className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Official student ID issued by Lovely Professional University.
              </span>
            </div>

            <div>
              <label htmlFor="student-school-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                School / Department
              </label>
              <input
                id="student-school-input"
                type="text"
                value={schoolDept}
                onChange={(e) => setSchoolDept(e.target.value)}
                placeholder="e.g. School of Computer Science & Engineering"
                className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div>
              <label htmlFor="student-email-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                University Email Address
              </label>
              <input
                id="student-email-input"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. student.12201948@lpu.in"
                className="w-full bg-[#080E1E] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div>
              <label htmlFor="student-phone-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Phone Number * (10-Digit Mobile)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">
                  +91
                </span>
                <input
                  id="student-phone-input"
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(onlyDigits);
                    setConflictError(null);
                  }}
                  placeholder="9876543210"
                  className="w-full bg-[#080E1E] border border-slate-700 rounded-xl pl-12 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Required for slot verification SMS alerts and arena gate access.
              </span>
            </div>
          </div>

          {/* Equipment Rental Checkbox */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="rental-check"
              checked={rentalEquipment}
              onChange={(e) => setRentalEquipment(e.target.checked)}
              className="mt-1 h-4 w-4 rounded accent-[#CCFF00]"
            />
            <label htmlFor="rental-check" className="text-xs text-slate-300 cursor-pointer">
              <strong className="text-white block">Request Equipment Issue at Sports Desk</strong>
              <span>
                Reserve equipment (rackets, shuttles, balls) for this session upon presenting student RFID card.
              </span>
            </label>
          </div>

          {/* Mandatory Demo Disclaimer Notice */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/60 flex items-start gap-3">
            <input
              type="checkbox"
              id="demo-disclaimer"
              required
              checked={acknowledgedDisclaimer}
              onChange={(e) => setAcknowledgedDisclaimer(e.target.checked)}
              className="mt-1 h-4 w-4 rounded accent-[#CCFF00]"
            />
            <label htmlFor="demo-disclaimer" className="text-xs text-amber-200 cursor-pointer leading-relaxed">
              <strong>Demonstration Prototype Notice:</strong> I understand that this reservation is processed in KHELO LPU's verified demonstration database with real conflict checking. It does not connect directly to LPU's internal UMS/ERP servers. Standard campus facility access rules and dress codes apply.
            </label>
          </div>

          {conflictError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-700 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{conflictError}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Checking conflicts & issuing pass...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Issue Digital Pass</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Confirmed Digital Sports Pass */}
      {step === 3 && confirmedBooking && (
        <div className="bg-[#0D172A] rounded-2xl border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn max-w-2xl mx-auto">
          {/* Success Banner */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Slot Reserved Successfully
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              KHELO LPU Digital Sports Pass
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pass ID: <span className="font-mono text-white">{confirmedBooking.id}</span>
            </p>
          </div>

          {/* Boarding-style Pass Card */}
          <div className="bg-gradient-to-b from-[#080E1E] to-[#0A162B] rounded-2xl border-2 border-[#CCFF00]/40 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 rounded-bl-full pointer-events-none" />

            {/* Pass Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Lovely Professional University</span>
                <h3 className="text-lg font-black text-white mt-0.5">{confirmedBooking.facilityName}</h3>
                <span className="text-xs text-[#CCFF00] font-bold">{confirmedBooking.sport} • Court #{confirmedBooking.courtNumber}</span>
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-xs font-black uppercase">
                {confirmedBooking.status}
              </div>
            </div>

            {/* Pass Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Student Name</span>
                <span className="font-bold text-white text-sm">{confirmedBooking.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Registration No</span>
                <span className="font-mono font-bold text-white text-sm">{confirmedBooking.studentRegNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                <span className="font-semibold text-white truncate block">{confirmedBooking.schoolDepartment}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Date</span>
                <span className="font-bold text-[#CCFF00] text-sm">{confirmedBooking.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Slot Window</span>
                <span className="font-bold text-white text-sm">{confirmedBooking.slotTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Student Phone</span>
                <span className="font-mono font-bold text-white text-sm flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#CCFF00]" />
                  +91 {confirmedBooking.phoneNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Equipment Issue</span>
                <span className="font-semibold text-white">
                  {confirmedBooking.equipmentRentalRequested ? 'Requested' : 'Personal Gear'}
                </span>
              </div>
            </div>

            {/* Simulated Digital Barcode / QR */}
            <div className="pt-4 border-t border-dashed border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white p-1.5 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-full h-full text-black" />
                </div>
                <div className="text-left text-[11px] text-slate-300">
                  <span className="font-bold text-white block">Present at Arena Turnstile</span>
                  <span className="text-slate-400 block">Show alongside physical LPU RFID Card</span>
                  <span className="font-mono text-[9px] text-[#CCFF00]">AUTH-HASH: {confirmedBooking.id.slice(-8).toUpperCase()}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Demonstration Pass</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">Conflict Checked ✓</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setStep(1);
                setConfirmedBooking(null);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Book Another Slot
            </button>

            <button
              onClick={onViewMyBookings}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg"
            >
              View in My Passes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
