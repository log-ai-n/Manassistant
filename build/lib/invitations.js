"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInvitation = exports.resendInvitation = exports.getRestaurantInvitations = exports.acceptInvitation = exports.getInvitationByToken = exports.createInvitation = void 0;
const supabase_1 = require("./supabase");
const uuid_1 = require("uuid");
const createInvitation = (restaurantId, email, role) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // First check if user already exists
        const { data: userData, error: userError } = yield supabase_1.supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();
        const isNewUser = !(userData === null || userData === void 0 ? void 0 : userData.id);
        // Generate a secure token
        const token = (0, uuid_1.v4)();
        // Get restaurant name for the email
        const { data: restaurant, error: restaurantError } = yield supabase_1.supabase
            .from('restaurants')
            .select('name')
            .eq('id', restaurantId)
            .single();
        if (restaurantError) {
            throw restaurantError;
        }
        // Create the invitation
        const { data: invitation, error } = yield supabase_1.supabase
            .from('restaurant_invitations')
            .insert({
            restaurant_id: restaurantId,
            email,
            role,
            token,
            created_by: (_a = (yield supabase_1.supabase.auth.getUser()).data.user) === null || _a === void 0 ? void 0 : _a.id,
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
            yield supabase_1.supabase.from('restaurant_members').insert({
                restaurant_id: restaurantId,
                user_id: userData.id,
                role,
            });
            // Mark invitation as accepted
            yield supabase_1.supabase
                .from('restaurant_invitations')
                .update({ accepted: true })
                .eq('id', invitation.id);
        }
        else {
            // Send invitation email
            const invitationUrl = `${window.location.origin}/invitation/${token}`;
            const expirationDate = new Date(invitation.expires_at).toLocaleDateString();
            // Send email using Supabase's email service
            const { error: emailError } = yield supabase_1.supabase.functions.invoke('send-invitation-email', {
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
    }
    catch (error) {
        return { error: error, isNewUser: false };
    }
});
exports.createInvitation = createInvitation;
const getInvitationByToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { data, error } = yield supabase_1.supabase
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
        const invitation = Object.assign(Object.assign({}, data), { restaurant_name: (_a = data.restaurants) === null || _a === void 0 ? void 0 : _a.name });
        // Check if invitation is valid
        if (new Date(invitation.expires_at) < new Date()) {
            return { invitation, status: 'expired', error: null };
        }
        if (invitation.accepted) {
            return { invitation, status: 'accepted', error: null };
        }
        return { invitation, status: 'pending', error: null };
    }
    catch (error) {
        return { invitation: null, status: 'invalid', error: error };
    }
});
exports.getInvitationByToken = getInvitationByToken;
const acceptInvitation = (token, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get invitation details
        const { data: invitation, error: invitationError } = yield supabase_1.supabase
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
        const { error: memberError } = yield supabase_1.supabase.from('restaurant_members').insert({
            restaurant_id: invitation.restaurant_id,
            user_id: userId,
            role: invitation.role,
        });
        if (memberError) {
            return { error: memberError };
        }
        // Mark invitation as accepted
        yield supabase_1.supabase
            .from('restaurant_invitations')
            .update({ accepted: true })
            .eq('id', invitation.id);
        return { error: null };
    }
    catch (error) {
        return { error: error };
    }
});
exports.acceptInvitation = acceptInvitation;
const getRestaurantInvitations = (restaurantId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabase_1.supabase
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
    }
    catch (error) {
        return { invitations: [], error: error };
    }
});
exports.getRestaurantInvitations = getRestaurantInvitations;
const resendInvitation = (invitationId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the invitation details
        const { data: invitation, error: invitationError } = yield supabase_1.supabase
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
        const { error } = yield supabase_1.supabase
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
        const { error: emailError } = yield supabase_1.supabase.functions.invoke('send-invitation-email', {
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
    }
    catch (error) {
        return { error: error };
    }
});
exports.resendInvitation = resendInvitation;
const deleteInvitation = (invitationId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = yield supabase_1.supabase
            .from('restaurant_invitations')
            .delete()
            .eq('id', invitationId);
        if (error) {
            throw error;
        }
        return { error: null };
    }
    catch (error) {
        return { error: error };
    }
});
exports.deleteInvitation = deleteInvitation;
