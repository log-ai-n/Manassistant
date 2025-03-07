import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInvitationByToken, acceptInvitation, InvitationStatus } from '../../lib/invitations';
import { ChefHat, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AcceptInvitation: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<InvitationStatus>('pending');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) return;
      
      try {
        const { invitation, status, error } = await getInvitationByToken(token);
        
        if (error) {
          setError('Invalid or expired invitation link');
          setStatus('invalid');
        } else if (invitation) {
          setStatus(status);
          setRestaurantName(invitation.restaurant_name || 'Restaurant');
          setRole(invitation.role);
          setEmail(invitation.email);
          setExpiresAt(invitation.expires_at);
          
          // If user is logged in and invitation is for a different email
          if (user && user.email !== invitation.email) {
            setError(`This invitation was sent to ${invitation.email}, but you're logged in as ${user.email}`);
          }
        }
      } catch (err) {
        setError('Failed to load invitation details');
        setStatus('invalid');
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
      fetchInvitation();
    }
  }, [token, authLoading, user]);

  const handleAcceptInvitation = async () => {
    if (!token || !user) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const { error } = await acceptInvitation(token, user.id);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('You have successfully joined the restaurant team!');
        setStatus('accepted');
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (err) {
      setError('Failed to accept invitation');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <ChefHat className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Restaurant Invitation
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          {status === 'invalid' ? (
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Invalid Invitation</h3>
              <p className="mt-1 text-sm text-gray-500">
                This invitation link is invalid or has been removed.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : status === 'expired' ? (
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Invitation Expired</h3>
              <p className="mt-1 text-sm text-gray-500">
                This invitation has expired on {format(new Date(expiresAt), 'PPpp')}.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Please contact the restaurant administrator for a new invitation.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : status === 'accepted' ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Invitation Accepted</h3>
              <p className="mt-1 text-sm text-gray-500">
                You have already joined {restaurantName}.
              </p>
              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900">You've been invited!</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Restaurant</p>
                  <p className="font-medium">{restaurantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expires</p>
                  <p className="font-medium">{format(new Date(expiresAt), 'PPpp')}</p>
                </div>
              </div>
              
              {user ? (
                <div className="mt-6">
                  <button
                    onClick={handleAcceptInvitation}
                    disabled={processing || user.email !== email}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Accept Invitation'
                    )}
                  </button>
                  
                  {user.email !== email && (
                    <p className="mt-2 text-sm text-red-600">
                      This invitation was sent to {email}, but you're logged in as {user.email}.
                      Please log out and sign in with the correct email address.
                    </p>
                  )}
                  
                  <div className="mt-4 text-center">
                    <Link
                      to="/dashboard"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <Link
                    to={`/register?email=${encodeURIComponent(email)}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Account
                  </Link>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Already have an account?{' '}
                      <Link
                        to={`/login?email=${encodeURIComponent(email)}`}
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;