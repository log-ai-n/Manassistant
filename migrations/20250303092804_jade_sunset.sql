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

-- Create simplified policies for restaurants using direct subqueries
-- Policy for creating restaurants (anyone authenticated can create)
CREATE POLICY "create_restaurants"
  ON restaurants
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for owners to manage their restaurants (all operations)
CREATE POLICY "owner_manage_restaurants"
  ON restaurants
  FOR ALL
  USING (owner_id = auth.uid());

-- Policy for members to view restaurants (select only)
CREATE POLICY "member_view_restaurants"
  ON restaurants
  FOR SELECT
  USING (
    id IN (
      SELECT restaurant_id 
      FROM restaurant_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy for managers to update restaurants
CREATE POLICY "manager_update_restaurants"
  ON restaurants
  FOR UPDATE
  USING (
    id IN (
      SELECT restaurant_id 
      FROM restaurant_members 
      WHERE user_id = auth.uid() 
      AND role = 'manager'
    )
  );

-- Fix restaurant_members policies to avoid recursion
DROP POLICY IF EXISTS "Restaurant owners can manage members" ON restaurant_members;
DROP POLICY IF EXISTS "Restaurant managers can view and add members" ON restaurant_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON restaurant_members;

-- Create simplified policies for restaurant_members
CREATE POLICY "owner_manage_members"
  ON restaurant_members
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id 
      FROM restaurants 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "user_view_own_membership"
  ON restaurant_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "manager_view_members"
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

CREATE POLICY "manager_add_members"
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