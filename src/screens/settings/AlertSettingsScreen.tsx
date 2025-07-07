
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Feather';
import { Navigation } from '@react-navigation/native';
import { SecuritySettings, UserSettings } from '../../types';

const Container = styled(View)`
  flex: 1;
  background-color: white;
  padding: 16px;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  padding-top: 32px;
  margin-bottom: 16px;
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

const ToggleItemContainer = styled(TouchableOpacity)`
    flex-direction: row;
    align-items: center;
    padding: 12px;
    gap: 16px;
`;

const ToggleTextContainer = styled(View)`
    flex: 1;
`;

const ToggleTitle = styled(Text)`
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
`;

const ToggleDescription = styled(Text)`
    font-size: 14px;
    color: #6b7280;
    margin-top: 2px;
`;

const SubmitButton = styled(TouchableOpacity)`
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

const ToggleOption: React.FC<{label: string, description: string, isEnabled: boolean, onToggle: () => void}> = ({label, description, isEnabled, onToggle}) => (
    <ToggleItemContainer onPress={onToggle}>
        <ToggleTextContainer>
            <ToggleTitle>{label}</ToggleTitle>
            <ToggleDescription>{description}</ToggleDescription>
        </ToggleTextContainer>
        <Switch value={isEnabled} onValueChange={onToggle} />
    </ToggleItemContainer>
);

interface AlertSettingsProps {
  componentId: string;
  currentSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export const AlertSettingsScreen: React.FC<AlertSettingsProps> = ({ componentId, currentSettings, onSave }) => {
  const [security, setSecurity] = useState<SecuritySettings>(currentSettings.security);
  const [isSaving, setIsSaving] = useState(false);
  const onBack = () => Navigation.pop(componentId);

  const handleToggle = (key: keyof SecuritySettings) => {
    // In a real app, permission requests would happen here before toggling.
    // For this example, we assume permissions are handled by the hooks or granted.
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ ...currentSettings, security });
    setIsSaving(false);
    Alert.alert("Success", "Alert settings updated!");
    onBack();
  };

  return (
    <Container>
        <Header>
            <BackButton onPress={onBack}>
                <Icon name="arrow-left" size={24} color="#1f2937" />
            </BackButton>
            <Title>Setup Alert</Title>
        </Header>
        <ScrollView>
            <ToggleOption 
                label="Shake to activate SOS"
                description="Quickly shake your phone to trigger an emergency alert."
                isEnabled={security.shakeToSosEnabled}
                onToggle={() => handleToggle('shakeToSosEnabled')}
            />
            <ToggleOption 
                label="Voice Activation"
                description="Say 'Hey Guardian, emergency!' to trigger an alert."
                isEnabled={security.voiceActivationEnabled}
                onToggle={() => handleToggle('voiceActivationEnabled')}
            />
            <ToggleOption 
                label="Accident Detection"
                description="Uses phone sensors to detect car crashes and auto-trigger SOS."
                isEnabled={security.accidentDetectionEnabled}
                onToggle={() => handleToggle('accidentDetectionEnabled')}
            />
            <View style={{height: 1, backgroundColor: '#e5e7eb', marginVertical: 8}} />
            <ToggleOption 
                label="Share Location in SOS"
                description="Automatically share your live location with contacts."
                isEnabled={security.shareLocationOnSos}
                onToggle={() => handleToggle('shareLocationOnSos')}
            />
            <ToggleOption 
                label="Send SMS during SOS"
                description="Send an emergency text message to your contacts."
                isEnabled={security.sendSmsOnSos}
                onToggle={() => handleToggle('sendSmsOnSos')}
            />
        </ScrollView>
        <SubmitButton onPress={handleSave} disabled={isSaving}>
            <ButtonText>{isSaving ? 'Saving...' : 'Save & Update'}</ButtonText>
        </SubmitButton>
    </Container>
  );
};

export default AlertSettingsScreen;