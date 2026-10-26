import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserSettings } from '../types';
import { getSelfDefenseTips } from '../services/apiService';
import { IconArrowLeft, IconVolumeUp, IconZap, IconMic, IconUsers } from '../constants';

const Container = styled(View)`
  flex: 1;
  justify-content: space-between;
  padding: 16px;
  background-color: #3b82f6; /* blue-500 */
`;

const Header = styled(View)`
  padding-top: 40px;
`;

const BackButton = styled(TouchableOpacity)`
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
`;

const TitleContainer = styled(View)`
  margin-top: 16px;
`;

const Subtitle = styled(Text)`
  font-size: 24px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const Title = styled(Text)`
  font-size: 36px;
  font-weight: bold;
  color: white;
`;

const Description = styled(Text)`
  margin-top: 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 90%;
`;

const MainContent = styled(View)`
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-vertical: 8px;
`;

const ContactsRing = styled(View)`
    width: 256px;
    height: 256px;
    align-items: center;
    justify-content: center;
`;

const ContactCircleImage = styled(Image)`
    width: 64px;
    height: 64px;
    border-radius: 32px;
    border-width: 4px;
    border-color: white;
`;

const LumoLogoContainer = styled(View)`
    position: absolute;
    align-items: center;
`;

const LumoText = styled(Text)`
    font-size: 24px;
    font-weight: bold;
    color: white;
`;

const LumoSubtext = styled(Text)`
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
`;

const Footer = styled(View)`
  gap: 12px;
`;

const BottomButton = styled(TouchableOpacity)`
    width: 100%;
    background-color: black;
    color: white;
    font-weight: bold;
    padding: 16px 24px;
    border-radius: 9999px;
    align-items: center;
`;

const ButtonText = styled(Text)`
    color: white;
    font-size: 18px;
    font-weight: bold;
`;

const NearbyVolunteersContainer = styled(View)`
    margin-top: 16px;
    padding: 12px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
`;

const NotifyingText = styled(Text)`
    font-size: 14px;
    font-weight: 600;
    color: white;
    text-align: center;
`;

// --- Components --- //

import Feather from '@expo/vector-icons/Feather';

const ContactCircle = ({role, icon, color, angle}: {role: string, icon: string, color: string, angle: number}) => (
    <View style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -32, marginLeft: -32, transform: [{ rotate: `${angle}deg` }, { translateX: 110 }, { rotate: `-${angle}deg` }] }}>
        <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            borderWidth: 3,
            borderColor: '#ffffff',
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 6,
            elevation: 8,
        }}>
            <Feather name={icon as any} size={22} color="#ffffff" />
            <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 }}>{role}</Text>
        </View>
    </View>
);

const contacts = [
    { name: "Police", role: "POLICE", icon: "shield", color: "#1e40af" },
    { name: "EMS", role: "EMS", icon: "activity", color: "#dc2626" },
    { name: "Mom", role: "MOM", icon: "heart", color: "#db2777" },
    { name: "Security", role: "SEC", icon: "lock", color: "#d97706" },
    { name: "Dad", role: "DAD", icon: "phone", color: "#2563eb" },
    { name: "Guard", role: "GUARD", icon: "users", color: "#059669" },
];

const DefenseGuide = ({ onFinish }: { onFinish: () => void }) => {
    const [tips, setTips] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getSelfDefenseTips().then(setTips).catch(() => setTips(["Yell 'FIRE!' for attention."])).finally(() => setIsLoading(false));
    }, []);

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 20, alignItems: 'center', justifyContent: 'center', padding: 32 }]}>
                <Text style={{fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 16, textAlign: 'center'}}>SELF-DEFENSE MODE</Text>
                 <IconVolumeUp size={48} color="#fbbF04" />
                 <Text style={{fontWeight: '600', color: '#fbbF04', marginBottom: 24, marginTop: 16}}>LOUD ALARM ACTIVE</Text>
                {isLoading ? <ActivityIndicator color="white" /> : <Text style={{fontSize: 18, color: 'white', textAlign: 'center', minHeight: 60}}>{tips[0] || ''}</Text>}
                <TouchableOpacity onPress={onFinish} style={{marginTop: 32, backgroundColor: 'white', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999}}>
                    <Text style={{color: 'black', fontWeight: 'bold'}}>End Defense Mode</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const NearbyVolunteers = () => (
    <NearbyVolunteersContainer>
        <NotifyingText><IconUsers size={14} color="white"/> Notifying Nearby Volunteers...</NotifyingText>
    </NearbyVolunteersContainer>
);


const EmergencyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { settings } = route.params as { settings: UserSettings };

  const [showDefenseGuide, setShowDefenseGuide] = useState(false);
  const onClose = () => navigation.goBack();
  const isRecording = false; 

  return (
    <Container>
      {showDefenseGuide && <DefenseGuide onFinish={() => setShowDefenseGuide(false)}/>}
      <Header>
        <BackButton onPress={onClose}>
          <IconArrowLeft size={24} color="white"/>
        </BackButton>
        <TitleContainer>
            <Subtitle>SOS</Subtitle>
            <Title>Emergency Calling...</Title>
            <Description>
                Notifying your contacts, emergency services, and sharing your location.
                {settings.personalInfo.bloodType && ` Blood type: ${settings.personalInfo.bloodType}.`}
            </Description>
        </TitleContainer>
      </Header>
      
      <MainContent>
        <ContactsRing>
            {contacts.map((c, i) => <ContactCircle key={c.name} {...c} angle={(i * 360/contacts.length)} />)}
            <LumoLogoContainer>
                <LumoText>Lumo</LumoText>
                <LumoSubtext>Safety is Freedom</LumoSubtext>
            </LumoLogoContainer>
        </ContactsRing>
      </MainContent>
      
      <Footer>
        <NearbyVolunteers />
        <View style={{flexDirection: 'row', justifyContent: 'center', gap: 16, marginVertical: 8}}>
            <TouchableOpacity onPress={() => setShowDefenseGuide(true)} style={{alignItems: 'center'}}>
                <View style={{width: 64, height: 64, borderRadius: 32, backgroundColor: '#f59e0b', justifyContent: 'center', alignItems: 'center'}}>
                    <IconZap size={32} color="white"/>
                </View>
                <Text style={{color: 'white', fontSize: 12, fontWeight: '600', marginTop: 4}}>Defense</Text>
            </TouchableOpacity>
            <View style={{alignItems: 'center', opacity: isRecording ? 1 : 0.7}}>
                <View style={{width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center'}}>
                    <IconMic size={32} color={isRecording ? '#ef4444' : 'white'}/>
                </View>
                <Text style={{color: 'white', fontSize: 12, fontWeight: '600', marginTop: 4}}>{isRecording ? 'Recording' : 'Record Mic'}</Text>
            </View>
        </View>
        <BottomButton onPress={onClose}>
          <ButtonText>I'm Safe Now</ButtonText>
        </BottomButton>
      </Footer>
    </Container>
  );
};

export default EmergencyScreen;