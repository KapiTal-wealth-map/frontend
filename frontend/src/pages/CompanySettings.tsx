import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { uploadLogo } from '../utils/supabase';
import CompanyLogo from '../components/common/CompanyLogo';

interface CompanySettings {
  name: string;
  logo: string | null;
  dataAccessSettings: {
    allowPublicProfileViewing: boolean;
    allowEmployeeDataExport: boolean;
    allowEmployeePropertySearch: boolean;
    restrictSensitiveData: boolean;
  };
}

const CompanySettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>({
    name: '',
    logo: null,
    dataAccessSettings: {
      allowPublicProfileViewing: false,
      allowEmployeeDataExport: false,
      allowEmployeePropertySearch: true,
      restrictSensitiveData: true,
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  useEffect(() => {
    fetchCompanySettings();
  }, []);
  
  const fetchCompanySettings = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getCompanySettings();
      const companyData = {
        name: data.company.name,
        logo: data.company.logo,
        dataAccessSettings: data.company.dataAccessSettings
      };
      setSettings(companyData);
      if (data.company.logo) {
        setLogoPreview(data.company.logo);
      }
    } catch (err: any) {
      console.log("error from company settings", err)
      setError(err.response?.data?.message || 'Failed to fetch company settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDataAccessToggle = (setting: keyof CompanySettings['dataAccessSettings']) => {
    setSettings(prev => ({
      ...prev,
      dataAccessSettings: {
        ...prev.dataAccessSettings,
        [setting]: !prev.dataAccessSettings[setting]
      }
    }));
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      name: e.target.value
    }));
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      let logoUrl = settings.logo;
      
      // If a new logo was selected, upload it to Supabase
      if (logoFile && user?.company) {
        const uploadedLogoUrl = await uploadLogo(logoFile, user.company);
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl;
        }
      }
      
      // Update company settings with the new data
      await userAPI.updateCompanySettings({
        name: settings.name,
        logoUrl: logoUrl ?? '',
        dataAccessSettings: settings.dataAccessSettings
      });
      
      setSuccess('Company settings updated successfully');
      
      // Update the preview with the new URL
      if (logoUrl) {
        setLogoPreview(logoUrl);
      }
      
      // Update settings state with the new logo URL
      setSettings(prev => ({
        ...prev,
        logo: logoUrl
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update company settings');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  const isAdmin = user?.role === 'admin';
  
  if (!isAdmin) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Company Settings</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <p className="mt-1 text-sm text-gray-900">{settings.name}</p>
              </div>
              
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">Company Logo</label>
                <div className="mt-1">
                  <CompanyLogo 
                    logoUrl={settings.logo}
                    companyName={settings.name}
                    size="large"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Your Access Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              These are your current access permissions in the platform.
            </p>
            
            <div className="mt-4 space-y-4">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={settings.dataAccessSettings.allowPublicProfileViewing}
                    disabled
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Public Profile Viewing</label>
                  <p className="text-gray-500">
                    {settings.dataAccessSettings.allowPublicProfileViewing 
                      ? "You can view public profiles of property owners."
                      : "You cannot view public profiles of property owners."}
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={settings.dataAccessSettings.allowEmployeeDataExport}
                    disabled
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Data Export</label>
                  <p className="text-gray-500">
                    {settings.dataAccessSettings.allowEmployeeDataExport
                      ? "You can export data from the platform."
                      : "You cannot export data from the platform."}
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={settings.dataAccessSettings.allowEmployeePropertySearch}
                    disabled
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Property Search</label>
                  <p className="text-gray-500">
                    {settings.dataAccessSettings.allowEmployeePropertySearch
                      ? "You can search for properties in the platform."
                      : "You cannot search for properties in the platform."}
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={settings.dataAccessSettings.restrictSensitiveData}
                    disabled
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">Sensitive Data Access</label>
                  <p className="text-gray-500">
                    {settings.dataAccessSettings.restrictSensitiveData
                      ? "You have restricted access to sensitive information like detailed wealth data or contact details."
                      : "You have full access to all data including sensitive information."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Company Settings</h2>
      
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
          <div>
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company-name"
                  id="company-name"
                  value={settings.name}
                  onChange={handleNameChange}
                  className="mt-1 input-field"
                />
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="company-logo" className="block text-sm font-medium text-gray-700">
                  Company Logo
                </label>
                <div className="mt-1 flex items-center">
                  <div className="mr-4">
                    <CompanyLogo 
                      logoUrl={logoPreview}
                      companyName={settings.name}
                      size="large"
                    />
                  </div>
                  <div>
                    <input
                      id="company-logo"
                      name="company-logo"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <label
                      htmlFor="company-logo"
                      className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      {settings.logo ? 'Change logo' : 'Upload logo'}
                    </label>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, or GIF up to 2MB. Recommended size: 128x128px.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Company-wide Data Access Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              These settings control how employees can access and interact with data in the platform.
            </p>
            
            <div className="mt-4 space-y-4">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="public-profile-viewing"
                    name="public-profile-viewing"
                    type="checkbox"
                    checked={settings.dataAccessSettings.allowPublicProfileViewing}
                    onChange={() => handleDataAccessToggle('allowPublicProfileViewing')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="public-profile-viewing" className="font-medium text-gray-700">
                    Allow Public Profile Viewing
                  </label>
                  <p className="text-gray-500">
                    When enabled, employees can view the public profiles of property owners.
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="employee-data-export"
                    name="employee-data-export"
                    type="checkbox"
                    checked={settings.dataAccessSettings.allowEmployeeDataExport}
                    onChange={() => handleDataAccessToggle('allowEmployeeDataExport')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="employee-data-export" className="font-medium text-gray-700">
                    Allow Employee Data Export
                  </label>
                  <p className="text-gray-500">
                    When enabled, employees can export data from the platform.
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="employee-property-search"
                    name="employee-property-search"
                    type="checkbox"
                    checked={settings.dataAccessSettings.allowEmployeePropertySearch}
                    onChange={() => handleDataAccessToggle('allowEmployeePropertySearch')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="employee-property-search" className="font-medium text-gray-700">
                    Allow Employee Property Search
                  </label>
                  <p className="text-gray-500">
                    When enabled, employees can search for properties in the platform.
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="restrict-sensitive-data"
                    name="restrict-sensitive-data"
                    type="checkbox"
                    checked={settings.dataAccessSettings.restrictSensitiveData}
                    onChange={() => handleDataAccessToggle('restrictSensitiveData')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="restrict-sensitive-data" className="font-medium text-gray-700">
                    Restrict Access to Sensitive Data
                  </label>
                  <p className="text-gray-500">
                    When enabled, sensitive information like detailed wealth data or contact details will be restricted to admin users only.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings; 