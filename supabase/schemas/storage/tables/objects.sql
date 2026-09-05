CREATE POLICY "Listing images are publicly viewable" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING ((bucket_id = 'listing-images'::text));

CREATE POLICY "Profile images are publicly viewable vejz8c_0" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING ((bucket_id = 'profile-images'::text));

CREATE POLICY "Users can upload listing images" ON "storage"."objects"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((bucket_id = 'listing-images'::text) AND (auth.role() = 'authenticated'::text)));

CREATE POLICY "Users can upload profile images vejz8c_0" ON "storage"."objects"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((bucket_id = 'profile-images'::text) AND (auth.role() = 'authenticated'::text)));
