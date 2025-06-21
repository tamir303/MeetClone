import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useMeetingStore } from '../../stores/meetingStore';
import { useParticipantsStore } from '../../stores/participantsStore';

interface JoinMeetingProps {
    meetingId: string;
}

export const JoinMeeting: React.FC<JoinMeetingProps> = ({ meetingId }) => {
    const navigate = useNavigate();
    const { setMeeting } = useMeetingStore();
    const { setLocalParticipant } = useParticipantsStore();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
    });
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleJoinMeeting = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.displayName.trim()) {
            setError('Display name is required');
            return;
        }

        setIsJoining(true);
        setError(null);

        try {
            // Check device capabilities
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideo = devices.some(device => device.kind === 'videoinput');
            const hasAudio = devices.some(device => device.kind === 'audioinput');

            const response = await api.joinMeeting(meetingId, {
                displayName: formData.displayName.trim(),
                email: formData.email || undefined,
                deviceCapabilities: {
                    video: hasVideo,
                    audio: hasAudio,
                    screenShare: 'getDisplayMedia' in navigator.mediaDevices,
                },
            });

            // Store meeting and participant data
            setMeeting(response.meeting);

            // Find current participant in meeting data
            const currentParticipant = response.meeting.participants.find(
                p => p.id === response.participantId
            );

            if (currentParticipant) {
                setLocalParticipant(currentParticipant);
            }

            // Navigate to meeting room
            navigate(`/meeting/${meetingId}`);

        } catch (error) {
            console.error('Error joining meeting:', error);
            setError(error instanceof Error ? error.message : 'Failed to join meeting');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">
                    Join Meeting
                </h1>

                <form onSubmit={handleJoinMeeting} className="space-y-4">
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                            Display Name *
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your name"
                            required
                            disabled={isJoining}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email (optional)
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your email"
                            disabled={isJoining}
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isJoining || !formData.displayName.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition duration-200"
                    >
                        {isJoining ? 'Joining...' : 'Join Meeting'}
                    </button>
                </form>
            </div>
        </div>
    );
};