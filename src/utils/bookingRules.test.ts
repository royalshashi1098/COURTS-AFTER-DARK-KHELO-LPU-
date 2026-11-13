import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLpuRegNo,
  validatePhoneNumber,
  checkBookingConflict,
  computeSlotAvailability,
  filterFacilities,
  advanceTournamentMatch,
} from './bookingRules.ts';
import type { Booking, Facility, Tournament } from '../types/index.ts';

test('validateLpuRegNo correctly validates standard 8-digit LPU registration numbers', () => {
  assert.equal(validateLpuRegNo('12201948'), true);
  assert.equal(validateLpuRegNo('12004561'), true);
  assert.equal(validateLpuRegNo('11903344'), true);

  // Invalid: too short, alphanumeric, or empty
  assert.equal(validateLpuRegNo('123'), false);
  assert.equal(validateLpuRegNo('122019489'), false);
  assert.equal(validateLpuRegNo('ABCD1234'), false);
  assert.equal(validateLpuRegNo(''), false);
  assert.equal(validateLpuRegNo('01234567'), false);
});

test('validatePhoneNumber correctly validates 10-digit mobile phone numbers', () => {
  assert.equal(validatePhoneNumber('9876543210'), true);
  assert.equal(validatePhoneNumber('7018812345'), true);
  assert.equal(validatePhoneNumber('+91 9876543210'), true);
  assert.equal(validatePhoneNumber('09876543210'), true);
  assert.equal(validatePhoneNumber('98765-43210'), true);

  // Invalid: too short, letters, or invalid mobile starting digit
  assert.equal(validatePhoneNumber('12345'), false);
  assert.equal(validatePhoneNumber('1234567890'), false); // starts with 1
  assert.equal(validatePhoneNumber('987654321'), false); // 9 digits
  assert.equal(validatePhoneNumber('987654321000'), false); // too long
  assert.equal(validatePhoneNumber('98765abcde'), false);
  assert.equal(validatePhoneNumber(''), false);
});

test('checkBookingConflict flags identical facility, court, date, and slot', () => {
  const existingBookings: Booking[] = [
    {
      id: 'bk-1',
      facilityId: 'fac-badminton-indoor',
      facilityName: 'Shanti Devi Mittal Indoor Badminton Arena',
      sport: 'Badminton',
      courtNumber: 2,
      date: '2026-10-20',
      slotTime: '18:00 - 19:00',
      studentName: 'Aarav Sharma',
      studentRegNo: '12201948',
      schoolDepartment: 'School of Computer Science',
      contactEmail: 'aarav@lpu.in',
      phoneNumber: '9876543210',
      equipmentRentalRequested: false,
      status: 'Confirmed',
      createdAt: '2026-10-19T10:00:00Z',
      isDemoNoticeAcknowledged: true,
    },
  ];

  // Attempting exact same court & slot
  const conflictResult = checkBookingConflict(existingBookings, {
    facilityId: 'fac-badminton-indoor',
    courtNumber: 2,
    date: '2026-10-20',
    slotTime: '18:00 - 19:00',
  });
  assert.equal(conflictResult.hasConflict, true);
  assert.match(conflictResult.reason || '', /Court 2 is already booked/);

  // Different court number should NOT conflict
  const differentCourtResult = checkBookingConflict(existingBookings, {
    facilityId: 'fac-badminton-indoor',
    courtNumber: 3,
    date: '2026-10-20',
    slotTime: '18:00 - 19:00',
  });
  assert.equal(differentCourtResult.hasConflict, false);

  // Cancelled booking should NOT conflict
  const cancelledBookings: Booking[] = [
    { ...existingBookings[0], status: 'Cancelled' },
  ];
  const cancelledResult = checkBookingConflict(cancelledBookings, {
    facilityId: 'fac-badminton-indoor',
    courtNumber: 2,
    date: '2026-10-20',
    slotTime: '18:00 - 19:00',
  });
  assert.equal(cancelledResult.hasConflict, false);
});

test('computeSlotAvailability calculates remaining court capacity across slots', () => {
  const sampleFacility: Facility = {
    id: 'fac-squash',
    name: 'Squash Courts Block 28',
    sport: 'Squash',
    supportedSports: ['Squash'],
    facilityType: 'Indoor Arena',
    classification: 'Indoor',
    publishedQuantity: '2 Glass Back Squash Courts',
    courtCount: 2,
    description: 'Indoor air-conditioned glass back squash courts.',
    equipmentInfo: 'Rackets available at equipment desk.',
    exactLocation: 'Block 28, Ground Floor, Shanti Devi Mittal Complex',
    campusBlock: 'Block 28',
    hasVerifiedCoordinates: true,
    coordinates: { lat: 31.2458, lng: 75.7035 },
    nearbyHostels: ['BH-2', 'BH-3'],
    nearbyAcademicBlocks: ['Block 28'],
    mapLink: 'https://maps.google.com/?q=LPU+Block+28',
    openingHours: '06:00 - 21:00',
    fees: 'Free with LPU ID card',
    accessStatus: 'Demo Reservation Required',
    accessRules: ['Non-marking shoes mandatory'],
    bookingProcess: 'Advance booking slot required',
    availabilityStatus: 'Available',
    lastVerificationDate: '2026-10-15',
    officialSource: 'DSW Sports Affairs LPU',
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8',
    suitableForGroup: '1v1 or 2v2',
  };

  const bookings: Booking[] = [
    {
      id: 'bk-sq-1',
      facilityId: 'fac-squash',
      facilityName: 'Squash Courts Block 28',
      sport: 'Squash',
      courtNumber: 1,
      date: '2026-10-22',
      slotTime: '06:00 - 07:00',
      studentName: 'Demo Student',
      studentRegNo: '12104599',
      schoolDepartment: 'Mittal School of Business',
      contactEmail: 'demo@lpu.in',
      phoneNumber: '9876543210',
      equipmentRentalRequested: false,
      status: 'Confirmed',
      createdAt: '2026-10-19T00:00:00Z',
      isDemoNoticeAcknowledged: true,
    },
    {
      id: 'bk-sq-2',
      facilityId: 'fac-squash',
      facilityName: 'Squash Courts Block 28',
      sport: 'Squash',
      courtNumber: 2,
      date: '2026-10-22',
      slotTime: '06:00 - 07:00',
      studentName: 'Demo Student 2',
      studentRegNo: '12208877',
      schoolDepartment: 'School of Bioengineering',
      contactEmail: 'demo2@lpu.in',
      phoneNumber: '9876543211',
      equipmentRentalRequested: false,
      status: 'Confirmed',
      createdAt: '2026-10-19T00:00:00Z',
      isDemoNoticeAcknowledged: true,
    },
  ];

  const slots = computeSlotAvailability(sampleFacility, '2026-10-22', bookings);
  const slot6am = slots.find((s) => s.slot === '06:00 - 07:00');
  assert.equal(slot6am?.availableCourts, 0);
  assert.equal(slot6am?.isFullyBooked, true);

  const slot7am = slots.find((s) => s.slot === '07:00 - 08:00');
  assert.equal(slot7am?.availableCourts, 2);
  assert.equal(slot7am?.isFullyBooked, false);
});

test('filterFacilities performs accurate multi-parameter filtering', () => {
  const facilities: Facility[] = [
    {
      id: 'fac-1',
      name: 'Olympic Size Swimming Pool',
      sport: 'Swimming',
      supportedSports: ['Swimming'],
      facilityType: 'Aquatic Centre',
      classification: 'Indoor',
      publishedQuantity: '8 Lanes 50m',
      courtCount: 8,
      description: 'Heated indoor swimming pool with coach supervision.',
      equipmentInfo: 'Swim cap and goggles mandatory.',
      exactLocation: 'Block 30 Basement Complex',
      campusBlock: 'Block 30',
      hasVerifiedCoordinates: true,
      coordinates: { lat: 31.2463, lng: 75.7040 },
      nearbyHostels: ['BH-3', 'BH-4'],
      nearbyAcademicBlocks: ['Block 30'],
      mapLink: 'https://maps.google.com/?q=LPU+Block+30',
      openingHours: '06:00 - 20:00',
      fees: 'Free for verified students',
      accessStatus: 'Demo Reservation Required',
      accessRules: ['Medical fitness certificate on file'],
      bookingProcess: 'Scan student RFID at turnstile',
      availabilityStatus: 'Available',
      lastVerificationDate: '2026-10-12',
      officialSource: 'LPU DSW Sports Affairs',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635',
      suitableForGroup: 'Individuals & Squads',
    },
    {
      id: 'fac-2',
      name: 'Central Football Stadium & Track',
      sport: 'Football',
      supportedSports: ['Football', 'Athletics'],
      facilityType: 'Championship Stadium',
      classification: 'Outdoor',
      publishedQuantity: '1 Regulation Field + 400m Track',
      courtCount: 1,
      description: 'FIFA standard natural turf football pitch.',
      equipmentInfo: 'Studded boots permitted on grass.',
      exactLocation: 'Behind Unipolis, Central Campus',
      campusBlock: 'Central Grounds',
      hasVerifiedCoordinates: true,
      coordinates: { lat: 31.2455, lng: 75.7042 },
      nearbyHostels: ['BH-3', 'BH-4'],
      nearbyAcademicBlocks: ['Unipolis'],
      mapLink: 'https://maps.google.com/?q=LPU+Central+Grounds',
      openingHours: '06:00 - 21:00',
      fees: 'Free for student teams',
      accessStatus: 'Coached & Team Sessions',
      accessRules: ['Jersey and shin guards recommended'],
      bookingProcess: 'Online slot or DSW approval',
      availabilityStatus: 'Available',
      lastVerificationDate: '2026-10-14',
      officialSource: 'LPU Sports Board',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
      suitableForGroup: 'Teams (11v11)',
    },
  ];

  // Filter by sport
  const swimOnly = filterFacilities(facilities, { sport: 'Swimming' });
  assert.equal(swimOnly.length, 1);
  assert.equal(swimOnly[0].id, 'fac-1');

  // Filter by classification
  const outdoorOnly = filterFacilities(facilities, { classification: 'Outdoor' });
  assert.equal(outdoorOnly.length, 1);
  assert.equal(outdoorOnly[0].id, 'fac-2');

  // Text search "turf"
  const searchTurf = filterFacilities(facilities, { query: 'turf' });
  assert.equal(searchTurf.length, 1);
  assert.equal(searchTurf[0].name, 'Central Football Stadium & Track');
});

test('advanceTournamentMatch correctly advances winner to the next round', () => {
  const tournament: Tournament = {
    id: 'tour-1',
    title: 'LPU Inter-School Winter Trophy 2026',
    sport: 'Badminton',
    category: 'Inter-School',
    startDate: '2026-10-25',
    endDate: '2026-10-28',
    status: 'In Progress',
    venue: 'Block 28 Shanti Devi Mittal Indoor Complex',
    prizePool: '₹25,000 + University Medals',
    matches: [
      {
        id: 'qf-1',
        round: 'Quarterfinals',
        matchNumber: 1,
        team1: { id: 'team-cse', name: 'CSE Smashers' },
        team2: { id: 'team-ece', name: 'ECE Volts' },
        status: 'Scheduled',
        venue: 'Court 1',
        scheduledTime: '10:00 AM',
        nextMatchId: 'sf-1',
      },
      {
        id: 'sf-1',
        round: 'Semifinals',
        matchNumber: 1,
        team1: { id: '', name: 'TBD' },
        team2: { id: 'team-mba', name: 'MBA Titans' },
        status: 'Scheduled',
        venue: 'Court 1',
        scheduledTime: '02:00 PM',
      },
    ],
  };

  const updated = advanceTournamentMatch(tournament, 'qf-1', 'team-cse', {
    team1Score: '21-18, 21-19',
    team2Score: '18-21, 19-21',
  });

  const qf1 = updated.matches.find((m) => m.id === 'qf-1');
  assert.equal(qf1?.status, 'Completed');
  assert.equal(qf1?.team1.isWinner, true);
  assert.equal(qf1?.team2.isWinner, false);

  const sf1 = updated.matches.find((m) => m.id === 'sf-1');
  assert.equal(sf1?.team1.id, 'team-cse');
  assert.equal(sf1?.team1.name, 'CSE Smashers');
});
