const HandBase = ({ children, color = "#2563eb" }: { children: React.ReactNode; color?: string }) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Palm base */}
    <ellipse cx="40" cy="72" rx="22" ry="24" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.5" />
    {/* Wrist */}
    <rect x="30" y="85" width="20" height="15" rx="4" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.2" />
    {children}
  </svg>
);

/* ===== ALFABETO ===== */

const signA = (color?: string) => (
  <HandBase color={color}>
    <rect x="32" y="10" width="16" height="50" rx="8" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
    <line x1="40" y1="8" x2="40" y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </HandBase>
);

const signB = (color?: string) => (
  <HandBase color={color}>
    <rect x="12" y="18" width="56" height="48" rx="4" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.8" />
    <line x1="20" y1="18" x2="20" y2="62" stroke={color} strokeWidth="1" opacity="0.3" />
    <line x1="30" y1="18" x2="30" y2="62" stroke={color} strokeWidth="1" opacity="0.3" />
    <line x1="40" y1="18" x2="40" y2="62" stroke={color} strokeWidth="1" opacity="0.3" />
    <line x1="50" y1="18" x2="50" y2="62" stroke={color} strokeWidth="1" opacity="0.3" />
    <line x1="60" y1="18" x2="60" y2="62" stroke={color} strokeWidth="1" opacity="0.3" />
  </HandBase>
);

const signC = (color?: string) => (
  <HandBase color={color}>
    <path d="M18 35 Q18 18 35 18 Q52 18 58 28 Q62 36 62 48 Q62 62 50 68 Q42 72 35 72" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2.5" />
    <path d="M22 42 Q22 32 32 28" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
  </HandBase>
);

const signD = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="40" r="18" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="40" y1="24" x2="40" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="40" cy="8" r="2.5" fill={color} />
  </HandBase>
);

const signE = (color?: string) => (
  <HandBase color={color}>
    <rect x="18" y="28" width="44" height="30" rx="12" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="22" y1="28" x2="22" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <line x1="32" y1="28" x2="32" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <line x1="42" y1="28" x2="42" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <line x1="52" y1="28" x2="52" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <circle cx="40" cy="48" r="8" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
  </HandBase>
);

const signF = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="32" r="7" fill="none" stroke={color} strokeWidth="2.5" />
    <line x1="35" y1="44" x2="25" y2="55" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="44" x2="36" y2="58" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="45" y1="44" x2="52" y2="55" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </HandBase>
);

const signG = (color?: string) => (
  <HandBase color={color}>
    <rect x="20" y="35" width="40" height="25" rx="12" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="42" y1="36" x2="50" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="14" x2="65" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="65" cy="10" r="2" fill={color} />
  </HandBase>
);

const signH = (color?: string) => (
  <HandBase color={color}>
    <rect x="18" y="38" width="44" height="22" rx="11" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="30" y1="38" x2="28" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="38" x2="44" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="28" cy="10" r="2" fill={color} />
    <circle cx="44" cy="10" r="2" fill={color} />
  </HandBase>
);

const signI = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="42" r="16" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="44" y1="28" x2="46" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="46" cy="8" r="2.5" fill={color} />
  </HandBase>
);

const signJ = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="45" r="14" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="46" y1="32" x2="48" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M48 10 Q58 8 56 18 Q54 25 44 22" fill="none" stroke={color} strokeWidth="2" />
    <circle cx="48" cy="8" r="2" fill={color} />
  </HandBase>
);

const signK = (color?: string) => (
  <HandBase color={color}>
    <rect x="20" y="38" width="40" height="20" rx="10" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="30" y1="38" x2="22" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="38" x2="52" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="10" x2="52" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </HandBase>
);

const signL = (color?: string) => (
  <HandBase color={color}>
    <circle cx="35" cy="55" r="15" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="37" y1="42" x2="42" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="50" x2="5" y2="42" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="42" cy="8" r="2.5" fill={color} />
  </HandBase>
);

const signM = (color?: string) => (
  <HandBase color={color}>
    <rect x="16" y="26" width="48" height="30" rx="14" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="22" y1="36" x2="22" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="32" y1="36" x2="32" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="42" y1="36" x2="42" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="22" cy="12" r="1.5" fill={color} />
    <circle cx="32" cy="10" r="1.5" fill={color} />
    <circle cx="42" cy="8" r="1.5" fill={color} />
  </HandBase>
);

const signN = (color?: string) => (
  <HandBase color={color}>
    <rect x="18" y="28" width="44" height="28" rx="14" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="25" y1="36" x2="23" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="36" x2="40" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="23" cy="12" r="2" fill={color} />
    <circle cx="40" cy="8" r="2" fill={color} />
  </HandBase>
);

const signO = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="38" r="16" fill={color} fillOpacity="0.05" stroke={color} strokeWidth="2.5" />
    <circle cx="40" cy="38" r="8" fill={color} fillOpacity="0.05" stroke={color} strokeWidth="1.5" />
    <circle cx="40" cy="38" r="3" fill={color} fillOpacity="0.15" />
  </HandBase>
);

const signP = (color?: string) => (
  <HandBase color={color}>
    <circle cx="42" cy="45" r="16" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="44" y1="30" x2="52" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="14" x2="68" y2="8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="52" cy="8" r="2" fill={color} />
  </HandBase>
);

const signQ = (color?: string) => (
  <HandBase color={color}>
    <circle cx="38" cy="50" r="14" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="35" y1="36" x2="28" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="36" x2="48" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="28" cy="8" r="2" fill={color} />
    <circle cx="48" cy="8" r="2" fill={color} />
  </HandBase>
);

const signR = (color?: string) => (
  <HandBase color={color}>
    <rect x="18" y="38" width="44" height="22" rx="11" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="30" y1="38" x2="22" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="38" x2="56" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="28" y1="20" x2="50" y2="18" stroke={color} strokeWidth="2" />
    <circle cx="22" cy="10" r="2" fill={color} />
    <circle cx="56" cy="10" r="2" fill={color} />
  </HandBase>
);

const signS = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="42" r="18" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="2.5" />
    <path d="M28 35 Q30 32 38 35 Q44 38 50 35" fill="none" stroke={color} strokeWidth="2" />
    <path d="M28 42 Q32 40 38 42 Q44 44 50 42" fill="none" stroke={color} strokeWidth="2" />
    <path d="M28 49 Q32 47 38 49 Q44 51 50 49" fill="none" stroke={color} strokeWidth="2" />
  </HandBase>
);

const signT = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="42" r="18" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="30" y1="42" x2="28" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="42" x2="46" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="28" cy="8" r="2" fill={color} />
    <circle cx="46" cy="8" r="2" fill={color} />
  </HandBase>
);

const signU = (color?: string) => (
  <HandBase color={color}>
    <rect x="18" y="38" width="44" height="20" rx="10" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="28" y1="38" x2="22" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="44" y1="38" x2="50" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="22" cy="8" r="2.5" fill={color} />
    <circle cx="50" cy="8" r="2.5" fill={color} />
  </HandBase>
);

const signV = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="50" r="14" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="30" y1="38" x2="16" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="46" y1="38" x2="60" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="16" cy="8" r="2.5" fill={color} />
    <circle cx="60" cy="8" r="2.5" fill={color} />
  </HandBase>
);

const signW = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="50" r="12" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="20" y1="38" x2="8" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="40" y1="36" x2="40" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="52" y1="38" x2="68" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="8" cy="8" r="2" fill={color} />
    <circle cx="40" cy="8" r="2" fill={color} />
    <circle cx="68" cy="8" r="2" fill={color} />
  </HandBase>
);

const signX = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="48" r="15" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="38" y1="35" x2="34" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M34 10 Q20 14 24 20 Q28 26 38 22" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="34" cy="8" r="2" fill={color} />
  </HandBase>
);

const signY = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="50" r="14" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="32" y1="38" x2="22" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="40" x2="66" y2="16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="22" cy="10" r="2.5" fill={color} />
    <circle cx="66" cy="14" r="2.5" fill={color} />
  </HandBase>
);

const signZ = (color?: string) => (
  <HandBase color={color}>
    <rect x="20" y="35" width="40" height="22" rx="11" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <path d="M25 22 L50 18 L48 12" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </HandBase>
);

/* ===== NÚMEROS ===== */

const num0 = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="36" r="14" fill={color} fillOpacity="0.05" stroke={color} strokeWidth="2.5" />
    <circle cx="40" cy="36" r="10" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
  </HandBase>
);

const num1 = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="42" r="18" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="40" y1="24" x2="40" y2="8" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="40" cy="6" r="3" fill={color} />
  </HandBase>
);

const num2 = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="48" r="15" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="32" y1="34" x2="20" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="46" y1="34" x2="58" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="20" cy="8" r="2.5" fill={color} />
    <circle cx="58" cy="8" r="2.5" fill={color} />
  </HandBase>
);

const num3 = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="48" r="14" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="30" y1="34" x2="16" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="32" x2="40" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="50" y1="34" x2="64" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="8" r="2" fill={color} />
    <circle cx="40" cy="8" r="2" fill={color} />
    <circle cx="64" cy="8" r="2" fill={color} />
  </HandBase>
);

const num4 = (color?: string) => (
  <HandBase color={color}>
    <rect x="14" y="38" width="52" height="20" rx="10" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="18" y1="38" x2="14" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="30" y1="36" x2="30" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="42" y1="36" x2="42" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="54" y1="38" x2="58" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="14" cy="8" r="1.5" fill={color} />
    <circle cx="30" cy="8" r="1.5" fill={color} />
    <circle cx="42" cy="8" r="1.5" fill={color} />
    <circle cx="58" cy="8" r="1.5" fill={color} />
  </HandBase>
);

const num5 = (color?: string) => (
  <HandBase color={color}>
    <rect x="12" y="32" width="56" height="28" rx="4" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="2" />
    <line x1="18" y1="30" x2="18" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <line x1="30" y1="30" x2="30" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <line x1="42" y1="30" x2="42" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <line x1="54" y1="30" x2="54" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <line x1="66" y1="30" x2="66" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </HandBase>
);

const num6 = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="48" r="16" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="48" y1="34" x2="64" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="34" x2="28" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M64 14 Q66 22 58 28" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="64" cy="12" r="2" fill={color} />
    <circle cx="28" cy="12" r="2" fill={color} />
  </HandBase>
);

const num7 = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="48" r="16" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="48" y1="34" x2="64" y2="16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="34" x2="28" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="60" y1="16" x2="58" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <circle cx="64" cy="14" r="2" fill={color} />
    <circle cx="28" cy="16" r="2" fill={color} />
  </HandBase>
);

const num8 = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="48" r="16" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="48" y1="34" x2="62" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="34" x2="28" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="56" y1="38" x2="66" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="62" cy="10" r="2" fill={color} />
    <circle cx="28" cy="16" r="2" fill={color} />
    <circle cx="66" cy="22" r="2" fill={color} />
  </HandBase>
);

const num9 = (color?: string) => (
  <HandBase color={color}>
    <circle cx="40" cy="48" r="16" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="48" y1="34" x2="60" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="34" x2="24" y2="16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="54" y1="38" x2="66" y2="30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="60" cy="12" r="2" fill={color} />
    <circle cx="24" cy="14" r="2" fill={color} />
    <circle cx="66" cy="28" r="2" fill={color} />
  </HandBase>
);

/* ===== FRASES ===== */

const phraseOla = (color?: string) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="72" rx="20" ry="22" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
    <rect x="28" y="40" width="24" height="35" rx="12" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <path d="M18 10 Q20 6 28 8 Q38 10 44 8" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 10 Q18 18 24 22" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <path d="M28 8 Q25 14 28 18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <path d="M38 8 Q35 14 38 18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <path d="M18 10 Q14 6 10 8" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
    <path d="M28 8 Q32 2 36 6 Q40 2 44 8" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
  </svg>
);

const phraseBomDia = (color?: string) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="72" rx="20" ry="22" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
    <rect x="22" y="40" width="36" height="32" rx="16" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <path d="M30 46 L30 30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M40 46 L40 28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M50 46 L50 30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="30" cy="28" r="2" fill={color} />
    <circle cx="40" cy="26" r="2" fill={color} />
    <circle cx="50" cy="28" r="2" fill={color} />
    <path d="M22 18 Q30 10 40 14" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
  </svg>
);

const phraseObrigado = (color?: string) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="72" rx="20" ry="22" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.5" />
    <rect x="28" y="42" width="24" height="28" rx="12" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <path d="M30 34 L28 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M40 34 L40 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M50 34 L52 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="28" cy="16" r="2" fill={color} />
    <circle cx="40" cy="14" r="2" fill={color} />
    <circle cx="52" cy="16" r="2" fill={color} />
  </svg>
);

const phrasePorFavor = (color?: string) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="72" rx="20" ry="22" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
    <rect x="25" y="42" width="30" height="28" rx="14" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="28" y1="48" x2="28" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="48" x2="40" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="52" y1="48" x2="52" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="28" cy="18" r="1.5" fill={color} />
    <circle cx="40" cy="16" r="1.5" fill={color} />
    <circle cx="52" cy="18" r="1.5" fill={color} />
    <path d="M15 55 Q18 48 25 52" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
    <path d="M55 55 Q60 48 65 52" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
  </svg>
);

const phraseDesculpa = (color?: string) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="72" rx="20" ry="22" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
    <circle cx="40" cy="40" r="18" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <path d="M30 34 Q28 26 36 24 Q44 22 50 28" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M30 40 Q28 38 32 34" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
    <path d="M40 42 Q40 38 44 36" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
    <path d="M50 40 Q52 38 48 34" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
  </svg>
);

const phraseSim = (color?: string) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="72" rx="20" ry="22" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
    <circle cx="40" cy="42" r="16" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <path d="M30 42 L30 22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M40 42 L40 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M50 42 L50 22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="30" cy="20" r="2" fill={color} />
    <circle cx="40" cy="18" r="2" fill={color} />
    <circle cx="50" cy="20" r="2" fill={color} />
    <path d="M22 64 Q24 68 30 66" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
    <path d="M50 64 Q52 68 58 66" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
  </svg>
);

const phraseNao = (color?: string) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="72" rx="20" ry="22" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
    <rect x="16" y="32" width="48" height="28" rx="4" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="2" />
    <path d="M20 36 Q22 28 30 30" fill="none" stroke={color} strokeWidth="2" />
    <path d="M36 36 Q38 28 46 30" fill="none" stroke={color} strokeWidth="2" />
    <path d="M52 36 Q54 28 60 30" fill="none" stroke={color} strokeWidth="2" />
    <path d="M20 44 Q22 50 30 48" fill="none" stroke={color} strokeWidth="2" />
    <path d="M36 44 Q38 50 46 48" fill="none" stroke={color} strokeWidth="2" />
    <path d="M52 44 Q54 50 60 48" fill="none" stroke={color} strokeWidth="2" />
  </svg>
);

const phraseBeleza = (color?: string) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="72" rx="20" ry="22" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
    <rect x="24" y="38" width="32" height="30" rx="16" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <line x1="30" y1="42" x2="28" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="42" x2="40" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="50" y1="42" x2="52" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="28" cy="14" r="1.5" fill={color} />
    <circle cx="40" cy="12" r="1.5" fill={color} />
    <circle cx="52" cy="14" r="1.5" fill={color} />
    <path d="M18 62 Q24 56 30 60" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
  </svg>
);

const phraseAgendar = (color?: string) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="72" rx="20" ry="22" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
    <rect x="22" y="36" width="16" height="24" rx="8" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <rect x="42" y="44" width="16" height="24" rx="8" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <path d="M26 28 L24 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M34 28 L36 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M46 36 L50 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M54 36 L58 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const phrasePreco = (color?: string) => (
  <svg viewBox="0 0 80 100" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="72" rx="20" ry="22" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
    <circle cx="40" cy="42" r="18" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
    <path d="M28 42 L26 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M40 42 L40 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M52 42 L54 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="26" cy="16" r="2" fill={color} />
    <circle cx="40" cy="16" r="2" fill={color} />
    <circle cx="54" cy="16" r="2" fill={color} />
    <path d="M34 52 L28 48" stroke={color} strokeWidth="1.5" opacity="0.3" />
    <path d="M46 52 L52 48" stroke={color} strokeWidth="1.5" opacity="0.3" />
  </svg>
);

/* ===== MAPAS DE EXPORTAÇÃO ===== */

export const ALPHABET_SIGNS: Record<string, (color?: string) => React.ReactNode> = {
  A: signA, B: signB, C: signC, D: signD, E: signE,
  F: signF, G: signG, H: signH, I: signI, J: signJ,
  K: signK, L: signL, M: signM, N: signN, O: signO,
  P: signP, Q: signQ, R: signR, S: signS, T: signT,
  U: signU, V: signV, W: signW, X: signX, Y: signY,
  Z: signZ,
};

export const NUMBER_SIGNS: Record<string, (color?: string) => React.ReactNode> = {
  "0": num0, "1": num1, "2": num2, "3": num3, "4": num4,
  "5": num5, "6": num6, "7": num7, "8": num8, "9": num9,
};

export const PHRASE_SIGNS: Record<string, (color?: string) => React.ReactNode> = {
  "Olá": phraseOla,
  "Bom dia": phraseBomDia,
  "Obrigado": phraseObrigado,
  "Por favor": phrasePorFavor,
  "Desculpa": phraseDesculpa,
  "Sim": phraseSim,
  "Não": phraseNao,
  "Beleza": phraseBeleza,
  "Agendar": phraseAgendar,
  "Preço": phrasePreco,
};

export function getAlphabetSign(letter: string, color?: string) {
  const fn = ALPHABET_SIGNS[letter];
  return fn ? fn(color) : null;
}

export function getNumberSign(num: string, color?: string) {
  const fn = NUMBER_SIGNS[num];
  return fn ? fn(color) : null;
}

export function getPhraseSign(phrase: string, color?: string) {
  const fn = PHRASE_SIGNS[phrase];
  return fn ? fn(color) : null;
}
