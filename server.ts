import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  LPU_FACILITIES,
  INITIAL_COMMUNITY_PLAYERS,
  INITIAL_TEAMS,
  INITIAL_TOURNAMENTS,
} from './src/data/lpuData.ts';
import {
  checkBookingConflict,
  validateLpuRegNo,
  validatePhoneNumber,
  advanceTournamentMatch,
} from './src/utils/bookingRules.ts';
import { CAMPUS_ANCHORS } from './src/utils/distanceUtils.ts';
import type { Booking, Facility, PlayerProfile, PushNotification, SportsTeam, Tournament } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.resolve('public')));

// In-memory data store with initial seed
let facilities: Facility[] = [...LPU_FACILITIES];
let players: PlayerProfile[] = [...INITIAL_COMMUNITY_PLAYERS];
let teams: SportsTeam[] = [...INITIAL_TEAMS];
let tournaments: Tournament[] = [...INITIAL_TOURNAMENTS];

// Seed initial demo bookings to demonstrate conflict detection right away
let bookings: Booking[] = [
  {
    id: 'demo-bk-101',
    facilityId: 'fac-badminton-indoor',
    facilityName: 'Shanti Devi Mittal Indoor Badminton Arena',
    sport: 'Badminton',
    courtNumber: 1,
    date: new Date().toISOString().split('T')[0],
    slotTime: '18:00 - 19:00',
    studentName: 'Aarav Sharma',
    studentRegNo: '12201948',
    schoolDepartment: 'School of Computer Science & Engineering',
    contactEmail: 'aarav.12201948@lpu.in',
    phoneNumber: '9876543210',
    equipmentRentalRequested: false,
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isDemoNoticeAcknowledged: true,
  },
  {
    id: 'demo-bk-102',
    facilityId: 'fac-squash-indoor',
    facilityName: 'Block 28 Glass-Back Squash Arena',
    sport: 'Squash',
    courtNumber: 2,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    slotTime: '17:00 - 18:00',
    studentName: 'Simran Kaur',
    studentRegNo: '12104599',
    schoolDepartment: 'Mittal School of Business',
    contactEmail: 'simran.12104599@lpu.in',
    phoneNumber: '9812345678',
    equipmentRentalRequested: true,
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isDemoNoticeAcknowledged: true,
  },
];

let notifications: PushNotification[] = [
  {
    id: 'notif-1',
    title: 'Inter-School Badminton Championship Live!',
    body: 'Semifinals match starting at Block 28 Arena. Check live brackets on KHELO LPU.',
    timestamp: '10 mins ago',
    type: 'match',
    read: false,
    link: '/tournaments',
  },
  {
    id: 'notif-2',
    title: 'Demo Slot Reminder',
    body: 'Your booked practice slot at Block 28 Arena starts at 18:00. Non-marking shoes required.',
    timestamp: '1 hour ago',
    type: 'booking',
    read: false,
    link: '/my-bookings',
  },
];

// Helper for Gemini AI client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==========================================
// 1. FACILITIES API
// ==========================================
app.get('/api/facilities', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: facilities,
    lastUpdated: new Date().toISOString(),
  });
});

app.get('/api/facilities/:id', (req: Request, res: Response) => {
  const facility = facilities.find((f) => f.id === req.params.id);
  if (!facility) {
    return res.status(404).json({ success: false, message: 'Facility not found' });
  }
  res.json({ success: true, data: facility });
});

// Return verified campus anchor points for hostels and academic blocks
app.get('/api/campus/anchors', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: CAMPUS_ANCHORS,
  });
});

// Admin create new facility/playground
app.post('/api/admin/facilities', (req: Request, res: Response) => {
  const role = req.headers['x-user-role'];
  if (role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Only verified LPU Sports Officers / Admins can register new facilities.',
    });
  }

  const { name, sport, classification, exactLocation, campusBlock, coordinates, nearbyHostels, nearbyAcademicBlocks, facilityType, accessStatus, accessRules, openingHours, fees } = req.body;
  if (!name || !sport) {
    return res.status(400).json({ success: false, message: 'Name and sport are required.' });
  }

  const newFacility: Facility = {
    id: `fac-${Date.now()}`,
    name: name.trim(),
    sport,
    supportedSports: req.body.supportedSports || [sport],
    facilityType: facilityType || 'Open Playing Ground',
    classification: classification || 'Outdoor',
    publishedQuantity: req.body.publishedQuantity || '1 Verified Unit',
    courtCount: Number(req.body.courtCount) || 1,
    description: req.body.description || 'Verified playground facility at Lovely Professional University.',
    equipmentInfo: req.body.equipmentInfo || 'Bring personal equipment or check with sports caretaker.',
    exactLocation: exactLocation || `${campusBlock || 'Central Campus'}, LPU`,
    campusBlock: campusBlock || 'Main Campus',
    coordinates: coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number' ? coordinates : undefined,
    hasVerifiedCoordinates: Boolean(coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number'),
    nearbyHostels: Array.isArray(nearbyHostels) ? nearbyHostels : [],
    nearbyAcademicBlocks: Array.isArray(nearbyAcademicBlocks) ? nearbyAcademicBlocks : [],
    mapLink: req.body.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' LPU')}`,
    openingHours: openingHours || '06:00 AM - 09:00 PM',
    fees: fees || 'Free for LPU students',
    accessStatus: accessStatus || 'Open Free Play',
    accessRules: Array.isArray(accessRules) ? accessRules : ['Valid LPU Student ID required'],
    bookingProcess: req.body.bookingProcess || 'Open walk-in or demo booking',
    availabilityStatus: req.body.availabilityStatus || 'Available',
    lastVerificationDate: new Date().toISOString().split('T')[0],
    officialSource: req.body.officialSource || 'LPU Sports Board Administration 2026',
    isVerified: true,
    image: req.body.image || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    suitableForGroup: req.body.suitableForGroup || 'Students & Teams',
  };

  facilities.unshift(newFacility);
  res.status(201).json({ success: true, data: newFacility, message: 'Playground registered successfully in verified campus directory.' });
});

// Admin update facility verification & status
app.post('/api/admin/facilities/:id', (req: Request, res: Response) => {
  const role = req.headers['x-user-role'];
  if (role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Only verified LPU Sports Officers / Admins can modify facility status.',
    });
  }

  const { id } = req.params;
  const idx = facilities.findIndex((f) => f.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Facility not found' });
  }

  const updatedCoords = req.body.coordinates;
  const hasCoords = updatedCoords && typeof updatedCoords.lat === 'number' && typeof updatedCoords.lng === 'number';

  facilities[idx] = {
    ...facilities[idx],
    ...req.body,
    coordinates: hasCoords ? updatedCoords : facilities[idx].coordinates,
    hasVerifiedCoordinates: hasCoords ? true : facilities[idx].hasVerifiedCoordinates,
    lastVerificationDate: new Date().toISOString().split('T')[0],
  };

  res.json({ success: true, data: facilities[idx], message: 'Facility status updated successfully.' });
});

// ==========================================
// 2. BOOKINGS API (With Conflict Checking)
// ==========================================
app.get('/api/bookings', (req: Request, res: Response) => {
  const { studentRegNo, facilityId, date } = req.query;
  let filtered = [...bookings];

  if (studentRegNo) {
    filtered = filtered.filter((b) => b.studentRegNo === String(studentRegNo));
  }
  if (facilityId) {
    filtered = filtered.filter((b) => b.facilityId === String(facilityId));
  }
  if (date) {
    filtered = filtered.filter((b) => b.date === String(date));
  }

  res.json({ success: true, data: filtered });
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const {
    facilityId,
    courtNumber,
    date,
    slotTime,
    studentName,
    studentRegNo,
    schoolDepartment,
    contactEmail,
    phoneNumber,
    equipmentRentalRequested,
  } = req.body;

  // Validation
  if (!facilityId || !courtNumber || !date || !slotTime || !studentName || !studentRegNo || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Missing mandatory booking fields including student phone number. Please complete all required information.',
    });
  }

  // LPU Registration number validation
  if (!validateLpuRegNo(studentRegNo)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid LPU Registration Number. Must be an 8-digit numeric student ID (e.g., 12201948).',
    });
  }

  // 10-digit Phone number validation
  if (!validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number. Please provide a valid 10-digit mobile number for booking confirmations.',
    });
  }

  const facility = facilities.find((f) => f.id === facilityId);
  if (!facility) {
    return res.status(404).json({ success: false, message: 'Requested facility does not exist.' });
  }

  // Conflict Checking against current active bookings
  const conflict = checkBookingConflict(bookings, {
    facilityId,
    courtNumber: Number(courtNumber),
    date,
    slotTime,
  });

  if (conflict.hasConflict) {
    return res.status(409).json({
      success: false,
      conflict: true,
      message: conflict.reason || 'This slot and court are already reserved.',
      suggestedAlternatives: [
        `Court ${(Number(courtNumber) % facility.courtCount) + 1}`,
        'Try the next slot or tomorrow',
      ],
    });
  }

  const newBooking: Booking = {
    id: `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    facilityId,
    facilityName: facility.name,
    sport: facility.sport,
    courtNumber: Number(courtNumber),
    date,
    slotTime,
    studentName: studentName.trim(),
    studentRegNo: studentRegNo.trim(),
    schoolDepartment: (schoolDepartment || 'General Student Body').trim(),
    contactEmail: (contactEmail || `${studentRegNo}@lpu.in`).trim(),
    phoneNumber: phoneNumber.trim(),
    equipmentRentalRequested: Boolean(equipmentRentalRequested),
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
    isDemoNoticeAcknowledged: true,
  };

  bookings.unshift(newBooking);

  // Push an in-app confirmation notification
  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: `Pass Confirmed: ${facility.sport}`,
    body: `Demo slot booked for Court ${courtNumber} on ${date} (${slotTime}).`,
    timestamp: 'Just now',
    type: 'booking',
    read: false,
    link: '/my-bookings',
  });

  res.status(201).json({
    success: true,
    data: newBooking,
    message: 'Booking confirmed successfully in KHELO LPU demonstration system.',
    disclaimer: 'Demonstration booking stored in local simulation. Not connected to LPU UMS/ERP system.',
  });
});

app.delete('/api/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  // Update status to Cancelled so slot is freed
  bookings[idx].status = 'Cancelled';

  res.json({
    success: true,
    message: 'Demo booking cancelled successfully. The slot is now available for other students.',
    data: bookings[idx],
  });
});

// ==========================================
// 3. COMMUNITY PLAYERS API
// ==========================================
app.get('/api/players', (req: Request, res: Response) => {
  const { sport, skill, time } = req.query;
  let filtered = [...players];

  if (sport && sport !== 'All') {
    filtered = filtered.filter((p) => p.sport.toLowerCase() === String(sport).toLowerCase());
  }
  if (skill && skill !== 'All') {
    filtered = filtered.filter((p) => p.skillLevel.toLowerCase() === String(skill).toLowerCase());
  }
  if (time && time !== 'All') {
    filtered = filtered.filter((p) => p.preferredTime.toLowerCase().includes(String(time).toLowerCase()));
  }

  res.json({ success: true, data: filtered });
});

app.post('/api/players', (req: Request, res: Response) => {
  const { name, regNo, school, sport, skillLevel, preferredTime, groupSizePreferred, bio, lookingFor, availabilityDays } = req.body;

  if (!name || !regNo || !sport) {
    return res.status(400).json({ success: false, message: 'Name, registration number, and sport are required.' });
  }

  const masked = regNo.length >= 4 ? `${regNo.slice(0, 4)}****` : 'Student****';

  const newPlayer: PlayerProfile = {
    id: `player-${Date.now()}`,
    name: name.trim(),
    regNoMasked: masked,
    school: school || 'Lovely Professional University',
    sport,
    skillLevel: skillLevel || 'Intermediate',
    preferredTime: preferredTime || 'Evening (5-8 PM)',
    groupSizePreferred: groupSizePreferred || 'Doubles (2v2)',
    bio: bio || 'LPU student looking for sports matches and fitness buddies.',
    lookingFor: lookingFor || 'Practice partner',
    availabilityDays: Array.isArray(availabilityDays) && availabilityDays.length > 0 ? availabilityDays : ['All Days'],
    isSampleProfile: false,
    createdAt: new Date().toISOString(),
  };

  players.unshift(newPlayer);
  res.status(201).json({ success: true, data: newPlayer, message: 'Player profile listed successfully on community board.' });
});

// ==========================================
// 4. TEAMS & TOURNAMENTS API
// ==========================================
app.get('/api/teams', (req: Request, res: Response) => {
  res.json({ success: true, data: teams });
});

app.post('/api/teams', (req: Request, res: Response) => {
  const { name, sport, schoolDepartment, captainName, captainRegNo, captainPhone, jerseyColor, motto } = req.body;

  if (!name || !sport || !captainName || !captainRegNo || !captainPhone) {
    return res.status(400).json({ success: false, message: 'Team name, sport, captain info, and captain phone number are required.' });
  }

  if (!validateLpuRegNo(captainRegNo)) {
    return res.status(400).json({ success: false, message: 'Captain registration must be a valid 8-digit LPU ID.' });
  }

  if (!validatePhoneNumber(captainPhone)) {
    return res.status(400).json({ success: false, message: 'Invalid captain phone number. Please enter a 10-digit mobile number.' });
  }

  const newTeam: SportsTeam = {
    id: `team-${Date.now()}`,
    name: name.trim(),
    sport,
    schoolDepartment: schoolDepartment || 'LPU Department Team',
    captainName: captainName.trim(),
    captainRegNo: captainRegNo.trim(),
    captainPhone: captainPhone.trim(),
    jerseyColor: jerseyColor || '#CCFF00',
    maxRosterSize: 12,
    members: [
      {
        name: captainName.trim(),
        regNo: captainRegNo.trim(),
        role: 'Captain',
        position: 'Captain',
      },
    ],
    openForFriendlyMatches: true,
    motto: motto || 'Play with passion, represent LPU',
    createdAt: new Date().toISOString(),
  };

  teams.unshift(newTeam);
  res.status(201).json({ success: true, data: newTeam, message: 'Sports team created successfully.' });
});

app.post('/api/teams/:id/join', (req: Request, res: Response) => {
  const { id } = req.params;
  const { memberName, memberRegNo, role, position } = req.body;

  const team = teams.find((t) => t.id === id);
  if (!team) {
    return res.status(404).json({ success: false, message: 'Team not found.' });
  }

  if (!validateLpuRegNo(memberRegNo)) {
    return res.status(400).json({ success: false, message: 'Invalid 8-digit student registration number.' });
  }

  const alreadyJoined = team.members.some((m) => m.regNo === memberRegNo);
  if (alreadyJoined) {
    return res.status(400).json({ success: false, message: 'Student is already on this team roster.' });
  }

  team.members.push({
    name: memberName || 'Student Athlete',
    regNo: memberRegNo,
    role: role || 'Player',
    position: position || 'Squad Member',
  });

  res.json({ success: true, data: team, message: `Added ${memberName} to ${team.name} roster.` });
});

app.get('/api/tournaments', (req: Request, res: Response) => {
  res.json({ success: true, data: tournaments });
});

app.post('/api/tournaments/:id/matches/:matchId/score', (req: Request, res: Response) => {
  const role = req.headers['x-user-role'];
  if (role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only LPU Sports tournament referees / admins can update scores.' });
  }

  const { id, matchId } = req.params;
  const { winnerTeamId, team1Score, team2Score } = req.body;

  const tIdx = tournaments.findIndex((t) => t.id === id);
  if (tIdx === -1) {
    return res.status(404).json({ success: false, message: 'Tournament not found.' });
  }

  const updatedTournament = advanceTournamentMatch(tournaments[tIdx], matchId, winnerTeamId, {
    team1Score: team1Score || '0',
    team2Score: team2Score || '0',
  });

  tournaments[tIdx] = updatedTournament;

  // Broadcast tournament notification
  notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Match Bracket Update',
    body: `Match scores updated in ${tournaments[tIdx].title}. Live brackets refreshed.`,
    timestamp: 'Just now',
    type: 'match',
    read: false,
    link: '/tournaments',
  });

  res.json({ success: true, data: updatedTournament, message: 'Match score and bracket progression updated.' });
});

// ==========================================
// 5. NOTIFICATIONS API
// ==========================================
app.get('/api/notifications', (req: Request, res: Response) => {
  res.json({ success: true, data: notifications });
});

app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  res.json({ success: true, message: 'All notifications marked as read.' });
});

// ==========================================
// 6. AI ASSISTANT API (Server-side Gemini 3.8 Flash + Domain Fallback)
// ==========================================
app.post('/api/ai/query', async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, message: 'Please provide a valid sports query.' });
  }

  const cleanQuery = query.trim();

  // Grounding knowledge context assembled from verified LPU facilities with nearby hostels & blocks
  const facilitiesSummary = facilities
    .map(
      (f) =>
        `- ${f.name} (${f.sport}, ${f.facilityType}, ${f.classification}): Located at ${f.exactLocation} (${f.campusBlock}). Coordinates verified: ${f.hasVerifiedCoordinates ? 'Yes' : 'No'}. Nearby Hostels: ${f.nearbyHostels.join(', ') || 'None specified'}. Nearby Academic Blocks: ${f.nearbyAcademicBlocks.join(', ') || 'None specified'}. Access Status: ${f.accessStatus}. Hours: ${f.openingHours}. Fees: ${f.fees}. Mandatory Rules: ${f.accessRules.join(
          '; '
        )}. Equipment: ${f.equipmentInfo}. Availability status: ${f.availabilityStatus}. Last verified: ${f.lastVerificationDate}. Official Source: ${f.officialSource}.`
    )
    .join('\n');

  const systemInstruction = `You are "KHELO LPU Sports AI Assistant", an official athletic concierge designed exclusively for Lovely Professional University (LPU) students.
Your mission is to help students discover playgrounds and sports facilities near their hostels (e.g. BH-1 to BH-8, GH-1 to GH-6) and academic blocks (e.g. Block 13, Block 28-30, Block 33, Block 34, Block 36, Block 38, Block 55, Unipolis), understand which facilities they can use, and find convenient places to play now.

STRICT CONSTRAINTS & ACCURACY RULES:
1. Ground your answers strictly on the verified LPU sports facilities and playgrounds provided below.
2. If a student asks "Where can I play football near my hostel?" or "Which basketball court is nearest to my block?" or "Find an outdoor ground near my residence", identify the exact facility matching their nearby hostel/residence or academic block from the verified database (e.g. for BH-1/BH-2: BH-1 & BH-2 Outdoor Volleyball & Activity Court, Block 33 Open Playing Lawn; for BH-4: BH-4 Residence Floodlit Basketball Court, Unipolis 7v7 Turf; for GH: North Girls Residence Court).
3. If specific coordinates or distances cannot be calculated or are unverified, explicitly state: "This specific location's exact walking coordinates are pending verification by the LPU Sports Board." NEVER invent walking distances, coordinates, or unverified hours.
4. Never claim that you make real bookings on LPU's actual UMS/ERP system.
5. Keep your tone energizing, student-friendly, and concise.

VERIFIED LPU SPORTS FACILITIES DATABASE:
${facilitiesSummary}
`;

  const ai = getGeminiClient();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: cleanQuery,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const reply = response.text || 'I could not generate an answer right now. Please try again.';

      // Extract relevant facilities for direct UI quick cards
      const lowerQ = cleanQuery.toLowerCase();
      const matchedFacilities = facilities.filter(
        (f) =>
          lowerQ.includes(f.sport.toLowerCase()) ||
          lowerQ.includes(f.name.toLowerCase()) ||
          lowerQ.includes(f.campusBlock.toLowerCase()) ||
          f.nearbyHostels.some((h) => lowerQ.includes(h.toLowerCase())) ||
          f.nearbyAcademicBlocks.some((b) => lowerQ.includes(b.toLowerCase()))
      );

      return res.json({
        success: true,
        reply,
        source: 'gemini-3.8-flash',
        matchedFacilities: matchedFacilities.slice(0, 3),
      });
    } catch (err: unknown) {
      console.warn('Gemini API call failed or rate-limited; falling back to LPU local knowledge engine:', err);
    }
  }

  // SMART LOCAL DOMAIN FALLBACK (Runs when GEMINI_API_KEY is not set or network fails)
  const lowerQuery = cleanQuery.toLowerCase();
  let matched = facilities.filter((f) => {
    const s = f.sport.toLowerCase();
    const n = f.name.toLowerCase();
    const b = f.campusBlock.toLowerCase();
    const matchHostel = f.nearbyHostels.some((h) => lowerQuery.includes(h.toLowerCase()));
    const matchBlock = f.nearbyAcademicBlocks.some((ab) => lowerQuery.includes(ab.toLowerCase()));
    return lowerQuery.includes(s) || lowerQuery.includes(n) || lowerQuery.includes(b) || matchHostel || matchBlock;
  });

  if (matched.length === 0) {
    if (lowerQuery.includes('hostel') || lowerQuery.includes('residence') || lowerQuery.includes('near')) {
      // Return hostel recreational courts and open lawns
      matched = facilities.filter((f) => f.facilityType === 'Hostel Recreational Court' || f.facilityType === 'Open Playing Ground');
    } else if (lowerQuery.includes('shuttle') || lowerQuery.includes('racket') || lowerQuery.includes('badminton')) {
      matched = facilities.filter((f) => f.sport === 'Badminton');
    } else if (lowerQuery.includes('basketball') || lowerQuery.includes('hoop')) {
      matched = facilities.filter((f) => f.sport === 'Basketball');
    } else if (lowerQuery.includes('swim') || lowerQuery.includes('pool')) {
      matched = facilities.filter((f) => f.sport === 'Swimming');
    } else if (lowerQuery.includes('football') || lowerQuery.includes('soccer') || lowerQuery.includes('turf')) {
      matched = facilities.filter((f) => f.sport === 'Football');
    } else {
      matched = facilities.slice(0, 3);
    }
  }

  const primary = matched[0];
  let reply = '';

  if (lowerQuery.includes('hostel') || lowerQuery.includes('residence')) {
    reply = `For playgrounds right near student hostels:\n\n• **Boys Hostels 1, 2, 3:** Check out the **BH-1 & BH-2 Outdoor Activity Court** (volleyball & open play) and the **Block 33 Tech Quadrangle Open Lawn** for frisbee and football.\n• **Boys Hostels 3, 4, 5:** Head to the **BH-4 Floodlit Basketball Court** or the **Unipolis 7v7 Artificial Turf Arena**.\n• **Girls Hostels 1-4:** Use the **North Girls Residence Badminton & Open Fitness Court** (inside GH-1 quadrangle).\n• **Boys Hostels 5, 6, 7:** Play at the **East Sector Cricket Oval & Practice Nets** or the East Multi-Purpose Ground.`;
  } else if (lowerQuery.includes('badminton')) {
    reply = `You can play badminton at the **Shanti Devi Mittal Indoor Sports Complex (Block 28)** (8 synthetic courts, open 6 AM - 9 PM, free with student RFID). Also, outdoor courts are located at the **North Girls Residence Quadrangle** for residents.\n\n⚠️ **Mandatory Rule:** Clean non-marking badminton shoes (gum rubber soles) are strictly mandatory inside Block 28 arena.`;
  } else if (lowerQuery.includes('basketball')) {
    reply = `For basketball:\n• **Near Hostels:** The **BH-4 Floodlit Basketball Court** is open walk-in for pickup runs until 10 PM.\n• **Indoor Arena:** **Block 29 Shanti Devi Mittal Arena** features 2 FIBA maplewood championship courts and 4 outdoor floodlit courts near Unipolis.`;
  } else if (lowerQuery.includes('football') || lowerQuery.includes('soccer') || lowerQuery.includes('turf')) {
    reply = `Football spaces at LPU:\n• **Unipolis 7v7 Artificial Turf Arena:** Located directly behind Unipolis, 2-3 minutes walk from BH-3 and BH-4. Open 6 AM - 10 PM under floodlights.\n• **Baldev Raj Mittal Stadium:** Full FIFA natural grass pitch surrounded by the 400m synthetic running track.\n• **Block 33 Quadrangle:** Open grass lawn for casual kickabouts between classes.`;
  } else {
    reply = `At Lovely Professional University, we offer extensive playgrounds and sports facilities close to hostels and academic blocks. For ${primary.sport}, the nearest facility is **${primary.name}** located at **${primary.exactLocation}** (${primary.campusBlock}). It is close to: ${primary.nearbyHostels.join(', ') || 'Campus Centers'}.\n\nAccess Status: **${primary.accessStatus}** • Hours: **${primary.openingHours}**. Entry is free for students with their valid LPU ID card.`;
  }

  reply += `\n\n*(Note: Facility details verified with LPU Sports Board & DSW Records. Demo booking provides simulated pass reservation).*`;

  return res.json({
    success: true,
    reply,
    source: 'local-knowledge-engine',
    matchedFacilities: matched.slice(0, 3),
  });
});

// ==========================================
// 7. VITE DEV / PRODUCTION STATIC HOSTING
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KHELO LPU server running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start KHELO LPU server:', err);
  process.exit(1);
});
