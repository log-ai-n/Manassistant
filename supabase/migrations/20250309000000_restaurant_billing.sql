/*
  # Restaurant Billing System

  1. Changes
    - Create bills table for restaurant invoices
    - Create bill_items table for individual line items
    - Create RLS policies for security
  2. Security
    - Maintain RLS protection
    - Allow proper access patterns for owners and managers
*/

-- Create bills table for restaurant invoices
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  bill_number TEXT NOT NULL,
  bill_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bill_items table for individual line items
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Auto-update the updated_at column
CREATE TRIGGER set_bills_updated_at
BEFORE UPDATE ON bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_bill_items_updated_at
BEFORE UPDATE ON bill_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create RLS policies for bills
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

-- Restaurant owners can manage all bills
CREATE POLICY "Restaurant owners can manage bills"
  ON bills
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants
      WHERE owner_id = auth.uid()
    )
  );

-- Restaurant managers can manage bills
CREATE POLICY "Restaurant managers can manage bills"
  ON bills
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_members AS rm
      WHERE rm.restaurant_id = bills.restaurant_id
      AND rm.user_id = auth.uid()
      AND rm.role = 'manager'
    )
  );

-- Restaurant owners can manage bill items
CREATE POLICY "Restaurant owners can manage bill items"
  ON bill_items
  FOR ALL
  USING (
    bill_id IN (
      SELECT b.id FROM bills b
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Restaurant managers can manage bill items
CREATE POLICY "Restaurant managers can manage bill items"
  ON bill_items
  FOR ALL
  USING (
    bill_id IN (
      SELECT b.id FROM bills b
      WHERE EXISTS (
        SELECT 1 FROM restaurant_members AS rm
        WHERE rm.restaurant_id = b.restaurant_id
        AND rm.user_id = auth.uid()
        AND rm.role = 'manager'
      )
    )
  ); 