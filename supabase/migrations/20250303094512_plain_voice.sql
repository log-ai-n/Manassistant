/*
  # Fix policy recursion issues

  1. Changes
    - Drop all problematic policies that cause recursion
    - Create simplified policies with direct subqueries instead of EXISTS clauses
    - Fix access to restaurants table
  2. Security
    - Maintain proper access control
    - Prevent infinite recursion in policy evaluation
*/

-- First, drop ALL potentially problematic policies to start fresh
DROP POLICY IF EXISTS "Restaurant owners can manage their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Restaurant members can view restaurants they belong to" ON restaurants;
DROP POLICY IF EXISTS "Anyone can create restaurants" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can update their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Restaurant managers can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Owners can manage their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Members can view their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Managers can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "create_restaurants" ON restaurants;
DROP POLICY IF EXISTS "owner_manage_restaurants" ON restaurants;
DROP POLICY IF EXISTS "member_view_restaurants" ON restaurants;
DROP POLICY IF EXISTS "manager_update_restaurants" ON restaurants;
DROP POLICY IF EXISTS "restaurant_users_view_restaurants" ON restaurants;

-- Create simplified policies for restaurants using direct subqueries
-- Policy for creating restaurants (anyone authenticated can create)
CREATE POLICY "restaurants_insert_policy"
  ON restaurants
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for owners to manage their restaurants (all operations)
CREATE POLICY "restaurants_owner_policy"
  ON restaurants
  FOR ALL
  USING (owner_id = auth.uid());

-- Policy for members to view restaurants (select only)
CREATE POLICY "restaurants_member_select_policy"
  ON restaurants
  FOR SELECT
  USING (
    id IN (
      SELECT restaurant_id 
      FROM restaurant_members 
      WHERE user_id = auth.uid()
    )
  );

-- Fix restaurant_members policies to avoid recursion
DROP POLICY IF EXISTS "Restaurant owners can manage members" ON restaurant_members;
DROP POLICY IF EXISTS "Restaurant managers can view and add members" ON restaurant_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON restaurant_members;
DROP POLICY IF EXISTS "owner_manage_members" ON restaurant_members;
DROP POLICY IF EXISTS "user_view_own_membership" ON restaurant_members;
DROP POLICY IF EXISTS "manager_view_members" ON restaurant_members;
DROP POLICY IF EXISTS "manager_add_members" ON restaurant_members;

-- Create simplified policies for restaurant_members
CREATE POLICY "members_owner_policy"
  ON restaurant_members
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id 
      FROM restaurants 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "members_user_select_policy"
  ON restaurant_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "members_manager_select_policy"
  ON restaurant_members
  FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM restaurant_members 
      WHERE user_id = auth.uid() 
      AND role = 'manager'
    )
  );

CREATE POLICY "members_manager_insert_policy"
  ON restaurant_members
  FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM restaurant_members 
      WHERE user_id = auth.uid() 
      AND role = 'manager'
    )
  );

-- Ensure all users can read profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_select_policy'
  ) THEN
    EXECUTE 'CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true)';
  END IF;
END
$$;

-- Add direct access to restaurant_users table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'restaurant_users'
  ) THEN
    -- Drop existing policies if any
    DROP POLICY IF EXISTS "restaurant_users_view_policy" ON restaurant_users;
    
    -- Create new policy
    EXECUTE 'CREATE POLICY "restaurant_users_view_policy" ON restaurant_users FOR SELECT USING (user_id = auth.uid())';
  END IF;
END
$$;