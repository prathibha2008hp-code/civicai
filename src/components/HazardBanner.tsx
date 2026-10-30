import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, ChevronRight, PlusCircle, CheckCircle2 } from 'lucide-react';
import { PublicHazardAlert, UserRole } from '../types/civic';

interface HazardBannerProps {
  alerts: PublicHazardAlert[];
  onOpenDetails: (alert: PublicHazardAlert) => void;
  onDismiss: (id: string) => void;
}

export const HazardBanner: React.FC<HazardBannerProps> = ({
  alerts,
  onOpenDetails,
  onDismiss,
}) => {
  const activeAlerts = alerts.filter((a) => a.active);
  if (activeAlerts.length === 0) return null;

  const primaryAlert = activeAlerts[0];

  return (
    <div className="bg-[#FEF2F2] border-b border-[#FCA5A5] px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DC2626]"></span>
          </span>
          <div className="flex items-center gap-2 text-xs text-[#991B1B] font-medium truncate">
            <span className="font-bold uppercase tracking-wider text-[11px] bg-[#DC2626] text-white px-2 py-0.5 rounded">
              {primaryAlert.severity} ALERT
            </span>
            <span className="font-semibold text-[#0F172A] truncate">
              {primaryAlert.title}
            </span>
            <span className="hidden md:inline text-slate-500">
              — {primaryAlert.ward} ({primaryAlert.locationDescription})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(primaryAlert)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#DC2626] hover:text-[#991B1B] underline underline-offset-2"
          >
            View Safety Directives
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDismiss(primaryAlert.id)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
            title="Dismiss from banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface HazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PublicHazardAlert[];
  userRole: UserRole;
  onBroadcastHazard?: (alert: Omit<PublicHazardAlert, 'id' | 'issuedAt' | 'active'>) => void;
}

export const HazardModal: React.FC<HazardModalProps> = ({
  isOpen,
  onClose,
  alerts,
  userRole,
  onBroadcastHazard,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Public Hazards & Safety');
  const [ward, setWard] = useState('Ward 89 - Jogupalya');
  const [locationDescription, setLocationDescription] = useState('');
  const [message, setMessage] = useState('');
  const [precautions, setPrecautions] = useState('Maintain 30-meter perimeter\nAvoid water accumulation\nUse designated alternate route');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    if (onBroadcastHazard) {
      onBroadcastHazard({
        title,
        severity: 'Critical',
        category,
        ward,
        locationDescription,
        message,
        recommendedPrecautions: precautions.split('\n').filter(Boolean),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    setIsCreating(false);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Public Safety & Hazard Advisory Center
              </h3>
              <p className="text-xs text-slate-300">
                Live broadcast alerts verified by municipal emergency dispatch
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Action bar for authorities */}
          {(userRole === 'official' || userRole === 'admin') && (
            <div className="flex justify-end">
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {isCreating ? 'Cancel Broadcast' : 'Broadcast New Emergency Alert'}
              </button>
            </div>
          )}

          {/* Creation form */}
          {isCreating && (
            <form onSubmit={handleSubmit} className="bg-rose-50/60 border border-rose-200 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-rose-800 tracking-wider">
                Issue Emergency Public Safety Broadcast
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. High Voltage Snapped Cable on 12th Main"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ward / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ward 89 - Indiranagar 100ft Road"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Message / Incident Details</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain the imminent danger and containment efforts in progress..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Safety Precautions (1 per line)</label>
                <textarea
                  rows={2}
                  value={precautions}
                  onChange={(e) => setPrecautions(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#DC2626] text-white rounded hover:bg-rose-700 shadow"
                >
                  Publish Live Hazard Alert
                </button>
              </div>
            </form>
          )}

          {/* Active Alerts List */}
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white border border-[#CBD5E1] rounded-lg p-4 shadow-sm hover:border-[#94A3B8] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-[#FEF2F2] rounded text-[#DC2626] mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                          {alert.severity}
                        </span>
                        <span className="text-xs text-slate-400">
                          Issued: {new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="font-heading font-semibold text-sm text-[#0F172A] mt-1">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        📍 {alert.ward} ({alert.locationDescription})
                      </p>
                    </div>
                  </div>
                </div>

                {alert.recommendedPrecautions && alert.recommendedPrecautions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-4 -mb-4 p-4 rounded-b-lg">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Citizen Safety Precautions:
                    </span>
                    <ul className="space-y-1">
                      {alert.recommendedPrecautions.map((p, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] flex-shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#0F172A] text-white rounded hover:bg-slate-800 transition"
          >
            Close Advisory
          </button>
        </div>
      </div>
    </div>
  );
};
