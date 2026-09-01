"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

import BottomNav from "../../components/ui/BottomNav";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const [form, setForm] = useState({
    username: "",
    business_name: "",
    bio: "",
    avatar_url: "",
    cover_url: "",
    city: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
    opening_hours: "",
    ships: false,
    has_physical_store: false,
    address: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push("/auth/login");
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
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
        `
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(profileError);
      setError("No pudimos cargar tu perfil.");
      setLoading(false);
      return;
    }

    setForm({
      username: data.username ?? "",
      business_name: data.business_name ?? "",
      bio: data.bio ?? "",
      avatar_url: data.avatar_url ?? "",
      cover_url: data.cover_url ?? "",
      city: data.city ?? "",
      whatsapp: data.whatsapp ?? "",
      instagram: data.instagram ?? "",
      facebook: data.facebook ?? "",
      opening_hours: data.opening_hours ?? "",
      ships: data.ships ?? false,
      has_physical_store: data.has_physical_store ?? false,
      address: data.address ?? "",
    });

    setAvatarPreview(data.avatar_url ?? "");
    setCoverPreview(data.cover_url ?? "");

    setLoading(false);
  }

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El logo debe ser una imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("El logo no puede superar los 5 MB.");
      return;
    }

    setError("");
    setAvatarFile(file);

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  }

  function handleCoverChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("La portada debe ser una imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La portada no puede superar los 5 MB.");
      return;
    }

    setError("");
    setCoverFile(file);

    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  }

  async function uploadImage(
    file: File,
    folder: "avatars" | "covers",
    userId: string
  ) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${folder}/${userId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      let avatarUrl = form.avatar_url;
      let coverUrl = form.cover_url;

      // Subir nuevo logo
      if (avatarFile) {
        avatarUrl = await uploadImage(
          avatarFile,
          "avatars",
          user.id
        );
      }

      // Subir nueva portada
      if (coverFile) {
        coverUrl = await uploadImage(
          coverFile,
          "covers",
          user.id
        );
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username: form.username.trim() || null,
          business_name: form.business_name.trim() || null,
          bio: form.bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          cover_url: coverUrl.trim() || null,
          city: form.city.trim() || null,
          whatsapp: form.whatsapp.trim() || null,
          instagram: form.instagram.trim() || null,
          facebook: form.facebook.trim() || null,
          opening_hours: form.opening_hours.trim() || null,
          ships: form.ships,
          has_physical_store: form.has_physical_store,
          address: form.has_physical_store
            ? form.address.trim() || null
            : null,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      router.push("/account");
    } catch (err) {
      console.error(err);
      setError(
        "No pudimos guardar los cambios. Revisá que la imagen sea válida y que tengas permisos para subirla."
      );
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">
          Cargando perfil...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#222]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push("/account")}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#181818] transition"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-xl font-bold">
            Mi perfil
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-6">

          {/* Información principal */}
          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4">
              Información del emprendimiento
            </h2>

            <div className="space-y-4">

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Nombre del emprendimiento
                </label>

                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) =>
                    updateField(
                      "business_name",
                      e.target.value
                    )
                  }
                  placeholder="Ej: Arte & Alma"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Usuario
                </label>

                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    updateField(
                      "username",
                      e.target.value
                    )
                  }
                  placeholder="Ej: arteyalma"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Descripción
                </label>

                <textarea
                  value={form.bio}
                  onChange={(e) =>
                    updateField("bio", e.target.value)
                  }
                  placeholder="Contale a las personas qué ofrece tu emprendimiento..."
                  rows={4}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-red-500 transition resize-none"
                />
              </div>

            </div>
          </section>

          {/* Imágenes */}
          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4">
              Imágenes
            </h2>

            <div className="space-y-6">

              {/* Logo */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">
                  Logo del emprendimiento
                </label>

                <div className="flex flex-col sm:flex-row items-start gap-4">

                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#181818] border border-[#2a2a2a] flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon
                        size={32}
                        className="text-gray-600"
                      />
                    )}
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-medium cursor-pointer transition">
                      <Upload size={18} />
                      Cambiar logo

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>

                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG o WebP. Máximo 5 MB.
                    </p>
                  </div>

                </div>
              </div>

              {/* Portada */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">
                  Portada del emprendimiento
                </label>

                <div className="space-y-3">

                  <div className="w-full h-40 rounded-2xl overflow-hidden bg-[#181818] border border-[#2a2a2a] flex items-center justify-center">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Portada"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon
                        size={40}
                        className="text-gray-600"
                      />
                    )}
                  </div>

                  <label className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-medium cursor-pointer transition">
                    <Upload size={18} />
                    Cambiar portada

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>

                  <p className="text-xs text-gray-500">
                    JPG, PNG o WebP. Máximo 5 MB.
                  </p>

                </div>
              </div>

            </div>
          </section>

          {/* Ubicación */}
          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4">
              Ubicación
            </h2>

            <div className="space-y-4">

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Ciudad
                </label>

                <input
                  type="text"
                  value={form.city}
                  onChange={(e) =>
                    updateField("city", e.target.value)
                  }
                  placeholder="Ej: Rafaela"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-red-500 transition"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.has_physical_store}
                  onChange={(e) =>
                    updateField(
                      "has_physical_store",
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 accent-red-600"
                />

                <span>
                  Tengo un local físico
                </span>
              </label>

              {form.has_physical_store && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Dirección
                  </label>

                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      updateField(
                        "address",
                        e.target.value
                      )
                    }
                    placeholder="Ej: Av. Santa Fe 123"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-red-500 transition"
                  />
                </div>
              )}

            </div>
          </section>

          {/* Contacto */}
          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4">
              Contacto y redes
            </h2>

            <div className="space-y-4">

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  WhatsApp
                </label>

                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) =>
                    updateField(
                      "whatsapp",
                      e.target.value
                    )
                  }
                  placeholder="Ej: 3492..."
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Instagram
                </label>

                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) =>
                    updateField(
                      "instagram",
                      e.target.value
                    )
                  }
                  placeholder="@tuemprendimiento"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Facebook
                </label>

                <input
                  type="text"
                  value={form.facebook}
                  onChange={(e) =>
                    updateField(
                      "facebook",
                      e.target.value
                    )
                  }
                  placeholder="facebook.com/tuemprendimiento"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-red-500 transition"
                />
              </div>

            </div>
          </section>

          {/* Horarios y envíos */}
          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4">
              Información adicional
            </h2>

            <div className="space-y-4">

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Horarios de atención
                </label>

                <textarea
                  value={form.opening_hours}
                  onChange={(e) =>
                    updateField(
                      "opening_hours",
                      e.target.value
                    )
                  }
                  placeholder="Ej: Lunes a viernes de 9:00 a 18:00"
                  rows={3}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 outline-none focus:border-red-500 transition resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ships}
                  onChange={(e) =>
                    updateField("ships", e.target.checked)
                  }
                  className="w-5 h-5 accent-red-600"
                />

                <span>
                  Realizo envíos
                </span>
              </label>

            </div>
          </section>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4">
              {error}
            </div>
          )}

          {/* Guardar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition"
          >
            <Save size={20} />

            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
