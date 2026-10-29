import { Creator, DailyLog, ScriptItem, ResourceItem } from '../types';

// Clean slate as requested: all dummy content, creators, numbers zeroed out
export const initialCreators: Creator[] = [];

export const initialDailyLogs: DailyLog[] = [];

export const initialScripts: ScriptItem[] = [
  {
    id: 's_default_1',
    title: 'The Direct Value Hook (Cold DM)',
    category: 'Cold DM',
    description: 'Outbound pitch for high-ticket coaching programs and creator communities.',
    content: `Hey [First Name]! Huge fan of your recent breakdown on [Topic].\n\nQuick question—are you currently running paid VSL funnels to monetize your audience on [Instagram/YouTube], or are you strictly relying on manual DMs right now?\n\nWe build and manage automated backend funnels for creators on a 50/50 revenue share. Would love to send over a 2-minute breakdown if you're open to it? No pitch attached.`,
    successRate: '34% Reply',
  },
  {
    id: 's_default_2',
    title: 'Objection: "We already have an in-house team"',
    category: 'Objection Handling',
    description: 'How to pivot when they claim they already have a team.',
    content: `Totally respect that [First Name]! Having a solid team is everything in this game.\n\nCurious—are they handling your community monetisation (Skool/funnel), or strictly organic content editing?\n\nReason I ask is we strictly operate as a growth partner on a 50/50 rev-share model for backend recurring revenue. Worth a 10-min chat to compare notes?`,
    successRate: '28% Recovery',
  }
];

export const initialResources: ResourceItem[] = [];
