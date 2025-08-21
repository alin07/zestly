import { query } from '../database/config';

export interface Listing {
  id: number;
  property_id: number;
  agent_id: number;
  listing_type_id: number;
  status_id: number;
  price: number;
  price_per_sqft?: number;
  virtual_tour_url?: string;
  showing_instructions?: string;
  private_remarks?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateListingInput {
  property_id: number;
  agent_id: number;
  listing_type_id: number;
  price: number;
  price_per_sqft?: number;
  virtual_tour_url?: string;
  showing_instructions?: string;
  private_remarks?: string;
}

export interface ListingFilters {
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  min_sqft?: number;
  max_sqft?: number;
  property_types?: string[];
  listing_types?: string[];
  city?: string;
  state?: string;
  zip_codes?: string[];
  features?: string[];
  status_ids?: number[];
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export class ListingModel {
  static async findById(id: number): Promise<any | null> {
    const result = await query(`
      SELECT 
        l.*,
        p.*,
        a.street, a.unit, a.city, a.state, a.zip_code, a.country, a.latitude, a.longitude,
        u.first_name as agent_first_name, u.last_name as agent_last_name, u.email as agent_email, u.role_id as agent_role_id, u.is_verified as agent_is_verified, u.is_active as agent_is_active, u.created_at as agent_created_at, u.updated_at as agent_updated_at,
        ls.name as status_name, ls.description as status_description, ls.is_active as status_is_active, ls.created_at as status_created_at, ls.updated_at as status_updated_at,
        lt.name as listing_type_name, lt.description as listing_type_description, lt.created_at as listing_type_created_at, lt.updated_at as listing_type_updated_at
      FROM listings l
      JOIN properties p ON l.property_id = p.id
      JOIN addresses a ON p.address_id = a.id
      JOIN users u ON l.agent_id = u.id
      JOIN listing_statuses ls ON l.status_id = ls.id
      JOIN listing_types lt ON l.listing_type_id = lt.id
      WHERE l.id = $1
    `, [id]);
    
    return result.rows[0] || null;
  }

  static async findAll(filters: ListingFilters = {}, limit: number = 20, offset: number = 0): Promise<any[]> {
    let whereConditions: string[] = ['ls.is_active = true'];
    let params: any[] = [];
    let paramCount = 0;

    // Price filters
    if (filters.min_price) {
      whereConditions.push(`l.price >= $${++paramCount}`);
      params.push(filters.min_price);
    }
    if (filters.max_price) {
      whereConditions.push(`l.price <= $${++paramCount}`);
      params.push(filters.max_price);
    }

    // Bedroom filters
    if (filters.min_bedrooms) {
      whereConditions.push(`p.bedrooms >= $${++paramCount}`);
      params.push(filters.min_bedrooms);
    }
    if (filters.max_bedrooms) {
      whereConditions.push(`p.bedrooms <= $${++paramCount}`);
      params.push(filters.max_bedrooms);
    }

    // Bathroom filters
    if (filters.min_bathrooms) {
      whereConditions.push(`p.bathrooms >= $${++paramCount}`);
      params.push(filters.min_bathrooms);
    }
    if (filters.max_bathrooms) {
      whereConditions.push(`p.bathrooms <= $${++paramCount}`);
      params.push(filters.max_bathrooms);
    }

    // Square footage filters
    if (filters.min_sqft) {
      whereConditions.push(`p.sqft >= $${++paramCount}`);
      params.push(filters.min_sqft);
    }
    if (filters.max_sqft) {
      whereConditions.push(`p.sqft <= $${++paramCount}`);
      params.push(filters.max_sqft);
    }

    // Property type filters
    if (filters.property_types && filters.property_types.length > 0) {
      whereConditions.push(`p.property_type = ANY($${++paramCount})`);
      params.push(filters.property_types);
    }

    // Location filters
    if (filters.city) {
      whereConditions.push(`LOWER(a.city) = LOWER($${++paramCount})`);
      params.push(filters.city);
    }
    if (filters.state) {
      whereConditions.push(`LOWER(a.state) = LOWER($${++paramCount})`);
      params.push(filters.state);
    }
    if (filters.zip_codes && filters.zip_codes.length > 0) {
      whereConditions.push(`a.zip_code = ANY($${++paramCount})`);
      params.push(filters.zip_codes);
    }

    // Status filters
    if (filters.status_ids && filters.status_ids.length > 0) {
      whereConditions.push(`l.status_id = ANY($${++paramCount})`);
      params.push(filters.status_ids);
    }

    // Build the WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'DESC';
    const orderClause = `ORDER BY l.${sortBy} ${sortOrder}`;

    // Add limit and offset parameters
    params.push(limit, offset);
    const limitClause = `LIMIT $${++paramCount} OFFSET $${++paramCount}`;

    const result = await query(`
      SELECT 
        l.*,
        p.*,
        a.street, a.unit, a.city, a.state, a.zip_code, a.country, a.latitude, a.longitude,
        u.first_name as agent_first_name, u.last_name as agent_last_name, u.email as agent_email,
        ls.name as status_name, ls.description as status_description, ls.is_active as status_is_active,
        lt.name as listing_type_name, lt.description as listing_type_description,
        COUNT(lv.id) as view_count
      FROM listings l
      JOIN properties p ON l.property_id = p.id
      JOIN addresses a ON p.address_id = a.id
      JOIN users u ON l.agent_id = u.id
      JOIN listing_statuses ls ON l.status_id = ls.id
      JOIN listing_types lt ON l.listing_type_id = lt.id
      LEFT JOIN listing_views lv ON l.id = lv.listing_id
      ${whereClause}
      GROUP BY l.id, p.id, a.id, u.id, ls.id, lt.id
      ${orderClause}
      ${limitClause}
    `, params);

    return result.rows;
  }

  static async create(listingData: CreateListingInput): Promise<Listing> {
    const result = await query(`
      INSERT INTO listings (property_id, agent_id, listing_type_id, price, price_per_sqft, virtual_tour_url, showing_instructions, private_remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      listingData.property_id,
      listingData.agent_id,
      listingData.listing_type_id,
      listingData.price,
      listingData.price_per_sqft,
      listingData.virtual_tour_url,
      listingData.showing_instructions,
      listingData.private_remarks
    ]);
    return result.rows[0];
  }

  // Transactional version for use within transactions
  static async createWithClient(client: any, listingData: CreateListingInput): Promise<Listing> {
    const result = await client.query(`
      INSERT INTO listings (property_id, agent_id, listing_type_id, price, price_per_sqft, virtual_tour_url, showing_instructions, private_remarks)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      listingData.property_id,
      listingData.agent_id,
      listingData.listing_type_id,
      listingData.price,
      listingData.price_per_sqft,
      listingData.virtual_tour_url,
      listingData.showing_instructions,
      listingData.private_remarks
    ]);
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<CreateListingInput>): Promise<Listing> {
    const fields = Object.keys(updates);
    const values = fields.map(field => updates[field as keyof CreateListingInput]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await query(
      `UPDATE listings SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async updateStatus(id: number, statusId: number): Promise<Listing> {
    const result = await query(
      'UPDATE listings SET status_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id, statusId]
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM listings WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async findByAgent(agentId: number, limit: number = 20, offset: number = 0): Promise<any[]> {
    const result = await query(`
      SELECT 
        l.*,
        p.*,
        a.street, a.unit, a.city, a.state, a.zip_code, a.country, a.latitude, a.longitude,
        ls.name as status_name, ls.description as status_description, ls.is_active as status_is_active,
        lt.name as listing_type_name, lt.description as listing_type_description
      FROM listings l
      JOIN properties p ON l.property_id = p.id
      JOIN addresses a ON p.address_id = a.id
      JOIN listing_statuses ls ON l.status_id = ls.id
      JOIN listing_types lt ON l.listing_type_id = lt.id
      WHERE l.agent_id = $1
      ORDER BY l.created_at DESC
      LIMIT $2 OFFSET $3
    `, [agentId, limit, offset]);
    
    return result.rows;
  }

  static async getFeatured(limit: number = 10): Promise<any[]> {
    const result = await query(`
      SELECT 
        l.*,
        p.*,
        a.street, a.unit, a.city, a.state, a.zip_code, a.country, a.latitude, a.longitude,
        u.first_name as agent_first_name, u.last_name as agent_last_name,
        ls.name as status_name, ls.description as status_description, ls.is_active as status_is_active,
        lt.name as listing_type_name, lt.description as listing_type_description,
        COUNT(lv.id) as view_count
      FROM listings l
      JOIN properties p ON l.property_id = p.id
      JOIN addresses a ON p.address_id = a.id
      JOIN users u ON l.agent_id = u.id
      JOIN listing_statuses ls ON l.status_id = ls.id
      JOIN listing_types lt ON l.listing_type_id = lt.id
      LEFT JOIN listing_views lv ON l.id = lv.listing_id AND lv.viewed_at > NOW() - INTERVAL '30 days'
      WHERE ls.is_active = true
      GROUP BY l.id, p.id, a.id, u.id, ls.id, lt.id
      ORDER BY view_count DESC, l.price DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  }
}