-- ============================================================
--   RECIPET — Supabase Database Schema
--   Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
--   CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================================
--   RECIPES
-- ============================================================
CREATE TABLE IF NOT EXISTS recipes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  main_image       TEXT,
  gallery          TEXT[] DEFAULT '{}',
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags             TEXT[] DEFAULT '{}',
  servings         INTEGER NOT NULL DEFAULT 4 CHECK (servings > 0),
  prep_time        INTEGER NOT NULL DEFAULT 0 CHECK (prep_time >= 0),  -- minutes
  cook_time        INTEGER NOT NULL DEFAULT 0 CHECK (cook_time >= 0),  -- minutes
  total_time       INTEGER NOT NULL DEFAULT 0 CHECK (total_time >= 0), -- minutes
  ingredients      JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions     JSONB NOT NULL DEFAULT '[]'::jsonb,
  author           TEXT NOT NULL DEFAULT 'Recipet Team',
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  seo_title        TEXT,
  meta_description TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipes_slug        ON recipes(slug);
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_recipes_status      ON recipes(status);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at  ON recipes(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
--   ADMIN USERS (profile table linked to Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--   ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users   ENABLE ROW LEVEL SECURITY;

-- ── Categories: public read ──
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_all"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── Recipes: public can only read published ──
CREATE POLICY "recipes_public_read_published"
  ON recipes FOR SELECT
  USING (status = 'published');

CREATE POLICY "recipes_admin_all"
  ON recipes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── Admin users: only admin can see own row ──
CREATE POLICY "admin_users_own"
  ON admin_users FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
--   STORAGE BUCKET
--   Create 'recipe-images' bucket in the Supabase dashboard
--   OR run this (requires service role):
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('recipe-images', 'recipe-images', true)
-- ON CONFLICT DO NOTHING;

-- Storage RLS
-- CREATE POLICY "recipe_images_public_read"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'recipe-images');

-- CREATE POLICY "recipe_images_admin_upload"
--   ON storage.objects FOR INSERT
--   USING (auth.role() = 'authenticated' AND bucket_id = 'recipe-images')
--   WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'recipe-images');

-- CREATE POLICY "recipe_images_admin_delete"
--   ON storage.objects FOR DELETE
--   USING (auth.role() = 'authenticated' AND bucket_id = 'recipe-images');

-- ============================================================
--   SEED DATA (sample categories for testing)
-- ============================================================
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Breakfast', 'breakfast', 'Start your day right with our breakfast recipes.', 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&auto=format&fit=crop&q=60'),
  ('Lunch', 'lunch', 'Quick and satisfying lunch ideas for every day.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60'),
  ('Dinner', 'dinner', 'Impressive dinner recipes for weeknights and weekends.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=60'),
  ('Desserts', 'desserts', 'Sweet treats and indulgent desserts for every occasion.', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60'),
  ('Snacks', 'snacks', 'Light bites and snacks to keep you going.', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&auto=format&fit=crop&q=60'),
  ('Vegetarian', 'vegetarian', 'Delicious plant-based recipes for every meal.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60'),
  ('Drinks', 'drinks', 'Refreshing drinks and cocktails for any occasion.', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=60'),
  ('Baking', 'baking', 'Breads, cakes, and baked goods for the home baker.', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&auto=format&fit=crop&q=60')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
--   SEED RECIPE (sample recipe for testing)
-- ============================================================
INSERT INTO recipes (
  title, slug, description, main_image, category_id, tags,
  servings, prep_time, cook_time, total_time,
  ingredients, instructions, author, status,
  seo_title, meta_description
)
SELECT
  'Creamy Garlic Pasta',
  'creamy-garlic-pasta',
  'A rich and satisfying pasta dish made with a velvety garlic cream sauce. Ready in 30 minutes and perfect for a weeknight dinner.',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&auto=format&fit=crop&q=80',
  (SELECT id FROM categories WHERE slug = 'dinner' LIMIT 1),
  ARRAY['pasta', 'quick', 'creamy', 'italian'],
  4,
  10,
  20,
  30,
  '[
    {"quantity": "400", "unit": "g", "name": "spaghetti or fettuccine"},
    {"quantity": "4", "unit": "cloves", "name": "garlic, finely minced"},
    {"quantity": "2", "unit": "tbsp", "name": "olive oil"},
    {"quantity": "1", "unit": "tbsp", "name": "unsalted butter"},
    {"quantity": "250", "unit": "ml", "name": "heavy cream"},
    {"quantity": "60", "unit": "g", "name": "Parmesan, freshly grated"},
    {"quantity": "1", "unit": "tsp", "name": "salt, plus more for pasta water"},
    {"quantity": "", "unit": "", "name": "Black pepper to taste"},
    {"quantity": "2", "unit": "tbsp", "name": "fresh parsley, chopped (to garnish)"}
  ]'::jsonb,
  '[
    {"step": 1, "title": "Cook the pasta", "content": "Bring a large pot of generously salted water to a boil. Cook the pasta according to package instructions until al dente. Reserve 1 cup of pasta cooking water before draining."},
    {"step": 2, "title": "Sauté the garlic", "content": "While the pasta cooks, heat olive oil and butter in a large skillet over medium heat. Add the minced garlic and cook, stirring frequently, for 1-2 minutes until fragrant and lightly golden. Do not let it burn."},
    {"step": 3, "title": "Build the sauce", "content": "Pour in the heavy cream and bring to a gentle simmer. Cook for 3-4 minutes, stirring occasionally, until the cream has reduced slightly and thickened enough to coat the back of a spoon."},
    {"step": 4, "title": "Add the Parmesan", "content": "Remove the pan from the heat and stir in the grated Parmesan until melted and smooth. Season generously with salt and black pepper."},
    {"step": 5, "title": "Combine and serve", "content": "Add the drained pasta to the sauce and toss to coat, adding a splash of reserved pasta water to loosen the sauce as needed. Serve immediately, garnished with fresh parsley and extra Parmesan."}
  ]'::jsonb,
  'Recipet Team',
  'published',
  'Creamy Garlic Pasta Recipe — 30 Minutes',
  'This creamy garlic pasta is the ultimate quick comfort food. Ready in 30 minutes with simple ingredients you likely already have.'
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE slug = 'creamy-garlic-pasta');

-- ============================================================
--   NOTES FOR PRODUCTION SETUP
-- ============================================================
-- 1. Create a Supabase project at https://supabase.com
-- 2. Paste this entire SQL into Supabase SQL Editor and run it
-- 3. Go to Storage and create a public bucket named "recipe-images"
-- 4. Enable RLS on the storage bucket (uncomment policies above or set in dashboard)
-- 5. Create your admin user via Supabase Auth → Users → Invite User
-- 6. Fill in your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
-- 7. Run: npm install && npm run dev
-- ============================================================
