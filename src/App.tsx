import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { MeetingLobby } from './components/Meeting/MeetingLobby';
import { MeetingRoom } from './components/Meeting/MeetingRoom';
import { useMeetingStore } from './stores/meetingStore';
import { useUIStore } from './stores/uiStore';

function App() {
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);
  const [inLobby, setInLobby] = useState(false);
  
  const { isJoined } = useMeetingStore();
  const { theme } = useUIStore();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleCreateMeeting = (meetingId: string) => {
    setCurrentMeetingId(meetingId);
    setInLobby(true);
  };

  const handleJoinMeeting = (meetingId: string) => {
    setCurrentMeetingId(meetingId);
    setInLobby(true);
  };

  const handleJoinFromLobby = () => {
    setInLobby(false);
  };

  const handleLeaveMeeting = () => {
    setCurrentMeetingId(null);
    setInLobby(false);
  };

  // Reset meeting state when leaving
  React.useEffect(() => {
    if (!isJoined && currentMeetingId && !inLobby) {
      handleLeaveMeeting();
    }
  }, [isJoined, currentMeetingId, inLobby]);

  if (currentMeetingId && inLobby) {
    return (
      <MeetingLobby
        meetingId={currentMeetingId}
        onJoin={handleJoinFromLobby}
      />
    );
  }

  if (currentMeetingId && isJoined && !inLobby) {
    return <MeetingRoom meetingId={currentMeetingId} />;
  }

  return (
    <HomePage
      onCreateMeeting={handleCreateMeeting}
      onJoinMeeting={handleJoinMeeting}
    />
  );
}

export default App;