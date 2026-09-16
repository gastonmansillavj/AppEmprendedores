"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
} from "lucide-react";

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-24">

      {/* HEADER */}

      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#222]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">

          <Link
            href="/account"
            className="w-10 h-10 rounded-xl bg-[#111] border border-[#2a2a2a] flex items-center justify-center hover:border-red-500/60 transition"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </Link>

          <h1 className="text-xl font-bold">
            Créditos y licencias
          </h1>

        </div>
      </header>

      {/* CONTENIDO */}

      <main className="max-w-4xl mx-auto px-4 py-6">

        <div className="space-y-5">

          {/* INTRODUCCIÓN */}

          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <FileText
                  size={22}
                  className="text-red-500"
                />
              </div>

              <div>
                <h2 className="font-semibold">
                  Información legal
                </h2>

                <p className="text-sm text-gray-500">
                  Créditos y licencias de EMPREespacio
                </p>
              </div>

            </div>

            <p className="text-sm text-gray-400 leading-6">
              <strong className="text-white">
                EMPREespacio
              </strong>{" "}
              es un proyecto independiente desarrollado para conectar
              emprendimientos de la ciudad de Rafaela con personas
              interesadas en sus productos y servicios.
            </p>

            <p className="text-sm text-gray-500 leading-6 mt-3">
              El proyecto fue desarrollado inicialmente bajo el nombre
              <strong className="text-gray-300">
                {" "}AppEmprendedores
              </strong>{" "}
              y posteriormente adoptó la identidad EMPREespacio.
            </p>

          </section>

          {/* CÓDIGO BASE */}

          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">

            <h2 className="text-lg font-semibold mb-3">
              Código base
            </h2>

            <p className="text-sm text-gray-400 leading-6 mb-4">
              EMPREespacio comenzó a desarrollarse utilizando como base
              un proyecto open source denominado{" "}
              <strong className="text-white">
                Mercari Clone
              </strong>
              , publicado originalmente por la cuenta de GitHub{" "}
              <strong className="text-white">
                itsnotvii
              </strong>
              .
            </p>

            <div className="bg-black/60 border border-[#222] rounded-xl p-4">

              <p className="text-sm text-gray-500 mb-2">
                Repositorio original
              </p>

              <a
                href="https://github.com/itsnotvii/mercari-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition break-all"
              >
                <span>
                  github.com/itsnotvii/mercari-clone
                </span>

                <ExternalLink
                  size={16}
                  className="shrink-0"
                />
              </a>

            </div>

          </section>

          {/* LICENCIA ORIGINAL */}

          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">

            <h2 className="text-lg font-semibold mb-3">
              Licencia del proyecto original
            </h2>

            <p className="text-sm text-gray-400 leading-6">
              Durante la revisión del repositorio original no se encontró
              un archivo{" "}
              <code className="text-gray-300">
                LICENSE
              </code>{" "}
              independiente en la raíz del repositorio.
            </p>

            <p className="text-sm text-gray-400 leading-6 mt-3">
              Sin embargo, el README del proyecto original contiene una
              sección denominada{" "}
              <strong className="text-white">
                License
              </strong>{" "}
              en la que se declara el uso de la{" "}
              <strong className="text-white">
                licencia MIT
              </strong>
              .
            </p>

            <p className="text-sm text-gray-400 leading-6 mt-3">
              Por transparencia, EMPREespacio mantiene esta referencia
              y atribución al proyecto original.
            </p>

          </section>

          {/* MODIFICACIONES */}

          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">

            <h2 className="text-lg font-semibold mb-3">
              Adaptación de EMPREespacio
            </h2>

            <p className="text-sm text-gray-400 leading-6 mb-4">
              El proyecto original fue modificado y adaptado
              sustancialmente para crear EMPREespacio.
            </p>

            <p className="text-sm text-gray-400 leading-6 mb-4">
              Entre las modificaciones y desarrollos realizados se
              encuentran:
            </p>

            <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">

              <li>
                Nuevo propósito orientado a emprendimientos locales.
              </li>

              <li>
                Rediseño de la interfaz y experiencia de usuario.
              </li>

              <li>
                Perfiles públicos de emprendimientos.
              </li>

              <li>
                Sistema de publicaciones.
              </li>

              <li>
                Sistema de favoritos para emprendimientos.
              </li>

              <li>
                Vidriera de emprendimientos.
              </li>

              <li>
                Búsqueda y filtros.
              </li>

              <li>
                Sistema de reportes.
              </li>

              <li>
                Administración y roles.
              </li>

              <li>
                Banners administrables.
              </li>

              <li>
                Adaptaciones de la base de datos y seguridad.
              </li>

              <li>
                Nuevos componentes y funcionalidades desarrollados
                específicamente para EMPREespacio.
              </li>

            </ul>

          </section>

          {/* AUTOR */}

          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">

            <h2 className="text-lg font-semibold mb-3">
              Desarrollo de EMPREespacio
            </h2>

            <p className="text-sm text-gray-400 leading-6">
              EMPREespacio es un proyecto independiente desarrollado
              y adaptado por{" "}
              <strong className="text-white">
                Gastón Ezequiel Mansilla
              </strong>
              .
            </p>

          </section>

          {/* TECNOLOGÍAS */}

          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">

            <h2 className="text-lg font-semibold mb-3">
              Tecnologías utilizadas
            </h2>

            <p className="text-sm text-gray-400 leading-6">
              La aplicación utiliza tecnologías y librerías de terceros,
              incluyendo Next.js, React, TypeScript, Tailwind CSS,
              Lucide React y Supabase.
            </p>

            <p className="text-sm text-gray-400 leading-6 mt-3">
              Cada tecnología, librería o servicio de terceros mantiene
              sus propias licencias y condiciones de uso.
            </p>

          </section>

          {/* TRANSPARENCIA */}

          <section className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">

            <h2 className="text-lg font-semibold mb-3">
              Transparencia
            </h2>

            <p className="text-sm text-gray-400 leading-6">
              Esta sección existe para dejar constancia del origen del
              código base utilizado durante el desarrollo de
              EMPREespacio y reconocer el trabajo del proyecto
              original.
            </p>

            <p className="text-sm text-gray-400 leading-6 mt-3">
              EMPREespacio no pretende atribuirse la autoría del código
              originalmente desarrollado para Mercari Clone.
            </p>

            <p className="text-sm text-gray-500 leading-6 mt-3">
              La referencia a la licencia MIT corresponde al proyecto
              original y no implica que todo el código, diseño,
              contenido, branding o materiales desarrollados
              específicamente para EMPREespacio se encuentren bajo
              dicha licencia.
            </p>

          </section>

          {/* ARCHIVO LICENSE */}

          <section className="text-center pt-2 pb-4">

            <p className="text-xs text-gray-600 leading-5">
              La información completa de atribución y licencia se encuentra
              disponible en el archivo{" "}
              <code className="text-gray-500">
                LICENSE
              </code>{" "}
              incluido en el repositorio del proyecto.
            </p>

          </section>

        </div>

      </main>

    </div>
  );
}