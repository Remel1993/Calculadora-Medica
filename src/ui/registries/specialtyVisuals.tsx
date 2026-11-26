import React, { useId } from 'react';
import type { SpecialtyId } from '../../clinical-core/types/clinical.ts';

function useSafeMaskId(prefix: string): string {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return `${prefix}-${raw}`;
}

/**
 * Unified Bold Solid-Glyph + Knockout Cutout Clinical Specialty Icon Suite (100% offline SVG, 24x24 grid).
 * Matches the bold medical silhouette + crisp anatomical negative-space style.
 */

const StethoscopeIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('stetho');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <circle cx="19" cy="11.2" r="1.15" fill="black" />
        </mask>
      </defs>
      <path
        d="M5.4 3.6v4.6a4.6 4.6 0 0 0 9.2 0V3.6"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5.4" cy="3.5" r="1.35" fill="currentColor" />
      <circle cx="14.6" cy="3.5" r="1.35" fill="currentColor" />
      <path
        d="M10 12.9v3.3a4.5 4.5 0 0 0 9 0v-2.4"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="11.2" r="2.8" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
};

const CardiologyIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('cardio-ecg');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path
            d="M2.5 11.8h4l1.6-2.9 2 5.7 2-4.6 1.3 1.8h8.1"
            stroke="black"
            strokeWidth="2.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <path
        d="M12 20.8s-8-5-9.3-10.2C1.6 6.7 4.5 3.4 8 3.4c1.9 0 3.3 1 4 2.4.7-1.4 2.1-2.4 4-2.4 3.5 0 6.4 3.3 5.3 7.2C20 15.8 12 20.8 12 20.8Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

const PediatricsIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('peds');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M6.4 8.5h11.2" stroke="black" strokeWidth="1.45" />
          <path
            d="M7.3 12.2h2.5M7.3 14.8h1.9M7.3 17.4h2.5"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M13.5 12.9v3.8M11.6 14.8h3.8"
            stroke="black"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <path d="M10.4 5.5c0-1.6.5-3.1 1.6-3.1s1.6 1.5 1.6 3.1Z" fill="currentColor" />
      <g fill="currentColor" mask={`url(#${maskId})`}>
        <rect x="6.9" y="5.4" width="10.2" height="2.6" rx="1.2" />
        <path d="M7.5 9.1h9v9.5a2.8 2.8 0 0 1-2.8 2.8h-3.4a2.8 2.8 0 0 1-2.8-2.8V9.1Z" />
      </g>
    </svg>
  );
};

const ObstetricsIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('obgyn');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M10.4 17.8h3.2M10.4 19.8h3.2" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
          <path
            d="M10.4 8.5c0-.6.7-1.1 1.6-1.1s1.6.5 1.6 1.1c0 1.4-.7 3.1-1.6 4.1-.9-1-1.6-2.7-1.6-4.1Z"
            fill="black"
          />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`} fill="currentColor">
        <path d="M7.6 7.5c0-1.9 2-3.1 4.4-3.1s4.4 1.2 4.4 3.1c0 3.2-1.5 6.4-2.6 8.3-.4.8-.6 1.4-.6 5.4h-2.4c0-4-.2-4.6-.6-5.4-1.1-1.9-2.6-5.1-2.6-8.3Z" />
      </g>
      <path d="M8.6 6.2C6.3 4.8 3.8 5.6 3.1 8" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M15.4 6.2C17.7 4.8 20.2 5.6 20.9 8" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="4.1" cy="10.4" r="2.1" fill="currentColor" />
      <circle cx="19.9" cy="10.4" r="2.1" fill="currentColor" />
    </svg>
  );
};

const NeurologyIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('neuro');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path
            d="M6.4 10.6c1.8-.3 3.1-.1 4.1.8M11 7.2c.6 1.3.4 2.5-.3 3.4M14.3 7.8c-.4 1.6.6 2.8 2.2 3M8 14.3c1.9-.6 3.8-.5 5.4.4"
            stroke="black"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path d="M12.3 15.6c1.7.3 3.2-.2 4.3-1.2" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
        </mask>
      </defs>
      <path
        d="M11.6 4.2c-3.8 0-6.8 2.4-7.4 5.8-.7 2 .2 4.2 2 5.2.9.6 2 .8 3.2.8.8 0 1.4.3 1.7 1.1l.6 2.8a1.2 1.2 0 0 0 2.3-.3l-.1-2.7c.7-.1 1.4-.3 2-.7 2-.1 3.7-1.5 4.1-3.5.7-3.4-1.6-7.4-5.4-8.2-.9-.2-2-.3-3-.3Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

const KidneysIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path
      d="M8.5 4.4C5.4 3.9 3.2 6.5 3.2 10.2c0 3.6 2.4 5.9 5.1 5.1 1.2-.3 1.6-1.4 1.1-2.4-.4-.8-.3-1.7.4-2.3.8-.8.7-5.8-1.3-6.2Z"
      fill="currentColor"
      fillOpacity="0.92"
      stroke="none"
    />
    <path
      d="M15.5 4.4c3.1-.5 5.3 2.1 5.3 5.8 0 3.6-2.4 5.9-5.1 5.1-1.2-.3-1.6-1.4-1.1-2.4.4-.8.3-1.7-.4-2.3-.8-.8-.7-5.8 1.3-6.2Z"
      fill="currentColor"
      fillOpacity="0.92"
      stroke="none"
    />
    <path d="M9.6 11.3c.7 1.4.8 4.4.8 9.2" />
    <path d="M14.4 11.3c-.7 1.4-.8 4.4-.8 9.2" />
  </svg>
);

const EndocrinologyIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('endo');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <rect x="8.2" y="4.1" width="7.6" height="5" rx="1.2" fill="black" />
          <circle cx="12" cy="11.7" r="1.1" fill="black" />
        </mask>
      </defs>
      <path
        d="M8.6 2.2h6.8a2.7 2.7 0 0 1 2.7 2.7v4.1c0 2.5-1.3 4.6-3 5.4H8.9c-1.7-.8-3-2.9-3-5.4V4.9a2.7 2.7 0 0 1 2.7-2.7Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
      <path
        d="M12 5s1.3 1.4 1.3 2.2a1.3 1.3 0 0 1-2.6 0C10.7 6.4 12 5 12 5Z"
        fill="currentColor"
      />
      <rect x="10.7" y="14.9" width="2.6" height="2.6" rx="0.5" fill="currentColor" />
      <path
        d="M12 18.1s1.8 1.6 1.8 2.6a1.8 1.8 0 0 1-3.6 0c0-1 1.8-2.6 1.8-2.6Z"
        fill="currentColor"
      />
    </svg>
  );
};

const ScalpelIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('scalpel');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path
            d="M16.9 5.5l1.3 1.3M15.1 7.3l1.3 1.3M13.3 9.1l1.3 1.3"
            stroke="black"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <path
        d="M18.1 3.1a1.7 1.7 0 0 1 2.4 2.4l-7.9 7.9-2.4-2.4 7.9-7.9Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
      <path d="M10.4 12.1 11.7 13.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M10.5 12.7 3.2 18.2c3.5.8 6.8-.9 8.4-4.3l-1.1-1.2Z" fill="currentColor" />
      <path
        d="M10 20.4h10.8M12.4 18.7v3.4M15.4 18.7v3.4M18.4 18.7v3.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
};

const MicrobeIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('microbe');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <circle cx="10.4" cy="10.8" r="1.2" fill="black" />
          <circle cx="13.8" cy="13.4" r="1" fill="black" />
        </mask>
      </defs>
      <circle cx="12" cy="12" r="5.3" fill="currentColor" mask={`url(#${maskId})`} />
      <path
        d="M12 3.8v3.2M12 17v3.2M3.8 12H7M17 12h3.2M6.2 6.2l2.3 2.3M15.5 15.5l2.3 2.3M17.8 6.2l-2.3 2.3M8.5 15.5l-2.3 2.3"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="12" cy="3.2" r="1.2" fill="currentColor" />
      <circle cx="12" cy="20.8" r="1.2" fill="currentColor" />
      <circle cx="3.2" cy="12" r="1.2" fill="currentColor" />
      <circle cx="20.8" cy="12" r="1.2" fill="currentColor" />
      <circle cx="5.8" cy="5.8" r="1.1" fill="currentColor" />
      <circle cx="18.2" cy="18.2" r="1.1" fill="currentColor" />
      <circle cx="18.2" cy="5.8" r="1.1" fill="currentColor" />
      <circle cx="5.8" cy="18.2" r="1.1" fill="currentColor" />
    </svg>
  );
};

const SirenIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('siren');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M12 10.2v4.4M9.8 12.4h4.4" stroke="black" strokeWidth="2.1" strokeLinecap="round" />
        </mask>
      </defs>
      <path
        d="M6.4 17.4v-5.2a5.6 5.6 0 0 1 11.2 0v5.2H6.4Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
      <rect x="4" y="18.2" width="16" height="3" rx="1.2" fill="currentColor" />
      <path
        d="M12 2.4v2M5.1 5.3l1.5 1.5M18.9 5.3l-1.5 1.5M2.6 12.2h1.9M19.5 12.2h1.9"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
};

const LungsIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('lungs');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path
            d="M9.6 12.1 6.8 14.3M8.2 13.3l-.7 2.2M14.4 12.1l2.8 2.2M15.8 13.3l.7 2.2"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <path
        d="M12 3.2v7.2M12 10.2l-3 2.3M12 10.2l3 2.3"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <g fill="currentColor" mask={`url(#${maskId})`}>
        <path d="M9.7 7.4C6.8 7.4 3.4 11.2 3.2 16.3c-.1 2.4 1.2 4 3.2 4 1.9 0 3.4-1.1 3.4-3.4V9.2c0-1-.1-1.8-.1-1.8Z" />
        <path d="M14.3 7.4c2.9 0 6.3 3.8 6.5 8.9.1 2.4-1.2 4-3.2 4-1.9 0-3.4-1.1-3.4-3.4V9.2c0-1 .1-1.8.1-1.8Z" />
      </g>
    </svg>
  );
};

const GastroIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('gastro');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path
            d="M6.7 21.6v-6.5M17.3 21.6v-6.5"
            stroke="black"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          <path d="M11.6 8.5v3.6" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M11.6 12c1.1-.7 2.4-.7 3.3.2 1.2 1.2 1 3.7-.3 4.8-1.2 1-3 1.1-4.3.5-.8-.4-1.1-1.1-.7-1.8.4-.7 1.2-.8 2-.7.8.1 1.2-.5 1.1-1.3-.1-.7-.5-1.3-1.1-1.7Z"
            fill="black"
          />
          <path
            d="M10.1 16.9c-1.2.4-1.4 1.7-.4 2.4 1 .7 3 .4 4 1.1.4.3.6.8.5 1.3"
            stroke="black"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <circle cx="12" cy="4.3" r="2.3" fill="currentColor" />
      <path
        d="M3.8 21.4v-6.9c0-3.3 2.6-5.7 5.9-5.7h4.6c3.3 0 5.9 2.4 5.9 5.7v6.9H3.8Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

const HematologyIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('heme');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <circle cx="15.8" cy="15.8" r="4.6" fill="black" />
        </mask>
      </defs>
      <path
        d="M11.2 2.8S4.6 10.2 4.6 15a6.6 6.6 0 0 0 13.2 0c0-4.8-6.6-12.2-6.6-12.2Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
      <circle cx="15.8" cy="15.8" r="3" stroke="currentColor" strokeWidth="2.1" />
      <path d="m18 18 2.6 2.6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
};

const DermatologyIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('derm');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path d="M3.5 11.4h17" stroke="black" strokeWidth="1.6" />
          <path d="M3.5 15.2c2.2-1 4.2-1 6.4 0s4.2 1 6.4 0 2.6-.7 4.2-.1" stroke="black" strokeWidth="1.6" />
        </mask>
      </defs>
      <rect x="3.4" y="7.8" width="17.2" height="12.4" rx="3" fill="currentColor" mask={`url(#${maskId})`} />
      <path d="M13.5 17.5V9.2c0-2.6 1.5-4.7 3.6-5.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
};

const BoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M11.6 10 14.8 6.8C13.9 5.3 14.7 3.4 16.4 3.1c1.3-.2 2.4.7 2.5 2 1.3.1 2.2 1.2 2 2.5-.3 1.7-2.2 2.5-3.7 1.6L14 12.4l-1.7-.7.7-1L11.6 10Z"
      fill="currentColor"
    />
    <path
      d="m9.3 12.4 1.4.7-.7 1 1.7.7L8.5 18c.9 1.5.1 3.4-1.6 3.7-1.3.2-2.4-.7-2.5-2-1.3-.1-2.2-1.2-2-2.5.3-1.7 2.2-2.5 3.7-1.6l3.2-3.2Z"
      fill="currentColor"
    />
    <path
      d="M7.1 8.5 8.9 9.7M14.9 14.8l1.8 1.2"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </svg>
);

const PsychiatryIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('psych');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path
            d="M8.5 11.4c1.1-1.7 2.2-2.1 3.4-1.1 1 .9 1.6 1.9 3 1.1"
            stroke="black"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="11.8" cy="7.8" r="1.1" fill="black" />
        </mask>
      </defs>
      <path
        d="M8.4 20.8v-2.8c-2.3-1-3.8-3.4-3.8-6.2a7 7 0 0 1 13.8-1.6l1.5 2.9c.3.6-.1 1.2-.7 1.2H18v2a2 2 0 0 1-2 2h-1.4v2.5H8.4Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

const GeriatricsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 14.5s-5-3.1-5.8-6.4C5.5 5.6 7.3 3.6 9.5 3.6c1.2 0 2 .6 2.5 1.5.5-.9 1.3-1.5 2.5-1.5 2.2 0 4 2 3.3 4.5-.8 3.3-5.8 6.4-5.8 6.4Z"
      fill="currentColor"
    />
    <path
      d="M4.2 12.2v4.3l3.6 3.5v1.4M10.2 21.4v-2l-2.6-2.5"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.8 12.2v4.3l-3.6 3.5v1.4M13.8 21.4v-2l2.6-2.5"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UrologyIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('uro');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path
            d="M12 8.9c2.2 0 3.7 1.2 3.7 2.8 0 1.7-1.7 3-3.7 3.6-2-.6-3.7-1.9-3.7-3.6 0-1.6 1.5-2.8 3.7-2.8Z"
            fill="black"
          />
          <path d="M12 15v7" stroke="black" strokeWidth="1.25" strokeLinecap="round" />
        </mask>
      </defs>
      <path
        d="M6.2 3.2c0 2.7 1.8 3.9 2.3 6.7M17.8 3.2c0 2.7-1.8 3.9-2.3 6.7"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M12 6.6c3.8 0 6.4 2 6.4 4.8 0 2.7-2.2 4.5-4.3 5.3.9.5 1.1 1.9 0 2.6l-.7.3v1.8a1.4 1.4 0 0 1-2.8 0v-1.8l-.7-.3c-1.1-.7-.9-2.1 0-2.6-2.1-.8-4.3-2.6-4.3-5.3 0-2.8 2.6-4.8 6.4-4.8Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

const OncologyIcon: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useSafeMaskId('onco');
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path
            d="M12 5.4c-1.4 0-2.3 1-2.3 2.5 0 1.4 1 2.9 2.3 4.1 1.3-1.2 2.3-2.7 2.3-4.1 0-1.5-.9-2.5-2.3-2.5Z"
            fill="black"
          />
        </mask>
      </defs>
      <path
        d="M12 2.8c-3.1 0-5.1 2-5.1 5 0 2.5 1.7 5 3.6 6.8l-3.4 4.8a1.4 1.4 0 0 0 .3 1.9 1.4 1.4 0 0 0 2-.3l2.6-3.7 2.6 3.7a1.4 1.4 0 0 0 2 .3 1.4 1.4 0 0 0 .3-1.9l-3.4-4.8c1.9-1.8 3.6-4.3 3.6-6.8 0-3-2-5-5.1-5Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

export interface SpecialtyVisual {
  id: SpecialtyId;
  shortLabel: string;
  bgClass: string;
  badgeBgClass: string;
  iconClass: string;
  renderIcon: (cls: string) => React.ReactNode;
}

export const SPECIALTY_VISUALS: Record<SpecialtyId, SpecialtyVisual> = {
  'medicina-interna': {
    id: 'medicina-interna',
    shortLabel: 'Medicina Interna',
    bgClass: 'bg-sky-50/95 border-sky-200/80 dark:bg-sky-950/45 dark:border-sky-800/70',
    badgeBgClass: 'bg-sky-100/90 dark:bg-sky-950/70',
    iconClass: 'text-sky-700 dark:text-sky-300',
    renderIcon: (cls) => <StethoscopeIcon className={cls} />,
  },
  cardiologia: {
    id: 'cardiologia',
    shortLabel: 'Cardiología',
    bgClass: 'bg-rose-50/95 border-rose-200/80 dark:bg-rose-950/45 dark:border-rose-800/70',
    badgeBgClass: 'bg-rose-100/90 dark:bg-rose-950/70',
    iconClass: 'text-rose-600 dark:text-rose-300',
    renderIcon: (cls) => <CardiologyIcon className={cls} />,
  },
  pediatria: {
    id: 'pediatria',
    shortLabel: 'Pediatría',
    bgClass: 'bg-emerald-50/95 border-emerald-200/80 dark:bg-emerald-950/45 dark:border-emerald-800/70',
    badgeBgClass: 'bg-emerald-100/90 dark:bg-emerald-950/70',
    iconClass: 'text-emerald-700 dark:text-emerald-300',
    renderIcon: (cls) => <PediatricsIcon className={cls} />,
  },
  'gineco-obstetricia': {
    id: 'gineco-obstetricia',
    shortLabel: 'Ginecología y Obstetricia',
    bgClass: 'bg-purple-50/95 border-purple-200/80 dark:bg-purple-950/45 dark:border-purple-800/70',
    badgeBgClass: 'bg-purple-100/90 dark:bg-purple-950/70',
    iconClass: 'text-purple-700 dark:text-purple-300',
    renderIcon: (cls) => <ObstetricsIcon className={cls} />,
  },
  neurologia: {
    id: 'neurologia',
    shortLabel: 'Neurología',
    bgClass: 'bg-orange-50/95 border-orange-200/80 dark:bg-orange-950/45 dark:border-orange-800/70',
    badgeBgClass: 'bg-orange-100/90 dark:bg-orange-950/70',
    iconClass: 'text-orange-600 dark:text-orange-300',
    renderIcon: (cls) => <NeurologyIcon className={cls} />,
  },
  nefrologia: {
    id: 'nefrologia',
    shortLabel: 'Nefrología',
    bgClass: 'bg-cyan-50/95 border-cyan-200/80 dark:bg-cyan-950/45 dark:border-cyan-800/70',
    badgeBgClass: 'bg-cyan-100/90 dark:bg-cyan-950/70',
    iconClass: 'text-teal-700 dark:text-teal-300',
    renderIcon: (cls) => <KidneysIcon className={cls} />,
  },
  endocrinologia: {
    id: 'endocrinologia',
    shortLabel: 'Endocrinología',
    bgClass: 'bg-indigo-50/95 border-indigo-200/80 dark:bg-indigo-950/45 dark:border-indigo-800/70',
    badgeBgClass: 'bg-indigo-100/90 dark:bg-indigo-950/70',
    iconClass: 'text-indigo-700 dark:text-indigo-300',
    renderIcon: (cls) => <EndocrinologyIcon className={cls} />,
  },
  'cirugia-general': {
    id: 'cirugia-general',
    shortLabel: 'Cirugía General',
    bgClass: 'bg-blue-50/95 border-blue-200/80 dark:bg-blue-950/45 dark:border-blue-800/70',
    badgeBgClass: 'bg-blue-100/90 dark:bg-blue-950/70',
    iconClass: 'text-blue-700 dark:text-blue-300',
    renderIcon: (cls) => <ScalpelIcon className={cls} />,
  },
  infectologia: {
    id: 'infectologia',
    shortLabel: 'Infectología',
    bgClass: 'bg-lime-50/95 border-lime-200/80 dark:bg-emerald-950/45 dark:border-emerald-800/70',
    badgeBgClass: 'bg-lime-100/90 dark:bg-emerald-950/70',
    iconClass: 'text-emerald-700 dark:text-emerald-300',
    renderIcon: (cls) => <MicrobeIcon className={cls} />,
  },
  urgencias: {
    id: 'urgencias',
    shortLabel: 'Urgencias y Emergencias',
    bgClass: 'bg-red-50/95 border-red-200/80 dark:bg-red-950/45 dark:border-red-800/70',
    badgeBgClass: 'bg-red-100/90 dark:bg-red-950/70',
    iconClass: 'text-red-600 dark:text-red-300',
    renderIcon: (cls) => <SirenIcon className={cls} />,
  },
  neumologia: {
    id: 'neumologia',
    shortLabel: 'Neumología',
    bgClass: 'bg-teal-50/95 border-teal-200/80 dark:bg-teal-950/45 dark:border-teal-800/70',
    badgeBgClass: 'bg-teal-100/90 dark:bg-teal-950/70',
    iconClass: 'text-teal-700 dark:text-teal-300',
    renderIcon: (cls) => <LungsIcon className={cls} />,
  },
  gastroenterologia: {
    id: 'gastroenterologia',
    shortLabel: 'Gastroenterología',
    bgClass: 'bg-amber-50/95 border-amber-200/80 dark:bg-amber-950/45 dark:border-amber-800/70',
    badgeBgClass: 'bg-amber-100/90 dark:bg-amber-950/70',
    iconClass: 'text-amber-700 dark:text-amber-300',
    renderIcon: (cls) => <GastroIcon className={cls} />,
  },
  hematologia: {
    id: 'hematologia',
    shortLabel: 'Hematología',
    bgClass: 'bg-pink-50/95 border-pink-200/80 dark:bg-pink-950/45 dark:border-pink-800/70',
    badgeBgClass: 'bg-pink-100/90 dark:bg-pink-950/70',
    iconClass: 'text-rose-700 dark:text-rose-300',
    renderIcon: (cls) => <HematologyIcon className={cls} />,
  },
  dermatologia: {
    id: 'dermatologia',
    shortLabel: 'Dermatología y Alergología',
    bgClass: 'bg-fuchsia-50/95 border-fuchsia-200/80 dark:bg-fuchsia-950/45 dark:border-fuchsia-800/70',
    badgeBgClass: 'bg-fuchsia-100/90 dark:bg-fuchsia-950/70',
    iconClass: 'text-fuchsia-700 dark:text-fuchsia-300',
    renderIcon: (cls) => <DermatologyIcon className={cls} />,
  },
  traumatologia: {
    id: 'traumatologia',
    shortLabel: 'Traumatología',
    bgClass: 'bg-slate-100/95 border-slate-200/90 dark:bg-slate-800/75 dark:border-slate-700',
    badgeBgClass: 'bg-slate-200/80 dark:bg-slate-800',
    iconClass: 'text-slate-700 dark:text-slate-200',
    renderIcon: (cls) => <BoneIcon className={cls} />,
  },
  psiquiatria: {
    id: 'psiquiatria',
    shortLabel: 'Psiquiatría',
    bgClass: 'bg-violet-50/95 border-violet-200/80 dark:bg-violet-950/45 dark:border-violet-800/70',
    badgeBgClass: 'bg-violet-100/90 dark:bg-violet-950/70',
    iconClass: 'text-violet-700 dark:text-violet-300',
    renderIcon: (cls) => <PsychiatryIcon className={cls} />,
  },
  geriatria: {
    id: 'geriatria',
    shortLabel: 'Geriatría',
    bgClass: 'bg-yellow-50/95 border-yellow-200/80 dark:bg-yellow-950/40 dark:border-yellow-800/70',
    badgeBgClass: 'bg-yellow-100/90 dark:bg-yellow-950/70',
    iconClass: 'text-amber-800 dark:text-amber-300',
    renderIcon: (cls) => <GeriatricsIcon className={cls} />,
  },
  urologia: {
    id: 'urologia',
    shortLabel: 'Urología',
    bgClass: 'bg-sky-50/90 border-sky-200/80 dark:bg-sky-950/45 dark:border-sky-800/70',
    badgeBgClass: 'bg-sky-100/90 dark:bg-sky-950/70',
    iconClass: 'text-blue-700 dark:text-sky-300',
    renderIcon: (cls) => <UrologyIcon className={cls} />,
  },
  oncologia: {
    id: 'oncologia',
    shortLabel: 'Oncología',
    bgClass: 'bg-rose-50/95 border-pink-200/90 dark:bg-rose-950/45 dark:border-pink-800/70',
    badgeBgClass: 'bg-pink-100/90 dark:bg-pink-950/70',
    iconClass: 'text-pink-700 dark:text-pink-300',
    renderIcon: (cls) => <OncologyIcon className={cls} />,
  },
};

export const HOME_SPECIALTY_ORDER: SpecialtyId[] = [
  'medicina-interna',
  'cardiologia',
  'pediatria',
  'gineco-obstetricia',
  'oncologia',
  'neurologia',
  'nefrologia',
  'endocrinologia',
  'cirugia-general',
  'infectologia',
  'urgencias',
  'neumologia',
  'gastroenterologia',
  'hematologia',
  'dermatologia',
  'traumatologia',
  'psiquiatria',
  'geriatria',
  'urologia',
];
