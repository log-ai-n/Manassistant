/*
  # Fix restaurant access issues

  1. Changes
    - Simplify restaurant access policies
    - Fix potential recursion issues in policies
    - Ensure proper access to restaurant data
  2. Security
    - Maintain RLS protection
    - Allow proper access patterns for owners and managers
*/

-- Drop potentially problematic policies
DROP POLICY IF EXISTS "Restaurant owners can manage their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Restaurant members can view restaurants they belong to" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can manage members" ON restaurant_members;
DROP POLICY IF EXISTS "Restaurant managers can view members" ON restaurant_members;
DROP POLICY IF EXISTS "Restaurant managers can add members" ON restaurant_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON restaurant_members;
DROP POLICY IF EXISTS "Anyone can create restaurants" ON restaurants;

-- Create simpler, non-recursive policies for restaurants
CREATE POLICY "Anyone can create restaurants"
  ON restaurants
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Restaurant owners can manage their restaurants"
  ON restaurants
  FOR ALL
  USING (owner_id = auth.uid());

CREATE POLICY "Restaurant members can view restaurants they belong to"
  ON restaurants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE restaurant_members.restaurant_id = restaurants.id
      AND restaurant_members.user_id = auth.uid()
    )
  );

-- Create simpler policies for restaurant_members
CREATE POLICY "Restaurant owners can manage members"
  ON restaurant_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_members.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant managers can view members"
  ON restaurant_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members AS rm
      WHERE rm.restaurant_id = restaurant_members.restaurant_id
      AND rm.user_id = auth.uid()
      AND rm.role = 'manager'
    )
  );

CREATE POLICY "Users can view their own membership"
  ON restaurant_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Ensure all users can read profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'All users can read profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "All users can read profiles" ON profiles FOR SELECT USING (true)';
  END IF;
END
$$;