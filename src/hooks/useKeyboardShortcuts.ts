import { useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';

export const useKeyboardShortcuts = () => {
  const { togglePanel: toggleChat } = useChatStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.code;
      const isCtrlPressed = event.ctrlKey || event.metaKey;
      const isShiftPressed = event.shiftKey;

      switch (key) {
        case 'Space':
          if (!isCtrlPressed && !isShiftPressed) {
            event.preventDefault();
            // Toggle mute functionality would go here
          }
          break;

        case 'KeyE':
          if (isCtrlPressed && !isShiftPressed) {
            event.preventDefault();
            // Toggle video functionality would go here
          }
          break;

        case 'KeyH':
          if (isCtrlPressed && isShiftPressed) {
            event.preventDefault();
            toggleChat();
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleChat]);
};