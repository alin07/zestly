import { query } from '../database/config';

export interface Property {
  id: number;
  address_id: number;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lot_size_sqft?: number;
  year_built?: number;
  parking_spaces?: number;
  features?: string[];
  description?: string;
  hoa_fee?: number;
  property_tax_annual?: number;
  zoning?: string;
  mls_number?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePropertyInput {
  address_id: number;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lot_size_sqft?: number;
  year_built?: number;
  parking_spaces?: number;
  features?: string[];
  description?: string;
  hoa_fee?: number;
  property_tax_annual?: number;
  zoning?: string;
  mls_number?: string;
}

export class PropertyModel {
  static async findById(id: number): Promise<any | null> {
    const result = await query(`
      SELECT 
        p.*,
        a.street, a.unit, a.city, a.state, a.zip_code, a.country, a.latitude, a.longitude,
        array_agg(
          json_build_object(
            'id', pi.id,
            'url', CONCAT('https://s3.amazonaws.com/', pi.s3_bucket, '/', pi.s3_key),
            'caption', pi.caption,
            'sort_order', pi.sort_order,
            'is_primary', pi.is_primary,
            'image_type', pi.image_type
          ) ORDER BY pi.sort_order, pi.is_primary DESC
        ) FILTER (WHERE pi.id IS NOT NULL) as images
      FROM properties p
      JOIN addresses a ON p.address_id = a.id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.id = $1
      GROUP BY p.id, a.id
    `, [id]);
    
    return result.rows[0] || null;
  }

  static async findAll(limit: number = 20, offset: number = 0): Promise<any[]> {
    const result = await query(`
      SELECT 
        p.*,
        a.street, a.unit, a.city, a.state, a.zip_code, a.country, a.latitude, a.longitude
      FROM properties p
      JOIN addresses a ON p.address_id = a.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    return result.rows;
  }

  static async create(propertyData: CreatePropertyInput): Promise<Property> {
    const result = await query(`
      INSERT INTO properties (
        address_id, property_type, bedrooms, bathrooms, sqft, lot_size_sqft,
        year_built, parking_spaces, features, description, hoa_fee,
        property_tax_annual, zoning, mls_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      propertyData.address_id,
      propertyData.property_type,
      propertyData.bedrooms,
      propertyData.bathrooms,
      propertyData.sqft,
      propertyData.lot_size_sqft,
      propertyData.year_built,
      propertyData.parking_spaces,
      propertyData.features,
      propertyData.description,
      propertyData.hoa_fee,
      propertyData.property_tax_annual,
      propertyData.zoning,
      propertyData.mls_number
    ]);
    return result.rows[0];
  }

  // Transactional version for use within transactions
  static async createWithClient(client: any, propertyData: CreatePropertyInput): Promise<Property> {
    const result = await client.query(`
      INSERT INTO properties (
        address_id, property_type, bedrooms, bathrooms, sqft, lot_size_sqft,
        year_built, parking_spaces, features, description, hoa_fee,
        property_tax_annual, zoning, mls_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      propertyData.address_id,
      propertyData.property_type,
      propertyData.bedrooms,
      propertyData.bathrooms,
      propertyData.sqft,
      propertyData.lot_size_sqft,
      propertyData.year_built,
      propertyData.parking_spaces,
      propertyData.features,
      propertyData.description,
      propertyData.hoa_fee,
      propertyData.property_tax_annual,
      propertyData.zoning,
      propertyData.mls_number
    ]);
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<CreatePropertyInput>): Promise<Property> {
    const fields = Object.keys(updates);
    const values = fields.map(field => updates[field as keyof CreatePropertyInput]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await query(
      `UPDATE properties SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async getImages(propertyId: number): Promise<any[]> {
    const result = await query(`
      SELECT 
        id,
        CONCAT('https://s3.amazonaws.com/', s3_bucket, '/', s3_key) as url,
        original_filename,
        file_size,
        mime_type,
        caption,
        sort_order,
        is_primary,
        image_type,
        created_at
      FROM property_images
      WHERE property_id = $1
      ORDER BY sort_order ASC, is_primary DESC, created_at ASC
    `, [propertyId]);
    
    return result.rows;
  }

  static async addImage(propertyId: number, imageData: {
    s3_bucket: string;
    s3_key: string;
    original_filename?: string;
    file_size?: number;
    mime_type?: string;
    caption?: string;
    sort_order?: number;
    is_primary?: boolean;
    image_type?: string;
  }): Promise<any> {
    const result = await query(`
      INSERT INTO property_images (
        property_id, s3_bucket, s3_key, original_filename, file_size,
        mime_type, caption, sort_order, is_primary, image_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      propertyId,
      imageData.s3_bucket,
      imageData.s3_key,
      imageData.original_filename,
      imageData.file_size,
      imageData.mime_type,
      imageData.caption,
      imageData.sort_order || 0,
      imageData.is_primary || false,
      imageData.image_type || 'interior'
    ]);
    return result.rows[0];
  }
}