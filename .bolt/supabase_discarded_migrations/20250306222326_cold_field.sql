/*
  # Staff Authentication Setup
  
  1. Changes
    - Add temporary password and login tracking to restaurant_members
    - Add restaurant code validation
  
  2. Security
    - Enable RLS
    - Add policies for access control
*/

-- Add authentication fields to restaurant_members
ALTER TABLE restaurant_members 
ADD COLUMN IF NOT EXISTS temporary_password text,
ADD COLUMN IF NOT EXISTS password_changed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- Create function to validate restaurant code format
CREATE OR REPLACE FUNCTION validate_restaurant_code()
RETURNS trigger AS $$
BEGIN
  -- Ensure restaurant code follows REST-XXXXXX format
  IF NEW.restaurant_code !~ '^REST-[A-Z0-9]{6}$' THEN
    NEW.restaurant_code := 'REST-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for restaurant code validation
DROP TRIGGER IF EXISTS validate_restaurant_code_trigger ON restaurants;
CREATE TRIGGER validate_restaurant_code_trigger
  BEFORE INSERT OR UPDATE OF restaurant_code ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION validate_restaurant_code();

-- Add RLS policies
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;

-- Policy for staff authentication
CREATE POLICY "Allow staff to authenticate"
  ON restaurant_members
  FOR SELECT
  TO public
  USING (true);

-- Policy for managing staff members
CREATE POLICY "Restaurant managers can manage staff"
  ON restaurant_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE restaurant_id = restaurant_members.restaurant_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );