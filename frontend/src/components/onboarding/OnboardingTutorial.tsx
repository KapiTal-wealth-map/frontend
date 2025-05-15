import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboard from '../../assets/onboarding/dashboard.png';
import orgMem from '../../assets/onboarding/orgMem.png';
import security from '../../assets/onboarding/security.png';
import notification from '../../assets/onboarding/notification.png';

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
}

const OnboardingTutorial: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps: TutorialStep[] = [
    {
      title: 'Welcome to Wealth Map!',
      description: 'This quick tutorial will help you get started with our platform. We\'ll show you how to navigate, find properties, and manage your account.',
      image: '/assets/onboarding/welcome.svg',
    },
    {
      title: 'Your Dashboard',
      description: 'Your dashboard provides an overview of your activity, saved searches, and quick access to all features. It\'s your command center for wealth mapping!',
      image: dashboard,
    },
    {
      title: 'Organization Members',
      description: 'Connect with your team and manage access levels. Administrators can invite new members and set permissions.',
      image: orgMem,
    },
    {
      title: 'Security Features',
      description: 'We take security seriously. Set up multi-factor authentication in your profile settings to protect your account.',
      image: security,
    },
    {
      title: 'Notification Preferences',
      description: 'Stay informed about important updates. Customize your notification preferences to receive only the alerts that matter to you.',
      image: notification,
    },
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial is complete, redirect to dashboard
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    // Skip the tutorial and go directly to dashboard
    navigate('/dashboard');
  };
  
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full space-y-8">
          {/* Progress indicator */}
          <div className="w-full flex justify-center">
            <div className="flex items-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentStep
                      ? 'bg-indigo-600'
                      : index < currentStep
                      ? 'bg-indigo-300'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Step content */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                {steps[currentStep].title}
              </h2>
              
              {steps[currentStep].image && (
                <div className="mt-6 flex justify-center">
                  <img
                    src={steps[currentStep].image}
                    alt={steps[currentStep].title}
                    className="h-48 w-auto object-contain"
                  />
                </div>
              )}
              
              <p className="mt-4 text-center text-gray-600">
                {steps[currentStep].description}
              </p>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-between">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Skip tutorial
              </button>
              {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back
              </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial; 