import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SetupMFA: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [setupMethod, setSetupMethod] = useState<'app' | 'email'>('app');
  const [emailSent, setEmailSent] = useState(false);
  
  useEffect(() => {
    if (setupMethod === 'app') {
      fetchMFASetup();
    }
  }, [setupMethod]);
  
  const fetchMFASetup = async () => {
    try {
      setLoading(true);
      const { mfaQrCode, mfaSecret } = await authAPI.setupMFA();
      setQrCode(mfaQrCode);
      setSecret(mfaSecret);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    try {
      setLoading(true);
      await authAPI.verifyMFA(user?.email || '', code);
      setSuccess('MFA has been successfully enabled for your account');
      
      // Update the user object to reflect MFA is enabled
      if (user) {
        setUser({
          ...user,
          mfaEnabled: true
        });
      }
      
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify MFA code');
    } finally {
      setLoading(false);
    }
  };
  
  const sendEmailOTP = async () => {
    try {
      setLoading(true);
      setError('');
      await authAPI.sendEmailOTP(user?.email || '');
      setEmailSent(true);
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
      await authAPI.verifyEmailOTP(user?.email || '', code);
      
      // Update the user object to reflect MFA is enabled
      if (user) {
        setUser({
          ...user,
          mfaEnabled: true
        });
      }
      
      setSuccess('MFA has been successfully enabled for your account using email verification');
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify email OTP');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDone = () => {
    navigate('/profile');
  };
  
  if (loading && !qrCode && setupMethod === 'app') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (step === 'verify' && success) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center mb-6">
          <svg className="mx-auto h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">MFA Enabled!</h2>
          <p className="mt-2 text-gray-600">
            Your account is now protected with multi-factor authentication.
          </p>
          <button 
            onClick={handleDone}
            className="mt-6 btn-primary"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Set Up Two-Factor Authentication</h2>
      
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

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setSetupMethod('app')}
            className={`px-4 py-2 font-medium rounded-md ${
              setupMethod === 'app'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Authenticator App
          </button>
          <button
            type="button"
            onClick={() => setSetupMethod('email')}
            className={`px-4 py-2 font-medium rounded-md ${
              setupMethod === 'email'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Email OTP
          </button>
        </div>
      </div>
      
      {setupMethod === 'app' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Step 1: Scan the QR Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan the QR code.
            </p>
            
            {qrCode && (
              <div className="border p-4 rounded-md flex justify-center bg-gray-50">
                <img src={qrCode} alt="MFA QR Code" className="h-48 w-48" />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Step 2: Enter the Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit code from your authenticator app to verify and enable MFA.
            </p>
            
            <form onSubmit={handleVerify}>
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Authentication Code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  maxLength={6}
                  className="mt-1 input-field"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
              </div>
              
              {secret && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Manual Entry Key (if QR scan doesn't work)
                  </label>
                  <div className="mt-1 p-2 bg-gray-100 rounded-md font-mono text-sm break-all">
                    {secret}
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary mt-4"
              >
                {loading ? 'Verifying...' : 'Verify and Enable'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verification</h3>
          <p className="text-sm text-gray-600 mb-4">
            We'll send a verification code to your email address. Enter the code below to enable MFA.
          </p>
          
          {!emailSent ? (
            <button
              onClick={sendEmailOTP}
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          ) : (
            <form onSubmit={handleVerifyEmailOTP}>
              <div className="mb-4">
                <label htmlFor="email-code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="email-code"
                  name="email-code"
                  maxLength={6}
                  className="mt-1 input-field"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary mt-4"
              >
                {loading ? 'Verifying...' : 'Verify and Enable'}
              </button>
              
              <button
                type="button"
                onClick={sendEmailOTP}
                className="w-full text-indigo-600 hover:text-indigo-500 text-sm mt-4"
              >
                Resend verification code
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default SetupMFA; 