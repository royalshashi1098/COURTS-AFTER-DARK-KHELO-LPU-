import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineDistance,
  estimateWalkingMinutes,
  getCampusAnchor,
  calculatePlaygroundProximity,
  filterAndSortPlaygrounds,
  CAMPUS_ANCHORS,
} from './distanceUtils.ts';
import type { Facility } from '../types/index.ts';

test('calculateHaversineDistance accurately computes meter distance between campus points', () => {
  // BH-1 (31.2435, 75.7025) and Block 28 (31.2458, 75.7035)
  const dist = calculateHaversineDistance(31.2435, 75.7025, 31.2458, 75.7035);
  // Expected distance ~ 270m
  assert.ok(dist >= 250 && dist <= 300, `Expected ~270m, got ${dist}`);

  // Same coordinates should return 0
  assert.equal(calculateHaversineDistance(31.245, 75.702, 31.245, 75.702), 0);
});

test('estimateWalkingMinutes calculates realistic walking time based on 80m/min pace', () => {
  assert.equal(estimateWalkingMinutes(80), 1);
  assert.equal(estimateWalkingMinutes(240), 3);
  assert.equal(estimateWalkingMinutes(800), 10);
  assert.equal(estimateWalkingMinutes(0), 1);
});

test('calculatePlaygroundProximity strictly refuses to invent distance when coordinates are unverified', () => {
  const unverifiedPlayground: Facility = {
    id: 'fac-unverified',
    name: 'Proposed East Open Field',
    sport: 'Open Play & General Sports',
    supportedSports: ['Football', 'Cricket'],
    facilityType: 'Open Playing Ground',
    classification: 'Outdoor',
    publishedQuantity: 'Open Ground',
    courtCount: 1,
    description: 'Open lawn space for student recreational play.',
    equipmentInfo: 'No equipment issued.',
    exactLocation: 'Near East Gate Perimeter',
    campusBlock: 'East Sector',
    hasVerifiedCoordinates: false, // Unverified coordinates!
    nearbyHostels: ['BH-7', 'BH-8'],
    nearbyAcademicBlocks: ['Block 55'],
    mapLink: '',
    openingHours: 'Daylight hours',
    fees: 'Free',
    accessStatus: 'Open Free Play',
    accessRules: ['Daylight play only'],
    bookingProcess: 'Walk-in open ground',
    availabilityStatus: 'Available',
    lastVerificationDate: '2026-10-18',
    officialSource: 'DSW Ground Notice',
    isVerified: false,
    image: '',
    suitableForGroup: 'Casual Groups',
  };

  const bh1Anchor = CAMPUS_ANCHORS[0]; // BH-1
  const result = calculatePlaygroundProximity(unverifiedPlayground, bh1Anchor);

  assert.equal(result.isCalculated, false);
  assert.equal(result.distanceMeters, undefined);
  assert.match(result.label, /Coordinates unverified/);
});

test('filterAndSortPlaygrounds sorts nearest facilities first when hostel anchor is selected', () => {
  const pClose: Facility = {
    id: 'p-close',
    name: 'BH-1 Recreational Volleyball Court',
    sport: 'Volleyball',
    supportedSports: ['Volleyball'],
    facilityType: 'Hostel Recreational Court',
    classification: 'Outdoor',
    publishedQuantity: '1 Sand Court',
    courtCount: 1,
    description: 'Recreational court for BH-1 residents.',
    equipmentInfo: 'Net fixed.',
    exactLocation: 'Adjacent to BH-1 Common Room',
    campusBlock: 'BH-1 Courtyard',
    coordinates: { lat: 31.2436, lng: 75.7026 }, // Right next to BH-1 (31.2435, 75.7025)
    hasVerifiedCoordinates: true,
    nearbyHostels: ['BH-1', 'BH-2'],
    nearbyAcademicBlocks: ['Block 33'],
    mapLink: '',
    openingHours: '06:00 - 21:00',
    fees: 'Free',
    accessStatus: 'Hostel Residents Only',
    accessRules: ['BH-1/BH-2 residents only'],
    bookingProcess: 'Open play',
    availabilityStatus: 'Available',
    lastVerificationDate: '2026-10-15',
    officialSource: 'Hostel Sports Warden',
    isVerified: true,
    image: '',
    suitableForGroup: '6v6',
  };

  const pFar: Facility = {
    id: 'p-far',
    name: 'North Campus Athletics Grounds',
    sport: 'Athletics',
    supportedSports: ['Athletics'],
    facilityType: 'Open Playing Ground',
    classification: 'Outdoor',
    publishedQuantity: '1 Track',
    courtCount: 1,
    description: 'Far northern practice track.',
    equipmentInfo: 'Bring own gear.',
    exactLocation: 'Far North Perimeter',
    campusBlock: 'North Sector',
    coordinates: { lat: 31.2515, lng: 75.7045 }, // Over 900m away from BH-1
    hasVerifiedCoordinates: true,
    nearbyHostels: ['GH-5', 'GH-6'],
    nearbyAcademicBlocks: ['Block 38'],
    mapLink: '',
    openingHours: '06:00 - 19:00',
    fees: 'Free',
    accessStatus: 'Open Free Play',
    accessRules: ['Open entry'],
    bookingProcess: 'Walk-in',
    availabilityStatus: 'Available',
    lastVerificationDate: '2026-10-15',
    officialSource: 'DSW',
    isVerified: true,
    image: '',
    suitableForGroup: 'Joggers',
  };

  const sorted = filterAndSortPlaygrounds([pFar, pClose], { hostel: 'BH-1' });

  assert.equal(sorted.length, 2);
  assert.equal(sorted[0].id, 'p-close', 'Closer playground should be sorted first');
  assert.ok(sorted[0].proximity.isCalculated);
  assert.ok(sorted[0].proximity.distanceMeters! < sorted[1].proximity.distanceMeters!);
});
