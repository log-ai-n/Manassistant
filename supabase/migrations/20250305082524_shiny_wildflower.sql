-- Add temporary_password and password_changed columns if they don't exist
ALTER TABLE restaurant_members
ADD COLUMN IF NOT EXISTS temporary_password TEXT,
ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT false;

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

-- Update RLS policies
DROP POLICY IF EXISTS "members_owner_policy" ON restaurant_members;
DROP POLICY IF EXISTS "members_user_select_policy" ON restaurant_members;
DROP POLICY IF EXISTS "members_manager_select_policy" ON restaurant_members;
DROP POLICY IF EXISTS "members_manager_insert_policy" ON restaurant_members;

-- Create new policies
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

CREATE POLICY "members_self_select_policy"
  ON restaurant_members
  FOR SELECT
  USING (user_id = auth.uid());