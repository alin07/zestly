import { query } from '../database/config';

export interface Address {
  id: number;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAddressInput {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export class AddressModel {
  static async findById(id: number): Promise<Address | null> {
    const result = await query('SELECT * FROM addresses WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(addressData: CreateAddressInput): Promise<Address> {
    const result = await query(`
      INSERT INTO addresses (street, unit, city, state, zip_code, country, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      addressData.street,
      addressData.unit,
      addressData.city,
      addressData.state,
      addressData.zip_code,
      addressData.country || 'United States',
      addressData.latitude,
      addressData.longitude
    ]);
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<CreateAddressInput>): Promise<Address> {
    const fields = Object.keys(updates);
    const values = fields.map(field => updates[field as keyof CreateAddressInput]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await query(
      `UPDATE addresses SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  static async findByLocation(
    latitude: number,
    longitude: number,
    radiusInMiles: number = 1
  ): Promise<Address[]> {
    // Using the Haversine formula to find addresses within radius
    const result = await query(`
      SELECT *,
        (3959 * acos(
          cos(radians($2)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($3)) + 
          sin(radians($2)) * sin(radians(latitude))
        )) AS distance
      FROM addresses
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      HAVING distance <= $1
      ORDER BY distance
    `, [radiusInMiles, latitude, longitude]);
    
    return result.rows;
  }

  static async searchByText(searchText: string, limit: number = 10): Promise<Address[]> {
    const result = await query(`
      SELECT * FROM addresses
      WHERE 
        LOWER(street) LIKE LOWER($1) OR
        LOWER(city) LIKE LOWER($1) OR
        LOWER(state) LIKE LOWER($1) OR
        zip_code LIKE $1
      ORDER BY 
        CASE 
          WHEN LOWER(street) LIKE LOWER($1) THEN 1
          WHEN LOWER(city) LIKE LOWER($1) THEN 2
          WHEN LOWER(state) LIKE LOWER($1) THEN 3
          ELSE 4
        END
      LIMIT $2
    `, [`%${searchText}%`, limit]);
    
    return result.rows;
  }
}