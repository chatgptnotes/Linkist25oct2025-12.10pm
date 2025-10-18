-- Make password_hash column optional to support OTP-based authentication
-- This allows users to register and login without passwords using OTP

-- First, check if the column exists and make it nullable
DO $$
BEGIN
  -- Check if password_hash column exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'password_hash'
  ) THEN
    -- Make password_hash nullable
    ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    RAISE NOTICE 'password_hash column made nullable';
  ELSE
    -- Column doesn't exist, create it as nullable
    ALTER TABLE users ADD COLUMN password_hash TEXT NULL;
    RAISE NOTICE 'password_hash column created as nullable';
  END IF;
END $$;

-- Add comment to explain the optional password
COMMENT ON COLUMN users.password_hash IS 'Hashed password (optional - users can authenticate via OTP instead)';
