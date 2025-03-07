import { supabase } from '../lib/supabase';
import { authService } from './authService';
import { v4 as uuidv4 } from 'uuid';

export interface Member {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  role: string;
  username: string;
  email?: string;
  full_name?: string;
  temporary_password?: string;
  password_changed?: boolean;
}

export const memberService = {
  async verifyMemberCredentials(
    restaurantCode: string,
    username: string,
    password: string
  ) {
    try {
      // First verify the restaurant code
      const { valid, restaurant, error: restaurantError } = await authService.verifyRestaurantCode(restaurantCode);
      
      if (!valid || !restaurant) {
        return { data: null, error: restaurantError || 'Invalid restaurant code' };
      }

      // Then verify the staff credentials
      const { valid: credentialsValid, member, auth, error: credentialsError } = 
        await authService.verifyStaffCredentials(restaurant.id, username, password);

      if (!credentialsValid) {
        return { 
          data: null, 
          error: credentialsError,
          auth // Include auth info for lock status and remaining attempts
        };
      }

      return { 
        data: {
          ...member,
          restaurant_name: restaurant.name
        }, 
        error: null 
      };
    } catch (err) {
      console.error('Error verifying credentials:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to verify credentials' 
      };
    }
  },

  async getMembers(restaurantId: string) {
    try {
      const { data: members, error: membersError } = await supabase
        .from('restaurant_members')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true });

      if (membersError) throw membersError;

      const transformedMembers = (members || []).map(member => ({
        id: member.id,
        restaurant_id: member.restaurant_id,
        user_id: member.user_id,
        role: member.role,
        username: member.username || 'Not set',
        full_name: member.full_name || 'Not set',
        email: member.email,
        temporary_password: member.temporary_password,
        password_changed: member.password_changed
      }));

      return { data: transformedMembers, error: null };
    } catch (err) {
      console.error('Error in getMembers:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Failed to load team members') };
    }
  },

  async addMember(
    restaurantId: string,
    username: string,
    fullName: string,
    role: string
  ) {
    try {
      const { data: existingMember, error: checkError } = await supabase
        .from('restaurant_members')
        .select('id')
        .match({ restaurant_id: restaurantId, username })
        .maybeSingle();

      if (existingMember) {
        throw new Error('Username is already taken in this restaurant');
      }

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const temporaryPassword = generatePassword();

      const { data: member, error: insertError } = await supabase
        .from('restaurant_members')
        .insert({
          restaurant_id: restaurantId,
          username,
          full_name: fullName,
          role,
          temporary_password: temporaryPassword,
          password_changed: false
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Username is already taken in this restaurant');
        }
        throw insertError;
      }

      return { 
        data: {
          ...member,
          temporary_password: temporaryPassword
        }, 
        error: null 
      };
    } catch (err) {
      console.error('Error adding member:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Failed to add member')
      };
    }
  },

  async updateMemberUsername(userId: string, newUsername: string) {
    try {
      const { data: member, error: memberError } = await supabase
        .from('restaurant_members')
        .select('restaurant_id')
        .eq('user_id', userId)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (member) {
        const { data: existing, error: checkError } = await supabase
          .from('restaurant_members')
          .select('id')
          .match({ 
            restaurant_id: member.restaurant_id, 
            username: newUsername 
          })
          .neq('user_id', userId)
          .maybeSingle();

        if (existing) {
          throw new Error('Username is already taken in this restaurant');
        }

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        const { error: updateError } = await supabase
          .from('restaurant_members')
          .update({ username: newUsername })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      return { data: { username: newUsername }, error: null };
    } catch (err) {
      console.error('Error in updateMemberUsername:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('Failed to update username')
      };
    }
  },

  async removeMember(memberId: string) {
    try {
      const { error } = await supabase
        .from('restaurant_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      console.error('Error in removeMember:', err);
      return { error: err instanceof Error ? err : new Error('Failed to remove member') };
    }
  }
};

// Helper function to generate a secure random password
const generatePassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  // Ensure password contains at least one of each required character type
  const requiredChars = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    number: '0123456789',
    special: '!@#$%^&*'
  };

  Object.values(requiredChars).forEach(chars => {
    if (!password.split('').some(c => chars.includes(c))) {
      const pos = Math.floor(crypto.getRandomValues(new Uint8Array(1))[0] % length);
      const char = chars[crypto.getRandomValues(new Uint8Array(1))[0] % chars.length];
      password = password.substring(0, pos) + char + password.substring(pos + 1);
    }
  });

  return password;
};