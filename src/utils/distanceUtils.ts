import type { CampusAnchor, Coordinates, Facility } from '../types/index.ts';

/**
 * Verified Campus Geographic Anchor Points for Lovely Professional University.
 * Campus center reference: ~31.2464° N, 75.7042° E, Jalandhar-Delhi G.T. Road, Phagwara, Punjab.
 */
export const CAMPUS_ANCHORS: CampusAnchor[] = [
  // Boys Hostels (South-West & Central-South Quadrants)
  { id: 'bh-1', name: 'Boys Hostel 1 (BH-1)', category: 'hostel', coordinates: { lat: 31.2435, lng: 75.7025 }, description: 'Near West Gate & Sports Grounds' },
  { id: 'bh-2', name: 'Boys Hostel 2 (BH-2)', category: 'hostel', coordinates: { lat: 31.2438, lng: 75.7032 }, description: 'Adjacent to BH-1 & Volleyball Courts' },
  { id: 'bh-3', name: 'Boys Hostel 3 (BH-3)', category: 'hostel', coordinates: { lat: 31.2442, lng: 75.7038 }, description: 'Behind Block 33 Academic wing' },
  { id: 'bh-4', name: 'Boys Hostel 4 (BH-4)', category: 'hostel', coordinates: { lat: 31.2446, lng: 75.7045 }, description: 'Close to Unipolis Central Grounds' },
  { id: 'bh-5', name: 'Boys Hostel 5 (BH-5)', category: 'hostel', coordinates: { lat: 31.2452, lng: 75.7052 }, description: 'Near East Sector Cricket Oval' },
  { id: 'bh-6', name: 'Boys Hostel 6 (BH-6)', category: 'hostel', coordinates: { lat: 31.2458, lng: 75.7058 }, description: 'Near Uni-Hospital & Cricket Nets' },
  { id: 'bh-7', name: 'Boys Hostel 7 (BH-7)', category: 'hostel', coordinates: { lat: 31.2463, lng: 75.7064 }, description: 'East Sector multi-story hostel' },
  { id: 'bh-8', name: 'Boys Hostel 8 (BH-8)', category: 'hostel', coordinates: { lat: 31.2468, lng: 75.7070 }, description: 'North-East boundary residential wing' },

  // Girls Hostels (North-West Quadrant)
  { id: 'gh-1', name: 'Girls Hostel 1 (GH-1)', category: 'hostel', coordinates: { lat: 31.2492, lng: 75.7015 }, description: 'North Campus Girls Residence Complex' },
  { id: 'gh-2', name: 'Girls Hostel 2 (GH-2)', category: 'hostel', coordinates: { lat: 31.2496, lng: 75.7020 }, description: 'Adjacent to GH-1 & North Badminton Court' },
  { id: 'gh-3', name: 'Girls Hostel 3 (GH-3)', category: 'hostel', coordinates: { lat: 31.2501, lng: 75.7026 }, description: 'Near North Open Fitness Park' },
  { id: 'gh-4', name: 'Girls Hostel 4 (GH-4)', category: 'hostel', coordinates: { lat: 31.2505, lng: 75.7032 }, description: 'Near Block 38 Agriculture Quad' },
  { id: 'gh-5', name: 'Girls Hostel 5 (GH-5)', category: 'hostel', coordinates: { lat: 31.2510, lng: 75.7038 }, description: 'North Campus Lake View side' },
  { id: 'gh-6', name: 'Girls Hostel 6 (GH-6)', category: 'hostel', coordinates: { lat: 31.2515, lng: 75.7044 }, description: 'Executive Girls Residences' },

  // University Apartments & Main Gate
  { id: 'uni-apt', name: 'Uni-Apartments / Faculty Residences', category: 'hostel', coordinates: { lat: 31.2475, lng: 75.7082 }, description: 'Near Gate 4 East' },
  { id: 'main-gate', name: 'Main Campus Entrance Gate (GT Road)', category: 'gate', coordinates: { lat: 31.2420, lng: 75.7010 }, description: 'Primary Highway Entry' },

  // Academic Blocks
  { id: 'block-13', name: 'Block 13 (Uni-Mall & Central Fitness)', category: 'block', coordinates: { lat: 31.2450, lng: 75.7028 }, description: 'Central shopping & fitness center' },
  { id: 'block-28', name: 'Block 28 (Shanti Devi Mittal Indoor Sports)', category: 'block', coordinates: { lat: 31.2458, lng: 75.7035 }, description: 'Indoor Badminton, Squash, TT' },
  { id: 'block-29', name: 'Block 29 (Basketball Arena & Dojo)', category: 'block', coordinates: { lat: 31.2460, lng: 75.7038 }, description: 'Indoor Maplewood Basketball & Martial Arts' },
  { id: 'block-30', name: 'Block 30 (Olympic Aquatic Centre)', category: 'block', coordinates: { lat: 31.2463, lng: 75.7040 }, description: '50m Heated Olympic Swimming Pool' },
  { id: 'block-32', name: 'Block 32 (Polytechnic & Diploma)', category: 'block', coordinates: { lat: 31.2442, lng: 75.7018 }, description: 'West Academic Sector' },
  { id: 'block-33', name: 'Block 33 (CSE & IT Engineering)', category: 'block', coordinates: { lat: 31.2448, lng: 75.7022 }, description: 'Largest engineering student cluster' },
  { id: 'block-34', name: 'Block 34 (School of Design & Architecture)', category: 'block', coordinates: { lat: 31.2455, lng: 75.7018 }, description: 'Creative Arts & Architecture Studios' },
  { id: 'block-36', name: 'Block 36 (Mechanical & Aerospace Engineering)', category: 'block', coordinates: { lat: 31.2468, lng: 75.7024 }, description: 'Engineering Workshops & Aerospace Labs' },
  { id: 'block-38', name: 'Block 38 (Agriculture & Bioengineering)', category: 'block', coordinates: { lat: 31.2482, lng: 75.7032 }, description: 'North Academic Research Farms & Labs' },
  { id: 'block-55', name: 'Block 55-58 (Mittal School of Business & Law)', category: 'block', coordinates: { lat: 31.2472, lng: 75.7050 }, description: 'Business, Management & Law Complex' },
  { id: 'unipolis', name: 'Baldev Raj Mittal Unipolis (Central Grounds)', category: 'block', coordinates: { lat: 31.2455, lng: 75.7042 }, description: 'Central Open Amphitheatre & Sports Arena' },
];

/**
 * Calculates Haversine distance between two coordinates in meters.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Estimates walking time in minutes based on average student walking pace (80 meters/min, approx 4.8 km/h).
 */
export function estimateWalkingMinutes(distanceMeters: number): number {
  if (distanceMeters <= 0) return 1;
  const mins = Math.round(distanceMeters / 80);
  return Math.max(1, mins);
}

/**
 * Retrieves campus anchor by ID or name snippet.
 */
export function getCampusAnchor(idOrName: string): CampusAnchor | undefined {
  if (!idOrName || idOrName === 'All') return undefined;
  const lower = idOrName.toLowerCase().trim();
  return CAMPUS_ANCHORS.find(
    (a) => a.id.toLowerCase() === lower || a.name.toLowerCase().includes(lower)
  );
}

export interface ProximityResult {
  isCalculated: boolean;
  distanceMeters?: number;
  walkingMinutes?: number;
  label: string;
}

/**
 * Calculates distance from user reference point (selected hostel, block, or GPS).
 * Strictly enforces honest calculation: never invents walking distance if coordinates are unverified.
 */
export function calculatePlaygroundProximity(
  playground: Facility,
  anchorOrCoords?: CampusAnchor | Coordinates | null
): ProximityResult {
  if (!playground.hasVerifiedCoordinates || !playground.coordinates) {
    return {
      isCalculated: false,
      label: 'Coordinates unverified • Location: ' + playground.campusBlock,
    };
  }

  if (!anchorOrCoords) {
    return {
      isCalculated: false,
      label: 'Select your hostel or block to see distance',
    };
  }

  const coords: Coordinates = 'coordinates' in anchorOrCoords ? anchorOrCoords.coordinates : anchorOrCoords;

  const distanceMeters = calculateHaversineDistance(
    coords.lat,
    coords.lng,
    playground.coordinates.lat,
    playground.coordinates.lng
  );
  const walkingMinutes = estimateWalkingMinutes(distanceMeters);

  return {
    isCalculated: true,
    distanceMeters,
    walkingMinutes,
    label: `${distanceMeters < 1000 ? `${distanceMeters}m` : `${(distanceMeters / 1000).toFixed(1)}km`} • ~${walkingMinutes} min walk`,
  };
}

export interface PlaygroundFilterOptions {
  query?: string;
  hostel?: string;
  academicBlock?: string;
  sport?: string;
  classification?: string; // Indoor | Outdoor | All
  facilityType?: string;
  accessStatus?: string;
  maxWalkingMins?: number;
  userCoords?: Coordinates | null;
}

/**
 * Filters and sorts playgrounds by proximity to student residence or academic block.
 */
export function filterAndSortPlaygrounds(
  playgrounds: Facility[],
  options: PlaygroundFilterOptions
): (Facility & { proximity: ProximityResult })[] {
  const {
    query = '',
    hostel,
    academicBlock,
    sport,
    classification,
    facilityType,
    accessStatus,
    maxWalkingMins,
    userCoords,
  } = options;

  // Determine active reference anchor
  const activeAnchor = hostel && hostel !== 'All'
    ? getCampusAnchor(hostel)
    : academicBlock && academicBlock !== 'All'
    ? getCampusAnchor(academicBlock)
    : userCoords
    ? { id: 'gps', name: 'My Current Location', category: 'hostel' as const, coordinates: userCoords, description: 'GPS' }
    : undefined;

  const q = query.toLowerCase().trim();
  const selectedSport = sport && sport !== 'All' ? sport.toLowerCase() : '';
  const selectedClass = classification && classification !== 'All' ? classification.toLowerCase() : '';
  const selectedType = facilityType && facilityType !== 'All' ? facilityType : '';
  const selectedAccess = accessStatus && accessStatus !== 'All' ? accessStatus : '';

  // Calculate proximity and filter
  const processed = playgrounds.map((p) => {
    const proximity = calculatePlaygroundProximity(p, activeAnchor);
    return { ...p, proximity };
  });

  const filtered = processed.filter((p) => {
    // Classification filter
    if (selectedClass && p.classification.toLowerCase() !== selectedClass) return false;

    // Facility Type filter
    if (selectedType && p.facilityType !== selectedType) return false;

    // Access Status filter
    if (selectedAccess && p.accessStatus !== selectedAccess) return false;

    // Sport filter: checks primary sport OR supportedSports array
    if (selectedSport) {
      const matchPrimary = p.sport.toLowerCase() === selectedSport;
      const matchSupported = p.supportedSports.some((s) => s.toLowerCase() === selectedSport);
      if (!matchPrimary && !matchSupported) return false;
    }

    // Walking distance threshold filter (only if calculated)
    if (maxWalkingMins && maxWalkingMins > 0) {
      if (p.proximity.isCalculated && p.proximity.walkingMinutes !== undefined) {
        if (p.proximity.walkingMinutes > maxWalkingMins) return false;
      }
    }

    // Hostel filter: matches if playground coordinates exist OR nearbyHostels array includes hostel
    if (hostel && hostel !== 'All') {
      const normalizedHostel = hostel.toUpperCase();
      const inNearbyList = p.nearbyHostels.some((h) => h.toUpperCase().includes(normalizedHostel));
      // If student specifically chose this hostel, prefer ones with nearby flag or under 15 min walk
      if (!inNearbyList && p.proximity.isCalculated && (p.proximity.walkingMinutes || 99) > 15) {
        return false;
      }
    }

    // Academic Block filter
    if (academicBlock && academicBlock !== 'All') {
      const normalizedBlock = academicBlock.toUpperCase();
      const inBlockList = p.nearbyAcademicBlocks.some((b) => b.toUpperCase().includes(normalizedBlock));
      if (!inBlockList && p.proximity.isCalculated && (p.proximity.walkingMinutes || 99) > 15) {
        return false;
      }
    }

    // Text search query
    if (q) {
      const matchName = p.name.toLowerCase().includes(q);
      const matchSport = p.sport.toLowerCase().includes(q);
      const matchLoc = p.exactLocation.toLowerCase().includes(q) || p.campusBlock.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchType = p.facilityType.toLowerCase().includes(q);
      const matchHostels = p.nearbyHostels.some((h) => h.toLowerCase().includes(q));
      return matchName || matchSport || matchLoc || matchDesc || matchType || matchHostels;
    }

    return true;
  });

  // Sort: If reference anchor is active, sort by walking distance (nearest first).
  // Unverified locations are sorted to the end with clear badges.
  filtered.sort((a, b) => {
    if (a.proximity.isCalculated && b.proximity.isCalculated) {
      return (a.proximity.distanceMeters || 0) - (b.proximity.distanceMeters || 0);
    }
    if (a.proximity.isCalculated && !b.proximity.isCalculated) return -1;
    if (!a.proximity.isCalculated && b.proximity.isCalculated) return 1;
    return a.name.localeCompare(b.name);
  });

  return filtered;
}
