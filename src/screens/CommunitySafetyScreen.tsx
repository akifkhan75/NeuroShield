
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Feather';
import { Navigation } from '@react-navigation/native';

const Container = styled(View)`
  flex: 1;
  background-color: #f3f4f6;
  padding: 16px;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
  padding-top: 32px;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const Title = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-left: 16px;
`;

const ScrollContainer = styled(ScrollView).attrs({
    contentContainerStyle: { paddingBottom: 16, gap: 16 }
})`
    flex: 1;
`;

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

const ViewContainer = styled(View)`
    padding: 8px;
`;

const Subtitle = styled(Text)`
    font-size: 18px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 16px;
`;

// --- Components --- //

const FeatureInfo: React.FC<{
    iconName: string;
    title: string;
    description: string;
    onAction?: () => void;
    actionText?: string;
}> = ({ iconName, title, description, onAction, actionText }) => (
  <FeatureInfoContainer>
    <Icon name={iconName} size={32} color="#0891b2" />
    <FeatureInfoTextContainer>
      <FeatureTitle>{title}</FeatureTitle>
      <FeatureDescription>{description}</FeatureDescription>
      {onAction && actionText && (
        <FeatureActionButton onPress={onAction}>
          <FeatureActionText>{actionText} &rarr;</FeatureActionText>
        </FeatureActionButton>
      )}
    </FeatureInfoTextContainer>
  </FeatureInfoContainer>
);

const SafeWalkView = () => {
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'accepted'>('idle');
  
  if (requestStatus === 'pending') {
    return <ViewContainer><ActivityIndicator /><Text style={{textAlign: 'center', marginTop: 8}}>Contacting volunteers...</Text></ViewContainer>;
  }
  if (requestStatus === 'accepted') {
    return <ViewContainer><Text style={{textAlign: 'center', color: '#059669'}}>Sarah V. has accepted your request!</Text></ViewContainer>;
  }

  return (
    <ViewContainer>
       <Subtitle>Available Volunteers</Subtitle>
       <TouchableOpacity onPress={() => {
           setRequestStatus('pending');
           setTimeout(() => setRequestStatus('accepted'), 2000);
       }} style={{backgroundColor: 'white', padding: 12, borderRadius: 8}}>
            <Text style={{fontWeight: '600'}}>Sarah V. (0.2 miles away) - Tap to Request</Text>
       </TouchableOpacity>
    </ViewContainer>
  )
};

const DangerZoneView = () => (
    <ViewContainer>
       <Subtitle>Community-Reported Zones</Subtitle>
       <View style={{gap: 8}}>
            <View style={{backgroundColor: 'white', padding: 12, borderRadius: 8}}><Text style={{fontWeight: '600'}}>Elm Street Park:</Text><Text>"Poor lighting after 9 PM."</Text></View>
            <View style={{backgroundColor: 'white', padding: 12, borderRadius: 8}}><Text style={{fontWeight: '600'}}>Downtown Station:</Text><Text>"Suspicious individuals reported."</Text></View>
       </View>
    </ViewContainer>
);


interface CommunitySafetyScreenProps {
  componentId: string;
}

export const CommunitySafetyScreen: React.FC<CommunitySafetyScreenProps> = ({ componentId }) => {
  const [view, setView] = useState<'main' | 'safeWalk' | 'dangerZones'>('main');
  const onClose = () => Navigation.dismissModal(componentId);

  const renderContent = () => {
    switch(view) {
      case 'safeWalk': return <SafeWalkView />;
      case 'dangerZones': return <DangerZoneView />;
      default:
        return (
          <>
            <FeatureInfo iconName="user-check" title="Safe Walk" description="Request a volunteer to virtually accompany you." actionText="Find a Volunteer" onAction={() => setView('safeWalk')} />
            <FeatureInfo iconName="shield" title="Danger Zones" description="View and report unsafe areas." actionText="View & Report Zones" onAction={() => setView('dangerZones')} />
            <FeatureInfo iconName="users" title="Nearby Volunteers" description="During an SOS, nearby volunteers can be notified to assist." />
            <FeatureInfo iconName="truck" title="Accident Detection" description="Detects car crashes and automatically alerts contacts." />
          </>
        );
    }
  }

  return (
    <Container>
      <Header>
        <BackButton onPress={view === 'main' ? onClose : () => setView('main')}>
          <Icon name="arrow-left" size={24} color="#1f2937" />
        </BackButton>
        <Title>Community Hub</Title>
      </Header>
      
      <ScrollContainer>
        {renderContent()}
      </ScrollContainer>
      
      <CloseButton onPress={onClose}>
        <ButtonText>{view === 'main' ? 'Got It' : 'Close'}</ButtonText>
      </CloseButton>
    </Container>
  );
};

export default CommunitySafetyScreen;