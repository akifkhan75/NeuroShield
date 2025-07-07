import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, SafeAreaView } from 'react-native';
import styled from 'styled-components/native';
import { Login } from './Login';
import { Signup } from './Signup';
import { PersonalInfo } from '../../types';

interface AuthScreenProps {
  onLoginSuccess: (newUser?: Partial<PersonalInfo>) => void;
}

type AuthMode = 'login' | 'signup';

const OnboardingContainer = styled(View)`
    flex: 1;
`;

const OnboardingImage = styled(ImageBackground)`
    flex: 1;
    justify-content: flex-end;
`;

const OnboardingContent = styled(View)`
    padding: 32px;
    background-color: white;
`;

const OnboardingTitle = styled(Text)`
    font-size: 36px;
    font-weight: bold;
    color: #1f2937;
`;

const OnboardingTitleHighlight = styled(Text)`
    color: #10b981;
`;

const OnboardingButton = styled(TouchableOpacity)`
    background-color: black;
    padding: 16px;
    border-radius: 9999px;
    align-items: center;
    margin-top: 16px;
    flex-direction: row;
    justify-content: space-between;
`;

const OnboardingButtonText = styled(Text)`
    color: white;
    font-size: 18px;
    font-weight: bold;
`;


const Onboarding: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
    <OnboardingContainer>
        <OnboardingImage source={{ uri: 'https://i.imgur.com/gK2xG4T.jpg' }}>
        </OnboardingImage>
        <OnboardingContent>
            <OnboardingTitle>Stay Safe</OnboardingTitle>
            <OnboardingTitle>with <OnboardingTitleHighlight>InSafe</OnboardingTitleHighlight></OnboardingTitle>
            <OnboardingButton onPress={onGetStarted}>
                <OnboardingButtonText>Get Started</OnboardingButtonText>
                <Text style={{color: 'white', fontSize: 24}}>&gt;</Text>
            </OnboardingButton>
        </OnboardingContent>
    </OnboardingContainer>
);

const AuthContainer = styled(SafeAreaView)`
    flex: 1;
    justify-content: center;
    background-color: #fff;
    padding: 32px;
`;

const Title = styled(Text)`
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  color: #1f2937;
`;

const Subtitle = styled(Text)`
  font-size: 16px;
  text-align: center;
  color: #6b7280;
  margin-bottom: 32px;
`;

const TabContainer = styled(View)`
  flex-direction: row;
  margin-bottom: 24px;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const TabButton = styled(TouchableOpacity)<{ active: boolean }>`
  flex: 1;
  padding-vertical: 12px;
  align-items: center;
  border-bottom-width: ${props => (props.active ? '2px' : '0px')};
  border-bottom-color: ${props => (props.active ? '#10b981' : 'transparent')};
`;

const TabText = styled(Text)<{ active: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => (props.active ? '#10b981' : '#6b7280')};
`;

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<'onboarding' | 'auth'>('onboarding');

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
  };
  
  if (step === 'onboarding') {
    return <Onboarding onGetStarted={() => setStep('auth')} />;
  }

  return (
    <AuthContainer>
        <View>
            <Title>Welcome!</Title>
            <Subtitle>Sign in or create an account to continue.</Subtitle>
            
            <View>
                <TabContainer>
                    <TabButton active={mode === 'login'} onPress={() => switchMode('login')}>
                        <TabText active={mode === 'login'}>Login</TabText>
                    </TabButton>
                    <TabButton active={mode === 'signup'} onPress={() => switchMode('signup')}>
                        <TabText active={mode === 'signup'}>Sign Up</TabText>
                    </TabButton>
                </TabContainer>

                {mode === 'login' ? (
                    <Login onLoginSuccess={onLoginSuccess} onSwitchToSignup={() => switchMode('signup')} />
                ) : (
                    <Signup onLoginSuccess={onLoginSuccess} onSwitchToLogin={() => switchMode('login')} />
                )}
            </View>
        </View>
    </AuthContainer>
  );
};
