import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { IconArrowLeft, IconShield, IconUsers, IconWalk, IconCar, IconRoute } from '../constants';

const Container = styled(SafeAreaView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background-color: #f3f4f6;
  padding: 16px;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const HeaderTitle = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const Body = styled(ScrollView)``;

const CloseButton = styled(TouchableOpacity)`
  background-color: #1f2937;
  padding: 16px;
  border-radius: 9999px;
  align-items: center;
  margin-top: 16px;
`;

const ButtonText = styled(Text)`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const FeatureInfoContainer = styled(View)`
    flex-direction: row;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    background-color: #ffffff;
    border-radius: 8px;
`;

const FeatureInfoTextContainer = styled(View)`
    flex: 1;
`;

const FeatureTitle = styled(Text)`
    font-weight: 600;
    color: #1f2937;
    font-size: 16px;
`;

const FeatureDescription = styled(Text)`
    color: #4b5563;
    margin-top: 4px;
    margin-bottom: 8px;
`;

const FeatureActionButton = styled(TouchableOpacity)``;

const FeatureActionText = styled(Text)`
    font-weight: 600;
    color: #0891b2; /* cyan-600 */
`;

const SubViewContainer = styled(View)`
    gap: 12px;
`;

const SubViewTitle = styled(Text)`
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
`;


interface CommunitySafetyModalProps {
  onClose: () => void;
}

const FeatureInfo: React.FC<{icon: React.ReactNode, title: string, description: string, onAction?: () => void, actionText?: string}> = ({ icon, title, description, onAction, actionText }) => (
  <FeatureInfoContainer>
    <View style={{width: 32, height: 32, alignItems: 'center', justifyContent: 'center'}}>{icon}</View>
    <FeatureInfoTextContainer>
      <FeatureTitle>{title}</FeatureTitle>
      <FeatureDescription>{description}</FeatureDescription>
      {onAction && actionText && (
        <FeatureActionButton onPress={onAction}>
          <FeatureActionText>{actionText} →</FeatureActionText>
        </FeatureActionButton>
      )}
    </FeatureInfoTextContainer>
  </FeatureInfoContainer>
);

const SafeWalkView: React.FC = () => {
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'accepted'>('idle');
  
  const volunteers = [
    { name: 'Sarah V.', distance: '0.2 miles away'},
    { name: 'Mike T.', distance: '0.5 miles away'},
  ];

  const handleRequest = () => {
    setRequestStatus('pending');
    setTimeout(() => setRequestStatus('accepted'), 3000);
  }

  if (requestStatus === 'pending') {
    return (
      <View style={{alignItems: 'center', padding: 16, gap: 8}}>
        <ActivityIndicator size="large" color="#0891b2"/>
        <Text style={{fontWeight: '600'}}>Contacting volunteers...</Text>
      </View>
    );
  }
  
  if (requestStatus === 'accepted') {
    return (
       <View style={{alignItems: 'center', padding: 16, gap: 12}}>
        <View style={{width: 64, height: 64, borderRadius: 32, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center'}}>
          <IconShield size={32} color="#16a34a"/>
        </View>
        <Text style={{fontWeight: '600', color: '#15803d'}}>Sarah V. has accepted your request!</Text>
        <Text style={{color: '#4b5563', fontSize: 14}}>She will now virtually accompany you.</Text>
      </View>
    );
  }

  return (
    <SubViewContainer>
       <SubViewTitle>Available Volunteers</SubViewTitle>
       {volunteers.map(v => (
         <View key={v.name} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 8}}>
           <View>
             <Text style={{fontWeight: '600'}}>{v.name}</Text>
             <Text style={{fontSize: 12, color: '#6b7280'}}>{v.distance}</Text>
           </View>
           <TouchableOpacity onPress={handleRequest} style={{backgroundColor: '#0891b2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999}}>
                <Text style={{color: 'white', fontWeight: '600', fontSize: 14}}>Request</Text>
           </TouchableOpacity>
         </View>
       ))}
    </SubViewContainer>
  )
};

const DangerZoneView: React.FC = () => {
  const zones = [
    { id: 1, location: 'Elm Street Park', report: 'Poor lighting after 9 PM.'},
    { id: 2, location: 'Downtown Station Tunnel', report: 'Reports of suspicious individuals.'},
  ];

  return (
     <SubViewContainer>
       <SubViewTitle>Community-Reported Zones</SubViewTitle>
       {zones.map(z => (
         <View key={z.id} style={{backgroundColor: 'white', padding: 12, borderRadius: 8}}>
            <Text style={{fontWeight: '600'}}>{z.location}</Text>
            <Text style={{color: '#4b5563', marginTop: 2}}>"{z.report}"</Text>
         </View>
       ))}
       <TouchableOpacity style={{borderStyle: 'dashed', borderWidth: 2, borderColor: '#d1d5db', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8}}>
            <Text style={{color: '#0891b2', fontWeight: '600'}}>+ Report My Location</Text>
       </TouchableOpacity>
    </SubViewContainer>
  )
}


export const CommunitySafetyModal: React.FC<CommunitySafetyModalProps> = ({ onClose }) => {
  const [view, setView] = useState<'main' | 'safeWalk' | 'dangerZones'>('main');

  const renderContent = () => {
    switch(view) {
      case 'safeWalk':
        return <SafeWalkView />;
      case 'dangerZones':
        return <DangerZoneView />;
      default:
        return (
          <View style={{gap: 16}}>
            <Text style={{color: '#6b7280', textAlign: 'center', marginBottom: 8}}>These features connect you with a network for added safety.</Text>
            <FeatureInfo icon={<IconWalk size={32} color="#0891b2" />} title="Safe Walk" description="Request a verified volunteer to virtually accompany you on your journey." actionText="Find a Volunteer" onAction={() => setView('safeWalk')} />
            <FeatureInfo icon={<IconRoute size={32} color="#0891b2" />} title="Path Deviation Alerts" description="This is enabled within the 'Follow Me' feature before you start your trip." />
            <FeatureInfo icon={<IconShield size={32} color="#0891b2" />} title="Danger Zones" description="View and report unsafe areas based on real-time community data." actionText="View & Report Zones" onAction={() => setView('dangerZones')} />
            <FeatureInfo icon={<IconUsers size={32} color="#0891b2" />} title="Nearby Volunteers" description="During an SOS, nearby trusted volunteers can be notified to provide faster assistance." />
            <FeatureInfo icon={<IconCar size={32} color="#0891b2" />} title="Accident Detection" description="Detects car crashes and automatically alerts contacts. Enable this in Settings > Setup Alert." />
          </View>
        );
    }
  }

  return (
    <Container>
      <Header>
        <BackButton onPress={view === 'main' ? onClose : () => setView('main')}>
          <IconArrowLeft size={24} color="#1f2937" />
        </BackButton>
        <HeaderTitle>Community Hub</HeaderTitle>
      </Header>
      
      <Body contentContainerStyle={{paddingBottom: 16}}>
        {renderContent()}
      </Body>
      
      <CloseButton onPress={onClose}>
        <ButtonText>{view === 'main' ? 'Got It' : 'Close'}</ButtonText>
      </CloseButton>
    </Container>
  );
};
