export type SportType =
  | 'Badminton'
  | 'Basketball'
  | 'Football'
  | 'Cricket'
  | 'Swimming'
  | 'Gymnasium'
  | 'Athletics'
  | 'Volleyball'
  | 'Squash'
  | 'Tennis'
  | 'Table Tennis'
  | 'Martial Arts'
  | 'Open Play & General Sports'
  | 'All';

export type FacilityType =
  | 'Open Playing Ground'
  | 'Outdoor Court'
  | 'Indoor Arena'
  | 'Championship Stadium'
  | 'Hostel Recreational Court'
  | 'Practice Turf & Nets'
  | 'Aquatic Centre'
  | 'Fitness Center'
  | 'All';

export type AccessStatus =
  | 'Open Free Play'
  | 'Demo Reservation Required'
  | 'Hostel Residents Only'
  | 'Coached & Team Sessions'
  | 'All';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Facility {
  id: string;
  name: string;
  sport: SportType;
  supportedSports: SportType[];
  facilityType: FacilityType;
  classification: 'Indoor' | 'Outdoor';
  publishedQuantity: string;
  courtCount: number;
  description: string;
  equipmentInfo: string;
  exactLocation: string;
  campusBlock: string;
  coordinates?: Coordinates;
  hasVerifiedCoordinates: boolean;
  nearbyHostels: string[];
  nearbyAcademicBlocks: string[];
  mapLink: string;
  openingHours: string;
  fees: string;
  accessStatus: AccessStatus;
  accessRules: string[];
  bookingProcess: string;
  availabilityStatus: 'Available' | 'Limited Slots' | 'Maintenance' | 'Events Only';
  lastVerificationDate: string;
  officialSource: string;
  isVerified: boolean;
  image: string;
  gallery?: string[];
  suitableForGroup: string;
}

export interface CampusAnchor {
  id: string;
  name: string;
  category: 'hostel' | 'block' | 'gate';
  coordinates: Coordinates;
  description: string;
}

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  sport: string;
  courtNumber: number;
  date: string; // YYYY-MM-DD
  slotTime: string; // e.g. "18:00 - 19:00"
  studentName: string;
  studentRegNo: string;
  schoolDepartment: string;
  contactEmail: string;
  phoneNumber: string;
  equipmentRentalRequested: boolean;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  createdAt: string;
  isDemoNoticeAcknowledged: boolean;
}

export interface PlayerProfile {
  id: string;
  name: string;
  regNoMasked: string;
  school: string;
  sport: SportType;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Varsity Athlete';
  preferredTime: 'Early Morning (6-9 AM)' | 'Afternoon (2-5 PM)' | 'Evening (5-8 PM)' | 'Late Evening (8-10 PM)' | 'Weekends';
  groupSizePreferred: 'Singles (1v1)' | 'Doubles (2v2)' | 'Team (Full Squad)' | 'Casual Practice';
  bio: string;
  lookingFor: string;
  availabilityDays: string[];
  isSampleProfile: boolean;
  createdAt: string;
  hostelResidence?: string;
}

export interface TeamMember {
  name: string;
  regNo: string;
  role: 'Captain' | 'Vice-Captain' | 'Player' | 'Substitute';
  position?: string;
}

export interface SportsTeam {
  id: string;
  name: string;
  sport: SportType;
  schoolDepartment: string;
  captainName: string;
  captainRegNo: string;
  captainPhone: string;
  jerseyColor: string;
  maxRosterSize: number;
  members: TeamMember[];
  openForFriendlyMatches: boolean;
  motto: string;
  createdAt: string;
}

export interface TournamentMatch {
  id: string;
  round: 'Quarterfinals' | 'Semifinals' | 'Finals';
  matchNumber: number;
  team1: { id: string; name: string; score?: string; isWinner?: boolean };
  team2: { id: string; name: string; score?: string; isWinner?: boolean };
  status: 'Scheduled' | 'Live' | 'Completed';
  venue: string;
  scheduledTime: string;
  nextMatchId?: string;
}

export interface Tournament {
  id: string;
  title: string;
  sport: SportType;
  category: 'Inter-School' | 'Hostel Premier League' | 'Open University Cup';
  startDate: string;
  endDate: string;
  status: 'Registration Open' | 'In Progress' | 'Finished';
  venue: string;
  prizePool: string;
  matches: TournamentMatch[];
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'booking' | 'match' | 'team' | 'announcement';
  read: boolean;
  link?: string;
}

export interface StudentUser {
  id: string;
  name: string;
  regNo: string;
  school: string;
  role: 'student' | 'admin';
  email: string;
  selectedHostel?: string;
  selectedBlock?: string;
}
