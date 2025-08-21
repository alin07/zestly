import { UserModel, ReferenceDataModel } from '../models';
import { GraphQLContext } from '../types';
import jwt from 'jsonwebtoken';


export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const generateToken = (user: any): string => {
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
  } as jwt.SignOptions);
};

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, { user }: GraphQLContext) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Get the full user object from database instead of the partial one from middleware
      const fullUser = await UserModel.findById(user.id);
      if (!fullUser) {
        throw new Error('User not found');
      }
      
      return fullUser;
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: RegisterInput }) => {
      try {
        // Validate input
        if (!input.email || !input.password || !input.firstName || !input.lastName) {
          throw new Error('Missing required fields');
        }

        if (input.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        // Check if user already exists
        const existingUser = await UserModel.findByEmail(input.email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Get role ID
        const role = await ReferenceDataModel.getRoleByName(input.role.toLowerCase());
        if (!role) {
          throw new Error('Invalid role specified');
        }

        const createUserData: any = {
          email: input.email,
          password: input.password,
          first_name: input.firstName,
          last_name: input.lastName,
          role_id: role.id
        };
        
        if (input.phone) {
          createUserData.phone = input.phone;
        }

        const user = await UserModel.create(createUserData);

        const token = generateToken(user);

        return {
          token,
          user: user  // Let the User type resolvers handle field mapping
        };
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },

    login: async (_: any, { input }: { input: LoginInput }) => {
      try {
        // Validate input
        if (!input.email || !input.password) {
          throw new Error('Email and password are required');
        }

        // Get user by email
        const user = await UserModel.findByEmail(input.email);
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Check if user is active
        if (!user.is_active) {
          throw new Error('Account has been deactivated');
        }

        // Verify password
        const isValidPassword = await UserModel.verifyPassword(user, input.password);
        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        // Update last login
        await UserModel.updateLastLogin(user.id);

        // Generate token
        const token = generateToken(user);

        return {
          token,
          user: user  // Let the User type resolvers handle field mapping
        };
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    logout: async (_: any, __: any, { user }: GraphQLContext) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return true;
    },
  },
};