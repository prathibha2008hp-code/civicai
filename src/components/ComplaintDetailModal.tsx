import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ThumbsUp,
  FileText,
  Wrench,
  RotateCcw,
  Check,
  Send,
  Building,
  UserCheck,
  Shield,
  Layers,
  HelpCircle,
  ExternalLink,
  Camera,
} from 'lucide-react';
import {
  Complaint,
  ComplaintStatus,
  Department,
  MaintenanceTeam,
  ResolutionEvidence,
  ResolutionFeedback,
  UserRole,
} from '../types/civic';
import { aiService } from '../services/aiService';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  departments: Department[];
  teams: MaintenanceTeam[];
  onStatusChange: (
    id: string,
    status: ComplaintStatus,
    notes?: string,
    evidenceImageUrl?: string
  ) => void;
  onAssign: (id: string, deptId: string, teamId?: string, targetDate?: string) => void;
  onSubmitResolution: (id: string, evidence: ResolutionEvidence) => void;
  onSubmitFeedback: (id: string, feedback: ResolutionFeedback) => void;
  onSupport: (id: string) => void;
  onEscalate: (id: string, reason: string) => void;
  onLinkDuplicate?: (primaryId: string, duplicateId: string) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  userRole,
  departments,
  teams,
  onStatusChange,
  onAssign,
  onSubmitResolution,
  onSubmitFeedback,
  onSupport,
  onEscalate,
}) => {
  if (!isOpen || !complaint) return null;

  // Tabs inside modal
  const [activeTab, setActiveTab] = useState<'overview' | 'ai_insights' | 'timeline' | 'resolution' | 'action_brief'>('overview');

  // Authority actions state
  const [selectedDept, setSelectedDept] = useState(complaint.assignedDepartmentId || departments[0]?.id || '');
  const [selectedTeam, setSelectedTeam] = useState(complaint.assignedTeamId || '');
  const [targetDate, setTargetDate] = useState(complaint.targetResolutionDate || '');
  const [statusNote, setStatusNote] = useState('');
  const [nextStatus, setNextStatus] = useState<ComplaintStatus>(complaint.status);

  // Authority resolution evidence upload form
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
  const [completionSummary, setCompletionSummary] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState(
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80'
  );
  const [costIncurred, setCostIncurred] = useState('25000');
  const [crewHours, setCrewHours] = useState('14');

  // Citizen feedback & dispute state
  const [citizenRating, setCitizenRating] = useState(5);
  const [citizenFeedbackText, setCitizenFeedbackText] = useState('');
  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  // AI Action Brief generation state
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [actionBriefData, setActionBriefData] = useState<any>(null);

  // Escalation state
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationReason, setEscalationReason] = useState('Exceeded standard service level agreement timeline.');

  const handleGenerateActionBrief = async () => {
    setIsGeneratingBrief(true);
    try {
      const brief = await aiService.generateActionBrief(complaint);
      setActionBriefData(brief);
      setActiveTab('action_brief');
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(complaint.id, selectedDept, selectedTeam, targetDate);
    setStatusNote('Work order assigned to maintenance squad.');
  };

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onStatusChange(complaint.id, nextStatus, statusNote);
    setStatusNote('');
  };

  const handleResolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evidence: ResolutionEvidence = {
      resolvedAt: new Date().toISOString(),
      resolvedByTeam:
        teams.find((t) => t.id === selectedTeam)?.name || 'Municipal Rapid Response Unit',
      completionSummary,
      afterImageUrl,
      materialsUsed: ['Asphalt M25 binder', 'Reflective coating', 'Drainage grating'],
      crewHoursSpent: Number(crewHours) || 8,
      costIncurred: Number(costIncurred) || 20000,
      verifiedByOfficer: 'Field Superintendent',
    };
    onSubmitResolution(complaint.id, evidence);
    setIsSubmittingResolution(false);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedback: ResolutionFeedback = {
      id: `fb-${Date.now()}`,
      citizenId: complaint.citizenId,
      citizenName: complaint.citizenName,
      isSatisfied: !isDisputing,
      rating: isDisputing ? 1 : citizenRating,
      feedbackText: isDisputing ? disputeReason : citizenFeedbackText,
      reopenRequested: isDisputing,
      reopenReason: isDisputing ? disputeReason : undefined,
      submittedAt: new Date().toISOString(),
    };
    onSubmitFeedback(complaint.id, feedback);
    setIsDisputing(false);
  };

  const handleEscalationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEscalate(complaint.id, escalationReason);
    setIsEscalating(false);
  };

  const availableTeams = teams.filter((t) => !selectedDept || t.departmentId === selectedDept);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F172A]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded">
              {complaint.ticketNumber}
            </span>
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                complaint.status === 'Resolved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : complaint.status === 'In Progress'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : complaint.status === 'Reopened'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {complaint.status}
            </span>

            {complaint.isEscalated && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                SLA Escalated
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Evidence
          </button>
          <button
            onClick={() => setActiveTab('ai_insights')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'ai_insights'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            AI Intelligence & Impact
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'timeline'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Lifecycle Timeline ({complaint.timeline.length})
          </button>
          {complaint.resolutionEvidence && (
            <button
              onClick={() => setActiveTab('resolution')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'resolution'
                  ? 'border-[#059669] text-[#059669]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Resolution Verification
            </button>
          )}
          {actionBriefData && (
            <button
              onClick={() => setActiveTab('action_brief')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'action_brief'
                  ? 'border-[#059669] text-[#059669]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              AI Action Brief
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#0F172A]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Title & Priority Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#0F172A]">
                    {complaint.title}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                      {complaint.location.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Reported: {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                      Category: {complaint.category}
                    </span>
                  </div>
                </div>

                {/* Explainable Priority Score Tile */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center sm:min-w-[130px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Priority Score
                  </span>
                  <div className="font-heading font-bold text-2xl text-[#0F172A] mt-0.5 tabular-nums">
                    {complaint.priorityScore}
                    <span className="text-xs font-normal text-slate-400">/100</span>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      complaint.severity === 'Emergency'
                        ? 'bg-rose-100 text-rose-700'
                        : complaint.severity === 'High'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {complaint.severity} Tier
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Citizen Statement
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {complaint.description}
                </p>

                {/* Privacy Badge */}
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#059669]" />
                    <span>
                      Reporter:{' '}
                      <strong className="text-slate-800">
                        {complaint.isAnonymous
                          ? 'Anonymous Citizen'
                          : userRole === 'citizen'
                          ? complaint.citizenName
                          : complaint.citizenName}
                      </strong>
                    </span>
                  </div>
                  <span>Language: {complaint.language.toUpperCase()}</span>
                </div>
              </div>

              {/* Before Photo & Evidence */}
              {complaint.beforeImageUrl && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Photographic Proof (Submitted by Citizen)
                  </h4>
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 max-h-72 bg-slate-900 flex items-center justify-center">
                    <img
                      src={complaint.beforeImageUrl}
                      alt="Complaint initial condition"
                      className="w-full object-cover max-h-72"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded">
                      Geo-tagged Location: {complaint.location.lat.toFixed(4)},{' '}
                      {complaint.location.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              )}

              {/* Duplicate Linkage Alert */}
              {complaint.isDuplicate && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      This complaint has been identified as a <strong>duplicate report</strong>{' '}
                      consolidated under master ticket{' '}
                      <strong>{complaint.duplicateOfId || 'CIV-2026-1001'}</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* Citizen Engagement Bar */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ThumbsUp className="w-4 h-4 text-[#059669]" />
                  <span>
                    <strong className="text-slate-900 font-semibold">{complaint.supportersCount}</strong>{' '}
                    citizens have supported this issue
                  </span>
                </div>
                <button
                  onClick={() => onSupport(complaint.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                    complaint.supportedByCurrentUser
                      ? 'bg-[#059669] text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {complaint.supportedByCurrentUser ? 'Supported' : 'Support Issue'}
                </button>
              </div>

              {/* Authority Assignment & Status Controls (Visible to Officials & Admins) */}
              {(userRole === 'official' || userRole === 'supervisor' || userRole === 'admin') && (
                <div className="border border-[#CBD5E1] rounded-lg p-4 bg-slate-50/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#059669]" />
                      Municipal Authority Command Controls
                    </h4>
                    <button
                      onClick={handleGenerateActionBrief}
                      disabled={isGeneratingBrief}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#0F172A] hover:bg-slate-800 text-white px-3 py-1.5 rounded shadow-sm transition disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      {isGeneratingBrief ? 'Synthesizing with Gemini...' : 'Generate AI Action Brief'}
                    </button>
                  </div>

                  {/* Assignment Form */}
                  <form onSubmit={handleAssignSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Assign Department
                      </label>
                      <select
                        value={selectedDept}
                        onChange={(e) => {
                          setSelectedDept(e.target.value);
                          setSelectedTeam('');
                        }}
                        className="w-full text-xs px-2.5 py-2 rounded border border-slate-300 bg-white"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Maintenance Crew / Squad
                      </label>
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded border border-slate-300 bg-white"
                      >
                        <option value="">Select Maintenance Team</option>
                        {availableTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        SLA Target Resolution
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={targetDate}
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 rounded border border-slate-300 bg-white"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                        >
                          Dispatch
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Status Progression & Escalation */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <form onSubmit={handleStatusUpdate} className="flex items-center gap-2">
                      <select
                        value={nextStatus}
                        onChange={(e) => setNextStatus(e.target.value as ComplaintStatus)}
                        className="text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white font-medium"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Reopened">Reopened</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-semibold bg-[#0F172A] text-white rounded hover:bg-slate-800"
                      >
                        Update Status
                      </button>
                    </form>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsSubmittingResolution(!isSubmittingResolution)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Upload Resolution Proof
                      </button>

                      <button
                        onClick={() => setIsEscalating(!isEscalating)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-300 rounded hover:bg-rose-100"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Trigger Escalation
                      </button>
                    </div>
                  </div>

                  {/* Upload Resolution Form Drawer */}
                  {isSubmittingResolution && (
                    <form
                      onSubmit={handleResolutionSubmit}
                      className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 space-y-3 mt-3"
                    >
                      <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Submit Official Repair Resolution Evidence
                      </h5>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Completion Engineering Summary
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={completionSummary}
                          onChange={(e) => setCompletionSummary(e.target.value)}
                          placeholder="Detail materials applied, engineering compaction standard, and tests performed..."
                          className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Post-Repair "After" Image URL
                          </label>
                          <input
                            type="url"
                            required
                            value={afterImageUrl}
                            onChange={(e) => setAfterImageUrl(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Cost Incurred (₹ INR)
                          </label>
                          <input
                            type="number"
                            value={costIncurred}
                            onChange={(e) => setCostIncurred(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSubmittingResolution(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-semibold bg-[#059669] hover:bg-emerald-700 text-white rounded shadow"
                        >
                          Confirm & Mark Resolved
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Escalation Drawer */}
                  {isEscalating && (
                    <form
                      onSubmit={handleEscalationSubmit}
                      className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-3 mt-3"
                    >
                      <h5 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                        Formal SLA Breach Escalation
                      </h5>
                      <textarea
                        rows={2}
                        value={escalationReason}
                        onChange={(e) => setEscalationReason(e.target.value)}
                        placeholder="Reason for escalating this ticket to higher command..."
                        className="w-full text-xs px-3 py-2 rounded border border-rose-300 bg-white"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEscalating(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-semibold bg-[#DC2626] text-white rounded hover:bg-rose-700 shadow"
                        >
                          Submit Escalation
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI INSIGHTS & EXPLAINABLE ANALYSIS */}
          {activeTab === 'ai_insights' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-heading font-bold text-emerald-900">
                      Gemini 3.8 Flash Civic Diagnostic Synthesis
                    </h4>
                    <p className="text-xs text-emerald-700">
                      Structured multidimensional evaluation of infrastructure failure risk and community impact.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                  AI Verified
                </span>
              </div>

              {complaint.aiAnalysis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Summary & Reasoning */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Autonomous Civic Summary
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {complaint.aiAnalysis.summary}
                    </p>

                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Reasoning & Methodology
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {complaint.aiAnalysis.reasoning}
                      </p>
                    </div>
                  </div>

                  {/* Public Risk Factors & Community Impact */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Identified Risk Factors
                    </span>
                    <ul className="space-y-1.5">
                      {complaint.aiAnalysis.riskFactors?.map((rf, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Community Impact Matrix
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="text-slate-400 block text-[10px]">Pop. Vulnerability</span>
                          <strong className="text-slate-800">
                            ~{complaint.aiAnalysis.communityImpact?.affectedPopulationEst || 2500} citizens
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="text-slate-400 block text-[10px]">Transit Threat</span>
                          <strong className="text-rose-700">
                            {complaint.aiAnalysis.communityImpact?.transitVulnerability || 'Moderate'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Department & Tactical Directives */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Recommended Jurisdictional Action
                      </span>
                      <span className="text-xs font-bold text-[#059669]">
                        Target Budget: {complaint.aiAnalysis.estimatedCostRange || '₹30,000 - ₹50,000'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#059669]" />
                      <span>{complaint.aiAnalysis.recommendedDepartment}</span>
                    </div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">
                      {complaint.aiAnalysis.recommendedAction}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  AI analysis record pending for this complaint.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STATUS TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Immutable Status History & Audit Log
              </span>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {complaint.timeline.map((entry) => (
                  <div key={entry.id} className="relative group">
                    <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#059669] shadow-sm"></span>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#0F172A]">
                          Status Changed to: <strong className="text-[#059669]">{entry.status}</strong>
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Actor: <strong className="text-slate-800">{entry.actorName}</strong> ({entry.actorRole})
                      </p>
                      {entry.notes && (
                        <p className="text-slate-700 pt-1 text-xs border-t border-slate-200/60 mt-1">
                          {entry.notes}
                        </p>
                      )}
                      {entry.evidenceImageUrl && (
                        <div className="pt-2">
                          <img
                            src={entry.evidenceImageUrl}
                            alt="Resolution Evidence"
                            className="w-40 h-24 object-cover rounded border border-slate-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RESOLUTION EVIDENCE & CITIZEN VERIFICATION */}
          {activeTab === 'resolution' && complaint.resolutionEvidence && (
            <div className="space-y-6">
              {/* Before and After Comparison Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Before & After Resolution Verification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                    <div className="px-3 py-2 bg-slate-200 font-bold text-[11px] uppercase tracking-wider text-slate-700">
                      Before Repair (Citizen Submission)
                    </div>
                    {complaint.beforeImageUrl ? (
                      <img
                        src={complaint.beforeImageUrl}
                        alt="Before repair"
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                        No before image provided
                      </div>
                    )}
                  </div>

                  {/* After */}
                  <div className="border border-emerald-300 rounded-lg overflow-hidden bg-emerald-50">
                    <div className="px-3 py-2 bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-between">
                      <span>After Repair (Official Completion)</span>
                      <Check className="w-4 h-4" />
                    </div>
                    <img
                      src={complaint.resolutionEvidence.afterImageUrl}
                      alt="After repair completed"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Completion Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider block">
                  Repair Manifest
                </span>
                <p className="text-slate-800 leading-relaxed">
                  {complaint.resolutionEvidence.completionSummary}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Resolved By</span>
                    <strong className="text-slate-800">{complaint.resolutionEvidence.resolvedByTeam}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Crew Hours</span>
                    <strong className="text-slate-800">{complaint.resolutionEvidence.crewHoursSpent || 12} hrs</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cost Incurred</span>
                    <strong className="text-slate-800">₹{complaint.resolutionEvidence.costIncurred?.toLocaleString() || '18,500'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Verified By</span>
                    <strong className="text-slate-800">{complaint.resolutionEvidence.verifiedByOfficer || 'Chief Engineer'}</strong>
                  </div>
                </div>
              </div>

              {/* Citizen Verification Section */}
              <div className="bg-white border-2 border-[#059669]/30 rounded-lg p-4 space-y-3">
                <h4 className="font-heading font-bold text-sm text-[#0F172A] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#059669]" />
                  Citizen Resolution Audit
                </h4>
                <p className="text-xs text-slate-600">
                  As the reporting citizen or local resident, inspect the evidence above. Please confirm that the problem is completely fixed, or dispute if the issue persists.
                </p>

                {complaint.resolutionFeedback ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        Citizen Feedback Submitted by {complaint.resolutionFeedback.citizenName}
                      </span>
                      <span className="font-bold text-amber-500">
                        {'★'.repeat(complaint.resolutionFeedback.rating)}
                        {'☆'.repeat(5 - complaint.resolutionFeedback.rating)}
                      </span>
                    </div>
                    <p className="text-slate-700 italic">
                      "{complaint.resolutionFeedback.feedbackText}"
                    </p>
                    {complaint.resolutionFeedback.reopenRequested && (
                      <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded mt-1">
                        Dispute Filed: Complaint Reopened
                      </span>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3 pt-2">
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-semibold text-slate-700">Audit Verdict:</label>
                      <button
                        type="button"
                        onClick={() => setIsDisputing(false)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${
                          !isDisputing
                            ? 'bg-[#059669] text-white shadow'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirm Satisfactory Resolution
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDisputing(true)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${
                          isDisputing
                            ? 'bg-[#DC2626] text-white shadow'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Dispute & Reopen Ticket
                      </button>
                    </div>

                    {!isDisputing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-700 font-medium">Resolution Rating:</span>
                          <div className="flex gap-1 text-amber-500 cursor-pointer">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setCitizenRating(star)}
                                className="text-lg hover:scale-110 transition"
                              >
                                {star <= citizenRating ? '★' : '☆'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={citizenFeedbackText}
                          onChange={(e) => setCitizenFeedbackText(e.target.value)}
                          placeholder="Add comments on repair quality (optional)..."
                          className="w-full text-xs px-3 py-2 rounded border border-slate-300"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-rose-700 mb-1">
                          Dispute Explanation (Why is the repair incomplete?)
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={disputeReason}
                          onChange={(e) => setDisputeReason(e.target.value)}
                          placeholder="Explain what was left unfixed or why problem still exists..."
                          className="w-full text-xs px-3 py-2 rounded border border-rose-300 bg-rose-50/50"
                        />
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className={`px-4 py-2 text-xs font-semibold text-white rounded shadow ${
                          isDisputing ? 'bg-[#DC2626] hover:bg-rose-700' : 'bg-[#059669] hover:bg-emerald-700'
                        }`}
                      >
                        {isDisputing ? 'Submit Dispute & Reopen' : 'Submit Verification Sign-off'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AI ACTION BRIEF */}
          {activeTab === 'action_brief' && actionBriefData && (
            <div className="space-y-4">
              <div className="bg-[#0F172A] text-white p-4 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Municipal Field Operational Order
                  </span>
                  <h3 className="font-heading font-bold text-base text-white">
                    {actionBriefData.title}
                  </h3>
                </div>
                <span className="text-xs bg-[#1E293B] border border-slate-700 px-2.5 py-1 rounded text-slate-300 font-mono">
                  {actionBriefData.estimatedManHours}
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{actionBriefData.priorityHeadline}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                  <span className="font-bold text-slate-600 uppercase tracking-wider block">
                    Tactical Directives for Field Crew
                  </span>
                  <ul className="space-y-2">
                    {actionBriefData.tacticalDirectives?.map((dir: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{dir}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Required Machinery & Equipment
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {actionBriefData.requiredMachinery?.map((m: string, i: number) => (
                        <span key={i} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded text-xs font-medium">
                          ⚙️ {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Safety Protocol
                    </span>
                    <p className="text-slate-700 text-xs">{actionBriefData.safetyProtocol}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Budget Ceiling
                    </span>
                    <strong className="text-emerald-700 text-sm">{actionBriefData.budgetCeiling}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>CivicAI Municipal Dispatch &bull; Phase 1 Enterprise Build</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#0F172A] text-white rounded hover:bg-slate-800 transition"
          >
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
};
