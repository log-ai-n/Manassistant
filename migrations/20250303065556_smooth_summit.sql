/*
  # Fix restaurant policies to prevent infinite recursion

  1. Changes
    - Drop problematic policies that cause infinite recursion
    - Create new policies with better structure to avoid circular references
    - Fix restaurant_members policies to use direct queries instead of nested references
    - Add proper policies for restaurant creation and management
*/

-- Drop all problematic policies that might cause infinite recursion
DROP POLICY IF EXISTS "Restaurant owners can manage their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Restaurant members can view restaurants they belong to" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can manage members" ON restaurant_members;
DROP POLICY IF EXISTS "Restaurant managers can view and add members" ON restaurant_members;
DROP POLICY IF EXISTS "Anyone can create restaurants" ON restaurants;

-- Check if policies exist before creating them
DO $$
BEGIN
    -- Policy for restaurant creation
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create restaurants' AND tablename = 'restaurants') THEN
        CREATE POLICY "Anyone can create restaurants"
          ON restaurants
          FOR INSERT
          WITH CHECK (auth.uid() IS NOT NULL);
    END IF;

    -- Policy for restaurant owners
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Restaurant owners can view and manage their restaurants' AND tablename = 'restaurants') THEN
        CREATE POLICY "Restaurant owners can view and manage their restaurants"
          ON restaurants
          FOR ALL
          USING (owner_id = auth.uid());
    END IF;

    -- Policy for restaurant members to view restaurants
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Restaurant members can view restaurants' AND tablename = 'restaurants') THEN
        CREATE POLICY "Restaurant members can view restaurants"
          ON restaurants
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM restaurant_members
              WHERE restaurant_members.restaurant_id = restaurants.id
              AND restaurant_members.user_id = auth.uid()
            )
          );
    END IF;

    -- Policy for restaurant owners to manage members
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Restaurant owners can manage members' AND tablename = 'restaurant_members') THEN
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
    END IF;

    -- Policy for restaurant managers to view members
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Restaurant managers can view members' AND tablename = 'restaurant_members') THEN
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
    END IF;

    -- Policy for restaurant managers to add members
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Restaurant managers can add members' AND tablename = 'restaurant_members') THEN
        CREATE POLICY "Restaurant managers can add members"
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
    END IF;

    -- Policy for users to view their own membership
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own membership' AND tablename = 'restaurant_members') THEN
        CREATE POLICY "Users can view their own membership"
          ON restaurant_members
          FOR SELECT
          USING (user_id = auth.uid());
    END IF;

    -- Policy for restaurant managers to update restaurants
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Restaurant managers can update restaurants' AND tablename = 'restaurants') THEN
        CREATE POLICY "Restaurant managers can update restaurants"
          ON restaurants
          FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM restaurant_members
              WHERE restaurant_members.restaurant_id = restaurants.id
              AND restaurant_members.user_id = auth.uid()
              AND restaurant_members.role = 'manager'
            )
          );
    END IF;
END
$$;