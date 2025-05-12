import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TeamMembers from '../components/team/TeamMembers';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import CompanyLogo from '../components/common/CompanyLogo';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'organization'>('overview');
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    // Fetch company data when component mounts
    const fetchCompanyData = async () => {
      try {
        const response = await userAPI.getCompanySettings();
        setCompanyData(response.company);
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyData();
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <CompanyLogo 
              logoUrl={companyData?.logo || null}
              companyName={companyData?.name || 'Company'}
              size="medium"
            />
            <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('organization')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'organization'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Organization
            </button>
          </div>
        </div>
        
        {activeTab === 'overview' ? (
          <div>
            <div className="flex items-center mb-6">
              <p className="text-gray-600">
                Hello, {user?.name || 'User'}! This is your company dashboard where you can manage your Wealth Map account.
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Properties Tracked
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            0
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-100 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-700 hover:text-blue-900">
                      View all
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Saved Searches
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            0
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-green-100 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-green-700 hover:text-green-900">
                      View all
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Organization Members
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {/* This would be dynamically populated */}
                            {isAdmin ? (
                              <>1</>
                            ) : (
                              <>-</>
                            )}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 px-5 py-3">
                  <div className="text-sm">
                    {isAdmin ? (
                      <Link to="/invite" className="font-medium text-purple-700 hover:text-purple-900">
                        Invite members
                      </Link>
                    ) : (
                      <button 
                        onClick={() => setActiveTab('organization')}
                        className="font-medium text-purple-700 hover:text-purple-900"
                      >
                        View organization
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center py-2">
                  <div className="bg-gray-100 rounded-full p-2 mr-4">
                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account created</p>
                    <p className="text-sm text-gray-500">Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <TeamMembers />
        )}
      </div>
    </div>
  );
};

export default Dashboard;