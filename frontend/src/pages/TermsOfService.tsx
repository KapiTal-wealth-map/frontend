import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="prose max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Wealth Map. By accessing or using our service, you agree to be bound by these Terms of Service.
            Please read these terms carefully before using our platform.
          </p>
          
          <h2>2. Definitions</h2>
          <p>
            <strong>"Company"</strong> refers to the organization that has registered to use Wealth Map.<br />
            <strong>"Administrator"</strong> refers to users with administrative privileges within a Company account.<br />
            <strong>"Employee"</strong> refers to users invited by an Administrator to access the Company account.<br />
            <strong>"Platform"</strong> refers to the Wealth Map application, including all features and services.
          </p>
          
          <h2>3. Account Registration and Security</h2>
          <p>
            When registering for Wealth Map, you must provide accurate and complete information. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.
          </p>
          <p>
            We strongly recommend enabling multi-factor authentication (MFA) for enhanced account security. Administrators are required to implement appropriate security measures to protect Company data.
          </p>
          
          <h2>4. User Roles and Permissions</h2>
          <p>
            <strong>Administrators</strong> can:
          </p>
          <ul>
            <li>Invite and manage Employee accounts</li>
            <li>Set Company-wide data access permissions</li>
            <li>View all Employee activity and usage statistics</li>
            <li>Manage Company settings and information</li>
          </ul>
          <p>
            <strong>Employees</strong> can:
          </p>
          <ul>
            <li>Access the Platform according to permissions granted by Administrators</li>
            <li>Manage personal account settings and notification preferences</li>
            <li>View and interact with data as permitted by Company settings</li>
          </ul>
          
          <h2>5. Data Usage and Privacy</h2>
          <p>
            Wealth Map collects and processes data in accordance with our Privacy Policy. By using our Platform, you agree to our data handling practices as described in the Privacy Policy.
          </p>
          <p>
            Companies are responsible for ensuring they have appropriate rights to process any data they upload or access through the Platform, particularly when such data contains personal information.
          </p>
          
          <h2>6. Acceptable Use</h2>
          <p>
            You agree not to use the Platform to:
          </p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
            <li>Transmit malware, viruses, or other harmful code</li>
            <li>Interfere with or disrupt the integrity or performance of the Platform</li>
          </ul>
          
          <h2>7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the Platform if you violate these Terms of Service or if your actions pose a security risk to our Platform or other users.
          </p>
          
          <h2>8. Changes to Terms</h2>
          <p>
            We may modify these Terms of Service at any time. We will provide notice of significant changes through the Platform or by email. Your continued use of the Platform after such modifications constitutes your acceptance of the updated terms.
          </p>
          
          <h2>9. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at support@wealthmap.com.
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/register" className="text-indigo-600 hover:text-indigo-500">
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 