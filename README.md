# Maison Roseraie — Luxury Pink & Gold Cosmetics E-Commerce

An international luxury beauty & cosmetics e-commerce storefront and admin platform built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

- **Luxury Pink & Gold Aesthetic**: Designed around Blush Pink (`#F4C6D0`), Rose Pink (`#E8A1B2`), Soft Baby Pink (`#FCE8ED`), Champagne Gold (`#D4AF70`), Metallic Gold (`#C69B52`), Cream White (`#FFF9F5`), and Deep Rose (`#713D50`), paired with Cormorant Garamond & Plus Jakarta Sans typography.
- **54 Curated Products with Unique Studio Photography**: Makeup, Skincare, Haircare, Perfumes, Body Care, and Beauty Accessories—each with its own dedicated high-resolution studio image.
- **18 Complete Storefront & Admin Pages**: Home, About Us, Shop All, Makeup, Skincare, Haircare, Perfumes, Body Care, Beauty Accessories, Best Sellers, New Arrivals, Product Details, Shopping Cart, Checkout, Contact Us, Customer Reviews, FAQ, and Admin Dashboard.
- **Full E-Commerce Experience**: Live search, category & subcategory filters, price sorting, shade/volume selection, wishlist persistence, slide-over shopping bag, promo codes (`ROSERAIE10`), Cash on Delivery (COD) checkout in PKR, unique Order Tracking IDs (`MR-2026-XXXX`), and customer order history lookup.
- **Protected Admin Dashboard**: Manage products (add, edit, delete, upload images, adjust stock), manage customer orders & update shipping statuses, view customer records, and track revenue statistics.
- **Supabase Database Integration**: Full PostgreSQL schema (`products`, `customers`, `orders`, `order_items`, `reviews`, `admin_users`) with UUID primary keys, foreign keys, triggers, and Row Level Security (RLS).

---

## 1. Supabase Database Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase Dashboard.
3. Copy the entire contents of `supabase/schema.sql` and run it.
4. *(Optional)* To grant yourself Admin access in Supabase Auth:
   - Create a user under **Authentication → Users** (e.g. `admin@maisonroseraie.com`).
   - Copy the user's UUID and run:
     ```sql
     INSERT INTO public.admin_users (user_id, email, role)
     VALUES ('YOUR-USER-UUID-HERE', 'admin@maisonroseraie.com', 'super_admin');
     ```
5. Copy your **Project URL** and **Anon Public Key** from **Project Settings → API**.
   > **Security Note:** Never expose `SUPABASE_SERVICE_ROLE_KEY` in any `VITE_*` variable or frontend source file.

---

## 2. Local Environment Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-public-key"
```

Start the development server:
```bash
npm run dev
```

---

## 3. GitHub & Vercel Deployment

1. Push this repository to GitHub (`.env` is already excluded in `.gitignore`).
2. Log in to [vercel.com](https://vercel.com) and click **Add New → Project**.
3. Import your GitHub repository.
4. Set Framework Preset to **Vite**, Build Command to `npm run build`, Output Directory to `dist`.
5. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**. `vercel.json` is already configured to handle all client-side SPA routes cleanly.
