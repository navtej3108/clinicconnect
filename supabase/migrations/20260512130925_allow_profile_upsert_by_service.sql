/*
  # Allow anon/service to set up admin accounts

  - Add a policy that allows any authenticated user to read profiles
    needed for admin checks in nested queries
  - This is a supplementary read policy for cross-checking roles in RLS
*/

CREATE POLICY "Authenticated users can view any profile role"
  ON profiles FOR SELECT TO authenticated
  USING (true);
