/*
  # Remove staff management from features list

  1. Updates
    - Remove staff_management from restaurant_features as it's always enabled
    - Update default features creation to exclude staff_management
*/

-- Remove staff_management from restaurant_features
DELETE FROM restaurant_features
WHERE feature_key = 'staff_management';

-- Update the create_default_modules function to exclude staff_management
CREATE OR REPLACE FUNCTION public.create_default_modules()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_enabled)
  VALUES
    (NEW.id, 'menu', true),
    (NEW.id, 'inventory', true),
    (NEW.id, 'reservations', false),
    (NEW.id, 'analytics', false),
    (NEW.id, 'online_ordering', false),
    (NEW.id, 'loyalty', false),
    (NEW.id, 'kitchen_display', false),
    (NEW.id, 'allergenie', false),
    (NEW.id, 'review_hub', false),
    (NEW.id, 'foh_chatbot', false),
    (NEW.id, 'boh_chatbot', false),
    (NEW.id, 'store_logai', false),
    (NEW.id, 'guest_simulator', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;