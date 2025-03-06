/*
  # Fix Restaurant Owner Relationship

  1. Changes
    - Add proper foreign key relationship between restaurants and profiles tables
    - Update RLS policies to use the correct relationship

  2. Security
    - Maintain existing RLS policies
    - Ensure proper data relationships
*/

-- First ensure the owner_id column exists and has the correct type
DO $$ 
BEGIN
  -- Check if owner_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' 
    AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  ELSE
    -- If it exists, ensure it has the correct foreign key
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'restaurants_owner_id_fkey'
    ) THEN
      ALTER TABLE restaurants 
      ADD CONSTRAINT restaurants_owner_id_fkey 
      FOREIGN KEY (owner_id) 
      REFERENCES auth.users(id) 
      ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Ensure we have the correct indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'restaurants' 
    AND indexname = 'restaurants_owner_id_idx'
  ) THEN
    CREATE INDEX restaurants_owner_id_idx ON restaurants(owner_id);
  END IF;
END $$;

-- Update or create the owner access policy
DO $$ 
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS %I ON restaurants', 'restaurants_owner_access');
END $$;

CREATE POLICY "restaurants_owner_access"
ON restaurants
FOR ALL
USING (owner_id = auth.uid());