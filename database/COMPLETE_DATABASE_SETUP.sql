-- =====================================================
-- EMERGENCY MEDICINE LOCATOR - COMPLETE DATABASE SETUP
-- =====================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- =====================================================

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Step 2: DROP existing tables (clean slate)
-- =====================================================
DROP TABLE IF EXISTS medicine_alerts CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS medicine_categories CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_store_rating();

-- =====================================================
-- Step 3: CREATE TABLES
-- =====================================================

-- 3.1 PROFILES TABLE
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'retailer')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 STORES TABLE
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    license_number VARCHAR(100),
    store_image_url TEXT,
    is_open BOOLEAN DEFAULT TRUE,
    opening_time TIME DEFAULT '09:00:00',
    closing_time TIME DEFAULT '21:00:00',
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.3 MEDICINE CATEGORIES TABLE
CREATE TABLE medicine_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.4 MEDICINES TABLE
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES medicine_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    manufacturer VARCHAR(255),
    description TEXT,
    dosage VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'strips',
    expiry_date DATE,
    batch_number VARCHAR(100),
    requires_prescription BOOLEAN DEFAULT FALSE,
    image_url TEXT DEFAULT 'images.jpg',
    is_available BOOLEAN DEFAULT TRUE,
    min_stock_alert INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.5 SEARCH HISTORY TABLE
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    search_query VARCHAR(255) NOT NULL,
    user_latitude DECIMAL(10, 8),
    user_longitude DECIMAL(11, 8),
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.6 FAVORITES TABLE
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, store_id)
);

-- 3.7 REVIEWS TABLE
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, store_id)
);

-- 3.8 NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.9 MEDICINE ALERTS TABLE
CREATE TABLE medicine_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    user_latitude DECIMAL(10, 8),
    user_longitude DECIMAL(11, 8),
    radius_km INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Step 4: CREATE INDEXES
-- =====================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_is_open ON stores(is_open);
CREATE INDEX idx_stores_location ON stores(latitude, longitude);
CREATE INDEX idx_medicines_name ON medicines(name);
CREATE INDEX idx_medicines_store ON medicines(store_id);
CREATE INDEX idx_medicines_category ON medicines(category_id);
CREATE INDEX idx_medicines_available ON medicines(is_available);
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_reviews_store ON reviews(store_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_medicine_alerts_user ON medicine_alerts(user_id);

-- =====================================================
-- Step 5: INSERT DEFAULT CATEGORIES
-- =====================================================

INSERT INTO medicine_categories (name, description) VALUES
    ('Pain Relief', 'Painkillers and analgesics'),
    ('Antibiotics', 'Antibacterial medications'),
    ('Antacids', 'Digestive and stomach medicines'),
    ('Cardiovascular', 'Heart and blood pressure medicines'),
    ('Diabetes', 'Insulin and diabetes management'),
    ('Respiratory', 'Asthma and respiratory medicines'),
    ('Vitamins & Supplements', 'Nutritional supplements'),
    ('First Aid', 'Bandages, antiseptics, etc.'),
    ('Allergy', 'Antihistamines and allergy relief'),
    ('Fever & Cold', 'Cold, cough, and fever medicines'),
    ('Eye & Ear', 'Eye drops and ear medicines'),
    ('Skin Care', 'Dermatological products'),
    ('Emergency', 'Emergency and life-saving drugs'),
    ('Others', 'Miscellaneous medicines')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Step 6: CREATE FUNCTIONS
-- =====================================================

-- 6.1 Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6.2 Function to update store rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_store_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stores SET
        rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE store_id = COALESCE(NEW.store_id, OLD.store_id)), 0),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE store_id = COALESCE(NEW.store_id, OLD.store_id))
    WHERE id = COALESCE(NEW.store_id, OLD.store_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6.3 Function to handle new user registration (auto-create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.4 Function to clean up expired medicines (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_medicines()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM medicines 
    WHERE expiry_date < CURRENT_DATE 
    AND expiry_date IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.5 Function to mark medicines as unavailable when they expire (alternative to deletion)
CREATE OR REPLACE FUNCTION mark_expired_medicines_unavailable()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expiry_date < CURRENT_DATE AND NEW.is_available = TRUE THEN
        NEW.is_available := FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Step 7: CREATE TRIGGERS
-- =====================================================

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at 
    BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at 
    BEFORE UPDATE ON medicines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updating store rating
CREATE TRIGGER trigger_update_store_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_store_rating();

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to mark expired medicines as unavailable on any update
CREATE TRIGGER check_medicine_expiry
    BEFORE INSERT OR UPDATE ON medicines
    FOR EACH ROW EXECUTE FUNCTION mark_expired_medicines_unavailable();

-- =====================================================
-- Step 8: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Step 9: CREATE RLS POLICIES
-- =====================================================

-- 9.1 PROFILES POLICIES
CREATE POLICY "Anyone can view profiles" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 9.2 STORES POLICIES
CREATE POLICY "Anyone can view stores" 
    ON stores FOR SELECT 
    USING (true);

CREATE POLICY "Retailers can insert own stores" 
    ON stores FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Retailers can update own stores" 
    ON stores FOR UPDATE 
    USING (auth.uid() = owner_id);

CREATE POLICY "Retailers can delete own stores" 
    ON stores FOR DELETE 
    USING (auth.uid() = owner_id);

-- 9.3 MEDICINES POLICIES
CREATE POLICY "Anyone can view medicines" 
    ON medicines FOR SELECT 
    USING (true);

CREATE POLICY "Store owners can insert medicines" 
    ON medicines FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = store_id 
        AND stores.owner_id = auth.uid()
    ));

CREATE POLICY "Store owners can update medicines" 
    ON medicines FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = store_id 
        AND stores.owner_id = auth.uid()
    ));

CREATE POLICY "Store owners can delete medicines" 
    ON medicines FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = store_id 
        AND stores.owner_id = auth.uid()
    ));

-- 9.4 MEDICINE CATEGORIES POLICIES
CREATE POLICY "Anyone can view categories" 
    ON medicine_categories FOR SELECT 
    USING (true);

-- 9.5 SEARCH HISTORY POLICIES
CREATE POLICY "Users can view own search history" 
    ON search_history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert search history" 
    ON search_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert anonymous search" 
    ON search_history FOR INSERT 
    WITH CHECK (user_id IS NULL);

-- 9.6 FAVORITES POLICIES
CREATE POLICY "Users can view own favorites" 
    ON favorites FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" 
    ON favorites FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" 
    ON favorites FOR DELETE 
    USING (auth.uid() = user_id);

-- 9.7 REVIEWS POLICIES
CREATE POLICY "Anyone can view reviews" 
    ON reviews FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert own reviews" 
    ON reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" 
    ON reviews FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" 
    ON reviews FOR DELETE 
    USING (auth.uid() = user_id);

-- 9.8 NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications" 
    ON notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
    ON notifications FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
    ON notifications FOR INSERT 
    WITH CHECK (true);

-- 9.9 MEDICINE ALERTS POLICIES
CREATE POLICY "Users can view own alerts" 
    ON medicine_alerts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" 
    ON medicine_alerts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" 
    ON medicine_alerts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" 
    ON medicine_alerts FOR DELETE 
    USING (auth.uid() = user_id);

-- =====================================================
-- Step 10: GRANT PERMISSIONS TO API ROLES
-- =====================================================

-- Grant schema access
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant table access to service_role (full access)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant table access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read access to anon users (for public data)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;

-- =====================================================
-- Step 11: VERIFICATION
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'RLS Policies created: %', policy_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Your database is ready to use!';
END $$;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
