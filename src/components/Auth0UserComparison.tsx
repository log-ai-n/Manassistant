import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface UserComparison {
  auth0User: any;
  supabaseUser: any | null;
  status: 'synced' | 'not-synced' | 'missing';
}

/**
 * Component that compares Auth0 users with Supabase users
 * to check synchronization status
 */
const Auth0UserComparison: React.FC<{
  auth0Users: any[];
}> = ({ auth0Users }) => {
  const [comparisonData, setComparisonData] = useState<UserComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const compareUsers = async () => {
      setLoading(true);
      
      try {
        if (!auth0Users.length) {
          setComparisonData([]);
          return;
        }
        
        // Extract emails from Auth0 users to query Supabase
        const emails = auth0Users
          .filter(user => user.email)
          .map(user => user.email);
        
        // Query Supabase for users with matching emails
        const { data: supabaseUsers, error } = await supabase
          .from('profiles')
          .select('*')
          .in('email', emails);
        
        if (error) throw error;
        
        // Create comparison data
        const comparison = auth0Users.map(auth0User => {
          const matchingSupabaseUser = supabaseUsers?.find(
            supaUser => supaUser.email === auth0User.email
          );
          
          return {
            auth0User,
            supabaseUser: matchingSupabaseUser || null,
            status: matchingSupabaseUser 
              ? (isSynced(auth0User, matchingSupabaseUser) ? 'synced' : 'not-synced')
              : 'missing'
          } as UserComparison;
        });
        
        setComparisonData(comparison);
      } catch (err) {
        console.error('Error comparing users:', err);
        setError('Failed to compare users between Auth0 and Supabase');
      } finally {
        setLoading(false);
      }
    };
    
    compareUsers();
  }, [auth0Users]);
  
  // Check if Auth0 user data is synced with Supabase user data
  const isSynced = (auth0User: any, supabaseUser: any): boolean => {
    // Basic checks - you would customize this based on your data structure
    return (
      auth0User.email === supabaseUser.email &&
      (auth0User.name === supabaseUser.full_name || 
       (auth0User.name === null && supabaseUser.full_name === null))
    );
  };
  
  // Get sync status label and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'synced':
        return { label: 'Synced', color: 'bg-green-100 text-green-800' };
      case 'not-synced':
        return { label: 'Out of Sync', color: 'bg-yellow-100 text-yellow-800' };
      case 'missing':
        return { label: 'Missing in Supabase', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-4">User Synchronization Status</h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="animate-pulse text-center p-6">
          <div className="inline-block h-8 w-8 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <p className="mt-2">Comparing users...</p>
        </div>
      ) : comparisonData.length === 0 ? (
        <div className="text-center p-6 border rounded bg-gray-50">
          <p>No users to compare</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth0 Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supabase Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparisonData.map((comparison, idx) => {
                const { label, color } = getStatusDisplay(comparison.status);
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {comparison.auth0User.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comparison.auth0User.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comparison.supabaseUser?.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${color}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {comparison.status !== 'synced' && (
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => alert('Synchronization function would go here')}
                        >
                          Sync User
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Sync Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {comparisonData.filter(d => d.status === 'synced').length}
            </div>
            <div className="text-sm text-gray-500">Synced Users</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {comparisonData.filter(d => d.status === 'not-synced').length}
            </div>
            <div className="text-sm text-gray-500">Out of Sync</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {comparisonData.filter(d => d.status === 'missing').length}
            </div>
            <div className="text-sm text-gray-500">Missing Users</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth0UserComparison; 