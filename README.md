# EMPREespacio

**EMPREespacio** es una plataforma web local orientada a conectar emprendimientos de la ciudad de **Rafaela, Santa Fe**, con personas que buscan productos y servicios ofrecidos por emprendedores locales.

La aplicación permite que cada emprendedor cree y administre su propio espacio dentro de la plataforma, publique productos o servicios y proporcione sus medios de contacto para que los usuarios puedan comunicarse directamente.

El proyecto está pensado como una plataforma gratuita para los usuarios, con posibilidad de incorporar publicidad y espacios promocionales para emprendimientos y comercios locales.

> **EMPREespacio fue desarrollado anteriormente bajo el nombre AppEmprendedores.**

---

## Características principales

### Emprendimientos

Cada usuario registrado puede crear y administrar un emprendimiento.

El perfil del emprendimiento puede incluir:

* Nombre del emprendimiento.
* Logo o imagen de perfil.
* Imagen de portada.
* Descripción.
* Tipo de emprendimiento:

  * Producto.
  * Servicio.
* Categorías.
* WhatsApp.
* Instagram.
* Facebook opcional.
* Horarios de atención.
* Indicación de local físico.
* Dirección pública opcional.
* Información sobre envíos.

La plataforma está orientada a **Rafaela, Santa Fe**, y no utiliza un sistema de barrios.

### Publicaciones

Cada emprendimiento puede tener hasta **5 publicaciones activas**.

Las publicaciones pueden utilizarse para mostrar productos o servicios y pueden incluir imágenes e información descriptiva.

Las publicaciones se muestran principalmente dentro del emprendimiento correspondiente y en los resultados de búsqueda.

Actualmente la aplicación no utiliza un sistema de carrito ni pagos internos.

### Vidriera

Cada emprendimiento puede mostrar hasta **3 imágenes destacadas** en una sección de vidriera.

Esta sección permite presentar visualmente el trabajo, productos, instalaciones o servicios del emprendimiento.

### Búsqueda y filtros

Los usuarios pueden buscar emprendimientos y publicaciones y utilizar filtros relacionados con categorías y otros criterios disponibles en la aplicación.

### Favoritos

Los usuarios registrados pueden guardar **emprendimientos** como favoritos.

Los favoritos corresponden a los emprendimientos y no a publicaciones individuales.

### Página pública del emprendimiento

Cada emprendimiento dispone de una página pública donde los visitantes pueden consultar:

* Información del emprendimiento.
* Datos de contacto.
* Redes sociales.
* Horarios.
* Información sobre local físico.
* Vidriera.
* Publicaciones.

El contacto entre usuarios y emprendedores se realiza mediante los medios de contacto proporcionados por el emprendimiento, como WhatsApp o Instagram.

### Reportes

Los usuarios autenticados pueden reportar emprendimientos cuando consideren que existe contenido problemático, información falsa, posible estafa u otras situaciones contempladas por el sistema.

Los reportes pueden ser revisados desde el área administrativa.

### Administración

La aplicación cuenta con funcionalidades administrativas para gestionar determinados contenidos y recursos de la plataforma.

---

## Tecnologías utilizadas

El proyecto utiliza principalmente:

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Lucide React**
* **Supabase**

  * PostgreSQL
  * Authentication
  * Storage
  * Row Level Security (RLS)
* **Vercel** para el despliegue de la aplicación.

---

## Estructura general

La aplicación está desarrollada utilizando la estructura de aplicaciones de Next.js.

Entre las principales áreas se encuentran:

```text
app/
├── admin/
├── auth/
├── account/
├── profile/
├── sell/
├── store/
└── ...
```

La estructura puede cambiar durante el desarrollo a medida que se incorporen nuevas funcionalidades.

---

## Base de datos

La aplicación utiliza **Supabase** como backend.

Entre las entidades utilizadas por el proyecto se encuentran, entre otras:

* `profiles`
* `listings`
* `favorites`
* `business_showcase`
* `reports`
* `home_banners`

También se utilizan funciones, políticas RLS y almacenamiento de archivos mediante Supabase Storage.

La seguridad de los datos se gestiona mediante autenticación y políticas de acceso.

---

## Desarrollo local

Para ejecutar el proyecto localmente se necesita tener instalado Node.js.

Instalar las dependencias:

```bash
npm install
```

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Luego abrir:

```text
http://localhost:3000
```

Las variables de entorno necesarias para Supabase deben configurarse en el archivo correspondiente del entorno local.

---

## Modelo actual de la aplicación

EMPREespacio está orientada a un modelo de **directorio y marketplace local**.

Actualmente **no incluye**:

* Pagos internos.
* Carrito de compras.
* Checkout.
* Sistema propio de envíos.
* Mensajería interna entre compradores y vendedores.
* Sistema de ofertas internas.

El contacto y las operaciones comerciales se realizan directamente entre el usuario y el emprendimiento mediante los medios de contacto publicados.

---

## Créditos y licencia

### Código base

EMPREespacio comenzó a desarrollarse utilizando como base un proyecto open source denominado **Mercari Clone**, publicado originalmente por el usuario de GitHub **itsnotvii**, identificado como **Thomas Johnson**.

Repositorio original:

https://github.com/itsnotvii/mercari-clone

Durante la revisión del repositorio original no se encontró un archivo `LICENSE` independiente en la raíz del repositorio.

Sin embargo, el `README.md` del proyecto original contiene una sección denominada **License** en la que se declara el uso de la **licencia MIT**.

Por transparencia, EMPREespacio mantiene esta atribución al proyecto original.

EMPREespacio ha sido modificado y adaptado sustancialmente respecto de la aplicación original, incluyendo cambios en:

* Propósito de la aplicación.
* Diseño visual.
* Estructura de navegación.
* Modelo de emprendimientos.
* Sistema de publicaciones.
* Sistema de favoritos.
* Vidriera de emprendimientos.
* Búsqueda y filtros.
* Sistema de reportes.
* Administración.
* Integración y estructura de datos.
* Funcionalidades específicas orientadas a emprendimientos de Rafaela.

La referencia al proyecto original no implica que EMPREespacio sea el mismo proyecto ni que sus funcionalidades actuales correspondan al proyecto original.

Para más información sobre la atribución y la licencia del código base original, consultar el archivo `LICENSE` incluido en este repositorio.

### Autor de EMPREespacio

**Gastón Ezequiel Mansilla**

EMPREespacio es un proyecto independiente desarrollado y adaptado con el objetivo de crear una plataforma local para emprendimientos.

El proyecto fue desarrollado inicialmente bajo el nombre **AppEmprendedores** y posteriormente adoptó la identidad **EMPREespacio**.

---

## Estado del proyecto

EMPREespacio se encuentra en etapa de desarrollo y preparación para su lanzamiento.

Las funcionalidades pueden modificarse, ampliarse o reemplazarse durante el desarrollo del proyecto.

---

## Contacto

Para consultas relacionadas con el proyecto, su desarrollo o futuras colaboraciones, utilizar los medios de contacto definidos por el responsable del proyecto.
