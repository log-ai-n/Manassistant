import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  owner_id: string | null;
  active: boolean;
  restaurant_code?: string;
};

type RestaurantMember = {
  id: string;
  restaurant_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'staff' | 'chef';
};

type RestaurantFeature = {
  id: string;
  restaurant_id: string;
  feature_key: string;
  is_enabled: boolean;
};

type RestaurantContextType = {
  currentRestaurant: Restaurant | null;
  userRestaurants: Restaurant[];
  userRole: string | null;
  features: RestaurantFeature[];
  loading: boolean;
  error: string | null;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  createRestaurant: (name: string, address?: string, phone?: string) => Promise<{ error: Error | null; data: Restaurant | null }>;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => Promise<{ error: Error | null }>;
  addMember: (restaurantId: string, email: string, role: string) => Promise<{ error: Error | null }>;
  toggleFeature: (restaurantId: string, featureKey: string, isEnabled: boolean) => Promise<{ error: Error | null }>;
  isFeatureEnabled: (featureKey: string) => boolean;
  refreshRestaurants: () => Promise<void>;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [userRestaurants, setUserRestaurants] = useState<Restaurant[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [features, setFeatures] = useState<RestaurantFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRestaurants();
    } else {
      setUserRestaurants([]);
      setCurrentRestaurant(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRestaurants = async () => {
    if (!user) {
      setUserRestaurants([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First check if user is an owner of any active restaurants
      const { data: ownedRestaurants, error: ownedError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .eq('active', true);

      if (ownedError) {
        throw new Error(`Failed to fetch owned restaurants: ${ownedError.message}`);
      }

      // Then check if user is a member of any active restaurants
      const { data: memberships, error: membershipError } = await supabase
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
            .map((m) => ({
              ...(m.restaurants as Restaurant),
            }))
        : [];

      const allRestaurants = [
        ...(ownedRestaurants || []),
        ...memberRestaurants,
      ].filter((r, index, self) => 
        index === self.findIndex((t) => t.id === r.id)
      );

      setUserRestaurants(allRestaurants);
      
      // Try to restore the previously selected restaurant
      const storedRestaurantId = localStorage.getItem('currentRestaurantId');
      if (storedRestaurantId && allRestaurants.length > 0) {
        const storedRestaurant = allRestaurants.find(r => r.id === storedRestaurantId);
        if (storedRestaurant) {
          setCurrentRestaurant(storedRestaurant);
        } else {
          setCurrentRestaurant(allRestaurants[0]);
        }
      } else if (allRestaurants.length > 0 && !currentRestaurant) {
        setCurrentRestaurant(allRestaurants[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error in fetchUserRestaurants:', errorMessage);
      setError(`Failed to load restaurants: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshRestaurants = async () => {
    await fetchUserRestaurants();
  };

  useEffect(() => {
    const fetchRoleAndFeatures = async () => {
      if (!user || !currentRestaurant) {
        setUserRole(null);
        setFeatures([]);
        return;
      }

      try {
        localStorage.setItem('currentRestaurantId', currentRestaurant.id);

        if (currentRestaurant.owner_id === user.id) {
          setUserRole('owner');
        } else {
          const { data: membership, error } = await supabase
            .from('restaurant_members')
            .select('role')
            .eq('restaurant_id', currentRestaurant.id)
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user role:', error);
            setUserRole(null);
          } else {
            setUserRole(membership?.role || null);
          }
        }

        const { data: featureData, error: featureError } = await supabase
          .from('restaurant_features')
          .select('*')
          .eq('restaurant_id', currentRestaurant.id);

        if (featureError) {
          console.error('Error fetching restaurant features:', featureError);
        } else {
          setFeatures(featureData || []);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error in fetchRoleAndFeatures:', errorMessage);
      }
    };

    fetchRoleAndFeatures();
  }, [user, currentRestaurant]);

  const createRestaurant = async (name: string, address?: string, phone?: string) => {
    if (!user) {
      return { error: new Error('User not authenticated'), data: null };
    }

    try {
      const restaurantCode = `REST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const { data, error } = await supabase
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
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const updateRestaurant = async (id: string, updates: Partial<Restaurant>) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      setUserRestaurants(
        userRestaurants.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );

      if (currentRestaurant?.id === id) {
        setCurrentRestaurant({ ...currentRestaurant, ...updates });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const addMember = async (restaurantId: string, email: string, role: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        throw new Error('User not found');
      }

      const { error } = await supabase.from('restaurant_members').insert({
        restaurant_id: restaurantId,
        user_id: userData.id,
        role,
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const toggleFeature = async (
    restaurantId: string,
    featureKey: string,
    isEnabled: boolean
  ) => {
    try {
      const { error } = await supabase
        .from('restaurant_features')
        .update({ is_enabled: isEnabled })
        .eq('restaurant_id', restaurantId)
        .eq('feature_key', featureKey);

      if (error) {
        throw error;
      }

      setFeatures(
        features.map((f) =>
          f.restaurant_id === restaurantId && f.feature_key === featureKey
            ? { ...f, is_enabled: isEnabled }
            : f
        )
      );

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const isFeatureEnabled = (featureKey: string) => {
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

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};