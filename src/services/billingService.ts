import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export type Bill = {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  bill_number: string;
  bill_date: string;
  due_date?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type BillItem = {
  id: string;
  bill_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
  updated_at: string;
};

export type CreateBillParams = Omit<Bill, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBillParams = Partial<Omit<Bill, 'id' | 'created_at' | 'updated_at'>>;
export type CreateBillItemParams = Omit<BillItem, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBillItemParams = Partial<Omit<BillItem, 'id' | 'created_at' | 'updated_at'>>;

/**
 * Fetches bills for a specific restaurant with optional filtering
 * @param restaurantId The restaurant ID to fetch bills for
 * @param status Optional status filter
 * @param limit Maximum number of bills to fetch
 * @param offset Pagination offset
 * @returns Array of bills and count
 */
export const getBills = async (
  restaurantId: string,
  status?: Bill['status'],
  limit = 10,
  offset = 0
): Promise<{ bills: Bill[]; count: number }> => {
  let query = supabase
    .from('bills')
    .select('*', { count: 'exact' })
    .eq('restaurant_id', restaurantId)
    .order('bill_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching bills:', error);
    return { bills: [], count: 0 };
  }

  return { bills: data as Bill[], count: count || 0 };
};

/**
 * Fetches a single bill by ID with all its items
 * @param billId The bill ID to fetch
 * @returns The bill with items or null if not found
 */
export const getBillWithItems = async (
  billId: string
): Promise<{ bill: Bill; items: BillItem[] } | null> => {
  // Fetch the bill
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .select('*')
    .eq('id', billId)
    .single();

  if (billError) {
    console.error('Error fetching bill:', billError);
    return null;
  }

  // Fetch the bill items
  const { data: items, error: itemsError } = await supabase
    .from('bill_items')
    .select('*')
    .eq('bill_id', billId);

  if (itemsError) {
    console.error('Error fetching bill items:', itemsError);
    return null;
  }

  return { bill: bill as Bill, items: items as BillItem[] };
};

/**
 * Creates a new bill with optional items
 * @param billData The bill data to create
 * @param items Optional bill items to create with the bill
 * @returns The created bill and items or null if creation failed
 */
export const createBill = async (
  billData: CreateBillParams,
  items?: CreateBillItemParams[]
): Promise<{ bill: Bill; items: BillItem[] } | null> => {
  // Start a transaction
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .insert(billData)
    .select()
    .single();

  if (billError) {
    console.error('Error creating bill:', billError);
    return null;
  }

  // If there are items, create them
  if (items && items.length > 0) {
    // Update bill_id in all items
    const itemsWithBillId = items.map(item => ({
      ...item,
      bill_id: bill.id
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('bill_items')
      .insert(itemsWithBillId)
      .select();

    if (itemsError) {
      console.error('Error creating bill items:', itemsError);
      // Delete the bill since items failed
      await supabase.from('bills').delete().eq('id', bill.id);
      return null;
    }

    return { bill: bill as Bill, items: createdItems as BillItem[] };
  }

  return { bill: bill as Bill, items: [] };
};

/**
 * Updates a bill
 * @param billId The ID of the bill to update
 * @param billData The bill data to update
 * @returns The updated bill or null if update failed
 */
export const updateBill = async (
  billId: string,
  billData: UpdateBillParams
): Promise<Bill | null> => {
  const { data, error } = await supabase
    .from('bills')
    .update(billData)
    .eq('id', billId)
    .select()
    .single();

  if (error) {
    console.error('Error updating bill:', error);
    return null;
  }

  return data as Bill;
};

/**
 * Deletes a bill and all its items
 * @param billId The ID of the bill to delete
 * @returns True if deletion was successful, false otherwise
 */
export const deleteBill = async (billId: string): Promise<boolean> => {
  // Items will be cascade deleted
  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', billId);

  if (error) {
    console.error('Error deleting bill:', error);
    return false;
  }

  return true;
};

/**
 * Creates bill items for an existing bill
 * @param items The bill items to create
 * @returns The created bill items or empty array if creation failed
 */
export const createBillItems = async (
  items: CreateBillItemParams[]
): Promise<BillItem[]> => {
  const { data, error } = await supabase
    .from('bill_items')
    .insert(items)
    .select();

  if (error) {
    console.error('Error creating bill items:', error);
    return [];
  }

  return data as BillItem[];
};

/**
 * Updates a bill item
 * @param itemId The ID of the bill item to update
 * @param itemData The bill item data to update
 * @returns The updated bill item or null if update failed
 */
export const updateBillItem = async (
  itemId: string,
  itemData: UpdateBillItemParams
): Promise<BillItem | null> => {
  const { data, error } = await supabase
    .from('bill_items')
    .update(itemData)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating bill item:', error);
    return null;
  }

  return data as BillItem;
};

/**
 * Deletes a bill item
 * @param itemId The ID of the bill item to delete
 * @returns True if deletion was successful, false otherwise
 */
export const deleteBillItem = async (itemId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('bill_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting bill item:', error);
    return false;
  }

  return true;
};

/**
 * Generates a unique bill number for a restaurant
 * @param restaurantId The restaurant ID to generate the bill number for
 * @returns A unique bill number
 */
export const generateBillNumber = async (restaurantId: string): Promise<string> => {
  // Get the current year
  const year = new Date().getFullYear();
  
  // Get the count of bills for this restaurant in the current year
  const { count, error } = await supabase
    .from('bills')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)
    .gte('created_at', `${year}-01-01`);
    
  if (error) {
    console.error('Error generating bill number:', error);
    // Fallback to a timestamp-based number
    return `BILL-${year}-${Date.now().toString().substring(6)}`;
  }
  
  // Generate a bill number with the format: BILL-YYYY-XXXX
  // Where XXXX is a sequential number
  const sequentialNumber = (count || 0) + 1;
  const billNumber = `BILL-${year}-${sequentialNumber.toString().padStart(4, '0')}`;
  
  return billNumber;
}; 