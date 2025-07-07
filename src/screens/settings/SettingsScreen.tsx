
import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Feather';
import { Navigation } from '@react-navigation/native';
import { UserSettings } from '../../types';

const Container = styled(View)`
  flex: 1;
  background-color: white;
  padding: 16px;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
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

const SettingItemContainer = styled(TouchableOpacity)`
    flex-direction: row;
    align-items: center;
    padding: 12px;
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


const SettingItem: React.FC<{
  iconName: string;
  title: string;
  description: string;
  onPress?: () => void;
  hasToggle?: boolean;
  isToggleOn?: boolean;
  onToggleChange?: (isOn: boolean) => void;
}> = ({ iconName, title, description, onPress, hasToggle, isToggleOn, onToggleChange }) => (
  <SettingItemContainer onPress={onPress} disabled={!!hasToggle}>
    <SettingItemIconContainer>
        <Icon name={iconName} size={24} color="#16a34a" />
    </SettingItemIconContainer>
    <SettingTextContainer>
        <SettingTitle>{title}</SettingTitle>
        <SettingDescription>{description}</SettingDescription>
    </SettingTextContainer>
    {hasToggle ? (
        <Switch value={isToggleOn} onValueChange={onToggleChange} />
      ) : <Icon name="chevron-right" size={24} color="#9ca3af" />}
  </SettingItemContainer>
);

interface SettingsScreenProps {
  componentId: string;
  onLogout: () => void;
  currentSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ componentId, onLogout, currentSettings, onSave }) => {
    const onClose = () => Navigation.dismissModal(componentId);

    const goTo = (screenName: string) => {
        Navigation.push(componentId, {
            component: {
                name: screenName,
                passProps: {
                    currentSettings,
                    onSave,
                },
                options: { topBar: { visible: false } }
            }
        });
    };

    const handleToggleLocation = (isOn: boolean) => {
        onSave({
            ...currentSettings,
            security: {
                ...currentSettings.security,
                locationSharingEnabled: isOn,
            }
        });
    };
  
    return (
        <Container>
            <Header>
                <BackButton onPress={onClose}>
                <Icon name="arrow-left" size={24} color="#1f2937" />
                </BackButton>
                <Title>Settings</Title>
            </Header>
            <View>
              <SettingItem iconName="user" title="Update Profile" description="View and edit your profile" onPress={() => goTo('ProfileSettings')}/>
              <SettingItem iconName="users" title="Contact" description="Emergency Contact" onPress={() => goTo('ContactSettings')}/>
              <SettingItem 
                iconName="map-pin" 
                title="Show My Location" 
                description="Allow location tracking" 
                hasToggle 
                isToggleOn={currentSettings.security.locationSharingEnabled}
                onToggleChange={handleToggleLocation}
              />
              <SettingItem iconName="bell" title="Setup Alert" description="Configure alert settings" onPress={() => goTo('AlertSettings')}/>
              <View style={{marginTop: 16, borderTopWidth: 1, borderColor: '#e5e7eb', paddingTop: 8}} />
              <SettingItem iconName="log-out" title="Logout" description="Click here to logout" onPress={() => {
                  onClose();
                  onLogout();
              }} />
            </View>
        </Container>
    );
};

export default SettingsScreen;