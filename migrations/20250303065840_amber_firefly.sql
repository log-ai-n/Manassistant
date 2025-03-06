/*
  # Fix restaurant creation and policies

  1. Changes
    - Add a policy to allow users to create restaurants
    - Fix the restaurant_users table to properly handle new restaurants
    - Ensure restaurant_code is properly set for new restaurants
*/

-- Make sure restaurant_code is set for all restaurants
UPDATE restaurants 
SET restaurant_code = 'REST-' || SUBSTRING(gen_random_uuid()::text, 1, 8)
WHERE restaurant_code IS NULL;

-- Create a function to generate a restaurant code
CREATE OR REPLACE FUNCTION generate_restaurant_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.restaurant_code IS NULL THEN
    NEW.restaurant_code := 'REST-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate restaurant codes
DROP TRIGGER IF EXISTS set_restaurant_code ON restaurants;
CREATE TRIGGER set_restaurant_code
BEFORE INSERT ON restaurants
FOR EACH ROW
EXECUTE FUNCTION generate_restaurant_code();

-- Ensure the restaurant_users table is properly populated when a restaurant is created
CREATE OR REPLACE FUNCTION public.handle_new_restaurant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.restaurant_users (restaurant_id, user_id, role, email, username)
  SELECT 
    NEW.id, 
    NEW.owner_id, 
    'owner',
    (SELECT email FROM auth.users WHERE id = NEW.owner_id),
    (SELECT username FROM profiles WHERE id = NEW.owner_id)
  WHERE NEW.owner_id IS NOT NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is properly set
DROP TRIGGER IF EXISTS on_restaurant_created ON restaurants;
CREATE TRIGGER on_restaurant_created
  AFTER INSERT ON restaurants
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_restaurant();