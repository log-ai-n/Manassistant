/*
  # Restaurant Management Schema

  1. New Tables
    - `restaurants` (enhanced with additional fields)
      - `restaurant_code` (text, unique)
      - `logo_url` (text)
      - `email` (text)
    - `restaurant_users` (junction table)
      - `restaurant_id` (uuid, references restaurants)
      - `user_id` (uuid, references auth.users)
      - `role` (text, enum)
      - `email` (text)
      - `username` (text)
    - `restaurant_modules` (for feature management)
      - `restaurant_id` (uuid, references restaurants)
      - `module_name` (text)
      - `is_enabled` (boolean)
      - `settings` (jsonb)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for data isolation between restaurants
    - Role-based access control policies
*/

-- Add restaurant_code, logo_url, and email to restaurants table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' AND column_name = 'restaurant_code'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN restaurant_code TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN logo_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' AND column_name = 'email'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN email TEXT;
  END IF;
END $$;

-- Create restaurant_users junction table
CREATE TABLE IF NOT EXISTS restaurant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'chef', 'host')),
  email TEXT,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

-- Create restaurant_modules table
CREATE TABLE IF NOT EXISTS restaurant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, module_name)
);

-- Enable Row Level Security
ALTER TABLE restaurant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_modules ENABLE ROW LEVEL SECURITY;

-- Restaurant Users Policies

-- Users can view their own restaurant memberships
CREATE POLICY "Users can view their own restaurant memberships"
  ON restaurant_users
  FOR SELECT
  USING (user_id = auth.uid());

-- Restaurant owners can manage users in their restaurant
CREATE POLICY "Restaurant owners can manage users"
  ON restaurant_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_users
      WHERE restaurant_id = restaurant_users.restaurant_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Restaurant managers can view and add users
CREATE POLICY "Restaurant managers can view and add users"
  ON restaurant_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_users
      WHERE restaurant_id = restaurant_users.restaurant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Restaurant managers can insert users"
  ON restaurant_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_users
      WHERE restaurant_id = restaurant_users.restaurant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

-- Restaurant Modules Policies

-- Users can view modules for restaurants they belong to
CREATE POLICY "Users can view modules for their restaurants"
  ON restaurant_modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_users
      WHERE restaurant_id = restaurant_modules.restaurant_id
      AND user_id = auth.uid()
    )
  );

-- Only owners and managers can modify modules
CREATE POLICY "Owners and managers can modify modules"
  ON restaurant_modules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_users
      WHERE restaurant_id = restaurant_modules.restaurant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

-- Create function to automatically add a restaurant_user entry when a restaurant is created
CREATE OR REPLACE FUNCTION public.handle_new_restaurant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.restaurant_users (restaurant_id, user_id, role, email)
  SELECT 
    NEW.id, 
    NEW.owner_id, 
    'owner',
    (SELECT email FROM auth.users WHERE id = NEW.owner_id)
  WHERE NEW.owner_id IS NOT NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a restaurant is created
DROP TRIGGER IF EXISTS on_restaurant_created ON restaurants;
CREATE TRIGGER on_restaurant_created
  AFTER INSERT ON restaurants
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_restaurant();

-- Create default modules for new restaurants
CREATE OR REPLACE FUNCTION public.create_default_modules()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_enabled)
  VALUES
    (NEW.id, 'menu', true),
    (NEW.id, 'inventory', true),
    (NEW.id, 'staff', true),
    (NEW.id, 'reservations', false),
    (NEW.id, 'analytics', false),
    (NEW.id, 'online_ordering', false),
    (NEW.id, 'loyalty', false),
    (NEW.id, 'kitchen_display', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add default modules when a restaurant is created
DROP TRIGGER IF EXISTS on_restaurant_modules_created ON restaurants;
CREATE TRIGGER on_restaurant_modules_created
  AFTER INSERT ON restaurants
  FOR EACH ROW EXECUTE FUNCTION public.create_default_modules();

-- Update existing restaurants to have the new fields and relationships
DO $$ 
BEGIN
  -- Add restaurant_code to existing restaurants
  UPDATE restaurants 
  SET restaurant_code = 'REST-' || SUBSTRING(id::text, 1, 8)
  WHERE restaurant_code IS NULL;

  -- Create restaurant_users entries for existing restaurants
  INSERT INTO restaurant_users (restaurant_id, user_id, role, email)
  SELECT 
    r.id, 
    r.owner_id, 
    'owner',
    (SELECT email FROM auth.users WHERE id = r.owner_id)
  FROM restaurants r
  WHERE r.owner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM restaurant_users 
    WHERE restaurant_id = r.id AND user_id = r.owner_id
  );

  -- Create default modules for existing restaurants
  INSERT INTO restaurant_modules (restaurant_id, module_name, is_enabled)
  SELECT 
    r.id, 
    m.module_name, 
    m.is_enabled
  FROM restaurants r
  CROSS JOIN (
    VALUES 
      ('menu', true),
      ('inventory', true),
      ('staff', true),
      ('reservations', false),
      ('analytics', false),
      ('online_ordering', false),
      ('loyalty', false),
      ('kitchen_display', false)
  ) AS m(module_name, is_enabled)
  WHERE NOT EXISTS (
    SELECT 1 FROM restaurant_modules 
    WHERE restaurant_id = r.id AND module_name = m.module_name
  );
END $$;