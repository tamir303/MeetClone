import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { LayoutType, Theme } from '@/types';

interface UIState {
    sidebarOpen: boolean;
    chatOpen: boolean;
    participantsOpen: boolean;
    settingsOpen: boolean;
    fullscreen: boolean;
    theme: Theme;
    layout: LayoutType;
    isControlBarVisible: boolean;
    notifications: boolean;

    toggleSidebar: () => void;
    toggleChat: () => void;
    toggleParticipants: () => void;
    toggleSettings: () => void;
    setLayout: (layout: LayoutType) => void;
    toggleTheme: () => void;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
    toggleFullscreen: () => void;
    setControlBarVisible: (visible: boolean) => void;
    toggleNotifications: () => void;
    closeAllPanels: () => void;
}

export const useUIStore = create<UIState>()(
    devtools(
        persist(
            (set, get) => ({
                sidebarOpen: false,
                chatOpen: false,
                participantsOpen: false,
                settingsOpen: false,
                fullscreen: false,
                theme: 'light',
                layout: 'grid',
                isControlBarVisible: true,
                notifications: true,

                toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),

                toggleChat: () => set(state => ({ chatOpen: !state.chatOpen })),

                toggleParticipants: () => set(state => ({ participantsOpen: !state.participantsOpen })),

                toggleSettings: () => set(state => ({ settingsOpen: !state.settingsOpen })),

                setLayout: (layout) => set({ layout }),

                toggleTheme: () => {
                    set(state => {
                        const newTheme = state.theme === 'light' ? 'dark' : 'light';
                        document.documentElement.classList.toggle('dark', newTheme === 'dark');
                        return { theme: newTheme };
                    });
                },

                enterFullscreen: () => {
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen();
                        set({ fullscreen: true });
                    }
                },

                exitFullscreen: () => {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                        set({ fullscreen: false });
                    }
                },

                toggleFullscreen: () => {
                    const { fullscreen } = get();
                    if (fullscreen) {
                        get().exitFullscreen();
                    } else {
                        get().enterFullscreen();
                    }
                },

                setControlBarVisible: (visible) => set({ isControlBarVisible: visible }),

                toggleNotifications: () => set(state => ({ notifications: !state.notifications })),

                closeAllPanels: () => {
                    set({
                        sidebarOpen: false,
                        chatOpen: false,
                        participantsOpen: false,
                        settingsOpen: false
                    });
                }
            }),
            {
                name: 'ui-store',
                partialize: (state) => ({
                    theme: state.theme,
                    layout: state.layout,
                    notifications: state.notifications
                })
            }
        ),
        { name: 'ui-store' }
    )
);