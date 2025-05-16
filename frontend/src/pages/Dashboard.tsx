import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TeamMembers from '../components/team/TeamMembers';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import CompanyLogo from '../components/common/CompanyLogo';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  actionType: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

interface ActivityStats {
  totalActivities: number;
  actionTypeDistribution: { [key: string]: number };
  dailyActivities: { date: string; count: number }[];
  userActivityDistribution: { [key: string]: number };
}

interface CompanyData {
  name: string;
  logo: string | null;

}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'organization' | 'propertyMap'>('overview');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    actionTypeDistribution: {},
    dailyActivities: [],
    userActivityDistribution: {}
  });
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyResponse, activitiesResponse] = await Promise.all([
          userAPI.getCompanySettings(),
          isAdmin ? userAPI.getActivityLogs('limit=5') : Promise.resolve([])
        ]);
        const companyResponseData = {
          name: companyResponse.company.name,
          logo: companyResponse.company.logo,
        }
        setCompanyData(companyResponseData);
        setRecentActivities(activitiesResponse);

        if (isAdmin) {
          // Calculate statistics from activities
          const allActivities = await userAPI.getActivityLogs();
          const actionTypeCount: { [key: string]: number } = {};
          const userActivityCount: { [key: string]: number } = {};
          const dailyCount: { [key: string]: number } = {};

          allActivities.forEach((activity: ActivityLog) => {
            // Count action types
            actionTypeCount[activity.actionType] = (actionTypeCount[activity.actionType] || 0) + 1;
            
            // Count user activities
            userActivityCount[activity.userName] = (userActivityCount[activity.userName] || 0) + 1;
            
            // Count daily activities
            const date = new Date(activity.timestamp).toISOString().split('T')[0];
            dailyCount[date] = (dailyCount[date] || 0) + 1;
          });

          // Convert daily counts to array and sort by date
          const dailyActivities = Object.entries(dailyCount)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7); // Get last 7 days

          setStats({
            totalActivities: allActivities.length,
            actionTypeDistribution: actionTypeCount,
            dailyActivities,
            userActivityDistribution: userActivityCount
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAdmin]);

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const actionTypeChartData = {
    labels: Object.keys(stats.actionTypeDistribution),
    datasets: [
      {
        data: Object.values(stats.actionTypeDistribution),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // blue
          'rgba(16, 185, 129, 0.8)',  // green
          'rgba(245, 158, 11, 0.8)',  // yellow
          'rgba(239, 68, 68, 0.8)',   // red
          'rgba(139, 92, 246, 0.8)',  // purple
        ],
        borderWidth: 1,
      },
    ],
  };

  const dailyActivityChartData = {
    labels: stats.dailyActivities.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        label: 'Activities',
        data: stats.dailyActivities.map(d => d.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

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
            <button
              onClick={() => setActiveTab('propertyMap')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'propertyMap'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Property Map
            </button>
          </div>
        </div>
        
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {isAdmin && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Activities</span>
                      <span className="text-2xl font-semibold text-gray-900">{stats.totalActivities}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Active Users</span>
                      <span className="text-2xl font-semibold text-gray-900">
                        {Object.keys(stats.userActivityDistribution).length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Types</h3>
                  <div className="h-64">
                    <Pie data={actionTypeChartData} options={chartOptions} />
                  </div>
                </div>
              
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity</h3>
                  <div className="h-64">
                    <Bar data={dailyActivityChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isAdmin && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${getActionTypeColor(activity.actionType)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{activity.userName}</span>
                            <span>•</span>
                            <span>{formatDate(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to="/activity-logs"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View all activity logs →
                    </Link>
                  </div>
                </div>
              )}

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-4">
                  {isAdmin && (
                    <Link
                      to="/invite"
                      className="block px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                    >
                      Invite Team Members
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    Update Profile
                  </Link>
                  <Link
                    to="/company-settings"
                    className="block px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    Company Settings
                  </Link>
                  <Link
                    to="/wealth-map"
                    className="block px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                  >
                    Launch Wealth Map
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'organization' ? (
          <TeamMembers />
        ) : (
          <div className="p-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Wealth Map</h3>
              <p className="text-gray-600">Explore property values, owner wealth distribution, and market trends.</p>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <Link 
                to="/wealth-map" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                </svg>
                Full Interactive Map
              </Link>
              
              <Link 
                to="/property-map" 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Property Listings
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Property Search</h4>
                <p className="text-sm text-gray-600 mb-3">Find properties by location, value, or owner details.</p>
                <Link 
                  to="/wealth-map" 
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Start searching →
                </Link>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Wealth Distribution</h4>
                <p className="text-sm text-gray-600 mb-3">Analyze wealth patterns with our interactive heat map.</p>
                <Link 
                  to="/wealth-map" 
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View heat map →
                </Link>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Saved Searches</h4>
                <p className="text-sm text-gray-600 mb-3">Access your saved property searches and filters.</p>
                <Link 
                  to="/wealth-map" 
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View saved searches →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;