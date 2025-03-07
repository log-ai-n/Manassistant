/*
  # Fix Restaurant Relationships

  1. Changes
    - Drop all dependent policies that reference owner_id
    - Add proper foreign key relationship between restaurants and profiles tables
    - Recreate policies with correct relationships
    - Add necessary indexes for performance

  2. Security
    - Maintain existing RLS policies
    - Ensure proper data access control
*/

-- First drop ALL dependent policies that reference owner_id
DROP POLICY IF EXISTS "Restaurant owners can manage their menu items" ON menu_items;
DROP POLICY IF EXISTS "Restaurant owners can manage their allergens" ON menu_allergens;
DROP POLICY IF EXISTS "Restaurant owners can manage invitations" ON restaurant_invitations;
DROP POLICY IF EXISTS "restaurants_owner_access" ON restaurants;
DROP POLICY IF EXISTS "Restaurant owners can manage features" ON restaurant_features;

-- Now handle the owner_id column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' 
    AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE restaurants 
    DROP CONSTRAINT IF EXISTS restaurants_owner_id_fkey;
  END IF;
END $$;

-- Update the owner_id column to reference profiles
ALTER TABLE restaurants
ALTER COLUMN owner_id TYPE UUID USING owner_id::UUID,
ADD CONSTRAINT restaurants_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES profiles(id) 
ON DELETE SET NULL;

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS restaurants_owner_id_idx ON restaurants(owner_id);

-- Recreate all the policies with correct relationships
CREATE POLICY "restaurants_owner_access"
  ON restaurants
  FOR ALL
  USING (
    owner_id IN (
      SELECT id FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can manage their menu items"
  ON menu_items
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can manage their allergens"
  ON menu_allergens
  FOR ALL
  USING (
    menu_item_id IN (
      SELECT id FROM menu_items
      WHERE restaurant_id IN (
        SELECT id FROM restaurants
        WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Restaurant owners can manage invitations"
  ON restaurant_invitations
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can manage features"
  ON restaurant_features
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE owner_id = auth.uid()
    )
  );