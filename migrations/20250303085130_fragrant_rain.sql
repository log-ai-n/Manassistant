/*
  # Add AI-powered features

  1. New Features
    - Add new AI-powered features to the feature_key enum
    - Add default descriptions for the new features
  
  2. Updates
    - Ensure existing restaurants can access these new features
*/

-- Add new feature keys to existing restaurants that have features enabled
INSERT INTO restaurant_features (restaurant_id, feature_key, is_enabled)
SELECT DISTINCT
  r.id,
  f.feature_key,
  false
FROM
  restaurants r
CROSS JOIN (
  VALUES
    ('allergenie'),
    ('review_hub'),
    ('foh_chatbot'),
    ('boh_chatbot'),
    ('store_logai'),
    ('guest_simulator')
) AS f(feature_key)
WHERE
  r.active = true
  AND NOT EXISTS (
    SELECT 1
    FROM restaurant_features rf
    WHERE rf.restaurant_id = r.id
    AND rf.feature_key = f.feature_key
  );

-- Create function to automatically add these features to new restaurants
CREATE OR REPLACE FUNCTION public.create_default_modules()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.restaurant_modules (restaurant_id, module_name, is_enabled)
  VALUES
    (NEW.id, 'menu', true),
    (NEW.id, 'inventory', true),
    (NEW.id, 'staff', true),
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