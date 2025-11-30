/*
  # Add unique constraint on providers.user_id

  ## Problem
  Multiple provider profiles can be created for the same user.

  ## Solution
  Add a UNIQUE constraint on providers.user_id to ensure each user can only have one provider profile.
*/

ALTER TABLE providers ADD CONSTRAINT unique_providers_user_id UNIQUE (user_id);
