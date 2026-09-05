CREATE TABLE "public"."listings" (
  "id"          bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "title"       text                     NOT NULL,
  "description" text,
  "price"       numeric                  NOT NULL,
  "category"    text                     NOT NULL,
  "condition"   text                     NOT NULL,
  "image_url"   text,
  "seller_id"   uuid                     NOT NULL,
  "likes"       integer                  DEFAULT 0,
  "sold"        boolean                  DEFAULT false,
  "created_at"  timestamp with time zone DEFAULT timezone('utc'::text, now()),
  "images"      text[],
  "type"        text,
  CONSTRAINT "listings_pkey" PRIMARY KEY (id),
  CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE "public"."listings"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER enforce_listing_limits
  BEFORE INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_listing_limits();

CREATE POLICY "Listings are viewable by everyone" ON "public"."listings"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can delete their own listings" ON "public"."listings"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = seller_id));

CREATE POLICY "Users can insert their own listings" ON "public"."listings"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = seller_id));

CREATE POLICY "Users can update their own listings" ON "public"."listings"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = seller_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."listings" TO "anon", "authenticated", "postgres", "service_role";
