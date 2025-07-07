
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import App from '../App';
import * as apiService from '../services/apiService';
import { UserSettings } from '../types';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../services/apiService');

const mockSettings: UserSettings = {
  personalInfo: {
    fullName: 'Test User',
    bloodType: 'O+',
    allergies: 'None',
  },
  trustedContacts: [{ id: '1', name: 'Mom', phone: '111-222-3333' }],
  security: {
    locationSharingEnabled: true,
    shareLocationOnSos: true,
    sendSmsOnSos: false,
    shakeToSosEnabled: true,
    voiceActivationEnabled: true,
    accidentDetectionEnabled: false,
  },
};

const mockDangerZones = [];

describe('App', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (apiService.getSettings as any).mockClear();
    (apiService.getDangerZones as any).mockClear();
  });

  it('renders loading indicator initially and then the main screen', async () => {
    (apiService.getSettings as any).mockResolvedValue(mockSettings);
    (apiService.getDangerZones as any).mockResolvedValue(mockDangerZones);

    const { getByText, queryByText } = render(<App componentId="app" />);
    
    // Check that user name is not yet visible
    expect(queryByText('Hello Test User,')).toBeNull();

    await waitFor(() => {
        expect(apiService.getSettings).toHaveBeenCalledTimes(1);
        expect(apiService.getDangerZones).toHaveBeenCalledTimes(1);
    });
    
    expect(getByText('Hello Test User,')).toBeTruthy();
    expect(getByText('SOS')).toBeTruthy();
  });
});