import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Input } from '../components/common/Input';
import { SettingsHeader } from '../components/settings/SettingsHeader';

describe('Common Components', () => {
  describe('Input', () => {
    it('renders placeholder and accepts icon', () => {
      let testRenderer: any;
      act(() => {
        testRenderer = renderer.create(
          <Input label="Email Address" value="test@example.com" icon={<Text>@</Text>} />
        );
      });
      expect(testRenderer.toJSON()).not.toBeNull();
      act(() => {
        testRenderer.unmount();
      });
    });

    it('renders without icon', () => {
      let testRenderer: any;
      act(() => {
        testRenderer = renderer.create(<Input label="Password" secureTextEntry />);
      });
      expect(testRenderer.toJSON()).not.toBeNull();
      act(() => {
        testRenderer.unmount();
      });
    });
  });

  describe('SettingsHeader', () => {
    it('renders title and triggers onBack when pressed', () => {
      const onBack = jest.fn();
      let testRenderer: any;
      act(() => {
        testRenderer = renderer.create(<SettingsHeader title="Profile Settings" onBack={onBack} />);
      });
      expect(testRenderer.toJSON()).not.toBeNull();

      const backButton = testRenderer.root.find(
        (n: any) => typeof n.props.onPress === 'function'
      );
      act(() => {
        backButton.props.onPress();
      });
      expect(onBack).toHaveBeenCalledTimes(1);

      act(() => {
        testRenderer.unmount();
      });
    });
  });
});
