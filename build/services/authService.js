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
exports.authService = void 0;
const supabase_1 = require("../lib/supabase");
const restaurant_1 = require("../types/restaurant");
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
exports.authService = {
    verifyRestaurantCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, error } = yield supabase_1.supabase
                    .from('restaurants')
                    .select('*')
                    .eq('restaurant_code', code)
                    .eq('active', true)
                    .eq('verification_status', 'verified')
                    .single();
                if (error)
                    throw error;
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
            }
            catch (err) {
                console.error('Error verifying restaurant code:', err);
                return { valid: false, error: 'Failed to verify restaurant code' };
            }
        });
    },
    verifyStaffCredentials(restaurantId, username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get member record
                const { data: member, error: memberError } = yield supabase_1.supabase
                    .from('restaurant_members')
                    .select('*')
                    .eq('restaurant_id', restaurantId)
                    .eq('username', username.toLowerCase())
                    .single();
                if (memberError)
                    throw memberError;
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
                    yield supabase_1.supabase
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
                    yield supabase_1.supabase
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
                yield supabase_1.supabase
                    .from('restaurant_members')
                    .update({
                    failed_login_attempts: 0,
                    last_login_at: new Date().toISOString()
                })
                    .eq('id', member.id);
                return { valid: true, member };
            }
            catch (err) {
                console.error('Error verifying staff credentials:', err);
                return { valid: false, error: 'Failed to verify credentials' };
            }
        });
    },
    hasPermission(role, permission) {
        var _a;
        return ((_a = restaurant_1.ROLE_PERMISSIONS[role]) === null || _a === void 0 ? void 0 : _a.includes(permission)) || false;
    }
};
