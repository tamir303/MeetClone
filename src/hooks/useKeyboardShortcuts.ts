import { useEffect } from 'react';
import { useMediaStore } from '../stores/mediaStore';
import { useChatStore } from '../stores/chatStore';
import { useMeetingStore } from '../stores/meetingStore';
import { KEYBOARD_SHORTCUTS } from '../constants';

export const useKeyboardShortcuts = () => {
  const { toggleAudio, toggleVideo, startScreenShare, stopScreenShare, isScreenSharing } = useMediaStore();
  const { togglePanel: toggleChat } = useChatStore();
  const { leaveMeeting } = useMeetingStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.code;
      const isCtrlPressed = event.ctrlKey || event.metaKey;
      const isShiftPressed = event.shiftKey;

      switch (key) {
        case KEYBOARD_SHORTCUTS.TOGGLE_MUTE:
          if (!isCtrlPressed && !isShiftPressed) {
            event.preventDefault();
            toggleAudio();
          }
          break;

        case KEYBOARD_SHORTCUTS.TOGGLE_VIDEO:
          if (isCtrlPressed && !isShiftPressed) {
            event.preventDefault();
            toggleVideo();
          }
          break;

        case KEYBOARD_SHORTCUTS.TOGGLE_CHAT:
          if (isCtrlPressed && isShiftPressed) {
            event.preventDefault();
            toggleChat();
          }
          break;

        case KEYBOARD_SHORTCUTS.LEAVE_MEETING:
          if (isCtrlPressed && isShiftPressed) {
            event.preventDefault();
            leaveMeeting();
          }
          break;

        case 'KeyS':
          if (isCtrlPressed && !isShiftPressed) {
            event.preventDefault();
            if (isScreenSharing) {
              stopScreenShare();
            } else {
              startScreenShare();
            }
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleAudio, toggleVideo, toggleChat, leaveMeeting, startScreenShare, stopScreenShare, isScreenSharing]);
};