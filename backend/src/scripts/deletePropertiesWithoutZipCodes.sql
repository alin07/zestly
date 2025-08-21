-- Script to delete all data relating to properties with no zip codes
-- Run this carefully as it will permanently delete data

BEGIN;

-- First, let's see what we're about to delete (uncomment to check before running)
-- SELECT 
--   l.id as listing_id,
--   p.id as property_id, 
--   a.id as address_id,
--   a.street,
--   a.city,
--   a.state,
--   a.zip_code
-- FROM listings l
-- JOIN properties p ON l.property_id = p.id
-- JOIN addresses a ON p.address_id = a.id
-- WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = '';

-- Delete listing views for affected listings
DELETE FROM listing_views 
WHERE listing_id IN (
  SELECT l.id 
  FROM listings l
  JOIN properties p ON l.property_id = p.id
  JOIN addresses a ON p.address_id = a.id
  WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
);

-- Delete favorites for affected listings
DELETE FROM favorites 
WHERE listing_id IN (
  SELECT l.id 
  FROM listings l
  JOIN properties p ON l.property_id = p.id
  JOIN addresses a ON p.address_id = a.id
  WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
);

-- Delete open houses for affected listings
DELETE FROM open_houses 
WHERE listing_id IN (
  SELECT l.id 
  FROM listings l
  JOIN properties p ON l.property_id = p.id
  JOIN addresses a ON p.address_id = a.id
  WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
);

-- Delete property images for affected properties
DELETE FROM property_images 
WHERE property_id IN (
  SELECT p.id 
  FROM properties p
  JOIN addresses a ON p.address_id = a.id
  WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
);

-- Delete listings for affected properties
DELETE FROM listings 
WHERE property_id IN (
  SELECT p.id 
  FROM properties p
  JOIN addresses a ON p.address_id = a.id
  WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
);

-- Delete properties with no zip codes
DELETE FROM properties 
WHERE address_id IN (
  SELECT a.id 
  FROM addresses a
  WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
);

-- Delete addresses with no zip codes
DELETE FROM addresses 
WHERE zip_code IS NULL OR zip_code = '' OR TRIM(zip_code) = '';

-- Show summary of what remains
SELECT 
  (SELECT COUNT(*) FROM addresses) as remaining_addresses,
  (SELECT COUNT(*) FROM properties) as remaining_properties,
  (SELECT COUNT(*) FROM listings) as remaining_listings,
  (SELECT COUNT(*) FROM listing_views) as remaining_listing_views,
  (SELECT COUNT(*) FROM favorites) as remaining_favorites;

COMMIT;
-- If something goes wrong, run: ROLLBACK;