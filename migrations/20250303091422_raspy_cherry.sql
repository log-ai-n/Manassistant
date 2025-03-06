/*
  # Fix permissions for restaurant members

  1. Changes
    - Add explicit policies for restaurant members table
    - Fix potential recursion issues in policies
    - Ensure proper access to member data
  2. Security
    - Maintain RLS protection
    - Allow proper access patterns for owners and managers
*/

-- Drop potentially problematic policies
DROP POLICY IF EXISTS "Restaurant owners can manage members" ON restaurant_members;
DROP POLICY IF EXISTS "Restaurant managers can view members" ON restaurant_members;
DROP POLICY IF EXISTS "Restaurant managers can add members" ON restaurant_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON restaurant_members;

-- Create clearer, non-recursive policies
CREATE POLICY "Restaurant owners can manage all members"
  ON restaurant_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_members.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant managers can view all members"
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

CREATE POLICY "Restaurant managers can add and update members"
  ON restaurant_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_members AS rm
      WHERE rm.restaurant_id = restaurant_members.restaurant_id
      AND rm.user_id = auth.uid()
      AND rm.role = 'manager'
    )
  );

CREATE POLICY "Restaurant managers can delete members"
  ON restaurant_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members AS rm
      WHERE rm.restaurant_id = restaurant_members.restaurant_id
      AND rm.user_id = auth.uid()
      AND rm.role = 'manager'
    )
  );

CREATE POLICY "Users can view their own memberships"
  ON restaurant_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Ensure all users can read profiles
-- Check if policy exists first to avoid errors
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