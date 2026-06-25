import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Info,
  Clock,
  Fingerprint,
  Image as ImageIcon,
  Sparkles,
  Mail,
  Smartphone,
  Star,
  Shield,
} from 'lucide-react';
import { updateIdentityStatus } from '../services/profileService';
import { getProfileIdentifier } from '../utils/profileSession';
import {
  isVerificationApproved,
  isVerificationPending,
  normalizeAdminStatus,
} from '../editProfile/verificationStatus';

function formatDisplayDate(value) {
  if (value == null || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const IdentityVerify = ({ userData, refreshData, onVerificationBlocking }) => {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(userData?.identity_status || 'Unverified');
  /** Until `refreshData` returns new `admin_status`, keep pending UI after submit */
  const [optimisticPending, setOptimisticPending] = useState(false);

  const adminState = normalizeAdminStatus(userData);
  const approved = isVerificationApproved(userData);
  const pending = isVerificationPending(userData) || optimisticPending;
  const showBlocking = pending && !approved;

  const identityDate = useMemo(() => {
    const raw =
      userData?.identity_approved_at ??
      userData?.kyc_approved_at ??
      userData?.identity_reviewed_at ??
      userData?.updated_at ??
      userData?.updatedAt;
    return formatDisplayDate(raw) || 'Recently';
  }, [userData]);

  const accountDate = useMemo(() => {
    const raw = userData?.created_at ?? userData?.createdAt ?? userData?.joined_at;
    return formatDisplayDate(raw) || identityDate;
  }, [userData, identityDate]);

  const emailMasked = String(userData?.email || '—').trim() || '—';
  const phoneMasked = String(userData?.mobile || '—').trim() || '—';

  useEffect(() => {
    if (userData) {
      setStatus(userData.identity_status || 'Unverified');
      if (userData.id_front && userData.id_front !== 'null') setFrontFile(userData.id_front);
      if (userData.id_back && userData.id_back !== 'null') setBackFile(userData.id_back);
    }
  }, [userData]);

  useEffect(() => {
    if (isVerificationPending(userData)) setOptimisticPending(false);
  }, [userData]);

  useEffect(() => {
    if (typeof onVerificationBlocking === 'function') {
      onVerificationBlocking(showBlocking);
    }
  }, [showBlocking, onVerificationBlocking]);

  const handleFileUpload = (e, side) => {
    if (approved || pending) return;
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large! Maximum 2MB allowed.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') setFrontFile(reader.result);
        else setBackFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitForVerification = async () => {
    if (!frontFile || !backFile) {
      alert('Please upload both sides of your ID.');
      return;
    }

    const identifier = getProfileIdentifier(userData);
    setLoading(true);
    try {
      const response = await updateIdentityStatus(identifier, {
        status: 'Pending Review',
        id_front: frontFile,
        id_back: backFile,
      });

      if (response.status === 'success') {
        setOptimisticPending(true);
        setStatus('Pending Review');
        if (refreshData) await refreshData();
      }
    } catch (err) {
      alert(`Error: ${err.response?.data?.detail || 'Verification Failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = () => {
    if (typeof refreshData === 'function') refreshData();
    else window.location.reload();
  };

  const xpCurrent = 650;
  const xpTarget = 1000;
  const xpPct = Math.round((xpCurrent / xpTarget) * 100);

  // —— Approved: full verification + rank dashboard (admin_status === 'approved' or legacy Active) ——
  if (approved) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-4 text-left animate-in fade-in zoom-in duration-500">
        <div className="flex gap-4 rounded-2xl border border-emerald-500/35 bg-gradient-to-r from-emerald-950/60 to-slate-900/80 p-5 shadow-lg shadow-emerald-950/30">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40">
            <ShieldCheck size={26} strokeWidth={2} />
          </div>
          <div>
            <p className="text-lg font-black text-white">Congratulations! You&apos;re Verified.</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              Your documents have been reviewed and approved by our admin team.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              title: 'Identity Verification',
              sub: 'CNIC / Identity Card',
              status: 'Approved',
              date: `Approved on ${identityDate}`,
              icon: Shield,
            },
            {
              title: 'Email Verification',
              sub: emailMasked,
              status: 'Verified',
              date: `Verified on ${accountDate}`,
              icon: Mail,
            },
            {
              title: 'Phone Verification',
              sub: phoneMasked,
              status: 'Verified',
              date: `Verified on ${accountDate}`,
              icon: Smartphone,
            },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.title}
                className="flex flex-wrap items-start gap-4 rounded-2xl border border-white/[0.08] bg-slate-900/40 p-4 sm:flex-nowrap"
              >
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" strokeWidth={2.2} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{row.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{row.sub}</p>
                  <p className="mt-2 text-xs text-slate-500">{row.date}</p>
                </div>
                <span className="shrink-0 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  {row.status}
                </span>
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 sm:flex">
                  <Icon size={20} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-violet-500/25 bg-violet-950/20 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800 ring-2 ring-violet-500/50">
            <span className="text-lg font-black text-violet-200">A</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-white">Admin Team</p>
              <span className="rounded-md bg-violet-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                Admin
              </span>
              <span className="rounded-md border border-emerald-500/50 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-300">
                Approved
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Profile reviewed — higher ranks and platform features are unlocked for your account.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900/90 to-slate-950 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/35">
                <Shield size={28} className="text-violet-200" strokeWidth={1.75} />
                <Star
                  size={12}
                  className="absolute right-1 top-1 text-amber-300 drop-shadow"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300/90">Current rank</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xl font-black text-white">Frontline Recruit</p>
                  <span className="rounded-md border border-emerald-500/45 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-300">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">650 / 1000 XP toward next rank</p>
                <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:max-w-[220px]">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Next rank</p>
              <p className="mt-1 text-sm font-black text-violet-200">Specialist</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  Complete 2 projects
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                  Maintain 4.5+ rating
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // —— Pending: admin_status === 'pending' (Capture_31 style) ——
  if (pending) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-indigo-500/35 bg-indigo-500/[0.12] shadow-[0_0_40px_rgba(99,102,241,0.15)]">
          <Clock size={40} className="animate-pulse text-indigo-400" strokeWidth={2} />
        </div>
        <h2 className="mb-4 text-3xl font-black tracking-tighter text-white">Verification In Progress</h2>
        <p className="mb-8 max-w-md text-[15px] leading-relaxed text-slate-400">
          Our global compliance team is reviewing your documents. This usually takes <strong className="text-slate-300">24 hours</strong>.
          You&apos;ll receive a notification once your account is activated.
        </p>
        <button
          type="button"
          onClick={refreshStatus}
          className="rounded-2xl border border-white/10 bg-[#131820] px-10 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:border-indigo-500/40 hover:bg-white/[0.06]"
        >
          REFRESH STATUS
        </button>
      </div>
    );
  }

  // —— Default: upload & submit ——
  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center gap-6 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl sm:flex-row">
        <div className="rounded-2xl bg-blue-600 p-4 shadow-lg shadow-blue-600/30">
          <ShieldCheck size={32} className="text-white" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-black tracking-tight text-white">KYC Verification</h1>
          <p className="text-sm text-slate-500">Secure your identity to access global squads.</p>
        </div>
        <div
          className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
            status === 'Active'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
              : 'border-blue-500 bg-blue-500/10 text-blue-500'
          }`}
        >
          {adminState || status}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {['front', 'back'].map((side) => (
          <div
            key={side}
            className="group relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed border-white/10 bg-slate-900/50 transition-all duration-500 hover:border-blue-500/50"
          >
            {side === 'front' ? (
              frontFile ? (
                <img
                  src={frontFile}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="ID Preview"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-600 transition-colors group-hover:text-blue-400">
                  <div className="mb-3 rounded-2xl bg-white/5 p-4">
                    <ImageIcon size={30} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Identity {side}</span>
                </div>
              )
            ) : backFile ? (
              <img
                src={backFile}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="ID Preview"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-600 transition-colors group-hover:text-blue-400">
                <div className="mb-3 rounded-2xl bg-white/5 p-4">
                  <ImageIcon size={30} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">Identity {side}</span>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

            <div className="absolute bottom-4 left-4 right-4">
              <input
                type="file"
                id={side}
                className="hidden"
                onChange={(e) => handleFileUpload(e, side)}
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => document.getElementById(side).click()}
                className="w-full rounded-xl border border-white/10 bg-white/10 py-3 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/20"
                disabled={status === 'Active'}
              >
                {side === 'front' ? (frontFile ? 'Change Photo' : `Upload ${side}`) : backFile ? 'Change Photo' : `Upload ${side}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-4 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-5">
        <Info size={18} className="mt-0.5 text-blue-500" />
        <p className="text-xs leading-relaxed text-slate-400">
          <b>Requirement:</b> Ensure all four corners of the document are visible. Images must be high-resolution (max
          2MB) without glare or blur.
        </p>
      </div>

      <button
        type="button"
        onClick={submitForVerification}
        disabled={loading || status === 'Active'}
        className={`flex w-full items-center justify-center gap-3 rounded-[24px] py-5 text-xs font-black uppercase tracking-[0.2em] transition-all ${
          status === 'Active'
            ? 'cursor-default border border-emerald-500/50 bg-emerald-600/20 text-emerald-500'
            : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-[0.98]'
        }`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Processing...
          </div>
        ) : status === 'Active' ? (
          <>
            Verified <CheckCircle2 size={16} />
          </>
        ) : (
          <>
            Finalize Verification <ShieldCheck size={16} />
          </>
        )}
      </button>

      <div className="pointer-events-none flex justify-center gap-2 pb-4 opacity-30 grayscale">
        <Fingerprint size={20} className="text-white" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
          End-to-End Encrypted Secure Server
        </span>
      </div>
    </div>
  );
};

export default IdentityVerify;
