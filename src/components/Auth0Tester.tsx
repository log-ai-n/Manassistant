import React, { useEffect, useState } from 'react';
import { fetchAuth0Users } from '../lib/supabase';
import Auth0UserComparison from './Auth0UserComparison';
import Auth0PermissionMapping from './Auth0PermissionMapping';

/**
 * Comprehensive Auth0 dashboard for testing and managing Auth0 integration
 */
const Auth0Tester: React.FC = () => {
  const [userData, setUserData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'users' | 'comparison' | 'permissions'>('users');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Environment toggle state
  const [environment, setEnvironment] = useState<'development' | 'production'>('development');

  const fetchUsers = async (options = {}) => {
    setLoading(true);
    
    try {
      const { data, error, count } = await fetchAuth0Users({
        searchTerm,
        sortBy,
        sortDirection,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        ...options
      });
      
      if (error) {
        setError(typeof error === 'string' ? error : 
          (error as any).message || 'Failed to fetch Auth0 users');
      } else if (data) {
        setUserData(data);
        if (typeof count === 'number') setTotalCount(count);
      }
    } catch (err) {
      console.error('Error in Auth0 test component:', err);
      setError('Unexpected error fetching Auth0 users');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, sortBy, sortDirection, environment]);
  
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchUsers();
  };
  
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column with default desc direction
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  const handleEnvironmentChange = (env: 'development' | 'production') => {
    setEnvironment(env);
    // In a real implementation, you would switch the API endpoints or connection settings here
  };
  
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  const renderPagination = () => {
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center">
          <span className="mr-2">Rows per page:</span>
          <select 
            className="border rounded px-2 py-1"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <button 
            className="px-2 py-1 border rounded mr-1 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          
          <span className="mx-2">
            Page {currentPage} of {totalPages || 1}
          </span>
          
          <button 
            className="px-2 py-1 border rounded ml-1 disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {userData.length} of {totalCount} users
        </div>
      </div>
    );
  };
  
  const renderUserDataTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to search
            </p>
          </div>
          
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSearch}
          >
            Search
          </button>
          
          <button
            className="px-4 py-2 border rounded hover:bg-gray-100"
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
              fetchUsers({ searchTerm: '' });
            }}
          >
            Clear
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="animate-pulse text-center p-8">
          <div className="inline-block h-8 w-8 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <p className="mt-2">Loading Auth0 user data...</p>
        </div>
      ) : userData.length === 0 ? (
        <div className="text-center p-8 border rounded bg-gray-50">
          <p className="text-lg">No Auth0 user data found</p>
          <p className="text-sm text-gray-500 mt-2">
            This could mean your Auth0 wrapper is configured correctly but there are no users,
            or there might be an issue with permissions or configuration.
          </p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {userData[0] && Object.keys(userData[0]).map(key => (
                    <th 
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(key)}
                    >
                      {key} {getSortIcon(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userData.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {Object.entries(user).map(([key, value]) => (
                      <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof value === 'object' 
                          ? JSON.stringify(value).slice(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '')
                          : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {renderPagination()}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Auth0 Integration Dashboard</h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Environment:</span>
            <div className="flex border rounded overflow-hidden">
              <button
                className={`px-3 py-1 text-sm ${environment === 'development' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100'}`}
                onClick={() => handleEnvironmentChange('development')}
              >
                Development
              </button>
              <button
                className={`px-3 py-1 text-sm ${environment === 'production' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100'}`}
                onClick={() => handleEnvironmentChange('production')}
              >
                Production
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          This dashboard displays and manages Auth0 user data via Supabase's foreign data wrapper.
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <p className="mt-2 text-sm">
              Make sure you've configured the Auth0 wrapper in Supabase according to the 
              <a 
                href="https://supabase.com/docs/guides/database/extensions/wrappers/auth0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline ml-1"
              >
                documentation
              </a>.
            </p>
          </div>
        )}
      </div>
      
      {/* Tabs for different views */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b">
          <nav className="flex">
            <button 
              className={`px-4 py-2 ${activeTab === 'users' 
                ? 'border-b-2 border-blue-500 font-medium text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('users')}
            >
              User Data
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'comparison' 
                ? 'border-b-2 border-blue-500 font-medium text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('comparison')}
            >
              Comparison View
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'permissions' 
                ? 'border-b-2 border-blue-500 font-medium text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('permissions')}
            >
              Permission Mapping
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'users' && renderUserDataTab()}
          {activeTab === 'comparison' && <Auth0UserComparison auth0Users={userData} />}
          {activeTab === 'permissions' && <Auth0PermissionMapping />}
        </div>
      </div>
    </div>
  );
};

export default Auth0Tester;