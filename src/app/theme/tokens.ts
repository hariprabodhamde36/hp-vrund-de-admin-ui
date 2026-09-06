/**
 * The single place to change how this app looks.
 *
 * Colours, font and corner radius all come from here — nothing else in the
 * codebase hardcodes a colour or a font family. Change a value, reload, done.
 */
export const tokens = {
  color: {
    /** Brand colour. Buttons, links, the active nav item, focus rings. */
    primary: '#F97316',
    primaryHover: '#EA580C',
    /** Used for the few accents that should not compete with the brand colour. */
    secondary: '#0F172A',

    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',

    /** Page background — a warm off-white that sits well under orange. */
    background: '#FAF9F7',
    /** Cards, the app bar, the sidebar. */
    surface: '#FFFFFF',

    textPrimary: '#1C1917',
    textSecondary: '#78716C',
    divider: 'rgba(28, 25, 23, 0.12)',
  },

  font: {
    /** Loaded in index.html. Change both if you swap the family. */
    family: '"Inter", "Helvetica", "Arial", sans-serif',
    baseSize: 14,
    weightRegular: 400,
    weightMedium: 500,
    weightBold: 700,
  },

  /** Corner radius, in px, for buttons, cards, inputs and nav items. */
  radius: 10,
} as const
