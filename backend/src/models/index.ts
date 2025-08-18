export * from './User';
export * from './Property';
export * from './Listing';
export * from './Address';

import { query } from '../database/config';

// Reference data models
export class ReferenceDataModel {
  static async getRoles() {
    const result = await query('SELECT * FROM roles ORDER BY id');
    return result.rows;
  }

  static async getListingStatuses() {
    const result = await query('SELECT * FROM listing_statuses ORDER BY id');
    return result.rows;
  }

  static async getListingTypes() {
    const result = await query('SELECT * FROM listing_types ORDER BY id');
    return result.rows;
  }

  static async getRoleByName(name: string) {
    const result = await query('SELECT * FROM roles WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  static async getListingStatusByName(name: string) {
    const result = await query('SELECT * FROM listing_statuses WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  static async getListingTypeByName(name: string) {
    const result = await query('SELECT * FROM listing_types WHERE name = $1', [name]);
    return result.rows[0] || null;
  }
}

// Analytics models
export class AnalyticsModel {
  static async recordListingView(listingId: number, userId?: number, sessionId?: string, ipAddress?: string, userAgent?: string) {
    await query(`
      INSERT INTO listing_views (listing_id, user_id, session_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
    `, [listingId, userId, sessionId, ipAddress, userAgent]);
  }

  static async getListingViews(listingId: number, days: number = 30): Promise<number> {
    const result = await query(`
      SELECT COUNT(*) as view_count
      FROM listing_views
      WHERE listing_id = $1 AND viewed_at > NOW() - INTERVAL '${days} days'
    `, [listingId]);
    
    return parseInt(result.rows[0]?.view_count || '0');
  }

  static async getPopularListings(limit: number = 10, days: number = 30) {
    const result = await query(`
      SELECT 
        l.id,
        COUNT(lv.id) as view_count,
        l.price,
        p.property_type,
        a.city,
        a.state
      FROM listings l
      JOIN properties p ON l.property_id = p.id
      JOIN addresses a ON p.address_id = a.id
      LEFT JOIN listing_views lv ON l.id = lv.listing_id AND lv.viewed_at > NOW() - INTERVAL '${days} days'
      WHERE l.status_id = 1  -- active listings only
      GROUP BY l.id, p.id, a.id
      ORDER BY view_count DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }
}

// User favorites model
export class FavoritesModel {
  static async addFavorite(userId: number, listingId: number): Promise<boolean> {
    try {
      await query(
        'INSERT INTO user_favorites (user_id, listing_id) VALUES ($1, $2)',
        [userId, listingId]
      );
      return true;
    } catch (error) {
      // Handle duplicate key error
      return false;
    }
  }

  static async removeFavorite(userId: number, listingId: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async getUserFavorites(userId: number): Promise<any[]> {
    const result = await query(`
      SELECT 
        l.*,
        p.*,
        a.street, a.unit, a.city, a.state, a.zip_code, a.country, a.latitude, a.longitude,
        ls.name as status_name
      FROM user_favorites uf
      JOIN listings l ON uf.listing_id = l.id
      JOIN properties p ON l.property_id = p.id
      JOIN addresses a ON p.address_id = a.id
      JOIN listing_statuses ls ON l.status_id = ls.id
      WHERE uf.user_id = $1
      ORDER BY uf.created_at DESC
    `, [userId]);
    
    return result.rows;
  }

  static async isFavorited(userId: number, listingId: number): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM user_favorites WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    );
    return result.rows.length > 0;
  }
}