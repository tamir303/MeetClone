import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { jest } from '@jest/globals';
import "globals"

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock WebRTC APIs
Object.defineProperty(global, 'navigator', {
    value: {
        mediaDevices: {
            getUserMedia: jest.fn(),
            getDisplayMedia: jest.fn(),
            enumerateDevices: jest.fn(),
        },
    },
    writable: true,
});

// Mock RTCPeerConnection
global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
    createOffer: jest.fn(),
    createAnswer: jest.fn(),
    setLocalDescription: jest.fn(),
    setRemoteDescription: jest.fn(),
    addIceCandidate: jest.fn(),
    addTrack: jest.fn(),
    close: jest.fn(),
    onicecandidate: null,
    ontrack: null,
    onconnectionstatechange: null,
    connectionState: 'connected',
    iceConnectionState: 'connected',
}));

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
    createAnalyser: jest.fn(() => ({
        fftSize: 256,
        frequencyBinCount: 128,
        getByteFrequencyData: jest.fn(),
    })),
    createMediaStreamSource: jest.fn(() => ({
        connect: jest.fn(),
    })),
    close: jest.fn(),
    state: 'running',
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = {
    pathname: '/',
    search: '',
    hash: '',
    href: 'http://localhost:3000/',
} as Location;

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
    io: jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        connected: true,
    })),
}));

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
});