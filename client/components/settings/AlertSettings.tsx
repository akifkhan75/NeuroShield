import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
import styled from 'styled-components/native';
import { SecuritySettings, UserSettings } from '../../types';
import { SettingsHeader } from './SettingsHeader';

const Container = styled(View)`
  flex: 1;
  padding: 16px;
`;

const Body = styled(View)`
    flex: 1;
    gap: 8px;
`;

const ToggleOptionContainer = styled(TouchableOpacity)`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: 8px;
`;

const ToggleTextContainer = styled(View)`
    flex: 1;
    padding-right: 16px;
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


interface AlertSettingsProps {
  onBack: () => void;
  currentSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const ToggleOption: React.FC<{label: string, description: string, isEnabled: boolean, onToggle: () => void}> = ({label, description, isEnabled, onToggle}) => (
    <ToggleOptionContainer onPress={onToggle}>
        <ToggleTextContainer>
            <ToggleTitle>{label}</ToggleTitle>
            <ToggleDescription>{description}</ToggleDescription>
        </ToggleTextContainer>
        <Switch value={isEnabled} onValueChange={onToggle} trackColor={{ false: "#767577", true: "#10b981" }} thumbColor={"#f4f3f4"} />
    </ToggleOptionContainer>
);


export const AlertSettings: React.FC<AlertSettingsProps> = ({ onBack, currentSettings, onSave }) => {
  const [security, setSecurity] = useState<SecuritySettings>(currentSettings.security);
  const [isSaving, setIsSaving] = useState(false);

  const requestMicrophonePermission = async (callback: () => void) => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'InSafe needs access to your microphone for voice activation.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          callback();
        } else {
          Alert.alert("Permission Denied", "Microphone permission was denied.");
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      // iOS permissions are typically handled by the library itself or requested at first use.
      callback();
    }
  };

  const handleToggle = (key: keyof SecuritySettings) => {
    const currentValue = security[key];
    const toggle = () => setSecurity(prev => ({ ...prev, [key]: !prev[key] }));

    if (key === 'voiceActivationEnabled' && !currentValue) {
        requestMicrophonePermission(toggle);
    } else {
        toggle();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ ...currentSettings, security });
    setIsSaving(false);
    Alert.alert("Alert settings updated!");
    onBack();
  };

  return (
    <Container>
      <SettingsHeader title="Setup Alert" onBack={onBack} />
      <Body>
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
      </Body>
      <SubmitButton onPress={handleSave} disabled={isSaving}>
        <ButtonText>{isSaving ? 'Saving...' : 'Save & Update'}</ButtonText>
      </SubmitButton>
    </Container>
  );
};
