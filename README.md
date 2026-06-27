# SistemaBibliotecaBENP — migrado a Spring Boot + JPA

Migración del proyecto original (Servlets + JDBC puro, NetBeans) a **Spring Boot 3 + Spring Data JPA**,
manteniendo el frontend **React (JSX vía Babel standalone)** intacto y agregando un **panel de
administración server-side con Thymeleaf** usando el patrón `_layout.html` + fragments.

## 1. Qué cambió y qué se mantuvo

| Antes (NetBeans/Servlets) | Ahora (Spring Boot) |
|---|---|
| `web.xml`, `@WebServlet` | Auto-configuración Spring Boot, `@RestController` |
| DAOs con JDBC manual (`ConexionDB`, `LibroDAO`, etc.) | `JpaRepository` (Spring Data JPA) + `*Service` |
| Gson para serializar manualmente | Jackson automático (Spring lo trae integrado) |
| `persistence.xml` vacío (JPA sin uso real) | `application.properties` + Hibernate real |
| Vistas: SPA React servida por `index.jsp` | Igual, pero servida como recurso estático (`index.html`) |
| Sin panel admin server-side | **Nuevo**: `/admin/**` con Thymeleaf + `_layout.html` |

**Los endpoints `/api/**` que consume React se mantienen con el mismo contrato JSON** (mismas rutas,
mismos verbos HTTP, mismas claves en el JSON), por lo que `App.jsx`, `Auth.jsx` y `AdminPanel.jsx`
**no necesitaron cambios**.

## 2. Estructura del proyecto

```
src/main/java/com/benp/
├── BibliotecaApplication.java     # clase main
├── modelo/                        # Entidades JPA (antes: modelo/*.java planos)
├── repositorio/                   # Spring Data JPA (antes: dao/*.java con JDBC)
├── servicio/                      # Lógica de negocio (antes mezclada en los DAOs/Servlets)
├── controlador/                   # @RestController -> /api/** (antes: @WebServlet)
├── web/                           # @Controller MVC -> /admin/** (Thymeleaf, NUEVO)
├── dto/                           # Clases para los JSON de entrada/salida
└── excepcion/                     # Excepciones de negocio (p.ej. usuario duplicado)

src/main/resources/
├── application.properties
├── templates/
│   ├── _layout.html               # Layout base del panel admin (sidebar, etc.)
│   └── admin/
│       ├── dashboard.html
│       ├── libros.html
│       ├── usuarios.html
│       ├── prestamos.html
│       └── multas.html
└── static/
    ├── index.html                 # Antes index.jsp -> ahora estático
    └── js/{App,Auth,AdminPanel}.jsx   # React sin cambios
```

## 3. Mapeo de endpoints REST (sin cambios para React)

| Endpoint | Verbo | Antes (Servlet) | Ahora |
|---|---|---|---|
| `/api/libros` | GET | `LibroServlet.doGet` | `LibroRestController.listar` |
| `/api/libros` | POST | `LibroServlet.doPost` | `LibroRestController.registrar` |
| `/api/libros` | PUT | `LibroServlet.doPut` | `LibroRestController.actualizar` |
| `/api/login` | POST | `LoginServlet` | `LoginRestController.login` |
| `/api/usuarios` | POST | `UsuarioServlet` | `UsuarioRestController.registrar` |
| `/api/prestamos`, `/api/prestamos/listar` | GET | `PrestamoServlet.doGet` | `PrestamoRestController.listar` |
| `/api/prestamos` | POST | `PrestamoServlet.doPost` | `PrestamoRestController.reservar` |
| `/api/prestamos/estado` | POST | `PrestamoServlet.doPost` | `PrestamoRestController.actualizarEstado` |
| `/api/multas` | GET | `MultaServlet.doGet` | `MultaRestController.listar` |
| `/api/multas` | POST | `MultaServlet.doPost` | `MultaRestController.pagar` |

## 4. Panel admin (nuevo, Thymeleaf + `_layout`)

Disponible en `http://localhost:8080/admin`. Usa el patrón de **layout dialect**
(`nz.net.ultraq.thymeleaf:thymeleaf-layout-dialect`):

- `_layout.html` define la estructura común (sidebar + `layout:fragment="content"`).
- Cada página (`admin/dashboard.html`, `admin/libros.html`, ...) hace
  `layout:decorate="~{_layout}"` y solo rellena el fragment `content`.

Esto es **independiente del React** — sirve como vista administrativa server-side adicional
(útil si luego quieres dejar de depender de JavaScript en el navegador para el back-office).
Por ahora **no hay seguridad/login** en `/admin/**`; si lo vas a exponer, agrega Spring Security
con un filtro que valide sesión de `tipoUsuario = admin` (puedo ayudarte con eso si lo necesitas).

## 5. Base de datos

Se asume la **misma base MySQL `biblioteca`** ya usada por el proyecto original, con tablas
`libros`, `usuarios`, `prestamos`, `multas`. Las columnas mapeadas vía `@Column(name=...)`
respetan exactamente los nombres que ya usaban tus DAOs/Servlets (`imagen_url`, `tipo_usuario`,
`libro_id`, `titulo_libro`, `nombre_usuario`, `fecha_*`, y en `multas`: `usuario`, `libro`,
`fecha_creacion`).

`spring.jpa.hibernate.ddl-auto=update` hará que Hibernate cree o ajuste las tablas si faltan,
sin borrar datos existentes. Pásalo a `validate` cuando el esquema esté estable en producción.

⚠️ Nota: la tabla `multas` en el código original no tenía un DAO propio (`MultaServlet` usaba
SQL crudo) y el modelo `Multa.java` viejo tenía un campo `diasRetraso` que **nunca se usaba ni
persistía**. Se omitió en la nueva entidad `Multa` por consistencia con el comportamiento real;
si lo necesitas, puedo agregarlo de vuelta como columna nueva.

## 6. Cómo ejecutar

1. Edita `src/main/resources/application.properties` con tu usuario/clave de MySQL.
2. `mvn spring-boot:run` (o ejecuta `BibliotecaApplication` desde tu IDE).
3. Sitio React: `http://localhost:8080/`
4. Panel admin Thymeleaf: `http://localhost:8080/admin`

## 7. Dependencias clave agregadas en `pom.xml`

- `spring-boot-starter-web` — REST + servidor embebido
- `spring-boot-starter-data-jpa` — Spring Data JPA / Hibernate
- `spring-boot-starter-thymeleaf` — vistas del panel admin
- `nz.net.ultraq.thymeleaf:thymeleaf-layout-dialect` — patrón `_layout` + fragments
- `mysql-connector-j` — igual que antes
- `org.mindrot:jbcrypt` — igual que antes (hash de contraseñas)

## 8. Siguientes pasos sugeridos (opcionales)

- Agregar Spring Security para proteger `/admin/**` y los endpoints administrativos de `/api/**`.
- Mover las credenciales de MySQL a variables de entorno en lugar de `application.properties`.
- Agregar validaciones (`@NotBlank`, etc.) en los DTOs con `spring-boot-starter-validation`
  (ya está en el `pom.xml`, solo falta anotar los DTOs y usar `@Valid`).
