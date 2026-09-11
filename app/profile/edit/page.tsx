"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Camera } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function ProfileEditPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [ships, setShips] = useState(false);
  const [hasPhysicalStore, setHasPhysicalStore] = useState(false);
  const [address, setAddress] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        username,
        business_name,
        bio,
        avatar_url,
        cover_url,
        city,
        whatsapp,
        instagram,
        facebook,
        opening_hours,
        ships,
        has_physical_store,
        address
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setUsername(data.username || "");
      setBusinessName(data.business_name || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || "");
      setCoverUrl(data.cover_url || "");
      setAvatarPreview(data.avatar_url || "");
      setCoverPreview(data.cover_url || "");
      setCity(data.city || "");
      setWhatsapp(data.whatsapp || "");
      setInstagram(data.instagram || "");
      setFacebook(data.facebook || "");
      setOpeningHours(data.opening_hours || "");
      setShips(!!data.ships);
      setHasPhysicalStore(!!data.has_physical_store);
      setAddress(data.address || "");
    }

    setLoading(false);
  }

  function handleAvatarChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    setAvatarFile(file);

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  }

  function handleCoverChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    setCoverFile(file);

    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  }

  async function uploadImage(
    file: File,
    folder: "avatars" | "covers",
    userId: string
  ) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath =
      `${folder}/${userId}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          upsert: true,
        });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!businessName.trim()) {
      setError(
        "El nombre del emprendimiento es obligatorio."
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth");
        return;
      }

      let finalAvatarUrl = avatarUrl;
      let finalCoverUrl = coverUrl;

      if (avatarFile) {
        finalAvatarUrl = await uploadImage(
          avatarFile,
          "avatars",
          user.id
        );
      }

      if (coverFile) {
        finalCoverUrl = await uploadImage(
          coverFile,
          "covers",
          user.id
        );
      }

      const {
        data: updatedProfile,
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          business_name: businessName.trim(),
          bio: bio.trim(),
          avatar_url: finalAvatarUrl || null,
          cover_url: finalCoverUrl || null,
          city: city.trim(),
          whatsapp: whatsapp.trim(),
          instagram: instagram.trim(),
          facebook: facebook.trim(),
          opening_hours: openingHours.trim(),
          ships,
          has_physical_store: hasPhysicalStore,
          address: hasPhysicalStore
            ? address.trim()
            : "",
        })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (!updatedProfile) {
        throw new Error(
          "No se encontró el perfil del usuario para guardar los cambios."
        );
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      console.error(
        "Error guardando perfil:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el perfil."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center">
        <p className="text-[var(--color-muted)]">
          Cargando perfil...
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl px-4 py-2 text-sm outline-none focus:border-red-500 transition-colors";

  const labelClass =
    "block text-sm font-medium text-[var(--color-muted)] mb-1";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center">
          <h1 className="font-bold">
            Editar perfil
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">

        <form
          onSubmit={handleSave}
          className="space-y-6"
        >

          <div>
            <h2 className="text-xl font-bold">
              Datos de tu emprendimiento
            </h2>

            <p className="text-sm text-[var(--color-muted)] mt-1">
              Completá estos datos para que los clientes puedan
              conocerte.
            </p>
          </div>

          <div>
            <label className={labelClass}>
              Nombre de usuario
            </label>

            <input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className={inputClass}
              placeholder="miemprendimiento"
            />
          </div>

          <div>
            <label className={labelClass}>
              Nombre del emprendimiento *
            </label>

            <input
              value={businessName}
              onChange={(e) =>
                setBusinessName(e.target.value)
              }
              required
              className={inputClass}
              placeholder="Mi emprendimiento"
            />
          </div>

          <div>
            <label className={labelClass}>
              Descripción
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              className={`${inputClass} min-h-28 resize-none`}
              placeholder="Contale a tus clientes qué ofrecés..."
            />
          </div>

          <div>
            <label className={labelClass}>
              Ciudad
            </label>

            <input
              value={city}
              onChange={(e) =>
                setCity(e.target.value)
              }
              className={inputClass}
              placeholder="Rafaela"
            />
          </div>

          <div>
            <label className={labelClass}>
              WhatsApp
            </label>

            <input
              value={whatsapp}
              onChange={(e) =>
                setWhatsapp(e.target.value)
              }
              className={inputClass}
              placeholder="3492..."
            />
          </div>

          <div>
            <label className={labelClass}>
              Instagram
            </label>

            <input
              value={instagram}
              onChange={(e) =>
                setInstagram(e.target.value)
              }
              className={inputClass}
              placeholder="@miemprendimiento"
            />
          </div>

          <div>
            <label className={labelClass}>
              Facebook
            </label>

            <input
              value={facebook}
              onChange={(e) =>
                setFacebook(e.target.value)
              }
              className={inputClass}
              placeholder="Mi emprendimiento"
            />
          </div>

          <div>
            <label className={labelClass}>
              Horarios
            </label>

            <textarea
              value={openingHours}
              onChange={(e) =>
                setOpeningHours(e.target.value)
              }
              className={`${inputClass} min-h-24 resize-none`}
              placeholder="Lunes a viernes de 9 a 18 hs"
            />
          </div>

          <div className="space-y-3">

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ships}
                onChange={(e) =>
                  setShips(e.target.checked)
                }
                className="w-4 h-4 accent-red-600"
              />

              <span className="text-sm">
                Realizo envíos
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPhysicalStore}
                onChange={(e) =>
                  setHasPhysicalStore(
                    e.target.checked
                  )
                }
                className="w-4 h-4 accent-red-600"
              />

              <span className="text-sm">
                Tengo local físico
              </span>
            </label>

          </div>

          {hasPhysicalStore && (
            <div>
              <label className={labelClass}>
                Dirección
              </label>

              <input
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                className={inputClass}
                placeholder="Dirección del local"
              />
            </div>
          )}

          {/* LOGO */}
          <div>
            <label className={labelClass}>
              Logo
            </label>

            <div
              className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-dashed border-[var(--color-border)] bg-[var(--color-subtle)] cursor-pointer hover:border-red-500 transition-colors"
              onClick={() =>
                document
                  .getElementById("avatar-input")
                  ?.click()
              }
            >
              {avatarPreview ? (
                <>
                  <img
                    src={avatarPreview}
                    alt="Vista previa del logo"
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 bg-black/70 text-white rounded-full p-2 transition-opacity">
                      <Camera size={20} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-muted)]">
                  <ImagePlus size={32} />

                  <span className="text-xs mt-2 font-medium">
                    Subir logo
                  </span>
                </div>
              )}
            </div>

            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <p className="text-xs text-[var(--color-muted)] mt-2">
              Hacé clic en la imagen para cambiarla.
            </p>
          </div>

          {/* PORTADA */}
          <div>
            <label className={labelClass}>
              Imagen de portada
            </label>

            <div
              className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-dashed border-[var(--color-border)] bg-[var(--color-subtle)] cursor-pointer hover:border-red-500 transition-colors"
              onClick={() =>
                document
                  .getElementById("cover-input")
                  ?.click()
              }
            >
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="Vista previa de portada"
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 bg-black/70 text-white rounded-full px-4 py-2 flex items-center gap-2 transition-opacity">
                      <Camera size={18} />
                      <span className="text-sm font-medium">
                        Cambiar portada
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-muted)]">
                  <ImagePlus size={36} />

                  <span className="text-sm mt-2 font-medium">
                    Subir imagen de portada
                  </span>

                  <span className="text-xs mt-1">
                    Recomendado: imagen horizontal
                  </span>
                </div>
              )}
            </div>

            <input
              id="cover-input"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />

            <p className="text-xs text-[var(--color-muted)] mt-2">
              Hacé clic en la imagen para cambiarla.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-500">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {saving
              ? "Guardando..."
              : "Guardar perfil"}
          </button>

        </form>
      </main>
    </div>
  );
}
