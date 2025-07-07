import React from 'react';
import { View, TextInput, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

interface InputProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  id: string; // Keep for compatibility though not used in native
  name?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const InputWrapper = styled(View)`
  border-bottom-width: 2px;
  border-color: #e5e7eb; /* gray-200 */
  flex-direction: row;
  align-items: center;
`;

const IconWrapper = styled(View)`
  padding-horizontal: 4px;
`;

const StyledTextInput = styled(TextInput)`
  flex: 1;
  padding-left: 10px;
  padding-right: 12px;
  padding-vertical: 12px;
  background-color: transparent;
  color: #1f2937; /* gray-800 */
  font-size: 16px;
`;


export const Input: React.FC<InputProps> = ({ label, icon, containerStyle, ...props }) => {
  return (
    <InputWrapper style={containerStyle}>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      <StyledTextInput
        placeholder={label}
        placeholderTextColor="#9ca3af" /* gray-400 */
        {...props}
      />
    </InputWrapper>
  );
};
