
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AuthScreen from '../screens/AuthScreen';
import { describe, it, expect } from '@jest/globals';

describe('AuthScreen', () => {
  it('renders correctly in login mode', () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen componentId="test" />);
    
    expect(getByText('Welcome!')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('switches to signup mode when tab is pressed', () => {
    const { getByText, getByPlaceholderText, queryByPlaceholderText } = render(<AuthScreen componentId="test" />);
    
    const signupTab = getByText('Sign Up');
    fireEvent.press(signupTab);

    expect(queryByPlaceholderText('Full Name')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
  });
});