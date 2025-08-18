import { UserModel, ReferenceDataModel } from '../models';
import jwt, { SignOptions } from 'jsonwebtoken';

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleName: string;
}

export const createUser = async (userData: CreateUserInput) => {
  // Get role ID
  const role = await ReferenceDataModel.getRoleByName(userData.roleName);
  if (!role) {
    throw new Error('Invalid role specified');
  }

  // Check if user already exists
  const existingUser = await UserModel.findByEmail(userData.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  return await UserModel.create({
    email: userData.email,
    password: userData.password,
    first_name: userData.firstName,
    last_name: userData.lastName,
    phone: userData.phone || '',
    role_id: role.id
  });
};

export const getUserByEmail = async (email: string) => {
  return await UserModel.findByEmail(email);
};

export const getUserById = async (id: number) => {
  return await UserModel.findById(id);
};

export const verifyPassword = async (user: any, password: string) => {
  return await UserModel.verifyPassword(user, password);
};

export const generateToken = (user: any): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role_id: user.role_id
  };
  
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as SignOptions);
};

export const updateLastLogin = async (id: number) => {
  return await UserModel.updateLastLogin(id);
};

export const updateUser = async (id: number, updates: any) => {
  return await UserModel.updateProfile(id, updates);
};

export const getSocialLinks = async (_userId: number) => {
  // This would fetch from social_links table
  // For now, return empty array
  return [];
};