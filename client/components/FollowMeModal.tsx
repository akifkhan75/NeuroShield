import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput, Alert, Image, ImageBackground, SafeAreaView } from 'react-native';
import styled from 'styled-components/native';
import { IconArrowLeft, IconShare, IconRoute } from '../constants';

const Container = styled(SafeAreaView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background-color: #fff;
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

const Body = styled(View)`
  flex: 1;
  gap: 16px;
`;

const Description = styled(Text)`
    color: #6b7280;
    margin-bottom: 8px;
    text-align: center;
`;

const ShareLinkContainer = styled(View)`
    background-color: #f3f4f6;
    padding: 12px;
    border-radius: 8px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const ShareLinkText = styled(Text)`
    color: #374151;
    flex: 1;
`;

const ToggleContainer = styled(TouchableOpacity)`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: #f3f4f6;
    border-radius: 8px;
`;

const Input = styled(TextInput)`
    width: 100%;
    padding: 12px 16px;
    padding-left: 40px;
    background-color: #f3f4f6;
    border-radius: 8px;
`;

const MapContainer = styled(ImageBackground)`
    flex: 1;
    border-radius: 8px;
    overflow: hidden;
    background-color: #e5e7eb;
    justify-content: center;
    align-items: center;
`;

const SubmitButton = styled(TouchableOpacity)<{active: boolean}>`
  background-color: ${props => props.active ? '#dc2626' : '#4f46e5'};
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


export const FollowMeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const shareLink = `https://insafe.example/follow/jS8fD9kL`;
  const [pathDeviationEnabled, setPathDeviationEnabled] = useState(false);
  const [destination, setDestination] = useState('');
  const [monitoringActive, setMonitoringActive] = useState(false);
  
  const handleShare = () => {
    Alert.alert("Link to Share", shareLink);
  };

  const handleStartMonitoring = () => {
    if (pathDeviationEnabled && !destination) {
      Alert.alert("Please enter a destination to enable path deviation alerts.");
      return;
    }
    setMonitoringActive(true);
    Alert.alert("Monitoring Started", `Follow Me session started! ${pathDeviationEnabled ? `Path deviation monitoring to "${destination}" is active.` : ''}`);
  }

  return (
    <Container>
      <Header>
        <BackButton onPress={onClose}>
          <IconArrowLeft size={24} color="#1f2937" />
        </BackButton>
        <HeaderTitle>Follow Me</HeaderTitle>
      </Header>
      
      <Body>
        <View>
          <Description>Share this link with a trusted contact to let them track your journey in real-time.</Description>
          <ShareLinkContainer>
            <ShareLinkText numberOfLines={1}>{shareLink}</ShareLinkText>
            <TouchableOpacity onPress={handleShare} style={{padding: 8}}>
              <IconShare size={20} color="#4f46e5"/>
            </TouchableOpacity>
          </ShareLinkContainer>
        </View>

        <View style={{borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16, gap: 12}}>
            <ToggleContainer onPress={() => setPathDeviationEnabled(p => !p)}>
                <Text style={{fontWeight: '600', color: '#374151'}}>Path Deviation Alert</Text>
                <Switch value={pathDeviationEnabled} onValueChange={setPathDeviationEnabled}/>
            </ToggleContainer>
          {pathDeviationEnabled && (
            <View>
              <IconRoute size={20} color="#9ca3af" style={{position: 'absolute', left: 12, top: 14, zIndex: 1}}/>
              <Input 
                placeholder="Enter Destination Address"
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          )}
        </View>
        
        <MapContainer source={{ uri: 'https://i.imgur.com/5uV1f3D.png' }}>
            <Image source={{ uri: 'https://i.imgur.com/n16shc2.png' }} style={{width: 56, height: 56, borderRadius: 28, borderWidth: 4, borderColor: 'white'}} />
           <View style={{position: 'absolute', bottom: 16, left: 16, backgroundColor: 'white', padding: 8, borderRadius: 8}}>
             <Text style={{fontWeight: '600'}}>Status: <Text style={{color: monitoringActive ? '#16a34a' : '#6b7280'}}>{monitoringActive ? 'Active' : 'Inactive'}</Text></Text>
           </View>
        </MapContainer>
      </Body>
      
      {!monitoringActive ? (
        <SubmitButton active={false} onPress={handleStartMonitoring}>
          <ButtonText>Start Sharing</ButtonText>
        </SubmitButton>
      ) : (
        <SubmitButton active={true} onPress={onClose}>
          <ButtonText>Stop Sharing</ButtonText>
        </SubmitButton>
      )}
    </Container>
  );
};
