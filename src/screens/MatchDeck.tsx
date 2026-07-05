import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useGymMingle } from '../context/GymMingleContext';
import { ThemeColors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface UserProfile {
  id: string;
  name: string;
  age: number;
  gymLocation: string;
  fitnessDiscipline: string;
  interests: string[];
  isPremium: boolean;
}

const MOCK_PROFILES: UserProfile[] = [
  {
    id: '1',
    name: 'Seraphina',
    age: 27,
    gymLocation: 'Equinox Hudson Yards',
    fitnessDiscipline: 'Pilates & HIIT',
    interests: ['Electronic Music', 'Spa Recovery', 'Sci-Fi'],
    isPremium: true,
  },
  {
    id: '2',
    name: 'Dominic',
    age: 29,
    gymLocation: 'Chelsea Piers Fitness',
    fitnessDiscipline: 'Powerlifting & Mobility',
    interests: ['Trip Hop', 'Biohacking', 'Nightlife'],
    isPremium: false,
  }
];

export default function MatchDeck() {
  const { setPhase } = useGymMingle();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProfile = MOCK_PROFILES[currentIndex];

  const handleDecline = () => {
    setCurrentIndex((prev) => (prev + 1) % MOCK_PROFILES.length);
  };

  const handleAccept = () => {
    setPhase('gym_workout');
  };

  if (!currentProfile) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.card, currentProfile.isPremium && styles.premiumBorder]}>
        <View style={styles.cardHeader}>
          <Text style={styles.nameText}>
            {currentProfile.name}, <Text style={styles.ageText}>{currentProfile.age}</Text>
          </Text>
          <View style={styles.gymBadge}>
            <Text style={styles.gymText}>📍 {currentProfile.gymLocation}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.sectionTitle}>Primary Discipline</Text>
          <View style={styles.disciplinePill}>
            <Text style={styles.disciplineText}>{currentProfile.fitnessDiscipline}</Text>
          </View>

          <Text style={styles.sectionTitle}>Vibe & Interests</Text>
          <View style={styles.interestContainer}>
            {currentProfile.interests.map((interest, idx) => (
              <View key={idx} style={styles.interestPill}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {currentProfile.isPremium && (
          <View style={styles.premiumTag}>
            <Text style={styles.premiumTagText}>PREMIUM MEMBER</Text>
          </View>
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.circleButton, styles.declineButton]} onPress={handleDecline} activeOpacity={0.8}>
          <Text style={[styles.buttonIcon, { color: ThemeColors.accentRed }]}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.circleButton, styles.acceptButton]} onPress={handleAccept} activeOpacity={0.8}>
          <Text style={[styles.buttonIcon, { color: ThemeColors.accentGreen }]}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ThemeColors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: width * 0.9, height: 520, backgroundColor: ThemeColors.surface, borderRadius: 24, padding: 24, justifyContent: 'space-between', position: 'relative', overflow: 'hidden' },
  premiumBorder: { borderWidth: 2, borderColor: ThemeColors.accentGold },
  cardHeader: { marginBottom: 16 },
  nameText: { color: ThemeColors.textPrimary, fontSize: 32, fontWeight: '700' },
  ageText: { fontWeight: '300', color: ThemeColors.textPrimary },
  gymBadge: { backgroundColor: ThemeColors.surfaceElevated, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
  gymText: { color: ThemeColors.accentGold, fontSize: 14, fontWeight: '600' },
  cardBody: { flex: 1, justifyContent: 'center', marginVertical: 20 },
  sectionTitle: { color: ThemeColors.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  disciplinePill: { backgroundColor: 'rgba(52, 199, 89, 0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  disciplineText: { color: ThemeColors.textPrimary, fontSize: 16, fontWeight: '600' },
  interestContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestPill: { backgroundColor: ThemeColors.surfaceElevated, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  interestText: { color: ThemeColors.textSecondary, fontSize: 14 },
  premiumTag: { position: 'absolute', top: 24, right: 24, backgroundColor: ThemeColors.accentGold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  premiumTagText: { color: '#000000', fontSize: 10, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 40, marginTop: 40 },
  circleButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: ThemeColors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  declineButton: { backgroundColor: 'rgba(255, 59, 48, 0.03)' },
  acceptButton: { backgroundColor: 'rgba(52, 199, 89, 0.05)' },
  buttonIcon: { fontSize: 28, fontWeight: '600' },
});