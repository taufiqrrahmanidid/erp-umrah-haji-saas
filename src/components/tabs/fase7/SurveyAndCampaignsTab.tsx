import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Send,
  Star,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Award,
  Smartphone,
  CheckCheck,
  Building,
} from 'lucide-react';
import {
  CustomerSurvey,
  AlumniDatabaseRecord,
  WhatsAppCampaign,
  WAMessageLog,
} from '../../../types/erp';

interface SurveyAndCampaignsTabProps {
  surveys: CustomerSurvey[];
  alumniRecords: AlumniDatabaseRecord[];
  campaigns: WhatsAppCampaign[];
  messageLogs: WAMessageLog[];
  onSubmitSurvey: (survey: Omit<CustomerSurvey, 'survey_id' | 'routed_destination' | 'cs_ticket_id' | 'cs_resolution_status' | 'created_at'>) => void;
  onSendBroadcastCampaign: (campaignId: string) => void;
  onCreateCampaign: (campaign: Omit<WhatsAppCampaign, 'campaign_id' | 'total_sent' | 'total_delivered' | 'total_failed' | 'campaign_status' | 'created_at'>) => void;
}

export const SurveyAndCampaignsTab: React.FC<SurveyAndCampaignsTabProps> = ({
  surveys,
  alumniRecords,
  campaigns,
  messageLogs,
  onSubmitSurvey,
  onSendBroadcastCampaign,
  onCreateCampaign,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'SURVEY_ROUTING' | 'ALUMNI_DATABASE' | 'WA_CAMPAIGNS'>('SURVEY_ROUTING');
  
  // New Survey Form State
  const [surveyCustomerName, setSurveyCustomerName] = useState('H. Bambang Soeprapto');
  const [surveyManifestCode, setSurveyManifestCode] = useState('KLTR-RAMADHAN-01');
  const [starRating, setStarRating] = useState<number>(5);
  const [muthawifRating, setMuthawifRating] = useState<number>(5);
  const [hotelRating, setHotelRating] = useState<number>(5);
  const [cateringRating, setCateringRating] = useState<number>(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [surveyRoutingResult, setSurveyRoutingResult] = useState<{
    destination: 'GOOGLE_REVIEW_PUBLIC' | 'INTERNAL_CS_TICKET';
    ticketId?: string;
  } | null>(null);

  // New Campaign Modal State
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    campaign_name: '',
    campaign_type: 'PROMO_EARLY_BIRD' as WhatsAppCampaign['campaign_type'],
    target_audience: 'ALL_ALUMNI' as WhatsAppCampaign['target_audience'],
    message_template: 'Assalamu’alaikum Wr Wb {{nama_jamaah}}, kami mengundang Bapak/Ibu Alumni Al-Haramain dalam program spesial...',
    scheduled_send_at: '2026-04-15 10:00:00',
    total_recipients: 120,
  });

  // Alumni Search State
  const [alumniSearch, setAlumniSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'SILVER_ALUMNI' | 'GOLD_ALUMNI' | 'PLATINUM_ALUMNI'>('ALL');

  const filteredAlumni = alumniRecords.filter((alumni) => {
    const matchSearch =
      alumni.full_name.toLowerCase().includes(alumniSearch.toLowerCase()) ||
      alumni.nik.includes(alumniSearch) ||
      alumni.city.toLowerCase().includes(alumniSearch.toLowerCase());
    const matchTier = tierFilter === 'ALL' || alumni.loyalty_badge === tierFilter;
    return matchSearch && matchTier;
  });

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const destination = starRating >= 4 ? 'GOOGLE_REVIEW_PUBLIC' : 'INTERNAL_CS_TICKET';
    const ticketId = destination === 'INTERNAL_CS_TICKET' ? `CS-TCK-${Date.now().toString().slice(-6)}` : undefined;

    onSubmitSurvey({
      customer_id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      customer_name: surveyCustomerName,
      manifest_id: 'MNF-001',
      manifest_code: surveyManifestCode,
      star_rating: starRating,
      muthawif_rating: muthawifRating,
      hotel_rating: hotelRating,
      catering_rating: cateringRating,
      feedback_notes: feedbackNotes,
    });

    setSurveyRoutingResult({ destination, ticketId });
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCampaign({
      branch_id: 'BRANCH-JKT-HQ',
      campaign_name: campaignForm.campaign_name,
      campaign_type: campaignForm.campaign_type,
      target_audience: campaignForm.target_audience,
      message_template: campaignForm.message_template,
      scheduled_send_at: campaignForm.scheduled_send_at,
      total_recipients: Number(campaignForm.total_recipients),
    });
    setShowAddCampaignModal(false);
  };

  // Summaries
  const publicReviewsCount = surveys.filter((s) => s.routed_destination === 'GOOGLE_REVIEW_PUBLIC').length;
  const csTicketsCount = surveys.filter((s) => s.routed_destination === 'INTERNAL_CS_TICKET').length;
  const totalAlumniCount = alumniRecords.length;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Star className="w-16 h-16 text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Apresiasi Google Review (Bintang 4-5)</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{publicReviewsCount} Ulasan Publik</div>
          <div className="text-xs text-slate-400 mt-1">Diarahkan langsung ke Google Maps Cabang</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ShieldAlert className="w-16 h-16 text-rose-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tiket CS Internal (Bintang 1-3)</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{csTicketsCount} Tiket Aduan</div>
          <div className="text-xs text-slate-400 mt-1">Dirahasiakan untuk investigasi internal Direksi</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Users className="w-16 h-16 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Database Alumni Jamaah</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{totalAlumniCount} Alumni</div>
          <div className="text-xs text-slate-400 mt-1">Silver, Gold, dan Platinum Tiering</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Smartphone className="w-16 h-16 text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WhatsApp Broadcast Engine</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{campaigns.length} Kampanye</div>
          <div className="text-xs text-slate-400 mt-1">Personalisasi pesan dinamis multi-penerima</div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('SURVEY_ROUTING')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              activeSubTab === 'SURVEY_ROUTING'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Smart Google Review Routing</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ALUMNI_DATABASE')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              activeSubTab === 'ALUMNI_DATABASE'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Database Alumni & Loyalitas</span>
            <span className="bg-emerald-950 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-800">
              {alumniRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('WA_CAMPAIGNS')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              activeSubTab === 'WA_CAMPAIGNS'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>WhatsApp Broadcast Engine</span>
            <span className="bg-blue-950 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-800">
              {campaigns.length}
            </span>
          </button>
        </div>

        {activeSubTab === 'WA_CAMPAIGNS' && (
          <button
            onClick={() => setShowAddCampaignModal(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Kampanye Broadcast</span>
          </button>
        )}
      </div>

      {/* SUBTAB 1: SMART SURVEY ROUTING */}
      {activeSubTab === 'SURVEY_ROUTING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Feedback Simulator Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Simulasi Form Survei Pasca-Trip
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Uji logika routing cerdas: Kepuasan bintang 4-5 diarahkan publik ke Google Maps Review, sedangkan keluhan bintang 1-3 otomatis dibuatkan tiket aduan internal ke Direksi & CS.
              </p>
            </div>

            <form onSubmit={handleSurveySubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block font-semibold mb-1">Nama Jamaah</label>
                <input
                  type="text"
                  required
                  value={surveyCustomerName}
                  onChange={(e) => setSurveyCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Kode Kloter</label>
                <input
                  type="text"
                  required
                  value={surveyManifestCode}
                  onChange={(e) => setSurveyManifestCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded font-mono"
                />
              </div>

              {/* Overall Star Rating */}
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <label className="text-slate-200 block font-bold">Rating Kepuasan Keseluruhan</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStarRating(s)}
                      className={`p-1.5 rounded transition-transform ${
                        starRating >= s ? 'text-amber-400 scale-110' : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="font-bold text-amber-400 text-sm ml-2">{starRating} dari 5 Bintang</span>
                </div>
              </div>

              {/* Sub Ratings */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 text-[11px] block">Muthawif</label>
                  <select
                    value={muthawifRating}
                    onChange={(e) => setMuthawifRating(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded text-[11px]"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} ⭐</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block">Hotel</label>
                  <select
                    value={hotelRating}
                    onChange={(e) => setHotelRating(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded text-[11px]"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} ⭐</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block">Katering</label>
                  <select
                    value={cateringRating}
                    onChange={(e) => setCateringRating(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded text-[11px]"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} ⭐</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Ulasan & Masukan Jamaah</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Kesan, pesan, atau keluhan fasilitas ibadah..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Submit Evaluasi Jamaah
              </button>
            </form>

            {/* Smart Routing Decision Result Banner */}
            {surveyRoutingResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 animate-fadeIn ${
                  surveyRoutingResult.destination === 'GOOGLE_REVIEW_PUBLIC'
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-600 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {surveyRoutingResult.destination === 'GOOGLE_REVIEW_PUBLIC' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Smart Decision: Apresiasi Publik (Bintang 4-5)</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                      <span>Smart Decision: Internal CS Ticket (Bintang 1-3)</span>
                    </>
                  )}
                </div>

                <p className="text-xs leading-relaxed opacity-90">
                  {surveyRoutingResult.destination === 'GOOGLE_REVIEW_PUBLIC'
                    ? 'Jamaah sangat puas! Pop-up langsung mengarahkan jamaah untuk memposting review positif ke Google Maps profil cabang untuk meningkatkan rating publik.'
                    : `Keluhan terdeteksi. Sistem merahasiakan review dan menerbitkan tiket internal aduan #${surveyRoutingResult.ticketId} dengan SLA tanggapan 24 jam.`}
                </p>

                {surveyRoutingResult.destination === 'GOOGLE_REVIEW_PUBLIC' ? (
                  <button
                    onClick={() => alert('Membuka tautan: https://g.page/r/alharamain-hq/review')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 shadow mt-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Tautan Google Maps Review
                  </button>
                ) : (
                  <div className="bg-slate-900/80 p-2 rounded text-[11px] font-mono text-rose-300 border border-rose-900">
                    Tiket Terbit: {surveyRoutingResult.ticketId} (Prioritas Tinggi Direksi)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Past Surveys Table */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Log Evaluasi Jamaah & Status Penanganan
            </h4>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Nama Jamaah & Kloter</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Catatan Ulasan</th>
                      <th className="py-3 px-4">Keputusan Smart Routing</th>
                      <th className="py-3 px-4">Status Resolusi CS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {surveys.map((srv) => (
                      <tr key={srv.survey_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100 text-sm">{srv.customer_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{srv.manifest_code}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{srv.star_rating}.0</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            M:{srv.muthawif_rating} | H:{srv.hotel_rating} | K:{srv.catering_rating}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-300 text-[11px] line-clamp-2 max-w-xs">
                            "{srv.feedback_notes}"
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              srv.routed_destination === 'GOOGLE_REVIEW_PUBLIC'
                                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-900/40 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {srv.routed_destination === 'GOOGLE_REVIEW_PUBLIC'
                              ? '⭐ Google Review Publik'
                              : '🔒 Tiket Aduan CS Internal'}
                          </span>
                          {srv.cs_ticket_id && (
                            <div className="text-[10px] font-mono text-rose-400 mt-1">
                              ID: {srv.cs_ticket_id}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              srv.cs_resolution_status === 'OPEN'
                                ? 'bg-rose-900/50 text-rose-300 border border-rose-800'
                                : srv.cs_resolution_status === 'RESOLVED'
                                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {srv.cs_resolution_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ALUMNI DATABASE */}
      {activeSubTab === 'ALUMNI_DATABASE' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Database Alumni Jamaah (v_alumni_database):</strong> Diagregasi otomatis dari seluruh manifest yang berstatus <em>DEPARTED</em> atau <em>COMPLETED</em>. Tiering loyalitas otomatis: Silver (1 trip), Gold (2 trips), dan Platinum (3+ trips).
              </span>
            </div>

            {/* Filter & Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari Nama / NIK / Kota..."
                  value={alumniSearch}
                  onChange={(e) => setAlumniSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded"
              >
                <option value="ALL">Semua Tier Loyalitas</option>
                <option value="SILVER_ALUMNI">Silver Alumni (1 Trip)</option>
                <option value="GOLD_ALUMNI">Gold Alumni (2 Trips)</option>
                <option value="PLATINUM_ALUMNI">Platinum Alumni (3+ Trips)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nama Alumni & NIK</th>
                    <th className="py-3 px-4">Kontak & Domisili</th>
                    <th className="py-3 px-4">Tier Loyalitas</th>
                    <th className="py-3 px-4">Total Keberangkatan</th>
                    <th className="py-3 px-4">Terakhir Berangkat</th>
                    <th className="py-3 px-4">Riwayat Paket Umrah & Haji</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredAlumni.map((alumni) => (
                    <tr key={alumni.customer_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 text-sm">{alumni.full_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">NIK: {alumni.nik}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-semibold">{alumni.phone_number}</div>
                        <div className="text-[11px] text-slate-400">{alumni.email}</div>
                        <div className="text-[10px] text-slate-500">{alumni.city}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            alumni.loyalty_badge === 'PLATINUM_ALUMNI'
                              ? 'bg-purple-900/50 text-purple-200 border border-purple-700'
                              : alumni.loyalty_badge === 'GOLD_ALUMNI'
                              ? 'bg-amber-900/50 text-amber-200 border border-amber-700'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          {alumni.loyalty_badge.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-extrabold text-emerald-400 text-sm">
                          {alumni.total_trips_completed} Kali
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300">{alumni.last_trip_date}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300 text-[11px] max-w-md">
                          {alumni.package_history}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: WHATSAPP BROADCAST CAMPAIGNS */}
      {activeSubTab === 'WA_CAMPAIGNS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>
                <strong>Mesin WhatsApp Broadcast Multi-Cabang:</strong> Mengirim pesan berantai ke ribuan calon jamaah & alumni. Mendukung tag dinamis seperti <code>{'{{nama_jamaah}}'}</code>, <code>{'{{nama_paket}}'}</code>.
              </span>
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map((cmp) => (
              <div
                key={cmp.campaign_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-100 text-sm">{cmp.campaign_name}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cmp.campaign_status === 'COMPLETED'
                          ? 'bg-emerald-900/50 text-emerald-300'
                          : cmp.campaign_status === 'SENDING'
                          ? 'bg-blue-900/50 text-blue-300 animate-pulse'
                          : 'bg-amber-900/50 text-amber-300'
                      }`}
                    >
                      {cmp.campaign_status}
                    </span>
                  </div>

                  <div className="text-[11px] text-blue-400 font-semibold mt-1">
                    Target: {cmp.target_audience.replace('_', ' ')}
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded text-[11px] text-slate-300 border border-slate-800 mt-2 font-sans line-clamp-3">
                    "{cmp.message_template}"
                  </div>

                  {/* Delivery Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-2 border-t border-slate-800">
                    <div className="bg-slate-950 p-1.5 rounded">
                      <div className="text-slate-400 text-[10px]">Terkirim</div>
                      <div className="font-bold text-slate-200">{cmp.total_sent} / {cmp.total_recipients}</div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded">
                      <div className="text-slate-400 text-[10px]">Diterima</div>
                      <div className="font-bold text-emerald-400">{cmp.total_delivered}</div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded">
                      <div className="text-slate-400 text-[10px]">Gagal</div>
                      <div className="font-bold text-rose-400">{cmp.total_failed}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onSendBroadcastCampaign(cmp.campaign_id)}
                    disabled={cmp.campaign_status === 'COMPLETED'}
                    className={`w-full py-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow ${
                      cmp.campaign_status === 'COMPLETED'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {cmp.campaign_status === 'COMPLETED' ? 'Sudah Terkirim' : 'Kirim Broadcast Sekarang (Live)'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Logs Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Log Pengiriman Pesan WhatsApp per Penerima (Live Status)
            </h4>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Nama Penerima & WhatsApp</th>
                      <th className="py-3 px-4">Isi Pesan Dipersonalisasi</th>
                      <th className="py-3 px-4">Status Pengiriman</th>
                      <th className="py-3 px-4">Waktu Kirim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {messageLogs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100">{log.recipient_name}</div>
                          <div className="text-[11px] font-mono text-emerald-400">{log.recipient_phone}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-300 text-[11px] max-w-lg">
                            {log.rendered_body}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.delivery_status === 'READ'
                                ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-800'
                                : log.delivery_status === 'DELIVERED'
                                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            {log.delivery_status}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-400 text-[11px]">{log.sent_at || 'Baru Saja'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add WhatsApp Campaign */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                Buat Kampanye WhatsApp Broadcast
              </h3>
              <button onClick={() => setShowAddCampaignModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block font-semibold mb-1">Nama Kampanye</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Undangan Bimbingan Manasik Akbar Wilayah Barat"
                  value={campaignForm.campaign_name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, campaign_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Tipe Pesan</label>
                  <select
                    value={campaignForm.campaign_type}
                    onChange={(e) => setCampaignForm({ ...campaignForm, campaign_type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                  >
                    <option value="PROMO_EARLY_BIRD">Promo Early Bird</option>
                    <option value="MANASIK_REMINDER">Reminder Jadwal Manasik</option>
                    <option value="PELUNASAN_REMINDER">Reminder Pelunasan Paket</option>
                    <option value="REUNI_ALUMNI">Undangan Reuni Alumni</option>
                    <option value="ZAMZAM_PICKUP_INFO">Info Pengambilan Air Zamzam</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Target Segmen Jamaah</label>
                  <select
                    value={campaignForm.target_audience}
                    onChange={(e) => setCampaignForm({ ...campaignForm, target_audience: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                  >
                    <option value="ALL_ALUMNI">Semua Alumni Terdata</option>
                    <option value="PLATINUM_ALUMNI_ONLY">Khusus Member Platinum</option>
                    <option value="UNPAID_BOOKINGS">Jamaah Belum Lunas Tagihan</option>
                    <option value="UPCOMING_MANASIK_GUESTS">Calon Peserta Manasik</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">
                  Template Pesan (Mendukung Variabel Dynamic)
                </label>
                <textarea
                  rows={4}
                  required
                  value={campaignForm.message_template}
                  onChange={(e) => setCampaignForm({ ...campaignForm, message_template: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded font-mono text-[11px]"
                />
                <div className="text-[10px] text-slate-500 mt-1">
                  Gunakan placeholder: <code>{'{{nama_jamaah}}'}</code>, <code>{'{{nama_paket}}'}</code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Jadwal Kirim</label>
                  <input
                    type="text"
                    value={campaignForm.scheduled_send_at}
                    onChange={(e) => setCampaignForm({ ...campaignForm, scheduled_send_at: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Estimasi Penerima</label>
                  <input
                    type="number"
                    value={campaignForm.total_recipients}
                    onChange={(e) => setCampaignForm({ ...campaignForm, total_recipients: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2 rounded font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCampaignModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-500"
                >
                  Jadwalkan Kampanye
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
