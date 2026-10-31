export type CreatorStatus = 'To Contact' | 'DM Sent' | 'Loom Sent' | 'Zoom Booked' | 'Closed' | 'Rejected';

export type NicheCategory = 'Fitness' | 'Mindset' | 'Business' | 'SaaS' | 'Finance' | 'Lifestyle';

export type CoachCategory = 'Prospect' | 'Active Client' | 'Waiting List' | 'Case Study & Benchmark';

export interface Touchpoint {
  id: string;
  type: 'Message 1 (Hook)' | 'Follow-up 1' | 'Follow-up 2' | 'Loom Audit' | 'Zoom Call' | 'Contract Sent' | 'Custom Note';
  date: string;
  notes: string;
  link?: string;
}

export interface CreatorVault {
  // Credentials & Direct Contact
  igUsername?: string;
  igPassword?: string;
  coachPhone?: string; // WhatsApp / Phone number
  skoolCommunityUrl?: string;
  assetsDriveUrl?: string;
  cihBankRib?: string; // 24-digit Moroccan bank RIB

  // Brand Identity & Positioning (معلومات البراند والتوجه)
  brandName?: string; // e.g. "PeakPhysique Elite"
  brandAngle?: string; // التوجه ديال البراند (Target market, positioning, core angle)
  brandDescription?: string; // ديسكربشن البراند
  offerDetails?: string; // معلومات الأوفر (e.g. 1-on-1 vs Skool Community)

  // Brand Results & Performance Tracking (الريزولتس والنتائج)
  communitySubscribers?: number; // e.g. 20 paying members
  monthlyPricePerSub?: number; // e.g. 500 DH or $50
  currency?: 'DH' | '$' | '€'; // default 'DH'
  newMembersThisMonth?: number; // e.g. 6 new members
  resultsMilestones?: string; // e.g. "Scaled from 0 to 20 paying members in Month 1"

  // Partnership & Economics
  revenueSharePercent?: number; // e.g. 50%
  contractStatus?: 'Drafted' | 'Signed' | 'Pending' | 'N/A';
  vaultNotes?: string;
  lastUpdated?: string;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'X';
  profileUrl: string; // Auto-generated or custom
  videoUrl?: string; // Case study Reel, Loom video, or profile video link
  followers: number;
  engagementRate?: string; // e.g. "4.2%" or "High"
  niche: NicheCategory;
  coachCategory: CoachCategory; // Prospect vs Active Client vs Waiting List vs Benchmark
  status: CreatorStatus;
  notes: string; // Gap analysis / reasoning (e.g. why they can or cannot scale)
  lastContactDate: string;
  email?: string;
  estimatedMRR?: number; // Potential or actual monthly revenue (DH)
  actualMRR?: number; // Realized MRR if active client
  touchpoints: Touchpoint[]; // Sequence of messages and interactions sent
  isArchived?: boolean; // If creator has been archived
  archiveReason?: string; // Reason / Motive for archiving (e.g. Bad attitude, Not for now, Low ticket)
  archivedAt?: string; // Date archived
  vault?: CreatorVault; // Sensitive client assets and credentials

  // Operator Acquisition Fields (from sheet breakdown)
  subNiche?: string; // e.g. "Natty Transformation & Aesthetics", "Men's Fat Loss", "Calisthenics"
  bioFlaw?: string; // Current Bio Flaw (e.g. "No links, manual DM coaching only", "Raw WhatsApp link (wa.me)")
  loomHook?: string; // Loom Opening Hook / Cold DM Opener (e.g. "Salam Yassir, 7.8M views...", "Salam Mehdi...")
  source?: string; // Lead Source (e.g. "Instagram Explore", "TikTok", "Hashtag", "Referral", "1")
  score?: number; // Operator Potential Score out of 10 (1 to 10 rating for fit, monetization & audience quality)

  // Daily Outreach & Task Scheduling
  scheduledContactDate?: string; // YYYY-MM-DD for when to message/follow up
  lastTalkedDate?: string; // YYYY-MM-DD of last conversation
  talkedStatus?: 'Pending' | 'Sent - No Answer' | 'Answered Today' | 'Follow-up Due' | 'Call Booked';
  outreachNotes?: string; // Quick note on what was discussed or next move

  // Full AI Intelligence Dossier Document (Markdown format .md)
  dossierMarkdown?: string; // Deep audit, psychological hooks, Skool blueprint, DM scripts in Markdown
}

export type MeetingType = 'Discovery Zoom' | 'Pitch & Loom Review' | 'Closing Call (50/50)' | 'Client Strategy' | 'Other';

export interface CalendarMeeting {
  id: string;
  title: string;
  creatorId?: string;
  creatorName?: string;
  creatorHandle?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  meetingType: MeetingType;
  meetingLink?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  dmsSent: number;
  followUpsSent: number;
  repliesReceived: number;
  loomsRecorded: number;
  callsBooked: number;
  revenueGenerated: number; // DH / USD
  attributedCoachName?: string; // Which coach deal contributed to this revenue
}

export interface ScriptItem {
  id: string;
  title: string;
  category: 'Cold DM' | 'Follow-up' | 'Loom Pitch' | 'Objection Handling' | 'Closing';
  description: string;
  content: string;
  successRate?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: 'Logins & Accounts' | 'Brand Assets' | 'Useful Links' | 'Tools & Software';
  url: string;
  usernameOrEmail?: string;
  secretNote?: string;
  iconName: string;
}

export type NavTab = 'dashboard' | 'pipeline' | 'tasks' | 'calendar' | 'tracker' | 'scripts' | 'analytics' | 'vault';
