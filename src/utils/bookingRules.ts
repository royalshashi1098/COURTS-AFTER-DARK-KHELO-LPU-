import type { Booking, Facility, Tournament, TournamentMatch } from '../types/index.ts';

/**
 * Validates Lovely Professional University 8-digit student registration number.
 * Example valid IDs: 12201948, 12004561, 11902345
 */
export function validateLpuRegNo(regNo: string): boolean {
  if (!regNo) return false;
  const trimmed = regNo.trim();
  // Standard LPU registration format: 8 digits starting with 1
  return /^[1-9]\d{7}$/.test(trimmed);
}

/**
 * Validates a 10-digit mobile phone number (supports Indian mobile format).
 * Accepts 10 digits starting with digits 6-9, optionally prefixed with +91 or 0 when sanitized.
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  // Strip 91 or 0 prefix if 12 or 11 digits respectively
  const tenDigit =
    cleaned.length === 12 && cleaned.startsWith('91')
      ? cleaned.slice(2)
      : cleaned.length === 11 && cleaned.startsWith('0')
      ? cleaned.slice(1)
      : cleaned;

  return /^[6-9]\d{9}$/.test(tenDigit);
}

/**
 * Checks if a requested booking conflicts with existing bookings.
 * Two bookings conflict if they are on the same facility, same court, same date,
 * overlapping slot time, and existing booking is not Cancelled.
 */
export function checkBookingConflict(
  existingBookings: Booking[],
  newBooking: {
    facilityId: string;
    courtNumber: number;
    date: string;
    slotTime: string;
    id?: string;
  }
): { hasConflict: boolean; reason?: string; conflictingBooking?: Booking } {
  const match = existingBookings.find((b) => {
    if (b.status === 'Cancelled') return false;
    if (newBooking.id && b.id === newBooking.id) return false;

    const sameFacility = b.facilityId === newBooking.facilityId;
    const sameCourt = b.courtNumber === newBooking.courtNumber;
    const sameDate = b.date === newBooking.date;
    const sameSlot = b.slotTime.trim() === newBooking.slotTime.trim();

    return sameFacility && sameCourt && sameDate && sameSlot;
  });

  if (match) {
    return {
      hasConflict: true,
      reason: `Court ${newBooking.courtNumber} is already booked for ${newBooking.slotTime} on ${newBooking.date} by Student Reg #${match.studentRegNo.slice(0, 4)}****.`,
      conflictingBooking: match,
    };
  }

  return { hasConflict: false };
}

/**
 * Standard university slot schedule (6:00 AM to 9:00 PM in 1-hour windows)
 */
export const STANDARD_SLOTS = [
  '06:00 - 07:00',
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
];

/**
 * Calculates remaining available slots for a given facility on a date across all courts.
 */
export function computeSlotAvailability(
  facility: Facility,
  date: string,
  existingBookings: Booking[]
): { slot: string; availableCourts: number; totalCourts: number; isFullyBooked: boolean }[] {
  const totalCourts = facility.courtCount || 1;

  return STANDARD_SLOTS.map((slot) => {
    const bookedCount = existingBookings.filter(
      (b) =>
        b.facilityId === facility.id &&
        b.date === date &&
        b.slotTime === slot &&
        b.status !== 'Cancelled'
    ).length;

    const availableCourts = Math.max(0, totalCourts - bookedCount);
    return {
      slot,
      availableCourts,
      totalCourts,
      isFullyBooked: availableCourts === 0,
    };
  });
}

/**
 * Filters facilities based on search query, sport, indoor/outdoor classification, and availability.
 */
export function filterFacilities(
  facilities: Facility[],
  filters: {
    query?: string;
    sport?: string;
    classification?: string;
    availability?: string;
  }
): Facility[] {
  const q = filters.query?.trim().toLowerCase() || '';
  const sport = filters.sport && filters.sport !== 'All' ? filters.sport.toLowerCase() : '';
  const classification = filters.classification && filters.classification !== 'All' ? filters.classification.toLowerCase() : '';
  const availability = filters.availability && filters.availability !== 'All' ? filters.availability : '';

  return facilities.filter((f) => {
    if (sport && f.sport.toLowerCase() !== sport) return false;
    if (classification && f.classification.toLowerCase() !== classification) return false;
    if (availability && f.availabilityStatus !== availability) return false;

    if (q) {
      const matchName = f.name.toLowerCase().includes(q);
      const matchSport = f.sport.toLowerCase().includes(q);
      const matchLoc = f.exactLocation.toLowerCase().includes(q) || f.campusBlock.toLowerCase().includes(q);
      const matchDesc = f.description.toLowerCase().includes(q);
      return matchName || matchSport || matchLoc || matchDesc;
    }

    return true;
  });
}

/**
 * Advances a winner in a tournament bracket tree.
 */
export function advanceTournamentMatch(
  tournament: Tournament,
  matchId: string,
  winnerTeamId: string,
  scores: { team1Score: string; team2Score: string }
): Tournament {
  const updatedMatches = tournament.matches.map((m) => {
    if (m.id !== matchId) return m;

    const isTeam1 = m.team1.id === winnerTeamId;
    return {
      ...m,
      status: 'Completed' as const,
      team1: { ...m.team1, score: scores.team1Score, isWinner: isTeam1 },
      team2: { ...m.team2, score: scores.team2Score, isWinner: !isTeam1 },
    };
  });

  // Find target match if this match had a nextMatchId
  const currentMatch = tournament.matches.find((m) => m.id === matchId);
  if (currentMatch && currentMatch.nextMatchId) {
    const winningTeam =
      currentMatch.team1.id === winnerTeamId ? currentMatch.team1 : currentMatch.team2;

    const targetIdx = updatedMatches.findIndex((m) => m.id === currentMatch.nextMatchId);
    if (targetIdx !== -1) {
      const targetMatch = updatedMatches[targetIdx];
      // Place into team1 if empty or if matching previous bracket slot, else team2
      if (!targetMatch.team1.id || targetMatch.team1.name === 'TBD') {
        updatedMatches[targetIdx] = {
          ...targetMatch,
          team1: { id: winningTeam.id, name: winningTeam.name },
        };
      } else {
        updatedMatches[targetIdx] = {
          ...targetMatch,
          team2: { id: winningTeam.id, name: winningTeam.name },
        };
      }
    }
  }

  return {
    ...tournament,
    matches: updatedMatches,
  };
}
