import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Camera,
  Mic,
  MicOff,
  MapPin,
  Sparkles,
  ShieldCheck,
  Send,
  ThumbsUp,
  AlertCircle,
  FileCheck,
  Languages,
  Clock,
  Eye,
  Trash2,
  Save,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { Complaint, ComplaintCategory, LanguageCode, AIAnalysis } from '../types/civic';
import { CivicMap } from './CivicMap';
import { aiService } from '../services/aiService';
import { civicDataService } from '../services/dataService';

interface CitizenPortalProps {
  complaints: Complaint[];
  activeLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onComplaintCreated: (complaint: Complaint) => void;
  onSupportComplaint: (id: string) => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'Road & Infrastructure',
  'Water Supply & Sewage',
  'Solid Waste Management',
  'Electricity & Street Lighting',
  'Flooding & Storm Drain',
  'Public Hazards & Safety',
  'Parks & Urban Forestry',
  'Public Health & Sanitation',
];

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  complaints,
  activeLanguage,
  onLanguageChange,
  onSelectComplaint,
  onComplaintCreated,
  onSupportComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'my_reports' | 'nearby'>('submit');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Road & Infrastructure');
  const [address, setAddress] = useState('14th Main Road, Indiranagar, Bangalore');
  const [ward, setWard] = useState('Ward 89 - Jogupalya');
  const [landmark, setLandmark] = useState('Near Cambridge Public School');
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9782,
    lng: 77.6415,
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [citizenName, setCitizenName] = useState('Priya Sundaram');
  const [citizenPhone, setCitizenPhone] = useState('+91 98450 44210');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  );

  // Audio Voice Recording Simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);

  // AI Instant Pre-submission Diagnosis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPreview, setAiPreview] = useState<AIAnalysis | null>(null);

  // Filter for my reports
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [draftSavedNotification, setDraftSavedNotification] = useState(false);

  // Offline Draft Load on Mount
  useEffect(() => {
    const draft = civicDataService.getOfflineDraft();
    if (draft && !title) {
      if (draft.title) setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
      if (draft.category) setCategory(draft.category as ComplaintCategory);
      if (draft.location?.address) setAddress(draft.location.address);
    }
  }, []);

  // Voice recording timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setHasVoiceNote(false);
    } else {
      setIsRecording(false);
      setHasVoiceNote(true);
      if (!description) {
        if (activeLanguage === 'kn') {
          setDescription('ಶಾಲೆ ಹತ್ತಿರ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ. ಮಕ್ಕಳು ಮತ್ತು ವಾಹನಗಳಿಗೆ ಅಪಾಯಕಾರಿಯಾಗಿದೆ.');
        } else if (activeLanguage === 'hi') {
          setDescription('सरकारी स्कूल के पास सड़क पर बहुत बड़ा गड्ढा है। बच्चों और गाड़ियों के लिए खतरा बना हुआ है।');
        } else {
          setDescription('There is a dangerous open pothole near the school gate where two-wheelers are slipping.');
        }
      }
    }
  };

  const handleSaveDraft = () => {
    civicDataService.saveOfflineDraft({
      title,
      description,
      category,
      location: {
        address,
        ward,
        zone: 'East Zone',
        lat: pickedCoords.lat,
        lng: pickedCoords.lng,
      },
    });
    setDraftSavedNotification(true);
    setTimeout(() => setDraftSavedNotification(false), 3000);
  };

  const handleRunAiDiagnosis = async () => {
    if (!title && !description) return;
    setIsAnalyzing(true);
    try {
      const analysis = await aiService.analyzeComplaint({
        title,
        description,
        category,
        address,
        landmark,
        language: activeLanguage,
      });
      setAiPreview(analysis);
      if (analysis.category && CATEGORIES.includes(analysis.category)) {
        setCategory(analysis.category);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickedCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setAddress(`Current Device Coordinates (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => {
          // Fallback to Bangalore Koramangala
          setPickedCoords({ lat: 12.9348, lng: 77.6258 });
          setAddress('Koramangala 4th Block, Bangalore');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    let finalAi = aiPreview;
    if (!finalAi) {
      finalAi = await aiService.analyzeComplaint({
        title,
        description,
        category,
        address,
        landmark,
        language: activeLanguage,
      });
    }

    const created = civicDataService.createComplaint({
      title,
      description,
      category,
      severity: finalAi.severity,
      priorityScore: finalAi.priorityScore,
      citizenName: isAnonymous ? 'Anonymous Citizen' : citizenName,
      citizenPhone: isAnonymous ? undefined : citizenPhone,
      isAnonymous,
      language: activeLanguage,
      location: {
        address,
        ward,
        zone: 'East Zone',
        lat: pickedCoords.lat,
        lng: pickedCoords.lng,
        nearbyLandmark: landmark,
      },
      beforeImageUrl: imageUrl,
      audioVoiceNoteUrl: hasVoiceNote ? 'simulated_audio_note.wav' : undefined,
      aiAnalysis: finalAi,
    });

    onComplaintCreated(created);
    civicDataService.clearOfflineDraft();

    // Reset form
    setTitle('');
    setDescription('');
    setAiPreview(null);
    setHasVoiceNote(false);
    setActiveTab('my_reports');
  };

  const myComplaints = complaints.filter(
    (c) => c.citizenName === citizenName || c.citizenId === 'cit-001' || c.citizenId === 'cit-current-user'
  );

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return c.status !== 'Resolved';
    if (statusFilter === 'resolved') return c.status === 'Resolved';
    if (statusFilter === 'escalated') return c.isEscalated;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Citizen Welcome & Hero Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#059669]/20 border border-[#059669]/40 px-3 py-1 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Public Infrastructure Sentry
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
            Transform Citizen Voice into Concrete Civic Action
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Report road hazards, sewage overflows, blackout corridors, or water leakages. CivicAI uses
            Gemini to assess severity, identify root causes, and directly dispatch municipal teams.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2.5 rounded font-semibold text-xs inline-flex items-center gap-2 transition ${
                activeTab === 'submit'
                  ? 'bg-[#059669] text-white shadow-md hover:bg-emerald-700'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              File New Civic Complaint
            </button>

            <button
              onClick={() => setActiveTab('my_reports')}
              className={`px-4 py-2.5 rounded font-semibold text-xs inline-flex items-center gap-2 transition ${
                activeTab === 'my_reports'
                  ? 'bg-[#059669] text-white shadow-md hover:bg-emerald-700'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Track My Reports ({myComplaints.length})
            </button>

            <button
              onClick={() => setActiveTab('nearby')}
              className={`px-4 py-2.5 rounded font-semibold text-xs inline-flex items-center gap-2 transition ${
                activeTab === 'nearby'
                  ? 'bg-[#059669] text-white shadow-md hover:bg-emerald-700'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Nearby Community Issues
            </button>
          </div>
        </div>

        {/* Decorative graphic element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Draft notification toast */}
      {draftSavedNotification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2 rounded-lg flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Offline draft saved to browser storage. You can resume safely anytime.
          </span>
        </div>
      )}

      {/* VIEW 1: SUBMIT NEW COMPLAINT */}
      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-heading font-bold text-lg text-[#0F172A]">
                  Lodge a Civic Infrastructure Issue
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provide details, audio voice notes, and photographic evidence.
                </p>
              </div>

              {/* Language Switcher for Form */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                <Languages className="w-3.5 h-3.5 text-[#059669]" />
                <span className="text-[11px] font-medium">Input Lang:</span>
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-1.5 py-0.5 rounded ${activeLanguage === 'en' ? 'bg-[#0F172A] text-white font-bold' : ''}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('kn')}
                  className={`px-1.5 py-0.5 rounded ${activeLanguage === 'kn' ? 'bg-[#0F172A] text-white font-bold' : ''}`}
                >
                  ಕನ್ನಡ
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('hi')}
                  className={`px-1.5 py-0.5 rounded ${activeLanguage === 'hi' ? 'bg-[#0F172A] text-white font-bold' : ''}`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Complaint Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded transition ${
                        category === cat
                          ? 'bg-[#0F172A] text-white font-semibold shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Summary / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeLanguage === 'kn'
                      ? 'ಉದಾ: ಶಾಲೆಯ ಬಳಿ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ'
                      : activeLanguage === 'hi'
                      ? 'उदा: स्कूल के पास सड़क पर बड़ा गड्ढा'
                      : 'e.g. Dangerous 1.5m crater pothole near Cambridge Public School'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded border border-[#CBD5E1] focus:border-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#059669]/30"
                />
              </div>

              {/* Description & Voice Note Integration */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Comprehensive Description <span className="text-rose-500">*</span>
                  </label>

                  {/* Voice recording button */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : hasVoiceNote
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Recording ({recordingSeconds}s)... Stop</span>
                      </>
                    ) : hasVoiceNote ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Voice Note Attached</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Record Voice Note ({activeLanguage.toUpperCase()})</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder={
                    activeLanguage === 'kn'
                      ? 'ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ವಿವರಿಸಿ ಅಥವಾ ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಬಟನ್ ಒತ್ತಿ...'
                      : activeLanguage === 'hi'
                      ? 'समस्या का विस्तार से वर्णन करें या ध्वनि रिकॉर्ड बटन दबाएं...'
                      : 'Describe dimensions, hazard level, traffic impact, and whether accidents have occurred...'
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded border border-[#CBD5E1] focus:border-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#059669]/30"
                />
              </div>

              {/* Image URL & Preset Samples */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Photographic Proof (Image URL / Camera)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL..."
                    className="w-full text-xs px-3 py-2 rounded border border-[#CBD5E1]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrl(
                        'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80'
                      )
                    }
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-medium whitespace-nowrap"
                  >
                    Use Sample Photo
                  </button>
                </div>
                {imageUrl && (
                  <div className="mt-2 relative rounded overflow-hidden h-28 border border-slate-200 bg-slate-100">
                    <img src={imageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Location & GPS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Location & Nearby Landmark
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="inline-flex items-center gap-1 text-xs text-[#059669] hover:underline font-semibold"
                  >
                    <Navigation className="w-3 h-3" />
                    Use My Device GPS
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street Address..."
                    className="text-xs px-3 py-2 rounded border border-[#CBD5E1]"
                  />
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Nearby Landmark (e.g. Cambridge School)..."
                    className="text-xs px-3 py-2 rounded border border-[#CBD5E1]"
                  />
                </div>
              </div>

              {/* Citizen Details & Anonymous Toggle */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#059669]" />
                    <span className="text-xs font-semibold text-slate-800">
                      Citizen Privacy Guard
                    </span>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-[#059669] focus:ring-[#059669]"
                    />
                    <span>Submit Anonymously</span>
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                        Mobile Number (For SMS updates)
                      </label>
                      <input
                        type="text"
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons & Pre-evaluation */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Draft
                  </button>

                  <button
                    type="button"
                    onClick={handleRunAiDiagnosis}
                    disabled={isAnalyzing || (!title && !description)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    {isAnalyzing ? 'Analyzing with Gemini...' : 'Preview AI Diagnosis'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#059669] hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-md inline-flex items-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  Submit Official Complaint
                </button>
              </div>
            </form>
          </div>

          {/* Interactive Map & AI Preview Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Map Picker */}
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Exact Issue Location
                </span>
                <span className="text-[11px] text-slate-500">
                  {pickedCoords.lat.toFixed(4)}, {pickedCoords.lng.toFixed(4)}
                </span>
              </div>
              <CivicMap
                pickerMode={true}
                pickedLocation={pickedCoords}
                onLocationPick={(coords) => setPickedCoords(coords)}
                height="280px"
              />
              <p className="text-[11px] text-slate-500 italic">
                Tip: Click anywhere on the map or drag the green marker to specify the exact pothole or hazard point.
              </p>
            </div>

            {/* AI Diagnosis Preview Card */}
            {aiPreview && (
              <div className="bg-emerald-50/80 border border-emerald-300 rounded-lg p-4 shadow-sm space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#059669]" />
                    Gemini AI Assessment Preview
                  </span>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                    Score: {aiPreview.priorityScore}/100
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {aiPreview.summary}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-emerald-200 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Severity Tier:</span>
                    <strong className="text-[#0F172A]">{aiPreview.severity}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Target Department:</span>
                    <strong className="text-[#059669]">{aiPreview.recommendedDepartment}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Est. Community Impact:</span>
                    <span>~{aiPreview.communityImpact?.affectedPopulationEst} citizens</span>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded border border-emerald-200 text-[11px] text-slate-700">
                  <strong>Recommended Action:</strong> {aiPreview.recommendedAction}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: TRACK MY COMPLAINTS */}
      {activeTab === 'my_reports' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F172A]">
                My Submitted Complaints & Live Progress
              </h2>
              <p className="text-xs text-slate-500">
                Inspect official department assignment, crew dispatches, and verify completed repairs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white"
              >
                <option value="all">All Reports</option>
                <option value="active">Active / In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">SLA Escalated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myComplaints.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectComplaint(item)}
                className="bg-white rounded-lg border border-[#E2E8F0] hover:border-[#059669] p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-600">
                      {item.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
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
                  </div>

                  <h3 className="font-heading font-bold text-sm text-[#0F172A] line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-[#059669] flex-shrink-0" />
                    <span className="truncate">{item.location.address}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Priority: <strong className="text-slate-800">{item.priorityScore}/100</strong>
                  </span>

                  {item.status === 'Resolved' && !item.resolutionFeedback ? (
                    <span className="text-[#059669] font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verify Repair &rarr;
                    </span>
                  ) : (
                    <span className="text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: NEARBY COMMUNITY COMPLAINTS & UPVOTING */}
      {activeTab === 'nearby' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-sm">
            <h2 className="font-heading font-bold text-base text-[#0F172A]">
              Community Civic Pulse (Bangalore Vicinity)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Inspect complaints reported by fellow citizens in your zone. Upvote to escalate municipal priority.
            </p>
            <CivicMap
              complaints={filteredComplaints}
              onSelectComplaint={(c) => onSelectComplaint(c)}
              height="380px"
            />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Active Community Reports ({filteredComplaints.length})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComplaints.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-[#CBD5E1] p-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-slate-600">{item.ticketNumber}</span>
                      <span className="text-slate-500">{item.category}</span>
                    </div>
                    <h3
                      onClick={() => onSelectComplaint(item)}
                      className="font-heading font-bold text-sm text-[#0F172A] hover:text-[#059669] cursor-pointer"
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate max-w-[200px]">
                      📍 {item.location.ward}
                    </span>
                    <button
                      onClick={() => onSupportComplaint(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                        item.supportedByCurrentUser
                          ? 'bg-[#059669] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{item.supportersCount} Supporters</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
