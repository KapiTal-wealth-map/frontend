import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Link } from 'react-router-dom';
import NotificationPreferences from './NotificationPreferences'; // adjust the path if needed


interface ProfileData {
  name: string;
  email: string;
}

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const updatedUser = await userAPI.updateProfile({
        name: profileData.name,
      });
      
      setUser({
        ...user!,
        name: updatedUser.name,
      });
      
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Profile</h2>
      
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
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={profileData.email}
              disabled
              className="mt-1 input-field bg-gray-100"
            />
            <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={profileData.name}
              onChange={handleChange}
              className="mt-1 input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="role">
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={user.role}
              disabled
              className="mt-1 input-field bg-gray-100"
              aria-label="User role"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
      
      <div className="mt-10 pt-10 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
        <NotificationPreferences />
        
      </div>
      <div className="mt-10 pt-10 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        
        <div className="mt-6">
          <div className="flex items-start">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication (2FA)</h4>
              <p className="mt-1 text-sm text-gray-500">
                Add an extra layer of security to your account by requiring a verification code whenever you sign in.
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              {user.mfaEnabled ? (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Enabled
                </span>
              ) : (
                <Link
                  to="/setup-mfa"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Enable
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 