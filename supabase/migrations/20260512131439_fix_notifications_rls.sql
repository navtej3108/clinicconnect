/*
  # Fix Notifications RLS Policy

  ## Issue
  The `System can insert notifications` policy had `WITH CHECK (true)` which bypassed RLS.
  
  ## Solution
  - Drop the overly permissive policy
  - Add a restrictive policy that only allows the system (via service role) or the recipient user
    to insert notifications for themselves
  - Ensure notifications can only be created for authenticated users
*/

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can insert notifications for themselves"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Service role (for backend functions) can insert on behalf of users
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT TO service_role
  WITH CHECK (true);
