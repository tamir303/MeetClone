import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Shield } from 'lucide-react';
import { Button } from '../components/UI/Button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [joinMeetingId, setJoinMeetingId] = useState('');

  const handleCreateMeeting = () => {
    navigate('/create');
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinMeetingId.trim()) {
      navigate(`/join/${joinMeetingId.trim()}`);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Video className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">MeetClone</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Video meetings for
              <span className="text-blue-600"> everyone</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              Connect, collaborate, and create together with high-quality video calls
              that work seamlessly across all your devices.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto">
            <div className="relative bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <Video className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">New Meeting</h3>
                  <p className="text-sm text-gray-500">Start an instant meeting</p>
                </div>
              </div>
              <Button
                  onClick={handleCreateMeeting}
                  className="w-full py-3 text-lg font-medium"
              >
                Start Meeting
              </Button>
            </div>

            <div className="relative bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Join Meeting</h3>
                  <p className="text-sm text-gray-500">Enter a meeting ID</p>
                </div>
              </div>
              <form onSubmit={handleJoinMeeting} className="space-y-4">
                <input
                    type="text"
                    value={joinMeetingId}
                    onChange={(e) => setJoinMeetingId(e.target.value)}
                    placeholder="Enter meeting ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                    type="submit"
                    variant="secondary"
                    disabled={!joinMeetingId.trim()}
                    className="w-full py-3 text-lg font-medium"
                >
                  Join
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-24">
            <div className="text-center">
              <h3 className="text-3xl font-extrabold text-gray-900">
                Everything you need for great meetings
              </h3>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mx-auto">
                  <Video className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="mt-4 text-lg font-medium text-gray-900">HD Video & Audio</h4>
                <p className="mt-2 text-gray-500">
                  Crystal-clear video and audio quality for professional meetings
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="mt-4 text-lg font-medium text-gray-900">Up to 50 Participants</h4>
                <p className="mt-2 text-gray-500">
                  Host large meetings with up to 50 participants at once
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mx-auto">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="mt-4 text-lg font-medium text-gray-900">Secure & Private</h4>
                <p className="mt-2 text-gray-500">
                  End-to-end encryption keeps your meetings safe and private
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
};