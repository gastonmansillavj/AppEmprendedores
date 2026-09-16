CREATE TABLE "public"."reviews" (
  "id"          bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "reviewer_id" uuid                     NOT NULL,
  "seller_id"   uuid                     NOT NULL,
  "listing_id"  bigint                   NOT NULL,
  "rating"      integer                  NOT NULL,
  "comment"     text,
  "created_at"  timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT "reviews_listing_id_fkey" FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE,
  CONSTRAINT "reviews_pkey" PRIMARY KEY (id),
  CONSTRAINT "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))),
  CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT "reviews_reviewer_id_listing_id_key" UNIQUE (reviewer_id, listing_id),
  CONSTRAINT "reviews_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE "public"."reviews"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can insert reviews" ON "public"."reviews"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = reviewer_id));

CREATE POLICY "Reviews are viewable by everyone" ON "public"."reviews"
  FOR SELECT
  TO PUBLIC
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."reviews" TO "anon", "authenticated", "postgres", "service_role";
