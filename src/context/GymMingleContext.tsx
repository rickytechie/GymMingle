import React, { createContext, useContext, useState, ReactNode } from 'react';

export type DatePhase = 'browsing' | 'gym_workout' | 'mutual_match_prompt' | 'continuation' | 'completed';

interface SafetyContact {
  id: string;
  name: string;
  phone: string;
  isEmergencyBuddy: boolean;
}

interface GymMingleContextType {
  currentPhase: DatePhase;
  setPhase: (phase: DatePhase) => void;
  isSosActive: boolean;
  triggerSos: () => void;
  cancelSos: () => void;
  liveTelemetryActive: boolean;
  setLiveTelemetry: (active: boolean) => void;
  emergencyBuddies: SafetyContact[];
}

const GymMingleContext = createContext<GymMingleContextType | undefined>(undefined);

export function GymMingleProvider({ children }: { children: ReactNode }) {
  const [currentPhase, setPhase] = useState<DatePhase>('browsing');
  const [isSosActive, setIsSosActive] = useState(false);
  const [liveTelemetryActive, setLiveTelemetry] = useState(true);
  const [emergencyBuddies] = useState<SafetyContact[]>([
    { id: '1', name: 'Marcus', phone: '+15550199', isEmergencyBuddy: true },
    { id: '2', name: 'Elena', phone: '+15550142', isEmergencyBuddy: true }
  ]);

  const triggerSos = () => { setIsSosActive(true); };
  const cancelSos = () => { setIsSosActive(false); };

  return (
    <GymMingleContext.Provider value={{
      currentPhase, setPhase, isSosActive, triggerSos, cancelSos, liveTelemetryActive, setLiveTelemetry, emergencyBuddies
    }}>
      {children}
    </GymMingleContext.Provider>
  );
}

export function useGymMingle() {
  const context = useContext(GymMingleContext);
  if (!context) throw new Error('useGymMingle must be wrapped inside a global GymMingleProvider');
  return context;
}