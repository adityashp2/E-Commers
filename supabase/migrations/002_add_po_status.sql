-- =============================================
-- Migration: Add 'po' (Pre-Order) to produk status check constraint
-- Run this in Supabase SQL Editor if table already exists
-- =============================================

ALTER TABLE produk DROP CONSTRAINT IF EXISTS produk_status_check;
ALTER TABLE produk ADD CONSTRAINT produk_status_check CHECK (status IN ('tersedia', 'po', 'habis'));
