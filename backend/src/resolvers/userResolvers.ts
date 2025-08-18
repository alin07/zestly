import { UserModel, ReferenceDataModel } from '../models';
import { GraphQLContext } from '../types';

export const userResolvers = {
  Query: {
    users: async (_: any, { role, limit = 20, offset = 0 }: { role?: string; limit?: number; offset?: number }) => {
      if (role) {
        const roleObj = await ReferenceDataModel.getRoleByName(role.toLowerCase());
        if (!roleObj) {
          throw new Error('Invalid role specified');
        }
        return await UserModel.findByRole(roleObj.id, limit, offset);
      }
      return await UserModel.findAll(limit, offset);
    },

    user: async (_: any, { id }: { id: string }) => {
      const user = await UserModel.findById(parseInt(id));
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },

    agents: async (_: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
      // Get agent role
      const agentRole = await ReferenceDataModel.getRoleByName('agent');
      if (!agentRole) {
        return [];
      }

      const agents = await UserModel.findByRole(agentRole.id, limit, offset);
      
      return agents.map(agent => ({
        userId: agent.id,
        user: agent,
        // Additional agent profile fields would come from agent_profiles table
        licenseNumber: null,
        yearsExperience: null,
        specialties: [],
        bio: null,
        commissionRate: null,
        isTopAgent: false,
        createdAt: agent.created_at,
        updatedAt: agent.updated_at
      }));
    },

    agent: async (_: any, { id }: { id: string }) => {
      const user = await UserModel.findById(parseInt(id));
      if (!user) {
        throw new Error('Agent not found');
      }

      // Check if user is an agent
      const agentRole = await ReferenceDataModel.getRoleByName('agent');
      if (user.role_id !== agentRole?.id) {
        throw new Error('User is not an agent');
      }

      return {
        userId: user.id,
        user: user,
        licenseNumber: null,
        yearsExperience: null,
        specialties: [],
        bio: null,
        commissionRate: null,
        isTopAgent: false,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    },
  },

  Mutation: {
    updateProfile: async (
      _: any,
      { input }: { input: { firstName?: string; lastName?: string; phone?: string } },
      { user }: GraphQLContext
    ) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const updates: any = {};
      if (input.firstName) updates.first_name = input.firstName;
      if (input.lastName) updates.last_name = input.lastName;
      if (input.phone) updates.phone = input.phone;

      return await UserModel.updateProfile(user.id, updates);
    },
  },

  User: {
    // Convert database fields to GraphQL schema fields
    firstName: (parent: any) => parent.first_name,
    lastName: (parent: any) => parent.last_name,
    profileImageUrl: (parent: any) => {
      if (parent.profile_image_s3_bucket && parent.profile_image_s3_key) {
        return `https://s3.amazonaws.com/${parent.profile_image_s3_bucket}/${parent.profile_image_s3_key}`;
      }
      return null;
    },
    isVerified: (parent: any) => parent.is_verified,
    isActive: (parent: any) => parent.is_active,
    lastLoginAt: (parent: any) => parent.last_login_at,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,

    role: async (parent: any) => {
      const roles = await ReferenceDataModel.getRoles();
      return roles.find(role => role.id === parent.role_id);
    },

    agentProfile: async (parent: any) => {
      const agentRole = await ReferenceDataModel.getRoleByName('agent');
      if (parent.role_id !== agentRole?.id) {
        return null;
      }

      return {
        userId: parent.id,
        user: parent,
        licenseNumber: null,
        yearsExperience: null,
        specialties: [],
        bio: null,
        commissionRate: null,
        isTopAgent: false,
        createdAt: parent.created_at,
        updatedAt: parent.updated_at
      };
    },
  },
};