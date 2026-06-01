-- =============================================
-- REMOVE ADVANCE FEE & ASSOCIATED FINE MIGRATION
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Delete all existing fee payments where fee_type is 'advance'
DELETE FROM public.fee_payments 
WHERE fee_type = 'advance';

-- 2. Drop the existing fee_type constraint on fee_payments
ALTER TABLE public.fee_payments 
DROP CONSTRAINT IF EXISTS fee_payments_fee_type_check;

-- 3. Add the updated fee_type constraint to only include 'mess' and 'establishment'
ALTER TABLE public.fee_payments 
ADD CONSTRAINT fee_payments_fee_type_check 
CHECK (fee_type IN ('mess', 'establishment'));

-- 4. Drop the advance_fee column from the hostels table
ALTER TABLE public.hostels 
DROP COLUMN IF EXISTS advance_fee;

-- Done! Verify changes:
-- Expected error for the select below if the column was successfully dropped:
-- SELECT advance_fee FROM public.hostels LIMIT 1;
