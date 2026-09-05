"use client"; 
 
import { useEffect, useState } from "react"; 
import { useRouter, useSearchParams } from "next/navigation"; 
import { supabase } from "@/lib/supabase"; 
import Button from "../components/ui/Button"; 
 
const productCategories = [ 
  "Gastronomía", 
  "Indumentaria", 
  "Accesorios", 
  "Hogar y decoración", 
  "Regalos y personalizados", 
  "Arte y artesanías", 
  "Mascotas", 
  "Tecnología", 
  "Automotor", 
  "Otros", 
]; 
 
const serviceCategories = [ 
  "Reparaciones y mantenimiento", 
  "Belleza y estética", 
  "Fotografía y video", 
  "Tecnología y servicios digitales", 
  "Salud y entrenamiento", 
  "Automotor", 
  "Eventos", 
  "Hogar", 
  "Educación", 
  "Otros", 
]; 
 
const MAX_PHOTOS = 5; 
const MAX_LISTINGS = 5; 
 
type Listing = { 
  id: number; 
  title: string; 
  description: string | null; 
  price: number; 
  category: string | null; 
  image_url: string | null; 
  images: string[] | null; 
  sold: boolean; 
  type: string | null; 
}; 
 
export default function SellPage() { 
  const router = useRouter(); 
  const searchParams = useSearchParams(); 
 
  const editId = searchParams.get("id"); 
  const isEditing = !!editId; 
 
  const [userId, setUserId] = useState<string | null>(null); 
 
  const [loading, setLoading] = useState(false); 
  const [loadingListing, setLoadingListing] = useState(false); 
  const [checkingLimit, setCheckingLimit] = useState(true); 
  const [generating, setGenerating] = useState(false); 
 
  const [error, setError] = useState(""); 
 
  const [form, setForm] = useState({ 
    title: "", 
    price: "", 
    type: "Producto", 
    category: "", 
    description: "", 
  }); 
 
  const [images, setImages] = useState<File[]>([]); 
  const [existingImages, setExistingImages] = useState<string[]>([]); 
  const [listingLoaded, setListingLoaded] = useState(false); 
 
  useEffect(() => { 
    async function getUser() { 
      const { 
        data: { user }, 
      } = await supabase.auth.getUser(); 
 
      if (!user) { 
        router.push("/auth"); 
        return; 
      } 
 
      setUserId(user.id); 
    } 
 
    getUser(); 
  }, [router]); 
 
  useEffect(() => { 
    if (!userId) return; 
 
    if (isEditing && editId) { 
      loadListing(editId); 
    } else { 
      setListingLoaded(true); 
      checkListingLimit(); 
    } 
  }, [userId, editId, isEditing]); 
 
  async function loadListing(id: string) { 
    setLoadingListing(true); 
    setCheckingLimit(false); 
    setError(""); 
 
    const { data, error: listingError } = await supabase 
      .from("listings") 
      .select(` 
        id, 
        title, 
        description, 
        price, 
        category, 
        image_url, 
        images, 
        sold, 
        type 
      `) 
      .eq("id", id) 
      .eq("seller_id", userId) 
      .single(); 
 
    if (listingError || !data) { 
      console.error("Error obteniendo publicación:", listingError); 
 
      setError("No se pudo encontrar esta publicación."); 
      setLoadingListing(false); 
      return; 
    } 
 
    const listing = data as Listing; 
 
    const listingType = 
      listing.type === "Servicio" 
        ? "Servicio" 
        : "Producto"; 
 
    setForm({ 
      title: listing.title || "", 
      price: listing.price != null ? String(listing.price) : "", 
      type: listingType, 
      category: listing.category || "", 
      description: listing.description || "", 
    }); 
 
    let savedImages: string[] = []; 
 
    if (listing.images && listing.images.length > 0) { 
      savedImages = listing.images; 
    } else if (listing.image_url) { 
      savedImages = [listing.image_url]; 
    } 
 
    setExistingImages(savedImages); 
 
    setListingLoaded(true); 
    setLoadingListing(false); 
  } 
 
  async function checkListingLimit() { 
    setCheckingLimit(true); 
 
    const { count, error: countError } = await supabase 
      .from("listings") 
      .select("id", { 
        count: "exact", 
        head: true, 
      }) 
      .eq("seller_id", userId) 
      .eq("sold", false); 
 
    if (countError) { 
      console.error("Error verificando publicaciones:", countError); 
 
      setError("No se pudo verificar el límite de publicaciones."); 
      setCheckingLimit(false); 
      return; 
    } 
 
    if ((count || 0) >= MAX_LISTINGS) { 
      setError( 
        `Alcanzaste el máximo de ${MAX_LISTINGS} publicaciones activas.` 
      ); 
    } 
 
    setCheckingLimit(false); 
  } 
 
  const handleChange = ( 
    e: React.ChangeEvent< 
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement 
    > 
  ) => { 
    const { name, value } = e.target; 
 
    setForm((previous) => { 
      if (name === "type") { 
        return { 
          ...previous, 
          type: value, 
          category: "", 
        }; 
      } 
 
      return { 
        ...previous, 
        [name]: value, 
      }; 
    }); 
  }; 
 
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const selectedFiles = Array.from(e.target.files || []); 
 
    const currentTotal = existingImages.length + images.length; 
    const availableSlots = MAX_PHOTOS - currentTotal; 
 
    const files = selectedFiles.slice(0, availableSlots); 
 
    if (files.length === 0) { 
      e.target.value = ""; 
      return; 
    } 
 
    setImages((previous) => 
      [...previous, ...files].slice(0, MAX_PHOTOS) 
    ); 
 
    e.target.value = ""; 
  }; 
 
  function removeExistingImage(index: number) { 
    setExistingImages((previous) => 
      previous.filter((_, i) => i !== index) 
    ); 
  } 
 
  function removeNewImage(index: number) { 
    setImages((previous) => 
      previous.filter((_, i) => i !== index) 
    ); 
  } 
 
  const handleGenerate = async () => { 
    const primary = images[0]; 
 
    if (!primary) return; 
 
    setGenerating(true); 
    setError(""); 
 
    try { 
      const reader = new FileReader(); 
 
      reader.readAsDataURL(primary); 
 
      reader.onload = async () => { 
        try { 
          const base64 = (reader.result as string).split(",")[1]; 
 
          const res = await fetch("/api/generate-listing", { 
            method: "POST", 
            headers: { 
              "Content-Type": "application/json", 
            }, 
            body: JSON.stringify({ 
              imageBase64: base64, 
              mediaType: primary.type, 
            }), 
          }); 
 
          const data = await res.json(); 
 
          if (data.error) { 
            throw new Error(data.error); 
          } 
 
          setForm((previous) => ({ 
            ...previous, 
            title: data.title || "", 
            price: data.price != null ? String(data.price) : "", 
            category: data.category || "", 
            description: data.description || "", 
          })); 
        } catch (err: unknown) { 
          setError( 
            err instanceof Error 
              ? err.message 
              : "No se pudo generar la publicación." 
          ); 
        } finally { 
          setGenerating(false); 
        } 
      }; 
    } catch (err: unknown) { 
      setError( 
        err instanceof Error 
          ? err.message 
          : "No se pudo generar la publicación." 
      ); 
 
      setGenerating(false); 
    } 
  }; 
 
  async function uploadNewImages(): Promise<string[]> { 
    const imageUrls: string[] = []; 
 
    for (const file of images) { 
      const extension = 
        file.name.split(".").pop()?.toLowerCase() || "jpg"; 
 
      const path = `${userId}/${Date.now()}-${imageUrls.length}.${extension}`; 
 
      const { error: uploadError } = await supabase.storage 
        .from("listing-images") 
        .upload(path, file); 
 
      if (uploadError) { 
        throw uploadError; 
      } 
 
      const { data: urlData } = supabase.storage 
        .from("listing-images") 
        .getPublicUrl(path); 
 
      imageUrls.push(urlData.publicUrl); 
    } 
 
    return imageUrls; 
  } 
 
  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
 
    if (!userId) return; 
 
    if (!form.type) { 
      setError("Seleccioná si es un producto o un servicio."); 
      return; 
    } 
 
    if (!form.category) { 
      setError("Seleccioná una categoría."); 
      return; 
    } 
 
    setLoading(true); 
    setError(""); 
 
    try { 
      if (!isEditing) { 
        const { count, error: countError } = await supabase 
          .from("listings") 
          .select("id", { 
            count: "exact", 
            head: true, 
          }) 
          .eq("seller_id", userId) 
          .eq("sold", false); 
 
        if (countError) { 
          throw countError; 
        } 
 
        if ((count || 0) >= MAX_LISTINGS) { 
          throw new Error( 
            `Alcanzaste el máximo de ${MAX_LISTINGS} publicaciones activas.` 
          ); 
        } 
 
        const newImageUrls = await uploadNewImages(); 
 
        const { error: insertError } = await supabase 
          .from("listings") 
          .insert({ 
            title: form.title, 
            price: Number(form.price), 
            category: form.category, 
            description: form.description, 
            type: form.type, 
            condition: "Nuevo", 
            image_url: newImageUrls[0] || null, 
            images: newImageUrls.length > 0 ? newImageUrls : null, 
            seller_id: userId, 
          }); 
 
        if (insertError) { 
          throw insertError; 
        } 
 
        router.push("/account/listings"); 
        return; 
      } 
 
      const newImageUrls = await uploadNewImages(); 
 
      const finalImages = [ 
        ...existingImages, 
        ...newImageUrls, 
      ].slice(0, MAX_PHOTOS); 
 
      const { error: updateError } = await supabase 
        .from("listings") 
        .update({ 
          title: form.title, 
          price: Number(form.price), 
          category: form.category, 
          description: form.description, 
          type: form.type, 
          image_url: finalImages[0] || null, 
          images: finalImages.length > 0 ? finalImages : null, 
        }) 
        .eq("id", editId) 
        .eq("seller_id", userId); 
 
      if (updateError) { 
        throw updateError; 
      } 
 
      router.push("/account/listings"); 
    } catch (err: unknown) { 
      console.error("Error guardando publicación:", err); 
 
      setError( 
        err instanceof Error 
          ? err.message 
          : "Ocurrió un error al guardar la publicación." 
      ); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  if ( 
    !userId || 
    loadingListing || 
    (isEditing && !listingLoaded) 
  ) { 
    return ( 
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"> 
        <main className="max-w-lg mx-auto px-4 py-8"> 
          <div className="h-8 w-56 bg-[var(--color-subtle)] rounded animate-pulse" /> 
 
          <div className="mt-6 h-[500px] bg-[var(--color-surface)] rounded-2xl animate-pulse" /> 
        </main> 
      </div> 
    ); 
  } 
 
  const categories = 
    form.type === "Servicio" 
      ? serviceCategories 
      : productCategories; 
 
  const totalImages = existingImages.length + images.length; 
 
  const canAddImages = totalImages < MAX_PHOTOS; 
 
  return ( 
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"> 
 
      <main className="max-w-lg mx-auto px-4 py-8 pb-16"> 
 
        <h1 className="text-2xl font-extrabold mb-2 tracking-tight"> 
          {isEditing 
            ? "Editar publicación" 
            : "Nueva publicación"} 
        </h1> 
 
        <p className="text-sm text-[var(--color-muted)] mb-6"> 
          {isEditing 
            ? "Modificá la información de tu publicación." 
            : `Podés tener hasta ${MAX_LISTINGS} publicaciones activas.`} 
        </p> 
 
        <form 
          onSubmit={handleSubmit} 
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 space-y-5" 
        > 
 
          <div> 
            <label className="block text-sm font-medium text-[var(--color-muted)] mb-1"> 
              Fotos ({totalImages}/{MAX_PHOTOS}) 
            </label> 
 
            <div 
              className={`w-full h-48 border-2 border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center overflow-hidden transition-colors ${ 
                canAddImages 
                  ? "cursor-pointer hover:border-[var(--color-brand)]" 
                  : "" 
              }`} 
              onClick={() => { 
                if (canAddImages) { 
                  document 
                    .getElementById("image-input") 
                    ?.click(); 
                } 
              }} 
            > 
              {existingImages[0] ? ( 
                <img 
                  src={existingImages[0]} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover" 
                /> 
              ) : images[0] ? ( 
                <img 
                  src={URL.createObjectURL(images[0])} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover" 
                /> 
              ) : ( 
                <div className="text-center"> 
                  <p className="text-3xl mb-1">📷</p> 
 
                  <p className="text-xs text-[var(--color-muted)]"> 
                    Agregá hasta {MAX_PHOTOS} fotos 
                  </p> 
                </div> 
              )} 
            </div> 
 
            <input 
              id="image-input" 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImages} 
              className="hidden" 
              disabled={!canAddImages} 
            /> 
 
            {totalImages > 0 && ( 
              <div className="flex gap-2 mt-2 flex-wrap"> 
 
                {existingImages.map((src, i) => ( 
                  <div 
                    key={`existing-${src}`} 
                    className="relative w-14 h-14 rounded-lg overflow-hidden border border-[var(--color-border)]" 
                  > 
                    <img 
                      src={src} 
                      alt={`Foto ${i + 1}`} 
                      className="w-full h-full object-cover" 
                    /> 
 
                    <button 
                      type="button" 
                      onClick={() => removeExistingImage(i)} 
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center leading-none" 
                    > 
                      × 
                    </button> 
                  </div> 
                ))} 
 
                {images.map((file, i) => ( 
                  <div 
                    key={`${file.name}-${i}`} 
                    className="relative w-14 h-14 rounded-lg overflow-hidden border border-[var(--color-border)]" 
                  > 
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Foto ${existingImages.length + i + 1}`} 
                      className="w-full h-full object-cover" 
                    /> 
 
                    <button 
                      type="button" 
                      onClick={() => removeNewImage(i)} 
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center leading-none" 
                    > 
                      × 
                    </button> 
                  </div> 
                ))} 
 
                {canAddImages && ( 
                  <button 
                    type="button" 
                    onClick={() => 
                      document 
                        .getElementById("image-input") 
                        ?.click() 
                    } 
                    className="w-14 h-14 rounded-lg border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] text-lg hover:border-[var(--color-brand)] transition-colors" 
                  > 
                    + 
                  </button> 
                )} 
 
              </div> 
            )} 
          </div> 
 
          {images.length > 0 && ( 
            <Button 
              type="button" 
              variant="ai" 
              onClick={handleGenerate} 
              disabled={generating} 
              className="w-full py-3 text-sm" 
            > 
              {generating ? ( 
                <> 
                  <span className="animate-spin">⏳</span>{" "} 
                  Generando... 
                </> 
              ) : ( 
                <>✨ Generar publicación con IA</> 
              )} 
            </Button> 
          )} 
 
          <div> 
            <label className="block text-sm font-medium text-[var(--color-muted)] mb-1"> 
              Nombre 
            </label> 
 
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              required 
              placeholder="Nombre del producto o servicio" 
              className="w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-brand)] transition-colors" 
            /> 
          </div> 
 
          <div> 
            <label className="block text-sm font-medium text-[var(--color-muted)] mb-1"> 
              Precio 
            </label> 
 
            <input 
              name="price" 
              value={form.price} 
              onChange={handleChange} 
              required 
              type="number" 
              min="0" 
              placeholder="0" 
              className="w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-brand)] transition-colors" 
            /> 
          </div> 
 
          <div> 
            <label className="block text-sm font-medium text-[var(--color-muted)] mb-1"> 
              Tipo de publicación 
            </label> 
 
            <select 
              name="type" 
              value={form.type} 
              onChange={handleChange} 
              required 
              className="w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-brand)] transition-colors" 
            > 
              <option value="Producto">Producto</option> 
              <option value="Servicio">Servicio</option> 
            </select> 
          </div> 
 
          <div> 
            <label className="block text-sm font-medium text-[var(--color-muted)] mb-1"> 
              Categoría 
            </label> 
 
            <select 
              name="category" 
              value={form.category} 
              onChange={handleChange} 
              required 
              className="w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-brand)] transition-colors" 
            > 
              <option value="">Seleccioná una categoría</option> 
 
              {categories.map((category) => ( 
                <option key={category} value={category}> 
                  {category} 
                </option> 
              ))} 
            </select> 
          </div> 
 
          <div> 
            <label className="block text-sm font-medium text-[var(--color-muted)] mb-1"> 
              Descripción 
            </label> 
 
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Contale a los clientes sobre tu producto o servicio..." 
              rows={4} 
              className="w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-brand)] transition-colors resize-none" 
            /> 
          </div> 
 
          {error && ( 
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"> 
              <p className="text-red-500 text-sm"> 
                {error} 
              </p> 
            </div> 
          )} 
 
          <Button 
            type="submit" 
            disabled={ 
              loading || 
              checkingLimit || 
              (!isEditing && 
                !!error && 
                error.includes("máximo")) 
            } 
            className="w-full py-3" 
          > 
            {loading 
              ? isEditing 
                ? "Guardando..." 
                : "Publicando..." 
              : isEditing 
              ? "Guardar cambios" 
              : "Publicar"} 
          </Button> 
 
        </form> 
      </main> 
    </div> 
  ); 
}