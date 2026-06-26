"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { 
  Building2, 
  CreditCard, 
  ShoppingBag, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  Sparkles
} from "lucide-react";

import axiosInstance from "@/app/utils/axiosinterceptor";
import { razorpayAdminService } from "@/services/admin/razorpay.service";
import { settingsAdminService } from "@/services/admin/settings.service";
import { getMediaUrl } from "@/app/utils/getAssetsUrl";

function Masked({ value, visible = false }) {
  const masked = useMemo(
    () => (value ? "•".repeat(Math.max(6, Math.min(12, value.length))) : ""),
    [value]
  );
  return (
    <span className="font-mono text-sm tracking-widest opacity-70">
      {visible ? value : masked}
    </span>
  );
}

const supportedCurrencies = {
  USD: { symbol: "$", position: "prefix" },
  EUR: { symbol: "€", position: "prefix" },
  INR: { symbol: "₹", position: "prefix" },
};

const Settings = () => {
  const [showSecrets, setShowSecrets] = useState(false);

  const [rzp, setRzp] = useState({
    keyId: "",
    keySecret: "",
    webhookSecret: "",
  });

  const [activeRzp, setActiveRzp] = useState(null);

  const [settings, setSettings] = useState({
    currency: { code: "USD", symbol: "$", position: "prefix" },
    commissionPercent: 15,
    taxPercent: 0,
    payoutThreshold: 50,
  });

  const [basicInfo, setBasicInfo] = useState({
    platformName: "",
    platformUrl: "",
    contactEmail: "",
    supportPhone: "",
    address: "",
    branding: { logoUrl: "" },
  });

  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const resp = await settingsAdminService.get();
        if (resp?.settings) {
          const s = resp.settings;
          setBasicInfo({
            platformName: s.platformName || "",
            platformUrl: s.platformUrl || "",
            contactEmail: s.contactEmail || "",
            supportPhone: s.supportPhone || "",
            address: s.address || "",
            branding: { logoUrl: s.branding?.logoUrl || "" },
          });

          setSettings({
            currency: {
              code: s.currency?.code || "USD",
              symbol: s.currency?.symbol || "$",
              position: s.currency?.position || "prefix",
            },
            commissionPercent: s.commissionPercent ?? 15,
            taxPercent: s.taxPercent ?? 0,
            payoutThreshold: s.payoutThreshold ?? 50,
          });

          if (s.branding?.logoUrl) setLogoPreview(s.branding.logoUrl);
        }

        const rzpResp = await razorpayAdminService.getActiveCredential();
        if (rzpResp?.credential) {
          setActiveRzp(rzpResp.credential);
          setRzp({
            keyId: rzpResp.credential.keyId || "",
            keySecret: "",
            webhookSecret: rzpResp.credential.webhookSecret || "",
          });
        }
      } catch (error) {
        toast.error("Failed to load settings data.");
      }
    };

    loadData();
  }, []);

  const onSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await settingsAdminService.update(settings);
      if (res) toast.success("Commerce settings updated successfully! 🛍️");
    } catch {
      toast.error("Failed to update commerce settings.");
    }
  };

  const onSaveBasicInfo = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put("/settings", basicInfo);
      if (res.data?.settings) toast.success("Platform information updated! ✨");
    } catch {
      toast.error("Failed to update platform information.");
    }
  };

  const onSaveRazorpay = async (e) => {
    e.preventDefault();
    if (!rzp.keyId || !rzp.keySecret) {
      toast.error("Please enter both Key ID and Key Secret.");
      return;
    }
    try {
      const res = await razorpayAdminService.addCredential(rzp);
      if (res?.success) {
        setActiveRzp(res.credential);
        toast.success("Razorpay credentials activated! 💳");
      }
    } catch {
      toast.error("Failed to save Razorpay credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Playful Header */}
        <header className="flex items-center gap-4">
          <div className="p-4 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Platform Hub
            </h1>
            <p className="text-slate-500 text-lg mt-1 font-medium">
              Tweak your colors, coins, and configs.
            </p>
          </div>
        </header>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ==============================================
              BASIC INFO (Left Column - Spans 7 cols)
              Theme: Warm Sunset (Orange/Rose)
          ============================================== */}
          <div className="lg:col-span-7 bg-gradient-to-br from-orange-100 to-rose-100 rounded-[2.5rem] p-8 border border-white/50 shadow-sm relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-300/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-8 relative z-10">
              <Building2 className="w-7 h-7 text-orange-600" />
              <h2 className="text-2xl font-bold text-orange-950">Brand & Contact</h2>
            </div>

            <form onSubmit={onSaveBasicInfo} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-orange-900/80 ml-1">Platform Name</label>
                  <input
                    placeholder="Acme Corp"
                    className="w-full bg-white/60 border border-white focus:bg-white focus:ring-4 focus:ring-orange-200 rounded-2xl px-5 py-3.5 outline-none transition-all text-orange-950 placeholder:text-orange-950/30 shadow-sm"
                    value={basicInfo.platformName}
                    onChange={(e) => setBasicInfo({ ...basicInfo, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-orange-900/80 ml-1">Website URL</label>
                  <input
                    placeholder="https://example.com"
                    className="w-full bg-white/60 border border-white focus:bg-white focus:ring-4 focus:ring-orange-200 rounded-2xl px-5 py-3.5 outline-none transition-all text-orange-950 placeholder:text-orange-950/30 shadow-sm"
                    value={basicInfo.platformUrl}
                    onChange={(e) => setBasicInfo({ ...basicInfo, platformUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-orange-900/80 ml-1">Support Email</label>
                  <input
                    type="email"
                    placeholder="hello@example.com"
                    className="w-full bg-white/60 border border-white focus:bg-white focus:ring-4 focus:ring-orange-200 rounded-2xl px-5 py-3.5 outline-none transition-all text-orange-950 placeholder:text-orange-950/30 shadow-sm"
                    value={basicInfo.contactEmail}
                    onChange={(e) => setBasicInfo({ ...basicInfo, contactEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-orange-900/80 ml-1">Phone Number</label>
                  <input
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white/60 border border-white focus:bg-white focus:ring-4 focus:ring-orange-200 rounded-2xl px-5 py-3.5 outline-none transition-all text-orange-950 placeholder:text-orange-950/30 shadow-sm"
                    value={basicInfo.supportPhone}
                    onChange={(e) => setBasicInfo({ ...basicInfo, supportPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-orange-900/80 ml-1">HQ Address</label>
                <input
                  placeholder="123 Creativity Lane, Design City"
                  className="w-full bg-white/60 border border-white focus:bg-white focus:ring-4 focus:ring-orange-200 rounded-2xl px-5 py-3.5 outline-none transition-all text-orange-950 placeholder:text-orange-950/30 shadow-sm"
                  value={basicInfo.address}
                  onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })}
                />
              </div>

              {logoPreview && (
                <div className="p-4 bg-white/40 border border-white rounded-2xl w-fit flex items-center gap-4">
                  <img src={getMediaUrl(logoPreview)} alt="Logo" className="h-12 object-contain" />
                  <span className="text-sm font-semibold text-orange-900/60">Current Logo</span>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5 transition-all text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-orange-500/30"
                >
                  Save Brand Info
                </button>
              </div>
            </form>
          </div>

          {/* Right Column Stacks */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* ==============================================
                PAYMENTS (Top Right)
                Theme: Cool Mint (Teal/Emerald)
            ============================================== */}
            <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-[2.5rem] p-8 border border-white/50 shadow-sm relative overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-7 h-7 text-teal-600" />
                  <h2 className="text-2xl font-bold text-teal-950">Gateway</h2>
                </div>
                {activeRzp && (
                  <span className="flex items-center gap-1.5 bg-emerald-400/20 text-emerald-800 py-1.5 px-3 rounded-full text-xs font-bold border border-emerald-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </div>

              {activeRzp && (
                <div className="mb-6 p-4 bg-white/40 border border-white rounded-2xl flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-xs font-bold text-teal-900/60 mb-1">Razorpay Key ID</p>
                    <Masked value={activeRzp.keyId} visible={showSecrets} />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="p-2 bg-white/60 hover:bg-white rounded-full text-teal-700 transition-colors"
                  >
                    {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              <form onSubmit={onSaveRazorpay} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-teal-900/80 ml-1">New Key ID</label>
                  <input
                    placeholder="rzp_live_..."
                    className="w-full bg-white/60 border border-white focus:bg-white focus:ring-4 focus:ring-teal-200 rounded-2xl px-5 py-3 outline-none transition-all text-teal-950 placeholder:text-teal-950/30"
                    value={rzp.keyId}
                    onChange={(e) => setRzp({ ...rzp, keyId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-teal-900/80 ml-1">New Key Secret</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full bg-white/60 border border-white focus:bg-white focus:ring-4 focus:ring-teal-200 rounded-2xl px-5 py-3 outline-none transition-all text-teal-950 placeholder:text-teal-950/30"
                    value={rzp.keySecret}
                    onChange={(e) => setRzp({ ...rzp, keySecret: e.target.value })}
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-teal-500 hover:bg-teal-600 hover:-translate-y-0.5 transition-all text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-teal-500/30"
                  >
                    Sync Credentials
                  </button>
                </div>
              </form>
            </div>

            {/* ==============================================
                COMMERCE (Bottom Right)
                Theme: Bubblegum (Fuchsia/Purple)
            ============================================== */}
            <div className="bg-gradient-to-br from-fuchsia-100 to-purple-100 rounded-[2.5rem] p-8 border border-white/50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <ShoppingBag className="w-7 h-7 text-purple-600" />
                <h2 className="text-2xl font-bold text-purple-950">Marketplace</h2>
              </div>

              <form onSubmit={onSaveSettings} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-purple-900/80 ml-1">Primary Currency</label>
                  <div className="relative">
                    <select
                      className="w-full bg-white/60 border border-white focus:bg-white focus:ring-4 focus:ring-purple-200 rounded-2xl px-5 py-3 outline-none transition-all text-purple-950 appearance-none font-medium cursor-pointer"
                      value={settings.currency.code}
                      onChange={(e) => {
                        const code = e.target.value;
                        const selected = supportedCurrencies[code];
                        setSettings({
                          ...settings,
                          currency: { code, symbol: selected.symbol, position: selected.position },
                        });
                      }}
                    >
                      {Object.keys(supportedCurrencies).map((code) => (
                        <option key={code} value={code} className="text-slate-900">
                          {code} ({supportedCurrencies[code].symbol})
                        </option>
                      ))}
                    </select>
                    {/* Custom Select Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-600">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-purple-900/80 ml-1">Platform Cut %</label>
                    <input
                      type="number"
                      className="w-full bg-white/60 border border-white focus:bg-white focus:ring-4 focus:ring-purple-200 rounded-2xl px-5 py-3 outline-none transition-all text-purple-950"
                      value={settings.commissionPercent}
                      onChange={(e) => setSettings({ ...settings, commissionPercent: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-purple-900/80 ml-1">Tax Rate %</label>
                    <input
                      type="number"
                      className="w-full bg-white/60 border border-white focus:bg-white focus:ring-4 focus:ring-purple-200 rounded-2xl px-5 py-3 outline-none transition-all text-purple-950"
                      value={settings.taxPercent}
                      onChange={(e) => setSettings({ ...settings, taxPercent: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-purple-500 hover:bg-purple-600 hover:-translate-y-0.5 transition-all text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-purple-500/30"
                  >
                    Save Rules
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;