-- Fix: mutual likes were not creating matches.
-- The trigger ran with the liker's permissions, and row level security on
-- "matches" has no insert policy, so the match insert (and the like) failed.
-- SECURITY DEFINER lets the trigger create the match on the database's behalf.
-- Run this once in the Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.check_mutual_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.likes
    WHERE liker_id = NEW.liked_id
      AND liked_id = NEW.liker_id
  ) THEN
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (LEAST(NEW.liker_id, NEW.liked_id), GREATEST(NEW.liker_id, NEW.liked_id))
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Make sure the trigger exists and points at the function.
DROP TRIGGER IF EXISTS on_like_check_match ON public.likes;
CREATE TRIGGER on_like_check_match
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.check_mutual_like();

-- Create matches for any mutual likes that already exist (from earlier tests).
INSERT INTO public.matches (user1_id, user2_id)
SELECT DISTINCT LEAST(a.liker_id, a.liked_id), GREATEST(a.liker_id, a.liked_id)
FROM public.likes a
JOIN public.likes b ON b.liker_id = a.liked_id AND b.liked_id = a.liker_id
ON CONFLICT DO NOTHING;
