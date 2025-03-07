import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useAuth } from '../../contexts/AuthContext';
import { memberService } from '../../services/memberService';
import { UserPlus, Trash2, RefreshCw, Copy, Check, Shield, AlertTriangle, UserCog } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const addMemberSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['staff', 'chef', 'manager']),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

const ROLE_BADGES = {
  owner: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  chef: 'bg-yellow-100 text-yellow-800',
  staff: 'bg-green-100 text-green-800'
};

// Helper function to capitalize names properly
const capitalizeFullName = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const RestaurantMembers: React.FC = () => {
  const { currentRestaurant, userRole } = useRestaurant();
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [newMemberCredentials, setNewMemberCredentials] = useState<{
    username: string;
    temporaryPassword: string;
  } | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);

  const canManageMembers = userRole === 'owner' || userRole === 'manager';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      role: 'staff'
    }
  });

  const fetchMembers = async () => {
    if (!currentRestaurant || !user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await memberService.getMembers(currentRestaurant.id);
      if (error) throw error;

      // Create owner entry from user context
      const ownerEntry = {
        id: `owner-${user.id}`,
        restaurant_id: currentRestaurant.id,
        user_id: user.id,
        role: 'owner',
        username: user.user_metadata?.username || '',
        full_name: user.user_metadata?.full_name || '',
        email: user.email,
        password_changed: true
      };

      // Filter out any existing owner entries from regular members
      const regularMembers = (data || []).filter(member => member.role !== 'owner');

      // Combine owner with regular members
      setMembers([ownerEntry, ...regularMembers]);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRestaurant && user) {
      fetchMembers();
    }
  }, [currentRestaurant, user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await fetchMembers();
      setSuccess('Team members refreshed successfully');
    } catch (err) {
      setError('Failed to refresh team members');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddMember = async (data: AddMemberFormValues) => {
    if (!currentRestaurant) return;
    setIsAdding(true);
    setError(null);
    setSuccess(null);

    try {
      // Capitalize the full name before saving
      const capitalizedFullName = capitalizeFullName(data.fullName);

      const result = await memberService.addMember(
        currentRestaurant.id,
        data.username,
        capitalizedFullName,
        data.role
      );

      if (result.error) {
        throw result.error;
      }

      setSuccess('Member added successfully');
      setNewMemberCredentials({
        username: data.username,
        temporaryPassword: result.data.temporary_password
      });
      reset();
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (member: any) => {
    setMemberToDelete({
      id: member.id,
      name: member.full_name,
      role: member.role
    });
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await memberService.removeMember(memberToDelete.id);
      if (error) throw error;
      
      setSuccess('Team member removed successfully');
      await fetchMembers();
    } catch (err) {
      setError('Failed to remove team member');
    } finally {
      setMemberToDelete(null);
    }
  };

  const handleCopy = (field: string) => {
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setNewMemberCredentials(null);
    fetchMembers();
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (!currentRestaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select a restaurant first</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600">Manage your restaurant staff</p>
        </div>
        <button 
          onClick={handleRefresh} 
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isRefreshing}
        >
          <RefreshCw className={clsx('mr-1 h-4 w-4', isRefreshing && 'animate-spin')} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owners</option>
                <option value="manager">Managers</option>
                <option value="chef">Chefs</option>
                <option value="staff">Staff</option>
              </select>
              {canManageMembers && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </button>
              )}
            </div>
          </div>

          {/* Team Members List */}
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No team members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    {canManageMembers && (
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {member.full_name?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          ROLE_BADGES[member.role as keyof typeof ROLE_BADGES]
                        )}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.username}
                      </td>
                      {canManageMembers && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {member.role === 'owner' ? (
                            <Link
                              to="/settings"
                              className="text-gray-400 hover:text-gray-500"
                              title="Account Settings"
                            >
                              <UserCog className="h-5 w-5" />
                            </Link>
                          ) : (
                            canManageMembers && (
                              <button
                                onClick={() => handleDeleteClick(member)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            )
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center mb-4 text-red-600">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to remove <span className="font-medium">{memberToDelete.name}</span> from the team? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h2>
            
            {newMemberCredentials ? (
              <div className="space-y-6">
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <p className="text-sm text-green-700">
                    Member added successfully! Share these credentials with the new team member:
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        value={newMemberCredentials.username}
                        readOnly
                        className="flex-1 block w-full rounded-l-md border-gray-300 bg-gray-50"
                      />
                      <CopyToClipboard 
                        text={newMemberCredentials.username}
                        onCopy={() => handleCopy('username')}
                      >
                        <button
                          type="button"
                          className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {copiedField === 'username' ? (
                            <>
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 text-gray-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </CopyToClipboard>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        value={newMemberCredentials.temporaryPassword}
                        readOnly
                        className="flex-1 block w-full rounded-l-md border-gray-300 bg-gray-50"
                      />
                      <CopyToClipboard 
                        text={newMemberCredentials.temporaryPassword}
                        onCopy={() => handleCopy('password')}
                      >
                        <button
                          type="button"
                          className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {copiedField === 'password' ? (
                            <>
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 text-gray-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleCloseAddForm}
                    className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleAddMember)} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    {...register('username')}
                    className={clsx(
                      "mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                      errors.username ? "border-red-300" : "border-gray-300"
                    )}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    {...register('fullName')}
                    className={clsx(
                      "mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                      errors.fullName ? "border-red-300" : "border-gray-300"
                    )}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    {...register('role')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="staff">Staff</option>
                    <option value="chef">Chef</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isAdding ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMembers;