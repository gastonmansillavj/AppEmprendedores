CREATE TABLE "public"."profiles" (
  "id"                 uuid                     NOT NULL,
  "username"           text                     NOT NULL,
  "avatar_url"         text,
  "bio"                text,
  "created_at"         timestamp with time zone DEFAULT timezone('utc'::text, now()),
  "business_name"      text,
  "cover_url"          text,
  "city"               text                     DEFAULT 'Rafaela'::text,
  "whatsapp"           text,
  "instagram"          text,
  "facebook"           text,
  "opening_hours"      text,
  "ships"              boolean                  NOT NULL DEFAULT false,
  "has_physical_store" boolean                  NOT NULL DEFAULT false,
  "address"            text,
  CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "profiles_username_key" UNIQUE (username)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can insert their own profile" ON "public"."profiles"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can update their own profile" ON "public"."profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated", "postgres", "service_role";
