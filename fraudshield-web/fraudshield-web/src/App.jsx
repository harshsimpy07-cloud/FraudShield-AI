import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import {
  LayoutDashboard, Activity, Bell, ListChecks, BarChart3, Search, ShieldAlert,
  ShieldCheck, X, ChevronRight, Clock, MapPin, CreditCard, Smartphone, Store,
  AlertTriangle, Pause, Play, CheckCircle2, XCircle, RadioTower, SlidersHorizontal, Plus,
  Shield, Lock, KeyRound, EyeOff, Ban, FileText, PhoneCall, Copy, Info, ChevronDown,
  ChevronUp, Check, ExternalLink, Radar, Zap, Wifi, Cpu,
} from 'lucide-react';

/* ============================== DESIGN TOKENS — CYBER COMMAND CENTER ============================== */
function hexA(hex, alpha) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const C = {
  bg: '#03050C',
  bgAlt: 'rgba(6,10,20,0.78)',
  panel: 'rgba(11,18,36,0.55)',
  panel2: 'rgba(7,12,24,0.7)',
  border: 'rgba(0,229,255,0.16)',
  borderStrong: 'rgba(0,229,255,0.4)',
  text: '#E9F5FF',
  textMuted: '#8CA0C4',
  textDim: '#4E5C7C',
  cyan: '#00E5FF',
  cyanDim: 'rgba(0,229,255,0.12)',
  violet: '#8E7CFF',
  violetDim: 'rgba(142,124,255,0.14)',
  teal: '#2FE0B0',
  tealDim: 'rgba(47,224,176,0.14)',
  amber: '#FFC145',
  amberDim: 'rgba(255,193,69,0.14)',
  orange: '#FF9142',
  orangeDim: 'rgba(255,145,66,0.14)',
  red: '#FF2E6D',
  redDim: 'rgba(255,46,109,0.14)',
};

const FONT_DISPLAY = "'Chakra Petch', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const LEVELS = {
  Low: { color: C.teal, dim: C.tealDim, dot: '🟢' },
  Medium: { color: C.amber, dim: C.amberDim, dot: '🟡' },
  High: { color: C.orange, dim: C.orangeDim, dot: '🟠' },
  Critical: { color: C.red, dim: C.redDim, dot: '🔴' },
};

function glass(extra = {}) {
  return {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
    ...extra,
  };
}
function glowShadow(hex, a = 0.4, blur = 18) { return `0 0 ${blur}px ${hexA(hex, a)}`; }

/* ============================== MOCK DATA SOURCES ============================== */
const HOME_LOCATION = 'Bengaluru, IN';
const LOCATIONS = ['Bengaluru, IN', 'Mumbai, IN', 'Delhi, IN', 'Chennai, IN', 'Singapore, SG', 'Dubai, AE', 'London, UK', 'New York, US', 'Lagos, NG', 'Moscow, RU', 'Unknown Location'];
const MERCHANTS = [
  { name: 'Amazon', category: 'Retail', risk: 0.04 },
  { name: 'Big Bazaar', category: 'Retail', risk: 0.05 },
  { name: 'Croma Electronics', category: 'Electronics', risk: 0.16 },
  { name: 'Uber', category: 'Transport', risk: 0.05 },
  { name: 'Netflix', category: 'Subscription', risk: 0.02 },
  { name: 'Shell Fuel Station', category: 'Fuel', risk: 0.05 },
  { name: 'CoinXchange Pro', category: 'Crypto Exchange', risk: 0.58 },
  { name: 'LuckySpin Casino', category: 'Online Gambling', risk: 0.62 },
  { name: 'GiftCardZone', category: 'Gift Cards', risk: 0.47 },
  { name: 'Zara', category: 'Retail', risk: 0.08 },
  { name: 'Apple Store', category: 'Electronics', risk: 0.12 },
  { name: 'DoorDash', category: 'Food Delivery', risk: 0.04 },
  { name: 'QuickWire Transfer', category: 'Money Transfer', risk: 0.5 },
  { name: 'Unlisted Merchant #4471', category: 'Unclassified', risk: 0.52 },
];
const CARD_TYPES = ['Visa Credit •• 4471', 'Mastercard Debit •• 8823', 'Visa Debit •• 1190', 'Amex Credit •• 7765', 'RuPay Debit •• 3302'];
const DEVICES = [
  { label: 'iPhone 15 · Trusted', risky: false },
  { label: 'Chrome / Windows · Trusted', risky: false },
  { label: 'Android (Samsung) · Trusted', risky: false },
  { label: 'Unrecognized Linux Device', risky: true },
  { label: 'New Device · iOS', risky: true },
  { label: 'Unrecognized Browser Session', risky: true },
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function makeTxId() { return 'TXN-' + Math.random().toString(16).slice(2, 8).toUpperCase(); }

function scoreTransaction({ amount, location, merchant, device, hour, velocityFlag }) {
  let score = 4;
  const reasons = [];

  if (amount > 4000) { score += 32; reasons.push('Transaction amount is far above the cardholder\u2019s typical spend'); }
  else if (amount > 1500) { score += 14; reasons.push('Transaction amount is higher than usual for this card'); }

  if (location !== HOME_LOCATION) {
    score += 16;
    reasons.push(`Purchase location (${location}) differs from cardholder\u2019s home region`);
  }
  if (location === 'Unknown Location') { score += 14; reasons.push('Origin location could not be resolved or verified'); }

  const merchRisk = merchant.risk * 38;
  score += merchRisk;
  if (merchant.risk > 0.35) reasons.push(`High-risk merchant category: ${merchant.category}`);

  if (device.risky) { score += 18; reasons.push('Transaction originated from an unrecognized or new device'); }

  if (hour < 5 || hour >= 23) { score += 9; reasons.push('Transaction occurred during unusual late-night hours'); }

  if (velocityFlag) { score += 24; reasons.push('Multiple transactions on this card within a short time window (velocity anomaly)'); }

  score += randInt(-4, 4);
  score = Math.max(1, Math.min(99, Math.round(score)));

  let level = 'Low';
  if (score >= 85) level = 'Critical';
  else if (score >= 60) level = 'High';
  else if (score >= 30) level = 'Medium';

  if (reasons.length === 0) reasons.push('Transaction matches the cardholder\u2019s established spending profile');

  const behavior = velocityFlag
    ? `${randInt(3, 6)} transactions on this card in the last 10 minutes`
    : level === 'Low' ? 'Consistent with 6-month spending profile' : 'Deviates from typical historical pattern';

  return { score, level, reasons, behavior };
}

function generateTransaction() {
  const merchant = rand(MERCHANTS);
  const device = rand(DEVICES);
  const skewHigh = Math.random() < 0.22;
  const amount = skewHigh ? randInt(1800, 9200) : randInt(6, 1600);
  const location = skewHigh && Math.random() < 0.6 ? rand(LOCATIONS.filter(l => l !== HOME_LOCATION)) : rand(Math.random() < 0.7 ? [HOME_LOCATION] : LOCATIONS);
  const now = new Date();
  const hour = now.getHours();
  const velocityFlag = Math.random() < 0.12;
  const { score, level, reasons, behavior } = scoreTransaction({ amount, location, merchant, device, hour, velocityFlag });

  return {
    id: makeTxId(),
    ts: now,
    cardType: rand(CARD_TYPES),
    amount,
    merchant: merchant.name,
    category: merchant.category,
    location,
    device: device.label,
    ip: `${randInt(10, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
    behavior,
    score,
    level,
    reasons,
    status: level === 'Critical' || level === 'High' ? 'Flagged' : 'Approved',
  };
}

function buildManualTransaction(form) {
  const merchantObj = MERCHANTS.find(m => m.name === form.merchant) || { name: form.merchant || 'Unlisted Merchant', category: 'Unclassified', risk: 0.4 };
  const deviceObj = DEVICES.find(d => d.label === form.device) || { label: form.device, risky: /new|unrecognized|unknown/i.test(form.device || '') };
  const now = new Date();
  const hour = now.getHours();
  const { score, level, reasons, behavior } = scoreTransaction({
    amount: Number(form.amount) || 0,
    location: form.location,
    merchant: merchantObj,
    device: deviceObj,
    hour,
    velocityFlag: !!form.velocityFlag,
  });

  return {
    id: form.id && form.id.trim() ? form.id.trim() : makeTxId(),
    ts: now,
    cardType: form.cardType,
    amount: Number(form.amount) || 0,
    merchant: merchantObj.name,
    category: merchantObj.category,
    location: form.location,
    device: deviceObj.label,
    ip: form.ip && form.ip.trim() ? form.ip.trim() : `${randInt(10, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
    behavior,
    score, level, reasons,
    status: level === 'Critical' || level === 'High' ? 'Flagged' : 'Approved',
  };
}

function seedHistory(n) {
  const out = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const tx = generateTransaction();
    tx.ts = new Date(now - randInt(0, 26) * 60 * 60 * 1000 - randInt(0, 59) * 60000);
    out.push(tx);
  }
  return out.sort((a, b) => b.ts - a.ts);
}

/* ============================== SMALL HELPERS ============================== */
function fmtMoney(n) { return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }); }
function fmtTime(d) { return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
function fmtDate(d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function timeAgo(d) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}
function maskIp(ip) {
  if (!ip) return 'unknown';
  const parts = ip.split('.');
  if (parts.length !== 4) return ip;
  return `${parts[0]}.xx.xx.${parts[3]}`;
}

/* ====== Fraud Prevention & Recovery data (defined for the Safety Center — see closing note) ====== */
const PREVENTION_TIPS = [
  { id: 'freeze', icon: Lock, title: 'Freeze or temporarily disable your card', desc: 'If anything looks off, freezing the card in your banking app stops new charges instantly while you investigate.', weight: { Low: 1, Medium: 2, High: 5, Critical: 5 } },
  { id: 'contact', icon: PhoneCall, title: 'Contact your bank immediately if something looks wrong', desc: 'Use the number on the back of your card or the bank\u2019s official app \u2014 never a number from a text or email.', weight: { Low: 1, Medium: 2, High: 5, Critical: 5 } },
  { id: 'secrets', icon: EyeOff, title: 'Never share OTPs, PINs, CVV, or banking credentials', desc: 'Your bank will never ask for these over phone, SMS, or email. Treat any such request as a scam.', weight: { Low: 2, Medium: 4, High: 5, Critical: 5 } },
  { id: 'notify', icon: Bell, title: 'Enable transaction notifications', desc: 'Turn on real-time SMS/push alerts for every card transaction so you notice unauthorized charges immediately.', weight: { Low: 2, Medium: 3, High: 4, Critical: 4 } },
  { id: 'links', icon: Ban, title: 'Avoid suspicious links and unknown payment requests', desc: 'Don\u2019t click links in unexpected texts or emails claiming to be your bank \u2014 go to the official app or site directly.', weight: { Low: 2, Medium: 3, High: 4, Critical: 4 } },
  { id: 'devices', icon: Smartphone, title: 'Use trusted devices and secure networks', desc: 'Avoid entering card details on public Wi-Fi or unfamiliar/shared devices.', weight: { Low: 2, Medium: 3, High: 3, Critical: 3 } },
  { id: 'mfa', icon: KeyRound, title: 'Use strong authentication and MFA', desc: 'Add multi-factor authentication to your banking and card apps, not just a password.', weight: { Low: 3, Medium: 3, High: 3, Critical: 3 } },
  { id: 'statements', icon: FileText, title: 'Review your statements regularly', desc: 'Check your card and bank statements at least weekly for unfamiliar charges, even small ones.', weight: { Low: 3, Medium: 2, High: 2, Critical: 2 } },
];
function accountStatus(transactions) {
  const recent = transactions.slice(0, 20);
  const criticalCount = recent.filter(t => t.level === 'Critical').length;
  const highCount = recent.filter(t => t.level === 'High').length;
  const mediumCount = recent.filter(t => t.level === 'Medium').length;
  let level = 'Low';
  if (criticalCount > 0) level = 'Critical';
  else if (highCount > 0) level = 'High';
  else if (mediumCount >= 3) level = 'Medium';
  return { level, criticalCount, highCount, mediumCount };
}
function prioritizedTips(level) { return [...PREVENTION_TIPS].sort((a, b) => b.weight[level] - a.weight[level]); }
const RECOVERY_STEPS = [
  { n: 1, title: 'Secure the account', icon: Lock, body: (tx) => `Lock or freeze the affected ${tx.cardType.split(' ')[0]} card right now through your bank's official app, or by calling the number on the back of your card.` },
  { n: 2, title: 'Report the transaction', icon: ShieldAlert, body: (tx) => `Report ${tx.id} to your bank/card issuer as unauthorized. Have the amount, merchant, and date/time ready.` },
  { n: 3, title: 'Secure your credentials', icon: KeyRound, body: () => `If you suspect your login, PIN, or card details may be compromised, change your password now and enable MFA.` },
  { n: 4, title: 'Review recent activity', icon: Search, body: () => `Check your last few statements for other transactions you don't recognize.` },
  { n: 5, title: 'Preserve evidence', icon: FileText, body: () => `Save the transaction ID, amount, timestamp, merchant, and alert details for your report.` },
  { n: 6, title: 'Contact the appropriate authority', icon: PhoneCall, body: () => `Contact your bank's fraud department first, and your local cybercrime/consumer authority if needed.` },
  { n: 7, title: 'Monitor the account', icon: Activity, body: () => `Keep watching the account for the next few weeks for further suspicious activity.` },
];
function buildEvidenceText(tx) {
  return [
    'FRAUDSHIELD AI — TRANSACTION EVIDENCE SUMMARY', '',
    `Transaction ID: ${tx.id}`, `Date & time: ${fmtDate(tx.ts)}, ${fmtTime(tx.ts)}`,
    `Card: ${tx.cardType}`, `Amount: ${fmtMoney(tx.amount)}`, `Merchant: ${tx.merchant} (${tx.category})`,
    `Location: ${tx.location}`, `Device: ${tx.device}`, `IP (masked): ${maskIp(tx.ip)}`,
    `Risk score: ${tx.score}% — ${tx.level}`, `Reasons flagged: ${tx.reasons.join('; ')}`,
  ].join('\n');
}

/* ============================== RISK GAUGE (signature element) ============================== */
function RiskGauge({ score, level, size = 56 }) {
  const stroke = Math.max(4, size * 0.09);
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = LEVELS[level].color;
  const isHot = level === 'Critical' || level === 'High';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {isHot && (
        <div
          className="animate-spin"
          style={{
            position: 'absolute', inset: -size * 0.14, borderRadius: '50%',
            background: `conic-gradient(from 0deg, transparent 0%, ${hexA(color, 0.5)} 12%, transparent 26%)`,
            animationDuration: level === 'Critical' ? '2.2s' : '3.4s',
          }}
        />
      )}
      <svg width={size} height={size} style={{ position: 'relative', transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={C.border} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s ease', filter: `drop-shadow(0 0 5px ${hexA(color, 0.85)})` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: size * 0.24, color: C.text, textShadow: `0 0 8px ${hexA(color, 0.5)}` }}>{score}</span>
      </div>
    </div>
  );
}

function LevelBadge({ level }) {
  const l = LEVELS[level];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px',
        borderRadius: 999, background: l.dim, color: l.color, fontFamily: FONT_MONO,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', border: `1px solid ${hexA(l.color, 0.4)}`,
        boxShadow: glowShadow(l.color, 0.25, 10),
      }}
    >
      <span>{l.dot}</span>{level.toUpperCase()}
    </span>
  );
}

/* ============================== LIVE RADAR — real-time visualization ============================== */
function RadarScan({ transactions, size = 250 }) {
  const recent = transactions.slice(0, 16);
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 22;
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size}>
        {[0.25, 0.5, 0.75, 1].map((f, i) => (
          <circle key={i} cx={cx} cy={cy} r={maxR * f} fill="none" stroke={C.border} strokeWidth={1} />
        ))}
        <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke={C.border} strokeWidth={1} />
        <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke={C.border} strokeWidth={1} />
        {recent.map((t, i) => {
          const angle = (i * 41 + t.score * 3.3) % 360;
          const r = Math.max(6, (t.score / 100) * maxR);
          const x = cx + r * Math.cos((angle * Math.PI) / 180);
          const y = cy + r * Math.sin((angle * Math.PI) / 180);
          const color = LEVELS[t.level].color;
          const dotR = t.level === 'Critical' ? 5 : t.level === 'High' ? 4 : 3;
          return (
            <circle key={t.id} cx={x} cy={y} r={dotR} fill={color}
              style={{ filter: `drop-shadow(0 0 6px ${hexA(color, 0.9)})` }} />
          );
        })}
        <circle cx={cx} cy={cy} r={3} fill={C.cyan} style={{ filter: `drop-shadow(0 0 8px ${hexA(C.cyan, 1)})` }} />
      </svg>
      <div
        className="animate-spin"
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `conic-gradient(from 0deg, transparent 0%, ${hexA(C.cyan, 0.22)} 10%, transparent 24%)`,
          animationDuration: '4.5s',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${hexA(C.cyan, 0.3)}`, boxShadow: `inset 0 0 30px ${hexA(C.cyan, 0.08)}` }} />
    </div>
  );
}

/* ============================== TOASTS ============================== */
function ToastStack({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 10, width: 360, maxWidth: '90vw' }}>
      {toasts.map(t => (
        <div key={t.id} className="animate-fadeIn" style={{
          ...glass({ borderRadius: 12, borderLeft: `3px solid ${C.red}`, padding: '12px 14px' }),
          boxShadow: `0 12px 30px rgba(0,0,0,0.5), ${glowShadow(C.red, 0.4, 22)}`,
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle size={18} color={C.red} style={{ marginTop: 2, flexShrink: 0, filter: `drop-shadow(0 0 4px ${hexA(C.red, 0.8)})` }} />
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.text, lineHeight: 1.45 }}>
              <strong style={{ color: C.red }}>FRAUD ALERT</strong> — Suspicious transaction detected.
              Risk Score: <span style={{ fontFamily: FONT_MONO }}>{t.score}%</span>. Transaction {t.id} flagged for review.
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================== SIDEBAR ============================== */
function Sidebar({ tab, setTab, alertCount }) {
  const items = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live', label: 'Live Monitor', icon: RadioTower },
    { id: 'alerts', label: 'Fraud Alerts', icon: Bell, badge: alertCount },
    { id: 'transactions', label: 'Transactions', icon: ListChecks },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];
  return (
    <div style={{ width: 216, flexShrink: 0, background: C.bgAlt, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 2 }}>
      <div style={{ padding: '22px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: glowShadow(C.cyan, 0.55, 16) }}>
          <ShieldCheck size={19} color="#03050C" strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15.5, color: C.text, lineHeight: 1.1, letterSpacing: '0.02em' }}>FraudShield</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: C.cyan, letterSpacing: '0.14em', textShadow: `0 0 8px ${hexA(C.cyan, 0.6)}` }}>AI COMMAND CENTER</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map(it => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9,
                background: active ? C.cyanDim : 'transparent', color: active ? C.cyan : C.textMuted,
                border: active ? `1px solid ${hexA(C.cyan, 0.3)}` : '1px solid transparent',
                boxShadow: active ? glowShadow(C.cyan, 0.18, 14) : 'none',
                cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: active ? 600 : 500,
                textAlign: 'left', transition: 'all .15s',
              }}
            >
              <Icon size={16} strokeWidth={2.2} style={active ? { filter: `drop-shadow(0 0 4px ${hexA(C.cyan, 0.8)})` } : undefined} />
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge > 0 && (
                <span style={{ background: C.red, color: '#fff', fontSize: 10, fontFamily: FONT_MONO, fontWeight: 700, borderRadius: 999, padding: '1px 6px', boxShadow: glowShadow(C.red, 0.6, 8) }}>{it.badge}</span>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ padding: 14, borderTop: `1px solid ${C.border}` }}>
        <div style={glass({ borderRadius: 10, padding: 12 })}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textDim, marginBottom: 4, letterSpacing: '0.05em' }}>MODEL</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.textMuted }}>Ensemble v1.2</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.textDim, marginTop: 2 }}>scikit-learn · isolation forest + gradient boost</div>
        </div>
      </div>
    </div>
  );
}

/* ============================== RIGHT CONTROL PANEL ============================== */
function ControlPanel({ transactions, alerts, onSelect, isLive, setIsLive, onNewTransaction }) {
  const sample = transactions.slice(0, 30);
  const avgScore = sample.length ? Math.round(sample.reduce((s, t) => s + t.score, 0) / sample.length) : 0;
  const threatLevel = avgScore >= 85 ? 'Critical' : avgScore >= 60 ? 'High' : avgScore >= 30 ? 'Medium' : 'Low';
  const threatColor = LEVELS[threatLevel].color;

  return (
    <div style={{ width: 320, flexShrink: 0, borderLeft: `1px solid ${C.border}`, background: C.bgAlt, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', padding: 18, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', position: 'relative', zIndex: 2 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <Cpu size={13} color={C.cyan} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.cyan, letterSpacing: '0.1em' }}>THREAT LEVEL</span>
        </div>
        <div style={glass({ borderRadius: 16, padding: 18, textAlign: 'center', boxShadow: `0 8px 32px rgba(0,0,0,0.5), ${glowShadow(threatColor, 0.15, 24)}` })}>
          <RiskGauge score={avgScore} level={threatLevel} size={104} />
          <div style={{ marginTop: 10 }}><LevelBadge level={threatLevel} /></div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: C.textDim, marginTop: 8 }}>rolling avg · last {sample.length} tx</div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <Radar size={13} color={C.cyan} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.cyan, letterSpacing: '0.1em' }}>LIVE SCAN</span>
        </div>
        <div style={glass({ borderRadius: 16, padding: 16 })}>
          <RadarScan transactions={transactions} size={230} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10 }}>
            {['Low', 'Medium', 'High', 'Critical'].map(l => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONT_MONO, fontSize: 9.5, color: C.textDim }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: LEVELS[l].color, boxShadow: glowShadow(LEVELS[l].color, 0.7, 5) }} />{l}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <Zap size={13} color={C.cyan} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.cyan, letterSpacing: '0.1em' }}>QUICK ACTIONS</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onNewTransaction} style={ctrlBtnStyle(C.cyan)}><Plus size={14} /> Submit Transaction</button>
          <button onClick={() => setIsLive(v => !v)} style={ctrlBtnStyle(isLive ? C.teal : C.textMuted)}>
            {isLive ? <Pause size={14} /> : <Play size={14} />} {isLive ? 'Pause Live Feed' : 'Resume Live Feed'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <ShieldAlert size={13} color={C.cyan} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.cyan, letterSpacing: '0.1em' }}>ALERT TICKER</span>
          </div>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textDim }}>{alerts.length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.slice(0, 5).map(tx => (
            <div key={tx.id} onClick={() => onSelect(tx)} style={glass({ borderRadius: 10, padding: '9px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9 })}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: LEVELS[tx.level].color, boxShadow: glowShadow(LEVELS[tx.level].color, 0.8, 6), flexShrink: 0 }} className="animate-pulse" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.merchant}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textDim }}>{tx.score}% · {timeAgo(tx.ts)}</div>
              </div>
            </div>
          ))}
          {alerts.length === 0 && <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: C.textDim, padding: '8px 2px' }}>No active alerts.</div>}
        </div>
      </div>

      <div style={glass({ borderRadius: 12, padding: 12 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <Wifi size={12} color={C.teal} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textMuted, letterSpacing: '0.06em' }}>NETWORK</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontSize: 10.5, color: C.textDim, marginBottom: 4 }}>
          <span>ML latency</span><span style={{ color: C.teal }}>42ms</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontSize: 10.5, color: C.textDim }}>
          <span>Uptime</span><span style={{ color: C.teal }}>99.98%</span>
        </div>
      </div>
    </div>
  );
}
function ctrlBtnStyle(color) {
  return {
    display: 'flex', alignItems: 'center', gap: 8, background: hexA(color, 0.1), color,
    border: `1px solid ${hexA(color, 0.35)}`, borderRadius: 9, padding: '9px 13px',
    fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', boxShadow: glowShadow(color, 0.12, 10),
  };
}

/* ============================== STAT CARD ============================== */
function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div style={glass({ padding: 18, flex: 1, minWidth: 0, boxShadow: `0 8px 32px rgba(0,0,0,0.5), ${glowShadow(color, 0.08, 20)}` })}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textDim, letterSpacing: '0.05em' }}>{label.toUpperCase()}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: hexA(color, 0.14), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: glowShadow(color, 0.3, 10) }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: C.text, textShadow: `0 0 16px ${hexA(color, 0.25)}` }}>{value}</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.textMuted, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

/* ============================== TX ROW ============================== */
function TxRow({ tx, onClick }) {
  return (
    <div
      onClick={() => onClick(tx)}
      style={{
        display: 'grid', gridTemplateColumns: '52px 100px 1fr 110px 130px 120px 110px 20px',
        alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${C.border}`,
        cursor: 'pointer', transition: 'background .12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = hexA(C.cyan, 0.04)}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <RiskGauge score={tx.score} level={tx.level} size={40} />
      <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.cyan }}>{tx.id}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.merchant}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: C.textDim }}>{tx.category}</div>
      </div>
      <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.text, fontWeight: 600 }}>{fmtMoney(tx.amount)}</span>
      <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.location}</span>
      <LevelBadge level={tx.level} />
      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textDim }}>{timeAgo(tx.ts)}</span>
      <ChevronRight size={15} color={C.textDim} />
    </div>
  );
}

/* ============================== DETAIL DRAWER ============================== */
function DetailDrawer({ tx, onClose, onAction }) {
  if (!tx) return null;
  const l = LEVELS[tx.level];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(2,4,10,0.7)', backdropFilter: 'blur(3px)' }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, height: '100%', width: 420, maxWidth: '92vw',
        background: 'rgba(6,10,20,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderLeft: `1px solid ${C.border}`, overflowY: 'auto',
        boxShadow: `-20px 0 60px rgba(0,0,0,0.6), ${glowShadow(l.color, 0.1, 40)}`,
      }} className="animate-slideIn">
        <div style={{ padding: '20px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.cyan }}>{tx.id}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: C.text, marginTop: 2 }}>{tx.merchant}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMuted }}><X size={20} /></button>
        </div>

        <div style={{ padding: 22, display: 'flex', gap: 18, alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
          <RiskGauge score={tx.score} level={tx.level} size={92} />
          <div>
            <LevelBadge level={tx.level} />
            <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>{tx.status === 'Flagged' ? 'This transaction was automatically held for review.' : 'This transaction was approved automatically.'}</div>
          </div>
        </div>

        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.textDim, marginBottom: 10, letterSpacing: '0.06em' }}>TRANSACTION DETAILS</div>
          {[
            [CreditCard, 'Card', tx.cardType],
            [Store, 'Merchant', `${tx.merchant} · ${tx.category}`],
            [Clock, 'Date & time', `${fmtDate(tx.ts)}, ${fmtTime(tx.ts)}`],
            [MapPin, 'Location', tx.location],
            [Smartphone, 'Device / IP', `${tx.device} · ${maskIp(tx.ip)}`],
          ].map(([Icon, label, val], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <Icon size={15} color={C.cyan} style={{ marginTop: 2, flexShrink: 0, opacity: 0.8 }} />
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.textDim }}>{label}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.text, marginTop: 1 }}>{val}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Activity size={15} color={C.cyan} style={{ marginTop: 2, flexShrink: 0, opacity: 0.8 }} />
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.textDim }}>Amount</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 16, color: C.text, marginTop: 1, fontWeight: 700 }}>{fmtMoney(tx.amount)}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.textDim, marginBottom: 10, letterSpacing: '0.06em' }}>WHY THIS SCORE — MODEL EXPLANATION</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.textMuted, marginBottom: 10 }}>Previous behavior: <span style={{ color: C.text }}>{tx.behavior}</span></div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tx.reasons.map((r, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontFamily: FONT_BODY, fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>
                <span style={{ color: l.color, flexShrink: 0 }}>●</span>{r}
              </li>
            ))}
          </ul>
        </div>

        {(tx.level === 'High' || tx.level === 'Critical') && (
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, background: hexA(l.color, 0.05) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <ShieldAlert size={15} color={l.color} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: l.color, letterSpacing: '0.05em' }}>WHAT SHOULD I DO NOW?</span>
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
              1. Freeze the affected card &nbsp;·&nbsp; 2. Report to your bank &nbsp;·&nbsp; 3. Review recent activity &nbsp;·&nbsp; 4. Save these details for your report. FraudShield AI provides guidance only — your bank or card issuer handles the actual investigation, blocking, and any reimbursement.
            </div>
          </div>
        )}

        <div style={{ padding: 22, display: 'flex', gap: 10 }}>
          <button onClick={() => onAction(tx.id, 'Confirmed Fraud')} style={{ flex: 1, background: C.redDim, color: C.red, border: `1px solid ${hexA(C.red, 0.4)}`, borderRadius: 9, padding: '10px 0', fontFamily: FONT_BODY, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: glowShadow(C.red, 0.12, 10) }}>
            <XCircle size={15} /> Confirm Fraud
          </button>
          <button onClick={() => onAction(tx.id, 'Approved')} style={{ flex: 1, background: C.tealDim, color: C.teal, border: `1px solid ${hexA(C.teal, 0.4)}`, borderRadius: 9, padding: '10px 0', fontFamily: FONT_BODY, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: glowShadow(C.teal, 0.12, 10) }}>
            <CheckCircle2 size={15} /> Mark Legitimate
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== OVERVIEW TAB ============================== */
function Overview({ transactions, alerts, onSelect }) {
  const total = transactions.length;
  const flagged = transactions.filter(t => t.level === 'High' || t.level === 'Critical').length;
  const blocked = transactions.filter(t => t.level === 'Critical').length;
  const avgScore = total ? Math.round(transactions.reduce((s, t) => s + t.score, 0) / total) : 0;

  const distribution = ['Low', 'Medium', 'High', 'Critical'].map(level => ({
    name: level, value: transactions.filter(t => t.level === level).length, color: LEVELS[level].color,
  }));

  const volumeData = useMemo(() => {
    const buckets = {};
    transactions.forEach(t => {
      const key = `${t.ts.getHours()}:00`;
      buckets[key] = buckets[key] || { hour: key, volume: 0, flagged: 0 };
      buckets[key].volume += 1;
      if (t.level === 'High' || t.level === 'Critical') buckets[key].flagged += 1;
    });
    return Object.values(buckets).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [transactions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard label="Transactions (24h)" value={total} sub="across all monitored cards" color={C.cyan} icon={Activity} />
        <StatCard label="Flagged for review" value={flagged} sub={`${total ? Math.round(flagged / total * 100) : 0}% of volume`} color={C.orange} icon={ShieldAlert} />
        <StatCard label="Critical blocks" value={blocked} sub="auto-held pending review" color={C.red} icon={XCircle} />
        <StatCard label="Avg. risk score" value={avgScore} sub="model confidence index" color={C.teal} icon={ShieldCheck} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <div style={glass({ padding: 18 })}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Transaction volume vs. flagged</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.cyan} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="flagGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.red} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" stroke={C.textDim} fontSize={10} fontFamily={FONT_MONO} tickLine={false} axisLine={{ stroke: C.border }} />
              <YAxis stroke={C.textDim} fontSize={10} fontFamily={FONT_MONO} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(6,10,20,0.92)', border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT_BODY, fontSize: 12, backdropFilter: 'blur(10px)' }} labelStyle={{ color: C.text }} />
              <Area type="monotone" dataKey="volume" stroke={C.cyan} fill="url(#volGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="flagged" stroke={C.red} fill="url(#flagGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={glass({ padding: 18 })}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Risk distribution</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={68} paddingAngle={3}>
                {distribution.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(6,10,20,0.92)', border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT_BODY, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
            {distribution.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_BODY, fontSize: 12 }}>
                <span style={{ color: C.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: d.color, display: 'inline-block', boxShadow: glowShadow(d.color, 0.6, 6) }} />{d.name}</span>
                <span style={{ color: C.text, fontFamily: FONT_MONO }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={glass({ padding: 18 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: C.text }}>Recent fraud alerts</div>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textDim }}>{alerts.length} total</span>
        </div>
        {alerts.slice(0, 5).map(tx => (
          <div key={tx.id} onClick={() => onSelect(tx)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderTop: `1px solid ${C.border}`, cursor: 'pointer' }}>
            <RiskGauge score={tx.score} level={tx.level} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.text, fontWeight: 600 }}>{tx.merchant} — {fmtMoney(tx.amount)}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, color: C.textDim }}>{tx.reasons[0]}</div>
            </div>
            <LevelBadge level={tx.level} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textDim, width: 60, textAlign: 'right' }}>{timeAgo(tx.ts)}</span>
          </div>
        ))}
        {alerts.length === 0 && <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.textDim, padding: '14px 4px' }}>No alerts yet — the engine is scanning quietly.</div>}
      </div>
    </div>
  );
}

/* ============================== LIVE MONITOR TAB ============================== */
function LiveMonitor({ transactions, isLive, setIsLive, onSelect }) {
  const recent = transactions.slice(0, 25);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: isLive ? C.teal : C.textDim, boxShadow: isLive ? glowShadow(C.teal, 0.7, 10) : 'none' }} className={isLive ? 'animate-pulse' : ''} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: C.text, letterSpacing: '0.04em' }}>{isLive ? 'SCANNING LIVE FEED' : 'FEED PAUSED'}</span>
        </div>
        <button onClick={() => setIsLive(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 7, ...glass({ borderRadius: 8, padding: '7px 13px' }), color: C.text, fontFamily: FONT_BODY, fontSize: 12.5, cursor: 'pointer' }}>
          {isLive ? <Pause size={14} /> : <Play size={14} />}{isLive ? 'Pause' : 'Resume'}
        </button>
      </div>
      <div style={glass({ overflow: 'hidden', padding: 0 })}>
        <div style={{ display: 'grid', gridTemplateColumns: '52px 100px 1fr 110px 130px 120px 110px 20px', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
          {['Risk', 'ID', 'Merchant', 'Amount', 'Location', 'Level', 'Time', ''].map((h, i) => (
            <span key={i} style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textDim, letterSpacing: '0.05em' }}>{h.toUpperCase()}</span>
          ))}
        </div>
        {recent.map(tx => <TxRow key={tx.id} tx={tx} onClick={onSelect} />)}
      </div>
    </div>
  );
}

/* ============================== ALERTS TAB ============================== */
function AlertsTab({ alerts, onSelect, onAction }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {alerts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: C.textDim, fontFamily: FONT_BODY, fontSize: 13 }}>No active alerts. The system is quiet right now.</div>
      )}
      {alerts.map(tx => {
        const l = LEVELS[tx.level];
        return (
          <div key={tx.id} style={glass({ borderLeft: `3px solid ${l.color}`, padding: 16, display: 'flex', gap: 16, alignItems: 'center', boxShadow: `0 8px 32px rgba(0,0,0,0.5), ${glowShadow(l.color, 0.1, 20)}` })}>
            <RiskGauge score={tx.score} level={tx.level} size={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.cyan }}>{tx.id}</span>
                <LevelBadge level={tx.level} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.textDim }}>{timeAgo(tx.ts)}</span>
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: C.text }}>{tx.merchant} · {fmtMoney(tx.amount)} · {tx.location}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.textMuted, marginTop: 3 }}>{tx.reasons.slice(0, 2).join(' · ')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={() => onSelect(tx)} style={{ background: C.cyanDim, color: C.cyan, border: `1px solid ${hexA(C.cyan, 0.4)}`, borderRadius: 8, padding: '7px 12px', fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Review</button>
              <button onClick={() => onAction(tx.id, 'Approved')} style={{ background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', fontFamily: FONT_BODY, fontSize: 12, cursor: 'pointer' }}>Dismiss</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================== TRANSACTIONS TAB ============================== */
function TransactionsTab({ transactions, onSelect }) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [cardFilter, setCardFilter] = useState('All');

  const filtered = transactions.filter(t => {
    if (riskFilter !== 'All' && t.level !== riskFilter) return false;
    if (cardFilter !== 'All' && !t.cardType.startsWith(cardFilter)) return false;
    if (search && !(t.id.toLowerCase().includes(search.toLowerCase()) || t.merchant.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const selectStyle = { ...glass({ borderRadius: 8, padding: '8px 10px' }), color: C.text, fontFamily: FONT_BODY, fontSize: 12.5, cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...glass({ borderRadius: 8, padding: '8px 12px' }), flex: 1, minWidth: 220 }}>
          <Search size={14} color={C.textDim} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by transaction ID or merchant..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: C.text, fontFamily: FONT_BODY, fontSize: 13, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <SlidersHorizontal size={13} color={C.textDim} />
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={selectStyle}>
            {['All', 'Low', 'Medium', 'High', 'Critical'].map(v => <option key={v} value={v}>{v} risk</option>)}
          </select>
        </div>
        <select value={cardFilter} onChange={e => setCardFilter(e.target.value)} style={selectStyle}>
          <option value="All">All card types</option>
          {[...new Set(CARD_TYPES.map(c => c.split(' •')[0]))].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.textDim, marginLeft: 'auto' }}>{filtered.length} results</span>
      </div>

      <div style={glass({ overflow: 'hidden', padding: 0 })}>
        <div style={{ display: 'grid', gridTemplateColumns: '52px 100px 1fr 110px 130px 120px 110px 20px', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
          {['Risk', 'ID', 'Merchant', 'Amount', 'Location', 'Level', 'Time', ''].map((h, i) => (
            <span key={i} style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textDim, letterSpacing: '0.05em' }}>{h.toUpperCase()}</span>
          ))}
        </div>
        <div style={{ maxHeight: 520, overflowY: 'auto' }}>
          {filtered.slice(0, 80).map(tx => <TxRow key={tx.id} tx={tx} onClick={onSelect} />)}
          {filtered.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: C.textDim, fontFamily: FONT_BODY, fontSize: 13 }}>No transactions match your filters.</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================== ANALYTICS TAB ============================== */
function AnalyticsTab({ transactions }) {
  const byCategory = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      map[t.category] = map[t.category] || { category: t.category, count: 0, avgRisk: 0, total: 0 };
      map[t.category].count += 1;
      map[t.category].total += t.score;
    });
    return Object.values(map).map(c => ({ ...c, avgRisk: Math.round(c.total / c.count) })).sort((a, b) => b.avgRisk - a.avgRisk).slice(0, 8);
  }, [transactions]);

  const distribution = ['Low', 'Medium', 'High', 'Critical'].map(level => ({
    name: level, value: transactions.filter(t => t.level === level).length, color: LEVELS[level].color,
  }));

  const histogram = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({ range: `${i * 10}-${i * 10 + 9}`, count: 0 }));
    transactions.forEach(t => { const idx = Math.min(9, Math.floor(t.score / 10)); buckets[idx].count += 1; });
    return buckets;
  }, [transactions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={glass({ padding: 18 })}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Avg. risk by merchant category</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke={C.textDim} fontSize={10} fontFamily={FONT_MONO} tickLine={false} axisLine={{ stroke: C.border }} />
              <YAxis type="category" dataKey="category" stroke={C.textMuted} fontSize={11} fontFamily={FONT_BODY} width={120} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(6,10,20,0.92)', border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT_BODY, fontSize: 12 }} />
              <Bar dataKey="avgRisk" radius={[0, 4, 4, 0]}>
                {byCategory.map((c, i) => <Cell key={i} fill={c.avgRisk >= 60 ? C.red : c.avgRisk >= 30 ? C.amber : C.teal} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={glass({ padding: 18 })}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Risk score histogram</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={histogram}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" stroke={C.textDim} fontSize={9.5} fontFamily={FONT_MONO} tickLine={false} axisLine={{ stroke: C.border }} />
              <YAxis stroke={C.textDim} fontSize={10} fontFamily={FONT_MONO} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(6,10,20,0.92)', border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT_BODY, fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {histogram.map((h, i) => <Cell key={i} fill={i >= 8 ? C.red : i >= 6 ? C.orange : i >= 3 ? C.amber : C.teal} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={glass({ padding: 18 })}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Risk level breakdown</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {distribution.map((d, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.text }}>{LEVELS[d.name].dot} {d.name}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textMuted }}>{d.value}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: C.panel2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${transactions.length ? d.value / transactions.length * 100 : 0}%`, background: d.color, borderRadius: 999, boxShadow: glowShadow(d.color, 0.6, 8) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== SUBMIT TRANSACTION FORM ============================== */
function TransactionForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    id: makeTxId(),
    cardType: CARD_TYPES[0],
    amount: '',
    merchant: MERCHANTS[0].name,
    location: HOME_LOCATION,
    device: DEVICES[0].label,
    ip: '',
    velocityFlag: false,
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const inputStyle = {
    width: '100%', background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.text, fontFamily: FONT_BODY, fontSize: 13, padding: '9px 11px', outline: 'none',
  };
  const labelStyle = { fontFamily: FONT_MONO, fontSize: 10.5, color: C.textDim, letterSpacing: '0.05em', display: 'block', marginBottom: 6 };
  const fieldWrap = { marginBottom: 14 };

  const canSubmit = form.amount !== '' && Number(form.amount) > 0 && form.location;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 95, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(2,4,10,0.72)', backdropFilter: 'blur(3px)' }} />
      <div
        className="animate-fadeIn-fast"
        style={{
          position: 'relative', width: 480, maxWidth: '92vw', maxHeight: '88vh', overflowY: 'auto',
          background: 'rgba(6,10,20,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: `0 30px 80px rgba(0,0,0,0.6), ${glowShadow(C.cyan, 0.12, 40)}`,
        }}
      >
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(6,10,20,0.92)', zIndex: 1 }}>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: C.text }}>Submit a Transaction</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.textDim, marginTop: 2 }}>Runs live through the fraud-scoring engine on submit</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMuted }}><X size={20} /></button>
        </div>

        <div style={{ padding: 22 }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>TRANSACTION ID</label>
            <input style={inputStyle} value={form.id} onChange={set('id')} placeholder="e.g. TXN-8F21A0" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>CARD / PAYMENT TYPE</label>
              <select style={inputStyle} value={form.cardType} onChange={set('cardType')}>
                {CARD_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>AMOUNT (USD)</label>
              <input style={inputStyle} type="number" min="0" value={form.amount} onChange={set('amount')} placeholder="0.00" />
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>MERCHANT</label>
            <select style={inputStyle} value={form.merchant} onChange={set('merchant')}>
              {MERCHANTS.map(m => <option key={m.name} value={m.name}>{m.name} — {m.category}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>LOCATION</label>
              <select style={inputStyle} value={form.location} onChange={set('location')}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>DEVICE / IP INFO</label>
              <select style={inputStyle} value={form.device} onChange={set('device')}>
                {DEVICES.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
              </select>
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>IP ADDRESS (OPTIONAL)</label>
            <input style={inputStyle} value={form.ip} onChange={set('ip')} placeholder="auto-generated if left blank" />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.velocityFlag} onChange={e => setForm(f => ({ ...f, velocityFlag: e.target.checked }))} />
            <span style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.textMuted }}>Simulate multiple rapid transactions on this card (velocity anomaly)</span>
          </label>

          <button
            disabled={!canSubmit}
            onClick={() => onSubmit(form)}
            style={{
              width: '100%', background: canSubmit ? C.cyan : C.border, color: canSubmit ? '#03050C' : C.textDim,
              border: 'none', borderRadius: 9, padding: '12px 0', fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5,
              cursor: canSubmit ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: canSubmit ? glowShadow(C.cyan, 0.4, 18) : 'none',
            }}
          >
            <ShieldCheck size={16} /> Run Fraud Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== ROOT APP ============================== */
export default function FraudShieldApp() {
  const [transactions, setTransactions] = useState(() => seedHistory(70));
  const [tab, setTab] = useState('overview');
  const [selectedTx, setSelectedTx] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const toastId = useRef(0);

  const alerts = transactions.filter(t => t.level === 'High' || t.level === 'Critical');

  const pushToast = useCallback((tx) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, score: tx.score, id_tx: tx.id, ...tx }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const tx = generateTransaction();
      setTransactions(prev => [tx, ...prev].slice(0, 220));
      if (tx.level === 'Critical') pushToast(tx);
    }, 3800);
    return () => clearInterval(interval);
  }, [isLive, pushToast]);

  const handleManualSubmit = useCallback((form) => {
    const tx = buildManualTransaction(form);
    setTransactions(prev => [tx, ...prev].slice(0, 220));
    setShowForm(false);
    if (tx.level === 'Critical') pushToast(tx);
    setSelectedTx(tx);
  }, [pushToast]);

  const handleAction = useCallback((id, newStatus) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, level: newStatus === 'Approved' ? 'Low' : t.level } : t));
    setSelectedTx(null);
  }, []);

  return (
    <div style={{ fontFamily: FONT_BODY, background: C.bg, color: C.text, width: '100%', height: '100vh', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${hexA(C.cyan, 0.25)}; border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        select { appearance: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(24px); opacity: .6; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        .animate-fadeIn { animation: fadeIn .25s ease; }
        .animate-fadeIn-fast { animation: fadeIn .2s ease; }
        .animate-slideIn { animation: slideIn .25s ease; }
      `}</style>

      {/* Background: deep space gradient + neon glows + circuit grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `radial-gradient(circle at 12% 15%, ${hexA(C.cyan, 0.09)}, transparent 42%), radial-gradient(circle at 88% 78%, ${hexA(C.violet, 0.1)}, transparent 46%), radial-gradient(circle at 50% 100%, ${hexA(C.teal, 0.05)}, transparent 50%), ${C.bg}`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${hexA(C.cyan, 0.045)} 1px, transparent 1px), linear-gradient(90deg, ${hexA(C.cyan, 0.045)} 1px, transparent 1px)`,
        backgroundSize: '42px 42px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 78%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 78%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', height: '100%' }}>
        <Sidebar tab={tab} setTab={setTab} alertCount={alerts.length} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '18px 28px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bgAlt, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: C.text, letterSpacing: '0.01em' }}>
                {{ overview: 'Overview', live: 'Live Transaction Monitor', alerts: 'Fraud Alerts', transactions: 'Transaction History', analytics: 'Analytics' }[tab]}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.textDim, marginTop: 2 }}>Real-time credit & debit card fraud detection</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, background: C.cyanDim, color: C.cyan,
                  border: `1px solid ${hexA(C.cyan, 0.35)}`, borderRadius: 9, padding: '8px 14px',
                  fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', boxShadow: glowShadow(C.cyan, 0.15, 12),
                }}
              >
                <Plus size={15} /> New Transaction
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.tealDim, border: `1px solid ${hexA(C.teal, 0.35)}`, borderRadius: 999, padding: '6px 13px', boxShadow: glowShadow(C.teal, 0.2, 12) }}>
                <span className="animate-pulse" style={{ width: 7, height: 7, borderRadius: 999, background: C.teal, boxShadow: glowShadow(C.teal, 0.9, 6) }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.teal }}>ENGINE ONLINE</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {tab === 'overview' && <Overview transactions={transactions} alerts={alerts} onSelect={setSelectedTx} />}
            {tab === 'live' && <LiveMonitor transactions={transactions} isLive={isLive} setIsLive={setIsLive} onSelect={setSelectedTx} />}
            {tab === 'alerts' && <AlertsTab alerts={alerts} onSelect={setSelectedTx} onAction={handleAction} />}
            {tab === 'transactions' && <TransactionsTab transactions={transactions} onSelect={setSelectedTx} />}
            {tab === 'analytics' && <AnalyticsTab transactions={transactions} />}
          </div>
        </div>

        <ControlPanel
          transactions={transactions}
          alerts={alerts}
          onSelect={setSelectedTx}
          isLive={isLive}
          setIsLive={setIsLive}
          onNewTransaction={() => setShowForm(true)}
        />
      </div>

      <DetailDrawer tx={selectedTx} onClose={() => setSelectedTx(null)} onAction={handleAction} />
      {showForm && <TransactionForm onClose={() => setShowForm(false)} onSubmit={handleManualSubmit} />}
      <ToastStack toasts={toasts} />
    </div>
  );
}
