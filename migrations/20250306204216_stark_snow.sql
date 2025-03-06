/*
  # Update Restaurant Codes to 6-digit Format

  1. Changes
    - Updates all existing restaurants to use 6-digit numeric codes
    - Ensures uniqueness of codes
    - Maintains existing relationships and references

  2. Security
    - Preserves data integrity
    - Maintains existing permissions and RLS policies
*/

DO $$ 
DECLARE
  r RECORD;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Loop through all restaurants
  FOR r IN SELECT id FROM restaurants
  LOOP
    -- Generate a unique 6-digit code for each restaurant
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
    
    -- Update the restaurant with the new code
    UPDATE restaurants 
    SET restaurant_code = new_code
    WHERE id = r.id;
  END LOOP;
END $$;