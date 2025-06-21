import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CreateMeeting } from './components/Meeting/CreateMeeting';
import { JoinMeeting } from './components/Meeting/JoinMeeting';
import { MeetingRoom } from './components/Meeting/MeetingRoom';
import { useUIStore } from './stores/uiStore';

function App() {
    const { theme } = useUIStore();

    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateMeeting />} />
            <Route path="/join/:meetingId" element={<JoinMeetingWrapper />} />
            <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

const JoinMeetingWrapper: React.FC = () => {
    const { meetingId } = useParams<{ meetingId: string }>();

    if (!meetingId) {
        return <Navigate to="/" replace />;
    }

    return <JoinMeeting meetingId={meetingId} />;
};

export default App;