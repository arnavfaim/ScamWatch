
export type ReportStatus = 'pending' | 'approved' | 'rejected';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface ScamReport {
  id: string;
  title: string;
  scammerName?: string;
  scammerHandle?: string;
  scammerContact?: string;
  whatsappNumber?: string; // New field
  reporterEmail?: string;  // New field
  platform: string;
  category: string;
  description: string;
  proofUrls: string[];
  status: ReportStatus;
  riskLevel: RiskLevel;
  upvotes: number;
  flags: number;
  reporterId: string;
  createdAt: number;
  comments: Comment[];
  aiSummary?: string;
}

export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  reputation: number;
  isLoggedIn: boolean;
  lastVerifiedAt?: number;
  whatsapp?: string;    // New field
  password?: string;    // Conceptual for demo
}
