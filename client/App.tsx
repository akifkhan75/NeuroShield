import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ImageBackground, ActivityIndicator, SafeAreaView } from 'react-native';
import styled from 'styled-components/native';
import { AuthScreen } from './components/auth/AuthScreen';
import { EmergencyModal } from './components/EmergencyModal';
import { FakeCallScreen } from './components/FakeCallScreen';
import { SettingsModal } from './components/settings/SettingsModal';
import { FollowMeModal } from './components/FollowMeModal';
import { CheckInModal } from './components/CheckInModal';
import { CommunitySafetyModal } from './components/CommunitySafetyModal';
import { ReportDangerZoneModal } from './components/ReportDangerZoneModal';
import { SafetyAssistantModal } from './components/SafetyAssistantModal';
import { useShakeDetector } from './hooks/useShakeDetector';
import { useVoiceActivation } from './hooks/useVoiceActivation';
import { useAccidentDetector } from './hooks/useAccidentDetector';
import { ModalType, UserSettings, PersonalInfo, DangerZone, DangerZoneType, DangerZoneSeverity } from './types';
import * as apiService from './services/apiService';
import { 
  IconSettings, 
  IconShield,
  IconWalk,
  IconTimer,
  IconFakeCall, 
  IconSOS,
  IconAlert,
  IconMic,
  IconBot
} from './constants';


const DangerZonePinContainer = styled(TouchableOpacity)<{ top: string; left: string; }>`
    position: absolute;
    top: ${props => props.top};
    left: ${props => props.left};
    width: 32px;
    height: 32px;
    border-radius: 16px;
    align-items: center;
    justify-content: center;
    transform: translate(-16px, -16px);
`;
const DangerZonePinInner = styled(View)<{ severity: DangerZoneSeverity }>`
    width: 100%;
    height: 100%;
    border-radius: 16px;
    border-width: 3px;
    align-items: center;
    justify-content: center;
    background-color: ${props => {
        if (props.severity === 'low') return 'rgba(59, 130, 246, 0.5)';
        if (props.severity === 'medium') return 'rgba(245, 158, 11, 0.5)';
        return 'rgba(239, 68, 68, 0.5)';
    }};
    border-color: ${props => {
        if (props.severity === 'low') return '#3b82f6';
        if (props.severity === 'medium') return '#f59e0b';
        return '#ef4444';
    }};
`;

const DangerZonePin: React.FC<{ zone: DangerZone }> = ({ zone }) => {
    const iconColor = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444' };
    const handleClick = () => {
        alert(`Severity: ${zone.severity.toUpperCase()}\nType: ${zone.type}\n\n${zone.description}`);
    };

    return (
        <DangerZonePinContainer 
            top={zone.location.top} 
            left={zone.location.left}
            onPress={handleClick}
            >
            <DangerZonePinInner severity={zone.severity}>
                <IconAlert size={16} color={iconColor[zone.severity]} />
            </DangerZonePinInner>
        </DangerZonePinContainer>
    );
};


const NavItem: React.FC<{icon: React.ReactNode, label: string, onPress: () => void}> = ({ icon, label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={{flex: 1, alignItems: 'center', gap: 4}}>
        <View style={{width: 28, height: 28}}>{icon}</View>
        <Text style={{fontSize: 12, fontWeight: '500', color: '#4b5563', textAlign: 'center'}}>{label}</Text>
    </TouchableOpacity>
);

const AppContainer = styled(SafeAreaView)`
    flex: 1;
    background-color: #fff;
`;
const LoadingContainer = styled(View)`
    flex: 1;
    justify-content: center;
    align-items: center;
`;
const ErrorContainer = styled(View)`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 32px;
`;
const ErrorText = styled(Text)`
    color: #ef4444;
    text-align: center;
`;
const MainContent = styled(View)`
    flex: 1;
`;
const MapViewContainer = styled(ImageBackground)`
    flex: 1;
    background-color: #e5e7eb;
`;
const Header = styled(View)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 16px;
    padding-top: 50px; /* For notch */
    z-index: 10;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
`;
const UserPinContainer = styled(View)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-32px, -32px);
`;
const UserPinPulse = styled(View)`
    position: absolute;
    width: 64px;
    height: 64px;
    border-radius: 32px;
    background-color: rgba(52, 211, 153, 0.3);
`;
const UserPinImageContainer = styled(View)`
    width: 64px;
    height: 64px;
    border-radius: 32px;
    background-color: #fbbF04;
    border-width: 4px;
    border-color: white;
    justify-content: center;
    align-items: center;
`;
const UserImage = styled(Image)`
    width: 56px;
    height: 56px;
    border-radius: 28px;
`;
const BottomNavContainer = styled(View)`
    height: 96px;
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    padding-top: 16px;
    border-top-width: 1px;
    border-top-color: #e5e7eb;
    background-color: rgba(255, 255, 255, 0.9);
`;

const SOSButtonContainer = styled(View)`
    position: relative;
    top: -40px;
`;

const SOSButton = styled(TouchableOpacity)`
    width: 80px;
    height: 80px;
    background-color: #dc2626;
    border-radius: 40px;
    justify-content: center;
    align-items: center;
    border-width: 4px;
    border-color: white;
`;
const SOSText = styled(Text)`
    color: white;
    font-size: 12px;
    font-weight: bold;
`;
const SafetyAssistantButton = styled(TouchableOpacity)`
    position: absolute;
    z-index: 20;
    bottom: 112px;
    right: 16px;
    width: 64px;
    height: 64px;
    border-radius: 32px;
    background-color: #4f46e5;
    justify-content: center;
    align-items: center;
`;


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmergencyActive, setEmergencyActive] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [settings, zones] = await Promise.all([
        apiService.getSettings(),
        apiService.getDangerZones()
      ]);
      setUserSettings(settings);
      setDangerZones(zones);
    } catch (err) {
      setError('Failed to load application data. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleActivateEmergency = useCallback(() => {
    if (!isAuthenticated || activeModal !== null || isEmergencyActive || !userSettings) return;
    setEmergencyActive(true);
  }, [isAuthenticated, activeModal, isEmergencyActive, userSettings]);
  
  const shakeEnabled = userSettings?.security.shakeToSosEnabled ?? false;
  const voiceEnabled = userSettings?.security.voiceActivationEnabled ?? false;
  const accidentEnabled = userSettings?.security.accidentDetectionEnabled ?? false;

  useShakeDetector(handleActivateEmergency, shakeEnabled && isAuthenticated);
  const { error: voiceError, isListening } = useVoiceActivation(handleActivateEmergency, voiceEnabled && isAuthenticated);
  useAccidentDetector(handleActivateEmergency, accidentEnabled && isAuthenticated);
  
  useEffect(() => {
      if (voiceError) {
          console.warn("Voice Activation Warning:", voiceError);
          alert(`Voice Activation Warning: ${voiceError}\n\nThe feature has been disabled. You can try re-enabling it in Settings > Setup Alert.`);
          if(userSettings){
            handleSaveSettings({
                ...userSettings,
                security: { ...userSettings.security, voiceActivationEnabled: false }
            });
          }
      }
  }, [voiceError, userSettings]);

  const handleDeactivateEmergency = () => setEmergencyActive(false);
  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);
  
  const handleSaveSettings = async (newSettings: UserSettings) => {
    try {
        const updatedSettings = await apiService.updateSettings(newSettings);
        setUserSettings(updatedSettings);
    } catch (err) {
        alert("Failed to save settings. Please try again.");
    }
  };

  const openModal = (modalType: ModalType) => {
    if (isEmergencyActive) return;
    setActiveModal(modalType);
  };

  const closeModal = () => setActiveModal(null);

  const handleAddDangerZone = async (details: { type: DangerZoneType; severity: DangerZoneSeverity; description: string; }) => {
    try {
        const newZone = await apiService.reportDangerZone(details);
        setDangerZones(prev => [...prev, newZone]);
        closeModal();
        setTimeout(() => {
            alert(`Thank you for your report.`);
        }, 200);
    } catch (err) {
        alert("Failed to report danger zone. Please try again.");
    }
  };
  
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (isLoading) {
      return <LoadingContainer><ActivityIndicator size="large" /></LoadingContainer>;
  }
  
  if (error || !userSettings) {
      return <ErrorContainer><ErrorText>{error || 'An unexpected error occurred.'}</ErrorText></ErrorContainer>;
  }

  return (
    <AppContainer>
        <MainContent>
            <MapViewContainer source={{ uri: 'https://i.imgur.com/5uV1f3D.png' }}>
                <Header>
                    <View>
                        <Text style={{fontSize: 20, fontWeight: '600', color: '#1f2937'}}>Hello {userSettings.personalInfo.fullName},</Text>
                        <Text style={{fontSize: 14, color: '#6b7280', marginTop: 4}}>San diago, 8453 Street, Italy</Text>
                        {isListening && <Text style={{fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 4}}><IconMic size={12} color="#16a34a" /> Voice Guard Active</Text>}
                    </View>
                    <View style={{flexDirection: 'row', gap: 8}}>
                        <TouchableOpacity onPress={() => openModal(ModalType.ReportDangerZone)} style={{padding: 8, backgroundColor: 'white', borderRadius: 9999}}><IconAlert size={24} color="#f97316" /></TouchableOpacity>
                        <TouchableOpacity onPress={() => openModal(ModalType.Settings)} style={{padding: 8, backgroundColor: 'white', borderRadius: 9999}}><IconSettings size={24} color="#4b5563" /></TouchableOpacity>
                    </View>
                </Header>
                {dangerZones.map(zone => <DangerZonePin key={zone.id} zone={zone} />)}
                <UserPinContainer>
                    <UserPinPulse />
                    <UserPinImageContainer>
                        <UserImage source={{ uri: 'https://i.imgur.com/n16shc2.png' }} />
                    </UserPinImageContainer>
                </UserPinContainer>
            </MapViewContainer>
            <BottomNavContainer>
                <NavItem icon={<IconShield size={28} color="#4b5563"/>} label="Community" onPress={() => openModal(ModalType.CommunitySafety)} />
                <NavItem icon={<IconWalk size={28} color="#4b5563"/>} label="Follow Me" onPress={() => openModal(ModalType.FollowMe)} />
                <SOSButtonContainer>
                    <SOSButton onPress={handleActivateEmergency}>
                        <IconSOS size={32} color="white"/>
                        <SOSText>SOS</SOSText>
                    </SOSButton>
                </SOSButtonContainer>
                <NavItem icon={<IconTimer size={28} color="#4b5563"/>} label="Check-In" onPress={() => openModal(ModalType.CheckIn)} />
                <NavItem icon={<IconFakeCall size={28} color="#4b5563"/>} label="Fake Call" onPress={() => openModal(ModalType.FakeCall)} />
            </BottomNavContainer>
            <SafetyAssistantButton onPress={() => openModal(ModalType.SafetyAssistant)}>
                <IconBot size={32} color="white" />
            </SafetyAssistantButton>
        </MainContent>
        {activeModal === ModalType.Settings && <SettingsModal onClose={closeModal} onLogout={handleLogout} currentSettings={userSettings} onSave={handleSaveSettings} />}
        {activeModal === ModalType.FakeCall && <FakeCallScreen onClose={closeModal} />}
        {activeModal === ModalType.FollowMe && <FollowMeModal onClose={closeModal} />}
        {activeModal === ModalType.CheckIn && <CheckInModal onClose={closeModal} onEmergency={handleActivateEmergency} />}
        {activeModal === ModalType.CommunitySafety && <CommunitySafetyModal onClose={closeModal} />}
        {activeModal === ModalType.ReportDangerZone && <ReportDangerZoneModal onClose={closeModal} onReport={handleAddDangerZone} />}
        {activeModal === ModalType.SafetyAssistant && <SafetyAssistantModal onClose={closeModal} />}
        {isEmergencyActive && <EmergencyModal onClose={handleDeactivateEmergency} settings={userSettings} />}
    </AppContainer>
  );
};

export default App;
