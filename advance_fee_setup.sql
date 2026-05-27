-- =============================================
-- ADVANCE FEE & NEW FINE SYSTEM MIGRATION
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Add advance_fee column to hostels table with default 500
ALTER TABLE public.hostels 
ADD COLUMN IF NOT EXISTS advance_fee integer NOT NULL DEFAULT 500;

-- 2. Drop the existing fee_type constraint on fee_payments
ALTER TABLE public.fee_payments 
DROP CONSTRAINT IF EXISTS fee_payments_fee_type_check;

-- 3. Add the updated fee_type constraint to include 'advance'
ALTER TABLE public.fee_payments 
ADD CONSTRAINT fee_payments_fee_type_check 
CHECK (fee_type IN ('mess', 'establishment', 'advance'));

-- Done! Verify changes:
SELECT advance_fee FROM public.hostels LIMIT 1;
