import { ListingModel, AnalyticsModel, FavoritesModel } from '../models';
import { ListingFilters } from '../types';

export const getListings = async (filters: ListingFilters = {}, limit: number = 20, offset: number = 0) => {
  return await ListingModel.findAll(filters, limit, offset);
};

export const getListingById = async (id: number) => {
  return await ListingModel.findById(id);
};

export const getFeaturedListings = async (limit: number = 10) => {
  return await ListingModel.getFeatured(limit);
};

export const searchListings = async (filters: ListingFilters, limit: number = 20, offset: number = 0) => {
  return await ListingModel.findAll(filters, limit, offset);
};

export const createListing = async (listingData: any, agentId: number) => {
  const listing = await ListingModel.create({
    ...listingData,
    agent_id: agentId
  });
  
  return await ListingModel.findById(listing.id);
};

export const updateListing = async (id: number, updates: any, agentId: number) => {
  // Verify ownership
  const existing = await ListingModel.findById(id);
  if (!existing || existing.agent_id !== agentId) {
    throw new Error('Listing not found or unauthorized');
  }
  
  await ListingModel.update(id, updates);
  return await ListingModel.findById(id);
};

export const deleteListing = async (id: number, agentId: number) => {
  // Verify ownership
  const existing = await ListingModel.findById(id);
  if (!existing || existing.agent_id !== agentId) {
    throw new Error('Listing not found or unauthorized');
  }
  
  return await ListingModel.delete(id);
};

export const updateListingStatus = async (id: number, statusId: number, agentId: number) => {
  // Verify ownership
  const existing = await ListingModel.findById(id);
  if (!existing || existing.agent_id !== agentId) {
    throw new Error('Listing not found or unauthorized');
  }
  
  await ListingModel.updateStatus(id, statusId);
  return await ListingModel.findById(id);
};

export const recordListingView = async (
  listingId: number,
  userId?: number,
  sessionId?: string,
  ipAddress?: string,
  userAgent?: string
) => {
  return await AnalyticsModel.recordListingView(listingId, userId, sessionId, ipAddress, userAgent);
};

export const getListingViews = async (listingId: number, days: number = 30) => {
  return await AnalyticsModel.getListingViews(listingId, days);
};

export const addToFavorites = async (userId: number, listingId: number) => {
  return await FavoritesModel.addFavorite(userId, listingId);
};

export const removeFromFavorites = async (userId: number, listingId: number) => {
  return await FavoritesModel.removeFavorite(userId, listingId);
};

export const isListingFavorited = async (userId: number, listingId: number) => {
  return await FavoritesModel.isFavorited(userId, listingId);
};

export const getUserFavorites = async (userId: number) => {
  return await FavoritesModel.getUserFavorites(userId);
};