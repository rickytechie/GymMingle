import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGymMingle } from '../context/GymMingleContext';
import { ThemeColors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatElapsed(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

function useInterval(callback: () => void, delayMs: number | null) {
  const cbRef = useRef(callback);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => cbRef.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}

function glassShadowStyle() {
  return {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  } as const;
}

function ActiveTimerCard({ elapsedSeconds }: { elapsedSeconds: number }) {
  const display = useMemo(() => formatElapsed(elapsedSeconds), [elapsedSeconds]);

  return (
    <View style={[styles.timerCard, glassShadowStyle()]} accessibilityRole="summary">
      <View style={styles.timerTopRow}>
        <View style={styles.timerGlassPill}>
          <Text style={styles.timerPillText}>Active Timer</Text>
          <View style={styles.pulseDot} />
        </View>

        <View style={styles.timerMeta}>
          <Text style={styles.timerMetaLabel}>Luxury</Text>
          <Text style={styles.timerMetaValue}>Glass</Text>
        </View>
      </View>

      <View style={styles.timerCenter}>
        <Text style={styles.timerValueText}>{display}</Text>
      </View>

      <View style={styles.timerBottomRow}>
        <View style={styles.timerHintBar} />
        <Text style={styles.timerHintText}>Stay in sync • breathe • move</Text>
      </View>
    </View>
  );
}

export default function ActiveWorkout() {
  const { setPhase, liveTelemetryActive, emergencyBuddies, isSosActive } = useGymMingle();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startEpochRef = useRef<number | null>(null);

  useEffect(() => {
    startEpochRef.current = Date.now();
    setElapsedSeconds(0);
  }, []);

  useInterval(() => {
    const start = startEpochRef.current;
    if (!start) return;
    const diffMs = Date.now() - start;
    setElapsedSeconds(Math.floor(diffMs / 1000));
  }, 250);

  const buddyNames = useMemo(() => {
    const buddies = emergencyBuddies.filter((b) => b.isEmergencyBuddy);
    return buddies.map((b) => b.name).join(', ');
  }, [emergencyBuddies]);

  const telemetryText = liveTelemetryActive ? 'SOS Telemetry Active' : 'SOS Telemetry Paused';
  const telemetrySubtext = liveTelemetryActive
    ? `Sharing live tracking with: ${buddyNames || 'Emergency Buddies'}`
    : 'Enable live tracking to share your location and status';

  const handleEndWorkout = () => {
    setPhase('browsing');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Obsidian canvas */}
      <View style={styles.canvas}>
        <View style={styles.sheen} />
        <View style={styles.noise} />

        {/* Premium SOS telemetry status bar */}
        <View style={styles.sosBar}>
          <View style={styles.sosLeft}>
            <View
              style={[
                styles.sosStatusDot,
                liveTelemetryActive ? styles.dotActive : styles.dotInactive,
                isSosActive ? styles.dotSos : null,
              ]}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.sosTitle}>{telemetryText}</Text>
              <Text style={styles.sosSubtitle} numberOfLines={1}>
                {telemetrySubtext}
              </Text>
            </View>
          </View>

          <View style={styles.sosRight}>
            <Text style={styles.sosChip}>{liveTelemetryActive ? 'LIVE' : 'OFF'}</Text>
          </View>
        </View>

        {/* Active Timer + End Workout */}
        <View style={styles.contentWrap}>
          <ActiveTimerCard elapsedSeconds={elapsedSeconds} />

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.endWorkoutButton, glassShadowStyle()]}
            onPress={handleEndWorkout}
            accessibilityRole="button"
            accessibilityLabel="End Workout"
          >
            <View style={styles.endWorkoutInner}>
              <Text style={styles.endWorkoutLabel}>End Workout</Text>
              <Text style={styles.endWorkoutSub}>Return to browsing</Text>
            </View>

            <View style={styles.endWorkoutIconWrap}>
              <Text style={styles.endWorkoutIcon}>⟶</Text>
            </View>

            <View style={styles.endWorkoutGlow} />
          </TouchableOpacity>
        </View>

        <View style={{ height: SCREEN_WIDTH < 420 ? 12 : 24 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColors.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  canvas: {
    flex: 1,
    width: '100%',
    backgroundColor: ThemeColors.background,
    paddingHorizontal: SCREEN_WIDTH < 420 ? 16 : 28,
    paddingTop: Platform.OS === 'ios' ? 18 : 14,
    alignItems: 'center',
  },

  sheen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.05)',
    opacity: 0.9,
  },
  noise: {
    ...StyleSheet.absoluteFill,
    opacity: 0.08,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  sosBar: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: 'rgba(22,22,26,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sosLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  sosStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ThemeColors.accentGold,
    opacity: 0.95,
  },
  dotActive: {
    backgroundColor: ThemeColors.accentGold,
    shadowColor: ThemeColors.accentGold,
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dotSos: {
    backgroundColor: ThemeColors.accentRed,
    shadowColor: ThemeColors.accentRed,
  },

  sosTitle: {
    color: ThemeColors.textPrimary,
    fontWeight: '800',
    fontSize: SCREEN_WIDTH < 420 ? 13 : 14,
    letterSpacing: 0.2,
  },
  sosSubtitle: {
    color: ThemeColors.textSecondary,
    fontWeight: '500',
    fontSize: SCREEN_WIDTH < 420 ? 11 : 12,
  },
  sosRight: {
    marginLeft: 10,
  },
  sosChip: {
    color: ThemeColors.accentGold,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },

  contentWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SCREEN_WIDTH < 420 ? 18 : 26,
    gap: SCREEN_WIDTH < 420 ? 18 : 22,
  },

  timerCard: {
    width: '100%',
    backgroundColor: 'rgba(22,22,26,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
  },
  timerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timerGlassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  timerPillText: {
    color: ThemeColors.textPrimary,
    fontWeight: '800',
    fontSize: SCREEN_WIDTH < 420 ? 12 : 13,
    letterSpacing: 0.2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ThemeColors.accentGold,
  },
  timerMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  timerMetaLabel: {
    color: ThemeColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  timerMetaValue: {
    color: ThemeColors.accentGold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  timerCenter: {
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'center',
  },
  timerValueText: {
    color: ThemeColors.textPrimary,
    fontWeight: '900',
    fontSize: SCREEN_WIDTH < 420 ? 56 : 64,
    letterSpacing: -1,
  },

  timerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerHintBar: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
  },
  timerHintText: {
    color: ThemeColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },

  endWorkoutButton: {
    width: '100%',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'rgba(22,22,26,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  endWorkoutInner: {
    gap: 4,
  },
  endWorkoutLabel: {
    color: ThemeColors.accentGold,
    fontWeight: '900',
    fontSize: SCREEN_WIDTH < 420 ? 18 : 20,
    letterSpacing: 0.2,
  },
  endWorkoutSub: {
    color: ThemeColors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  endWorkoutIconWrap: {
    position: 'absolute',
    right: 14,
    top: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endWorkoutIcon: {
    color: ThemeColors.accentGold,
    fontSize: 18,
    fontWeight: '900',
  },
  endWorkoutGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    opacity: 0.9,
  },
});

