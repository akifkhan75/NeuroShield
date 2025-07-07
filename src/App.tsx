
// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import { View, Text, ActivityIndicator, Image, TouchableOpacity, ImageBackground, Alert, Animated, Easing } from 'react-native';
// import styled from 'styled-components/native';
// import Icon from 'react-native-vector-icons/Feather';
// import { Navigation, OptionsModalPresentationStyle } from 'react-native-navigation';
// import { useShakeDetector } from './hooks/useShakeDetector';
// import { useVoiceActivation } from './hooks/useVoiceActivation';
// import { useAccidentDetector } from './hooks/useAccidentDetector';
// import { UserSettings, DangerZone, DangerZoneType, DangerZoneSeverity } from './types';
// import * as apiService from './services/apiService';

// // --- Styled Components --- //
// const Container = styled(View)`
//   flex: 1;
//   background-color: #ffffff;
// `;

// const MapViewContainer = styled(View)`
//   flex: 1;
//   background-color: #e5e7eb;
// `;

// const MapImage = styled(ImageBackground)`
//     width: 100%;
//     height: 100%;
// `;

// const Header = styled(View)`
//     position: absolute;
//     top: 40px;
//     left: 16px;
//     right: 16px;
//     flex-direction: row;
//     justify-content: space-between;
//     align-items: flex-start;
//     z-index: 10;
// `;

// const HeaderTextContainer = styled(View)`
//     flex: 1;
// `;

// const HelloText = styled(Text)`
//     font-size: 20px;
//     font-weight: 600;
//     color: #1f2937;
// `;

// const LocationText = styled(Text)`
//     font-size: 14px;
//     color: #6b7280;
//     margin-top: 4px;
// `;

// const VoiceGuardText = styled(Text)`
//     font-size: 12px;
//     color: #16a34a;
//     font-weight: 600;
//     margin-top: 4px;
// `;

// const HeaderActions = styled(View)`
//     flex-direction: row;
// `;

// const ActionButton = styled(TouchableOpacity)`
//     background-color: white;
//     padding: 8px;
//     border-radius: 9999px;
//     margin-left: 8px;
//     shadow-color: #000;
//     shadow-offset: 0px 2px;
//     shadow-opacity: 0.25;
//     shadow-radius: 3.84px;
//     elevation: 5;
// `;

// const UserLocationPinContainer = styled(View)`
//     position: absolute;
//     top: 50%;
//     left: 50%;
//     transform: translate(-28px, -28px);
// `;

// const UserImage = styled(Image)`
//     width: 56px;
//     height: 56px;
//     border-radius: 28px;
//     border-width: 4px;
//     border-color: white;
// `;

// const BottomNavContainer = styled(View)`
//     height: 96px;
//     background-color: rgba(255, 255, 255, 0.9);
//     flex-direction: row;
//     justify-content: space-around;
//     align-items: flex-start;
//     padding-top: 16px;
//     border-top-width: 1px;
//     border-top-color: #e5e7eb;
// `;

// const NavItemContainer = styled(TouchableOpacity)`
//     align-items: center;
//     width: 64px;
// `;

// const NavItemLabel = styled(Text)`
//     font-size: 12px;
//     font-weight: 500;
//     color: #4b5563;
//     text-align: center;
//     margin-top: 2px;
// `;

// const SOSButtonContainer = styled(View)`
//     position: relative;
//     top: -40px;
// `;

// const SOSButton = styled(TouchableOpacity)`
//     width: 80px;
//     height: 80px;
//     background-color: #dc2626;
//     border-radius: 40px;
//     justify-content: center;
//     align-items: center;
//     shadow-color: #000;
//     shadow-offset: 0px 4px;
//     shadow-opacity: 0.30;
//     shadow-radius: 4.65px;
//     elevation: 8;
//     border-width: 4px;
//     border-color: white;
// `;

// const SOSText = styled(Text)`
//     font-size: 12px;
//     font-weight: bold;
//     color: white;
// `;

// const SafetyAssistantButton = styled(TouchableOpacity)`
//     position: absolute;
//     bottom: 112px; /* Above BottomNav */
//     right: 16px;
//     width: 64px;
//     height: 64px;
//     border-radius: 32px;
//     background-color: #4f46e5; /* indigo-600 */
//     justify-content: center;
//     align-items: center;
//     shadow-color: #000;
//     shadow-offset: 0px 4px;
//     shadow-opacity: 0.30;
//     shadow-radius: 4.65px;
//     elevation: 8;
//     z-index: 20;
// `;

// const DangerZonePinContainer = styled(TouchableOpacity)`
//     position: absolute;
//     width: 32px;
//     height: 32px;
//     align-items: center;
//     justify-content: center;
// `;

// const PinCircle = styled(View)<{ color: string }>`
//     width: 24px;
//     height: 24px;
//     border-radius: 12px;
//     background-color: ${props => props.color}33;
//     border-color: ${props => props.color};
//     border-width: 2px;
//     align-items: center;
//     justify-content: center;
// `;

// const PinPulseCircle = styled(Animated.View)<{ color: string }>`
//     position: absolute;
//     width: 24px;
//     height: 24px;
//     border-radius: 12px;
//     background-color: ${props => props.color}99;
// `;

// // --- Components --- //

// const DangerZonePin = ({ zone }: { zone: DangerZone }) => {
//   const severityColors = {
//       low: '#3b82f6', // blue-500
//       medium: '#f59e0b', // amber-500
//       high: '#ef4444', // red-500
//   };
//   const color = severityColors[zone.severity];
//   const pulseAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.timing(pulseAnim, {
//         toValue: 1,
//         duration: 1500,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       })
//     ).start();
//   }, [pulseAnim]);

//   const pulseStyle = {
//     transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.5] }) }],
//     opacity: pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.7, 0] }),
//   };

//   return (
//     <DangerZonePinContainer
//         style={{ top: zone.location.top as any, left: zone.location.left as any, transform: [{translateX: -16}, {translateY: -16}] }}
//         onPress={() => Alert.alert(`Severity: ${zone.severity.toUpperCase()}`, `${zone.type}: ${zone.description}`)}
//     >
//       <PinPulseCircle color={color} style={pulseStyle} />
//       <PinCircle color={color}>
//         <Icon name="alert-triangle" size={14} color={color} />
//       </PinCircle>
//     </DangerZonePinContainer>
//   );
// };


// const App = (props: { componentId: string }) => {
//   const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
//   const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const openModal = (name: string, passProps = {}) => {
//     Navigation.showModal({
//         stack: { children: [{ component: { name, passProps, options: { topBar: { visible: false } } } }] }
//     });
//   };

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const [settings, zones] = await Promise.all([
//         apiService.getSettings(),
//         apiService.getDangerZones()
//       ]);
//       setUserSettings(settings);
//       setDangerZones(zones);
//     } catch (err) {
//       setError('Failed to load application data. Please try again later.');
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleActivateEmergency = useCallback(() => {
//     if (!userSettings) return;
//     console.log("SOS Activated!");
//     openModal('Emergency', { settings: userSettings });
//   }, [userSettings]);

//   const handleLogout = () => {
//     Navigation.setRoot({
//         root: { stack: { children: [{ component: { name: 'Auth', options: { topBar: { visible: false } } } }] } }
//     });
//   };

//   const handleSaveSettings = async (newSettings: UserSettings) => {
//     try {
//         const updatedSettings = await apiService.updateSettings(newSettings);
//         setUserSettings(updatedSettings);
//     } catch (err) {
//         Alert.alert("Error", "Failed to save settings. Please try again.");
//         console.error(err);
//     }
//   };

//   const handleAddDangerZone = async (details: { type: DangerZoneType; severity: DangerZoneSeverity; description: string; }) => {
//     try {
//         const newZone = await apiService.reportDangerZone(details);
//         setDangerZones(prev => [...prev, newZone]);
//         Navigation.dismissAllModals();
//         setTimeout(() => {
//             Alert.alert(`Thank you`, `Your report has been added to the map.`);
//         }, 300);
//     } catch (err) {
//         Alert.alert("Error", "Failed to report danger zone. Please try again.");
//         console.error(err);
//     }
//   };

//   const shakeEnabled = userSettings?.security.shakeToSosEnabled ?? false;
//   const voiceEnabled = userSettings?.security.voiceActivationEnabled ?? false;
//   const accidentEnabled = userSettings?.security.accidentDetectionEnabled ?? false;

//   useShakeDetector(handleActivateEmergency, shakeEnabled);
//   const { error: voiceError, isListening } = useVoiceActivation(handleActivateEmergency, voiceEnabled);
//   useAccidentDetector(handleActivateEmergency, accidentEnabled);
  
//   useEffect(() => {
//       if (voiceError) {
//           Alert.alert("Voice Activation Warning", `${voiceError}\n\nThe feature has been disabled. You can try re-enabling it in Settings.`);
//           if(userSettings){
//             handleSaveSettings({
//                 ...userSettings,
//                 security: { ...userSettings.security, voiceActivationEnabled: false }
//             });
//           }
//       }
//   }, [voiceError, userSettings]);


//   if (isLoading) {
//     return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
//   }

//   if (error || !userSettings) {
//     return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}><Text style={{color: 'red'}}>{error || 'An unexpected error occurred.'}</Text></View>;
//   }

//   return (
//     <Container>
//       <MapViewContainer>
//          <MapImage source={{ uri: 'https://i.imgur.com/5uV1f3D.png' }}>
//             {dangerZones.map(zone => <DangerZonePin key={zone.id} zone={zone} />)}
//          </MapImage>
//          <Header>
//             <HeaderTextContainer>
//                 <HelloText>Hello {userSettings.personalInfo.fullName},</HelloText>
//                 <LocationText>San diago, 8453 Street, Italy</LocationText>
//                 {isListening && <VoiceGuardText><Icon name="mic" size={12} /> Voice Guard Active</VoiceGuardText>}
//             </HeaderTextContainer>
//             <HeaderActions>
//                 <ActionButton onPress={() => openModal('ReportDangerZone', { onReport: handleAddDangerZone })}>
//                     <Icon name="alert-circle" size={24} color="#f97316" />
//                 </ActionButton>
//                  <ActionButton onPress={() => openModal('Settings', { onLogout: handleLogout, currentSettings: userSettings, onSave: handleSaveSettings })}>
//                     <Icon name="settings" size={24} color="#4b5563" />
//                 </ActionButton>
//             </HeaderActions>
//          </Header>
//          <UserLocationPinContainer>
//             <UserImage source={{ uri: 'https://i.imgur.com/n16shc2.png' }} />
//          </UserLocationPinContainer>
//       </MapViewContainer>
//       <BottomNavContainer>
//             <NavItemContainer onPress={() => openModal('CommunitySafety')}>
//                 <Icon name="shield" size={28} color="#4b5563" />
//                 <NavItemLabel>Community</NavItemLabel>
//             </NavItemContainer>
//             <NavItemContainer onPress={() => openModal('FollowMe')}>
//                 <Icon name="map" size={28} color="#4b5563" />
//                 <NavItemLabel>Follow Me</NavItemLabel>
//             </NavItemContainer>
//             <SOSButtonContainer>
//                 <SOSButton onPress={handleActivateEmergency}>
//                     <Icon name="alert-octagon" size={32} color="white" />
//                     <SOSText>SOS</SOSText>
//                 </SOSButton>
//             </SOSButtonContainer>
//             <NavItemContainer onPress={() => openModal('CheckIn', { onEmergency: handleActivateEmergency })}>
//                 <Icon name="clock" size={28} color="#4b5563" />
//                 <NavItemLabel>Check-In</NavItemLabel>
//             </NavItemContainer>
//             <NavItemContainer onPress={() => openModal('FakeCall')}>
//                 <Icon name="phone-off" size={28} color="#4b5563" />
//                 <NavItemLabel>Fake Call</NavItemLabel>
//             </NavItemContainer>
//       </BottomNavContainer>
//       <SafetyAssistantButton onPress={() => openModal('SafetyAssistant')}>
//           <Icon name="message-circle" size={32} color="white" />
//       </SafetyAssistantButton>
//     </Container>
//   );
// };

// export default App;
