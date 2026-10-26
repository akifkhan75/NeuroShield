// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('@expo/vector-icons/Feather', () => 'Feather');

// Mock expo-sensors
jest.mock('expo-sensors', () => ({
  Accelerometer: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeAllListeners: jest.fn(),
    setUpdateInterval: jest.fn(),
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  },
}));

// Mock @react-native-voice/voice
const mockVoice = {
  onSpeechStart: jest.fn(),
  onSpeechRecognized: jest.fn(),
  onSpeechEnd: jest.fn(),
  onSpeechError: jest.fn(),
  onSpeechResults: jest.fn(),
  start: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  destroy: jest.fn(() => Promise.resolve()),
  removeAllListeners: jest.fn(),
};

jest.mock('@react-native-voice/voice', () => ({
  __esModule: true,
  default: mockVoice,
  ...mockVoice,
}));