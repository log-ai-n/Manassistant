/*
  # Initial Schema for Manassist Hub

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `address` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `owner_id` (uuid, references auth.users)
      - `active` (boolean, default true)
    
    - `restaurant_members`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, references restaurants)
      - `user_id` (uuid, references auth.users)
      - `role` (text, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `restaurant_features`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, references restaurants)
      - `feature_key` (text, not null)
      - `is_enabled` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper data isolation between restaurants
    - Ensure restaurant owners can manage their own restaurant data
    - Implement role-based access control through restaurant_members
*/

-- Create profiles table to store user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create restaurant_members table for role-based access
CREATE TABLE IF NOT EXISTS restaurant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'chef')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

-- Create restaurant_features table for feature management
CREATE TABLE IF NOT EXISTS restaurant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, feature_key)
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_features ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Restaurants policies
CREATE POLICY "Restaurant owners can manage their restaurants"
  ON restaurants
  FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Restaurant members can view restaurants they belong to"
  ON restaurants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE restaurant_id = restaurants.id
      AND user_id = auth.uid()
    )
  );

-- Restaurant members policies
CREATE POLICY "Restaurant owners can manage members"
  ON restaurant_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE id = restaurant_members.restaurant_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant managers can view and add members"
  ON restaurant_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE restaurant_id = restaurant_members.restaurant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Users can view their own membership"
  ON restaurant_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Restaurant features policies
CREATE POLICY "Restaurant owners and managers can manage features"
  ON restaurant_features
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE restaurant_id = restaurant_features.restaurant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Restaurant members can view features"
  ON restaurant_features
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE restaurant_id = restaurant_features.restaurant_id
      AND user_id = auth.uid()
    )
  );

-- Create function to automatically add a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();