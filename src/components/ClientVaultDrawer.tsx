import React, { useState, useEffect } from 'react';
import { Creator, CreatorVault } from '../types';
import { 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  CreditCard, 
  FolderKanban, 
  Users, 
  KeyRound, 
  Calendar, 
  Edit3, 
  MessageSquare,
  Sparkles,
  Link as LinkIcon,
  Phone,
  MessageCircle,
  TrendingUp,
  Compass,
  FileText,
  DollarSign,
  Award
} from 'lucide-react';

interface ClientVaultDrawerProps {
  creator: Creator | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveVault: (creatorId: string, vaultData: CreatorVault) => void;
  onOpenEditModal: (creator: Creator) => void;
  isDarkMode: boolean;
}

export const ClientVaultDrawer: React.FC<ClientVaultDrawerProps> = ({
  creator,
  isOpen,
  onClose,
  onSaveVault,
  onOpenEditModal,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'brand_results' | 'vault' | 'crm'>('brand_results');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Vault form state
  const [vaultForm, setVaultForm] = useState<CreatorVault>({
    igUsername: '',
    igPassword: '',
    coachPhone: '',
    skoolCommunityUrl: '',
    assetsDriveUrl: '',
    cihBankRib: '',
    brandName: '',
    brandAngle: '',
    brandDescription: '',
    offerDetails: '',
    communitySubscribers: 0,
    monthlyPricePerSub: 0,
    currency: 'DH',
    newMembersThisMonth: 0,
    resultsMilestones: '',
    revenueSharePercent: 50,
    contractStatus: 'Pending',
    vaultNotes: '',
  });

  // Sync state whenever selected creator changes
  useEffect(() => {
    if (creator) {
      setVaultForm({
        igUsername: creator.vault?.igUsername || (creator.handle ? creator.handle.replace('@', '') : ''),
        igPassword: creator.vault?.igPassword || '',
        coachPhone: creator.vault?.coachPhone || '',
        skoolCommunityUrl: creator.vault?.skoolCommunityUrl || '',
        assetsDriveUrl: creator.vault?.assetsDriveUrl || '',
        cihBankRib: creator.vault?.cihBankRib || '',
        brandName: creator.vault?.brandName || (creator.name ? `${creator.name} Coaching` : ''),
        brandAngle: creator.vault?.brandAngle || (creator.niche ? `${creator.niche} Transformation Program` : ''),
        brandDescription: creator.vault?.brandDescription || creator.notes || '',
        offerDetails: creator.vault?.offerDetails || '',
        communitySubscribers: creator.vault?.communitySubscribers ?? 0,
        monthlyPricePerSub: creator.vault?.monthlyPricePerSub ?? 0,
        currency: creator.vault?.currency || 'DH',
        newMembersThisMonth: creator.vault?.newMembersThisMonth ?? 0,
        resultsMilestones: creator.vault?.resultsMilestones || '',
        revenueSharePercent: creator.vault?.revenueSharePercent ?? 50,
        contractStatus: creator.vault?.contractStatus || (creator.status === 'Closed' ? 'Signed' : 'Pending'),
        vaultNotes: creator.vault?.vaultNotes || '',
      });
      setShowPassword(false);
      setHasUnsavedChanges(false);
    }
  }, [creator]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !creator) return null;

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2200);
  };

  const handleFormChange = (field: keyof CreatorVault, value: any) => {
    setVaultForm(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    const updatedVault: CreatorVault = {
      ...vaultForm,
      lastUpdated: new Date().toISOString(),
    };
    onSaveVault(creator.id, updatedVault);
    setHasUnsavedChanges(false);
  };

  // Calculations
  const subscribers = Number(vaultForm.communitySubscribers) || 0;
  const pricePerSub = Number(vaultForm.monthlyPricePerSub) || 0;
  const revShare = Number(vaultForm.revenueSharePercent) || 50;
  const grossMRR = subscribers * pricePerSub;
  const zakShareMRR = Math.round(grossMRR * (revShare / 100));

  const getStatusBadge = () => {
    switch (creator.status) {
      case 'Closed':
        return 'bg-emerald-500 text-white border-neutral-900';
      case 'Zoom Booked':
        return 'bg-amber-400 text-black border-neutral-900';
      case 'Loom Sent':
        return 'bg-purple-500 text-white border-neutral-900';
      case 'DM Sent':
        return 'bg-blue-500 text-white border-neutral-900';
      case 'Rejected':
        return 'bg-rose-500 text-white border-neutral-900';
      default:
        return isDarkMode ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-neutral-200 text-black border-neutral-900';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl md:max-w-2xl flex flex-col border-l-2 shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 ease-out animate-in slide-in-from-right ${
          isDarkMode 
            ? 'bg-[#181715] text-[#F4F2ED] border-neutral-700' 
            : 'bg-[#FAF8F5] text-[#111111] border-neutral-900'
        }`}
      >
        {/* Drawer Header */}
        <div className={`p-5 md:p-6 border-b-2 flex flex-col gap-3 ${
          isDarkMode ? 'border-neutral-800 bg-[#141312]' : 'border-neutral-900 bg-[#F4F1EA]'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded border-2 border-neutral-900 flex items-center justify-center font-serif text-xl font-bold shrink-0 ${
                isDarkMode ? 'bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]' : 'bg-blue-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                {creator.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl md:text-2xl font-bold leading-tight tracking-tight">
                    {creator.name}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <a
                    href={creator.profileUrl || `https://instagram.com/${creator.handle.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-blue-500 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    <span>{creator.handle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {vaultForm.coachPhone && (
                    <>
                      <span className="opacity-40">&bull;</span>
                      <a
                        href={`https://wa.me/${vaultForm.coachPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-emerald-600 hover:underline inline-flex items-center gap-1"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>{vaultForm.coachPhone}</span>
                      </a>
                    </>
                  )}
                  <span className="opacity-40">&bull;</span>
                  <span className="font-mono text-xs opacity-75">{creator.niche} Coach</span>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className={`p-2 border-2 rounded transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                isDarkMode 
                  ? 'border-neutral-700 bg-[#1C1B19] hover:bg-neutral-800 text-neutral-300' 
                  : 'border-neutral-900 bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              title="Close Drawer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badges bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className={`font-mono text-xs font-bold px-2.5 py-0.5 border rounded uppercase tracking-wider ${getStatusBadge()}`}>
                {creator.status === 'Closed' ? 'ACTIVE PARTNER (خدام معاه)' : creator.status}
              </span>
              <span className={`font-mono text-xs px-2 py-0.5 border rounded ${
                isDarkMode ? 'border-neutral-700 bg-neutral-800/80 text-neutral-300' : 'border-neutral-900 bg-white text-neutral-800'
              }`}>
                {creator.coachCategory}
              </span>
            </div>

            {grossMRR > 0 && (
              <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Community: {grossMRR.toLocaleString()} {vaultForm.currency} &bull; Zak ({revShare}%): {zakShareMRR.toLocaleString()} {vaultForm.currency}
              </div>
            )}
          </div>
        </div>

        {/* 3-Tab Navigation Bar */}
        <div className={`px-4 md:px-6 border-b-2 flex overflow-x-auto gap-2 ${
          isDarkMode ? 'border-neutral-800 bg-[#141312]' : 'border-neutral-900 bg-[#EFECE5]'
        }`}>
          <button
            onClick={() => setActiveTab('brand_results')}
            className={`py-3 px-3.5 font-mono text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'brand_results'
                ? isDarkMode
                  ? 'border-amber-400 text-amber-400 bg-[#1C1B19]'
                  : 'border-neutral-900 text-neutral-900 bg-white shadow-[-2px_-2px_0px_0px_rgba(0,0,0,0.05)]'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>[ 📈 BRAND &amp; RESULTS ]</span>
            {subscribers > 0 && (
              <span className="font-mono text-[10px] px-1 rounded bg-amber-500 text-black font-bold">
                {subscribers} subs
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`py-3 px-3.5 font-mono text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'vault'
                ? isDarkMode
                  ? 'border-emerald-400 text-emerald-400 bg-[#1C1B19]'
                  : 'border-neutral-900 text-neutral-900 bg-white shadow-[-2px_-2px_0px_0px_rgba(0,0,0,0.05)]'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>[ 🔒 VAULT &amp; BANK ]</span>
            {vaultForm.igPassword && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('crm')}
            className={`py-3 px-3.5 font-mono text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'crm'
                ? isDarkMode
                  ? 'border-blue-400 text-blue-400 bg-[#1C1B19]'
                  : 'border-neutral-900 text-neutral-900 bg-white shadow-[-2px_-2px_0px_0px_rgba(0,0,0,0.05)]'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>[ 📋 CRM &amp; MEMO ]</span>
          </button>
        </div>

        {/* Drawer Body Area */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: BRAND IDENTITY & LIVE RESULTS TRACKER (NEW CORE FEATURE) */}
          {/* ========================================================================= */}
          {activeTab === 'brand_results' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Highlight Banner */}
              <div className={`p-4 border-2 rounded ${
                isDarkMode 
                  ? 'border-amber-500/40 bg-amber-950/20 text-amber-300' 
                  : 'border-neutral-900 bg-[#FFFDF7] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Client Brand &amp; Skool Performance Tracker • نتائج البراند
                  </span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed font-sans">
                  قيد هنا معلومات البراند، التوجه ديالو، عدد المشتركين فالكوميونيتي وشحال كيخلصو. هاد الأرقام كتطلع أوتوماتيكياً فالداشبورد العام ديالك!
                </p>
              </div>

              {/* 1. BRAND RESULTS & REVENUE CALCULATOR CARD */}
              <div className={`p-4 md:p-5 border-2 rounded space-y-4 ${
                isDarkMode ? 'border-neutral-800 bg-[#1C1B19]' : 'border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-dashed border-current opacity-85">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="font-mono text-xs uppercase tracking-wider font-bold">
                      Community Results &amp; MRR (النتائج والسبسكرايبرز)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase">
                    Live Dashboard Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Current Active Subscribers */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider opacity-85 font-bold mb-1">
                      Paying Subscribers (عدد المشتركين)
                    </label>
                    <div className="relative">
                      <Users className="w-3.5 h-3.5 absolute left-3 top-3 opacity-50" />
                      <input
                        type="number"
                        min="0"
                        value={vaultForm.communitySubscribers ?? 0}
                        onChange={(e) => handleFormChange('communitySubscribers', Number(e.target.value))}
                        placeholder="20"
                        className={`w-full pl-8 pr-3 py-2 border font-mono text-sm font-bold rounded focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
                          isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-mono opacity-60 mt-0.5 block">e.g. 20 subscribers</span>
                  </div>

                  {/* Monthly Price per Subscriber */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider opacity-85 font-bold mb-1">
                      Price per Sub (شحال كيخلص فالشهر)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={vaultForm.monthlyPricePerSub ?? 0}
                        onChange={(e) => handleFormChange('monthlyPricePerSub', Number(e.target.value))}
                        placeholder="500"
                        className={`w-full px-3 py-2 border font-mono text-sm font-bold rounded focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
                          isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                        }`}
                      />
                      <select
                        value={vaultForm.currency || 'DH'}
                        onChange={(e) => handleFormChange('currency', e.target.value as any)}
                        className={`px-2 py-2 border font-mono text-xs font-bold rounded focus:outline-none ${
                          isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                        }`}
                      >
                        <option value="DH">DH</option>
                        <option value="$">$</option>
                        <option value="€">€</option>
                      </select>
                    </div>
                    <span className="text-[10px] font-mono opacity-60 mt-0.5 block">e.g. 500 DH/mo</span>
                  </div>

                  {/* New Members Acquired */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider opacity-85 font-bold mb-1">
                      New Members (هاد الشهر)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={vaultForm.newMembersThisMonth ?? 0}
                      onChange={(e) => handleFormChange('newMembersThisMonth', Number(e.target.value))}
                      placeholder="6"
                      className={`w-full px-3 py-2 border font-mono text-sm font-bold rounded focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
                        isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                      }`}
                    />
                    <span className="text-[10px] font-mono opacity-60 mt-0.5 block">New backend acquisitions</span>
                  </div>
                </div>

                {/* Live Auto-Calculated Economics Display */}
                <div className={`p-4 border-2 rounded ${
                  isDarkMode ? 'bg-[#141312] border-neutral-700' : 'bg-[#F4F1EA] border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                }`}>
                  <div className="text-[11px] font-mono uppercase tracking-wider opacity-70 mb-2 font-bold flex items-center justify-between">
                    <span>LIVE CALCULATION RESULTS // الحساب الآني للمداخيل</span>
                    <span>Growth Operator Split: {revShare}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase opacity-60 block">Total Community Gross MRR</span>
                      <div className="font-mono text-xl md:text-2xl font-bold text-blue-500">
                        {grossMRR.toLocaleString()} {vaultForm.currency}/mo
                      </div>
                      <span className="text-[10px] font-mono opacity-60">
                        {subscribers} subs &times; {pricePerSub} {vaultForm.currency}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase opacity-60 block">Zak's Revenue Share ({revShare}%)</span>
                      <div className="font-mono text-xl md:text-2xl font-bold text-emerald-500">
                        {zakShareMRR.toLocaleString()} {vaultForm.currency}/mo
                      </div>
                      <span className="text-[10px] font-mono opacity-60">
                        صافي مدخولك الشهري من هذا الكوتش
                      </span>
                    </div>
                  </div>
                </div>

                {/* Results & Milestones Notes */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-85 font-bold mb-1">
                    Results &amp; Growth Milestones (النتائج والريزولتس اللي درتي معاه)
                  </label>
                  <textarea
                    rows={2}
                    value={vaultForm.resultsMilestones || ''}
                    onChange={(e) => handleFormChange('resultsMilestones', e.target.value)}
                    placeholder="مثال: دوزناه من 0 لـ 20 سبسكرايبر فـ 30 يوم، طلقنا VSL جديد فـ Instagram Stories، Churn rate 0%..."
                    className={`w-full px-3 py-2 border font-mono text-xs rounded focus:outline-none leading-relaxed ${
                      isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                    }`}
                  />
                </div>
              </div>

              {/* 2. BRAND IDENTITY & POSITIONING CARD */}
              <div className={`p-4 md:p-5 border-2 rounded space-y-4 ${
                isDarkMode ? 'border-neutral-800 bg-[#1C1B19]' : 'border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-dashed border-current opacity-85">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-500" />
                    <span className="font-mono text-xs uppercase tracking-wider font-bold">
                      Brand Strategy &amp; Positioning (معلومات البراند والتوجه)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">Brand Blueprint</span>
                </div>

                {/* Brand Name */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-85 font-bold mb-1">
                    Brand / Community Name (اسم البراند أو الأكاديمية)
                  </label>
                  <input
                    type="text"
                    value={vaultForm.brandName || ''}
                    onChange={(e) => handleFormChange('brandName', e.target.value)}
                    placeholder="e.g. IronMind Elite Academy"
                    className={`w-full px-3 py-2 border font-mono text-xs font-bold rounded focus:outline-none ${
                      isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                    }`}
                  />
                </div>

                {/* Brand Angle / Positioning */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-85 font-bold mb-1">
                    Brand Angle &amp; Niche Positioning (التوجه ديال البراند والفئة المستهدفة)
                  </label>
                  <input
                    type="text"
                    value={vaultForm.brandAngle || ''}
                    onChange={(e) => handleFormChange('brandAngle', e.target.value)}
                    placeholder="مثال: خسارة الوزن وبناء العضلات لرجال الأعمال والمقاولين في المغرب (High-ticket transformation for busy founders)"
                    className={`w-full px-3 py-2 border font-mono text-xs rounded focus:outline-none ${
                      isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                    }`}
                  />
                  <span className="text-[10px] font-mono opacity-60 mt-0.5 block">
                    Angle positioning helps when designing VSLs, DM hooks, and backend messaging.
                  </span>
                </div>

                {/* Brand Description */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-85 font-bold mb-1">
                    Brand Description &amp; Core Value Proposition (ديسكربشن البراند)
                  </label>
                  <textarea
                    rows={3}
                    value={vaultForm.brandDescription || ''}
                    onChange={(e) => handleFormChange('brandDescription', e.target.value)}
                    placeholder="ديسكربشن كاملة على البراند ديال الكوتش: شنو كيقدم، القيمة المضافة، طريقة الشرح، ونوعية المحتوى..."
                    className={`w-full px-3 py-2 border font-mono text-xs rounded focus:outline-none leading-relaxed ${
                      isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                    }`}
                  />
                </div>

                {/* Offer Details */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-85 font-bold mb-1">
                    Offer &amp; Delivery Details (معلومات الأوفر: 1-on-1 vs Community)
                  </label>
                  <input
                    type="text"
                    value={vaultForm.offerDetails || ''}
                    onChange={(e) => handleFormChange('offerDetails', e.target.value)}
                    placeholder="e.g. Weekly live Q&A on Zoom + Skool Workout Library + WhatsApp VIP Group"
                    className={`w-full px-3 py-2 border font-mono text-xs rounded focus:outline-none ${
                      isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SECURE CREDENTIALS, BANK RIB & LINKS */}
          {/* ========================================================================= */}
          {activeTab === 'vault' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Security Banner */}
              <div className={`p-3.5 border-2 rounded flex items-start gap-3 ${
                isDarkMode 
                  ? 'border-emerald-600/40 bg-emerald-950/20 text-emerald-300' 
                  : 'border-emerald-900 bg-emerald-50 text-emerald-900 shadow-[3px_3px_0px_0px_rgba(16,185,129,0.3)]'
              }`}>
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                <div className="text-xs">
                  <div className="font-mono font-bold uppercase tracking-wider">
                    Client Operational Vault • خزانة معلومات الكوتش الحساسة
                  </div>
                  <div className="font-sans opacity-85 text-[11px] mt-0.5 leading-relaxed">
                    هنا كتسجل الباسورد، النمرة، والـ RIB ديال لا بنك باش تنقله وتلصقه بنقرة واحدة فالشات.
                  </div>
                </div>
              </div>

              {/* 1. DIRECT CONTACT & WHATSAPP CARD */}
              <div className={`p-4 md:p-5 border-2 rounded space-y-3 ${
                isDarkMode ? 'border-neutral-800 bg-[#1C1B19]' : 'border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-dashed border-current opacity-85">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span className="font-mono text-xs uppercase tracking-wider font-bold">
                      Direct Phone &amp; WhatsApp (نمرة الكوتش)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">VIP Direct Line</span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-75 mb-1.5 font-bold">
                    Phone / WhatsApp Number (مع رمز الدولة)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={vaultForm.coachPhone || ''}
                      onChange={(e) => handleFormChange('coachPhone', e.target.value)}
                      placeholder="+212 600 000000"
                      className={`flex-1 px-3 py-2 border font-mono text-xs font-bold rounded focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
                        isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                      }`}
                    />
                    {vaultForm.coachPhone && (
                      <a
                        href={`https://wa.me/${vaultForm.coachPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-3 py-2 border rounded font-mono text-xs font-bold flex items-center gap-1.5 bg-emerald-500 text-white border-neutral-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-600`}
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WHATSAPP</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopy(vaultForm.coachPhone || '', 'coachPhone')}
                      disabled={!vaultForm.coachPhone}
                      className={`px-3 py-2 border rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                        copiedKey === 'coachPhone'
                          ? 'bg-emerald-500 text-white border-neutral-900'
                          : isDarkMode
                          ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white'
                          : 'border-neutral-900 bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      } disabled:opacity-40 disabled:pointer-events-none`}
                    >
                      {copiedKey === 'coachPhone' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'coachPhone' ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. INSTAGRAM CREDENTIALS CARD */}
              <div className={`p-4 md:p-5 border-2 rounded space-y-4 ${
                isDarkMode ? 'border-neutral-800 bg-[#1C1B19]' : 'border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-dashed border-current opacity-85">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-pink-500" />
                    <span className="font-mono text-xs uppercase tracking-wider font-bold">
                      Instagram Account Access (كلمات السر)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">Stories &amp; DM Triage</span>
                </div>

                {/* IG Username */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-75 mb-1.5 font-bold">
                    IG Username / Handle
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 font-mono text-xs opacity-50">@</span>
                      <input
                        type="text"
                        value={vaultForm.igUsername || ''}
                        onChange={(e) => handleFormChange('igUsername', e.target.value)}
                        placeholder="coach.fitness"
                        className={`w-full pl-7 pr-3 py-2 border font-mono text-xs rounded focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
                          isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(vaultForm.igUsername || '', 'igUser')}
                      disabled={!vaultForm.igUsername}
                      className={`px-3 py-2 border rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                        copiedKey === 'igUser'
                          ? 'bg-emerald-500 text-white border-neutral-900'
                          : isDarkMode
                          ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white'
                          : 'border-neutral-900 bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      } disabled:opacity-40 disabled:pointer-events-none`}
                    >
                      {copiedKey === 'igUser' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'igUser' ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>
                </div>

                {/* IG Password with Show/Hide & Copy */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-75 mb-1.5 font-bold">
                    IG Password (كلمة السر)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={vaultForm.igPassword || ''}
                        onChange={(e) => handleFormChange('igPassword', e.target.value)}
                        placeholder="••••••••••••••••"
                        className={`w-full pl-3 pr-10 py-2 border font-mono text-xs rounded focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
                          isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 opacity-60 hover:opacity-100 transition-opacity p-0.5"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(vaultForm.igPassword || '', 'igPass')}
                      disabled={!vaultForm.igPassword}
                      className={`px-3 py-2 border rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                        copiedKey === 'igPass'
                          ? 'bg-emerald-500 text-white border-neutral-900'
                          : isDarkMode
                          ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white'
                          : 'border-neutral-900 bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      } disabled:opacity-40 disabled:pointer-events-none`}
                    >
                      {copiedKey === 'igPass' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'igPass' ? 'COPIED!' : 'COPY'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. FINANCIALS: CIH BANK RIB (Crucial Feature) */}
              <div className={`p-4 md:p-5 border-2 rounded space-y-3 ${
                isDarkMode 
                  ? 'border-amber-500/40 bg-[#1F1B14]' 
                  : 'border-neutral-900 bg-[#FFFDF9] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-dashed border-current opacity-85">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span className="font-mono text-xs uppercase tracking-wider font-bold">
                      Financials &bull; CIH Bank RIB (الريب البنكي)
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 border border-amber-500 text-amber-600 dark:text-amber-400 font-bold rounded">
                    QUICK WIRE TRANSFER
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider opacity-85 font-bold">
                      24-Digit CIH Bank RIB (رقم الحساب البنكي بالمغرب)
                    </label>
                    <span className="text-[10px] font-mono opacity-60">
                      {vaultForm.cihBankRib ? `${vaultForm.cihBankRib.replace(/\s+/g, '').length}/24 digits` : '24 digits'}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={vaultForm.cihBankRib || ''}
                    onChange={(e) => handleFormChange('cihBankRib', e.target.value)}
                    placeholder="230 780 1234567890123456 78"
                    className={`w-full px-3 py-2.5 border font-mono text-sm tracking-wider font-bold rounded focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
                      isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-white border-neutral-900 text-black'
                    }`}
                  />
                  <p className="text-[10px] font-mono opacity-60 mt-1">
                    انسخ هذا الحساب بضغطة زر واحدة لإرساله فوراً للزبناء في رسائل الإنستغرام أو الواتساب.
                  </p>
                </div>

                {/* Big Tactile Copy Button for RIB */}
                <button
                  type="button"
                  onClick={() => handleCopy(vaultForm.cihBankRib || '', 'cihRib')}
                  disabled={!vaultForm.cihBankRib}
                  className={`w-full py-2.5 px-4 rounded border-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                    copiedKey === 'cihRib'
                      ? 'bg-emerald-500 text-white border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : isDarkMode
                      ? 'border-amber-500/80 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                      : 'border-neutral-900 bg-amber-400 hover:bg-amber-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  } disabled:opacity-40 disabled:pointer-events-none`}
                >
                  {copiedKey === 'cihRib' ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>COPIED RIB TO CLIPBOARD! / تم النسخ بنجاح</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>COPY CIH BANK RIB (لصق في الرسائل)</span>
                    </>
                  )}
                </button>
              </div>

              {/* 4. SKOOL & DRIVE ASSETS */}
              <div className={`p-4 md:p-5 border-2 rounded space-y-4 ${
                isDarkMode ? 'border-neutral-800 bg-[#1C1B19]' : 'border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-dashed border-current opacity-85">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-blue-500" />
                    <span className="font-mono text-xs uppercase tracking-wider font-bold">
                      Platform Links &amp; Creative Assets
                    </span>
                  </div>
                </div>

                {/* Skool Link */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-75 mb-1.5 font-bold">
                    Skool Community URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={vaultForm.skoolCommunityUrl || ''}
                      onChange={(e) => handleFormChange('skoolCommunityUrl', e.target.value)}
                      placeholder="https://www.skool.com/creator-accelerator"
                      className={`flex-1 px-3 py-2 border font-mono text-xs rounded focus:outline-none ${
                        isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                      }`}
                    />
                    {vaultForm.skoolCommunityUrl && (
                      <a
                        href={vaultForm.skoolCommunityUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-3 py-2 border rounded font-mono text-xs font-bold flex items-center gap-1 transition-all ${
                          isDarkMode ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700' : 'border-neutral-900 bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>OPEN</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopy(vaultForm.skoolCommunityUrl || '', 'skoolLink')}
                      disabled={!vaultForm.skoolCommunityUrl}
                      className={`px-3 py-2 border rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                        copiedKey === 'skoolLink' ? 'bg-emerald-500 text-white' : isDarkMode ? 'bg-neutral-800' : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      } disabled:opacity-40`}
                    >
                      {copiedKey === 'skoolLink' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Drive Link */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-75 mb-1.5 font-bold">
                    Assets Drive URL (Raw Videos, Reels, Logos)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={vaultForm.assetsDriveUrl || ''}
                      onChange={(e) => handleFormChange('assetsDriveUrl', e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className={`flex-1 px-3 py-2 border font-mono text-xs rounded focus:outline-none ${
                        isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                      }`}
                    />
                    {vaultForm.assetsDriveUrl && (
                      <a
                        href={vaultForm.assetsDriveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-3 py-2 border rounded font-mono text-xs font-bold flex items-center gap-1 transition-all ${
                          isDarkMode ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700' : 'border-neutral-900 bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>OPEN</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopy(vaultForm.assetsDriveUrl || '', 'driveLink')}
                      disabled={!vaultForm.assetsDriveUrl}
                      className={`px-3 py-2 border rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                        copiedKey === 'driveLink' ? 'bg-emerald-500 text-white' : isDarkMode ? 'bg-neutral-800' : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      } disabled:opacity-40`}
                    >
                      {copiedKey === 'driveLink' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. PARTNERSHIP OPERATIONS & NOTES */}
              <div className={`p-4 md:p-5 border-2 rounded space-y-4 ${
                isDarkMode ? 'border-neutral-800 bg-[#1C1B19]' : 'border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-dashed border-current opacity-85">
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">
                    Partnership Economics &amp; 2FA Notes
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider opacity-75 mb-1.5 font-bold">
                      Rev-Share %
                    </label>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <input
                        type="number"
                        value={vaultForm.revenueSharePercent ?? 50}
                        onChange={(e) => handleFormChange('revenueSharePercent', Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded font-mono text-xs font-bold focus:outline-none ${
                          isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                        }`}
                      />
                      <span className="font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider opacity-75 mb-1.5 font-bold">
                      Contract Status
                    </label>
                    <select
                      value={vaultForm.contractStatus || 'Pending'}
                      onChange={(e) => handleFormChange('contractStatus', e.target.value as any)}
                      className={`w-full px-2.5 py-2 border rounded font-mono text-xs font-bold focus:outline-none ${
                        isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                      }`}
                    >
                      <option value="Drafted">Drafted</option>
                      <option value="Pending">Pending Signature</option>
                      <option value="Signed">Signed (50/50)</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider opacity-75 mb-1.5 font-bold">
                    Vault Operational Notes (2FA Codes, Backup Email)
                  </label>
                  <textarea
                    rows={2}
                    value={vaultForm.vaultNotes || ''}
                    onChange={(e) => handleFormChange('vaultNotes', e.target.value)}
                    placeholder="e.g. 2FA backup codes, manager WhatsApp, alternative email..."
                    className={`w-full px-3 py-2 border font-mono text-xs rounded focus:outline-none ${
                      isDarkMode ? 'bg-[#141312] border-neutral-700 text-white' : 'bg-[#FAF8F5] border-neutral-900 text-black'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CRM DETAILS & TOUCHPOINTS */}
          {/* ========================================================================= */}
          {activeTab === 'crm' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Financial Snapshot */}
              <div className={`p-4 border-2 rounded ${
                isDarkMode ? 'border-neutral-800 bg-[#1C1B19]' : 'border-neutral-900 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 mb-3 border-dashed border-current opacity-75">
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">CRM Deal Economics</span>
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">{revShare}% Split</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase opacity-60 block">Estimated Potential MRR</span>
                    <span className="font-mono text-lg font-bold text-blue-500">
                      {creator.estimatedMRR ? `${creator.estimatedMRR.toLocaleString()} DH` : '0 DH'}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase opacity-60 block">Realized Monthly Payout</span>
                    <span className="font-mono text-lg font-bold text-emerald-500">
                      {zakShareMRR > 0 ? `${zakShareMRR.toLocaleString()} ${vaultForm.currency}` : creator.actualMRR ? `${creator.actualMRR.toLocaleString()} DH` : '0 DH'}/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Strategic Rationale & Notes */}
              <div className={`p-4 border-2 rounded ${
                isDarkMode ? 'border-neutral-800 bg-[#1C1B19]' : 'border-neutral-900 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 mb-3 border-dashed border-current opacity-75">
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">Scaling Rationale &amp; Memo</span>
                  <button 
                    onClick={() => onOpenEditModal(creator)}
                    className="font-mono text-[11px] underline flex items-center gap-1 hover:opacity-100 opacity-70"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
                <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap">
                  {creator.notes || 'No analysis recorded yet.'}
                </p>
              </div>

              {/* Touchpoints Log Timeline */}
              <div className={`p-4 border-2 rounded ${
                isDarkMode ? 'border-neutral-800 bg-[#1C1B19]' : 'border-neutral-900 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 mb-3 border-dashed border-current opacity-75">
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">
                    Touchpoint History ({creator.touchpoints?.length || 0})
                  </span>
                  <button
                    onClick={() => onOpenEditModal(creator)}
                    className="font-mono text-[11px] underline flex items-center gap-1 text-blue-500"
                  >
                    + Log Interaction
                  </button>
                </div>

                {(!creator.touchpoints || creator.touchpoints.length === 0) ? (
                  <div className="py-4 text-center text-xs font-mono opacity-50">
                    No outbound messages or audit calls logged yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {creator.touchpoints.map((tp, idx) => (
                      <div 
                        key={tp.id || idx}
                        className={`p-2.5 rounded border text-xs font-mono ${
                          isDarkMode ? 'border-neutral-800 bg-[#141312]' : 'border-neutral-200 bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="text-blue-500">{tp.type}</span>
                          <span className="opacity-60 text-[10px]">{tp.date}</span>
                        </div>
                        <p className="font-sans text-xs opacity-85 leading-normal">{tp.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className={`p-4 md:p-5 border-t-2 flex items-center justify-between gap-3 ${
          isDarkMode ? 'border-neutral-800 bg-[#141312]' : 'border-neutral-900 bg-[#F4F1EA]'
        }`}>
          <div className="text-xs font-mono">
            {hasUnsavedChanges ? (
              <span className="text-amber-500 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                Unsaved edits
              </span>
            ) : (
              <span className="text-emerald-500 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Synced to Cloud &amp; Dashboard</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded border-2 font-mono text-xs font-bold transition-all ${
                isDarkMode 
                  ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300' 
                  : 'border-neutral-900 bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              CLOSE
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2 rounded border-2 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5 ${
                isDarkMode
                  ? 'border-emerald-500 bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'border-neutral-900 bg-neutral-900 hover:bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SAVE &amp; SYNC TO DASHBOARD</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
