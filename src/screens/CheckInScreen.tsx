
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Feather';
import { Navigation } from '@react-navigation/native';

const Container = styled(View)`
  flex: 1;
  background-color: white;
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

const Body = styled(View)`
  flex: 1;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Description = styled(Text)`
    color: #4b5563;
    margin-bottom: 24px;
    text-align: center;
    max-width: 80%;
`;

const TimerText = styled(Text)`
    font-size: 60px;
    font-weight: bold;
    font-family: ${Platform.OS === 'ios' ? 'Menlo' : 'monospace'};
    color: #2563eb; /* blue-600 */
    margin-bottom: 32px;
`;

const TimeOptionsGrid = styled(View)`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    width: 100%;
    max-width: 300px;
`;

const TimeOptionButton = styled(TouchableOpacity)`
    background-color: #dbeafe; /* blue-100 */
    padding: 16px;
    border-radius: 8px;
    width: 45%;
    align-items: center;
`;

const TimeOptionText = styled(Text)`
    color: #1d4ed8; /* blue-700 */
    font-weight: 600;
`;

const CancelButton = styled(TouchableOpacity)`
  background-color: #1f2937;
  padding: 16px;
  border-radius: 9999px;
  align-items: center;
  margin-top: 16px;
  width: 100%;
`;

const ButtonText = styled(Text)`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;


const TIME_OPTIONS = [
  { label: '15 min', value: 15 * 60 }, { label: '30 min', value: 30 * 60 },
  { label: '1 hour', value: 60 * 60 }, { label: '2 hours', value: 120 * 60 },
];

interface CheckInScreenProps {
  componentId: string;
  onEmergency: () => void;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({ componentId, onEmergency }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<any>(null);
  const onClose = () => Navigation.dismissModal(componentId);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      clearTimer();
      onClose();
      onEmergency();
      return;
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimer();
  }, [timeLeft, onEmergency, onClose]);

  const handleStartTimer = (seconds: number) => setTimeLeft(seconds);
  
  const handleCancelTimer = () => {
    clearTimer();
    setTimeLeft(null);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={onClose}>
          <Icon name="arrow-left" size={24} color="#1f2937" />
        </BackButton>
        <Title>Scheduled Check-In</Title>
      </Header>
      
      <Body>
        {timeLeft !== null ? (
          <>
            <Description>Check-in required in:</Description>
            <TimerText>{formatTime(timeLeft)}</TimerText>
            <Description style={{fontSize: 12}}>If you don't check-in before the timer runs out, an emergency alert will be automatically triggered.</Description>
          </>
        ) : (
          <>
            <Icon name="clock" size={96} color="#3b82f6" style={{marginBottom: 16}}/>
            <Description>Set a timer. If you don't cancel it in time, we'll automatically send an alert to your emergency contacts.</Description>
            <TimeOptionsGrid>
              {TIME_OPTIONS.map(opt => (
                <TimeOptionButton key={opt.value} onPress={() => handleStartTimer(opt.value)}>
                  <TimeOptionText>{opt.label}</TimeOptionText>
                </TimeOptionButton>
              ))}
            </TimeOptionsGrid>
          </>
        )}
      </Body>

      {timeLeft !== null && (
        <CancelButton onPress={handleCancelTimer}>
          <ButtonText>I'm Safe, Cancel Timer</ButtonText>
        </CancelButton>
      )}
    </Container>
  );
};

export default CheckInScreen;