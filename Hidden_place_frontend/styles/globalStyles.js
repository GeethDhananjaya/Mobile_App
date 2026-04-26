// ─────────────────────────────────────────────────────────────────────────────
//  globalStyles.js  |  LUMIÈRE Design System
//  Single source of truth for: Login · Register · ResetPassword · Home
// ─────────────────────────────────────────────────────────────────────────────

import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// ─── Shared Background ───────────────────────────────────────────────────────
export const BG_IMAGE = {
  uri: 'https://i.pinimg.com/564x/e6/de/01/e6de011ecc8974e3b5d4babc8e7f3dfb.jpg',
};

// ─── Color Tokens ────────────────────────────────────────────────────────────
export const COLORS = {
  accent:        '#E8B84B',
  accentDark:    '#C9960C',
  accentGlow:    'rgba(232, 184, 75, 0.40)',
  accentSurface: 'rgba(232, 184, 75, 0.14)',
  accentBorder:  'rgba(232, 184, 75, 0.30)',

  glass1:  'rgba(255, 255, 255, 0.09)',
  glass2:  'rgba(255, 255, 255, 0.14)',
  glass3:  'rgba(255, 255, 255, 0.20)',
  border1: 'rgba(255, 255, 255, 0.14)',
  border2: 'rgba(255, 255, 255, 0.22)',
  border3: 'rgba(255, 255, 255, 0.34)',

  scrimDeep:  'rgba(6, 16, 28, 0.72)',
  scrimLight: 'rgba(6, 16, 28, 0.45)',

  // New Darker Card Background
  glassCardDark: 'rgba(10, 20, 32, 0.82)',

  white:     '#FFFFFF',
  textSoft:  'rgba(255, 255, 255, 0.72)',
  textMuted: 'rgba(255, 255, 255, 0.42)',
  textDark:  '#111827',

  error:       '#FF6B6B',
  errorSurf:   'rgba(255, 107, 107, 0.14)',
  success:     '#5EE8A0',
  successSurf: 'rgba(94, 232, 160, 0.14)',
  info:        '#60B4FF',
};

export const SCREEN = { width, height };

// ─────────────────────────────────────────────────────────────────────────────
export const globalStyles = StyleSheet.create({

  // ── Root / Background ────────────────────────────────────────────────────

  screenRoot: { flex: 1 },

  backgroundImage: { flex: 1, width: '100%', height: '100%' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.scrimDeep,
  },

  // ── Auth Layout ──────────────────────────────────────────────────────────

  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 34, // Increased padding to make the card narrower
    paddingVertical: 32,
  },

  // ── Brand ────────────────────────────────────────────────────────────────

  brandWrapper: {
    alignItems: 'center',
    marginBottom: 16, // Reduced margin
  },

  brandBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 14,
  },

  brandBadgeText: { fontSize: 28, color: COLORS.textDark },

  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },

  appTagline: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    marginTop: 5,
  },

  // ── Glass Card ───────────────────────────────────────────────────────────

  card: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border2,
    backgroundColor: COLORS.glassCardDark, // Made it darker
    paddingHorizontal: 24,
    paddingVertical: 18, // Reduced padding to make card smaller
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.40,
    shadowRadius: 48,
    elevation: 20,
  },

  // ── Typography ───────────────────────────────────────────────────────────

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: 0.4,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.textSoft,
    marginBottom: 14, // Reduced margin
    lineHeight: 19,
  },

  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  // ── Inputs ───────────────────────────────────────────────────────────────

  inputGroup: { marginBottom: 10 }, // Reduced margin

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border1,
    paddingVertical: 12, // Using padding instead of height for better touch reliability
    paddingHorizontal: 16,
    gap: 10,
    minHeight: 56, // Guaranteed minimum size
  },

  inputRowFocused: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.glass3,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },

  inputRowError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorSurf,
  },

  inputRowSuccess: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successSurf,
  },

  inputIcon: { fontSize: 16, opacity: 0.55 },

  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    letterSpacing: 0.2,
    paddingVertical: 2, // Extra vertical space for tap target
  },

  eyeBtn: { padding: 4, opacity: 0.55 },

  errorText: { fontSize: 11, color: COLORS.error, marginTop: 5, marginLeft: 2 },

  // ── Row Helpers ──────────────────────────────────────────────────────────

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border2,
    backgroundColor: COLORS.glass1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },

  checkLabel: { fontSize: 12, color: COLORS.textSoft },

  forgotText: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },

  // ── Buttons ──────────────────────────────────────────────────────────────

  button: {
    width: '100%',
    height: 54,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.52,
    shadowRadius: 22,
    elevation: 12,
  },

  buttonDisabled: { opacity: 0.6 },

  buttonText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  buttonGhost: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border2,
    backgroundColor: 'transparent',
    marginTop: 10,
  },

  buttonGhostText: { color: COLORS.textSoft, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },

  // ── Divider ──────────────────────────────────────────────────────────────

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border1 },
  dividerLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginHorizontal: 12,
  },

  // ── Social ───────────────────────────────────────────────────────────────

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 14 },

  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.glass2,
    borderWidth: 1,
    borderColor: COLORS.border1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Footer ───────────────────────────────────────────────────────────────

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 5,
  },

  footerText: { fontSize: 13, color: COLORS.textSoft },

  linkText: { fontSize: 13, color: COLORS.accent, fontWeight: '700', letterSpacing: 0.3 },

  // ── Banners ──────────────────────────────────────────────────────────────

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(96, 180, 255, 0.10)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 180, 255, 0.22)',
    padding: 12,
    marginBottom: 18,
  },

  infoBannerText: { flex: 1, fontSize: 12, color: COLORS.textSoft, lineHeight: 18 },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.successSurf,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(94, 232, 160, 0.28)',
    padding: 12,
    marginBottom: 18,
  },

  successBannerText: { flex: 1, fontSize: 12, color: COLORS.success, fontWeight: '600' },

  // ── Password Strength ────────────────────────────────────────────────────

  strengthRow: { flexDirection: 'row', gap: 4, marginTop: 8, marginBottom: 2 },

  strengthBar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: COLORS.border1 },

  strengthLabel: { fontSize: 10, marginTop: 2, marginLeft: 2, letterSpacing: 0.5 },

  // ── Progress Steps (Register) ────────────────────────────────────────────

  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    gap: 0,
  },

  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.glass2,
    borderWidth: 1.5,
    borderColor: COLORS.border2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepDotActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },

  stepDotDone: {
    backgroundColor: COLORS.successSurf,
    borderColor: COLORS.success,
  },

  stepNum: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted },

  stepNumActive: { color: COLORS.textDark },

  stepLine: { flex: 1, height: 1.5, backgroundColor: COLORS.border1, maxWidth: 32 },

  stepLineActive: { backgroundColor: COLORS.accent },

  // ── Terms Row ────────────────────────────────────────────────────────────

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18 },

  termsText: { flex: 1, fontSize: 11, color: COLORS.textMuted, lineHeight: 17 },

  termsLink: { color: COLORS.accent, fontWeight: '600' },

  // ── Home — Header ────────────────────────────────────────────────────────

  homeScrollContent: {
    paddingTop: Platform.OS === 'ios' ? 58 : 42,
    paddingBottom: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 16,
  },

  headerGreet: { fontSize: 12, color: COLORS.textMuted, letterSpacing: 0.3 },
  headerName:  { fontSize: 22, fontWeight: '800', color: COLORS.white, letterSpacing: 0.4 },

  avatarBtn: { position: 'relative' },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },

  avatarText:   { fontSize: 13, fontWeight: '800', color: COLORS.textDark },

  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: 'rgba(6, 16, 28, 0.9)',
  },

  // ── Home — Search ────────────────────────────────────────────────────────

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    marginBottom: 16,
    height: 50,
    backgroundColor: COLORS.glass1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border2,
    paddingHorizontal: 16,
    gap: 10,
  },

  searchIcon:        { fontSize: 15, opacity: 0.55 },
  searchPlaceholder: { flex: 1, fontSize: 13, color: COLORS.textMuted },

  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },

  filterIcon: { fontSize: 15, color: COLORS.textDark, fontWeight: '800' },

  // ── Home — Categories ────────────────────────────────────────────────────

  catScroll: { paddingHorizontal: 22, gap: 10, marginBottom: 20 },

  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: COLORS.glass1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border2,
  },

  catChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },

  catIcon:         { fontSize: 14 },
  catLabel:        { fontSize: 12, color: COLORS.textSoft, fontWeight: '600' },
  catLabelActive:  { color: COLORS.textDark },

  // ── Home — Section Header ────────────────────────────────────────────────

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 12,
  },

  sectionTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.white, letterSpacing: 0.3 },
  sectionAction: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },

  // ── Home — Featured Cards ────────────────────────────────────────────────

  featScroll:   { paddingLeft: 22, paddingRight: 12, gap: 14, marginBottom: 24 },

  featCard: {
    height: 210,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.40,
    shadowRadius: 24,
    elevation: 14,
  },

  featImg:      { flex: 1, justifyContent: 'space-between', padding: 14 },
  featImgStyle: { borderRadius: 22 },

  featOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: 22,
  },

  featTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border2,
  },

  featTagText:   { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  featBottom:    { gap: 3 },
  featTitle:     { fontSize: 15, fontWeight: '800', color: COLORS.white },
  featLocation:  { fontSize: 11, color: 'rgba(255,255,255,0.68)' },

  featMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  featDist:       { fontSize: 11, color: 'rgba(255,255,255,0.50)' },
  featRating:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  featStar:       { fontSize: 12, color: COLORS.accent },
  featRatingText: { fontSize: 12, color: COLORS.white, fontWeight: '700' },

  // ── Home — Nearby List ───────────────────────────────────────────────────

  nearbyList: { paddingHorizontal: 22, gap: 10 },

  nearbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.glass1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border1,
    padding: 14,
  },

  nearbyIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.accentSurface,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },

  nearbyIcon:   { fontSize: 22 },
  nearbyInfo:   { flex: 1, gap: 3 },
  nearbyTitle:  { fontSize: 13, fontWeight: '700', color: COLORS.white },
  nearbyLoc:    { fontSize: 11, color: COLORS.textMuted },
  nearbyRight:  { alignItems: 'flex-end', gap: 4 },
  nearbyRating: { fontSize: 12, color: COLORS.accent, fontWeight: '700' },
  nearbyDur:    { fontSize: 11, color: COLORS.textMuted },

  // ── Bottom Navigation ────────────────────────────────────────────────────

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 18, 32, 0.92)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
  },

  navTab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative' },

  navIcon:        { fontSize: 20, color: COLORS.textMuted },
  navIconActive:  { color: COLORS.accent },
  navLabel:       { fontSize: 9, color: COLORS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
  navLabelActive: { color: COLORS.accent, fontWeight: '700' },

  navIndicator: {
    position: 'absolute',
    top: -10,
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
