import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { GymMingleProvider } from './src/context/GymMingleContext';
import MatchDeck from './src/screens/MatchDeck';
import ActiveWorkout from './src/screens/ActiveWorkout';
import SafeZone from './src/screens/SafeZone';
import ActiveDate from './src/screens/ActiveDate';

type ExperienceMode = 'LANDING' | 'WEB_DASHBOARD' | 'MOBILE_EMULATOR';

type MobileTab = 'DECK' | 'WORKOUT' | 'SAFE' | 'DATE';

type ScreenKey = 'matchDeck' | 'activeWorkout' | 'safeZone' | 'activeDate';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function Glyph({ children, tone }: { children: React.ReactNode; tone: 'teal' | 'gold' | 'red' | 'white' }) {
  const color =
    tone === 'teal'
      ? '#00F0FF'
      : tone === 'gold'
        ? '#FFB800'
        : tone === 'red'
          ? '#FF3B30'
          : '#FFFFFF';

  return (
    <Text style={{ color, fontWeight: '900', fontSize: 18, lineHeight: 18 }} accessibilityRole="image">
      {children}
    </Text>
  );
}

function CyberButton({
  label,
  onPress,
  tone,
  rightGlyph,
}: {
  label: string;
  onPress: () => void;
  tone: 'teal' | 'gold' | 'red' | 'white';
  rightGlyph?: string;
}) {
  const bg =
    tone === 'teal'
      ? 'rgba(0,240,255,0.10)'
      : tone === 'gold'
        ? 'rgba(255,184,0,0.10)'
        : tone === 'red'
          ? 'rgba(255,59,48,0.08)'
          : 'rgba(255,255,255,0.06)';

  const border =
    tone === 'teal'
      ? 'rgba(0,240,255,0.26)'
      : tone === 'gold'
        ? 'rgba(255,184,0,0.26)'
        : tone === 'red'
          ? 'rgba(255,59,48,0.22)'
          : 'rgba(255,255,255,0.14)';

  const color =
    tone === 'teal'
      ? '#00F0FF'
      : tone === 'gold'
        ? '#FFB800'
        : tone === 'red'
          ? '#FF3B30'
          : '#FFFFFF';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.cyberBtn, { backgroundColor: bg, borderColor: border }]}
    >
      <Text style={[styles.cyberBtnText, { color }]}>{label}</Text>
      {rightGlyph ? <Text style={[styles.cyberBtnArrow, { color }]}>{rightGlyph}</Text> : null}
    </TouchableOpacity>
  );
}

function ScreenHost({ screenKey }: { screenKey: ScreenKey }) {
  if (screenKey === 'matchDeck') return <MatchDeck />;
  if (screenKey === 'activeWorkout') return <ActiveWorkout />;
  if (screenKey === 'safeZone') return <SafeZone />;
  return <ActiveDate />;
}

export default function App() {
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>('LANDING');
  const [mobileTab, setMobileTab] = useState<MobileTab>('DECK');

  const [webScreen, setWebScreen] = useState<ScreenKey>('matchDeck');

  const activeScreenKey = useMemo<ScreenKey>(() => {
    if (experienceMode === 'MOBILE_EMULATOR') {
      if (mobileTab === 'DECK') return 'matchDeck';
      if (mobileTab === 'WORKOUT') return 'activeWorkout';
      if (mobileTab === 'SAFE') return 'safeZone';
      return 'activeDate';
    }
    return webScreen;
  }, [experienceMode, mobileTab, webScreen]);

  const handleEnterWeb = () => {
    setWebScreen('matchDeck');
    setExperienceMode('WEB_DASHBOARD');
  };

  const handleEnterMobile = () => {
    setMobileTab('DECK');
    setExperienceMode('MOBILE_EMULATOR');
  };

  return (
    <GymMingleProvider>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />

        {experienceMode === 'LANDING' ? (
          <ScrollView style={styles.landingScroll} contentContainerStyle={styles.landingContent}>
            <View style={styles.landingTopBar}>
              <View style={styles.brandRow}>
                <View style={styles.brandLogo}>
                  <Text style={styles.brandLogoText}>GM</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.brandName}>GymMingle</Text>
                  <Text style={styles.brandTag}>Cyber-Athletic • Match • Sync • Safety</Text>
                </View>
              </View>

              <View style={styles.modePills}>
                <View style={[styles.modePill, { borderColor: 'rgba(0,240,255,0.28)', backgroundColor: 'rgba(0,240,255,0.08)' }]}>
                  <Text style={[styles.modePillText, { color: '#00F0FF' }]}>LIVE</Text>
                </View>
                <View style={[styles.modePill, { borderColor: 'rgba(255,184,0,0.24)', backgroundColor: 'rgba(255,184,0,0.08)' }]}>
                  <Text style={[styles.modePillText, { color: '#FFB800' }]}>PREMIUM</Text>
                </View>
              </View>
            </View>

            <View style={styles.hero}>
              <Text style={styles.heroEyebrow}>Fitness matching, routine sync, and secure check-ins</Text>
              <Text style={styles.heroTitle}>Meet your partner. Train with intent.</Text>
              <Text style={styles.heroSubtitle}>
                GymMingle fuses high-fidelity matchmaking with session-level coordination and Safety Signals. Pick your experience: mobile emulation
                or full web console.
              </Text>

              <View style={styles.heroCTAs}>
                <CyberButton label="WEB CONSOLE" onPress={handleEnterWeb} tone="teal" rightGlyph="⟶" />
                <CyberButton label="MOBILE EMULATOR" onPress={handleEnterMobile} tone="gold" rightGlyph="⟶" />
              </View>
            </View>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <View style={styles.featureCardHeader}>
                  <Glyph tone="teal">▦</Glyph>
                  <Text style={styles.featureCardTitle}>MatchDeck</Text>
                </View>
                <Text style={styles.featureCardBody}>
                  Partner discovery engineered for training alignment: goals, discipline, and location timing.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureCardHeader}>
                  <Glyph tone="gold">⟠</Glyph>
                  <Text style={styles.featureCardTitle}>ActiveWorkout</Text>
                </View>
                <Text style={styles.featureCardBody}>
                  Live session control with SOS telemetry and partner synchronization.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureCardHeader}>
                  <Glyph tone="red">⛨</Glyph>
                  <Text style={styles.featureCardTitle}>SafeZone</Text>
                </View>
                <Text style={styles.featureCardBody}>
                  Check-in validation, trusted emergency contacts, and a rapid safety checklist.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureCardHeader}>
                  <Glyph tone="teal">⟡</Glyph>
                  <Text style={styles.featureCardTitle}>ActiveDate</Text>
                </View>
                <Text style={styles.featureCardBody}>
                  Routine sync with session clocks, shared checkboxes, and AI-style icebreakers.
                </Text>
              </View>
            </View>

            <View style={styles.aiRow}>
              <View style={styles.aiCard}>
                <Text style={styles.aiTitle}>AI Matchmaking Agent</Text>
                <Text style={styles.aiBody}>
                  Analyzes training style and goals to propose ideal partners so your first set feels like your best set.
                </Text>
                <View style={styles.aiStats}>
                  <View style={styles.aiStatPill}>
                    <Text style={styles.aiStatText}>Velocity-aware</Text>
                  </View>
                  <View style={styles.aiStatPill}>
                    <Text style={styles.aiStatText}>Goal aligned</Text>
                  </View>
                </View>
              </View>

              <View style={styles.aiCard}>
                <Text style={styles.aiTitle}>AI Training Agent</Text>
                <Text style={styles.aiBody}>
                  Real-time routine adjuster that adapts rep ranges and rest sets without breaking your rhythm.
                </Text>
                <View style={styles.aiStats}>
                  <View style={styles.aiStatPill}>
                    <Text style={styles.aiStatText}>Adaptive rests</Text>
                  </View>
                  <View style={styles.aiStatPill}>
                    <Text style={styles.aiStatText}>Dynamic tempo</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.unsplashFrameGrid}>
              <Text style={styles.sectionTitle}>Premium frames</Text>
              <Text style={styles.sectionSub}>High-fidelity mockups using Unsplash imagery (no local assets required).</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unsplashRow}>
                {[
                  'https://images.unsplash.com/photo-1517963879433-2d1f57f4b1de?auto=format&fit=crop&w=1200&q=80',
                  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
                  'https://images.unsplash.com/photo-1548142813-c3484387b8e7?auto=format&fit=crop&w=1200&q=80',
                  'https://images.unsplash.com/photo-1526403228316-9b62f6cdbb31?auto=format&fit=crop&w=1200&q=80',
                ].map((uri, idx) => (
                  <View key={idx} style={styles.unsplashTile}>
                    <View style={styles.unsplashTopGlow} />
                    <View style={styles.unsplashMockBar}>
                      <View style={styles.unsplashDotTeal} />
                      <View style={styles.unsplashDotGold} />
                      <View style={styles.unsplashDotWhite} />
                    </View>
                    <View style={styles.unsplashImgBox}>
                      <Text style={styles.unsplashImgOverlayText}>GymMingle</Text>
                      <Text style={styles.unsplashImgOverlaySub}>Mock frame</Text>
                      <Text style={{ position: 'absolute', bottom: 12, left: 14, right: 14, color: '#A7B1BA', fontWeight: '700', fontSize: 11 }}>
                        {idx % 2 === 0 ? 'Active + Safe' : 'Match + Sync'}
                      </Text>
                    </View>
                    <Text style={styles.unsplashTileFooter}>{idx === 0 ? 'MatchDeck' : idx === 1 ? 'ActiveWorkout' : idx === 2 ? 'SafeZone' : 'ActiveDate'}</Text>
                    <View
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 18,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Using <View> overlay for safety; RN web handles images within Image components. */}
                      <View
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'transparent',
                        }}
                      />
                    </View>
                    {/* Keep real imagery optional by loading via Image tag only if available in RN; stable for compilation. */}
                    {/* eslint-disable-next-line react-native/no-inline-styles */}
                    <View style={{ position: 'absolute', inset: 0, opacity: 0.16, backgroundColor: '#000' }} />
                    <Text style={{ position: 'absolute', top: 10, right: 12, color: '#00F0FF', fontWeight: '900', fontSize: 11 }}>
                      ⟡
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={{ height: 28 }} />
          </ScrollView>
        ) : experienceMode === 'WEB_DASHBOARD' ? (
          <View style={styles.webRoot}>
            <View style={styles.webSidebar}>
              <View style={styles.webSidebarHeader}>
                <Text style={styles.webSidebarTitle}>GymMingle Console</Text>
                <Text style={styles.webSidebarSub}>Cyber-Athletic System Signals</Text>
              </View>

              <View style={styles.webNav}>
                {(
                  [
                    { key: 'matchDeck' as const, label: 'MatchDeck', icon: '▦' },
                    { key: 'activeWorkout' as const, label: 'ActiveWorkout', icon: '⟠' },
                    { key: 'activeDate' as const, label: 'ActiveDate', icon: '⟡' },
                    { key: 'safeZone' as const, label: 'SafeZone', icon: '⛨' },
                  ]
                ).map((item) => {
                  const active = webScreen === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => setWebScreen(item.key)}
                      activeOpacity={0.9}
                      accessibilityRole="button"
                      style={[styles.webNavItem, active && styles.webNavItemActive]}
                    >
                      <Text style={[styles.webNavIcon, active && styles.webNavIconActive]}>{item.icon}</Text>
                      <Text style={[styles.webNavText, active && styles.webNavTextActive]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <CyberButton label="← HUB" tone="white" onPress={() => setExperienceMode('LANDING')} />
            </View>

            <View style={styles.webCenterStage}>
              <View style={styles.webCenterHeader}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.webCenterTitle}>Core Content Stage</Text>
                  <Text style={styles.webCenterSub}>Mouse-wheel scroll safe. No clipping. No overlaps.</Text>
                </View>
                <View style={styles.webSigPills}>
                  <View style={[styles.sigPill, { borderColor: 'rgba(0,240,255,0.26)', backgroundColor: 'rgba(0,240,255,0.08)' }]}>
                    <Text style={[styles.sigPillText, { color: '#00F0FF' }]}>PROTOCOL OK</Text>
                  </View>
                  <View style={[styles.sigPill, { borderColor: 'rgba(255,184,0,0.24)', backgroundColor: 'rgba(255,184,0,0.08)' }]}>
                    <Text style={[styles.sigPillText, { color: '#FFB800' }]}>SYNC READY</Text>
                  </View>
                </View>
              </View>

              <ScrollView
                style={styles.webScroll}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.webScrollInner}>
                  <ScreenHost screenKey={activeScreenKey} />
                </View>
              </ScrollView>
            </View>

            <View style={styles.webRightRail}>
              <Text style={styles.railTitle}>System Signals</Text>
              <View style={styles.railCard}>
                <Text style={styles.railCardTitle}>Live Safety</Text>
                <Text style={styles.railCardBody}>Check-in validation • SOS broadcast • trusted emergency routing (simulated).</Text>
                <View style={styles.railBullets}>
                  <View style={[styles.railBulletDot, { backgroundColor: '#FF3B30' }]} />
                  <Text style={styles.railBulletText}>Emergency Protocol armed</Text>
                </View>
                <View style={styles.railBullets}>
                  <View style={[styles.railBulletDot, { backgroundColor: '#00F0FF' }]} />
                  <Text style={styles.railBulletText}>Live telemetry ready</Text>
                </View>
                <View style={styles.railBullets}>
                  <View style={[styles.railBulletDot, { backgroundColor: '#FFB800' }]} />
                  <Text style={styles.railBulletText}>Partner sync stable</Text>
                </View>
              </View>

              <View style={styles.railCard}>
                <Text style={styles.railCardTitle}>Quick Jump</Text>
                <Text style={styles.railCardBody}>Switch active panels instantly without breaking scroll.</Text>

                <View style={styles.quickGrid}>
                  {(
                    [
                      { label: 'MatchDeck', key: 'matchDeck' as const, icon: '▦', tone: 'teal' as const },
                      { label: 'ActiveWorkout', key: 'activeWorkout' as const, icon: '⟠', tone: 'gold' as const },
                      { label: 'SafeZone', key: 'safeZone' as const, icon: '⛨', tone: 'red' as const },
                      { label: 'ActiveDate', key: 'activeDate' as const, icon: '⟡', tone: 'teal' as const },
                    ]
                  ).map((x) => (
                    <TouchableOpacity
                      key={x.key}
                      activeOpacity={0.9}
                      onPress={() => setWebScreen(x.key)}
                      accessibilityRole="button"
                      style={[styles.quickBtn, x.key === webScreen && styles.quickBtnActive]}
                    >
                      <Text style={[styles.quickBtnIcon, x.tone === 'teal' && { color: '#00F0FF' }, x.tone === 'gold' && { color: '#FFB800' }, x.tone === 'red' && { color: '#FF3B30' }]}>{x.icon}</Text>
                      <Text style={[styles.quickBtnText, x.key === webScreen && { color: '#FFFFFF' }]}>{x.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.mobileRoot}>
            <View style={styles.mobileTopBar}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => setExperienceMode('LANDING')} accessibilityRole="button">
                <Text style={styles.mobileExit}>← Exit Emulator</Text>
              </TouchableOpacity>
              <Text style={styles.mobileMode}>Mobile Emulator</Text>
            </View>

            <View style={styles.phoneFrame}>
              <View style={styles.phoneNotch} />
              <View style={styles.phoneScreen}>
                <ScreenHost screenKey={activeScreenKey} />
              </View>

              <View style={styles.phoneTabBar}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setMobileTab('DECK')} accessibilityRole="button" style={[styles.phoneTab, mobileTab === 'DECK' && styles.phoneTabActive]}>
                  <Text style={[styles.phoneTabText, mobileTab === 'DECK' && styles.phoneTabTextActive]}>Deck</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setMobileTab('WORKOUT')} accessibilityRole="button" style={[styles.phoneTab, mobileTab === 'WORKOUT' && styles.phoneTabActive]}>
                  <Text style={[styles.phoneTabText, mobileTab === 'WORKOUT' && styles.phoneTabTextActive]}>Lift</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setMobileTab('SAFE')} accessibilityRole="button" style={[styles.phoneTab, mobileTab === 'SAFE' && styles.phoneTabActive]}>
                  <Text style={[styles.phoneTabText, mobileTab === 'SAFE' && styles.phoneTabTextActive]}>Safe</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setMobileTab('DATE')} accessibilityRole="button" style={[styles.phoneTab, mobileTab === 'DATE' && styles.phoneTabActive]}>
                  <Text style={[styles.phoneTabText, mobileTab === 'DATE' && styles.phoneTabTextActive]}>Date</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.mobileHint}>Use the tabs to navigate. Scroll works inside each screen.</Text>
          </View>
        )}
      </View>
    </GymMingleProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1215',
  },

  landingScroll: {
    flex: 1,
  },
  landingContent: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 18,
  },

  landingTopBar: {
    width: '100%',
    maxWidth: 1180,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  brandLogo: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(0,240,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoText: {
    color: '#00F0FF',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  brandName: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  brandTag: {
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 2,
  },

  modePills: {
    flexDirection: 'row',
    gap: 10,
  },
  modePill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillText: {
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.6,
  },

  hero: {
    width: '100%',
    maxWidth: 980,
    paddingVertical: 8,
    gap: 10,
    alignItems: 'center',
  },
  heroEyebrow: {
    color: 'rgba(0,240,255,0.85)',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: SCREEN_WIDTH > 900 ? 52 : 40,
    letterSpacing: -1,
    textAlign: 'center',
    lineHeight: SCREEN_WIDTH > 900 ? 58 : 46,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.70)',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },

  heroCTAs: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  cyberBtn: undefined as never,

  cyberBtnText: undefined as never,
  cyberBtnArrow: undefined as never,

  featureGrid: {
    width: '100%',
    maxWidth: 1180,
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  featureCard: {
    width: 270,
    borderRadius: 18,
    backgroundColor: 'rgba(18,22,26,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 10,
  },
  featureCardHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  featureCardTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  featureCardBody: {
    color: 'rgba(255,255,255,0.68)',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 18,
  },

  aiRow: {
    width: '100%',
    maxWidth: 1180,
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  aiCard: {
    flex: 1,
    minWidth: 330,
    borderRadius: 18,
    backgroundColor: 'rgba(18,22,26,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 8,
  },
  aiTitle: {
    color: '#FFB800',
    fontWeight: '900',
    fontSize: 14,
  },
  aiBody: {
    color: 'rgba(255,255,255,0.70)',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 18,
  },
  aiStats: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  aiStatPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.18)',
    backgroundColor: 'rgba(0,240,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  aiStatText: {
    color: '#00F0FF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.3,
  },

  unsplashFrameGrid: {
    width: '100%',
    maxWidth: 1180,
    gap: 12,
    paddingTop: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  sectionSub: {
    color: 'rgba(255,255,255,0.70)',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 4,
  },
  unsplashRow: {
    gap: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  unsplashTile: {
    width: 260,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  unsplashTopGlow: {
    position: 'absolute',
    left: -90,
    top: -120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0,240,255,0.10)',
  },
  unsplashMockBar: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingTop: 2,
    paddingBottom: 10,
    position: 'relative',
  },
  unsplashDotTeal: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00F0FF' },
  unsplashDotGold: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFB800' },
  unsplashDotWhite: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
  unsplashImgBox: {
    height: 140,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 12,
  },
  unsplashImgOverlayText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  unsplashImgOverlaySub: {
    color: 'rgba(255,255,255,0.70)',
    fontWeight: '700',
    fontSize: 11,
    marginTop: 4,
  },
  unsplashTileFooter: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.80)',
    fontWeight: '900',
    fontSize: 12,
  },

  webRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0F1215',
  },

  webSidebar: {
    width: 292,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    backgroundColor: '#12161A',
    gap: 16,
  },

  webSidebarHeader: { gap: 4 },
  webSidebarTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: -0.2 },
  webSidebarSub: { color: 'rgba(255,255,255,0.68)', fontWeight: '700', fontSize: 12, lineHeight: 18 },

  webNav: {
    gap: 10,
  },
  webNavItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  webNavItemActive: {
    borderColor: 'rgba(0,240,255,0.26)',
    backgroundColor: 'rgba(0,240,255,0.08)',
  },
  webNavIcon: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '900',
    fontSize: 18,
  },
  webNavIconActive: {
    color: '#00F0FF',
  },
  webNavText: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '900',
    fontSize: 13,
  },
  webNavTextActive: {
    color: '#FFFFFF',
  },

  webCenterStage: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0F1215',
  },

  webCenterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 10,
  },
  webCenterTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 18 },
  webCenterSub: { color: 'rgba(255,255,255,0.68)', fontWeight: '700', fontSize: 12, marginTop: 3, lineHeight: 18 },

  webSigPills: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  sigPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  sigPillText: { fontWeight: '900', fontSize: 11, letterSpacing: 0.3 },

  webScroll: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(18,22,26,0.55)',
  },
  webScrollInner: { flex: 1, padding: 0 },

  webRightRail: {
    width: 328,
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#12161A',
    gap: 14,
  },

  railTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 0.6, textTransform: 'uppercase' },
  railCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(0,0,0,0.12)',
    padding: 14,
    gap: 8,
  },
  railCardTitle: { color: '#FFB800', fontWeight: '900', fontSize: 13 },
  railCardBody: { color: 'rgba(255,255,255,0.68)', fontWeight: '700', fontSize: 12, lineHeight: 18 },

  railBullets: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 4 },
  railBulletDot: { width: 9, height: 9, borderRadius: 6 },
  railBulletText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },

  quickGrid: { gap: 10, marginTop: 8 },
  quickBtn: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickBtnActive: {
    borderColor: 'rgba(0,240,255,0.28)',
    backgroundColor: 'rgba(0,240,255,0.10)',
  },
  quickBtnIcon: { fontWeight: '900', fontSize: 16 },
  quickBtnText: { color: 'rgba(255,255,255,0.72)', fontWeight: '900', fontSize: 12 },

  mobileRoot: {
    flex: 1,
    backgroundColor: '#0F1215',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  mobileTopBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  mobileExit: { color: '#FFB800', fontWeight: '900', fontSize: 13 },
  mobileMode: { color: 'rgba(255,255,255,0.70)', fontWeight: '800', fontSize: 12 },

  phoneFrame: {
    width: 390,
    maxWidth: '92%',
    height: 780,
    borderRadius: 44,
    borderWidth: 10,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
