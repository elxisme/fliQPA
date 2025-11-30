/*
  # Clean up duplicate provider profiles

  ## Problem
  Some users have multiple provider profiles. Need to keep only the most recent one per user.

  ## Solution
  Delete all but the most recent provider profile for each user with duplicates.
*/

DELETE FROM providers p
WHERE created_at < (
  SELECT MAX(created_at) FROM providers 
  WHERE user_id = p.user_id
);
