CREATE OR REPLACE FUNCTION public.check_listing_limits()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
declare
  total_listings integer;
begin

  -- Contar publicaciones activas del emprendimiento
  select count(*)
  into total_listings
  from public.listings
  where seller_id = new.seller_id
    and sold = false;

  -- Máximo 5 publicaciones activas
  if total_listings >= 5 then
    raise exception 'Este emprendimiento ya tiene el máximo de 5 publicaciones activas.';
  end if;

  return new;
end;
$function$;

GRANT EXECUTE ON FUNCTION "public"."check_listing_limits"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
