import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { IconArrowLeft } from '../../constants';

const HeaderContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-shrink: 0;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const HeaderTitle = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
`;

interface SettingsHeaderProps {
  title: string;
  onBack: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, onBack }) => (
    <HeaderContainer>
        <BackButton onPress={onBack}>
          <IconArrowLeft size={24} color="#1f2937" />
        </BackButton>
        <HeaderTitle>{title}</HeaderTitle>
    </HeaderContainer>
);
