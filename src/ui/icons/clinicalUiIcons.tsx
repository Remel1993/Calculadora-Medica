import React, { useId } from 'react';

interface IconProps {
  className?: string;
}

interface StarIconProps extends IconProps {
  filled?: boolean;
}

function useSafeMaskId(prefix: string): string {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return `${prefix}-${raw}`;
}

/**
 * Bold Solid-Glyph + Knockout Cutout Clinical UI Icon Suite (100% offline SVG, 24x24 grid).
 * Uses unique SVG <mask> knockouts so transparent cutouts remain crisp across light, dark,
 * pastel, and gradient clinical surfaces.
 */

export const ClinicalHomeIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('clinic-home');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M12 10.2v5.4M9.3 12.9h5.4" stroke="black" strokeWidth="2.1" strokeLinecap="round" />
        </mask>
      </defs>
      <path
        d="M2.8 11.2 12 3.6l9.2 7.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 10.2 12 4.5l7 5.7V19.2a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 19.2v-9Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

export const ClinicalSpecialtiesIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('spec-grid');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M7.2 5.2v3.6M5.4 7h3.6" stroke="black" strokeWidth="1.65" strokeLinecap="round" />
          <path d="M14.6 16.8h1.1l.7-1.4.9 2.6.8-1.2h1.3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </mask>
      </defs>
      <g fill="currentColor" mask={`url(#${maskId})`}>
        <rect x="3" y="3" width="8.2" height="8.2" rx="2.3" />
        <rect x="12.8" y="3" width="8.2" height="8.2" rx="2.3" opacity="0.82" />
        <rect x="3" y="12.8" width="8.2" height="8.2" rx="2.3" opacity="0.82" />
        <rect x="12.8" y="12.8" width="8.2" height="8.2" rx="2.3" />
      </g>
    </svg>
  );
};

export const ClinicalStarIcon: React.FC<StarIconProps> = ({ className, filled = false }) => {
  const maskId = useSafeMaskId('star');
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <defs>
          <mask id={maskId}>
            <rect width="24" height="24" fill="white" />
            <path d="M12 8.2v3.6M10.2 10h3.6" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
          </mask>
        </defs>
        <path
          d="m12 2.7 2.75 5.65 6.23.86-4.54 4.37 1.11 6.2L12 16.8l-5.55 2.98 1.11-6.2L3.02 9.21l6.23-.86L12 2.7Z"
          fill="currentColor"
          mask={`url(#${maskId})`}
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 3.1 2.65 5.45 6.02.83-4.39 4.22 1.07 5.98L12 16.72l-5.35 2.86 1.07-5.98L3.33 9.38l6.02-.83L12 3.1Z" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
};

export const ClinicalHistoryIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('history');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M12.5 7.8v4.7l3.2 1.9" stroke="black" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </mask>
      </defs>
      <circle cx="12.5" cy="12.5" r="8" fill="currentColor" mask={`url(#${maskId})`} />
      <path
        d="M3.2 11.4a9.4 9.4 0 0 1 16-5.7"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M3.2 7.5v4h4"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ClinicalSearchIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('search');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M6.4 10.6h1.6l1-2 1.4 3.8 1.2-2.5.8.7h1.8" stroke="black" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        </mask>
      </defs>
      <circle cx="10.4" cy="10.4" r="7.2" fill="currentColor" mask={`url(#${maskId})`} />
      <path d="m15.7 15.7 4.9 4.9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
};

export const ClinicalConsoleIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('console');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <rect x="6.8" y="5" width="10.4" height="5.2" rx="1.2" fill="black" />
          <circle cx="8.3" cy="13.3" r="1.15" fill="black" />
          <circle cx="12" cy="13.3" r="1.15" fill="black" />
          <circle cx="15.7" cy="13.3" r="1.15" fill="black" />
          <circle cx="8.3" cy="16.9" r="1.15" fill="black" />
          <circle cx="12" cy="16.9" r="1.15" fill="black" />
          <path d="M15.7 15.2v3.4M14 16.9h3.4" stroke="black" strokeWidth="1.7" strokeLinecap="round" />
        </mask>
      </defs>
      <rect x="4" y="2.4" width="16" height="19.2" rx="3.2" fill="currentColor" mask={`url(#${maskId})`} />
      <path
        d="M8.1 7.6h1.6l.8-1.4 1.1 2.7.9-1.7.6.4h2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ClinicalEvidenceBookIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('book');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M12.5 5.6v5M10 8.1h5" stroke="black" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M9.5 13.4h6" stroke="black" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M6.8 17.5H20" stroke="black" strokeWidth="1.9" strokeLinecap="round" />
        </mask>
      </defs>
      <path
        d="M4.5 4.4A2.4 2.4 0 0 1 6.9 2h11.6A1.5 1.5 0 0 1 20 3.5v16a1.5 1.5 0 0 1-1.5 1.5H6.9a2.4 2.4 0 0 1-2.4-2.4V4.4Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
      <path
        d="M7 19.2h12.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ClinicalSafetyShieldIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('safety-shield');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M12 7.4v5.4" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1.25" fill="black" />
        </mask>
      </defs>
      <path
        d="M12 2.4 4.3 5.6v6c0 5 3.3 9.2 7.7 10.6 4.4-1.4 7.7-5.6 7.7-10.6v-6L12 2.4Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

export const ClinicalCheckShieldIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('check-shield');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="m8.4 12.1 2.4 2.5 4.8-5" stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </mask>
      </defs>
      <path
        d="M12 2.4 4.3 5.6v6c0 5 3.3 9.2 7.7 10.6 4.4-1.4 7.7-5.6 7.7-10.6v-6L12 2.4Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

export const ClinicalInfoPulseIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('info-pulse');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <circle cx="12" cy="7.8" r="1.25" fill="black" />
          <path d="M12 11.2v5.4" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
        </mask>
      </defs>
      <circle cx="12" cy="12" r="9.4" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
};

export const ClinicalWarningIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('warning');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M12 8.8v4.6" stroke="black" strokeWidth="2.15" strokeLinecap="round" />
          <circle cx="12" cy="16.4" r="1.2" fill="black" />
        </mask>
      </defs>
      <path
        d="M10.2 3.8 2.8 17a2 2 0 0 0 1.75 3h14.9a2 2 0 0 0 1.75-3L13.8 3.8a2 2 0 0 0-3.6 0Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

export const ClinicalAlertOctagonIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('alert-oct');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M12 7.5v5.2" stroke="black" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1.25" fill="black" />
        </mask>
      </defs>
      <path
        d="M8.1 2.8h7.8l5.3 5.3v7.8l-5.3 5.3H8.1l-5.3-5.3V8.1l5.3-5.3Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

export const ClinicalSunIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="5" fill="currentColor" />
    <path
      d="M12 2.4v2.3M12 19.3v2.3M2.4 12h2.3M19.3 12h2.3M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

export const ClinicalMoonIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M20.2 14.8A8.3 8.3 0 0 1 9.2 3.8a8.6 8.6 0 1 0 11 11Z"
      fill="currentColor"
    />
    <path d="M17.2 4.6v3M15.7 6.1h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const ClinicalInstallIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('install');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M12 7v7" stroke="black" strokeWidth="2.1" strokeLinecap="round" />
          <path d="m9.1 11.4 2.9 3 2.9-3" stroke="black" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 17.3h8" stroke="black" strokeWidth="1.9" strokeLinecap="round" />
        </mask>
      </defs>
      <rect x="3.5" y="3" width="17" height="18" rx="3.6" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
};

export const ClinicalOfflineIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('offline');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M6.8 11a7.4 7.4 0 0 1 10.4 0" stroke="black" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M9.4 13.8a3.8 3.8 0 0 1 5.2 0" stroke="black" strokeWidth="1.9" strokeLinecap="round" />
          <circle cx="12" cy="16.7" r="1.15" fill="black" />
          <path d="M5.4 5.4 18.6 18.6" stroke="black" strokeWidth="2.1" strokeLinecap="round" />
        </mask>
      </defs>
      <circle cx="12" cy="12" r="9.4" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
};

export const ClinicalFolderIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('folder');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M12 10.6v4.8M9.6 13h4.8" stroke="black" strokeWidth="2" strokeLinecap="round" />
        </mask>
      </defs>
      <path
        d="M3 6.5a2.2 2.2 0 0 1 2.2-2.2h4.4l2 2.2h7.2A2.2 2.2 0 0 1 21 8.7v9.1A2.2 2.2 0 0 1 18.8 20H5.2A2.2 2.2 0 0 1 3 17.8V6.5Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

export const ClinicalResetIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4.3 11.4a7.8 7.8 0 1 1 2.1 5.9"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M3.6 7.3v4.3h4.3"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="1.9" fill="currentColor" />
  </svg>
);

export const ClinicalTrashIcon: React.FC<IconProps> = ({ className }) => {
  const maskId = useSafeMaskId('trash');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M10.1 11.1v5.8M13.9 11.1v5.8" stroke="black" strokeWidth="1.9" strokeLinecap="round" />
        </mask>
      </defs>
      <path
        d="M5.8 7.6h12.4l-1 11.7a2.1 2.1 0 0 1-2.1 1.9H8.9a2.1 2.1 0 0 1-2.1-1.9L5.8 7.6Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
      <path
        d="M4 6.2h16M9.3 6.2V4.5a1.2 1.2 0 0 1 1.2-1.2h3a1.2 1.2 0 0 1 1.2 1.2v1.7"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
};
