import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import styled from 'styled-components/native';
import { UserSettings } from '../../types';
import { IconArrowLeft, IconProfile, IconContact, IconLocation, IconAlert, IconLogout, IconChevronRight } from '../../constants';
import { ProfileSettings } from './ProfileSettings';
import { ContactSettings } from './ContactSettings';
import { AlertSettings } from './AlertSettings';

const Container = styled(SafeAreaView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background-color: #fff;
`;

const InnerContainer = styled(View)`
    flex: 1;
    padding: 16px;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const HeaderTitle = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-left: 16px;
`;

const SettingItemContainer = styled(TouchableOpacity)`
    flex-direction: row;
    align-items: center;
    padding: 12px 4px;
    gap: 16px;
    border-radius: 8px;
`;

const SettingItemIconContainer = styled(View)`
    background-color: #dcfce7; /* green-100 */
    padding: 12px;
    border-radius: 9999px;
`;

const SettingTextContainer = styled(View)`
    flex: 1;
`;

const SettingTitle = styled(Text)`
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
`;

const SettingDescription = styled(Text)`
    font-size: 14px;
    color: #6b7280;
    margin-top: 2px;
`;


interface SettingsScreenProps {
  onClose: () => void;
  onLogout: () => void;
  currentSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

type SettingsView = 'main' | 'profile' | 'contact' | 'alert';

const SettingItem: React.FC<{
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  onPress?: ()=>void, 
  hasToggle?: boolean,
  isToggleOn?: boolean,
  onToggleChange?: (isOn: boolean) => void,
}> = ({ icon, title, description, onPress, hasToggle, isToggleOn, onToggleChange }) => {
  
  return (
    <SettingItemContainer onPress={onPress} disabled={!onPress && !hasToggle}>
        <SettingItemIconContainer>{icon}</SettingItemIconContainer>
        <SettingTextContainer>
            <SettingTitle>{title}</SettingTitle>
            <SettingDescription>{description}</SettingDescription>
        </SettingTextContainer>
        {hasToggle ? (
            <Switch value={isToggleOn} onValueChange={onToggleChange} trackColor={{ false: "#767577", true: "#10b981" }} thumbColor={"#f4f3f4"}/>
        ) : <IconChevronRight size={24} color="#9ca3af" />}
    </SettingItemContainer>
  );
};


export const SettingsModal: React.FC<SettingsScreenProps> = ({ onClose, onLogout, currentSettings, onSave }) => {
  const [view, setView] = useState<SettingsView>('main');

  const handleToggleLocation = (isOn: boolean) => {
    onSave({
        ...currentSettings,
        security: {
            ...currentSettings.security,
            locationSharingEnabled: isOn,
        }
    });
  };

  const renderContent = () => {
    switch (view) {
      case 'profile':
        return <ProfileSettings onBack={() => setView('main')} currentSettings={currentSettings} onSave={onSave} />;
      case 'contact':
        return <ContactSettings onBack={() => setView('main')} currentSettings={currentSettings} onSave={onSave} />;
      case 'alert':
        return <AlertSettings onBack={() => setView('main')} currentSettings={currentSettings} onSave={onSave} />;
      default:
        return (
          <InnerContainer>
            <Header>
              <BackButton onPress={onClose}>
                <IconArrowLeft size={24} color="#1f2937" />
              </BackButton>
              <HeaderTitle>Settings</HeaderTitle>
            </Header>
            <View style={{gap: 8}}>
              <SettingItem icon={<IconProfile size={24} color="#16a34a"/>} title="Update Profile" description="View and edit your profile" onPress={() => setView('profile')}/>
              <SettingItem icon={<IconContact size={24} color="#16a34a"/>} title="Contact" description="Emergency Contact" onPress={() => setView('contact')}/>
              <SettingItem 
                icon={<IconLocation size={24} color="#16a34a"/>} 
                title="Show My Location" 
                description="Allow location tracking" 
                hasToggle 
                isToggleOn={currentSettings.security.locationSharingEnabled}
                onToggleChange={handleToggleLocation}
              />
              <SettingItem icon={<IconAlert size={24} color="#16a34a"/>} title="Setup Alert" description="Configure alert settings" onPress={() => setView('alert')}/>
              <View style={{marginTop: 16, borderTopWidth: 1, borderColor: '#e5e7eb', paddingTop: 8}} />
              <SettingItem icon={<IconLogout size={24} color="#16a34a"/>} title="Logout" description="Click here to logout" onPress={onLogout} />
            </View>
          </InnerContainer>
        );
    }
  };

  return (
    <Container>
      {renderContent()}
    </Container>
  );
};
