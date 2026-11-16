-- ============================================================================
-- VESPERA BEAUTY — SAFE RLS POLICIES FOR EXISTING SUPABASE TABLES
-- ============================================================================
-- Run this in Supabase Dashboard -> SQL Editor ONLY to allow public storefront
-- reads/inserts safely without creating any duplicate tables or exposing
-- service-role keys.
-- ============================================================================

-- 1. Products: allow public catalog reads
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- 2. Orders: allow Cash on Delivery checkout inserts & order lookup
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can place COD orders" ON public.orders;
CREATE POLICY "Public can place COD orders"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public can read orders" ON public.orders;
CREATE POLICY "Public can read orders"
  ON public.orders
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- 3. Order Items: allow checkout line-item inserts & reads
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items"
  ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public can read order items" ON public.order_items;
CREATE POLICY "Public can read order items"
  ON public.order_items
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- 4. Newsletter Subscribers: allow public email subscriptions
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- 5. Inquiries: allow public contact form submissions
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries"
  ON public.inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);
