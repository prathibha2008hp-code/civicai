import React, { useState } from 'react';
import {
  ShieldAlert,
  Wrench,
  Layers,
  MapPin,
  TrendingUp,
  Filter,
  Search,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building,
  UserCheck,
  ChevronRight,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import {
  Complaint,
  Department,
  MaintenanceTeam,
  RootCauseCluster,
  HotspotInsight,
  ComplaintStatus,
  ComplaintSeverity,
} from '../types/civic';
import { CivicMap } from './CivicMap';
import { aiService, DuplicateMatch } from '../services/aiService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AuthorityPortalProps {
  complaints: Complaint[];
  departments: Department[];
  teams: MaintenanceTeam[];
  clusters: RootCauseCluster[];
  hotspots: HotspotInsight[];
  onSelectComplaint: (complaint: Complaint) => void;
  onLinkDuplicate: (primaryId: string, duplicateId: string) => void;
  onOpenHazardModal: () => void;
}

export const AuthorityPortal: React.FC<AuthorityPortalProps> = ({
  complaints,
  departments,
  teams,
  clusters,
  hotspots,
  onSelectComplaint,
  onLinkDuplicate,
  onOpenHazardModal,
}) => {
  const [activeTab, setActiveTab] = useState<
    'queue' | 'duplicates' | 'root_causes' | 'hotspots' | 'departments'
  >('queue');

  // Filters for Queue
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'date'>('priority');

  // Root cause analysis trigger
  const [analyzingCluster, setAnalyzingCluster] = useState(false);
  const [activeClusterResult, setActiveClusterResult] = useState<any>(null);

  // Duplicate detection state
  const [scannedDuplicates, setScannedDuplicates] = useState<any[]>([
    {
      primaryId: 'CIV-2026-1001',
      duplicateId: 'CIV-2026-1002',
      primaryTitle: 'Severe crater pothole near Cambridge Public School gate',
      duplicateTitle: 'Huge road sinkhole forming by Cambridge school road',
      similarityScore: 0.94,
      rationale: 'Identical coordinates (12.9782 vs 12.9783) and spatial proximity (15m from school gate).',
      category: 'Road & Infrastructure',
      linked: true,
    },
    {
      primaryId: 'CIV-2026-1007',
      duplicateId: 'CIV-2026-1008',
      primaryTitle: 'Illegal commercial garbage dumping and open burning on vacant plot',
      duplicateTitle: 'Commercial kitchen waste dumped near Koramangala Sony World drain',
      similarityScore: 0.88,
      rationale: 'Commercial eatery blackspot spillover on Sony World junction.',
      category: 'Solid Waste Management',
      linked: false,
    },
  ]);

  // Telemetry KPIs
  const totalComplaints = complaints.length;
  const emergencyCount = complaints.filter((c) => c.severity === 'Emergency').length;
  const highCount = complaints.filter((c) => c.severity === 'High').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const escalatedCount = complaints.filter((c) => c.isEscalated).length;
  const avgResolutionDays = 3.2;

  // Filter queue
  const filteredQueue = complaints
    .filter((c) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchTicket = c.ticketNumber.toLowerCase().includes(q);
        const matchLoc = c.location.address.toLowerCase().includes(q);
        if (!matchTitle && !matchTicket && !matchLoc) return false;
      }
      if (selectedDeptFilter !== 'all' && c.assignedDepartmentId !== selectedDeptFilter) {
        return false;
      }
      if (selectedSeverityFilter !== 'all' && c.severity !== selectedSeverityFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'all' && c.status !== selectedStatusFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priorityScore - a.priorityScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Chart data for Department Budgets & Resolution
  const deptChartData = departments.map((d) => ({
    name: d.code,
    fullName: d.name,
    budgetSpentLakhs: Number((d.spentBudget / 100000).toFixed(1)),
    budgetRemainingLakhs: Number(((d.currentQuarterBudget - d.spentBudget) / 100000).toFixed(1)),
    active: d.activeComplaints,
    resolved: d.resolvedComplaints,
    slaBreach: d.slaBreachRate,
  }));

  const categoryDistribution = [
    { name: 'Roads & Pavements', value: 14, color: '#0F172A' },
    { name: 'Water & Sewage', value: 10, color: '#0284C7' },
    { name: 'Solid Waste', value: 8, color: '#059669' },
    { name: 'Electricity', value: 5, color: '#EAB308' },
    { name: 'Drainage & Floods', value: 7, color: '#6366F1' },
  ];

  const handleRunClusterAI = async (cluster: RootCauseCluster) => {
    setAnalyzingCluster(true);
    try {
      const clusterComplaints = complaints.filter((c) =>
        cluster.complaintIds.includes(c.ticketNumber || c.id)
      );
      const res = await aiService.analyzeRootCauses(clusterComplaints, cluster.affectedWard);
      setActiveClusterResult(res);
    } finally {
      setAnalyzingCluster(false);
    }
  };

  const handleMergeDuplicate = (item: any) => {
    onLinkDuplicate(item.primaryId, item.duplicateId);
    setScannedDuplicates((prev) =>
      prev.map((dup) =>
        dup.duplicateId === item.duplicateId ? { ...dup, linked: true } : dup
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Telemetry Console Bar */}
      <div className="bg-[#0F172A] rounded-xl p-6 text-white border border-[#1E293B] shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-mono font-semibold uppercase text-emerald-400 tracking-wider">
                Metropolitan Emergency & Infrastructure Dispatch Console
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-white mt-1">
              Municipal Command Authority Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated AI triage, root cause clustering, department dispatching, and resolution auditing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenHazardModal}
              className="px-4 py-2 bg-[#DC2626] hover:bg-rose-700 text-white rounded text-xs font-semibold inline-flex items-center gap-2 shadow-md transition"
            >
              <ShieldAlert className="w-4 h-4" />
              Broadcast Emergency Advisory
            </button>
          </div>
        </div>

        {/* 5 KPI Metric Tiles (Stitch Design: display-mobile, tabular-nums) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6">
          <div className="bg-[#1E293B] border border-slate-700/60 rounded-lg p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Ingested
            </span>
            <div className="font-heading font-bold text-2xl text-white mt-1 tabular-nums">
              {totalComplaints}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">98.4% AI Categorized</span>
          </div>

          <div className="bg-[#1E293B] border border-slate-700/60 rounded-lg p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
              Critical Emergencies
            </span>
            <div className="font-heading font-bold text-2xl text-rose-400 mt-1 tabular-nums">
              {emergencyCount}
            </div>
            <span className="text-[11px] text-slate-400">Score ≥ 90/100</span>
          </div>

          <div className="bg-[#1E293B] border border-slate-700/60 rounded-lg p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              High Priority Dispatches
            </span>
            <div className="font-heading font-bold text-2xl text-amber-300 mt-1 tabular-nums">
              {highCount}
            </div>
            <span className="text-[11px] text-slate-400">Score 75-89/100</span>
          </div>

          <div className="bg-[#1E293B] border border-slate-700/60 rounded-lg p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
              Resolved & Verified
            </span>
            <div className="font-heading font-bold text-2xl text-emerald-400 mt-1 tabular-nums">
              {resolvedCount}
            </div>
            <span className="text-[11px] text-slate-400">Avg {avgResolutionDays} days SLA</span>
          </div>

          <div className="bg-[#1E293B] border border-slate-700/60 rounded-lg p-3.5 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
              SLA Overdue / Escalations
            </span>
            <div className="font-heading font-bold text-2xl text-purple-300 mt-1 tabular-nums">
              {escalatedCount}
            </div>
            <span className="text-[11px] text-rose-400 font-semibold">Immediate Review Needed</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-1 rounded-lg shadow-sm text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 rounded transition inline-flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-[#0F172A] text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Priority Triage Queue ({filteredQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('duplicates')}
          className={`px-4 py-2.5 rounded transition inline-flex items-center gap-2 ${
            activeTab === 'duplicates'
              ? 'bg-[#0F172A] text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>AI Duplicate Detector ({scannedDuplicates.filter((d) => !d.linked).length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('root_causes')}
          className={`px-4 py-2.5 rounded transition inline-flex items-center gap-2 ${
            activeTab === 'root_causes'
              ? 'bg-[#0F172A] text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Root Cause Clusters ({clusters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hotspots')}
          className={`px-4 py-2.5 rounded transition inline-flex items-center gap-2 ${
            activeTab === 'hotspots'
              ? 'bg-[#0F172A] text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-rose-600" />
          <span>GIS Hotspot Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2.5 rounded transition inline-flex items-center gap-2 ${
            activeTab === 'departments'
              ? 'bg-[#0F172A] text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-[#059669]" />
          <span>Department Performance & Budgets</span>
        </button>
      </div>

      {/* TAB 1: PRIORITY DISPATCH QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Queue Filters */}
          <div className="bg-white p-4 rounded-lg border border-[#CBD5E1] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket, title, ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded border border-slate-300 bg-white"
              />
            </div>

            <div>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedSeverityFilter}
                onChange={(e) => setSelectedSeverityFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white"
              >
                <option value="all">All Severity Tiers</option>
                <option value="Emergency">Emergency Only (90+)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Reopened">Reopened</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white font-semibold"
              >
                <option value="priority">Sort: Priority Score (Desc)</option>
                <option value="date">Sort: Most Recent First</option>
              </select>
            </div>
          </div>

          {/* Tabular Manifest (Stitch Design: 48px rows, header band #F8FAFC, label-sm tracking) */}
          <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Issue Description & Location</th>
                    <th className="py-3 px-4">Department & Team</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Community Risk</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F8FAFC] transition cursor-pointer"
                      onClick={() => onSelectComplaint(item)}
                    >
                      {/* Priority Score Cell */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                            item.severity === 'Emergency'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : item.severity === 'High'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.priorityScore}
                        </span>
                      </td>

                      {/* Ticket Number */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {item.ticketNumber}
                        {item.isEscalated && (
                          <span className="block text-[9px] font-bold text-rose-600 uppercase">
                            Escalated
                          </span>
                        )}
                      </td>

                      {/* Title & Location */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-heading font-semibold text-[#0F172A] truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          📍 {item.location.address}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {item.assignedDepartmentName || 'Unassigned'}
                        </span>
                        {item.assignedTeamName && (
                          <span className="block text-[11px] text-slate-500">
                            Crew: {item.assignedTeamName}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            item.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'Reopened'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Community Risk */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {item.aiAnalysis?.communityImpact?.transitVulnerability ? (
                          <span className="text-[11px] font-semibold text-rose-700">
                            {item.aiAnalysis.communityImpact.transitVulnerability} Transit Risk
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Standard</span>
                        )}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectComplaint(item);
                          }}
                          className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI DUPLICATE DETECTOR */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-sm text-amber-950">
                  Spatial-Semantic Duplicate Consolidation Engine
                </h3>
                <p className="text-xs text-amber-800">
                  Gemini compares citizen submissions, geospatial coordinates, and category metadata to prevent duplicate field work orders.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {scannedDuplicates.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#CBD5E1] rounded-lg p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {(item.similarityScore * 100).toFixed(0)}% Semantic Match
                    </span>
                  </div>

                  {item.linked ? (
                    <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Consolidated under Master Ticket
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMergeDuplicate(item)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-[#059669] hover:bg-emerald-700 text-white rounded shadow-sm inline-flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Merge as Duplicate
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Primary Item */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Primary Master Work Order ({item.primaryId})
                    </span>
                    <h4 className="font-semibold text-slate-900">{item.primaryTitle}</h4>
                  </div>

                  {/* Duplicate Candidate */}
                  <div className="bg-amber-50/50 border border-amber-200 rounded p-3 space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase">
                      Duplicate Report Candidate ({item.duplicateId})
                    </span>
                    <h4 className="font-semibold text-slate-900">{item.duplicateTitle}</h4>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong>AI Diagnostic Rationale:</strong> {item.rationale}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ROOT CAUSE CLUSTERS */}
      {activeTab === 'root_causes' && (
        <div className="space-y-5">
          <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-700 flex-shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-sm text-purple-950">
                  Interconnected Root Cause Diagnostics
                </h3>
                <p className="text-xs text-purple-800">
                  Identifies systemic underground infrastructure failures manifesting across multiple distinct citizen reports.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="bg-white border border-[#CBD5E1] rounded-lg p-5 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {cluster.category}
                    </span>
                    <h4 className="font-heading font-bold text-base text-[#0F172A] mt-1.5">
                      {cluster.title}
                    </h4>
                    <span className="text-xs text-slate-500">📍 {cluster.affectedWard}</span>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                    {cluster.severity}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                      Systemic Root Cause Identified
                    </span>
                    <p className="text-slate-800 font-medium">{cluster.identifiedRootCause}</p>
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded border border-emerald-200">
                    <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] block mb-1">
                      Recommended Engineering Remediation
                    </span>
                    <p className="text-emerald-950">{cluster.recommendedEngineeringAction}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Linked Reports: <strong>{cluster.complaintIds.join(', ')}</strong>
                  </span>
                  <button
                    onClick={() => handleRunClusterAI(cluster)}
                    disabled={analyzingCluster}
                    className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded font-semibold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${analyzingCluster ? 'animate-spin' : ''}`} />
                    Run Deep Diagnostic
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeClusterResult && (
            <div className="bg-white border-2 border-purple-300 rounded-lg p-5 shadow-md space-y-3 animate-in fade-in">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Live Deep Root Cause Analysis Output
              </span>
              <h4 className="font-heading font-bold text-base text-slate-900">
                {activeClusterResult.title}
              </h4>
              <p className="text-xs text-slate-700">{activeClusterResult.identifiedRootCause}</p>
              <div className="p-3 bg-slate-50 rounded text-xs text-slate-800">
                <strong>Preventive Mitigation:</strong> {activeClusterResult.preventiveMitigation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GIS HOTSPOT INTELLIGENCE */}
      {activeTab === 'hotspots' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-[#CBD5E1] p-4 shadow-sm">
            <h3 className="font-heading font-bold text-base text-[#0F172A]">
              Chronic Geographic Hotspot Clusters
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Red dashed perimeters denote spatial recurrence zones where failure rates exceed 3x normal ward baseline.
            </p>
            <CivicMap
              complaints={complaints}
              hotspots={hotspots}
              onSelectComplaint={(c) => onSelectComplaint(c)}
              height="400px"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotspots.map((hs) => (
              <div
                key={hs.id}
                className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-700">{hs.zone}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hs.riskTrend === 'Increasing'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Trend: {hs.riskTrend}
                  </span>
                </div>

                <h4 className="font-heading font-bold text-sm text-[#0F172A]">{hs.wardName}</h4>
                <div className="text-xs text-slate-600">
                  <span>Active Incident Density: </span>
                  <strong className="text-rose-700">{hs.complaintDensity} open issues</strong>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">
                    Recurring Failure Patterns:
                  </span>
                  <ul className="list-disc pl-4 text-slate-700">
                    {hs.chronicIssues.map((ci, i) => (
                      <li key={i}>{ci}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 bg-slate-50 p-2.5 rounded text-[11px] text-slate-700">
                  <strong className="text-[#059669]">AI Preventive Maintenance:</strong>{' '}
                  {hs.aiPreventiveRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DEPARTMENT PERFORMANCE & BUDGETS */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Utilization Chart */}
            <div className="bg-white p-5 rounded-lg border border-[#CBD5E1] shadow-sm">
              <h3 className="font-heading font-bold text-sm text-[#0F172A] mb-1">
                Quarterly Maintenance Budget Utilization (₹ Lakhs)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of funds spent vs remaining allocation per municipal department.
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="budgetSpentLakhs" name="Spent (₹ Lakhs)" fill="#0F172A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="budgetRemainingLakhs" name="Remaining (₹ Lakhs)" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white p-5 rounded-lg border border-[#CBD5E1] shadow-sm">
              <h3 className="font-heading font-bold text-sm text-[#0F172A] mb-1">
                Active Civic Failure Distribution
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Proportion of ongoing municipal complaints across core utility categories.
              </p>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Department Table */}
          <div className="bg-white rounded-lg border border-[#CBD5E1] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h4 className="font-heading font-bold text-sm text-[#0F172A]">
                Municipal Agency Directory & Service Level Agreements (SLA)
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4">Agency</th>
                    <th className="py-3 px-4">Executive Leadership</th>
                    <th className="py-3 px-4">Active Tickets</th>
                    <th className="py-3 px-4">Resolved</th>
                    <th className="py-3 px-4">Avg SLA Turnaround</th>
                    <th className="py-3 px-4">Budget Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#0F172A]">
                        {dept.name} ({dept.code})
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {dept.headName}
                      </td>
                      <td className="py-3 px-4 font-semibold text-rose-700">
                        {dept.activeComplaints}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">
                        {dept.resolvedComplaints}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {dept.avgResolutionDays} days
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#059669] h-full"
                            style={{
                              width: `${Math.round((dept.spentBudget / dept.currentQuarterBudget) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {Math.round((dept.spentBudget / dept.currentQuarterBudget) * 100)}% spent
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
