/*
  # Add username support to profiles and restaurant_users tables

  1. Changes
    - Add username column to profiles table
    - Update handle_new_user function to store username
    - Update handle_new_restaurant function to include username
    - Add unique constraint on username in restaurant_users table
*/

-- Add username column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
  END IF;
END $$;

-- Update the handle_new_user function to store username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'username'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_restaurant function to include username
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

-- Add unique constraint on username within each restaurant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'restaurant_users_restaurant_id_username_key'
  ) THEN
    ALTER TABLE restaurant_users 
    ADD CONSTRAINT restaurant_users_restaurant_id_username_key 
    UNIQUE (restaurant_id, username);
  END IF;
END $$;

-- Update existing profiles with usernames if they don't have one
UPDATE profiles
SET username = LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9]', '_', 'g'))
FROM auth.users
WHERE profiles.id = auth.users.id
AND profiles.username IS NULL;

-- Update existing restaurant_users with usernames if they don't have one
UPDATE restaurant_users ru
SET username = p.username
FROM profiles p
WHERE ru.user_id = p.id
AND ru.username IS NULL
AND p.username IS NOT NULL;