import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { NativeModules } from 'react-native';
import { useVoiceActivation } from '../hooks/useVoiceActivation';

function VoiceHookWrapper({
  onActivate,
  enabled,
  onState,
}: {
  onActivate: () => void;
  enabled: boolean;
  onState?: (state: { isListening: boolean; error: string | null }) => void;
}) {
  const result = useVoiceActivation(onActivate, enabled);
  if (onState) onState(result);
  return null;
}

describe('useVoiceActivation', () => {
  let mockVoice: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const imported = require('@react-native-voice/voice');
    mockVoice = imported.default || imported;
    NativeModules.Voice = {};
  });

  afterEach(() => {
    delete NativeModules.Voice;
  });

  it('handles fallback when NativeModules.Voice is not available', async () => {
    delete NativeModules.Voice;
    const onActivate = jest.fn();
    let state: any;

    await act(async () => {
      renderer.create(
        <VoiceHookWrapper onActivate={onActivate} enabled={true} onState={(s) => (state = s)} />
      );
      await Promise.resolve();
    });

    expect(state.isListening).toBe(false);
  });

  it('starts listening and triggers on wake phrase', async () => {
    const onActivate = jest.fn();
    let root: any;

    await act(async () => {
      root = renderer.create(<VoiceHookWrapper onActivate={onActivate} enabled={true} />);
      await Promise.resolve();
    });

    expect(mockVoice.start).toHaveBeenCalledWith('en-US');

    // Trigger onSpeechResults with non-matching phrase
    act(() => {
      mockVoice.onSpeechResults({ value: ['hello there world'] });
    });
    expect(onActivate).not.toHaveBeenCalled();

    // Trigger onSpeechResults with wake phrase
    act(() => {
      mockVoice.onSpeechResults({ value: ['hey lumo emergency'] });
    });
    expect(onActivate).toHaveBeenCalledTimes(1);

    // Trigger onSpeechError
    act(() => {
      mockVoice.onSpeechError({ error: { message: 'Microphone busy' } });
    });

    // Unmount
    act(() => {
      root.unmount();
    });
    expect(mockVoice.destroy).toHaveBeenCalled();
  });

  it('stops listening when enabled is false', async () => {
    const onActivate = jest.fn();
    await act(async () => {
      renderer.create(<VoiceHookWrapper onActivate={onActivate} enabled={false} />);
      await Promise.resolve();
    });

    expect(mockVoice.stop).toHaveBeenCalled();
  });
});
