import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { TrustedContact, UserSettings } from '../../types';
import { SettingsHeader } from './SettingsHeader';
import { Input } from '../common/Input';
import { IconUser, IconPhoneCall } from '../../constants';

const Container = styled(View)`
  flex: 1;
  padding: 16px;
`;

const Body = styled(ScrollView)``;

const ContactCard = styled(View)`
  padding: 16px;
  border-radius: 8px;
  background-color: #f9fafb;
  border-width: 1px;
  border-color: #e5e7eb;
  margin-bottom: 16px;
  position: relative;
  gap: 16px;
`;

const RemoveButton = styled(TouchableOpacity)`
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px;
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
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
  onBack: () => void;
  currentSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export const ContactSettings: React.FC<ContactSettingsProps> = ({ onBack, currentSettings, onSave }) => {
  const [contacts, setContacts] = useState<TrustedContact[]>(currentSettings.trustedContacts);
  const [isSaving, setIsSaving] = useState(false);

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
      <SettingsHeader title="Emergency Contact" onBack={onBack} />
      <Body>
        {contacts.map((contact, index) => (
          <ContactCard key={contact.id}>
            <RemoveButton onPress={() => removeContact(contact.id)}>
                <Text style={{color: '#ef4444', fontSize: 18}}>×</Text>
            </RemoveButton>
            <Input 
                id={`contact-name-${contact.id}`} 
                label="Contact Name" 
                value={contact.name}
                icon={<IconUser size={20} color="#9ca3af" />}
                onChangeText={(val) => handleContactChange(index, 'name', val)}
            />
            <Input 
                id={`contact-phone-${contact.id}`} 
                label="Phone Number" 
                keyboardType="phone-pad"
                value={contact.phone}
                icon={<IconPhoneCall size={20} color="#9ca3af" />}
                onChangeText={(val) => handleContactChange(index, 'phone', val)}
            />
          </ContactCard>
        ))}
        <AddButton onPress={addContact}>
            <AddButtonText>+ Add Another Contact</AddButtonText>
        </AddButton>
      </Body>
      <SubmitButton onPress={handleSave} disabled={isSaving}>
        <ButtonText>{isSaving ? 'Saving...' : 'Save & Update'}</ButtonText>
      </SubmitButton>
    </Container>
  );
};
