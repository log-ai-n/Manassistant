/*
  # Restaurant Authentication Enhancements
  
  1. Changes
    - Add unique restaurant code format validation
    - Add restaurant status tracking
    - Add login attempt tracking
    - Add restaurant verification status
  
  2. Security
    - Enable RLS
    - Add policies for access control
*/

-- Add new columns to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS verification_status text CHECK (verification_status IN ('pending', 'verified', 'suspended')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamptz;

-- Create function to validate restaurant code format
CREATE OR REPLACE FUNCTION validate_restaurant_code()
RETURNS trigger AS $$
BEGIN
  -- Ensure restaurant code follows REST-XXXXXX format
  IF NEW.restaurant_code !~ '^REST-[A-Z0-9]{6}$' THEN
    RAISE EXCEPTION 'Invalid restaurant code format. Must be REST- followed by 6 alphanumeric characters';
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

-- Create function to generate unique restaurant code
CREATE OR REPLACE FUNCTION generate_unique_restaurant_code()
RETURNS text AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a random 6-character alphanumeric code
    new_code := 'REST-' || upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code exists
    SELECT EXISTS (
      SELECT 1 FROM restaurants WHERE restaurant_code = new_code
    ) INTO code_exists;
    
    -- Exit loop if unique code found
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to track failed login attempts
CREATE OR REPLACE FUNCTION track_failed_login()
RETURNS trigger AS $$
BEGIN
  -- Increment failed attempts and potentially lock account
  UPDATE restaurants 
  SET 
    failed_login_attempts = failed_login_attempts + 1,
    locked_until = CASE 
      WHEN failed_login_attempts >= 5 THEN NOW() + interval '15 minutes'
      ELSE locked_until 
    END
  WHERE id = NEW.restaurant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for failed login tracking
DROP TRIGGER IF EXISTS track_failed_login_trigger ON restaurant_members;
CREATE TRIGGER track_failed_login_trigger
  AFTER UPDATE OF failed_login_attempts ON restaurant_members
  FOR EACH ROW
  WHEN (NEW.failed_login_attempts > OLD.failed_login_attempts)
  EXECUTE FUNCTION track_failed_login();

-- Add RLS policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Policy for restaurant owners
CREATE POLICY "Restaurant owners can manage their restaurants"
  ON restaurants
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy for restaurant verification
CREATE POLICY "Verified restaurants can be accessed by staff"
  ON restaurants
  FOR SELECT
  TO authenticated
  USING (
    verification_status = 'verified' 
    AND active = true
    AND (locked_until IS NULL OR locked_until < NOW())
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_code ON restaurants (restaurant_code);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants (verification_status, active);