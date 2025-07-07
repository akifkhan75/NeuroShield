import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { PersonalInfo, UserSettings } from '../../types';
import { SettingsHeader } from './SettingsHeader';
import { Input } from '../common/Input';
import { IconUser } from '../../constants';

const Container = styled(View)`
  flex: 1;
  padding: 16px;
`;

const Body = styled(ScrollView)``;

const Description = styled(Text)`
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 16px;
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

interface ProfileSettingsProps {
  onBack: () => void;
  currentSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onBack, currentSettings, onSave }) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(currentSettings.personalInfo);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (name: keyof PersonalInfo, value: string) => {
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ ...currentSettings, personalInfo });
    setIsSaving(false);
    onBack();
  };

  return (
    <Container>
      <SettingsHeader title="Update Profile" onBack={onBack} />
      <Body contentContainerStyle={{gap: 24, paddingBottom: 16}}>
        <Description>This information can be crucial for first responders in an emergency.</Description>
        <Input
          id="fullName"
          label="Full Name"
          value={personalInfo.fullName}
          onChangeText={(val) => handleChange('fullName', val)}
          icon={<IconUser size={20} color="#9ca3af" />}
        />
        <Input
          id="bloodType"
          label="Blood Type (e.g., O+)"
          value={personalInfo.bloodType}
          onChangeText={(val) => handleChange('bloodType', val)}
        />
        <Input
          id="allergies"
          label="Allergies"
          value={personalInfo.allergies}
          onChangeText={(val) => handleChange('allergies', val)}
        />
      </Body>
      <SubmitButton
        onPress={handleSave}
        disabled={isSaving}
      >
        <ButtonText>{isSaving ? 'Saving...' : 'Save & Update'}</ButtonText>
      </SubmitButton>
    </Container>
  );
};
