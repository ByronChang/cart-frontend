
# Tienda Online

## Información del Proyecto

Esta es una aplicación de tienda online desarrollada con tecnologías modernas que permite a los usuarios explorar productos, agregar artículos al carrito y completar el proceso de compra.

## Tecnologías Utilizadas

Este proyecto está construido con:

- **Vite**: Para un desarrollo rápido y optimizado
- **TypeScript**: Para añadir tipado estático
- **React**: Como biblioteca principal para UI
- **Tailwind CSS**: Para estilos y diseño responsive
- **shadcn-ui**: Para componentes de UI consistentes
- **React Query**: Para gestión de estado y peticiones
- **Redux Toolkit**: Para la gestión global del estado
- **React Router**: Para la navegación entre páginas

## Características

- Catálogo de productos con detalles
- Carrito de compras
- Proceso de pago
- Gestión de usuarios (registro, inicio de sesión)
- Historial y detalles de pedidos
- Diseño responsive

## Desarrollo Local

Para ejecutar este proyecto en tu entorno local:

```sh
# Paso 1: Clona el repositorio
git clone <URL_DEL_REPOSITORIO>

# Paso 2: Navega al directorio del proyecto
cd tienda-online

# Paso 3: Instala las dependencias
npm install

# Paso 4: Inicia el servidor de desarrollo
npm run dev
```

## Configuración con Docker

El proyecto está configurado con Docker para facilitar su despliegue:

```sh
# Para construir y ejecutar los contenedores
docker-compose up --build

# Para detener los contenedores
docker-compose down
```

### Variables de Entorno

Las principales variables de entorno son:

- `VITE_API_URL`: URL base del API (por defecto: http://localhost:8080/api)

## Despliegue

Para desplegar la aplicación en producción, puedes usar la configuración de Docker incluida o seguir estos pasos para un despliegue manual:

```sh
# Genera la versión de producción
npm run build

# Los archivos generados estarán en la carpeta 'dist'
```

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── context/        # Contextos de React 
├── hooks/          # Hooks personalizados
├── lib/            # Utilidades y helpers
├── pages/          # Páginas de la aplicación
├── store/          # Estado global (Redux)
├── types/          # Definiciones de tipos
└── config/         # Configuración de la aplicación
```

## Licencia

[MIT](LICENSE)
