"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.RESTAURANT_ROLES = void 0;
exports.RESTAURANT_ROLES = {
    OWNER: 'owner',
    MANAGER: 'manager',
    CHEF: 'chef',
    STAFF: 'staff'
};
exports.ROLE_PERMISSIONS = {
    [exports.RESTAURANT_ROLES.OWNER]: [
        'manage_restaurant',
        'manage_staff',
        'manage_menu',
        'view_reports',
        'manage_settings'
    ],
    [exports.RESTAURANT_ROLES.MANAGER]: [
        'manage_staff',
        'manage_menu',
        'view_reports',
        'manage_settings'
    ],
    [exports.RESTAURANT_ROLES.CHEF]: [
        'manage_menu',
        'view_kitchen_reports'
    ],
    [exports.RESTAURANT_ROLES.STAFF]: [
        'view_menu',
        'view_schedule'
    ]
};
