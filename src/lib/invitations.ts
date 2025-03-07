import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'invalid';

export interface Invitation {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  email: string;
  role: string;
  token: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  accepted: boolean;
}

export const createInvitation = async (
  restaurantId: string,
  email: string,
  role: string
): Promise<{ error: Error | null; isNewUser: boolean; invitation?: Invitation }> => {
  try {
    // First check if user already exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    const isNewUser = !userData?.id;
    
    // Generate a secure token
    const token = uuidv4();
    
    // Get restaurant name for the email
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('name')
      .eq('id', restaurantId)
      .single();
    
    if (restaurantError) {
      throw restaurantError;
    }
    
    // Create the invitation
    const { data: invitation, error } = await supabase
      .from('restaurant_invitations')
      .insert({
        restaurant_id: restaurantId,
        email,
        role,
        token,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { 
          error: new Error('An invitation has already been sent to this email address'), 
          isNewUser 
        };
      }
      throw error;
    }

    // If user exists, add them directly to restaurant_members
    if (!isNewUser) {
      await supabase.from('restaurant_members').insert({
        restaurant_id: restaurantId,
        user_id: userData.id,
        role,
      });
      
      // Mark invitation as accepted
      await supabase
        .from('restaurant_invitations')
        .update({ accepted: true })
        .eq('id', invitation.id);
    } else {
      // Send invitation email
      const invitationUrl = `${window.location.origin}/invitation/${token}`;
      const expirationDate = new Date(invitation.expires_at).toLocaleDateString();
      
      // Send email using Supabase's email service
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          to: email,
          restaurantName: restaurant.name,
          role: role,
          invitationUrl: invitationUrl,
          expirationDate: expirationDate
        }
      });
      
      if (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // We don't want to fail the whole process if just the email fails
      }
    }
    
    return { error: null, isNewUser, invitation };
  } catch (error) {
    return { error: error as Error, isNewUser: false };
  }
};

export const getInvitationByToken = async (token: string): Promise<{ 
  invitation: Invitation | null; 
  status: InvitationStatus;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('restaurant_invitations')
      .select(`
        *,
        restaurants (
          name
        )
      `)
      .eq('token', token)
      .single();
    
    if (error) {
      return { invitation: null, status: 'invalid', error };
    }
    
    const invitation: Invitation = {
      ...data,
      restaurant_name: data.restaurants?.name
    };
    
    // Check if invitation is valid
    if (new Date(invitation.expires_at) < new Date()) {
      return { invitation, status: 'expired', error: null };
    }
    
    if (invitation.accepted) {
      return { invitation, status: 'accepted', error: null };
    }
    
    return { invitation, status: 'pending', error: null };
  } catch (error) {
    return { invitation: null, status: 'invalid', error: error as Error };
  }
};

export const acceptInvitation = async (token: string, userId: string): Promise<{ 
  error: Error | null;
}> => {
  try {
    // Get invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('restaurant_invitations')
      .select('*')
      .eq('token', token)
      .single();
    
    if (invitationError || !invitation) {
      return { error: new Error('Invalid invitation') };
    }
    
    if (new Date(invitation.expires_at) < new Date()) {
      return { error: new Error('Invitation has expired') };
    }
    
    if (invitation.accepted) {
      return { error: new Error('Invitation has already been accepted') };
    }
    
    // Add user to restaurant_members
    const { error: memberError } = await supabase.from('restaurant_members').insert({
      restaurant_id: invitation.restaurant_id,
      user_id: userId,
      role: invitation.role,
    });
    
    if (memberError) {
      return { error: memberError };
    }
    
    // Mark invitation as accepted
    await supabase
      .from('restaurant_invitations')
      .update({ accepted: true })
      .eq('id', invitation.id);
    
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getRestaurantInvitations = async (restaurantId: string): Promise<{
  invitations: Invitation[];
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('restaurant_invitations')
      .select(`
        *,
        creator:created_by (
          email
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { invitations: data || [], error: null };
  } catch (error) {
    return { invitations: [], error: error as Error };
  }
};

export const resendInvitation = async (invitationId: string): Promise<{
  error: Error | null;
}> => {
  try {
    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('restaurant_invitations')
      .select(`
        *,
        restaurants (
          name
        )
      `)
      .eq('id', invitationId)
      .single();
    
    if (invitationError) {
      throw invitationError;
    }
    
    // Update the expiration date to extend it
    const newExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const { error } = await supabase
      .from('restaurant_invitations')
      .update({ 
        expires_at: newExpiryDate.toISOString() 
      })
      .eq('id', invitationId);
    
    if (error) {
      throw error;
    }
    
    // Resend the invitation email
    const invitationUrl = `${window.location.origin}/invitation/${invitation.token}`;
    const expirationDate = newExpiryDate.toLocaleDateString();
    
    // Send email using Supabase's email service
    const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        to: invitation.email,
        restaurantName: invitation.restaurants.name,
        role: invitation.role,
        invitationUrl: invitationUrl,
        expirationDate: expirationDate,
        isResend: true
      }
    });
    
    if (emailError) {
      console.error('Failed to resend invitation email:', emailError);
      // We don't want to fail the whole process if just the email fails
    }
    
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const deleteInvitation = async (invitationId: string): Promise<{
  error: Error | null;
}> => {
  try {
    const { error } = await supabase
      .from('restaurant_invitations')
      .delete()
      .eq('id', invitationId);
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};