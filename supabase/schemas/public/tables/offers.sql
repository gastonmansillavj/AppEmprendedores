CREATE TABLE "public"."offers" (
  "id"         bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "listing_id" bigint                   NOT NULL,
  "buyer_id"   uuid                     NOT NULL,
  "seller_id"  uuid                     NOT NULL,
  "amount"     numeric                  NOT NULL,
  "status"     text                     DEFAULT 'pending'::text,
  "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT "offers_listing_id_fkey" FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE,
  CONSTRAINT "offers_pkey" PRIMARY KEY (id),
  CONSTRAINT "offers_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text]))),
  CONSTRAINT "offers_buyer_id_fkey" FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT "offers_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE "public"."offers"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers and sellers can view their offers" ON "public"."offers"
  FOR SELECT
  TO PUBLIC
  USING (((auth.uid() = buyer_id) OR (auth.uid() = seller_id)));

CREATE POLICY "Buyers can insert offers" ON "public"."offers"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = buyer_id));

CREATE POLICY "Sellers can update offer status" ON "public"."offers"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = seller_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."offers" TO "anon", "authenticated", "postgres", "service_role";
