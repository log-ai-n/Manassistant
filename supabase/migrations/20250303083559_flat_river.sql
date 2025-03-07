/*
  # Create restaurant invitations system

  1. New Tables
    - `restaurant_invitations`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, references restaurants)
      - `email` (text, required)
      - `role` (text, required)
      - `token` (text, unique)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)
      - `accepted` (boolean)
  2. Security
    - Enable RLS on `restaurant_invitations` table
    - Add policies for restaurant owners and managers
*/

-- Create restaurant_invitations table
CREATE TABLE IF NOT EXISTS restaurant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'chef')),
  token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  accepted BOOLEAN DEFAULT false,
  UNIQUE(restaurant_id, email)
);

-- Enable Row Level Security
ALTER TABLE restaurant_invitations ENABLE ROW LEVEL SECURITY;

-- Restaurant owners can manage invitations
CREATE POLICY "Restaurant owners can manage invitations"
  ON restaurant_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = restaurant_invitations.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Restaurant managers can manage invitations
CREATE POLICY "Restaurant managers can manage invitations"
  ON restaurant_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members
      WHERE restaurant_members.restaurant_id = restaurant_invitations.restaurant_id
      AND restaurant_members.user_id = auth.uid()
      AND restaurant_members.role = 'manager'
    )
  );

-- Users can view invitations by token (for accepting)
CREATE POLICY "Users can view invitations by token"
  ON restaurant_invitations
  FOR SELECT
  USING (true);

-- Create function to check if invitation is valid
CREATE OR REPLACE FUNCTION is_invitation_valid(invitation_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  invitation_record restaurant_invitations;
BEGIN
  SELECT * INTO invitation_record
  FROM restaurant_invitations
  WHERE token = invitation_token;
  
  IF invitation_record IS NULL THEN
    RETURN false;
  END IF;
  
  IF invitation_record.expires_at < now() THEN
    RETURN false;
  END IF;
  
  IF invitation_record.accepted = true THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;