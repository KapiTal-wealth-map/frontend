import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
      
      <div className="prose max-w-none">
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing or using the Wealth Map service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
        </p>
        
        <h3>2. Description of Service</h3>
        <p>
          Wealth Map provides a real estate data visualization platform that helps users identify property ownership patterns and wealth concentration across regions. The platform combines property data, ownership information, and wealth metrics to create an intuitive, interactive map interface.
        </p>
        
        <h3>3. User Accounts</h3>
        <p>
          To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
        </p>
        
        <h3>4. Privacy</h3>
        <p>
          Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
        </p>
        
        <h3>5. Data Usage</h3>
        <p>
          The data provided through our Service is for informational purposes only. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the data.
        </p>
        
        <h3>6. Prohibited Uses</h3>
        <p>
          You agree not to use the Service for any illegal purpose or in violation of any local, state, national, or international law. You also agree not to:
        </p>
        <ul>
          <li>Scrape, crawl, or spider any content from the Service</li>
          <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
          <li>Attempt to gain unauthorized access to the Service, user accounts, or computer systems</li>
          <li>Use the Service for any commercial purpose without our prior written consent</li>
        </ul>
        
        <h3>7. Termination</h3>
        <p>
          We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the Service, us, or third parties, or for any other reason.
        </p>
        
        <h3>8. Changes to Terms</h3>
        <p>
          We reserve the right to modify these Terms of Service at any time. We will provide notice of any material changes by posting the new Terms of Service on the Site and/or by sending you an email. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms of Service.
        </p>
        
        <h3>9. Contact</h3>
        <p>
          If you have any questions about these Terms, please contact us at support@wealthmap.example.com.
        </p>
      </div>
      
      <div className="mt-6">
        <Link to="/register" className="btn-primary inline-block">
          Back to Registration
        </Link>
      </div>
    </div>
  );
};

export default TermsOfService;