import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { getFakeCallScript } from '../services/apiService';
import { FakeCallScript } from '../types';
import { IconPhoneCall } from '../constants';

const Container = styled(View)`
  flex: 1;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  background-color: #111827; /* gray-900 */
`;

const CallerInfoContainer = styled(View)`
  align-items: center;
  margin-top: 60px;
`;

const CallerIconContainer = styled(View)`
  width: 96px;
  height: 96px;
  background-color: #374151; /* gray-700 */
  border-radius: 48px;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const CallerName = styled(Text)`
  font-size: 36px;
  font-weight: bold;
  color: white;
`;

const CallStatus = styled(Text)`
  font-size: 20px;
  color: #9ca3af; /* gray-400 */
`;

const ScriptContainer = styled(View)`
  background-color: #1f2937; /* gray-800 */
  padding: 16px;
  border-radius: 8px;
  margin: 32px 0;
  width: 100%;
`;

const ScriptTitle = styled(Text)`
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
`;

const ScriptLine = styled(Text)`
  color: #d1d5db; /* gray-300 */
  margin-bottom: 4px;
`;

const ControlsContainer = styled(View)`
  width: 100%;
  max-width: 300px;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 40px;
`;

const ControlButton = styled(TouchableOpacity)`
  align-items: center;
`;

const ControlButtonCircle = styled(View)<{ color: string }>`
  width: 64px;
  height: 64px;
  background-color: ${props => props.color};
  border-radius: 32px;
  justify-content: center;
  align-items: center;
`;

const ControlButtonLabel = styled(Text)`
  color: white;
  margin-top: 8px;
`;

const FakeCallScreen = () => {
  const navigation = useNavigation();
  const [script, setScript] = useState<FakeCallScript | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCallAccepted, setCallAccepted] = useState(false);
  
  const onClose = () => navigation.goBack();

  useEffect(() => {
    // NOTE: Ringtone audio is not implemented in this version to avoid extra dependencies.
    const fetchScript = async () => {
      setIsLoading(true);
      try {
        const fetchedScript = await getFakeCallScript();
        setScript(fetchedScript);
      } catch (error) {
        console.error("Failed to fetch fake call script", error);
        setScript({ callerName: 'Friend', script: ["Hey, are you there?", "Something came up.", "I'm nearby, hurry!"] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchScript();
  }, []);

  if (isLoading) {
    return (
        <Container style={{justifyContent: 'center'}}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{color: 'white', marginTop: 16}}>Preparing fake call...</Text>
        </Container>
    );
  }

  if (!script) {
      return (
        <Container style={{justifyContent: 'center'}}>
            <Text style={{color: 'white'}}>Could not load script. Please try again.</Text>
            <TouchableOpacity onPress={onClose} style={{backgroundColor: '#dc2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, marginTop: 16}}>
                <Text style={{color: 'white'}}>Close</Text>
            </TouchableOpacity>
        </Container>
      )
  }

  return (
    <Container>
        <CallerInfoContainer>
            <CallerIconContainer>
                <IconPhoneCall size={48} color="white" />
            </CallerIconContainer>
            <CallerName>{script.callerName}</CallerName>
            <CallStatus>{isCallAccepted ? 'call in progress...' : 'is calling...'}</CallStatus>
        </CallerInfoContainer>

        {isCallAccepted && (
            <ScriptContainer>
                <ScriptTitle>Script:</ScriptTitle>
                {script.script.map((line, index) => (
                    <ScriptLine key={index}>"{line}"</ScriptLine>
                ))}
            </ScriptContainer>
        )}

        <View style={{ flex: 1 }} />

        <ControlsContainer>
            {isCallAccepted ? (
                <ControlButton onPress={onClose}>
                    <ControlButtonCircle color="#dc2626">
                        <IconPhoneCall size={32} color="white" />
                    </ControlButtonCircle>
                    <ControlButtonLabel>End Call</ControlButtonLabel>
                </ControlButton>
            ) : (
                <>
                    <ControlButton onPress={onClose}>
                        <ControlButtonCircle color="#dc2626">
                             <IconPhoneCall size={32} color="white" />
                        </ControlButtonCircle>
                        <ControlButtonLabel>Decline</ControlButtonLabel>
                    </ControlButton>
                    <ControlButton onPress={() => setCallAccepted(true)}>
                         <ControlButtonCircle color="#16a34a">
                            <IconPhoneCall size={32} color="white" />
                        </ControlButtonCircle>
                        <ControlButtonLabel>Accept</ControlButtonLabel>
                    </ControlButton>
                </>
            )}
        </ControlsContainer>
    </Container>
  );
};

export default FakeCallScreen;