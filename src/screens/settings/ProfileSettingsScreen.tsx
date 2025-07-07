
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Feather';
import { Navigation } from '@react-navigation/native';
import { PersonalInfo, UserSettings } from '../../types';

const Container = styled(KeyboardAvoidingView).attrs({
    behavior: Platform.OS === "ios" ? "padding" : "height"
})`
  flex: 1;
  background-color: white;
`;

const InnerContainer = styled(View)`
    flex: 1;
    padding: 16px;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
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

const Description = styled(Text)`
    color: #6b7280;
    margin: 16px 0;
`;

const InputContainer = styled(View)`
  border-bottom-width: 2px;
  border-color: #e5e7eb;
  margin-bottom: 24px;
  flex-direction: row;
  align-items: center;
  padding-bottom: 8px;
`;

const StyledInput = styled(TextInput)`
  flex: 1;
  font-size: 16px;
  padding-left: 12px;
  color: #1f2937;
`;

const SubmitButton = styled(TouchableOpacity)`
  background-color: #1f2937;
  padding: 16px;
  border-radius: 9999px;
  align-items: center;
`;

const ButtonText = styled(Text)`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;


interface ProfileSettingsProps {
  componentId: string;
  currentSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsProps> = ({ componentId, currentSettings, onSave }) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(currentSettings.personalInfo);
  const [isSaving, setIsSaving] = useState(false);
  const onBack = () => Navigation.pop(componentId);

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
      <InnerContainer>
        <Header>
            <BackButton onPress={onBack}>
            <Icon name="arrow-left" size={24} color="#1f2937" />
            </BackButton>
            <Title>Update Profile</Title>
        </Header>
        <ScrollView>
            <Description>This information can be crucial for first responders in an emergency.</Description>
            <InputContainer>
                <Icon name="user" size={20} color="#9ca3af" />
                <StyledInput
                    placeholder="Full Name"
                    value={personalInfo.fullName}
                    onChangeText={(val) => handleChange('fullName', val)}
                />
            </InputContainer>
            <InputContainer>
                <Icon name="droplet" size={20} color="#9ca3af" />
                <StyledInput
                    placeholder="Blood Type (e.g., O+)"
                    value={personalInfo.bloodType}
                    onChangeText={(val) => handleChange('bloodType', val)}
                />
            </InputContainer>
            <InputContainer>
                <Icon name="alert-circle" size={20} color="#9ca3af" />
                <StyledInput
                    placeholder="Allergies"
                    value={personalInfo.allergies}
                    onChangeText={(val) => handleChange('allergies', val)}
                />
            </InputContainer>
        </ScrollView>
        <View style={{flex: 1}}/>
        <SubmitButton onPress={handleSave} disabled={isSaving}>
            <ButtonText>{isSaving ? 'Saving...' : 'Save & Update'}</ButtonText>
        </SubmitButton>
      </InnerContainer>
    </Container>
  );
};

export default ProfileSettingsScreen;