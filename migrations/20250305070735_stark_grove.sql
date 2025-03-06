/*
  # Add credentials to restaurant_members

  1. Changes
    - Add username and temporary_password columns to restaurant_members
    - Add unique constraint on username per restaurant
    - Add function to generate random username
*/

-- Add new columns to restaurant_members
ALTER TABLE restaurant_members
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS temporary_password TEXT,
ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT false;

-- Add unique constraint for username within a restaurant
ALTER TABLE restaurant_members
ADD CONSTRAINT restaurant_members_restaurant_username_unique 
UNIQUE (restaurant_id, username);

-- Create function to generate a random username
CREATE OR REPLACE FUNCTION generate_member_username(restaurant_code TEXT, full_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Create base username from restaurant code and name
  base_username := LOWER(
    restaurant_code || '_' ||
    REGEXP_REPLACE(
      SPLIT_PART(full_name, ' ', 1), -- Take first name
      '[^a-zA-Z0-9]', -- Remove special characters
      '', 
      'g'
    )
  );
  
  final_username := base_username;
  
  -- Check if username exists and append number if needed
  WHILE EXISTS (
    SELECT 1 FROM restaurant_members 
    WHERE username = final_username
  ) LOOP
    counter := counter + 1;
    final_username := base_username || counter;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql;