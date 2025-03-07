export interface Restaurant {
  id: string;
  name: string;
  restaurant_code: string;
  address?: string;
  phone?: string;
  email?: string;
  owner_id: string;
  active: boolean;
  verification_status: 'pending' | 'verified' | 'suspended';
  failed_login_attempts: number;
  locked_until?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantMember {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'chef' | 'staff';
  username: string;
  email?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  failed_login_attempts: number;
  password_reset_required: boolean;
  password_reset_token?: string;
  password_reset_expires?: string;
}

export interface RestaurantAuth {
  isLocked: boolean;
  remainingAttempts: number;
  lockExpiration?: Date;
}

export const RESTAURANT_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  CHEF: 'chef',
  STAFF: 'staff'
} as const;

export const ROLE_PERMISSIONS = {
  [RESTAURANT_ROLES.OWNER]: [
    'manage_restaurant',
    'manage_staff',
    'manage_menu',
    'view_reports',
    'manage_settings'
  ],
  [RESTAURANT_ROLES.MANAGER]: [
    'manage_staff',
    'manage_menu',
    'view_reports',
    'manage_settings'
  ],
  [RESTAURANT_ROLES.CHEF]: [
    'manage_menu',
    'view_kitchen_reports'
  ],
  [RESTAURANT_ROLES.STAFF]: [
    'view_menu',
    'view_schedule'
  ]
} as const;