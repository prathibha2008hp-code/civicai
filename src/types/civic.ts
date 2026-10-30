/**
 * CivicAI - Core Data Models and Type Definitions
 * Prepared for Supabase PostgreSQL schema mapping and Row Level Security (RLS)
 */

export type UserRole = 'citizen' | 'official' | 'supervisor' | 'admin';

export type LanguageCode = 'en' | 'kn' | 'hi';

export type ComplaintCategory =
  | 'Road & Infrastructure'
  | 'Water Supply & Sewage'
  | 'Solid Waste Management'
  | 'Electricity & Street Lighting'
  | 'Flooding & Storm Drain'
  | 'Public Hazards & Safety'
  | 'Parks & Urban Forestry'
  | 'Public Health & Sanitation';

export type ComplaintSeverity = 'Low' | 'Medium' | 'High' | 'Emergency';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Reopened'
  | 'Rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  ward?: string;
  preferredLanguage: LanguageCode;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headName: string;
  contactEmail: string;
  contactPhone: string;
  activeComplaints: number;
  resolvedComplaints: number;
  avgResolutionDays: number;
  slaBreachRate: number;
  currentQuarterBudget: number;
  spentBudget: number;
}

export interface MaintenanceTeam {
  id: string;
  departmentId: string;
  name: string;
  leadName: string;
  activeMembers: number;
  status: 'Available' | 'Dispatched' | 'Standby';
  currentAssignedCount: number;
  contactPhone: string;
}

export interface LocationData {
  address: string;
  ward: string;
  zone: string;
  lat: number;
  lng: number;
  nearbyLandmark?: string;
  publicFacilityProximity?: {
    schoolNearby?: boolean;
    hospitalNearby?: boolean;
    transitNearby?: boolean;
    marketNearby?: boolean;
  };
}

export interface AIAnalysis {
  category: ComplaintCategory;
  summary: string;
  severity: ComplaintSeverity;
  priorityScore: number; // 0 - 100
  riskFactors: string[];
  recommendedDepartment: string;
  recommendedAction: string;
  reasoning: string;
  confidenceScore: number;
  communityImpact: {
    affectedPopulationEst: number;
    transitVulnerability: 'Low' | 'Moderate' | 'Critical';
    nearbyKeyInstitutions: string[];
  };
  estimatedCostRange?: string;
  isAiGenerated: true;
}

export interface StatusTimelineEntry {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  actorName: string;
  actorRole: UserRole | 'System AI';
  notes?: string;
  evidenceImageUrl?: string;
}

export interface ResolutionEvidence {
  resolvedAt: string;
  resolvedByTeam: string;
  completionSummary: string;
  afterImageUrl: string;
  materialsUsed?: string[];
  crewHoursSpent?: number;
  costIncurred?: number;
  verifiedByOfficer?: string;
}

export interface ResolutionFeedback {
  id: string;
  citizenId: string;
  citizenName: string;
  isSatisfied: boolean;
  rating: number; // 1 to 5
  feedbackText: string;
  reopenRequested: boolean;
  reopenReason?: string;
  submittedAt: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string; // e.g. CIV-2026-1042
  title: string;
  description: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  priorityScore: number; // 0 - 100
  status: ComplaintStatus;
  
  // Citizen & Privacy
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  isAnonymous: boolean;
  language: LanguageCode;
  
  // Location
  location: LocationData;
  
  // Evidence
  beforeImageUrl?: string;
  audioVoiceNoteUrl?: string;
  
  // Engagement
  supportersCount: number;
  supportedByCurrentUser?: boolean;
  
  // Intelligence linkages
  aiAnalysis?: AIAnalysis;
  isDuplicate?: boolean;
  duplicateOfId?: string;
  rootCauseClusterId?: string;
  isHotspot?: boolean;
  
  // Workflow & Assignment
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  targetResolutionDate?: string;
  isEscalated?: boolean;
  escalationReason?: string;
  
  // Timelines & Verification
  createdAt: string;
  updatedAt: string;
  timeline: StatusTimelineEntry[];
  resolutionEvidence?: ResolutionEvidence;
  resolutionFeedback?: ResolutionFeedback;
}

export interface RootCauseCluster {
  id: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  complaintIds: string[];
  affectedWard: string;
  incidentCount: number;
  severity: ComplaintSeverity;
  identifiedRootCause: string;
  recommendedEngineeringAction: string;
  status: 'Open' | 'Under Investigation' | 'Remediation Planned' | 'Resolved';
  detectedAt: string;
}

export interface PublicHazardAlert {
  id: string;
  title: string;
  severity: 'Warning' | 'Critical' | 'Informational';
  category: string;
  ward: string;
  locationDescription: string;
  issuedAt: string;
  expiresAt: string;
  message: string;
  recommendedPrecautions: string[];
  active: boolean;
}

export interface ActionBrief {
  id: string;
  complaintId: string;
  title: string;
  priorityHeadline: string;
  tacticalDirectives: string[];
  requiredMachinery: string[];
  estimatedManHours: string;
  budgetCeiling: string;
  safetyProtocol: string;
  createdAt: string;
}

export interface HotspotInsight {
  id: string;
  wardName: string;
  zone: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  primaryCategory: ComplaintCategory;
  complaintDensity: number; // active complaints in cluster
  riskTrend: 'Increasing' | 'Stable' | 'Declining';
  chronicIssues: string[];
  aiPreventiveRecommendation: string;
}
