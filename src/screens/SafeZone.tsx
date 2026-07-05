import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGymMingle } from '../context/GymMingleContext';
import { ThemeColors } from '../theme/colors';

type ChecklistId = 'checkIn' | 'shareLocation' | 'buddyCode' | 'hydration' | 'knowExits' | 'consent';

type ChecklistItem = {
  id: ChecklistId;
  label: string;
  detail: string;
};

type ToastTone = 'gold' | 'red' | 'teal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatElapsed(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function IconGlyph({ glyph, color, size }: { glyph: string; color: string; size: number }) {
  return (
    <Text style={{ color, fontSize: size, lineHeight: size, textAlign: 'center' }} accessibilityRole="image">
      {glyph}
    </Text>
  );
}

function SafetyPill({ label, value, tone }: { label: string; value: string; tone: ToastTone }) {
  const map = {
    gold: {
      borderColor: 'rgba(255,184,0,0.32)',
      backgroundColor: 'rgba(255,184,0,0.10)',
      textColor: '#FFB800',
    },
    red: {
      borderColor: 'rgba(255,59,48,0.40)',
      backgroundColor: 'rgba(255,59,48,0.12)',
      textColor: ThemeColors.accentRed,
    },
    teal: {
      borderColor: 'rgba(0,240,255,0.35)',
      backgroundColor: 'rgba(0,240,255,0.10)',
      textColor: '#00F0FF',
    },
  } as const;

  const toneStyle = map[tone];

  return (
    <View style={[styles.pill, { borderColor: toneStyle.borderColor, backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={[styles.pillValue, { color: toneStyle.textColor }]}>{value}</Text>
    </View>
  );
}

function ContactCard({ name, phone, isEmergencyBuddy }: { name: string; phone: string; isEmergencyBuddy: boolean }) {
  return (
    <View
      style={[
        styles.contactCard,
        isEmergencyBuddy
          ? { borderColor: 'rgba(255,59,48,0.22)', backgroundColor: 'rgba(255,59,48,0.06)' }
          : { borderColor: 'rgba(255,184,0,0.20)', backgroundColor: 'rgba(255,184,0,0.04)' },
      ]}
    >
      <View style={styles.contactLeft}>
        <View
          style={[
            styles.avatar,
            isEmergencyBuddy ? { borderColor: 'rgba(255,59,48,0.38)', backgroundColor: 'rgba(255,59,48,0.12)' } : null,
          ]}
        >
          <Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.contactName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.contactPhone} numberOfLines={1}>
            {phone}
          </Text>
        </View>
      </View>

      <View style={styles.contactActions}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.contactBtn, isEmergencyBuddy ? styles.contactBtnRed : styles.contactBtnGold]}
          accessibilityRole="button"
          accessibilityLabel={`Message ${name}`}
          onPress={() => {}}
        >
          <Text style={styles.contactBtnText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.contactBtn, isEmergencyBuddy ? styles.contactBtnRedSoft : styles.contactBtnGoldSoft]}
          accessibilityRole="button"
          accessibilityLabel={`Call ${name}`}
          onPress={() => {}}
        >
          <Text style={styles.contactBtnText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ChecklistRow({ item, done, onToggle }: { item: ChecklistItem; done: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onToggle}
      style={[styles.checkRow, done && { borderColor: 'rgba(52,199,89,0.22)', backgroundColor: 'rgba(52,199,89,0.06)' }]}
      accessibilityRole="button"
      accessibilityLabel={`Toggle ${item.label}`}
    >
      <View style={[styles.checkBox, done && { borderColor: 'rgba(52,199,89,0.35)', backgroundColor: 'rgba(52,199,89,0.12)' }]}>
        <Text style={[styles.checkMark, done && { color: ThemeColors.textPrimary }]}>{done ? '✓' : ' '}</Text>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.checkLabel, done && { color: '#34C759' }]} numberOfLines={2}>
          {item.label}
        </Text>
        <Text style={styles.checkDetail} numberOfLines={2}>
          {item.detail}
        </Text>
      </View>

      <View style={[styles.checkPill, done ? { borderColor: 'rgba(52,199,89,0.28)', backgroundColor: 'rgba(52,199,89,0.10)' } : null]}>
        <Text style={[styles.checkPillText, done ? { color: '#34C759' } : null]}>{done ? 'DONE' : 'TAP'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SafeZone() {
  const { triggerSos, cancelSos, isSosActive, emergencyBuddies } = useGymMingle();

  const [checkInEpoch, setCheckInEpoch] = useState<number>(() => Date.now());
  const elapsedSeconds = useMemo(() => Math.floor((Date.now() - checkInEpoch) / 1000), [checkInEpoch]);

  const [isCheckInValid, setIsCheckInValid] = useState(true);
  const [securityProtocolArmed, setSecurityProtocolArmed] = useState(true);
  const [checkInSecurityScore, setCheckInSecurityScore] = useState(98);
  const [scanInProgress, setScanInProgress] = useState(false);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [checklist, setChecklist] = useState<Record<ChecklistId, boolean>>({
    checkIn: true,
    shareLocation: false,
    buddyCode: false,
    hydration: false,
    knowExits: false,
    consent: false,
  });

  const checklistItems: ChecklistItem[] = useMemo(
    () => [
      { id: 'checkIn', label: 'Confirm check-in (live)', detail: 'Keep your check-in active while meeting in the gym.' },
      { id: 'shareLocation', label: 'Share location safely', detail: 'Only with trusted partners and emergency buddies.' },
      { id: 'buddyCode', label: 'Use your Buddy Code', detail: 'Verify identity before any off-plan meet or ride-share.' },
      { id: 'hydration', label: 'Hydrate & stay present', detail: 'Safety is training—take breaks and listen to your body.' },
      { id: 'knowExits', label: 'Know exits & security desk', detail: 'Locate nearest exits and check-in/support desk entry.' },
      { id: 'consent', label: 'Consent first, always', detail: 'Respect personal boundaries and opt out instantly.' },
    ],
    []
  );

  const doneCount = useMemo(() => checklistItems.reduce((acc, it) => acc + (checklist[it.id] ? 1 : 0), 0), [checklist, checklistItems]);

  useEffect(() => {
    const minutes = elapsedSeconds / 60;
    const valid = minutes <= 45;
    setIsCheckInValid(valid);

    const scoreBase = 98;
    const scoreDrop =
      minutes <= 45
        ? 0
        : minutes <= 60
          ? Math.round((minutes - 45) * 2.4)
          : Math.round((minutes - 60) * 5.5);

    const armedPenalty = securityProtocolArmed ? 0 : 8;
    const newScore = clamp(scoreBase - scoreDrop - armedPenalty, 0, 100);
    setCheckInSecurityScore(newScore);
  }, [elapsedSeconds, securityProtocolArmed]);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, []);

  const handleRestartCheckIn = () => {
    setCheckInEpoch(Date.now());
    setIsCheckInValid(true);
    setSecurityProtocolArmed(true);
    setCheckInSecurityScore(98);
    setScanInProgress(false);
  };

  const handleScan = () => {
    if (scanInProgress) return;
    setScanInProgress(true);

    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    scanTimerRef.current = setTimeout(() => {
      const penalty = Math.random() < 0.25 ? 7 : 0;
      setCheckInSecurityScore((prev) => clamp(prev - penalty, 0, 100));
      setSecurityProtocolArmed(true);
      setScanInProgress(false);
    }, 1400);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>GM</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.title}>SafeZone</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {isCheckInValid ? 'Check-in is valid' : 'Check-in is expiring soon'} • Security Score{' '}
                <Text style={{ color: '#FFB800', fontWeight: '900' }}>{checkInSecurityScore}</Text>/100
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <SafetyPill label="Protocol" value={securityProtocolArmed ? 'ARMED' : 'STANDBY'} tone={securityProtocolArmed ? 'gold' : 'red'} />
          </View>
        </View>

        <View style={styles.sosSection}>
          <View style={styles.sectionRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.sectionTitle}>Emergency Broadcast</Text>
              <Text style={styles.sectionSub} numberOfLines={2}>
                {isSosActive
                  ? 'Broadcasting emergency support to trusted buddies.'
                  : 'Press to instantly alert your trusted emergency contacts.'}
              </Text>
            </View>

            <View style={styles.signalWrap}>
              <View style={[styles.signalDot, isSosActive ? styles.signalOn : styles.signalOff]} />
              <Text style={styles.signalText}>{isSosActive ? 'LIVE' : 'READY'}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            style={[styles.sosButton, isSosActive ? styles.sosButtonActive : styles.sosButtonIdle]}
            onPress={() => {
              if (isSosActive) cancelSos();
              else triggerSos();
            }}
            accessibilityRole="button"
            accessibilityLabel="Emergency SOS"
          >
            <View style={styles.sosButtonInner}>
              <View style={styles.sosIconWrap}>
                <IconGlyph glyph={isSosActive ? '!' : '⛨'} color={isSosActive ? ThemeColors.textPrimary : '#FFB800'} size={22} />
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.sosButtonTitle}>{isSosActive ? 'SOS ACTIVE' : 'SOS / EMERGENCY ALERT'}</Text>
                <Text style={styles.sosButtonSub} numberOfLines={2}>
                  {isSosActive ? 'Tap to cancel broadcast (simulated).' : 'Alerts up to 2 emergency buddies instantly (simulated).'}
                </Text>
              </View>

              <View style={styles.sosChevron}>
                <Text style={styles.sosChevronText}>{isSosActive ? '⟲' : '⟶'}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.checkInRow}>
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>Live Check-In Validation</Text>

              <View style={styles.timerValueRow}>
                <Text style={[styles.timerValue, !isCheckInValid && styles.timerValueWarn]}>{formatElapsed(elapsedSeconds)}</Text>
                <Text style={[styles.timerPill, isCheckInValid ? styles.timerPillOk : styles.timerPillWarn]}>
                  {isCheckInValid ? 'VALID' : 'EXPIRE'}
                </Text>
              </View>

              <View style={styles.timerProgressBar}>
                <View
                  style={[
                    styles.timerProgressFill,
                    {
                      width: `${clamp((elapsedSeconds / 3600) * 100, 0, 100)}%`,
                      backgroundColor: isCheckInValid ? 'rgba(255,184,0,0.90)' : 'rgba(255,59,48,0.90)',
                    },
                  ]}
                />
              </View>

              <View style={styles.timerActions}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleRestartCheckIn}
                  style={styles.secondaryBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Restart Check-In"
                >
                  <Text style={styles.secondaryBtnText}>Restart Check-In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleScan}
                  style={[styles.secondaryBtn, styles.scanBtn]}
                  accessibilityRole="button"
                  accessibilityLabel="Scan for security risks"
                >
                  <Text style={[styles.secondaryBtnText, scanInProgress ? { opacity: 0.86 } : null]}>{scanInProgress ? 'Scanning…' : 'Run Security Scan'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buddyPanel}>
              <Text style={styles.buddyTitle}>Trusted Emergency Contacts</Text>
              <Text style={styles.buddySub}>Simulated database sync • ready in under 1s</Text>

              <View style={styles.contactsStack}>
                {emergencyBuddies.map((b) => (
                  <ContactCard key={b.id} name={b.name} phone={b.phone} isEmergencyBuddy={b.isEmergencyBuddy} />
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.guidesSection}>
          <View style={styles.guidesHeader}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.guidesTitle}>Safety Guide • Quick Checklist</Text>
              <Text style={styles.guidesSub}>
                Progress: <Text style={{ color: '#FFB800', fontWeight: '900' }}>{doneCount}</Text>/{checklistItems.length} completed
              </Text>
            </View>

            <View style={styles.guidesProgressPill}>
              <Text style={styles.guidesProgressPillText}>{Math.round((doneCount / checklistItems.length) * 100)}%</Text>
            </View>
          </View>

          <View style={styles.checklist}>
            {checklistItems.map((item) => (
              <ChecklistRow
                key={item.id}
                item={item}
                done={checklist[item.id]}
                onToggle={() => setChecklist((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  brandMark: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  brandMarkText: { color: '#FFB800', fontWeight: '800', fontSize: 16 },
  title: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#8E8E93', fontSize: 13, marginTop: 2 },
  headerRight: { marginLeft: 16 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  pillLabel: { color: '#8E8E93', fontSize: 10, fontWeight: '600' },
  pillValue: { fontSize: 12, fontWeight: '800', marginTop: 1 },
  sosSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  sectionSub: { color: '#8E8E93', fontSize: 13, marginTop: 4 },
  signalWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  signalDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  signalOn: { backgroundColor: '#FF3B30' },
  signalOff: { backgroundColor: '#34C759' },
  signalText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  sosButton: { padding: 20, borderRadius: 24, borderWidth: 1 },
  sosButtonIdle: { backgroundColor: '#1C1C1E', borderColor: '#333' },
  sosButtonActive: { backgroundColor: 'rgba(255,59,48,0.15)', borderColor: '#FF3B30' },
  sosButtonInner: { flexDirection: 'row', alignItems: 'center' },
  sosIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  sosButtonTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  sosButtonSub: { color: '#8E8E93', fontSize: 12, marginTop: 4 },
  sosChevron: { marginLeft: 16 },
  sosChevronText: { color: '#8E8E93', fontSize: 20 },
  checkInRow: { marginTop: 24 },
  timerCard: { backgroundColor: '#1C1C1E', padding: 20, borderRadius: 24, marginBottom: 20 },
  timerLabel: { color: '#8E8E93', fontSize: 12, fontWeight: '600' },
  timerValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  timerValue: { color: '#FFF', fontSize: 32, fontWeight: '700' },
  timerValueWarn: { color: '#FF3B30' },
  timerPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, fontWeight: '800' },
  timerPillOk: { backgroundColor: 'rgba(52,199,89,0.2)', color: '#34C759' },
  timerPillWarn: { backgroundColor: 'rgba(255,59,48,0.2)', color: '#FF3B30' },
  timerProgressBar: { height: 4, backgroundColor: '#333', borderRadius: 2, marginTop: 16 },
  timerProgressFill: { height: '100%', borderRadius: 2 },
  timerActions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  secondaryBtn: { flex: 1, backgroundColor: '#000', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  secondaryBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  scanBtn: { borderColor: '#FFB800' },
  buddyPanel: { backgroundColor: '#1C1C1E', padding: 20, borderRadius: 24 },
  buddyTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  buddySub: { color: '#8E8E93', fontSize: 12, marginTop: 4 },
  contactsStack: { marginTop: 16, gap: 12 },
  contactCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1 },
  contactLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1 },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  contactName: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  contactPhone: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  contactActions: { flexDirection: 'row', gap: 8 },
  contactBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  contactBtnGold: { backgroundColor: '#FFB800' },
  contactBtnRed: { backgroundColor: '#FF3B30' },
  contactBtnGoldSoft: { backgroundColor: 'rgba(255,184,0,0.15)' },
  contactBtnRedSoft: { backgroundColor: 'rgba(255,59,48,0.15)' },
  contactBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  guidesSection: { paddingHorizontal: 20 },
  guidesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  guidesTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  guidesSub: { color: '#8E8E93', fontSize: 13, marginTop: 4 },
  guidesProgressPill: { backgroundColor: '#1C1C1E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  guidesProgressPillText: { color: '#FFB800', fontWeight: '800', fontSize: 12 },
  checklist: { gap: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  checkBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#333', marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  checkMark: { fontSize: 14, fontWeight: '800' },
  checkLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  checkDetail: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  checkPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#333' },
  checkPillText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
});