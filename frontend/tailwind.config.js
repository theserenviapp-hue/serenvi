/** Serenvi design tokens — see BRANDING.md for the source of truth. */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        ivory:   '#F6F1E8',
        paper:   '#FFFFFF',
        stone:   '#E9E1D3',
        sand:    '#EFE7D6',
        // Text
        ink:     '#0E0D0B',
        soot:    '#1C1A16',
        ash:     '#8A8275',
        mist:    '#BDB3A0',
        // Accents
        saffron: '#D4542A',
        ember:   '#B8431C',
        ochre:   '#C08A2E',
        moss:    '#3E5240',
        rose:    '#C24B5B',
        // Legacy names kept so pre-existing pages don't break
        primary:   '#D4542A',
        secondary: '#3E5240',
        accent:    '#C08A2E',
      },
      fontFamily: {
        display: ['"Fraunces"', '"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"Instrument Sans"', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        eyebrow:  '0.18em',
      },
      fontSize: {
        'eyebrow':    ['0.72rem', { lineHeight: '1', letterSpacing: '0.18em' }],
        'display-sm': ['2.1rem',  { lineHeight: '1.05' }],
        'display':    ['3.2rem',  { lineHeight: '1.02' }],
        'display-lg': ['4.6rem',  { lineHeight: '0.98' }],
        'display-xl': ['6.4rem',  { lineHeight: '0.96' }],
      },
      boxShadow: {
        'card':  '0 1px 0 rgba(14,13,11,0.04), 0 10px 28px -18px rgba(14,13,11,0.18)',
        'lift':  '0 2px 0 rgba(14,13,11,0.05), 0 22px 40px -24px rgba(14,13,11,0.28)',
        'inset-rule': 'inset 0 -1px 0 rgba(14,13,11,0.08)',
      },
      borderRadius: { 'pebble': '14px' },
      keyframes: {
        fadeUp:  { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-up':  'fadeUp .5s cubic-bezier(.2,.7,.2,1) both',
        'shimmer':  'shimmer 1.6s linear infinite',
        'marquee':  'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};
