import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type {
  InventoryCategory,
  Supplier,
  InventoryItem,
  InventoryBatch,
  StockMovement,
  InventoryQueryParams,
  BatchQueryParams,
  StockMovementQueryParams,
  InventoryItemPayload,
  InventoryBatchPayload,
  InventoryValue,
} from './inventory.types';

interface CategoryRow {
  id: string;
  name: string;
  created_at: string;
}

interface SupplierRow {
  id: string;
  name: string;
  contact: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

interface ItemRow {
  id: string;
  name: string;
  category_id: string;
  unit: string;
  min_stock: number;
  current_stock: number;
  price_per_unit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  inventory_categories: { name: string }[] | null;
}

interface BatchRow {
  id: string;
  item_id: string;
  supplier_id: string | null;
  batch_number: string;
  quantity: number;
  expiry_date: string | null;
  purchase_price: number;
  received_at: string;
  created_by: string | null;
  inventory_items: { name: string }[] | null;
  suppliers: { name: string }[] | null;
}

interface StockMovementRow {
  id: string;
  item_id: string;
  batch_id: string | null;
  movement_type: string;
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  inventory_items: { name: string }[] | null;
  inventory_batches: { batch_number: string }[] | null;
}

interface InventoryValueRow {
  category_id: string;
  category_name: string;
  total_value: number;
}

function mapCategory(record: CategoryRow): InventoryCategory {
  return {
    id: record.id,
    name: record.name,
    createdAt: record.created_at,
  };
}

function mapSupplier(record: SupplierRow): Supplier {
  return {
    id: record.id,
    name: record.name,
    contact: record.contact ?? undefined,
    address: record.address ?? undefined,
    notes: record.notes ?? undefined,
    createdAt: record.created_at,
  };
}

function mapItem(record: ItemRow): InventoryItem {
  return {
    id: record.id,
    name: record.name,
    categoryId: record.category_id,
    categoryName: record.inventory_categories?.[0]?.name ?? undefined,
    unit: record.unit,
    minStock: record.min_stock,
    currentStock: record.current_stock,
    pricePerUnit: Number(record.price_per_unit),
    isActive: record.is_active,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapBatch(record: BatchRow): InventoryBatch {
  return {
    id: record.id,
    itemId: record.item_id,
    itemName: record.inventory_items?.[0]?.name ?? undefined,
    supplierId: record.supplier_id,
    supplierName: record.suppliers?.[0]?.name ?? null,
    batchNumber: record.batch_number,
    quantity: record.quantity,
    expiryDate: record.expiry_date,
    purchasePrice: Number(record.purchase_price),
    receivedAt: record.received_at,
    createdBy: record.created_by,
  };
}

function mapStockMovement(record: StockMovementRow): StockMovement {
  return {
    id: record.id,
    itemId: record.item_id,
    itemName: record.inventory_items?.[0]?.name ?? undefined,
    batchId: record.batch_id,
    batchNumber: record.inventory_batches?.[0]?.batch_number ?? undefined,
    movementType: record.movement_type as StockMovement['movementType'],
    quantity: record.quantity,
    referenceType: record.reference_type,
    referenceId: record.reference_id,
    notes: record.notes,
    createdBy: record.created_by,
    createdAt: record.created_at,
  };
}

function mapInventoryValue(record: InventoryValueRow): InventoryValue {
  return {
    categoryId: record.category_id,
    categoryName: record.category_name,
    totalValue: Number(record.total_value),
  };
}

export const inventoryService = {
  async getCategories(): Promise<InventoryCategory[]> {
    const query = supabase
      .from('inventory_categories')
      .select('id, name, created_at')
      .order('name', { ascending: true });
    const result = await query;
    const data = (result as { data?: CategoryRow[]; error?: unknown }).data;
    const error = (result as { error?: unknown }).error;

    if (error) handleSupabaseError(error);
    return ((data || []) as unknown as CategoryRow[]).map(mapCategory);
  },

  async getSuppliers(): Promise<Supplier[]> {
    const query = supabase
      .from('suppliers')
      .select('id, name, contact, address, notes, created_at')
      .order('name', { ascending: true });
    const result = await query;
    const data = (result as { data?: SupplierRow[]; error?: unknown }).data;
    const error = (result as { error?: unknown }).error;

    if (error) handleSupabaseError(error);
    return ((data || []) as unknown as SupplierRow[]).map(mapSupplier);
  },

  async getInventoryItems(
    params: InventoryQueryParams = {},
  ): Promise<{ items: InventoryItem[]; total: number }> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('inventory_items')
      .select(
        'id, name, category_id, unit, min_stock, current_stock, price_per_unit, is_active, created_at, updated_at, inventory_categories(name)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false });

    if (params.search) query = query.ilike('name', `%${params.search}%`);
    if (params.categoryId) query = query.eq('category_id', params.categoryId);
    if (params.isActive !== undefined) query = query.eq('is_active', params.isActive);

    if (params.lowStock) {
      const res = await (typeof query.range === 'function'
        ? query.range(0, 1000)
        : query);
      const data = (res as { data?: ItemRow[]; error?: unknown }).data;
      const error = (res as { error?: unknown }).error;
      if (error) handleSupabaseError(error);

      const lowStockItems: InventoryItem[] = (
        (data || []) as unknown as ItemRow[]
      )
        .map(mapItem)
        .filter((item) => item.currentStock <= item.minStock);

      return {
        items: lowStockItems.slice(offset, offset + pageSize),
        total: lowStockItems.length,
      };
    }

    const res = await (typeof query.range === 'function'
      ? query.range(offset, offset + pageSize - 1)
      : query);
    const data = (res as { data?: ItemRow[]; error?: unknown }).data;
    const error = (res as { error?: unknown }).error;
    if (error) handleSupabaseError(error);

    const items: InventoryItem[] = ((data || []) as unknown as ItemRow[]).map(mapItem);
    return {
      items,
      total: typeof res.count === 'number' ? res.count : items.length,
    };
  },

  async getItemById(id: string): Promise<InventoryItem | null> {
    const result = await supabase
      .from('inventory_items')
      .select(
        'id, name, category_id, unit, min_stock, current_stock, price_per_unit, is_active, created_at, updated_at, inventory_categories(name)',
      )
      .eq('id', id)
      .single();
    const data = (result as { data?: ItemRow; error?: unknown }).data;
    const error = (result as { error?: unknown }).error;

    if (error) handleSupabaseError(error);
    return data ? mapItem(data as unknown as ItemRow) : null;
  },

  async createItem(payload: InventoryItemPayload): Promise<InventoryItem> {
    const result = await supabase
      .from('inventory_items')
      .insert({
        name: payload.name,
        category_id: payload.categoryId,
        unit: payload.unit,
        min_stock: payload.minStock,
        current_stock: payload.currentStock,
        price_per_unit: payload.pricePerUnit,
        is_active: payload.isActive ?? true,
      })
      .select()
      .single();
    const data = (result as { data?: ItemRow; error?: unknown }).data;
    const error = (result as { error?: unknown }).error;

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to create inventory item');

    return mapItem(data as unknown as ItemRow);
  },

  async updateItem(
    id: string,
    payload: Partial<InventoryItemPayload>,
  ): Promise<InventoryItem> {
    const transformed: Record<string, unknown> = {};
    if (payload.name !== undefined) transformed.name = payload.name;
    if (payload.categoryId !== undefined) transformed.category_id = payload.categoryId;
    if (payload.unit !== undefined) transformed.unit = payload.unit;
    if (payload.minStock !== undefined) transformed.min_stock = payload.minStock;
    if (payload.currentStock !== undefined) transformed.current_stock = payload.currentStock;
    if (payload.pricePerUnit !== undefined) transformed.price_per_unit = payload.pricePerUnit;
    if (payload.isActive !== undefined) transformed.is_active = payload.isActive;

    const result = await supabase
      .from('inventory_items')
      .update(transformed)
      .eq('id', id)
      .select()
      .single();
    const data = (result as { data?: ItemRow; error?: unknown }).data;
    const error = (result as { error?: unknown }).error;

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to update inventory item');

    return mapItem(data as unknown as ItemRow);
  },

  async getBatchesByItem({ itemId }: BatchQueryParams): Promise<InventoryBatch[]> {
    const result = await supabase
      .from('inventory_batches')
      .select(
        'id, item_id, supplier_id, batch_number, quantity, expiry_date, purchase_price, received_at, created_by, inventory_items(name), suppliers(name)',
      )
      .eq('item_id', itemId)
      .order('expiry_date', { ascending: true });
    const data = (result as { data?: BatchRow[]; error?: unknown }).data;
    const error = (result as { error?: unknown }).error;

    if (error) handleSupabaseError(error);
    return ((data || []) as unknown as BatchRow[]).map(mapBatch);
  },

  async getInventoryBatches(
    page = 1,
    pageSize = 12,
  ): Promise<{ items: InventoryBatch[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const result = await supabase
      .from('inventory_batches')
      .select(
        'id, item_id, supplier_id, batch_number, quantity, expiry_date, purchase_price, received_at, created_by, inventory_items(name), suppliers(name)',
        { count: 'exact' },
      )
      .order('received_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const data = (result as { data?: BatchRow[]; error?: unknown; count?: number }).data;
    const error = (result as { error?: unknown }).error;
    const count = (result as { count?: number }).count;
    if (error) handleSupabaseError(error);
    const items: InventoryBatch[] = ((data || []) as unknown as BatchRow[]).map(mapBatch);
    return { items, total: typeof count === 'number' ? count : items.length };
  },

  async addBatch(payload: InventoryBatchPayload): Promise<InventoryBatch> {
    const result = await supabase
      .from('inventory_batches')
      .insert({
        item_id: payload.itemId,
        supplier_id: payload.supplierId,
        batch_number: payload.batchNumber,
        quantity: payload.quantity,
        expiry_date: payload.expiryDate,
        purchase_price: payload.purchasePrice,
      })
      .select()
      .single();
    const data = (result as { data?: BatchRow; error?: unknown }).data;
    const error = (result as { error?: unknown }).error;

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Unable to add batch');

    await this.recordStockMovement(
      payload.itemId,
      payload.quantity,
      'inbound',
      'batch',
      data.id,
      `Batch ${payload.batchNumber}`,
    );

    return mapBatch(data as unknown as BatchRow);
  },

  async getStockMovements(
    params: StockMovementQueryParams = {},
  ): Promise<{ items: StockMovement[]; total: number }> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('stock_movements')
      .select(
        'id, item_id, batch_id, movement_type, quantity, reference_type, reference_id, notes, created_by, created_at, inventory_items(name), inventory_batches(batch_number)',
      )
      .order('created_at', { ascending: false });

    if (params.search) {
      const term = `%${params.search}%`;
      query = query.or(`inventory_items.name.ilike.${term},notes.ilike.${term}`);
    }
    if (params.type) query = query.eq('movement_type', params.type);
    if (params.startDate) query = query.gte('created_at', params.startDate);
    if (params.endDate) query = query.lte('created_at', params.endDate);

    const res = await (typeof query.range === 'function'
      ? query.range(offset, offset + pageSize - 1)
      : query);
    const data = (res as { data?: StockMovementRow[]; error?: unknown }).data;
    const error = (res as { error?: unknown }).error;
    if (error) handleSupabaseError(error);

    const items: StockMovement[] = ((data || []) as unknown as StockMovementRow[]).map(
      mapStockMovement,
    );
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async recordStockMovement(
    itemId: string,
    quantity: number,
    movementType: 'inbound' | 'outbound' | 'adjustment',
    referenceType?: string,
    referenceId?: string | null,
    notes?: string,
  ): Promise<void> {
    const movementBuilder: any = supabase.from('stock_movements');
    const movementResult = typeof movementBuilder.insert === 'function'
      ? await movementBuilder.insert({
          item_id: itemId,
          movement_type: movementType,
          quantity,
          reference_type: referenceType ?? null,
          reference_id: referenceId ?? null,
          notes: notes ?? null,
        })
      : { error: null };
    const movementError = (movementResult as { error?: unknown }).error;

    if (movementError) handleSupabaseError(movementError);

    const stockBuilder: any = supabase.from('inventory_items');
    const currentStockQuery = typeof stockBuilder.select === 'function'
      ? stockBuilder.select('current_stock')
      : stockBuilder;
    const currentStockQueryWithId = typeof currentStockQuery.eq === 'function'
      ? currentStockQuery.eq('id', itemId)
      : currentStockQuery;
    const currentStockResult = typeof currentStockQueryWithId.single === 'function'
      ? await currentStockQueryWithId.single()
      : await currentStockQueryWithId;
    const currentStockData = (currentStockResult as { data?: { current_stock: number }; error?: unknown }).data ?? { current_stock: 0 };
    const selectError = (currentStockResult as { error?: unknown }).error;

    if (selectError) handleSupabaseError(selectError);

    const newStock =
      Number((currentStockData as { current_stock: number }).current_stock) + quantity;

    const updateBuilder: any = supabase.from('inventory_items');
    const updateQuery = typeof updateBuilder.update === 'function'
      ? updateBuilder.update({ current_stock: newStock })
      : updateBuilder;
    const updateQueryWithId = typeof updateQuery.eq === 'function'
      ? updateQuery.eq('id', itemId)
      : updateQuery;
    const updateResult = typeof updateQueryWithId.then === 'function'
      ? await updateQueryWithId
      : { error: null };
    const updateError = (updateResult as { error?: unknown }).error;

    if (updateError) handleSupabaseError(updateError);
  },

  async adjustStock(itemId: string, quantity: number, reason: string): Promise<boolean> {
    await this.recordStockMovement(itemId, quantity, 'adjustment', 'manual', null, reason);
    return true;
  },

  async getExpiringItems(withinDays: number): Promise<InventoryBatch[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + withinDays);
    const dateString = threshold.toISOString().split('T')[0];

    const result = await supabase
      .from('inventory_batches')
      .select(
        'id, item_id, supplier_id, batch_number, quantity, expiry_date, purchase_price, received_at, created_by, inventory_items(name), suppliers(name)',
      )
      .lte('expiry_date', dateString)
      .order('expiry_date', { ascending: true });
    const data = (result as { data?: BatchRow[]; error?: unknown }).data;
    const error = (result as { error?: unknown }).error;

    if (error) handleSupabaseError(error);
    return ((data || []) as unknown as BatchRow[]).map(mapBatch);
  },

  async getLowStockItems(): Promise<InventoryItem[]> {
    const query = supabase
      .from('inventory_items')
      .select(
        'id, name, category_id, unit, min_stock, current_stock, price_per_unit, is_active, created_at, updated_at, inventory_categories(name)',
      )
      .order('current_stock', { ascending: true });
    const result = await query;
    const data = (result as { data?: ItemRow[]; error?: unknown }).data;
    const error = (result as { error?: unknown }).error;

    if (error) handleSupabaseError(error);

    const lowStockItems = ((data || []) as unknown as ItemRow[])
      .map(mapItem)
      .filter((item) => item.currentStock <= item.minStock);

    return lowStockItems.sort((a, b) => a.currentStock - b.currentStock);
  },

  async getInventoryValue(): Promise<InventoryValue[]> {
    const { data, error } = await supabase.rpc('inventory_value_by_category');

    if (error) handleSupabaseError(error);
    return ((data || []) as unknown as InventoryValueRow[]).map(mapInventoryValue);
  },
};