-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL CHECK (
        name IN ('agent', 'buyer', 'admin')
    ),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO
    roles (name)
VALUES ('agent'),
    ('buyer'),
    ('admin');


CREATE TABLE listing_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE, -- Whether listings with this status are considered active
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


INSERT INTO
    listing_statuses (name, description, is_active)
VALUES (
        'active',
        'Property is actively listed and available',
        TRUE
    ),
    (
        'pending',
        'Property has an accepted offer but sale is not complete',
        TRUE
    ),
    (
        'sold',
        'Property sale has been completed',
        FALSE
    ),
    (
        'rented',
        'Property has been rented (for rental listings)',
        FALSE
    ),
    (
        'expired',
        'Listing has expired and is no longer active',
        FALSE
    ),
    (
        'withdrawn',
        'Listing has been withdrawn by the agent/owner',
        FALSE
    );


CREATE TABLE listing_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


INSERT INTO
    listing_types (name, description)
VALUES (
        'sale',
        'Property is for sale'
    ),
    (
        'rent',
        'Property is for rent/lease'
    );


CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    unit VARCHAR(50), -- Apartment, suite, etc.
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'United States',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id INTEGER NOT NULL REFERENCES roles (id),
    profile_image_s3_bucket VARCHAR(255),
    profile_image_s3_key VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address_id INTEGER REFERENCES addresses (id),
    logo_s3_bucket VARCHAR(255),
    logo_s3_key VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE social_links (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'linkedin', 'twitter', 'facebook', etc.
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, platform)
);

-- Agent profiles (extends users)
CREATE TABLE agent_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    agency_id INTEGER REFERENCES agencies(id),
    license_number VARCHAR(100),
    years_experience INTEGER,
    specialties TEXT[], -- ['residential', 'commercial', 'luxury']
    bio TEXT,
    commission_rate DECIMAL(5,2), -- Percentage
    is_top_agent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    address_id INTEGER NOT NULL REFERENCES addresses(id),
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('house', 'condo', 'apartment', 'townhome', 'land')),
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    sqft INTEGER,
    lot_size_sqft INTEGER,
    year_built INTEGER,
    parking_spaces INTEGER,
    features TEXT[], -- ['hardwood floors', 'updated kitchen']
    description TEXT,
    hoa_fee INTEGER,
    property_tax_annual INTEGER,
    zoning VARCHAR(50),
    mls_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties (id),
    agent_id INTEGER NOT NULL REFERENCES users (id),
    listing_type_id INTEGER NOT NULL REFERENCES listing_types (id),
    status_id INTEGER NOT NULL DEFAULT 1 REFERENCES listing_statuses (id), -- Default to 'active'
    price INTEGER NOT NULL,
    price_per_sqft DECIMAL(10, 2),
    virtual_tour_url TEXT,
    showing_instructions TEXT,
    private_remarks TEXT, -- Internal notes for agents
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE open_houses (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
    open_house_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
    s3_bucket VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255),
    file_size INTEGER, -- Size in bytes
    mime_type VARCHAR(100),
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    image_type VARCHAR(50) DEFAULT 'interior', -- 'interior', 'exterior', 'aerial', 'floorplan'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User favorites
CREATE TABLE user_favorites (
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES listings (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE saved_searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email_alerts BOOLEAN DEFAULT FALSE,
    alert_frequency VARCHAR(20) DEFAULT 'daily' CHECK (
        alert_frequency IN (
            'immediate',
            'daily',
            'weekly'
        )
    ),
    last_alert_sent TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE search_criteria (
    id SERIAL PRIMARY KEY,
    saved_search_id INTEGER NOT NULL REFERENCES saved_searches(id) ON DELETE CASCADE,
    min_price INTEGER,
    max_price INTEGER,
    min_bedrooms INTEGER,
    max_bedrooms INTEGER,
    min_bathrooms DECIMAL(3,1),
    max_bathrooms DECIMAL(3,1),
    min_sqft INTEGER,
    max_sqft INTEGER,
    property_types TEXT[], -- ['house', 'condo']
    listing_type_ids INTEGER[], 
    min_year_built INTEGER,
    max_days_on_market INTEGER,
    search_radius DECIMAL(5,2), 
    center_latitude DECIMAL(10, 8),
    center_longitude DECIMAL(11, 8),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_codes TEXT[], 
    required_features TEXT[],
    status_ids INTEGER[], 
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings (id),
    agent_id INTEGER NOT NULL REFERENCES users (id),
    inquirer_name VARCHAR(255) NOT NULL,
    inquirer_email VARCHAR(255) NOT NULL,
    inquirer_phone VARCHAR(20),
    message TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'general' CHECK (
        inquiry_type IN (
            'general',
            'showing',
            'info',
            'offer',
            'price_change'
        )
    ),
    status VARCHAR(20) DEFAULT 'new' CHECK (
        status IN ('new', 'responded', 'closed')
    ),
    response_message TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE listing_views (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users (id), -- NULL for anonymous users
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT NOW(),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_role ON users (role_id);

CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_addresses_city_state ON addresses (city, state);

CREATE INDEX idx_addresses_zip ON addresses (zip_code);

CREATE INDEX idx_addresses_location ON addresses (latitude, longitude);

CREATE INDEX idx_properties_address ON properties (address_id);

CREATE INDEX idx_properties_type ON properties (property_type);

CREATE INDEX idx_listings_status ON listings (status);

CREATE INDEX idx_listings_price ON listings (price);

CREATE INDEX idx_listings_list_date ON listings (list_date);

CREATE INDEX idx_listings_agent ON listings (agent_id);

CREATE INDEX idx_open_houses_date ON open_houses (open_house_date);

CREATE INDEX idx_user_favorites_user ON user_favorites (user_id);

CREATE INDEX idx_search_criteria_saved_search ON search_criteria (saved_search_id);

CREATE INDEX idx_listing_views_listing ON listing_views (listing_id);

CREATE INDEX idx_listing_views_date ON listing_views (viewed_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS '
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_profiles_updated_at BEFORE UPDATE ON agent_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_open_houses_updated_at BEFORE UPDATE ON open_houses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_images_updated_at BEFORE UPDATE ON property_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_favorites_updated_at BEFORE UPDATE ON user_favorites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_criteria_updated_at BEFORE UPDATE ON search_criteria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_views_updated_at BEFORE UPDATE ON listing_views FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();