
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Feather';
import { Navigation } from '@react-navigation/native';
import { TrustedContact, UserSettings } from '../../types';

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

const ContactCard = styled(View)`
  padding: 16px;
  border-radius: 8px;
  background-color: #f9fafb; /* gray-50 */
  border-width: 1px;
  border-color: #e5e7eb;
  margin-bottom: 16px;
  position: relative;
`;

const RemoveButton = styled(TouchableOpacity)`
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px;
`;

const InputContainer = styled(View)`
  border-bottom-width: 2px;
  border-color: #e5e7eb;
  margin-top: 16px;
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

const AddButton = styled(TouchableOpacity)`
    border-style: dashed;
    border-width: 2px;
    border-color: #d1d5db;
    padding: 16px;
    border-radius: 8px;
    align-items: center;
`;

const AddButtonText = styled(Text)`
    color: #10b981;
    font-weight: 600;
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

interface ContactSettingsProps {
  componentId: string;
  currentSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export const ContactSettingsScreen: React.FC<ContactSettingsProps> = ({ componentId, currentSettings, onSave }) => {
  const [contacts, setContacts] = useState<TrustedContact[]>(currentSettings.trustedContacts);
  const [isSaving, setIsSaving] = useState(false);
  const onBack = () => Navigation.pop(componentId);

  const handleContactChange = (index: number, field: 'name' | 'phone', value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const addContact = () => {
    setContacts([...contacts, { id: Date.now().toString(), name: '', phone: '' }]);
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    const validContacts = contacts.filter(c => c.name && c.phone);
    await onSave({ ...currentSettings, trustedContacts: validContacts });
    setIsSaving(false);
    onBack();
  };

  return (
    <Container>
        <Header>
            <BackButton onPress={onBack}>
            <Icon name="arrow-left" size={24} color="#1f2937" />
            </BackButton>
            <Title>Emergency Contact</Title>
        </Header>
        <ScrollView>
            {contacts.map((contact, index) => (
            <ContactCard key={contact.id}>
                <RemoveButton onPress={() => removeContact(contact.id)}>
                    <Icon name="x" size={20} color="#ef4444" />
                </RemoveButton>
                <InputContainer>
                    <Icon name="user" size={20} color="#9ca3af" />
                    <StyledInput 
                        placeholder="Contact Name" 
                        value={contact.name}
                        onChangeText={(val) => handleContactChange(index, 'name', val)}
                    />
                </InputContainer>
                <InputContainer>
                    <Icon name="phone" size={20} color="#9ca3af" />
                    <StyledInput
                        placeholder="Phone Number" 
                        keyboardType="phone-pad"
                        value={contact.phone}
                        onChangeText={(val) => handleContactChange(index, 'phone', val)}
                    />
                </InputContainer>
            </ContactCard>
            ))}
            <AddButton onPress={addContact}>
                <AddButtonText>+ Add Another Contact</AddButtonText>
            </AddButton>
        </ScrollView>
        <SubmitButton onPress={handleSave} disabled={isSaving}>
            <ButtonText>{isSaving ? 'Saving...' : 'Save & Update'}</ButtonText>
        </SubmitButton>
    </Container>
  );
};

export default ContactSettingsScreen;