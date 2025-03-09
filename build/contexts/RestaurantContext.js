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
exports.useRestaurant = exports.RestaurantProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const AuthContext_1 = require("./AuthContext");
const supabase_1 = require("../lib/supabase");
const RestaurantContext = (0, react_1.createContext)(undefined);
const RestaurantProvider = ({ children }) => {
    const { user } = (0, AuthContext_1.useAuth)();
    const [currentRestaurant, setCurrentRestaurant] = (0, react_1.useState)(null);
    const [userRestaurants, setUserRestaurants] = (0, react_1.useState)([]);
    const [userRole, setUserRole] = (0, react_1.useState)(null);
    const [features, setFeatures] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (user) {
            fetchUserRestaurants();
        }
        else {
            setUserRestaurants([]);
            setCurrentRestaurant(null);
            setLoading(false);
        }
    }, [user]);
    const fetchUserRestaurants = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!user) {
            setUserRestaurants([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // First check if user is an owner of any active restaurants
            const { data: ownedRestaurants, error: ownedError } = yield supabase_1.supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', user.id)
                .eq('active', true);
            if (ownedError) {
                throw new Error(`Failed to fetch owned restaurants: ${ownedError.message}`);
            }
            // Then check if user is a member of any active restaurants
            const { data: memberships, error: membershipError } = yield supabase_1.supabase
                .from('restaurant_members')
                .select(`
          restaurant_id,
          role,
          restaurants (*)
        `)
                .eq('user_id', user.id)
                .eq('restaurants.active', true);
            if (membershipError) {
                throw new Error(`Failed to fetch restaurant memberships: ${membershipError.message}`);
            }
            // Combine and filter the results
            const memberRestaurants = memberships
                ? memberships
                    .filter(m => m.restaurants && m.restaurants.active)
                    .map((m) => (Object.assign({}, m.restaurants)))
                : [];
            const allRestaurants = [
                ...(ownedRestaurants || []),
                ...memberRestaurants,
            ].filter((r, index, self) => index === self.findIndex((t) => t.id === r.id));
            setUserRestaurants(allRestaurants);
            // Try to restore the previously selected restaurant
            const storedRestaurantId = localStorage.getItem('currentRestaurantId');
            if (storedRestaurantId && allRestaurants.length > 0) {
                const storedRestaurant = allRestaurants.find(r => r.id === storedRestaurantId);
                if (storedRestaurant) {
                    setCurrentRestaurant(storedRestaurant);
                }
                else {
                    setCurrentRestaurant(allRestaurants[0]);
                }
            }
            else if (allRestaurants.length > 0 && !currentRestaurant) {
                setCurrentRestaurant(allRestaurants[0]);
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Error in fetchUserRestaurants:', errorMessage);
            setError(`Failed to load restaurants: ${errorMessage}`);
        }
        finally {
            setLoading(false);
        }
    });
    const refreshRestaurants = () => __awaiter(void 0, void 0, void 0, function* () {
        yield fetchUserRestaurants();
    });
    (0, react_1.useEffect)(() => {
        const fetchRoleAndFeatures = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!user || !currentRestaurant) {
                setUserRole(null);
                setFeatures([]);
                return;
            }
            try {
                localStorage.setItem('currentRestaurantId', currentRestaurant.id);
                if (currentRestaurant.owner_id === user.id) {
                    setUserRole('owner');
                }
                else {
                    const { data: membership, error } = yield supabase_1.supabase
                        .from('restaurant_members')
                        .select('role')
                        .eq('restaurant_id', currentRestaurant.id)
                        .eq('user_id', user.id)
                        .single();
                    if (error) {
                        console.error('Error fetching user role:', error);
                        setUserRole(null);
                    }
                    else {
                        setUserRole((membership === null || membership === void 0 ? void 0 : membership.role) || null);
                    }
                }
                const { data: featureData, error: featureError } = yield supabase_1.supabase
                    .from('restaurant_features')
                    .select('*')
                    .eq('restaurant_id', currentRestaurant.id);
                if (featureError) {
                    console.error('Error fetching restaurant features:', featureError);
                }
                else {
                    setFeatures(featureData || []);
                }
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                console.error('Error in fetchRoleAndFeatures:', errorMessage);
            }
        });
        fetchRoleAndFeatures();
    }, [user, currentRestaurant]);
    const createRestaurant = (name, address, phone) => __awaiter(void 0, void 0, void 0, function* () {
        if (!user) {
            return { error: new Error('User not authenticated'), data: null };
        }
        try {
            const restaurantCode = `REST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            const { data, error } = yield supabase_1.supabase
                .from('restaurants')
                .insert({
                name,
                address: address || null,
                phone: phone || null,
                owner_id: user.id,
                restaurant_code: restaurantCode,
                active: true
            })
                .select()
                .single();
            if (error) {
                throw error;
            }
            setUserRestaurants([...userRestaurants, data]);
            setCurrentRestaurant(data);
            return { error: null, data };
        }
        catch (error) {
            return { error: error, data: null };
        }
    });
    const updateRestaurant = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { error } = yield supabase_1.supabase
                .from('restaurants')
                .update(updates)
                .eq('id', id);
            if (error) {
                throw error;
            }
            setUserRestaurants(userRestaurants.map((r) => (r.id === id ? Object.assign(Object.assign({}, r), updates) : r)));
            if ((currentRestaurant === null || currentRestaurant === void 0 ? void 0 : currentRestaurant.id) === id) {
                setCurrentRestaurant(Object.assign(Object.assign({}, currentRestaurant), updates));
            }
            return { error: null };
        }
        catch (error) {
            return { error: error };
        }
    });
    const addMember = (restaurantId, email, role) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { data: userData, error: userError } = yield supabase_1.supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single();
            if (userError) {
                throw new Error('User not found');
            }
            const { error } = yield supabase_1.supabase.from('restaurant_members').insert({
                restaurant_id: restaurantId,
                user_id: userData.id,
                role,
            });
            if (error) {
                throw error;
            }
            return { error: null };
        }
        catch (error) {
            return { error: error };
        }
    });
    const toggleFeature = (restaurantId, featureKey, isEnabled) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { error } = yield supabase_1.supabase
                .from('restaurant_features')
                .update({ is_enabled: isEnabled })
                .eq('restaurant_id', restaurantId)
                .eq('feature_key', featureKey);
            if (error) {
                throw error;
            }
            setFeatures(features.map((f) => f.restaurant_id === restaurantId && f.feature_key === featureKey
                ? Object.assign(Object.assign({}, f), { is_enabled: isEnabled }) : f));
            return { error: null };
        }
        catch (error) {
            return { error: error };
        }
    });
    const isFeatureEnabled = (featureKey) => {
        return features.some((f) => f.feature_key === featureKey && f.is_enabled);
    };
    const value = {
        currentRestaurant,
        userRestaurants,
        userRole,
        features,
        loading,
        error,
        setCurrentRestaurant,
        createRestaurant,
        updateRestaurant,
        addMember,
        toggleFeature,
        isFeatureEnabled,
        refreshRestaurants,
    };
    return ((0, jsx_runtime_1.jsx)(RestaurantContext.Provider, { value: value, children: children }));
};
exports.RestaurantProvider = RestaurantProvider;
const useRestaurant = () => {
    const context = (0, react_1.useContext)(RestaurantContext);
    if (context === undefined) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
};
exports.useRestaurant = useRestaurant;
