import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../stores/meetingStore';
import { MeetingSettings } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const CreateMeeting: React.FC = () => {
    const navigate = useNavigate();
    const { createMeeting, isLoading, error } = useMeetingStore();

    const [formData, setFormData] = useState({
        title: '',
        hostName: '',
    });

    const [settings, setSettings] = useState<MeetingSettings>({
        allowParticipantMicrophone: true,
        allowParticipantCamera: true,
        allowScreenShare: true,
        allowChat: true,
        allowRecording: false,
        maxParticipants: 50,
        requireApproval: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        if (Object.keys(settings).includes(name)) {
            setSettings(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleCreateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.hostName.trim()) {
            return;
        }

        try {
            const hostId = uuidv4();
            const meeting = await createMeeting(
                formData.title || 'Untitled Meeting',
                hostId,
                settings
            );

            localStorage.setItem('hostId', hostId);
            localStorage.setItem('hostName', formData.hostName);

            navigate(`/join/${meeting.id}`);
        } catch (error) {
            console.error('Error creating meeting:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">
                    Create New Meeting
                </h1>

                <form onSubmit={handleCreateMeeting} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                                Meeting Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter meeting title"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="hostName" className="block text-sm font-medium text-gray-300 mb-2">
                                Your Name *
                            </label>
                            <input
                                type="text"
                                id="hostName"
                                name="hostName"
                                value={formData.hostName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your name"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-white mb-4">Meeting Settings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2 text-gray-300">
                                <input
                                    type="checkbox"
                                    name="allowParticipantMicrophone"
                                    checked={settings.allowParticipantMicrophone}
                                    onChange={handleInputChange}
                                    className="rounded bg-gray-700 border-gray-600"
                                    disabled={isLoading}
                                />
                                <span>Allow participant microphones</span>
                            </label>

                            <label className="flex items-center space-x-2 text-gray-300">
                                <input
                                    type="checkbox"
                                    name="allowParticipantCamera"
                                    checked={settings.allowParticipantCamera}
                                    onChange={handleInputChange}
                                    className="rounded bg-gray-700 border-gray-600"
                                    disabled={isLoading}
                                />
                                <span>Allow participant cameras</span>
                            </label>

                            <label className="flex items-center space-x-2 text-gray-300">
                                <input
                                    type="checkbox"
                                    name="allowScreenShare"
                                    checked={settings.allowScreenShare}
                                    onChange={handleInputChange}
                                    className="rounded bg-gray-700 border-gray-600"
                                    disabled={isLoading}
                                />
                                <span>Allow screen sharing</span>
                            </label>

                            <label className="flex items-center space-x-2 text-gray-300">
                                <input
                                    type="checkbox"
                                    name="allowChat"
                                    checked={settings.allowChat}
                                    onChange={handleInputChange}
                                    className="rounded bg-gray-700 border-gray-600"
                                    disabled={isLoading}
                                />
                                <span>Allow chat</span>
                            </label>

                            <label className="flex items-center space-x-2 text-gray-300">
                                <input
                                    type="checkbox"
                                    name="allowRecording"
                                    checked={settings.allowRecording}
                                    onChange={handleInputChange}
                                    className="rounded bg-gray-700 border-gray-600"
                                    disabled={isLoading}
                                />
                                <span>Allow recording</span>
                            </label>

                            <label className="flex items-center space-x-2 text-gray-300">
                                <input
                                    type="checkbox"
                                    name="requireApproval"
                                    checked={settings.requireApproval}
                                    onChange={handleInputChange}
                                    className="rounded bg-gray-700 border-gray-600"
                                    disabled={isLoading}
                                />
                                <span>Require approval to join</span>
                            </label>
                        </div>

                        <div className="mt-4">
                            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-300 mb-2">
                                Maximum Participants
                            </label>
                            <input
                                type="number"
                                id="maxParticipants"
                                name="maxParticipants"
                                value={settings.maxParticipants}
                                onChange={handleInputChange}
                                min="2"
                                max="500"
                                className="w-full md:w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !formData.hostName.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition duration-200"
                    >
                        {isLoading ? 'Creating Meeting...' : 'Create Meeting'}
                    </button>
                </form>
            </div>
        </div>
    );
};