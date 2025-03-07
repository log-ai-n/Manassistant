import { supabase } from '../lib/supabase';
import { Restaurant, RestaurantMember, RestaurantAuth, ROLE_PERMISSIONS } from '../types/restaurant';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export const authService = {
  async verifyRestaurantCode(code: string): Promise<{ 
    valid: boolean; 
    restaurant?: Restaurant; 
    error?: string 
  }> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('restaurant_code', code)
        .eq('active', true)
        .eq('verification_status', 'verified')
        .single();

      if (error) throw error;

      if (!data) {
        return { valid: false, error: 'Invalid restaurant code' };
      }

      // Check if restaurant is locked
      if (data.locked_until && new Date(data.locked_until) > new Date()) {
        return { 
          valid: false, 
          error: `Restaurant access is temporarily locked. Please try again after ${new Date(data.locked_until).toLocaleTimeString()}` 
        };
      }

      return { valid: true, restaurant: data };
    } catch (err) {
      console.error('Error verifying restaurant code:', err);
      return { valid: false, error: 'Failed to verify restaurant code' };
    }
  },

  async verifyStaffCredentials(
    restaurantId: string,
    username: string,
    password: string
  ): Promise<{
    valid: boolean;
    member?: RestaurantMember;
    auth?: RestaurantAuth;
    error?: string;
  }> {
    try {
      // Get member record
      const { data: member, error: memberError } = await supabase
        .from('restaurant_members')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('username', username.toLowerCase())
        .single();

      if (memberError) throw memberError;

      if (!member) {
        return { valid: false, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (member.failed_login_attempts >= MAX_LOGIN_ATTEMPTS) {
        const lockExpiration = new Date(member.last_login_at);
        lockExpiration.setMinutes(lockExpiration.getMinutes() + LOCK_DURATION_MINUTES);

        if (lockExpiration > new Date()) {
          return {
            valid: false,
            auth: {
              isLocked: true,
              remainingAttempts: 0,
              lockExpiration
            },
            error: `Account is locked. Please try again after ${lockExpiration.toLocaleTimeString()}`
          };
        }

        // Reset failed attempts if lock period has expired
        await supabase
          .from('restaurant_members')
          .update({
            failed_login_attempts: 0,
            last_login_at: new Date().toISOString()
          })
          .eq('id', member.id);
      }

      // Verify password
      if (member.temporary_password !== password) {
        // Increment failed attempts
        const failedAttempts = (member.failed_login_attempts || 0) + 1;
        await supabase
          .from('restaurant_members')
          .update({
            failed_login_attempts: failedAttempts,
            last_login_at: new Date().toISOString()
          })
          .eq('id', member.id);

        return {
          valid: false,
          auth: {
            isLocked: failedAttempts >= MAX_LOGIN_ATTEMPTS,
            remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - failedAttempts)
          },
          error: `Invalid credentials. ${Math.max(0, MAX_LOGIN_ATTEMPTS - failedAttempts)} attempts remaining`
        };
      }

      // Reset failed attempts on successful login
      await supabase
        .from('restaurant_members')
        .update({
          failed_login_attempts: 0,
          last_login_at: new Date().toISOString()
        })
        .eq('id', member.id);

      return { valid: true, member };
    } catch (err) {
      console.error('Error verifying staff credentials:', err);
      return { valid: false, error: 'Failed to verify credentials' };
    }
  },

  hasPermission(role: string, permission: string): boolean {
    return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]?.includes(permission) || false;
  }
};