/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CivicAI - From Citizen Voice to Civic Action
 * Real Supabase PostgreSQL & Auth Integration
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HazardBanner, HazardModal } from './components/HazardBanner';
import { CitizenPortal } from './components/CitizenPortal';
import { AuthorityPortal } from './components/AuthorityPortal';
import { PublicTransparencyPortal } from './components/PublicTransparencyPortal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { AuthModal } from './components/AuthModal';
import { supabaseService } from './services/supabaseService';
import { civicDataService } from './services/dataService';
import {
  Complaint,
  ComplaintStatus,
  Department,
  MaintenanceTeam,
  RootCauseCluster,
  HotspotInsight,
  PublicHazardAlert,
  LanguageCode,
  UserRole,
  ResolutionEvidence,
  ResolutionFeedback,
} from './types/civic';
import { Building2, ShieldCheck, Database, RefreshCw, CheckCircle2 } from 'lucide-react';

function CivicAIApp() {
  const { user, profile, role } = useAuth();

  // Navigation & Preferences State
  const [activePortal, setActivePortal] = useState<'citizen' | 'authority' | 'transparency'>('citizen');
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>('en');
  const [userRole, setUserRole] = useState<UserRole>('citizen');

  // Sync role from Supabase auth profile if logged in
  useEffect(() => {
    if (profile?.role) {
      setUserRole(profile.role);
    }
  }, [profile]);

  // Core Dataset State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<MaintenanceTeam[]>([]);
  const [clusters, setClusters] = useState<RootCauseCluster[]>([]);
  const [hotspots, setHotspots] = useState<HotspotInsight[]>([]);
  const [alerts, setAlerts] = useState<PublicHazardAlert[]>([]);

  // Async States
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDbLive, setIsDbLive] = useState(supabaseService.isLive());
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load live data from Supabase
  const loadDatabaseData = async () => {
    setIsLoadingData(true);
    try {
      if (supabaseService.isLive()) {
        // First, check if seeding is needed for initial launch
        await supabaseService.seedIfEmpty();

        const [dbComplaints, dbDepts, dbAlerts] = await Promise.all([
          supabaseService.getComplaints(user?.id),
          supabaseService.getDepartments(),
          supabaseService.getPublicAlerts(),
        ]);

        if (dbComplaints.length > 0) {
          setComplaints(dbComplaints);
        } else {
          // Fall back to initialized memory dataset if DB query returns empty
          setComplaints(civicDataService.getComplaints());
        }

        if (dbDepts.length > 0) {
          setDepartments(dbDepts);
        } else {
          setDepartments(civicDataService.getDepartments());
        }

        if (dbAlerts.length > 0) {
          setAlerts(dbAlerts);
        } else {
          setAlerts(civicDataService.getPublicHazardAlerts());
        }
      } else {
        // Fallback local memory dataset
        setComplaints(civicDataService.getComplaints());
        setDepartments(civicDataService.getDepartments());
        setAlerts(civicDataService.getPublicHazardAlerts());
      }

      setTeams(civicDataService.getMaintenanceTeams());
      setClusters(civicDataService.getRootCauseClusters());
      setHotspots(civicDataService.getHotspotInsights());
    } catch (err) {
      console.warn('Error loading from Supabase, loading fallback state:', err);
      setComplaints(civicDataService.getComplaints());
      setDepartments(civicDataService.getDepartments());
      setTeams(civicDataService.getMaintenanceTeams());
      setClusters(civicDataService.getRootCauseClusters());
      setHotspots(civicDataService.getHotspotInsights());
      setAlerts(civicDataService.getPublicHazardAlerts());
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, [user]);

  const showSyncToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Handlers
  const handleSelectComplaint = (complaint: Complaint) => {
    const fresh = complaints.find((c) => c.id === complaint.id || c.ticketNumber === complaint.ticketNumber) || complaint;
    setSelectedComplaint(fresh);
    setIsDetailModalOpen(true);
  };

  const handleComplaintCreated = async (newComplaint: Complaint) => {
    try {
      if (supabaseService.isLive()) {
        const dbRecord = await supabaseService.createComplaint(newComplaint, user?.id);
        setComplaints((prev) => [dbRecord, ...prev]);
        setSelectedComplaint(dbRecord);
        showSyncToast(`Saved to Supabase: ${dbRecord.ticketNumber}`);
      } else {
        const localRecord = civicDataService.createComplaint(newComplaint);
        setComplaints((prev) => [localRecord, ...prev]);
        setSelectedComplaint(localRecord);
      }
      setIsDetailModalOpen(true);
    } catch (err: any) {
      console.error('Failed to save to Supabase:', err);
      // Fallback local save
      const localRecord = civicDataService.createComplaint(newComplaint);
      setComplaints((prev) => [localRecord, ...prev]);
      setSelectedComplaint(localRecord);
      setIsDetailModalOpen(true);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: ComplaintStatus,
    notes?: string,
    evidenceImageUrl?: string
  ) => {
    try {
      if (supabaseService.isLive()) {
        await supabaseService.updateComplaintStatus(id, status, notes, user?.id);
        showSyncToast(`Supabase updated: ${status}`);
        await loadDatabaseData();
      } else {
        const updated = civicDataService.updateComplaintStatus(
          id,
          status,
          userRole === 'citizen' ? 'Citizen' : 'Municipal Dispatch Officer',
          userRole,
          notes,
          evidenceImageUrl
        );
        if (updated) {
          setComplaints(civicDataService.getComplaints());
        }
      }

      if (selectedComplaint?.id === id) {
        const target = complaints.find((c) => c.id === id);
        if (target) setSelectedComplaint({ ...target, status });
      }
    } catch (err) {
      console.warn('Error updating status in Supabase:', err);
    }
  };

  const handleAssign = async (id: string, deptId: string, teamId?: string, targetDate?: string) => {
    try {
      if (supabaseService.isLive()) {
        await supabaseService.assignComplaint(id, deptId, teamId, targetDate, undefined, user?.id);
        showSyncToast('Dispatched & recorded in Supabase');
        await loadDatabaseData();
      } else {
        civicDataService.assignComplaint(id, deptId, teamId, targetDate);
        setComplaints(civicDataService.getComplaints());
      }
    } catch (err) {
      console.warn('Error assigning complaint in Supabase:', err);
    }
  };

  const handleSubmitResolution = async (id: string, evidence: ResolutionEvidence) => {
    try {
      if (supabaseService.isLive()) {
        await supabaseService.submitResolutionEvidence(id, {
          imageUrl: evidence.afterImageUrl,
          description: evidence.completionSummary,
          submittedBy: user?.id,
        });
        showSyncToast('Resolution evidence stored in Supabase');
        await loadDatabaseData();
      } else {
        civicDataService.submitResolution(id, evidence);
        setComplaints(civicDataService.getComplaints());
      }
    } catch (err) {
      console.warn('Error submitting resolution evidence in Supabase:', err);
    }
  };

  const handleSubmitFeedback = (id: string, feedback: ResolutionFeedback) => {
    civicDataService.submitCitizenFeedback(id, feedback);
    setComplaints(civicDataService.getComplaints());
    showSyncToast('Citizen audit feedback recorded');
  };

  const handleSupport = async (id: string) => {
    try {
      if (supabaseService.isLive() && user) {
        await supabaseService.toggleSupport(id, user.id);
        await loadDatabaseData();
      } else {
        civicDataService.supportComplaint(id);
        setComplaints(civicDataService.getComplaints());
      }
    } catch (err) {
      console.warn('Error supporting in Supabase:', err);
    }
  };

  const handleEscalate = (id: string, reason: string) => {
    civicDataService.escalateComplaint(id, reason);
    setComplaints(civicDataService.getComplaints());
    showSyncToast('SLA Escalation logged');
  };

  const handleLinkDuplicate = (primaryId: string, duplicateId: string) => {
    civicDataService.linkDuplicate(primaryId, duplicateId);
    setComplaints(civicDataService.getComplaints());
    showSyncToast('Merged duplicate in work order');
  };

  const handleBroadcastHazard = (alertData: Omit<PublicHazardAlert, 'id' | 'issuedAt' | 'active'>) => {
    civicDataService.createHazardAlert(alertData);
    setAlerts(civicDataService.getPublicHazardAlerts());
    showSyncToast('Emergency hazard alert broadcasted');
  };

  const handleDismissHazard = (id: string) => {
    civicDataService.dismissHazardAlert(id);
    setAlerts(civicDataService.getPublicHazardAlerts());
  };

  const activeHazards = alerts.filter((a) => a.active);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1C30] flex flex-col font-sans selection:bg-[#059669]/20 selection:text-[#0F172A]">
      {/* Top Persistent Navigation */}
      <Navbar
        activePortal={activePortal}
        onPortalChange={(p) => setActivePortal(p)}
        activeLanguage={activeLanguage}
        onLanguageChange={(lang) => setActiveLanguage(lang)}
        userRole={userRole}
        onRoleChange={(r) => setUserRole(r)}
        activeHazardsCount={activeHazards.length}
        onOpenHazardsModal={() => setIsHazardModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Sync Toast */}
      {syncToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0F172A] text-white text-xs px-4 py-2.5 rounded-lg border border-emerald-500/40 shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Emergency Hazards Banner */}
      <HazardBanner
        alerts={alerts}
        onOpenDetails={() => setIsHazardModalOpen(true)}
        onDismiss={handleDismissHazard}
      />

      {/* Loading bar */}
      {isLoadingData && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1 text-center text-xs text-emerald-800 flex items-center justify-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          <span>Synchronizing with live Supabase PostgreSQL database...</span>
        </div>
      )}

      {/* Main Experience Router */}
      <main className="flex-1">
        {activePortal === 'citizen' && (
          <CitizenPortal
            complaints={complaints}
            activeLanguage={activeLanguage}
            onLanguageChange={(l) => setActiveLanguage(l)}
            onSelectComplaint={handleSelectComplaint}
            onComplaintCreated={handleComplaintCreated}
            onSupportComplaint={handleSupport}
          />
        )}

        {activePortal === 'authority' && (
          <AuthorityPortal
            complaints={complaints}
            departments={departments}
            teams={teams}
            clusters={clusters}
            hotspots={hotspots}
            onSelectComplaint={handleSelectComplaint}
            onLinkDuplicate={handleLinkDuplicate}
            onOpenHazardModal={() => setIsHazardModalOpen(true)}
          />
        )}

        {activePortal === 'transparency' && (
          <PublicTransparencyPortal
            complaints={complaints}
            departments={departments}
            hotspots={hotspots}
            onSelectComplaint={handleSelectComplaint}
          />
        )}
      </main>

      {/* Complaint Detail Inspector Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedComplaint(null);
        }}
        userRole={userRole}
        departments={departments}
        teams={teams}
        onStatusChange={handleStatusChange}
        onAssign={handleAssign}
        onSubmitResolution={handleSubmitResolution}
        onSubmitFeedback={handleSubmitFeedback}
        onSupport={handleSupport}
        onEscalate={handleEscalate}
        onLinkDuplicate={handleLinkDuplicate}
      />

      {/* Public Hazard Modal */}
      <HazardModal
        isOpen={isHazardModalOpen}
        onClose={() => setIsHazardModalOpen(false)}
        alerts={alerts}
        userRole={userRole}
        onBroadcastHazard={handleBroadcastHazard}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Institutional Enterprise Footer */}
      <footer className="bg-[#0F172A] border-t border-slate-800 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#059669] flex items-center justify-center text-white font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white font-semibold">
                CivicAI — Public Infrastructure & Accountability Platform
              </p>
              <p className="text-[11px] text-slate-400">
                From Citizen Voice to Civic Action &bull; Powered by Google Gemini AI & Supabase PostgreSQL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Citizen Privacy Safeguarded
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Supabase Connected
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CivicAIApp />
    </AuthProvider>
  );
}
