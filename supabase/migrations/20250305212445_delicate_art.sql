/*
  # Menu System Schema

  1. New Tables
    - menu_categories
      - id (uuid, primary key)
      - name (text, unique)
      - description (text)
      - created_at (timestamptz)
    
    - menu_items
      - id (uuid, primary key) 
      - restaurant_id (uuid, foreign key)
      - name (text)
      - description (text)
      - category (text)
      - price (decimal)
      - active (boolean)
      - created_at/updated_at (timestamptz)

    - menu_allergens
      - id (uuid, primary key)
      - menu_item_id (uuid, foreign key)
      - allergen_id (uuid, foreign key)
      - severity (enum)
      - notes (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for staff access
    - Add policies for allergen management

  3. Data
    - Insert default menu categories
    - Add validation triggers
*/

-- Create menu categories table
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name)
);

-- Insert common menu categories
INSERT INTO menu_categories (name, description) VALUES
  ('Appetizers', 'Starters and small plates'),
  ('Soups & Salads', 'Fresh salads and hot soups'),
  ('Main Courses', 'Primary entrée dishes'),
  ('Sandwiches', 'Burgers and sandwiches'),
  ('Sides', 'Side dishes and accompaniments'),
  ('Desserts', 'Sweet treats and desserts'),
  ('Beverages', 'Drinks and refreshments'),
  ('Specials', 'Daily or seasonal specials')
ON CONFLICT (name) DO NOTHING;

-- Create allergen severity levels enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'allergen_severity') THEN
    CREATE TYPE allergen_severity AS ENUM ('Low', 'Medium', 'High');
  END IF;
END $$;

-- Create menu_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, name)
);

-- Create menu_allergens table if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_allergens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  allergen_id UUID NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  severity allergen_severity NOT NULL DEFAULT 'Low',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(menu_item_id, allergen_id)
);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_items
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'restaurant_staff_view_menu') THEN
    CREATE POLICY "restaurant_staff_view_menu"
      ON menu_items
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM restaurant_members
          WHERE restaurant_id = menu_items.restaurant_id
          AND user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'restaurant_staff_manage_menu') THEN
    CREATE POLICY "restaurant_staff_manage_menu"
      ON menu_items
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM restaurant_members
          WHERE restaurant_id = menu_items.restaurant_id
          AND user_id = auth.uid()
          AND role IN ('owner', 'manager', 'chef')
        )
      );
  END IF;
END $$;

-- Create policies for menu_allergens
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'restaurant_staff_view_allergens') THEN
    CREATE POLICY "restaurant_staff_view_allergens"
      ON menu_allergens
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM menu_items
          JOIN restaurant_members ON restaurant_members.restaurant_id = menu_items.restaurant_id
          WHERE menu_items.id = menu_allergens.menu_item_id
          AND restaurant_members.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'restaurant_staff_manage_allergens') THEN
    CREATE POLICY "restaurant_staff_manage_allergens"
      ON menu_allergens
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM menu_items
          JOIN restaurant_members ON restaurant_members.restaurant_id = menu_items.restaurant_id
          WHERE menu_items.id = menu_allergens.menu_item_id
          AND restaurant_members.user_id = auth.uid()
          AND restaurant_members.role IN ('owner', 'manager', 'chef')
        )
      );
  END IF;
END $$;

-- Create policies for menu_categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anyone_can_view_categories') THEN
    CREATE POLICY "anyone_can_view_categories"
      ON menu_categories
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for menu_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_menu_items_updated_at') THEN
    CREATE TRIGGER update_menu_items_updated_at
      BEFORE UPDATE ON menu_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create function to validate menu item data
CREATE OR REPLACE FUNCTION validate_menu_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate price
  IF NEW.price IS NOT NULL AND NEW.price < 0 THEN
    RAISE EXCEPTION 'Price cannot be negative';
  END IF;

  -- Validate category exists
  IF NOT EXISTS (SELECT 1 FROM menu_categories WHERE name = NEW.category) THEN
    INSERT INTO menu_categories (name) VALUES (NEW.category);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for menu item validation if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_menu_item_trigger') THEN
    CREATE TRIGGER validate_menu_item_trigger
      BEFORE INSERT OR UPDATE ON menu_items
      FOR EACH ROW
      EXECUTE FUNCTION validate_menu_item();
  END IF;
END $$;