import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, ScrollView, Alert, Platform } from 'react-native';
import styled from 'styled-components/native';
import { IconArrowLeft, IconAlert } from '../constants';
import { DangerZoneType, DangerZoneSeverity } from '../types';

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

const Body = styled(ScrollView)``;

const Description = styled(Text)`
    color: #6b7280;
    margin-bottom: 16px;
`;

const Label = styled(Text)`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
`;

const OptionsContainer = styled(View)`
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
`;

const OptionButton = styled(TouchableOpacity)<{selected: boolean}>`
    padding: 12px 16px;
    border-radius: 8px;
    background-color: ${props => props.selected ? '#4f46e5' : '#f3f4f6'};
`;

const OptionText = styled(Text)<{selected: boolean}>`
    font-weight: 600;
    color: ${props => props.selected ? 'white' : '#374151'};
`;

const SeverityButton = styled(TouchableOpacity)<{selected: boolean, severity: DangerZoneSeverity}>`
    padding: 12px;
    border-radius: 8px;
    flex: 1;
    align-items: center;
    background-color: ${props => {
        if (!props.selected) return '#f3f4f6';
        if (props.severity === 'low') return '#3b82f6';
        if (props.severity === 'medium') return '#f59e0b';
        if (props.severity === 'high') return '#ef4444';
        return '#f3f4f6';
    }};
`;

const SeverityText = styled(Text)<{selected: boolean}>`
    font-weight: 600;
    text-transform: capitalize;
    color: ${props => props.selected ? 'white' : '#374151'};
`;

const StyledTextarea = styled(TextInput)`
    background-color: #f3f4f6;
    padding: 12px;
    border-radius: 8px;
    min-height: 100px;
    text-align-vertical: top;
`;

const SubmitButton = styled(TouchableOpacity)`
  background-color: #1f2937;
  padding: 16px;
  border-radius: 9999px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
`;

const ButtonText = styled(Text)`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

interface ReportDangerZoneModalProps {
  onClose: () => void;
  onReport: (details: { type: DangerZoneType; severity: DangerZoneSeverity; description: string; }) => Promise<void>;
}

const DANGER_TYPES: DangerZoneType[] = ['Theft', 'Assault', 'Harassment', 'Poor Lighting', 'Suspicious Activity'];
const SEVERITY_LEVELS: DangerZoneSeverity[] = ['low', 'medium', 'high'];

export const ReportDangerZoneModal: React.FC<ReportDangerZoneModalProps> = ({ onClose, onReport }) => {
  const [type, setType] = useState<DangerZoneType>('Suspicious Activity');
  const [severity, setSeverity] = useState<DangerZoneSeverity>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert("Please provide a brief description of the incident.");
      return;
    }
    setIsSubmitting(true);
    await onReport({ type, severity, description });
    setIsSubmitting(false);
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={onClose}>
          <IconArrowLeft size={24} color="#1f2937" />
        </BackButton>
        <HeaderTitle>Report Unsafe Area</HeaderTitle>
      </Header>

      <Body contentContainerStyle={{gap: 24, paddingBottom: 16}}>
        <Description>Your report helps keep the community safe. Your current location will be used for the report.</Description>

        <View>
            <Label>Type of Incident</Label>
            <OptionsContainer>
                {DANGER_TYPES.map(t => <OptionButton key={t} selected={type === t} onPress={() => setType(t)}><OptionText selected={type === t}>{t}</OptionText></OptionButton>)}
            </OptionsContainer>
        </View>

        <View>
            <Label>Severity Level</Label>
            <OptionsContainer>
                {SEVERITY_LEVELS.map(level => (
                <SeverityButton key={level} selected={severity === level} severity={level} onPress={() => setSeverity(level)}>
                    <SeverityText selected={severity === level}>{level}</SeverityText>
                </SeverityButton>
                ))}
            </OptionsContainer>
        </View>

        <View>
          <Label>Description</Label>
          <StyledTextarea
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., 'Group of people loitering, feels unsafe.'"
          />
        </View>
      </Body>
      
      <SubmitButton
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? <ActivityIndicator color="white" /> : <IconAlert size={20} color="white" />}
        <ButtonText>{isSubmitting ? 'Submitting...' : 'Submit Report'}</ButtonText>
      </SubmitButton>
    </Container>
  );
};
