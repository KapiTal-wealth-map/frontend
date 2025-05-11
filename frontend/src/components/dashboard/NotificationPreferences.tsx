import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';

interface NotificationSettings {
  email: {
    newProperties: boolean;
    ownershipChanges: boolean;
    valuationUpdates: boolean;
    weeklyDigest: boolean;
    securityAlerts: boolean;
  };
  inApp: {
    newProperties: boolean;
    ownershipChanges: boolean;
    valuationUpdates: boolean;
    teamActivity: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  email: {
    newProperties: true,
    ownershipChanges: true,
    valuationUpdates: false,
    weeklyDigest: true,
    securityAlerts: true,
  },
  inApp: {
    newProperties: true,
    ownershipChanges: true,
    valuationUpdates: true,
    teamActivity: true,
  },
};

const NotificationPreferences: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from the API
        // const response = await notificationAPI.getPreferences();
        // setSettings(response.data);
        
        // For now, we'll just use the default settings
        setTimeout(() => {
          setSettings(defaultSettings);
          setLoading(false);
        }, 500);
      } catch (err: any) {
        setError('Failed to load notification preferences');
        setLoading(false);
      }
    };
    
    fetchPreferences();
  }, []);
  
  const handleEmailToggle = (key: keyof typeof settings.email) => {
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        [key]: !settings.email[key],
      },
    });
  };
  
  const handleInAppToggle = (key: keyof typeof settings.inApp) => {
    setSettings({
      ...settings,
      inApp: {
        ...settings.inApp,
        [key]: !settings.inApp[key],
      },
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real app, this would save to the API
      // await notificationAPI.updatePreferences(settings);
      
      // For now, we'll just simulate a successful save
      setTimeout(() => {
        setSuccess('Notification preferences saved successfully');
        setSaving(false);
      }, 800);
    } catch (err: any) {
      setError('Failed to save notification preferences');
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
      
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
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">Email Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="email-new-properties"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.email.newProperties}
                onChange={() => handleEmailToggle('newProperties')}
              />
              <label htmlFor="email-new-properties" className="ml-3 text-sm text-gray-700">
                New properties in your saved search areas
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="email-ownership-changes"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.email.ownershipChanges}
                onChange={() => handleEmailToggle('ownershipChanges')}
              />
              <label htmlFor="email-ownership-changes" className="ml-3 text-sm text-gray-700">
                Ownership changes for tracked properties
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="email-valuation-updates"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.email.valuationUpdates}
                onChange={() => handleEmailToggle('valuationUpdates')}
              />
              <label htmlFor="email-valuation-updates" className="ml-3 text-sm text-gray-700">
                Valuation updates for tracked properties
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="email-weekly-digest"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.email.weeklyDigest}
                onChange={() => handleEmailToggle('weeklyDigest')}
              />
              <label htmlFor="email-weekly-digest" className="ml-3 text-sm text-gray-700">
                Weekly digest of market activity
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="email-security-alerts"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.email.securityAlerts}
                onChange={() => handleEmailToggle('securityAlerts')}
              />
              <label htmlFor="email-security-alerts" className="ml-3 text-sm text-gray-700">
                Security alerts (cannot be disabled)
              </label>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">In-App Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="inapp-new-properties"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.inApp.newProperties}
                onChange={() => handleInAppToggle('newProperties')}
              />
              <label htmlFor="inapp-new-properties" className="ml-3 text-sm text-gray-700">
                New properties in your saved search areas
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="inapp-ownership-changes"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.inApp.ownershipChanges}
                onChange={() => handleInAppToggle('ownershipChanges')}
              />
              <label htmlFor="inapp-ownership-changes" className="ml-3 text-sm text-gray-700">
                Ownership changes for tracked properties
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="inapp-valuation-updates"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.inApp.valuationUpdates}
                onChange={() => handleInAppToggle('valuationUpdates')}
              />
              <label htmlFor="inapp-valuation-updates" className="ml-3 text-sm text-gray-700">
                Valuation updates for tracked properties
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="inapp-team-activity"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.inApp.teamActivity}
                onChange={() => handleInAppToggle('teamActivity')}
              />
              <label htmlFor="inapp-team-activity" className="ml-3 text-sm text-gray-700">
                Team member activity
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationPreferences;