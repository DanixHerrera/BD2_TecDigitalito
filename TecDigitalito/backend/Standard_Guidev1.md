## Estructura de Carpetas
La estructura estándar de un backend es:
```
proyecto-backend/
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── tests/
│   └── index.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Responsabilidad de Cada Carpeta

## /models
**¿Qué va aquí?**
Archivos que definen la estructura de datos. Cada archivo representa una entidad de tu sistema (Usuario, Producto, Pedido). Aquí defines qué campos tiene cada entidad, qué tipos de datos son, qué restricciones tienen.

**¿Por qué va separado?**
Si todos tus datos estuvieran en el controlador, cuando necesites reutilizar la misma estructura en múltiples endpoints, tendrías que copiar y pegar. Además, si la estructura cambia, tendrías que buscar en todos los controladores dónde se define.

**Responsabilidades específicas:**
- Definir la estructura de datos
- Establecer validaciones de datos
- Crear índices para búsquedas rápidas
- Definir relaciones entre entidades
- Especificar valores por defecto

**¿Qué NO va aquí?**
No va lógica HTTP, no van llamadas a APIs externas, no va encriptación de datos, no va envío de emails.

## /routes
**¿Qué va aquí?**
La definición de todos los endpoints de tu API. Aquí especificas qué URL hace qué, qué método HTTP (GET, POST, PUT, DELETE), qué validaciones aplican, qué autenticación es necesaria.

**¿Por qué va separado?**
Necesitas un lugar centralizado donde ver de un vistazo todos los endpoints disponibles de tu API. Es la documentación viva de qué puedes hacer con tu backend.

**Responsabilidades específicas:**
- Mapear URLs a controladores
- Especificar método HTTP
- Encadenar middlewares en orden
- Documentar qué requiere cada ruta

**¿Qué NO va aquí?**
No va lógica de negocio, no van consultas a base de datos, no va transformación de datos compleja.

## /controllers
**¿Qué va aquí?**
La lógica de cómo responder a cada petición HTTP. Aquí obtienes los datos de la petición, los procesas, los guardas o recuperas de la base de datos, y devuelves una respuesta.

**¿Por qué va separado?**
Los controladores orquestan el flujo. Si la lógica estuviera en las rutas, cada ruta tendría código muy largo. Si estuviera en los servicios, los servicios estarían mezclados con código HTTP.

**Responsabilidades específicas:**
- Obtener datos del request
- Llamar a servicios
- Manejar respuestas
- Gestionar códigos de estado HTTP
- Capturar errores

**¿Qué NO va aquí?**
No va lógica de negocio compleja, no va validación de datos (eso es middleware), no va encriptación (eso es utils), no va envío de emails (eso es services).

## /services
**¿Qué va aquí?**
Lógica de negocio que puede usarse desde múltiples controladores. Si una operación se repite en varios endpoints, va en services.

**¿Por qué va separado?**
Evita duplicación. Si necesitas crear un usuario con validaciones especiales en múltiples endpoints, lo defines una sola vez en un servicio y lo reutilizas.

**Responsabilidades específicas:**
- Lógica de negocio compleja
- Operaciones que afectan múltiples modelos
- Integraciones externas (emails, SMS, APIs)
- Encriptación y transformación de datos
- Cálculos complejos

**¿Qué NO va aquí?**
No va código HTTP, no van respuestas JSON, no va control de errores HTTP.

## /middleware
**¿Qué va aquí?**
Funciones que se ejecutan antes de llegar al controlador. Procesan la petición o la rechazan si no cumple ciertos criterios.

**¿Por qué va separado?**
Muchas rutas necesitan las mismas validaciones (autenticación, formato de datos). En lugar de repetir el código en cada ruta, lo escribes una sola vez como middleware.

**Responsabilidades específicas:**
- Autenticación (verificar si el usuario existe y está logueado)
- Validación de datos (verificar que el formato sea correcto)
- Autorización (verificar si el usuario tiene permisos)
- Logging (registrar cada petición)
- Compresión de respuestas
- CORS (control de acceso desde otros dominios)

**¿Qué NO va aquí?**
No va lógica de negocio, no va transformación de datos, no va interacción con la base de datos.

## /database
**¿Qué va aquí?**
Toda la configuración y funciones para conectar con la base de datos. Aquí estableces la conexión, defines cómo se conecta y desconecta.

**¿Por qué va separado?**
La conexión es algo que se hace una sola vez al iniciar la aplicación. Necesita estar centralizado. Si la conexión fallara, necesitas saber exactamente dónde está el problema.

**Responsabilidades específicas:**
- Conectar a la base de datos
- Desconectar limpiamente
- Configurar opciones de conexión
- Manejar errores de conexión

**¿Qué NO va aquí?**
No van consultas específicas (eso va en models), no va lógica de negocio.

## /config
**¿Qué va aquí?**
Variables y configuraciones de la aplicación. Puertos, URLs, claves secretas, constantes que cambian según el entorno (desarrollo, producción).

**¿Por qué va separado?**
Necesitas un lugar donde centralizar toda la configuración. Si tu puerto está en el index.js, tu URL de base de datos en un archivo, y tus claves secretas en otro, es un desastre. Además, necesitas que sea fácil cambiar entre desarrollo y producción.

**Responsabilidades específicas:**
- Guardar puerto del servidor
- URL de base de datos
- Variables de entorno
- Constantes globales
- Configuración por entorno

**¿Qué NO va aquí?**
No van funciones, no va lógica.

## /constants
**¿Qué va aquí?**
Valores que se repiten en el código. Mensajes de error estándar, códigos de respuesta, roles de usuario, estados.

**¿Por qué va separado?**
Si repites el mismo mensaje de error en 10 lugares y necesitas cambiar ese mensaje, tienes que buscarlo en 10 archivos. Si lo defines en una sola carpeta de constantes, cambias una línea.

**Responsabilidades específicas:**
- Mensajes de error estándar
- Códigos de respuesta
- Estados posibles
- Roles de usuario
- Cualquier valor que se repita

**¿Qué NO va aquí?**
No van funciones.

## /utils
**¿Qué va aquí?**
Funciones auxiliares genéricas que se reutilizan en varios lugares pero no son específicas del negocio.

**¿Por qué va separado?**
Una función como "validar email" o "generar código aleatorio" puede usarse en múltiples servicios o controladores. No quieres duplicarla.

**Responsabilidades específicas:**
- Validadores genéricos
- Generadores de tokens
- Transformadores de datos
- Funciones matemáticas
- Funciones de formato

**¿Qué NO va aquí?**
No va lógica de negocio específica, no van servicios.

## /tests
**¿Qué va aquí?**
Archivos que verifican que tu código funciona correctamente. Pruebas unitarias, pruebas de integración, pruebas de endpoints.

**¿Por qué va separado?**
Los tests no son parte del código que se ejecuta en producción. Deben estar separados. Además, necesitas poder ejecutarlos independientemente.

**Responsabilidades específicas:**
- Verificar que funciones funcionan
- Verificar que endpoints responden correctamente
- Verificar que la base de datos guarda datos bien
- Detectar errores antes de producción

## .env
**¿Qué va aquí?**
Variables privadas que no deben publicarse. Contraseñas, claves secretas, URLs internas, tokens.

**¿Por qué existe?**
Nunca debes subir secretos a un repositorio Git. El archivo .env es local y privado. Diferentes máquinas pueden tener diferentes valores en .env.

**¿Qué va en .env.example?**
Un archivo .env.example muestra qué variables son necesarias pero sin valores reales. Se sube a Git para que otros sepan qué configuración necesitan.

## index.js
**¿Qué va aquí?**
El punto de entrada principal de la aplicación. Aquí sucede la inicialización de todo: cargar variables de entorno, importar dependencias, crear la aplicación, conectar a la base de datos, cargar todas las rutas, iniciar el servidor.

**¿Por qué existe?**
Necesitas un único punto donde todo comienza. Si no tuvieras esto, tendrías que acordarte de ejecutar cosas en cierto orden en cada máquina diferente.