-- Add email and full_name columns to restaurant_members if they don't exist
ALTER TABLE restaurant_members
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Create a function to hash passwords (using pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to verify passwords
CREATE OR REPLACE FUNCTION verify_member_password(
  p_username TEXT,
  p_password TEXT,
  p_restaurant_id UUID
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  restaurant_id UUID,
  role TEXT,
  username TEXT,
  full_name TEXT,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.user_id,
    m.restaurant_id,
    m.role,
    m.username,
    m.full_name,
    m.email
  FROM restaurant_members m
  WHERE 
    m.username = p_username
    AND m.restaurant_id = p_restaurant_id
    AND m.temporary_password = p_password
    AND m.password_changed = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policies for direct member authentication
DROP POLICY IF EXISTS "members_self_select_policy" ON restaurant_members;
CREATE POLICY "members_self_select_policy" ON restaurant_members
  FOR SELECT
  USING (
    id IN (
      SELECT m.id FROM restaurant_members m
      WHERE m.username = current_setting('app.current_username', true)::text
      AND m.restaurant_id = current_setting('app.current_restaurant_id', true)::uuid
    )
  );