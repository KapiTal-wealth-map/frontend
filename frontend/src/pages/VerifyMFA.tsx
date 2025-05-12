import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyMFA: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  
  if (!email) {
    // Redirect to login if no email is provided
    navigate('/login');
    return null;
  }
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    try {
      setLoading(true);
      const result = await authAPI.verifyMFA(email, code);
      
      // Store the token and user data
      login(result.token, result.user);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify MFA code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendEmailOTP = async () => {
    try {
      setLoading(true);
      await authAPI.sendEmailOTP(email);
      setShowEmailOtp(true);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email OTP');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    try {
      setLoading(true);
      const result = await authAPI.verifyEmailOTP(email, code);
      
      // Store the token and user data if available
      if (result.token && result.user) {
        login(result.token, result.user);
        navigate('/dashboard');
      } else {
        // If no token is returned, we might need additional steps
        setError('Verification successful but unable to login. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify email OTP');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showEmailOtp ? 'Enter Email OTP' : 'Two-Factor Authentication'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showEmailOtp 
              ? 'Enter the 6-digit code sent to your email' 
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
        
        {showEmailOtp ? (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyEmailOTP}>
            <div>
              <label htmlFor="email-otp" className="block text-sm font-medium text-gray-700">
                Email OTP
              </label>
              <input
                id="email-otp"
                name="email-otp"
                type="text"
                maxLength={6}
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Verifying...' : 'Verify Email OTP'}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowEmailOtp(false)}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Back to Authenticator
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerify}>
            <div>
              <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-700">
                Authentication Code
              </label>
              <input
                id="mfa-code"
                name="mfa-code"
                type="text"
                maxLength={6}
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleSendEmailOTP}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {loading ? 'Sending...' : 'Trouble accessing your authenticator? Get code via email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyMFA; 