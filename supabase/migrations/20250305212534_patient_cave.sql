/*
  # Member Authentication Schema Update

  1. Changes
    - Add temporary password columns to restaurant_members
    - Add credential verification function
    - Update member access policies

  2. Security
    - Add secure member authentication
    - Update RLS policies for proper access control
*/

-- Add temporary_password and password_changed columns if they don't exist
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

-- Create function to verify member credentials
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

-- Drop existing policies safely
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'members_owner_policy' AND tablename = 'restaurant_members') THEN
    DROP POLICY members_owner_policy ON restaurant_members;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'members_user_select_policy' AND tablename = 'restaurant_members') THEN
    DROP POLICY members_user_select_policy ON restaurant_members;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'members_manager_select_policy' AND tablename = 'restaurant_members') THEN
    DROP POLICY members_manager_select_policy ON restaurant_members;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'members_manager_insert_policy' AND tablename = 'restaurant_members') THEN
    DROP POLICY members_manager_insert_policy ON restaurant_members;
  END IF;
END $$;

-- Create new policies with existence checks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'members_owner_all_policy' AND tablename = 'restaurant_members') THEN
    CREATE POLICY "members_owner_all_policy"
      ON restaurant_members
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM restaurants
          WHERE id = restaurant_members.restaurant_id
          AND owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'members_manager_select_policy' AND tablename = 'restaurant_members') THEN
    CREATE POLICY "members_manager_select_policy"
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
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'members_self_select_policy' AND tablename = 'restaurant_members') THEN
    CREATE POLICY "members_self_select_policy"
      ON restaurant_members
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;