-- ============================================================================
-- MAISON ROSERAIE — LUXURY COSMETICS E-COMMERCE SUPABASE SCHEMA
-- ============================================================================
-- Run this complete script in your Supabase Dashboard -> SQL Editor.
-- Includes UUID primary keys, foreign key relationships, automatic timestamps,
-- Row Level Security (RLS), and secure access policies.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Helper Trigger Function for updated_at timestamps
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. Admin Roles Table (links to Supabase Auth users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin privilege safely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (
    category IN (
      'Makeup',
      'Skincare',
      'Haircare',
      'Perfumes',
      'Body Care',
      'Beauty Accessories'
    )
  ),
  subcategory TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  ingredients TEXT NOT NULL DEFAULT '',
  ritual_guide TEXT NOT NULL DEFAULT '',
  price_pkr NUMERIC(12, 2) NOT NULL CHECK (price_pkr >= 0),
  discount_price_pkr NUMERIC(12, 2) CHECK (discount_price_pkr IS NULL OR discount_price_pkr >= 0),
  stock INTEGER NOT NULL DEFAULT 25 CHECK (stock >= 0),
  sku TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  shades TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  volume TEXT NOT NULL DEFAULT '30ml',
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.9 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public storefront can read active products
CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

-- Only authenticated admins can insert, update, delete products
CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. CUSTOMERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  total_orders INTEGER NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
  total_spent_pkr NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_spent_pkr >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow checkout flow to upsert customer records without exposing full customer directory
CREATE POLICY "Allow checkout customer creation"
  ON public.customers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Customers can only see their own authenticated profile; admins see all
CREATE POLICY "Admins and owners can view customers"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can update customers"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. ORDERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL DEFAULT '',
  order_notes TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery' CHECK (
    payment_method IN ('Cash on Delivery', 'Bank Transfer', 'Card on Delivery')
  ),
  subtotal_pkr NUMERIC(12, 2) NOT NULL CHECK (subtotal_pkr >= 0),
  shipping_pkr NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_pkr >= 0),
  discount_pkr NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_pkr >= 0),
  total_pkr NUMERIC(12, 2) NOT NULL CHECK (total_pkr >= 0),
  promo_code TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (
    status IN ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON public.orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Guests and signed-in users can place orders
CREATE POLICY "Anyone can place an order"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Order lookup: admins see all orders; public can track by tracking_id via RPC or policy
CREATE POLICY "Public order tracking and admin read"
  ON public.orders
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can update order status"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. ORDER_ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL DEFAULT '',
  selected_variant TEXT NOT NULL DEFAULT '',
  unit_price_pkr NUMERIC(12, 2) NOT NULL CHECK (unit_price_pkr >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total_pkr NUMERIC(12, 2) NOT NULL CHECK (line_total_pkr >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert order items during checkout"
  ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can read order items for tracking"
  ON public.order_items
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can modify order items"
  ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. PRODUCT REVIEWS TABLE (Verified customer testimonials)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL DEFAULT '',
  customer_name TEXT NOT NULL,
  customer_city TEXT NOT NULL DEFAULT 'Lahore',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read reviews"
  ON public.reviews
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Customers can submit reviews"
  ON public.reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- ----------------------------------------------------------------------------
-- 8. STORAGE BUCKET FOR ADMIN PRODUCT IMAGE UPLOADS
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
