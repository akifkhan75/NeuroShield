
jest.mock('react-native-navigation', () => ({
  Navigation: {
    push: jest.fn(),
    pop: jest.fn(),
    showModal: jest.fn(),
    dismissModal: jest.fn(),
    events: () => ({
      bindComponent: jest.fn(() => ({
        remove: jest.fn(),
      })),
    }),
  },
}));

jest.mock('react-native-vector-icons/Feather', () => 'Icon');