import { query } from '../database/config';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  password_salt: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_id: number;
  profile_image_s3_bucket?: string;
  profile_image_s3_key?: string;
  is_verified: boolean;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_id: number;
}

export class UserModel {
  static async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    return result.rows[0] || null;
  }

  static async create(userData: CreateUserInput): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const result = await query(
      `INSERT INTO users (email, password_hash, password_salt, first_name, last_name, phone, role_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userData.email,
        passwordHash,
        salt,
        userData.first_name,
        userData.last_name,
        userData.phone,
        userData.role_id
      ]
    );
    return result.rows[0];
  }

  static async findAll(limit: number = 20, offset: number = 0): Promise<User[]> {
    const result = await query(
      'SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async findByRole(roleId: number, limit: number = 20, offset: number = 0): Promise<User[]> {
    const result = await query(
      'SELECT * FROM users WHERE role_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [roleId, limit, offset]
    );
    return result.rows;
  }

  static async updateLastLogin(id: number): Promise<void> {
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [id]
    );
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  static async updateProfile(id: number, updates: Partial<User>): Promise<User> {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => updates[field as keyof User]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }
}