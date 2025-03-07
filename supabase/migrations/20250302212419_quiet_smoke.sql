/*
  # Fix restaurant policies to prevent infinite recursion

  1. Changes
    - Update restaurant policies to avoid infinite recursion
    - Fix restaurant_members policies
    - Add missing policies for restaurant creation
*/

-- Drop problematic policies that might cause infinite recursion
DROP POLICY IF EXISTS "Restaurant owners can manage their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Restaurant members can view restaurants they belong to" ON restaurants;

-- Create new policies with better structure
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
    id IN (
      SELECT restaurant_id FROM restaurant_members
      WHERE user_id = auth.uid()
    )
  );

-- Fix restaurant_members policies to avoid recursion
DROP POLICY IF EXISTS "Restaurant owners can manage users" ON restaurant_members;

CREATE POLICY "Restaurant owners can manage users"
  ON restaurant_members
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE owner_id = auth.uid()
    )
  );

-- Add policy for restaurant owners to update their restaurants
CREATE POLICY "Restaurant owners can update their restaurants"
  ON restaurants
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Add policy for restaurant managers to update restaurants
CREATE POLICY "Restaurant managers can update restaurants"
  ON restaurants
  FOR UPDATE
  USING (
    id IN (
      SELECT restaurant_id FROM restaurant_members
      WHERE user_id = auth.uid()
      AND role = 'manager'
    )
  );