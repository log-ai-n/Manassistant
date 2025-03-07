/*
  # Allergenie Schema Setup

  1. New Tables
    - menu_items: Stores restaurant menu items
    - ingredients: Master list of ingredients
    - allergens: Master list of allergens
    - menu_ingredients: Junction table for menu items and ingredients
    - menu_allergens: Direct allergen associations for menu items
    - ingredient_allergens: Allergen associations for ingredients

  2. Security
    - Enable RLS on all tables
    - Add policies for restaurant-specific access
    - Ensure proper data isolation between restaurants

  3. Changes
    - Add support for menu management
    - Add allergen tracking
    - Add ingredient management
*/

-- Create menu_items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ingredients table
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name)
);

-- Create allergens table
CREATE TABLE allergens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name)
);

-- Create menu_ingredients junction table
CREATE TABLE menu_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  optional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(menu_item_id, ingredient_id)
);

-- Create menu_allergens junction table
CREATE TABLE menu_allergens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  allergen_id UUID NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(menu_item_id, allergen_id)
);

-- Create ingredient_allergens junction table
CREATE TABLE ingredient_allergens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  allergen_id UUID NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ingredient_id, allergen_id)
);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_allergens ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_items
CREATE POLICY "Restaurant staff can view their menu items"
  ON menu_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE restaurant_id = menu_items.restaurant_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant managers can manage menu items"
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

-- Create policies for ingredients (shared across restaurants)
CREATE POLICY "Everyone can view ingredients"
  ON ingredients
  FOR SELECT
  USING (true);

CREATE POLICY "Restaurant managers can manage ingredients"
  ON ingredients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager', 'chef')
    )
  );

-- Create policies for allergens (shared across restaurants)
CREATE POLICY "Everyone can view allergens"
  ON allergens
  FOR SELECT
  USING (true);

CREATE POLICY "Restaurant managers can manage allergens"
  ON allergens
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager', 'chef')
    )
  );

-- Create policies for menu_ingredients
CREATE POLICY "Restaurant staff can view menu ingredients"
  ON menu_ingredients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM menu_items
      JOIN restaurant_members ON restaurant_members.restaurant_id = menu_items.restaurant_id
      WHERE menu_items.id = menu_ingredients.menu_item_id
      AND restaurant_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant managers can manage menu ingredients"
  ON menu_ingredients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM menu_items
      JOIN restaurant_members ON restaurant_members.restaurant_id = menu_items.restaurant_id
      WHERE menu_items.id = menu_ingredients.menu_item_id
      AND restaurant_members.user_id = auth.uid()
      AND restaurant_members.role IN ('owner', 'manager', 'chef')
    )
  );

-- Create policies for menu_allergens
CREATE POLICY "Restaurant staff can view menu allergens"
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

CREATE POLICY "Restaurant managers can manage menu allergens"
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

-- Create policies for ingredient_allergens
CREATE POLICY "Everyone can view ingredient allergens"
  ON ingredient_allergens
  FOR SELECT
  USING (true);

CREATE POLICY "Restaurant managers can manage ingredient allergens"
  ON ingredient_allergens
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'manager', 'chef')
    )
  );

-- Insert common allergens
INSERT INTO allergens (name, description, severity_level) VALUES
  ('Milk', 'Dairy products and lactose', 3),
  ('Eggs', 'All varieties of eggs', 3),
  ('Fish', 'All species of fish', 4),
  ('Shellfish', 'Crustaceans like shrimp, crab, and lobster', 4),
  ('Tree Nuts', 'Including almonds, walnuts, pecans, etc.', 5),
  ('Peanuts', 'Peanuts and peanut derivatives', 5),
  ('Wheat', 'All forms of wheat and gluten', 3),
  ('Soybeans', 'Soybeans and soy products', 3),
  ('Sesame', 'Sesame seeds and sesame oil', 4),
  ('Celery', 'Celery and celeriac', 2),
  ('Mustard', 'Mustard and mustard seeds', 2),
  ('Lupin', 'Lupin flour and seeds', 3),
  ('Sulphites', 'Sulphur dioxide and sulphites', 2)
ON CONFLICT (name) DO NOTHING;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allergens_updated_at
  BEFORE UPDATE ON allergens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();