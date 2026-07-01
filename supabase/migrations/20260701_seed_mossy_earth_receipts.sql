WITH mossy_earth AS (
  SELECT id
  FROM public.companies
  WHERE slug = 'mossy-earth'
  LIMIT 1
),
receipts AS (
  SELECT
    mossy_earth.id AS company_id,
    receipt.type,
    receipt.status,
    receipt.points,
    receipt.amount_cents,
    receipt.period_start::TIMESTAMPTZ AS period_start,
    receipt.period_end::TIMESTAMPTZ AS period_end,
    receipt.notes,
    receipt.receipt_url,
    receipt.created_at::TIMESTAMPTZ AS created_at
  FROM mossy_earth
  CROSS JOIN (
    VALUES
      (
        'payout',
        'paid',
        0,
        1200,
        '2026-06-05T00:00:00Z',
        '2026-07-05T00:00:00Z',
        'Mossy Earth receipt #2075-3645 for EUR 12.00 paid on June 5, 2026.',
        '/receits/mossy-earth-2026-06-05-receipt-2075-3645.pdf',
        '2026-06-05T00:00:00Z'
      ),
      (
        'payout',
        'paid',
        0,
        2436,
        NULL,
        NULL,
        'Mossy Earth receipt #1914-4600 for EUR 24.36 paid on July 1, 2026.',
        '/receits/mossy-earth-2026-07-01-receipt-1914-4600.pdf',
        '2026-07-01T12:36:45Z'
      )
  ) AS receipt(type, status, points, amount_cents, period_start, period_end, notes, receipt_url, created_at)
)
INSERT INTO public.company_fund_ledger (
  company_id,
  type,
  status,
  points,
  amount_cents,
  period_start,
  period_end,
  notes,
  receipt_url,
  created_at,
  updated_at
)
SELECT
  company_id,
  type,
  status,
  points,
  amount_cents,
  period_start,
  period_end,
  notes,
  receipt_url,
  created_at,
  created_at
FROM receipts
WHERE NOT EXISTS (
  SELECT 1
  FROM public.company_fund_ledger existing
  WHERE existing.company_id = receipts.company_id
    AND existing.receipt_url = receipts.receipt_url
);
