/**
 * CivicAI - Supabase Data Service
 * Comprehensive CRUD operations across all 10 PostgreSQL tables:
 * - profiles
 * - departments
 * - complaints
 * - complaint_status_history
 * - complaint_duplicates
 * - complaint_supporters
 * - assignments
 * - resolution_evidence
 * - notifications
 * - public_alerts
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Complaint,
  Department,
  PublicHazardAlert,
  ComplaintStatus,
  ComplaintSeverity,
  ResolutionEvidence,
  StatusTimelineEntry,
  AIAnalysis,
} from '../types/civic';
import { INITIAL_COMPLAINTS } from './dataService';

export const supabaseService = {
  // Check if live Supabase client is configured
  isLive(): boolean {
    return isSupabaseConfigured;
  },

  // 1. Fetch Complaints with joins (status history, evidence, supporters, departments)
  async getComplaints(currentUserId?: string): Promise<Complaint[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          departments:assigned_department_id (id, name),
          history:complaint_status_history (*),
          evidence:resolution_evidence (*),
          supporters:complaint_supporters (user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching complaints from Supabase:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => mapDbRowToComplaint(row, currentUserId));
    } catch (err) {
      console.error('Failed to load complaints from Supabase:', err);
      throw err;
    }
  },

  // 2. Create Complaint in Supabase
  async createComplaint(
    complaintData: Partial<Complaint>,
    userId?: string
  ): Promise<Complaint> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }

    const priorityScore = complaintData.priorityScore || 50;
    let priorityEnum: 'Low' | 'Medium' | 'High' | 'Emergency' = 'Medium';
    if (priorityScore >= 90 || complaintData.severity === 'Emergency') {
      priorityEnum = 'Emergency';
    } else if (priorityScore >= 75 || complaintData.severity === 'High') {
      priorityEnum = 'High';
    } else if (priorityScore < 50 || complaintData.severity === 'Low') {
      priorityEnum = 'Low';
    }

    const insertPayload = {
      user_id: userId || null,
      title: complaintData.title || 'Civic Infrastructure Concern',
      description: complaintData.description || '',
      category: complaintData.category || 'Road & Infrastructure',
      location_name: complaintData.location?.address || 'Metropolitan Ward',
      latitude: complaintData.location?.lat || 12.9716,
      longitude: complaintData.location?.lng || 77.5946,
      image_url: complaintData.beforeImageUrl || null,
      priority: priorityEnum,
      priority_score: priorityScore,
      status: 'Submitted',
      is_anonymous: Boolean(complaintData.isAnonymous),
      ai_summary: complaintData.aiAnalysis?.summary || null,
      ai_priority_reason: complaintData.aiAnalysis?.reasoning || null,
    };

    // 1. Insert complaint
    const { data: created, error } = await supabase
      .from('complaints')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating complaint in Supabase:', error);
      throw error;
    }

    // 2. Insert initial timeline entry in complaint_status_history
    try {
      await supabase.from('complaint_status_history').insert({
        complaint_id: created.id,
        old_status: null,
        new_status: 'Submitted',
        changed_by: userId || null,
        remarks: 'Complaint lodged via CivicAI Citizen Portal.',
      });
    } catch (hErr) {
      console.warn('Status history initial entry note:', hErr);
    }

    return mapDbRowToComplaint(created, userId);
  },

  // 3. Update Complaint Status & Log History
  async updateComplaintStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    remarks?: string,
    changedBy?: string
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    // 1. Fetch current status
    const { data: current } = await supabase
      .from('complaints')
      .select('status, id')
      .or(`id.eq.${complaintId},ticket_number.eq.${complaintId}`)
      .single();

    const targetId = current?.id || complaintId;
    const oldStatus = current?.status || 'Submitted';

    // 2. Update status in complaints table
    const { error: updateErr } = await supabase
      .from('complaints')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', targetId);

    if (updateErr) {
      console.error('Error updating complaint status:', updateErr);
      throw updateErr;
    }

    // 3. Insert status change in complaint_status_history
    await supabase.from('complaint_status_history').insert({
      complaint_id: targetId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy || null,
      remarks: remarks || `Status transitioned to ${newStatus}.`,
    });
  },

  // 4. Assign Complaint to Department & Team
  async assignComplaint(
    complaintId: string,
    departmentId: string,
    assignedTo?: string,
    deadline?: string,
    remarks?: string,
    changedBy?: string
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    // 1. Resolve ID
    const { data: current } = await supabase
      .from('complaints')
      .select('id, status')
      .or(`id.eq.${complaintId},ticket_number.eq.${complaintId}`)
      .single();

    const targetId = current?.id || complaintId;

    // 2. Update complaint
    const { error: compErr } = await supabase
      .from('complaints')
      .update({
        assigned_department_id: departmentId,
        status: 'Assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId);

    if (compErr) throw compErr;

    // 3. Record in assignments table
    await supabase.from('assignments').insert({
      complaint_id: targetId,
      department_id: departmentId,
      assigned_to: assignedTo || 'Rapid Response Squad',
      deadline: deadline || null,
      remarks: remarks || 'Official work order dispatched.',
    });

    // 4. Record in status history
    await supabase.from('complaint_status_history').insert({
      complaint_id: targetId,
      old_status: current?.status || 'Submitted',
      new_status: 'Assigned',
      changed_by: changedBy || null,
      remarks: `Assigned to department. Work order target: ${deadline || 'Standard SLA'}.`,
    });
  },

  // 5. Submit Official Resolution Evidence
  async submitResolutionEvidence(
    complaintId: string,
    evidence: {
      imageUrl: string;
      description: string;
      submittedBy?: string;
    }
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { data: current } = await supabase
      .from('complaints')
      .select('id, status')
      .or(`id.eq.${complaintId},ticket_number.eq.${complaintId}`)
      .single();

    const targetId = current?.id || complaintId;

    // 1. Insert resolution evidence
    const { error: evErr } = await supabase.from('resolution_evidence').insert({
      complaint_id: targetId,
      image_url: evidence.imageUrl,
      description: evidence.description,
      submitted_by: evidence.submittedBy || null,
    });

    if (evErr) throw evErr;

    // 2. Mark complaint as Resolved
    await supabase
      .from('complaints')
      .update({ status: 'Resolved', updated_at: new Date().toISOString() })
      .eq('id', targetId);

    // 3. Status history entry
    await supabase.from('complaint_status_history').insert({
      complaint_id: targetId,
      old_status: current?.status || 'In Progress',
      new_status: 'Resolved',
      changed_by: evidence.submittedBy || null,
      remarks: `Resolution verified: ${evidence.description}`,
    });
  },

  // 6. Upvote / Support Complaint Toggle
  async toggleSupport(complaintId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { data: current } = await supabase
      .from('complaints')
      .select('id')
      .or(`id.eq.${complaintId},ticket_number.eq.${complaintId}`)
      .single();

    const targetId = current?.id || complaintId;

    // Check if already supported
    const { data: existing } = await supabase
      .from('complaint_supporters')
      .select('id')
      .eq('complaint_id', targetId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('complaint_supporters')
        .delete()
        .eq('id', existing.id);
      return false; // un-supported
    } else {
      await supabase.from('complaint_supporters').insert({
        complaint_id: targetId,
        user_id: userId,
      });
      return true; // supported
    }
  },

  // 7. Departments Query
  async getDepartments(): Promise<Department[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      if (!data) return [];

      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        code: d.name.split(' ').map((w: string) => w[0]).join('').slice(0, 5),
        headName: 'Executive Director',
        contactEmail: `admin@${d.name.toLowerCase().replace(/\s+/g, '')}.gov.in`,
        contactPhone: '+91 80 2266 1100',
        activeComplaints: 0,
        resolvedComplaints: 0,
        avgResolutionDays: 3.5,
        slaBreachRate: 3.0,
        currentQuarterBudget: 15000000,
        spentBudget: 8000000,
      }));
    } catch (err) {
      console.warn('Error fetching departments:', err);
      return [];
    }
  },

  // 8. Public Alerts Query
  async getPublicAlerts(): Promise<PublicHazardAlert[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('public_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((a: any) => ({
        id: a.id,
        title: a.title,
        severity: (a.severity as any) || 'Warning',
        category: 'Public Safety',
        ward: a.location_name,
        locationDescription: a.location_name,
        issuedAt: a.created_at,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        message: a.description,
        recommendedPrecautions: [
          'Maintain safe distance from hazard perimeter',
          'Follow police & emergency traffic directions',
        ],
        active: a.is_active,
      }));
    } catch (err) {
      console.warn('Error fetching public alerts:', err);
      return [];
    }
  },

  // 9. Upload Evidence Image to Supabase Storage
  async uploadImage(file: File): Promise<string> {
    if (!isSupabaseConfigured) {
      return URL.createObjectURL(file);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `evidence/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('civic-evidence')
        .upload(filePath, file);

      if (uploadError) {
        console.warn('Supabase Storage upload warning, falling back to local file URL:', uploadError);
        return URL.createObjectURL(file);
      }

      const { data } = supabase.storage
        .from('civic-evidence')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.warn('Storage exception, returning object URL:', err);
      return URL.createObjectURL(file);
    }
  },

  // 10. Seed Initial Verified Records if Database Table is Empty
  async seedIfEmpty(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { count, error } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true });

      if (error || (count && count > 0)) {
        return false;
      }

      console.info('Seeding foundational verified municipal records to Supabase...');

      // Seed first 5 high-impact complaints to populate live database
      for (const item of INITIAL_COMPLAINTS.slice(0, 5)) {
        const { data: created } = await supabase
          .from('complaints')
          .insert({
            ticket_number: item.ticketNumber,
            title: item.title,
            description: item.description,
            category: item.category,
            location_name: item.location.address,
            latitude: item.location.lat,
            longitude: item.location.lng,
            image_url: item.beforeImageUrl,
            priority: item.severity === 'Emergency' ? 'Emergency' : item.severity === 'High' ? 'High' : 'Medium',
            priority_score: item.priorityScore,
            status: item.status,
            is_anonymous: item.isAnonymous,
            ai_summary: item.aiAnalysis?.summary,
            ai_priority_reason: item.aiAnalysis?.reasoning,
          })
          .select('id')
          .single();

        if (created) {
          // Status history
          await supabase.from('complaint_status_history').insert({
            complaint_id: created.id,
            new_status: item.status,
            remarks: 'Initial complaint recorded in system.',
          });

          // Resolution evidence if resolved
          if (item.status === 'Resolved' && item.resolutionEvidence) {
            await supabase.from('resolution_evidence').insert({
              complaint_id: created.id,
              image_url: item.resolutionEvidence.afterImageUrl,
              description: item.resolutionEvidence.completionSummary,
            });
          }
        }
      }

      return true;
    } catch (err) {
      console.warn('Seeding check exception:', err);
      return false;
    }
  },
};

// Helper: Maps a Supabase DB row (with relations) to our frontend Complaint interface
function mapDbRowToComplaint(row: any, currentUserId?: string): Complaint {
  const historyEntries: StatusTimelineEntry[] = (row.history || []).map((h: any) => ({
    id: h.id,
    status: h.new_status as ComplaintStatus,
    timestamp: h.created_at,
    actorName: 'Municipal Authority / Citizen',
    actorRole: 'official',
    notes: h.remarks || undefined,
  }));

  // Ensure at least one timeline entry
  if (historyEntries.length === 0) {
    historyEntries.push({
      id: `tl-${row.id}`,
      status: row.status as ComplaintStatus,
      timestamp: row.created_at,
      actorName: 'CivicAI System',
      actorRole: 'System AI',
      notes: 'Complaint logged in Supabase database.',
    });
  }

  const latestEvidence = row.evidence && row.evidence.length > 0 ? row.evidence[0] : undefined;
  const supportersList = row.supporters || [];
  const supportersCount = supportersList.length;
  const supportedByCurrentUser = currentUserId
    ? supportersList.some((s: any) => s.user_id === currentUserId)
    : false;

  const aiAnalysis: AIAnalysis | undefined = row.ai_summary
    ? {
        category: row.category,
        summary: row.ai_summary,
        severity: (row.priority as ComplaintSeverity) || 'Medium',
        priorityScore: row.priority_score || 50,
        riskFactors: [
          'Civic infrastructure disruption',
          'Pedestrian & vehicular vulnerability',
        ],
        recommendedDepartment: row.departments?.name || 'Road Infrastructure & Public Works',
        recommendedAction: 'Inspect and dispatch municipal repair team.',
        reasoning: row.ai_priority_reason || 'Evaluated via Gemini AI civic diagnostic model.',
        confidenceScore: 0.95,
        communityImpact: {
          affectedPopulationEst: 3500,
          transitVulnerability: row.priority === 'Emergency' ? 'Critical' : 'Moderate',
          nearbyKeyInstitutions: [row.location_name],
        },
        isAiGenerated: true,
      }
    : undefined;

  return {
    id: row.id,
    ticketNumber: row.ticket_number || `CIV-2026-${row.id.slice(0, 4)}`,
    title: row.title,
    description: row.description,
    category: row.category,
    severity: (row.priority as ComplaintSeverity) || 'Medium',
    priorityScore: row.priority_score || 50,
    status: row.status as ComplaintStatus,
    citizenId: row.user_id || 'anonymous',
    citizenName: row.is_anonymous ? 'Anonymous Citizen' : 'Verified Citizen',
    isAnonymous: Boolean(row.is_anonymous),
    language: 'en',
    location: {
      address: row.location_name,
      ward: row.location_name.includes('Ward') ? row.location_name : 'Municipal Ward',
      zone: 'Metropolitan Zone',
      lat: row.latitude || 12.9716,
      lng: row.longitude || 77.5946,
    },
    beforeImageUrl: row.image_url || undefined,
    supportersCount,
    supportedByCurrentUser,
    aiAnalysis,
    assignedDepartmentId: row.assigned_department_id || undefined,
    assignedDepartmentName: row.departments?.name || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    timeline: historyEntries.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    resolutionEvidence: latestEvidence
      ? {
          resolvedAt: latestEvidence.created_at,
          resolvedByTeam: 'Municipal Rapid Action Squad',
          completionSummary: latestEvidence.description,
          afterImageUrl: latestEvidence.image_url,
          crewHoursSpent: 12,
          costIncurred: 25000,
        }
      : undefined,
  };
}
