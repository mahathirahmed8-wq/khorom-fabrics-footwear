import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { PathaoCourierSettings } from '../../types';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Send,
  ExternalLink,
  Package,
  Clock,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';

export const AdminCourierTab: React.FC = () => {
  const {
    language,
    formatPrice,
    orders,
    fetchCourierSettings,
    updateCourierSettings,
    testCourierConnection,
    dispatchPathaoOrder,
    trackPathaoOrder,
    showToast,
  } = useStore();

  const [settings, setSettings] = useState<PathaoCourierSettings>({
    enabled: false,
    baseUrl: 'https://api-hermes.pathao.com',
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
    storeId: '',
    webhookSecret: '',
    environment: 'production',
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    stores?: any[];
  } | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<{ [orderId: string]: any }>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const data = await fetchCourierSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load courier settings', err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const ok = await updateCourierSettings(settings);
      if (ok) {
        showToast(
          language === 'bn'
            ? 'পাঠাও কুরিয়ার সেটিংস সফলভাবে সংরক্ষিত হয়েছে'
            : 'Pathao Courier settings saved successfully',
          'success'
        );
      } else {
        showToast(
          language === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save settings',
          'error'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testCourierConnection(settings);
      setTestResult(res);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test failed',
      });
      showToast('Connection test failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDispatch = async (orderId: string) => {
    setIsDispatching(orderId);
    try {
      const res = await dispatchPathaoOrder(orderId);
      if (res.success) {
        showToast(
          language === 'bn'
            ? `অর্ডার সফলভাবে পাঠাও কুরিয়ারে বুকিং হয়েছে! Consignment: ${res.consignmentId}`
            : `Order dispatched to Pathao! Consignment: ${res.consignmentId}`,
          'success'
        );
      } else {
        showToast(res.message || 'Dispatch failed', 'error');
      }
    } finally {
      setIsDispatching(null);
    }
  };

  const handleTrack = async (orderId: string) => {
    setIsTracking(orderId);
    try {
      const res = await trackPathaoOrder(orderId);
      if (res.success) {
        setTrackingData((prev) => ({ ...prev, [orderId]: res.data }));
        showToast(
          language === 'bn'
            ? `স্ট্যাটাস: ${res.data?.order_status || 'Up to date'}`
            : `Status: ${res.data?.order_status || 'Up to date'}`,
          'success'
        );
      } else {
        showToast(res.message || 'Tracking failed', 'error');
      }
    } finally {
      setIsTracking(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      (o.pathaoConsignmentId && o.pathaoConsignmentId.toLowerCase().includes(q))
    );
  });

  const pathaoDispatchedCount = orders.filter((o) => !!o.pathaoConsignmentId).length;

  return (
    <div id="admin-courier-tab" className="space-y-4 sm:space-y-6">
      {/* Header Overview Card */}
      <div className="bg-gradient-to-r from-[#0c1424] via-[#101b33] to-[#0c1424] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-md">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-serif flex items-center gap-2">
              <span>{language === 'bn' ? 'পাঠাও কুরিয়ার এপিআই ইন্টিগ্রেশন' : 'Pathao Courier API Integration'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-sans font-black">
                HERMES API
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'অর্ডার ওয়ান-ক্লিকে পাঠাও কুরিয়ারে বুকিং করুন, কনসাইনমেন্ট আইডি জেনারেট করুন এবং লাইভ ট্র্যাকিং পরিচালনা করুন।'
                : 'Direct parcel dispatch, consignment management, and live webhook tracking with Pathao Hermes API.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {language === 'bn' ? 'বুকড কনসাইনমেন্ট' : 'Pathao Parcels'}
            </div>
            <div className="text-lg font-black text-rose-400">
              {pathaoDispatchedCount} / {orders.length}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form Card */}
      <form onSubmit={handleSave} className="bg-[#0c1424] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-white">
              {language === 'bn' ? 'পাঠাও এপিআই ক্রেডেনশিয়ালস' : 'Pathao API Credentials'}
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer bg-[#080d19] px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-200">
              <span>{settings.enabled ? (language === 'bn' ? 'সক্রিয়' : 'Enabled') : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled')}</span>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 text-rose-500 accent-rose-500 cursor-pointer"
              />
            </label>

            <select
              value={settings.environment || 'production'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  environment: e.target.value as 'sandbox' | 'production',
                  baseUrl:
                    e.target.value === 'sandbox'
                      ? 'https://hermes-client-api.pathao.com'
                      : 'https://api-hermes.pathao.com',
                })
              }
              className="bg-[#080d19] border border-slate-800 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <option value="production">Production (লাইভ সার্ভার)</option>
              <option value="sandbox">Sandbox (টেস্টিং সার্ভার)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Pathao Hermes Base URL
            </label>
            <input
              type="text"
              value={settings.baseUrl}
              onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              placeholder="https://api-hermes.pathao.com"
              className="w-full bg-[#080d19] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Store ID (পাঠাও স্টোর আইডি)
            </label>
            <input
              type="text"
              value={settings.storeId || ''}
              onChange={(e) => setSettings({ ...settings, storeId: e.target.value })}
              placeholder="e.g. 12345"
              className="w-full bg-[#080d19] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={settings.clientId || ''}
              onChange={(e) => setSettings({ ...settings, clientId: e.target.value })}
              placeholder="Pathao Client ID"
              className="w-full bg-[#080d19] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Client Secret
            </label>
            <input
              type="password"
              value={settings.clientSecret || ''}
              onChange={(e) => setSettings({ ...settings, clientSecret: e.target.value })}
              placeholder="••••••••••••••••"
              className="w-full bg-[#080d19] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Username / Account Email
            </label>
            <input
              type="text"
              value={settings.username || ''}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              placeholder="merchant@pathao.com"
              className="w-full bg-[#080d19] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Password
            </label>
            <input
              type="password"
              value={settings.password || ''}
              onChange={(e) => setSettings({ ...settings, password: e.target.value })}
              placeholder="••••••••••••••••"
              className="w-full bg-[#080d19] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
            />
          </div>
        </div>

        {/* Action Buttons & Diagnostic Output */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? (language === 'bn' ? 'সংযোগ পরীক্ষা হচ্ছে...' : 'Testing Connection...') : (language === 'bn' ? 'পাঠাও এপিআই টেস্ট করুন' : 'Test Pathao Connection')}</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'ক্রেডেনশিয়ালস সংরক্ষণ করুন' : 'Save Credentials')}</span>
          </button>
        </div>

        {/* Test Diagnostics Result Box */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold">{testResult.message}</p>
              {testResult.stores && testResult.stores.length > 0 && (
                <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                  <p className="font-semibold text-white mb-1">Available Stores from Pathao:</p>
                  <div className="flex flex-wrap gap-2">
                    {testResult.stores.map((st: any) => (
                      <span
                        key={st.store_id || st.id}
                        className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer hover:bg-emerald-500/30"
                        onClick={() => setSettings({ ...settings, storeId: String(st.store_id || st.id) })}
                        title="Click to use this Store ID"
                      >
                        {st.store_name} (ID: {st.store_id || st.id})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Orders Dispatch & Live Tracking List */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-rose-400" />
              <span>{language === 'bn' ? 'অর্ডার বুকিং ও ট্র্যাকিং' : 'Orders Dispatch & Tracking'}</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? 'কনফার্মড অর্ডারসমূহ সরাসরি পাঠাও কুরিয়ারে প্রেরণ করুন এবং ডেলিভারি স্ট্যাটাস চেক করুন।'
                : 'Dispatch ready orders to Pathao and sync live delivery milestones.'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'অর্ডার আইডি বা নাম...' : 'Search orders...'}
              className="w-full pl-8 pr-3 py-1.5 bg-[#080d19] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto slim-scrollbar pr-1">
          {filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              {language === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const hasConsignment = !!ord.pathaoConsignmentId;
              const isDispatched = isDispatching === ord.id;
              const isTrackingThis = isTracking === ord.id;
              const liveData = trackingData[ord.id];

              return (
                <div key={ord.id} className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Left info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-amber-300">#{ord.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold capitalize">
                        {ord.status}
                      </span>
                      {hasConsignment && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono font-bold flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          <span>CID: {ord.pathaoConsignmentId}</span>
                        </span>
                      )}
                      {ord.pathaoCourierStatus && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold capitalize">
                          {ord.pathaoCourierStatus}
                        </span>
                      )}
                    </div>

                    <div className="text-slate-300 flex items-center gap-2">
                      <span className="font-bold text-white">{ord.customer.fullName}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-amber-400" />
                        {ord.customer.phone}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        {ord.customer.address}, {ord.customer.city}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Total: <strong className="text-amber-300">{formatPrice(ord.total)}</strong></span>
                      <span>Items: {ord.items.length}</span>
                      <span>Method: {ord.paymentMethod === 'cod' ? 'Cash On Delivery' : ord.paymentMethod}</span>
                    </div>

                    {liveData && (
                      <div className="mt-2 p-2 bg-[#080d19] rounded-lg border border-slate-800 text-[11px] text-slate-300">
                        <p className="font-semibold text-rose-400">Pathao Live Tracking:</p>
                        <p>Status: <strong className="text-white">{liveData.order_status || 'In transit'}</strong></p>
                        {liveData.delivery_fee && <p>Delivery Fee: ৳{liveData.delivery_fee}</p>}
                      </div>
                    )}
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {hasConsignment ? (
                      <button
                        type="button"
                        onClick={() => handleTrack(ord.id)}
                        disabled={isTrackingThis}
                        className="px-3 py-1.5 bg-[#080d19] hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isTrackingThis ? 'animate-spin' : ''}`} />
                        <span>{isTrackingThis ? (language === 'bn' ? 'ট্র্যাক হচ্ছে...' : 'Tracking...') : (language === 'bn' ? 'লাইভ ট্র্যাক' : 'Track Pathao')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDispatch(ord.id)}
                        disabled={isDispatched || !settings.enabled}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className={`w-3 h-3 ${isDispatched ? 'animate-pulse' : ''}`} />
                        <span>{isDispatched ? (language === 'bn' ? 'বুকিং হচ্ছে...' : 'Booking...') : (language === 'bn' ? 'পাঠাও এ পাঠান' : 'Dispatch to Pathao')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
