import React from 'react';

type Props = {
  variant?: 'full' | 'mark';
  className?: string;
  monoColor?: boolean;
};

/** Inline SVG so the mark tracks currentColor on the ink/ivory surfaces.
 *  Matches /public/logo.svg and /public/mark.svg. */
const Logo: React.FC<Props> = ({ variant = 'full', className = '', monoColor = false }) => {
  const accent = monoColor ? 'currentColor' : '#D4542A';

  if (variant === 'mark') {
    return (
      <svg viewBox="0 0 96 96" className={className} role="img" aria-label="Serenvi">
        <rect x="0" y="0" width="96" height="96" rx="18" fill="currentColor" />
        <path
          d="M48 24c-12 7-20 18-20 30 0 11 8 20 20 20s20-9 20-20c0-12-8-23-20-30Z"
          fill="none"
          stroke="#F6F1E8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path d="M48 24v50" stroke={accent} strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="48" cy="19" r="3.6" fill={accent} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 480 120" className={className} role="img" aria-label="Serenvi">
      <g transform="translate(10 16)">
        <rect x="0" y="0" width="88" height="88" rx="14" fill="currentColor" />
        <path
          d="M44 22c-11 6-18 16-18 28 0 10 7 18 18 18 11 0 18-8 18-18 0-12-7-22-18-28Z"
          fill="none"
          stroke="#F6F1E8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M44 22v46" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <circle cx="44" cy="18" r="3.2" fill={accent} />
      </g>
      <g transform="translate(120 80)">
        <text
          x="0"
          y="0"
          fontFamily="'Fraunces','Playfair Display',Georgia,serif"
          fontWeight={500}
          fontSize={58}
          letterSpacing={6}
          fill="currentColor"
        >
          SERENVI
        </text>
        <text
          x="2"
          y="22"
          fontFamily="'Instrument Sans',sans-serif"
          fontWeight={500}
          fontSize={10}
          letterSpacing={7}
          fill="#8A8275"
        >
          MODERN · INDIAN · BAZAAR
        </text>
      </g>
    </svg>
  );
};

export default Logo;
