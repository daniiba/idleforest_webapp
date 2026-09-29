-- When each computer last checked in, so forests can show whose computer is
-- planting right now (a working or sleeping person in their grove).
--
-- The desktop app calls sync_node every 5 minutes while it runs, so a recent
-- last_seen_at means the app is on. Other clients that only write their
-- request total are covered by the trigger. Only the forest's owner and
-- team members are ever shown this (see app/api/forest).

ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS nodes_user_last_seen_idx
    ON public.nodes (user_id, last_seen_at DESC);

CREATE OR REPLACE FUNCTION public.touch_node_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR NEW.total_requests IS DISTINCT FROM OLD.total_requests THEN
        NEW.last_seen_at := NOW();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nodes_touch_last_seen ON public.nodes;
CREATE TRIGGER nodes_touch_last_seen
    BEFORE INSERT OR UPDATE OF total_requests ON public.nodes
    FOR EACH ROW EXECUTE FUNCTION public.touch_node_last_seen();

-- Same as 20260520151038, plus: every check-in counts as "seen", even when
-- the request total has not changed since the last one.
CREATE OR REPLACE FUNCTION public.sync_node(
  p_node_identifier text,
  p_total_requests integer,
  p_platform text default null,
  p_opt_in boolean default false
)
RETURNS public.nodes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_node public.nodes%rowtype;
BEGIN
  IF p_node_identifier IS NULL OR length(trim(p_node_identifier)) = 0 THEN
    RAISE EXCEPTION 'node_identifier is required';
  END IF;

  INSERT INTO public.nodes (
    node_identifier,
    total_requests,
    previous_requests,
    platform,
    opt_in,
    user_id,
    last_seen_at
  )
  VALUES (
    p_node_identifier,
    greatest(coalesce(p_total_requests, 0), 0),
    0,
    p_platform,
    coalesce(p_opt_in, false),
    v_user_id,
    NOW()
  )
  ON CONFLICT (node_identifier) DO UPDATE
    SET
      total_requests = greatest(
        coalesce(public.nodes.total_requests, 0),
        greatest(coalesce(excluded.total_requests, 0), 0)
      ),
      platform = excluded.platform,
      opt_in = excluded.opt_in,
      user_id = CASE
        WHEN public.nodes.user_id IS NULL THEN excluded.user_id
        ELSE public.nodes.user_id
      END,
      last_seen_at = NOW()
  RETURNING * INTO v_node;

  RETURN v_node;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_node(text, integer, text, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.sync_node(text, integer, text, boolean) TO anon, authenticated;
