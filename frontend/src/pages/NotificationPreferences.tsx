import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';

interface NotificationSettings {
  email: boolean;
  inApp: boolean;
}

const NotificationPreferences: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    inApp: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    fetchNotificationPreferences();
  }, []);
  
  const fetchNotificationPreferences = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getPreferences();
      setSettings(data);
    } catch (err: any) {
      // If no preferences are saved yet, we'll use defaults
      if (err.response && err.response.status !== 404) {
        setError(err.response?.data?.message || 'Failed to fetch notification preferences');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggle = (setting: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await notificationAPI.updatePreferences(settings);
      setSuccess('Notification preferences updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className='mt-6'>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="email-notifications"
                name="emailNotifications"
                type="checkbox"
                checked={settings.email}
                onChange={() => handleToggle('email')}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="email-notifications" className="font-medium text-gray-700">Email Notifications</label>
              <p className="text-gray-500">Receive notifications about account activity via email.</p>
            </div>
          </div>
          
         
          
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="app-notifications"
                name="appNotifications"
                type="checkbox"
                checked={settings.inApp}
                onChange={() => handleToggle('inApp')}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="app-notifications" className="font-medium text-gray-700">In-App Notifications</label>
              <p className="text-gray-500">Receive notifications within the application.</p>
            </div>
          </div>
        
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NotificationPreferences; 