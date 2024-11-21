// Mock para Firebase Auth
jest.mock("firebase/auth", () => ({
    getReactNativePersistence: jest.fn(),
    initializeAuth: jest.fn(),
}));

// Mock para AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
}));

// Mock do AuthContext
jest.mock("@/src/context/authContext", () => ({
    useAuth: jest.fn(),
}));

// Mock do Firebase Firestore
jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(() => ({
        docs: [],
        empty: true,
        forEach: jest.fn(),
    })),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    updateDoc: jest.fn(),
    doc: jest.fn((db, collection, id) => ({ db, collection, id })),
    serverTimestamp: jest.fn(() => "mock-timestamp"),
    arrayUnion: jest.fn(),
}));

// Mock do Expo Router
jest.mock("expo-router", () => ({
    useFocusEffect: jest.fn((callback) => callback()),
    router: {
        push: jest.fn(),
    },
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        canGoBack: jest.fn(() => true),
        back: jest.fn(),
    })),
    useLocalSearchParams: jest.fn(),
}));
