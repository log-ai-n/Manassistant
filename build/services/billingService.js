"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBillNumber = exports.deleteBillItem = exports.updateBillItem = exports.createBillItems = exports.deleteBill = exports.updateBill = exports.createBill = exports.getBillWithItems = exports.getBills = void 0;
const supabase_1 = require("../lib/supabase");
/**
 * Fetches bills for a specific restaurant with optional filtering
 * @param restaurantId The restaurant ID to fetch bills for
 * @param status Optional status filter
 * @param limit Maximum number of bills to fetch
 * @param offset Pagination offset
 * @returns Array of bills and count
 */
const getBills = (restaurantId_1, status_1, ...args_1) => __awaiter(void 0, [restaurantId_1, status_1, ...args_1], void 0, function* (restaurantId, status, limit = 10, offset = 0) {
    let query = supabase_1.supabase
        .from('bills')
        .select('*', { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .order('bill_date', { ascending: false })
        .range(offset, offset + limit - 1);
    if (status) {
        query = query.eq('status', status);
    }
    const { data, error, count } = yield query;
    if (error) {
        console.error('Error fetching bills:', error);
        return { bills: [], count: 0 };
    }
    return { bills: data, count: count || 0 };
});
exports.getBills = getBills;
/**
 * Fetches a single bill by ID with all its items
 * @param billId The bill ID to fetch
 * @returns The bill with items or null if not found
 */
const getBillWithItems = (billId) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch the bill
    const { data: bill, error: billError } = yield supabase_1.supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();
    if (billError) {
        console.error('Error fetching bill:', billError);
        return null;
    }
    // Fetch the bill items
    const { data: items, error: itemsError } = yield supabase_1.supabase
        .from('bill_items')
        .select('*')
        .eq('bill_id', billId);
    if (itemsError) {
        console.error('Error fetching bill items:', itemsError);
        return null;
    }
    return { bill: bill, items: items };
});
exports.getBillWithItems = getBillWithItems;
/**
 * Creates a new bill with optional items
 * @param billData The bill data to create
 * @param items Optional bill items to create with the bill
 * @returns The created bill and items or null if creation failed
 */
const createBill = (billData, items) => __awaiter(void 0, void 0, void 0, function* () {
    // Start a transaction
    const { data: bill, error: billError } = yield supabase_1.supabase
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
        const itemsWithBillId = items.map(item => (Object.assign(Object.assign({}, item), { bill_id: bill.id })));
        const { data: createdItems, error: itemsError } = yield supabase_1.supabase
            .from('bill_items')
            .insert(itemsWithBillId)
            .select();
        if (itemsError) {
            console.error('Error creating bill items:', itemsError);
            // Delete the bill since items failed
            yield supabase_1.supabase.from('bills').delete().eq('id', bill.id);
            return null;
        }
        return { bill: bill, items: createdItems };
    }
    return { bill: bill, items: [] };
});
exports.createBill = createBill;
/**
 * Updates a bill
 * @param billId The ID of the bill to update
 * @param billData The bill data to update
 * @returns The updated bill or null if update failed
 */
const updateBill = (billId, billData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('bills')
        .update(billData)
        .eq('id', billId)
        .select()
        .single();
    if (error) {
        console.error('Error updating bill:', error);
        return null;
    }
    return data;
});
exports.updateBill = updateBill;
/**
 * Deletes a bill and all its items
 * @param billId The ID of the bill to delete
 * @returns True if deletion was successful, false otherwise
 */
const deleteBill = (billId) => __awaiter(void 0, void 0, void 0, function* () {
    // Items will be cascade deleted
    const { error } = yield supabase_1.supabase
        .from('bills')
        .delete()
        .eq('id', billId);
    if (error) {
        console.error('Error deleting bill:', error);
        return false;
    }
    return true;
});
exports.deleteBill = deleteBill;
/**
 * Creates bill items for an existing bill
 * @param items The bill items to create
 * @returns The created bill items or empty array if creation failed
 */
const createBillItems = (items) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('bill_items')
        .insert(items)
        .select();
    if (error) {
        console.error('Error creating bill items:', error);
        return [];
    }
    return data;
});
exports.createBillItems = createBillItems;
/**
 * Updates a bill item
 * @param itemId The ID of the bill item to update
 * @param itemData The bill item data to update
 * @returns The updated bill item or null if update failed
 */
const updateBillItem = (itemId, itemData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('bill_items')
        .update(itemData)
        .eq('id', itemId)
        .select()
        .single();
    if (error) {
        console.error('Error updating bill item:', error);
        return null;
    }
    return data;
});
exports.updateBillItem = updateBillItem;
/**
 * Deletes a bill item
 * @param itemId The ID of the bill item to delete
 * @returns True if deletion was successful, false otherwise
 */
const deleteBillItem = (itemId) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield supabase_1.supabase
        .from('bill_items')
        .delete()
        .eq('id', itemId);
    if (error) {
        console.error('Error deleting bill item:', error);
        return false;
    }
    return true;
});
exports.deleteBillItem = deleteBillItem;
/**
 * Generates a unique bill number for a restaurant
 * @param restaurantId The restaurant ID to generate the bill number for
 * @returns A unique bill number
 */
const generateBillNumber = (restaurantId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the current year
    const year = new Date().getFullYear();
    // Get the count of bills for this restaurant in the current year
    const { count, error } = yield supabase_1.supabase
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
});
exports.generateBillNumber = generateBillNumber;
