export const env = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'MeetClone',
    NODE_ENV: import.meta.env.NODE_ENV || 'development',
} as const;