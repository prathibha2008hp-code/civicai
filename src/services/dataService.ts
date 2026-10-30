/**
 * CivicAI - Centralized Data Service
 * Provides mock/synthetic dataset with Supabase-ready service layer abstraction.
 * Includes local storage caching to persist state during user exploration.
 */

import {
  Complaint,
  Department,
  MaintenanceTeam,
  RootCauseCluster,
  PublicHazardAlert,
  HotspotInsight,
  ResolutionEvidence,
  ResolutionFeedback,
  ComplaintStatus,
  UserRole,
} from '../types/civic';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-roads',
    name: 'Road Infrastructure & Traffic Engineering',
    code: 'RITE',
    headName: 'Dr. Ramesh Narayan, Chief Engineer',
    contactEmail: 'roads.command@civicai.gov.in',
    contactPhone: '+91 80 2266 1101',
    activeComplaints: 18,
    resolvedComplaints: 142,
    avgResolutionDays: 3.4,
    slaBreachRate: 4.8,
    currentQuarterBudget: 24000000,
    spentBudget: 17200000,
  },
  {
    id: 'dept-water',
    name: 'Water Supply & Sewerage Board',
    code: 'BWSSB',
    headName: 'Smt. Ananya Hegde, Executive Director',
    contactEmail: 'water.cell@civicai.gov.in',
    contactPhone: '+91 80 2266 1102',
    activeComplaints: 14,
    resolvedComplaints: 98,
    avgResolutionDays: 2.1,
    slaBreachRate: 3.2,
    currentQuarterBudget: 18500000,
    spentBudget: 11900000,
  },
  {
    id: 'dept-waste',
    name: 'Solid Waste Management Corporation',
    code: 'SWM',
    headName: 'Shri Vikram Patil, Operations Head',
    contactEmail: 'waste.action@civicai.gov.in',
    contactPhone: '+91 80 2266 1103',
    activeComplaints: 11,
    resolvedComplaints: 215,
    avgResolutionDays: 1.2,
    slaBreachRate: 1.9,
    currentQuarterBudget: 12000000,
    spentBudget: 9400000,
  },
  {
    id: 'dept-electric',
    name: 'Electricity Distribution & Public Lighting',
    code: 'BESCOM',
    headName: 'Er. Rajeshwari Kumar, Superintending Engineer',
    contactEmail: 'lights.alert@civicai.gov.in',
    contactPhone: '+91 80 2266 1104',
    activeComplaints: 7,
    resolvedComplaints: 184,
    avgResolutionDays: 1.5,
    slaBreachRate: 2.4,
    currentQuarterBudget: 9500000,
    spentBudget: 6200000,
  },
  {
    id: 'dept-drainage',
    name: 'Storm Water Drainage & Flood Mitigation',
    code: 'SWD',
    headName: 'Er. K. V. Manjunath, Chief Hydrologist',
    contactEmail: 'stormdrain@civicai.gov.in',
    contactPhone: '+91 80 2266 1105',
    activeComplaints: 15,
    resolvedComplaints: 63,
    avgResolutionDays: 5.1,
    slaBreachRate: 8.7,
    currentQuarterBudget: 31000000,
    spentBudget: 24800000,
  },
  {
    id: 'dept-health',
    name: 'Public Health, Vector Control & Sanitation',
    code: 'PHVC',
    headName: 'Dr. Fatima Zahra, Chief Medical Officer',
    contactEmail: 'health.cell@civicai.gov.in',
    contactPhone: '+91 80 2266 1106',
    activeComplaints: 6,
    resolvedComplaints: 89,
    avgResolutionDays: 2.0,
    slaBreachRate: 2.1,
    currentQuarterBudget: 8000000,
    spentBudget: 5100000,
  },
];

export const INITIAL_TEAMS: MaintenanceTeam[] = [
  {
    id: 'team-rite-01',
    departmentId: 'dept-roads',
    name: 'Rapid Asphalt Patch Squad Alpha',
    leadName: 'Supervisor Somesh Rao',
    activeMembers: 8,
    status: 'Dispatched',
    currentAssignedCount: 3,
    contactPhone: '+91 98450 11201',
  },
  {
    id: 'team-rite-02',
    departmentId: 'dept-roads',
    name: 'Heavy Pavement Milling Unit',
    leadName: 'Supervisor Chetan Gowda',
    activeMembers: 12,
    status: 'Available',
    currentAssignedCount: 1,
    contactPhone: '+91 98450 11202',
  },
  {
    id: 'team-water-01',
    departmentId: 'dept-water',
    name: 'High-Pressure Sewer Jetting Crew',
    leadName: 'Lead Tech Venkatesh M.',
    activeMembers: 6,
    status: 'Dispatched',
    currentAssignedCount: 2,
    contactPhone: '+91 98450 11203',
  },
  {
    id: 'team-swd-01',
    departmentId: 'dept-drainage',
    name: 'Culvert De-silting & Trenching Force',
    leadName: 'Supervisor Arif Khan',
    activeMembers: 14,
    status: 'Dispatched',
    currentAssignedCount: 4,
    contactPhone: '+91 98450 11204',
  },
  {
    id: 'team-elec-01',
    departmentId: 'dept-electric',
    name: 'Aerial Lift Streetlight Crew',
    leadName: 'Lineman Prakash B.',
    activeMembers: 4,
    status: 'Available',
    currentAssignedCount: 2,
    contactPhone: '+91 98450 11205',
  },
];

export const INITIAL_ROOT_CAUSE_CLUSTERS: RootCauseCluster[] = [
  {
    id: 'cluster-rc-01',
    title: 'Indiranagar 100ft Culvert Surcharge & Road Cavity',
    category: 'Flooding & Storm Drain',
    description: 'Multiple complaints reporting deep road sinking, waterlogging, foul odor, and basement flooding within a 150m radius of 12th Main junction.',
    complaintIds: ['CIV-2026-1001', 'CIV-2026-1002', 'CIV-2026-1003', 'CIV-2026-1014'],
    affectedWard: 'Ward 89 - Jogupalya / Indiranagar',
    incidentCount: 4,
    severity: 'Emergency',
    identifiedRootCause: 'Structural collapse of a 40-year-old masonry storm drain section beneath the arterial roadbed, causing soil washout and sewer interconnection.',
    recommendedEngineeringAction: 'Immediate lane closure, micro-tunneling inspection with CCTV rover, hydraulic dewatering, and pre-cast box culvert placement.',
    status: 'Remediation Planned',
    detectedAt: '2026-10-28T09:30:00Z',
  },
  {
    id: 'cluster-rc-02',
    title: 'Koramangala 4th Block Chronic Solid Waste Migration',
    category: 'Solid Waste Management',
    description: 'Recurrent blackspots and secondary drain chokes reported by residents and commercial food establishments.',
    complaintIds: ['CIV-2026-1007', 'CIV-2026-1008', 'CIV-2026-1019'],
    affectedWard: 'Ward 151 - Koramangala',
    incidentCount: 3,
    severity: 'Medium',
    identifiedRootCause: 'Absence of segregated night-time commercial waste pickup for restaurants leading to illicit dumping over drain grates.',
    recommendedEngineeringAction: 'Institute mandatory commercial waste registry, CCTV surveillance at hotspot corners, and twin daily scheduled clearances.',
    status: 'Under Investigation',
    detectedAt: '2026-10-27T14:15:00Z',
  },
];

export const INITIAL_PUBLIC_HAZARDS: PublicHazardAlert[] = [
  {
    id: 'hazard-01',
    title: 'Active High-Voltage Cable Exposure After Tree Fall',
    severity: 'Critical',
    category: 'Electricity & Street Lighting',
    ward: 'Ward 112 - Domlur',
    locationDescription: 'Opposite Domlur BDA Complex, Old Airport Road',
    issuedAt: '2026-10-29T19:40:00Z',
    expiresAt: '2026-10-30T06:00:00Z',
    message: 'Live 11kV conductor dangling over pedestrian walkway. Traffic police barricades erected. Emergency isolation crew dispatched.',
    recommendedPrecautions: [
      'Maintain minimum 30-meter perimeter distance',
      'Do not walk on water puddles adjacent to pole #D-44',
      'Use inner ring road detour for pedestrian transit',
    ],
    active: true,
  },
  {
    id: 'hazard-02',
    title: 'Arterial Road Cavity Risk Near Cambridge Public School',
    severity: 'Warning',
    category: 'Road & Infrastructure',
    ward: 'Ward 89 - Jogupalya',
    locationDescription: 'Near Cambridge School gate, 80 Feet Road',
    issuedAt: '2026-10-29T08:15:00Z',
    expiresAt: '2026-10-30T18:00:00Z',
    message: 'Sub-surface subsidence detected. Heavy vehicles rerouted away from school lane during morning drop-off hours.',
    recommendedPrecautions: [
      'Speed limit restricted to 15 km/h for two-wheelers',
      'School buses advised to use Gate 2 on 4th Cross',
    ],
    active: true,
  },
];

export const INITIAL_HOTSPOTS: HotspotInsight[] = [
  {
    id: 'hs-01',
    wardName: 'Ward 89 - Jogupalya & Indiranagar',
    zone: 'East Zone',
    lat: 12.9784,
    lng: 77.6408,
    radiusMeters: 450,
    primaryCategory: 'Road & Infrastructure',
    complaintDensity: 9,
    riskTrend: 'Increasing',
    chronicIssues: ['Heavy traffic pothole fatigue', 'Storm drain cavity subsidence', 'Pedestrian zebra crossing wear'],
    aiPreventiveRecommendation: 'Overlay with polymer-modified bitumen and comprehensive subsurface ground-penetrating radar survey.',
  },
  {
    id: 'hs-02',
    wardName: 'Ward 151 - Koramangala 4th & 5th Block',
    zone: 'South Zone',
    lat: 12.9345,
    lng: 77.6266,
    radiusMeters: 380,
    primaryCategory: 'Solid Waste Management',
    complaintDensity: 6,
    riskTrend: 'Stable',
    chronicIssues: ['Commercial eatery blackspots', 'Secondary stormwater grating blockages'],
    aiPreventiveRecommendation: 'Deploy micro-compactor round-the-clock beats and implement smart RFID tag tracking for commercial bins.',
  },
  {
    id: 'hs-03',
    wardName: 'Ward 174 - HSR Layout Sector 1 & 2',
    zone: 'South-East Zone',
    lat: 12.9121,
    lng: 77.6446,
    radiusMeters: 500,
    primaryCategory: 'Flooding & Storm Drain',
    complaintDensity: 7,
    riskTrend: 'Increasing',
    chronicIssues: ['Silt sedimentation at low-lying culvert', 'Backflow into apartment basements'],
    aiPreventiveRecommendation: 'Install automated water level ultrasonic monitors with IoT telemetry to municipal control station.',
  },
];

// Rich, realistic dataset of 36 sample complaints with realistic coordinates around Bangalore
export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CIV-2026-1001',
    ticketNumber: 'CIV-2026-1001',
    title: 'Severe crater pothole near Cambridge Public School gate',
    description: 'There is a large pothole (over 1.5m wide and 25cm deep) directly outside the primary school entrance on 80ft road. Many young children, school vans and two-wheelers pass this exact spot. Two scooters skidded yesterday during rain.',
    category: 'Road & Infrastructure',
    severity: 'High',
    priorityScore: 88,
    status: 'In Progress',
    citizenId: 'cit-001',
    citizenName: 'Priya Sundaram',
    citizenPhone: '+91 98450 44210',
    isAnonymous: false,
    language: 'en',
    location: {
      address: '14th Cross, 80 Feet Road, Near Cambridge Public School, Indiranagar',
      ward: 'Ward 89 - Jogupalya',
      zone: 'East Zone',
      lat: 12.9782,
      lng: 77.6415,
      nearbyLandmark: 'Cambridge Public School Main Gate',
      publicFacilityProximity: {
        schoolNearby: true,
        hospitalNearby: false,
        transitNearby: true,
        marketNearby: false,
      },
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    supportersCount: 42,
    supportedByCurrentUser: true,
    aiAnalysis: {
      category: 'Road & Infrastructure',
      summary: 'Critical road pavement cavity directly adjacent to school entrance presenting severe vehicular and pedestrian hazard.',
      severity: 'High',
      priorityScore: 88,
      riskFactors: ['Active primary school pedestrian zone', 'Recent accident history', 'Arterial bus corridor'],
      recommendedDepartment: 'Road Infrastructure & Traffic Engineering',
      recommendedAction: 'Immediate cold-mix asphalt patch within 6 hours, followed by structural sub-base compaction.',
      reasoning: 'Proximity to vulnerable children and high-volume transit elevates public risk tier significantly.',
      confidenceScore: 0.96,
      communityImpact: {
        affectedPopulationEst: 4200,
        transitVulnerability: 'Critical',
        nearbyKeyInstitutions: ['Cambridge Public School', 'Indiranagar Metro Station (600m)'],
      },
      estimatedCostRange: '₹35,000 - ₹55,000',
      isAiGenerated: true,
    },
    rootCauseClusterId: 'cluster-rc-01',
    isHotspot: true,
    assignedDepartmentId: 'dept-roads',
    assignedDepartmentName: 'Road Infrastructure & Traffic Engineering',
    assignedTeamId: 'team-rite-01',
    assignedTeamName: 'Rapid Asphalt Patch Squad Alpha',
    targetResolutionDate: '2026-10-31',
    createdAt: '2026-10-27T08:20:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
    timeline: [
      {
        id: 'tl-1',
        status: 'Submitted',
        timestamp: '2026-10-27T08:20:00Z',
        actorName: 'Priya Sundaram',
        actorRole: 'citizen',
        notes: 'Submitted via CivicAI Citizen Portal with photo evidence and GPS location.',
      },
      {
        id: 'tl-2',
        status: 'Under Review',
        timestamp: '2026-10-27T08:25:00Z',
        actorName: 'CivicAI Dispatch Engine',
        actorRole: 'System AI',
        notes: 'AI severity calculated at 88/100. Classified as High priority due to adjacent school institution.',
      },
      {
        id: 'tl-3',
        status: 'Assigned',
        timestamp: '2026-10-27T11:45:00Z',
        actorName: 'Superintendent Rajesh Rao',
        actorRole: 'official',
        notes: 'Assigned to Rapid Asphalt Patch Squad Alpha. Machinery dispatch authorized.',
      },
      {
        id: 'tl-4',
        status: 'In Progress',
        timestamp: '2026-10-28T10:00:00Z',
        actorName: 'Supervisor Somesh Rao',
        actorRole: 'supervisor',
        notes: 'Crew on site. Traffic cones placed; sub-base moisture drying in progress.',
      },
    ],
  },
  {
    id: 'CIV-2026-1002',
    ticketNumber: 'CIV-2026-1002',
    title: 'Huge road sinkhole forming by Cambridge school road',
    description: 'Dangerous depression on the road near Cambridge school gate on 80ft road. Cars are swerving suddenly to avoid it, creating near collisions.',
    category: 'Road & Infrastructure',
    severity: 'High',
    priorityScore: 86,
    status: 'Assigned',
    citizenId: 'cit-002',
    citizenName: 'Anonymous Citizen',
    isAnonymous: true,
    language: 'en',
    location: {
      address: 'Near Cambridge School gate, 80 Feet Road, Indiranagar',
      ward: 'Ward 89 - Jogupalya',
      zone: 'East Zone',
      lat: 12.9783,
      lng: 77.6416,
      nearbyLandmark: 'Cambridge Public School',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    supportersCount: 19,
    supportedByCurrentUser: false,
    isDuplicate: true,
    duplicateOfId: 'CIV-2026-1001',
    rootCauseClusterId: 'cluster-rc-01',
    assignedDepartmentId: 'dept-roads',
    assignedDepartmentName: 'Road Infrastructure & Traffic Engineering',
    assignedTeamId: 'team-rite-01',
    assignedTeamName: 'Rapid Asphalt Patch Squad Alpha',
    createdAt: '2026-10-27T14:40:00Z',
    updatedAt: '2026-10-27T16:00:00Z',
    timeline: [
      {
        id: 'tl-201',
        status: 'Submitted',
        timestamp: '2026-10-27T14:40:00Z',
        actorName: 'Anonymous Citizen',
        actorRole: 'citizen',
        notes: 'Submitted anonymously via mobile web.',
      },
      {
        id: 'tl-202',
        status: 'Under Review',
        timestamp: '2026-10-27T14:42:00Z',
        actorName: 'CivicAI Duplicate Scanner',
        actorRole: 'System AI',
        notes: 'Candidate duplicate detected with CIV-2026-1001 (94% spatial and semantic match).',
      },
      {
        id: 'tl-203',
        status: 'Assigned',
        timestamp: '2026-10-27T16:00:00Z',
        actorName: 'Assistant Engineer V. Murthy',
        actorRole: 'official',
        notes: 'Linked as duplicate work item to primary ticket CIV-2026-1001.',
      },
    ],
  },
  {
    id: 'CIV-2026-1003',
    ticketNumber: 'CIV-2026-1003',
    title: 'Sewage overflowing from manhole and stagnant water on 12th Main',
    description: 'Black wastewater bubbling up from broken storm manhole cover. Intense foul smell permeating the neighborhood and shops. Mosquito larvae breeding in stagnant pools.',
    category: 'Water Supply & Sewage',
    severity: 'High',
    priorityScore: 82,
    status: 'In Progress',
    citizenId: 'cit-003',
    citizenName: 'Maheshwar Hegde',
    citizenPhone: '+91 97410 88319',
    isAnonymous: false,
    language: 'kn',
    location: {
      address: '12th Main Road, Near Corner House Ice Cream, Indiranagar',
      ward: 'Ward 89 - Jogupalya',
      zone: 'East Zone',
      lat: 12.9776,
      lng: 77.6402,
      nearbyLandmark: 'Corner House 12th Main',
      publicFacilityProximity: {
        schoolNearby: false,
        hospitalNearby: true,
        transitNearby: true,
        marketNearby: true,
      },
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    supportersCount: 31,
    rootCauseClusterId: 'cluster-rc-01',
    isHotspot: true,
    assignedDepartmentId: 'dept-water',
    assignedDepartmentName: 'Water Supply & Sewerage Board',
    assignedTeamId: 'team-water-01',
    assignedTeamName: 'High-Pressure Sewer Jetting Crew',
    targetResolutionDate: '2026-10-30',
    createdAt: '2026-10-26T11:10:00Z',
    updatedAt: '2026-10-27T09:00:00Z',
    timeline: [
      {
        id: 'tl-301',
        status: 'Submitted',
        timestamp: '2026-10-26T11:10:00Z',
        actorName: 'Maheshwar Hegde',
        actorRole: 'citizen',
        notes: 'Voice complaint submitted in Kannada.',
      },
      {
        id: 'tl-302',
        status: 'Under Review',
        timestamp: '2026-10-26T11:15:00Z',
        actorName: 'CivicAI NLP Translator',
        actorRole: 'System AI',
        notes: 'Transcribed from Kannada and translated to administrative English. Priority score 82.',
      },
      {
        id: 'tl-303',
        status: 'Assigned',
        timestamp: '2026-10-26T16:30:00Z',
        actorName: 'Executive Officer S. Nayak',
        actorRole: 'official',
        notes: 'Assigned to BWSSB Jetting Team 01.',
      },
      {
        id: 'tl-304',
        status: 'In Progress',
        timestamp: '2026-10-27T09:00:00Z',
        actorName: 'Lead Tech Venkatesh M.',
        actorRole: 'supervisor',
        notes: 'Desilting suction machine deployed; blockage localized to main junction.',
      },
    ],
  },
  {
    id: 'CIV-2026-1004',
    ticketNumber: 'CIV-2026-1004',
    title: '11kV Live High-Tension Electric Wire Snapped & Dangling Over Road',
    description: 'URGENT: Heavy branch fell on electrical line opposite Domlur BDA Complex. Live sparks seen on wet tarmac. Pedestrians and street dogs at high electrocution risk.',
    category: 'Public Hazards & Safety',
    severity: 'Emergency',
    priorityScore: 98,
    status: 'In Progress',
    citizenId: 'cit-004',
    citizenName: 'Deepak Ramanathan',
    citizenPhone: '+91 94480 32190',
    isAnonymous: false,
    language: 'en',
    location: {
      address: 'Old Airport Road, Opposite Domlur BDA Complex',
      ward: 'Ward 112 - Domlur',
      zone: 'East Zone',
      lat: 12.9604,
      lng: 77.6441,
      nearbyLandmark: 'Domlur BDA Complex Bus Stop',
      publicFacilityProximity: {
        schoolNearby: false,
        hospitalNearby: true,
        transitNearby: true,
        marketNearby: true,
      },
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    supportersCount: 78,
    supportedByCurrentUser: true,
    aiAnalysis: {
      category: 'Public Hazards & Safety',
      summary: 'Extreme life safety hazard: Live 11kV electrical cable snapped over busy pedestrian and bus transit corridor.',
      severity: 'Emergency',
      priorityScore: 98,
      riskFactors: ['High voltage electrocution risk', 'Wet surface conductive propagation', 'Bus passenger crowding'],
      recommendedDepartment: 'Electricity Distribution & Public Lighting',
      recommendedAction: 'Immediate SCADA substation feeder trip, police cordoning, overhead line splicing.',
      reasoning: 'Imminent threat to life and public safety requiring sub-30-minute intervention.',
      confidenceScore: 0.99,
      communityImpact: {
        affectedPopulationEst: 8500,
        transitVulnerability: 'Critical',
        nearbyKeyInstitutions: ['Domlur BMTC Bus Depot', 'Manipal Hospital Corridor (1.2km)'],
      },
      estimatedCostRange: '₹40,000 - ₹70,000',
      isAiGenerated: true,
    },
    assignedDepartmentId: 'dept-electric',
    assignedDepartmentName: 'Electricity Distribution & Public Lighting',
    assignedTeamId: 'team-elec-01',
    assignedTeamName: 'Aerial Lift Streetlight Crew',
    targetResolutionDate: '2026-10-29',
    createdAt: '2026-10-29T19:35:00Z',
    updatedAt: '2026-10-29T20:00:00Z',
    timeline: [
      {
        id: 'tl-401',
        status: 'Submitted',
        timestamp: '2026-10-29T19:35:00Z',
        actorName: 'Deepak Ramanathan',
        actorRole: 'citizen',
        notes: 'Emergency flagged by citizen with photo evidence.',
      },
      {
        id: 'tl-402',
        status: 'Under Review',
        timestamp: '2026-10-29T19:36:00Z',
        actorName: 'CivicAI Emergency Sentry',
        actorRole: 'System AI',
        notes: 'CRITICAL ALERT TRIGGERED: Priority 98. Auto-dispatched emergency broadcast to BESCOM grid controller.',
      },
      {
        id: 'tl-403',
        status: 'In Progress',
        timestamp: '2026-10-29T19:50:00Z',
        actorName: 'Lineman Prakash B.',
        actorRole: 'supervisor',
        notes: 'Substation feeder de-energized. Emergency boom truck arriving on site.',
      },
    ],
  },
  {
    id: 'CIV-2026-1005',
    ticketNumber: 'CIV-2026-1005',
    title: 'Restored & Repaired: Broken stormwater drain slab at Koramangala 5th Block',
    description: 'Pedestrian concrete slab covering the main roadside storm drain had cracked and caved in, leaving a 2-meter gaping hole on the footpath.',
    category: 'Flooding & Storm Drain',
    severity: 'Medium',
    priorityScore: 65,
    status: 'Resolved',
    citizenId: 'cit-005',
    citizenName: 'Sneha Kulkarni',
    citizenPhone: '+91 99800 77123',
    isAnonymous: false,
    language: 'en',
    location: {
      address: '1st Cross, Koramangala 5th Block, Near Jyoti Nivas College',
      ward: 'Ward 151 - Koramangala',
      zone: 'South Zone',
      lat: 12.9352,
      lng: 77.6189,
      nearbyLandmark: 'Jyoti Nivas College Road',
      publicFacilityProximity: {
        schoolNearby: true,
        hospitalNearby: false,
        transitNearby: true,
        marketNearby: true,
      },
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    supportersCount: 28,
    assignedDepartmentId: 'dept-drainage',
    assignedDepartmentName: 'Storm Water Drainage & Flood Mitigation',
    assignedTeamId: 'team-swd-01',
    assignedTeamName: 'Culvert De-silting & Trenching Force',
    createdAt: '2026-10-22T10:00:00Z',
    updatedAt: '2026-10-25T16:00:00Z',
    timeline: [
      {
        id: 'tl-501',
        status: 'Submitted',
        timestamp: '2026-10-22T10:00:00Z',
        actorName: 'Sneha Kulkarni',
        actorRole: 'citizen',
      },
      {
        id: 'tl-502',
        status: 'Under Review',
        timestamp: '2026-10-22T10:05:00Z',
        actorName: 'CivicAI Dispatch Engine',
        actorRole: 'System AI',
      },
      {
        id: 'tl-503',
        status: 'Assigned',
        timestamp: '2026-10-22T14:00:00Z',
        actorName: 'Officer K. V. Manjunath',
        actorRole: 'official',
      },
      {
        id: 'tl-504',
        status: 'In Progress',
        timestamp: '2026-10-24T09:00:00Z',
        actorName: 'Supervisor Arif Khan',
        actorRole: 'supervisor',
      },
      {
        id: 'tl-505',
        status: 'Resolved',
        timestamp: '2026-10-25T16:00:00Z',
        actorName: 'Supervisor Arif Khan',
        actorRole: 'supervisor',
        notes: 'Reinforced concrete precast slab installed with anti-skid grid. Footpath restored.',
        evidenceImageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
      },
    ],
    resolutionEvidence: {
      resolvedAt: '2026-10-25T16:00:00Z',
      resolvedByTeam: 'Culvert De-silting & Trenching Force',
      completionSummary: 'Excavated damaged broken RCC slab, cast new reinforced M25 grade curb cover, and levelled sidewalk paving bricks.',
      afterImageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
      materialsUsed: ['Precast RCC Slab 1500x600mm', 'M25 Concrete mix', 'Sidewalk interlocking pavers (12 pcs)'],
      crewHoursSpent: 16,
      costIncurred: 18500,
      verifiedByOfficer: 'Er. K. V. Manjunath, Chief Hydrologist',
    },
    resolutionFeedback: {
      id: 'fb-501',
      citizenId: 'cit-005',
      citizenName: 'Sneha Kulkarni',
      isSatisfied: true,
      rating: 5,
      feedbackText: 'Great work! The repair was done neatly and the footpath is now safe for students walking to college.',
      reopenRequested: false,
      submittedAt: '2026-10-26T08:30:00Z',
    },
  },
  {
    id: 'CIV-2026-1006',
    ticketNumber: 'CIV-2026-1006',
    title: 'Disputed Resolution: Street lights flickering and dark stretch on 17th Cross',
    description: 'Six consecutive LED streetlights fail to ignite after 6:30 PM. Walking alone after sunset is hazardous, and two chain snatching incidents were reported last month.',
    category: 'Electricity & Street Lighting',
    severity: 'Medium',
    priorityScore: 71,
    status: 'Reopened',
    citizenId: 'cit-006',
    citizenName: 'Kavita Menon',
    citizenPhone: '+91 98441 55667',
    isAnonymous: false,
    language: 'en',
    location: {
      address: '17th Cross, HSR Layout Sector 4',
      ward: 'Ward 174 - HSR Layout',
      zone: 'South-East Zone',
      lat: 12.9155,
      lng: 77.6391,
      nearbyLandmark: 'Near Sector 4 Children Park',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    supportersCount: 16,
    assignedDepartmentId: 'dept-electric',
    assignedDepartmentName: 'Electricity Distribution & Public Lighting',
    assignedTeamId: 'team-elec-01',
    assignedTeamName: 'Aerial Lift Streetlight Crew',
    isEscalated: true,
    escalationReason: 'Citizen disputed contractor resolution: only 1 light replaced while 5 remain non-operational.',
    createdAt: '2026-10-20T19:00:00Z',
    updatedAt: '2026-10-26T21:00:00Z',
    timeline: [
      {
        id: 'tl-601',
        status: 'Submitted',
        timestamp: '2026-10-20T19:00:00Z',
        actorName: 'Kavita Menon',
        actorRole: 'citizen',
      },
      {
        id: 'tl-602',
        status: 'Resolved',
        timestamp: '2026-10-24T18:00:00Z',
        actorName: 'Lineman Prakash B.',
        actorRole: 'supervisor',
        notes: 'Timer controller reset and bulb #3 replaced.',
        evidenceImageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'tl-603',
        status: 'Reopened',
        timestamp: '2026-10-25T20:15:00Z',
        actorName: 'Kavita Menon',
        actorRole: 'citizen',
        notes: 'Dispute filed: "The crew only fixed pole #14. Poles #15, #16, #17, #18, and #19 are still pitch dark tonight!"',
      },
    ],
    resolutionEvidence: {
      resolvedAt: '2026-10-24T18:00:00Z',
      resolvedByTeam: 'Aerial Lift Streetlight Crew',
      completionSummary: 'Replaced LED lamp driver on pole #14 and reset master time-clock relay.',
      afterImageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    },
    resolutionFeedback: {
      id: 'fb-601',
      citizenId: 'cit-006',
      citizenName: 'Kavita Menon',
      isSatisfied: false,
      rating: 1,
      feedbackText: 'The contractor uploaded a picture of only one pole during sunset. The remaining 5 poles are completely dead! Please reopen and fix the entire circuit.',
      reopenRequested: true,
      reopenReason: 'Incomplete repair - 5 of 6 streetlights still unlit.',
      submittedAt: '2026-10-25T20:15:00Z',
    },
  },
  {
    id: 'CIV-2026-1007',
    ticketNumber: 'CIV-2026-1007',
    title: 'Illegal commercial garbage dumping and open burning on vacant plot',
    description: 'Rotting food waste, plastic bags, and chemical containers dumped overnight. Someone set fire to the pile this morning creating toxic acrid smoke affecting nearby elderly residents.',
    category: 'Solid Waste Management',
    severity: 'High',
    priorityScore: 79,
    status: 'Under Review',
    citizenId: 'cit-007',
    citizenName: 'Amitabh Sen',
    citizenPhone: '+91 98455 12099',
    isAnonymous: false,
    language: 'hi',
    location: {
      address: 'Plot 42, 6th Block, Near Sony World Signal, Koramangala',
      ward: 'Ward 151 - Koramangala',
      zone: 'South Zone',
      lat: 12.9348,
      lng: 77.6258,
      nearbyLandmark: 'Behind Sony World Junction',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    supportersCount: 22,
    rootCauseClusterId: 'cluster-rc-02',
    isHotspot: true,
    aiAnalysis: {
      category: 'Solid Waste Management',
      summary: 'Public nuisance and health threat: unauthorized commercial waste dumping with hazardous open burning.',
      severity: 'High',
      priorityScore: 79,
      riskFactors: ['Toxic particulate smoke near residences', 'Air quality degradation', 'Stray animal accumulation'],
      recommendedDepartment: 'Solid Waste Management Corporation',
      recommendedAction: 'Deploy mechanized waste loader, extinguish ember residues, install surveillance deterrent banner.',
      reasoning: 'Active combustion of plastics requires prompt municipal and pollution control intervention.',
      confidenceScore: 0.94,
      communityImpact: {
        affectedPopulationEst: 1800,
        transitVulnerability: 'Moderate',
        nearbyKeyInstitutions: ['Senior Living Care Center (250m)'],
      },
      isAiGenerated: true,
    },
    createdAt: '2026-10-29T07:15:00Z',
    updatedAt: '2026-10-29T07:20:00Z',
    timeline: [
      {
        id: 'tl-701',
        status: 'Submitted',
        timestamp: '2026-10-29T07:15:00Z',
        actorName: 'Amitabh Sen',
        actorRole: 'citizen',
        notes: 'Submitted in Hindi.',
      },
      {
        id: 'tl-702',
        status: 'Under Review',
        timestamp: '2026-10-29T07:20:00Z',
        actorName: 'CivicAI Dispatch Engine',
        actorRole: 'System AI',
        notes: 'Priority 79. Flagged for immediate Solid Waste inspection.',
      },
    ],
  },
  {
    id: 'CIV-2026-1008',
    ticketNumber: 'CIV-2026-1008',
    title: 'Commercial kitchen waste dumped near Koramangala Sony World drain',
    description: 'Black polybags filled with organic chicken waste and greasy packaging dumped next to the stormwater intake grate.',
    category: 'Solid Waste Management',
    severity: 'Medium',
    priorityScore: 68,
    status: 'Submitted',
    citizenId: 'cit-008',
    citizenName: 'Anonymous Citizen',
    isAnonymous: true,
    language: 'en',
    location: {
      address: 'Opposite Oasis Centre, Inner Ring Road, Koramangala',
      ward: 'Ward 151 - Koramangala',
      zone: 'South Zone',
      lat: 12.9351,
      lng: 77.6262,
      nearbyLandmark: 'Oasis Centre junction',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    supportersCount: 14,
    isDuplicate: true,
    duplicateOfId: 'CIV-2026-1007',
    rootCauseClusterId: 'cluster-rc-02',
    createdAt: '2026-10-29T11:00:00Z',
    updatedAt: '2026-10-29T11:00:00Z',
    timeline: [
      {
        id: 'tl-801',
        status: 'Submitted',
        timestamp: '2026-10-29T11:00:00Z',
        actorName: 'Anonymous Citizen',
        actorRole: 'citizen',
      },
    ],
  },
  {
    id: 'CIV-2026-1009',
    ticketNumber: 'CIV-2026-1009',
    title: 'Severe water logging after 30 mins rain on Silk Board underpass',
    description: 'The vehicle underpass is submerged under 2.5 feet of muddy stormwater. Three sedans broke down, creating massive 4km traffic gridlock.',
    category: 'Flooding & Storm Drain',
    severity: 'High',
    priorityScore: 89,
    status: 'Assigned',
    citizenId: 'cit-009',
    citizenName: 'Karthik Balakrishnan',
    citizenPhone: '+91 98451 99011',
    isAnonymous: false,
    language: 'en',
    location: {
      address: 'Central Silk Board Junction Underpass, Hosur Road',
      ward: 'Ward 174 - HSR Layout',
      zone: 'South Zone',
      lat: 12.9177,
      lng: 77.6238,
      nearbyLandmark: 'Silk Board Metro Station Pier #24',
      publicFacilityProximity: {
        schoolNearby: false,
        hospitalNearby: false,
        transitNearby: true,
        marketNearby: true,
      },
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    supportersCount: 65,
    assignedDepartmentId: 'dept-drainage',
    assignedDepartmentName: 'Storm Water Drainage & Flood Mitigation',
    assignedTeamId: 'team-swd-01',
    assignedTeamName: 'Culvert De-silting & Trenching Force',
    targetResolutionDate: '2026-10-30',
    createdAt: '2026-10-28T16:20:00Z',
    updatedAt: '2026-10-28T18:00:00Z',
    timeline: [
      {
        id: 'tl-901',
        status: 'Submitted',
        timestamp: '2026-10-28T16:20:00Z',
        actorName: 'Karthik Balakrishnan',
        actorRole: 'citizen',
      },
      {
        id: 'tl-902',
        status: 'Assigned',
        timestamp: '2026-10-28T18:00:00Z',
        actorName: 'Chief Hydrologist K. V. Manjunath',
        actorRole: 'official',
        notes: 'High-capacity diesel dewatering pump trailer dispatched.',
      },
    ],
  },
  {
    id: 'CIV-2026-1010',
    ticketNumber: 'CIV-2026-1010',
    title: 'Ancient Gulmohar tree limb precariously split over pedestrian lane',
    description: 'During yesterday storm, a heavy 400kg bough cracked partially and is resting directly on communication cables above the pavement.',
    category: 'Parks & Urban Forestry',
    severity: 'High',
    priorityScore: 76,
    status: 'In Progress',
    citizenId: 'cit-010',
    citizenName: 'Meenakshi Sundaram',
    citizenPhone: '+91 94481 00223',
    isAnonymous: false,
    language: 'en',
    location: {
      address: '4th Main, Malleshwaram 8th Cross',
      ward: 'Ward 65 - Malleshwaram',
      zone: 'West Zone',
      lat: 13.0031,
      lng: 77.5702,
      nearbyLandmark: 'Opposite Malleshwaram Post Office',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    supportersCount: 23,
    assignedDepartmentId: 'dept-roads',
    assignedDepartmentName: 'Road Infrastructure & Traffic Engineering',
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-10-29T10:30:00Z',
    timeline: [
      {
        id: 'tl-1001',
        status: 'Submitted',
        timestamp: '2026-10-28T09:00:00Z',
        actorName: 'Meenakshi Sundaram',
        actorRole: 'citizen',
      },
      {
        id: 'tl-1002',
        status: 'In Progress',
        timestamp: '2026-10-29T10:30:00Z',
        actorName: 'Forestry Officer Gangadhar',
        actorRole: 'official',
        notes: 'Hydraulic pruner team on site with chainsaw team.',
      },
    ],
  },
  {
    id: 'CIV-2026-1011',
    ticketNumber: 'CIV-2026-1011',
    title: 'Drinking water pipeline ruptured gushing potable water on road',
    description: 'Clean drinking water is bursting out of an underground 150mm pipe at high pressure. Hundreds of liters wasted every minute while adjacent houses have zero pressure.',
    category: 'Water Supply & Sewage',
    severity: 'High',
    priorityScore: 84,
    status: 'Assigned',
    citizenId: 'cit-011',
    citizenName: 'Girish Nadkarni',
    citizenPhone: '+91 98450 77112',
    isAnonymous: false,
    language: 'kn',
    location: {
      address: '7th Block, Jayanagar Near Kanakadasa Circle',
      ward: 'Ward 153 - Jayanagar',
      zone: 'South Zone',
      lat: 12.9250,
      lng: 77.5838,
      nearbyLandmark: 'Kanakadasa Circle, Jayanagar',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80',
    supportersCount: 39,
    assignedDepartmentId: 'dept-water',
    assignedDepartmentName: 'Water Supply & Sewerage Board',
    assignedTeamId: 'team-water-01',
    assignedTeamName: 'High-Pressure Sewer Jetting Crew',
    targetResolutionDate: '2026-10-30',
    createdAt: '2026-10-29T06:15:00Z',
    updatedAt: '2026-10-29T08:00:00Z',
    timeline: [
      {
        id: 'tl-1101',
        status: 'Submitted',
        timestamp: '2026-10-29T06:15:00Z',
        actorName: 'Girish Nadkarni',
        actorRole: 'citizen',
      },
      {
        id: 'tl-1102',
        status: 'Assigned',
        timestamp: '2026-10-29T08:00:00Z',
        actorName: 'BWSSB Valve Control',
        actorRole: 'official',
        notes: 'Line isolation valve closed to halt waste; clamp repair team mobilized.',
      },
    ],
  },
  {
    id: 'CIV-2026-1012',
    ticketNumber: 'CIV-2026-1012',
    title: 'Restored & Repaired: Replaced burnt street lighting transformer circuit',
    description: 'Entire block of 14 streetlights along 5th Main had gone dark due to a blown distribution cutout box.',
    category: 'Electricity & Street Lighting',
    severity: 'Medium',
    priorityScore: 62,
    status: 'Resolved',
    citizenId: 'cit-012',
    citizenName: 'Sunita Rao',
    citizenPhone: '+91 97411 22334',
    isAnonymous: false,
    language: 'en',
    location: {
      address: '5th Main, Vasanth Nagar Near Cantonment Station',
      ward: 'Ward 93 - Vasanth Nagar',
      zone: 'Central Zone',
      lat: 12.9904,
      lng: 77.5946,
      nearbyLandmark: 'Cantonment Railway Station Back Gate',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    supportersCount: 17,
    assignedDepartmentId: 'dept-electric',
    assignedDepartmentName: 'Electricity Distribution & Public Lighting',
    assignedTeamId: 'team-elec-01',
    assignedTeamName: 'Aerial Lift Streetlight Crew',
    createdAt: '2026-10-23T18:00:00Z',
    updatedAt: '2026-10-25T14:00:00Z',
    timeline: [
      {
        id: 'tl-1201',
        status: 'Submitted',
        timestamp: '2026-10-23T18:00:00Z',
        actorName: 'Sunita Rao',
        actorRole: 'citizen',
      },
      {
        id: 'tl-1202',
        status: 'Resolved',
        timestamp: '2026-10-25T14:00:00Z',
        actorName: 'Lineman Prakash B.',
        actorRole: 'supervisor',
        notes: 'Fused cutout replaced, all 14 fixtures tested active and operational.',
        evidenceImageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
      },
    ],
    resolutionEvidence: {
      resolvedAt: '2026-10-25T14:00:00Z',
      resolvedByTeam: 'Aerial Lift Streetlight Crew',
      completionSummary: 'Installed heavy-duty MCCB circuit breaker, replaced 2 faulty starters, all 14 sodium lamps illuminated.',
      afterImageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
      materialsUsed: ['40A 3-Phase MCCB Breaker', 'High-temp terminal connectors'],
      crewHoursSpent: 6,
      costIncurred: 11200,
      verifiedByOfficer: 'Er. Rajeshwari Kumar',
    },
    resolutionFeedback: {
      id: 'fb-1201',
      citizenId: 'cit-012',
      citizenName: 'Sunita Rao',
      isSatisfied: true,
      rating: 5,
      feedbackText: 'Very fast resolution! The street is bright and safe again for night commuters.',
      reopenRequested: false,
      submittedAt: '2026-10-26T09:00:00Z',
    },
  },
  {
    id: 'CIV-2026-1013',
    ticketNumber: 'CIV-2026-1013',
    title: 'Chronic mosquito breeding in uncleared storm drain near Primary Health Center',
    description: 'Weeds, stagnant sludge, and discarded beverage cups blocking storm drain. Multiple dengue cases reported in surrounding residential apartments.',
    category: 'Public Health & Sanitation',
    severity: 'High',
    priorityScore: 81,
    status: 'In Progress',
    citizenId: 'cit-013',
    citizenName: 'Dr. Sharada Murthy',
    citizenPhone: '+91 94480 88991',
    isAnonymous: false,
    language: 'kn',
    location: {
      address: 'Opposite Primary Health Center, BTM Layout 2nd Stage',
      ward: 'Ward 176 - BTM Layout',
      zone: 'South Zone',
      lat: 12.9166,
      lng: 77.6101,
      nearbyLandmark: 'BTM Primary Health Center',
      publicFacilityProximity: {
        schoolNearby: false,
        hospitalNearby: true,
        transitNearby: true,
        marketNearby: false,
      },
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    supportersCount: 47,
    assignedDepartmentId: 'dept-health',
    assignedDepartmentName: 'Public Health, Vector Control & Sanitation',
    createdAt: '2026-10-27T08:00:00Z',
    updatedAt: '2026-10-28T11:00:00Z',
    timeline: [
      {
        id: 'tl-1301',
        status: 'Submitted',
        timestamp: '2026-10-27T08:00:00Z',
        actorName: 'Dr. Sharada Murthy',
        actorRole: 'citizen',
      },
      {
        id: 'tl-1302',
        status: 'In Progress',
        timestamp: '2026-10-28T11:00:00Z',
        actorName: 'Health Inspector Ramesh',
        actorRole: 'official',
        notes: 'Larvicidal spraying conducted; silt desilting scheduled.',
      },
    ],
  },
  {
    id: 'CIV-2026-1014',
    ticketNumber: 'CIV-2026-1014',
    title: 'Underground drain wall collapse causing road surface crack',
    description: 'Pavement is visibly sagging by 8 inches over the box culvert crossing 100ft road Indiranagar.',
    category: 'Flooding & Storm Drain',
    severity: 'High',
    priorityScore: 87,
    status: 'Under Review',
    citizenId: 'cit-014',
    citizenName: 'Anonymous Citizen',
    isAnonymous: true,
    language: 'en',
    location: {
      address: '100 Feet Road, Near 12th Main Junction, Indiranagar',
      ward: 'Ward 89 - Jogupalya',
      zone: 'East Zone',
      lat: 12.9785,
      lng: 77.6409,
      nearbyLandmark: '12th Main Crossing',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    supportersCount: 35,
    rootCauseClusterId: 'cluster-rc-01',
    isHotspot: true,
    createdAt: '2026-10-28T14:00:00Z',
    updatedAt: '2026-10-28T14:00:00Z',
    timeline: [
      {
        id: 'tl-1401',
        status: 'Submitted',
        timestamp: '2026-10-28T14:00:00Z',
        actorName: 'Anonymous Citizen',
        actorRole: 'citizen',
      },
    ],
  },
  {
    id: 'CIV-2026-1015',
    ticketNumber: 'CIV-2026-1015',
    title: 'Open transformer fence broken with wild shrubs touching bushings',
    description: 'Street-level distribution transformer enclosure door is unlocked and rusted off hinges. Small children play cricket 5 meters away.',
    category: 'Public Hazards & Safety',
    severity: 'Emergency',
    priorityScore: 92,
    status: 'Assigned',
    citizenId: 'cit-015',
    citizenName: 'Farhan Akhtar',
    citizenPhone: '+91 98450 33441',
    isAnonymous: false,
    language: 'hi',
    location: {
      address: 'Near Shivajinagar Bus Terminus, Russell Market Road',
      ward: 'Ward 92 - Shivajinagar',
      zone: 'Central Zone',
      lat: 12.9856,
      lng: 77.6055,
      nearbyLandmark: 'Russell Market South Gate',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    supportersCount: 52,
    assignedDepartmentId: 'dept-electric',
    assignedDepartmentName: 'Electricity Distribution & Public Lighting',
    targetResolutionDate: '2026-10-30',
    createdAt: '2026-10-29T12:00:00Z',
    updatedAt: '2026-10-29T13:30:00Z',
    timeline: [
      {
        id: 'tl-1501',
        status: 'Submitted',
        timestamp: '2026-10-29T12:00:00Z',
        actorName: 'Farhan Akhtar',
        actorRole: 'citizen',
      },
      {
        id: 'tl-1502',
        status: 'Assigned',
        timestamp: '2026-10-29T13:30:00Z',
        actorName: 'BESCOM Central Sub-division',
        actorRole: 'official',
        notes: 'Priority fencing squad instructed to install chainlink mesh and padlocks.',
      },
    ],
  },
  {
    id: 'CIV-2026-1016',
    ticketNumber: 'CIV-2026-1016',
    title: 'Restored & Repaired: Rebuilt concrete speed breaker and painted zebra stripes',
    description: 'Dangerous unmarked asphalt hump without reflective paint was causing frequent two-wheeler wipeouts at night.',
    category: 'Road & Infrastructure',
    severity: 'Medium',
    priorityScore: 58,
    status: 'Resolved',
    citizenId: 'cit-016',
    citizenName: 'Latha Nambiar',
    citizenPhone: '+91 97410 44556',
    isAnonymous: false,
    language: 'en',
    location: {
      address: '15th Main, RMV 2nd Stage, Dollars Colony',
      ward: 'Ward 35 - Aramane Nagar',
      zone: 'North Zone',
      lat: 13.0315,
      lng: 77.5752,
      nearbyLandmark: 'Dollars Colony Club',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    supportersCount: 19,
    assignedDepartmentId: 'dept-roads',
    assignedDepartmentName: 'Road Infrastructure & Traffic Engineering',
    assignedTeamId: 'team-rite-01',
    assignedTeamName: 'Rapid Asphalt Patch Squad Alpha',
    createdAt: '2026-10-21T11:00:00Z',
    updatedAt: '2026-10-24T17:00:00Z',
    timeline: [
      {
        id: 'tl-1601',
        status: 'Submitted',
        timestamp: '2026-10-21T11:00:00Z',
        actorName: 'Latha Nambiar',
        actorRole: 'citizen',
      },
      {
        id: 'tl-1602',
        status: 'Resolved',
        timestamp: '2026-10-24T17:00:00Z',
        actorName: 'Supervisor Somesh Rao',
        actorRole: 'supervisor',
        notes: 'Speed breaker modified to IRC standards with thermoplastic reflective yellow chevrons.',
        evidenceImageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
      },
    ],
    resolutionEvidence: {
      resolvedAt: '2026-10-24T17:00:00Z',
      resolvedByTeam: 'Rapid Asphalt Patch Squad Alpha',
      completionSummary: 'Milled uneven asphalt, shaped IRC compliant trapezoidal speed calming table, applied retro-reflective thermoplastic yellow markings with glass beads.',
      afterImageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
      materialsUsed: ['IRC Bitumen mix 4 tons', 'Thermoplastic reflective paint 25kg'],
      crewHoursSpent: 12,
      costIncurred: 24000,
      verifiedByOfficer: 'Dr. Ramesh Narayan, Chief Engineer',
    },
    resolutionFeedback: {
      id: 'fb-1601',
      citizenId: 'cit-016',
      citizenName: 'Latha Nambiar',
      isSatisfied: true,
      rating: 5,
      feedbackText: 'Excellent work. Highly visible at night and gentle on vehicles.',
      reopenRequested: false,
      submittedAt: '2026-10-25T11:20:00Z',
    },
  },
  {
    id: 'CIV-2026-1017',
    ticketNumber: 'CIV-2026-1017',
    title: 'Disputed: SWM auto-tipper skipping organic waste collection for 4 days',
    description: 'The door-to-door collection vehicle has not visited 3rd Cross for 4 consecutive days. Wet waste is decomposing and stray dogs are tearing bags.',
    category: 'Solid Waste Management',
    severity: 'Medium',
    priorityScore: 64,
    status: 'Reopened',
    citizenId: 'cit-017',
    citizenName: 'Vandana Shenoy',
    citizenPhone: '+91 99801 66778',
    isAnonymous: false,
    language: 'kn',
    location: {
      address: '3rd Cross, Basavanagudi Near Gandhi Bazaar',
      ward: 'Ward 154 - Basavanagudi',
      zone: 'South Zone',
      lat: 12.9421,
      lng: 77.5741,
      nearbyLandmark: 'Gandhi Bazaar Circle',
    },
    beforeImageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    supportersCount: 29,
    assignedDepartmentId: 'dept-waste',
    assignedDepartmentName: 'Solid Waste Management Corporation',
    isEscalated: true,
    escalationReason: 'Citizen disputed ticket marked resolved without vehicle physically entering 3rd Cross.',
    createdAt: '2026-10-24T08:30:00Z',
    updatedAt: '2026-10-27T18:00:00Z',
    timeline: [
      {
        id: 'tl-1701',
        status: 'Submitted',
        timestamp: '2026-10-24T08:30:00Z',
        actorName: 'Vandana Shenoy',
        actorRole: 'citizen',
      },
      {
        id: 'tl-1702',
        status: 'Resolved',
        timestamp: '2026-10-26T16:00:00Z',
        actorName: 'Supervisor Patil',
        actorRole: 'supervisor',
        notes: 'Tipper #KA-04-E-8891 routed to area.',
      },
      {
        id: 'tl-1703',
        status: 'Reopened',
        timestamp: '2026-10-27T18:00:00Z',
        actorName: 'Vandana Shenoy',
        actorRole: 'citizen',
        notes: 'Dispute filed: "The tipper driver only stopped on the main road and never came into our lane. Our bins are still overflowing!"',
      },
    ],
    resolutionFeedback: {
      id: 'fb-1701',
      citizenId: 'cit-017',
      citizenName: 'Vandana Shenoy',
      isSatisfied: false,
      rating: 1,
      feedbackText: 'Driver claimed route was finished, but GPS log clearly shows he turned back before our cross.',
      reopenRequested: true,
      reopenReason: 'Service not rendered on 3rd Cross lane.',
      submittedAt: '2026-10-27T18:00:00Z',
    },
  },
  {
    id: 'CIV-2026-1018',
    ticketNumber: 'CIV-2026-1018',
    title: 'Water pressure drops to zero during peak morning supply in HSR Sector 2',
    description: 'Since pipeline works commenced last week, residential tap flow is reduced to a trickle between 6 AM and 9 AM.',
    category: 'Water Supply & Sewage',
    severity: 'Medium',
    priorityScore: 59,
    status: 'Under Review',
    citizenId: 'cit-018',
    citizenName: 'Anand Raghavan',
    citizenPhone: '+91 98450 55119',
    isAnonymous: false,
    language: 'en',
    location: {
      address: '24th Main, HSR Layout Sector 2',
      ward: 'Ward 174 - HSR Layout',
      zone: 'South-East Zone',
      lat: 12.9118,
      lng: 77.6472,
      nearbyLandmark: 'Near HSR Police Station',
    },
    supportersCount: 21,
    assignedDepartmentId: 'dept-water',
    assignedDepartmentName: 'Water Supply & Sewerage Board',
    createdAt: '2026-10-29T08:00:00Z',
    updatedAt: '2026-10-29T08:15:00Z',
    timeline: [
      {
        id: 'tl-1801',
        status: 'Submitted',
        timestamp: '2026-10-29T08:00:00Z',
        actorName: 'Anand Raghavan',
        actorRole: 'citizen',
      },
    ],
  },
];

const STORAGE_KEY_COMPLAINTS = 'civicai_complaints_v1';
const STORAGE_KEY_ALERTS = 'civicai_alerts_v1';
const STORAGE_KEY_CLUSTERS = 'civicai_clusters_v1';
const STORAGE_KEY_DRAFT = 'civicai_complaint_offline_draft';

class DataService {
  private complaints: Complaint[] = [];
  private departments: Department[] = [...INITIAL_DEPARTMENTS];
  private teams: MaintenanceTeam[] = [...INITIAL_TEAMS];
  private clusters: RootCauseCluster[] = [...INITIAL_ROOT_CAUSE_CLUSTERS];
  private alerts: PublicHazardAlert[] = [...INITIAL_PUBLIC_HAZARDS];
  private hotspots: HotspotInsight[] = [...INITIAL_HOTSPOTS];

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    if (typeof window === 'undefined') {
      this.complaints = [...INITIAL_COMPLAINTS];
      return;
    }

    try {
      const storedComplaints = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
      if (storedComplaints) {
        this.complaints = JSON.parse(storedComplaints);
      } else {
        this.complaints = [...INITIAL_COMPLAINTS];
        this.saveComplaintsToStorage();
      }

      const storedAlerts = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (storedAlerts) {
        this.alerts = JSON.parse(storedAlerts);
      }

      const storedClusters = localStorage.getItem(STORAGE_KEY_CLUSTERS);
      if (storedClusters) {
        this.clusters = JSON.parse(storedClusters);
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using in-memory dataset:', e);
      this.complaints = [...INITIAL_COMPLAINTS];
    }
  }

  private saveComplaintsToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(this.complaints));
    } catch (e) {
      console.warn('Failed to save complaints to localStorage:', e);
    }
  }

  private saveAlertsToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(this.alerts));
    } catch (e) {
      console.warn('Failed to save alerts to localStorage:', e);
    }
  }

  // Complaints API
  public getComplaints(): Complaint[] {
    return [...this.complaints];
  }

  public getComplaintById(id: string): Complaint | undefined {
    return this.complaints.find((c) => c.id === id || c.ticketNumber === id);
  }

  public createComplaint(newComplaintData: Partial<Complaint>): Complaint {
    const nextTicketNum = `CIV-2026-${1000 + this.complaints.length + 1}`;
    const now = new Date().toISOString();

    const complaint: Complaint = {
      id: nextTicketNum,
      ticketNumber: nextTicketNum,
      title: newComplaintData.title || 'Civic Infrastructure Concern',
      description: newComplaintData.description || '',
      category: newComplaintData.category || 'Road & Infrastructure',
      severity: newComplaintData.severity || 'Medium',
      priorityScore: newComplaintData.priorityScore || 50,
      status: 'Submitted',
      citizenId: newComplaintData.citizenId || 'cit-current-user',
      citizenName: newComplaintData.isAnonymous ? 'Anonymous Citizen' : (newComplaintData.citizenName || 'Civic Citizen'),
      citizenPhone: newComplaintData.isAnonymous ? undefined : newComplaintData.citizenPhone,
      isAnonymous: Boolean(newComplaintData.isAnonymous),
      language: newComplaintData.language || 'en',
      location: newComplaintData.location || {
        address: 'Bangalore Metropolitan Region',
        ward: 'Ward 89 - Jogupalya',
        zone: 'East Zone',
        lat: 12.9716,
        lng: 77.5946,
      },
      beforeImageUrl: newComplaintData.beforeImageUrl,
      audioVoiceNoteUrl: newComplaintData.audioVoiceNoteUrl,
      supportersCount: 1,
      supportedByCurrentUser: true,
      aiAnalysis: newComplaintData.aiAnalysis,
      isDuplicate: newComplaintData.isDuplicate,
      duplicateOfId: newComplaintData.duplicateOfId,
      rootCauseClusterId: newComplaintData.rootCauseClusterId,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'Submitted',
          timestamp: now,
          actorName: newComplaintData.isAnonymous ? 'Anonymous Citizen' : (newComplaintData.citizenName || 'Citizen'),
          actorRole: 'citizen',
          notes: 'Submitted via CivicAI Citizen Portal.',
        },
      ],
    };

    this.complaints.unshift(complaint);
    this.saveComplaintsToStorage();
    return complaint;
  }

  public updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    actorName: string,
    actorRole: UserRole | 'System AI',
    notes?: string,
    evidenceImageUrl?: string
  ): Complaint | null {
    const idx = this.complaints.findIndex((c) => c.id === id || c.ticketNumber === id);
    if (idx === -1) return null;

    const current = this.complaints[idx];
    const now = new Date().toISOString();

    const timelineEntry = {
      id: `tl-${Date.now()}`,
      status,
      timestamp: now,
      actorName,
      actorRole,
      notes,
      evidenceImageUrl,
    };

    const updated: Complaint = {
      ...current,
      status,
      updatedAt: now,
      timeline: [timelineEntry, ...current.timeline],
    };

    this.complaints[idx] = updated;
    this.saveComplaintsToStorage();
    return updated;
  }

  public assignComplaint(
    id: string,
    departmentId: string,
    teamId?: string,
    targetDate?: string,
    officerName = 'Dispatch Officer'
  ): Complaint | null {
    const idx = this.complaints.findIndex((c) => c.id === id || c.ticketNumber === id);
    if (idx === -1) return null;

    const dept = this.departments.find((d) => d.id === departmentId);
    const team = this.teams.find((t) => t.id === teamId);
    const now = new Date().toISOString();

    const updated: Complaint = {
      ...this.complaints[idx],
      assignedDepartmentId: departmentId,
      assignedDepartmentName: dept ? dept.name : departmentId,
      assignedTeamId: teamId,
      assignedTeamName: team ? team.name : undefined,
      targetResolutionDate: targetDate,
      status: 'Assigned',
      updatedAt: now,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'Assigned',
          timestamp: now,
          actorName: officerName,
          actorRole: 'official',
          notes: `Assigned to ${dept?.name || 'Department'} ${team ? `(${team.name})` : ''}. Target completion: ${targetDate || 'Standard SLA'}.`,
        },
        ...this.complaints[idx].timeline,
      ],
    };

    this.complaints[idx] = updated;
    this.saveComplaintsToStorage();
    return updated;
  }

  public submitResolution(id: string, evidence: ResolutionEvidence): Complaint | null {
    const idx = this.complaints.findIndex((c) => c.id === id || c.ticketNumber === id);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const updated: Complaint = {
      ...this.complaints[idx],
      status: 'Resolved',
      updatedAt: now,
      resolutionEvidence: evidence,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'Resolved',
          timestamp: now,
          actorName: evidence.resolvedByTeam,
          actorRole: 'supervisor',
          notes: evidence.completionSummary,
          evidenceImageUrl: evidence.afterImageUrl,
        },
        ...this.complaints[idx].timeline,
      ],
    };

    this.complaints[idx] = updated;
    this.saveComplaintsToStorage();
    return updated;
  }

  public submitCitizenFeedback(id: string, feedback: ResolutionFeedback): Complaint | null {
    const idx = this.complaints.findIndex((c) => c.id === id || c.ticketNumber === id);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    const current = this.complaints[idx];
    const newStatus: ComplaintStatus = feedback.reopenRequested ? 'Reopened' : current.status;

    const updated: Complaint = {
      ...current,
      status: newStatus,
      isEscalated: feedback.reopenRequested ? true : current.isEscalated,
      escalationReason: feedback.reopenRequested ? feedback.reopenReason : current.escalationReason,
      resolutionFeedback: feedback,
      updatedAt: now,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: newStatus,
          timestamp: now,
          actorName: feedback.citizenName,
          actorRole: 'citizen',
          notes: feedback.reopenRequested
            ? `Dispute Filed: ${feedback.reopenReason || feedback.feedbackText}`
            : `Resolution Confirmed with rating ${feedback.rating}/5: "${feedback.feedbackText}"`,
        },
        ...current.timeline,
      ],
    };

    this.complaints[idx] = updated;
    this.saveComplaintsToStorage();
    return updated;
  }

  public supportComplaint(id: string): { supportersCount: number; supportedByCurrentUser: boolean } {
    const complaint = this.complaints.find((c) => c.id === id || c.ticketNumber === id);
    if (!complaint) return { supportersCount: 0, supportedByCurrentUser: false };

    if (complaint.supportedByCurrentUser) {
      complaint.supportersCount = Math.max(0, complaint.supportersCount - 1);
      complaint.supportedByCurrentUser = false;
    } else {
      complaint.supportersCount += 1;
      complaint.supportedByCurrentUser = true;
    }

    this.saveComplaintsToStorage();
    return {
      supportersCount: complaint.supportersCount,
      supportedByCurrentUser: complaint.supportedByCurrentUser,
    };
  }

  public linkDuplicate(originalId: string, duplicateId: string, officerName = 'Lead Investigator'): boolean {
    const dup = this.complaints.find((c) => c.id === duplicateId || c.ticketNumber === duplicateId);
    if (!dup) return false;

    dup.isDuplicate = true;
    dup.duplicateOfId = originalId;
    dup.status = 'Assigned';
    dup.timeline.unshift({
      id: `tl-${Date.now()}`,
      status: 'Assigned',
      timestamp: new Date().toISOString(),
      actorName: officerName,
      actorRole: 'official',
      notes: `Linked as duplicate report of ticket ${originalId}. Consolidated under primary work order.`,
    });

    this.saveComplaintsToStorage();
    return true;
  }

  public escalateComplaint(id: string, reason: string, officer = 'Escalation Supervisor'): Complaint | null {
    const idx = this.complaints.findIndex((c) => c.id === id || c.ticketNumber === id);
    if (idx === -1) return null;

    const current = this.complaints[idx];
    const updated: Complaint = {
      ...current,
      isEscalated: true,
      escalationReason: reason,
      priorityScore: Math.min(100, current.priorityScore + 15),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: current.status,
          timestamp: new Date().toISOString(),
          actorName: officer,
          actorRole: 'official',
          notes: `SLA ESCALATION TRIGGERED: ${reason}. Priority escalated to ${Math.min(100, current.priorityScore + 15)}.`,
        },
        ...current.timeline,
      ],
    };

    this.complaints[idx] = updated;
    this.saveComplaintsToStorage();
    return updated;
  }

  // Meta & Master Data APIs
  public getDepartments(): Department[] {
    return [...this.departments];
  }

  public getMaintenanceTeams(departmentId?: string): MaintenanceTeam[] {
    if (!departmentId) return [...this.teams];
    return this.teams.filter((t) => t.departmentId === departmentId);
  }

  public getRootCauseClusters(): RootCauseCluster[] {
    return [...this.clusters];
  }

  public getPublicHazardAlerts(): PublicHazardAlert[] {
    return [...this.alerts];
  }

  public createHazardAlert(alert: Omit<PublicHazardAlert, 'id' | 'issuedAt' | 'active'>): PublicHazardAlert {
    const newAlert: PublicHazardAlert = {
      id: `hazard-${Date.now()}`,
      issuedAt: new Date().toISOString(),
      active: true,
      ...alert,
    };
    this.alerts.unshift(newAlert);
    this.saveAlertsToStorage();
    return newAlert;
  }

  public dismissHazardAlert(id: string): void {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.active = false;
      this.saveAlertsToStorage();
    }
  }

  public getHotspotInsights(): HotspotInsight[] {
    return [...this.hotspots];
  }

  // Offline Draft Support
  public saveOfflineDraft(draft: Partial<Complaint>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
    } catch (e) {
      console.warn('Failed to save offline draft', e);
    }
  }

  public getOfflineDraft(): Partial<Complaint> | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY_DRAFT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public clearOfflineDraft(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_DRAFT);
    } catch {}
  }
}

export const civicDataService = new DataService();
