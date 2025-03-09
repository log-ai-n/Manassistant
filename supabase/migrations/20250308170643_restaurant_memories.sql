-- Description: Creates a memories system for storing and retrieving restaurant-specific information
-- for AI assistant features

-- Create memories table for storing restaurant-related information
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    memory_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    context TEXT,
    importance INT DEFAULT 1,
    last_accessed TIMESTAMPTZ
);

-- Add index for faster retrieval by restaurant_id
CREATE INDEX idx_memories_restaurant_id ON memories(restaurant_id);

-- Add index for searching memory content
CREATE INDEX idx_memories_content_gin ON memories USING gin(memory_content gin_trgm_ops);

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow restaurant owners and members to view memories for their restaurant
CREATE POLICY select_memories ON memories
FOR SELECT
USING (
    restaurant_id IN (
        SELECT r.id FROM restaurants r
        JOIN restaurant_members rm ON r.id = rm.restaurant_id
        WHERE rm.user_id = auth.uid()
        UNION
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
);

-- Allow restaurant owners and members with appropriate roles to insert memories
CREATE POLICY insert_memories ON memories
FOR INSERT
WITH CHECK (
    restaurant_id IN (
        SELECT r.id FROM restaurants r
        JOIN restaurant_members rm ON r.id = rm.restaurant_id
        WHERE rm.user_id = auth.uid() AND rm.role IN ('owner', 'manager', 'staff')
        UNION
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
);

-- Allow restaurant owners and members with appropriate roles to update memories
CREATE POLICY update_memories ON memories
FOR UPDATE
USING (
    restaurant_id IN (
        SELECT r.id FROM restaurants r
        JOIN restaurant_members rm ON r.id = rm.restaurant_id
        WHERE rm.user_id = auth.uid() AND rm.role IN ('owner', 'manager')
        UNION
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
)
WITH CHECK (
    restaurant_id IN (
        SELECT r.id FROM restaurants r
        JOIN restaurant_members rm ON r.id = rm.restaurant_id
        WHERE rm.user_id = auth.uid() AND rm.role IN ('owner', 'manager')
        UNION
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
);

-- Allow restaurant owners to delete memories
CREATE POLICY delete_memories ON memories
FOR DELETE
USING (
    restaurant_id IN (
        SELECT r.id FROM restaurants r
        JOIN restaurant_members rm ON r.id = rm.restaurant_id
        WHERE rm.user_id = auth.uid() AND rm.role = 'owner'
        UNION
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
);

-- Function to automatically update last_accessed timestamp when memory is retrieved
CREATE OR REPLACE FUNCTION update_memory_access_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE memories
    SET last_accessed = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when a memory is selected
CREATE TRIGGER memory_accessed
AFTER SELECT ON memories
FOR EACH ROW
EXECUTE FUNCTION update_memory_access_timestamp();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_memories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on memory update
CREATE TRIGGER update_memories_timestamp
BEFORE UPDATE ON memories
FOR EACH ROW
EXECUTE FUNCTION update_memories_updated_at(); 