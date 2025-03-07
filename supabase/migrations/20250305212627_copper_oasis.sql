/*
  # Member Authentication Setup

  1. Changes
    - Add temporary password and password changed columns
    - Add unique constraint for usernames within restaurants
    - Add credential verification function
    - Update member access policies

  2. Security
    - Ensure unique usernames per restaurant
    - Add secure member authentication
    - Update RLS policies for proper access control
*/

-- Add columns for member authentication if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurant_members' 
    AND column_name = 'temporary_password'
  ) THEN
    ALTER TABLE restaurant_members ADD COLUMN temporary_password TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurant_members' 
    AND column_name = 'password_changed'
  ) THEN
    ALTER TABLE restaurant_members ADD COLUMN password_changed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add unique constraint for username within restaurant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'restaurant_members_restaurant_username_unique'
  ) THEN
    ALTER TABLE restaurant_members
    ADD CONSTRAINT restaurant_members_restaurant_username_unique 
    UNIQUE (restaurant_id, username);
  END IF;
END $$;

-- Create or replace function to verify member credentials
CREATE OR REPLACE FUNCTION verify_member_credentials(
  p_username TEXT,
  p_password TEXT,
  p_restaurant_id UUID
) RETURNS TABLE (
  id UUID,
  restaurant_id UUID,
  role TEXT,
  username TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.restaurant_id,
    m.role,
    m.username
  FROM restaurant_members m
  WHERE 
    m.username = p_username
    AND m.restaurant_id = p_restaurant_id
    AND m.temporary_password = p_password
    AND m.password_changed = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely drop and recreate policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  EXECUTE format('DROP POLICY IF EXISTS %I ON restaurant_members', 'members_owner_policy');
  EXECUTE format('DROP POLICY IF EXISTS %I ON restaurant_members', 'members_user_select_policy');
  EXECUTE format('DROP POLICY IF EXISTS %I ON restaurant_members', 'members_manager_select_policy');
  EXECUTE format('DROP POLICY IF EXISTS %I ON restaurant_members', 'members_manager_insert_policy');
  EXECUTE format('DROP POLICY IF EXISTS %I ON restaurant_members', 'members_owner_all_policy');
  EXECUTE format('DROP POLICY IF EXISTS %I ON restaurant_members', 'members_self_select_policy');
END $$;

-- Create new policies with unique names
CREATE POLICY "members_owner_full_access_policy"
  ON restaurant_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE id = restaurant_members.restaurant_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "members_manager_view_policy"
  ON restaurant_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE restaurant_id = restaurant_members.restaurant_id
      AND user_id = auth.uid()
      AND role = 'manager'
    )
  );

CREATE POLICY "members_view_own_policy"
  ON restaurant_members
  FOR SELECT
  USING (user_id = auth.uid());