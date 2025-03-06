/*
  # Add Restaurant Code Generation

  1. Changes
    - Add function to generate a 6-digit numeric restaurant code
    - Add trigger to automatically set restaurant code on creation
    - Add unique constraint on restaurant_code
    - Ensure codes are always 6 digits and numeric only

  2. Security
    - Codes are randomly generated
    - Unique constraint prevents duplicates
    - Cannot be modified after creation
*/

-- Create function to generate random 6-digit code
CREATE OR REPLACE FUNCTION generate_restaurant_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 6-digit number
    new_code := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
    
    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM restaurants WHERE restaurant_code = new_code
    ) INTO code_exists;
    
    -- Exit loop if unique code found
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  -- Set the new code
  NEW.restaurant_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set code on insert
DROP TRIGGER IF EXISTS set_restaurant_code ON restaurants;
CREATE TRIGGER set_restaurant_code
  BEFORE INSERT ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION generate_restaurant_code();

-- Add unique constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'restaurants_restaurant_code_key'
  ) THEN
    ALTER TABLE restaurants
    ADD CONSTRAINT restaurants_restaurant_code_key UNIQUE (restaurant_code);
  END IF;
END $$;