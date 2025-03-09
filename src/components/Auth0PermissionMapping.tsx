import React, { useState } from 'react';

// Sample data structure for permissions mapping
// In a real app, this would come from your backend
const SAMPLE_PERMISSION_MAP = [
  {
    auth0Role: 'Admin',
    description: 'Full system access',
    supabaseRLS: [
      { table: 'profiles', policy: 'admin_all_access', effect: 'Allow all operations' },
      { table: 'restaurants', policy: 'admin_all_access', effect: 'Allow all operations' },
      { table: 'memories', policy: 'admin_all_access', effect: 'Allow all operations' }
    ]
  },
  {
    auth0Role: 'Restaurant Owner',
    description: 'Can manage their own restaurant',
    supabaseRLS: [
      { table: 'profiles', policy: 'owner_read_access', effect: 'Read-only for restaurant staff' },
      { table: 'restaurants', policy: 'owner_manage_own', effect: 'Full access to owned restaurant' },
      { table: 'memories', policy: 'owner_manage_own', effect: 'Full access to restaurant memories' }
    ]
  },
  {
    auth0Role: 'Restaurant Staff',
    description: 'Access to restaurant features',
    supabaseRLS: [
      { table: 'profiles', policy: 'staff_read_self', effect: 'Read-only for own profile' },
      { table: 'restaurants', policy: 'staff_read_assigned', effect: 'Read-only for assigned restaurant' },
      { table: 'memories', policy: 'staff_contribute', effect: 'Can add and read memories' }
    ]
  },
  {
    auth0Role: 'Customer',
    description: 'Regular user privileges',
    supabaseRLS: [
      { table: 'profiles', policy: 'user_manage_own', effect: 'Manage own profile only' },
      { table: 'restaurants', policy: 'user_read_all', effect: 'Read-only for all restaurants' },
      { table: 'memories', policy: 'no_access', effect: 'No access to memories' }
    ]
  }
];

/**
 * Component for visualizing Auth0-Supabase permission mappings
 */
const Auth0PermissionMapping: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  const permissionMap = SAMPLE_PERMISSION_MAP;
  
  const filteredMap = selectedRole 
    ? permissionMap.filter(item => item.auth0Role === selectedRole)
    : permissionMap;
    
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-4">Auth0 to Supabase Permission Mapping</h3>
      
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-4">
          This visualization shows how Auth0 roles map to Supabase Row Level Security policies,
          making security configuration transparent and easier to manage.
        </p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            className={`px-3 py-1 text-sm rounded border ${
              selectedRole === null ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'
            }`}
            onClick={() => setSelectedRole(null)}
          >
            All Roles
          </button>
          
          {permissionMap.map(item => (
            <button
              key={item.auth0Role}
              className={`px-3 py-1 text-sm rounded border ${
                selectedRole === item.auth0Role ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'
              }`}
              onClick={() => setSelectedRole(item.auth0Role)}
            >
              {item.auth0Role}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        {filteredMap.map(role => (
          <div key={role.auth0Role} className="border rounded-lg overflow-hidden">
            <div className="bg-blue-50 p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-blue-900">{role.auth0Role}</h4>
                  <p className="text-sm text-blue-700">{role.description}</p>
                </div>
                
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {role.supabaseRLS.length} policies
                </div>
              </div>
            </div>
            
            <div className="divide-y">
              {role.supabaseRLS.map((policy, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{policy.table}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {policy.policy}
                        </code>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{policy.effect}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 border-t pt-6">
        <h4 className="font-medium mb-2">Visual Representation</h4>
        <div className="h-64 border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">
              This section would contain a visual flow diagram showing the relationship 
              between Auth0 roles and Supabase policies
            </p>
            <p className="mt-2 text-sm text-blue-600">
              (Would be implemented with a visualization library in production)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth0PermissionMapping; 