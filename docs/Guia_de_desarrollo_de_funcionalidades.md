# Guía para desarrollar una funcionalidad

Usá esta guía desde que aparece una necesidad hasta que el cambio queda listo para integrar. La
Historia de Usuario explica el valor para la persona usuaria; el modelo de datos y el contrato
convierten esa necesidad en reglas verificables e interfaces para el equipo.

## 1. Aclarar la necesidad

Antes de programar, identificá:

- Quién necesita la funcionalidad y qué quiere lograr.
- Qué queda dentro y fuera del alcance.
- Qué datos y estados participan.
- Qué permisos existen hoy y cuáles son una decisión futura.
- Qué casos de éxito, error y borde hay que cubrir.

No inventes reglas de negocio para llenar vacíos. Consultá las decisiones pendientes y registrá lo
que todavía no está definido como pendiente, sin presentarlo como implementado.

## 2. Escribir la Historia de Usuario

Guardá la HU en `docs/historias_de_usuario/<modulo>/HU_<verbo>_<entidad>.md`.

Usá una frase breve:

> Como **[tipo de usuario]**, quiero **[acción]**, para **[beneficio]**.

Después definí criterios de aceptación observables, preferentemente con **Dado / Cuando / Entonces**.
Incluí, cuando corresponda:

- Resultado esperado y datos que se muestran.
- Campos requeridos, opcionales y defaults.
- Límites, formatos y normalización que el negocio necesita.
- Duplicados, concurrencia, estados previos y relaciones.
- Qué puede hacer una persona autenticada y qué requiere un permiso adicional.
- Qué ocurre ante errores y qué queda explícitamente fuera de alcance.

Los criterios describen el comportamiento del producto; no necesitan fijar nombres de archivos,
clases ni mensajes internos del código.

## 3. Diseñar los datos y la base de datos

Antes de crear una migración, revisá el modelo de `docs/database/model/` y documentá las reglas
persistentes:

- Columnas, tipos, nulabilidad, defaults y relaciones.
- Unicidad y su alcance (por ejemplo, si incluye registros dados de baja).
- `CHECK`, claves foráneas e índices necesarios.
- Baja lógica, trazabilidad y comportamiento ante concurrencia, si aplican.
- RLS para el acceso acordado y `GRANT` mínimo para las operaciones necesarias.

La base debe proteger las invariantes que tienen que cumplirse sin importar desde dónde se escriban
los datos. Zod complementa esas protecciones y permite responder antes con errores entendibles; no
reemplaza las restricciones de la base.

Implementá el esquema mediante migraciones en el proyecto de pruebas, nunca directamente en
producción. Cada migración que crea una tabla debe incluir RLS, políticas y `GRANT`. Si cambia el
esquema, regenerá `src/core/types/database.types.ts` en el mismo cambio. Ver
[`docs/database/supabase-cli.md`](./database/supabase-cli.md).

## 4. Escribir el contrato de la operación

Antes del código, completá una ficha desde
[`docs/contracts/Contract_template.md`](./contracts/Contract_template.md) y agregala al resumen del módulo.
Consultá también [`docs/Contratos_de_actions.md`](./Contratos_de_actions.md).

El contrato es el acuerdo de integración entre front y back, aunque la operación sea una Server
Action y todavía no haya una API OpenAPI/Swagger. Especificá:

- Archivos y función exportada.
- Permiso **actual** y permisos **planificados**, claramente separados.
- Cada campo de entrada, tipo, reglas, requerido/default y ejemplo.
- Respuesta exitosa completa y errores posibles con sus `ErrorCode`.
- Efectos secundarios y flujo de la operación.
- Si existe un Route Handler equivalente. Una API futura debe etiquetarse como planificada hasta
  que el endpoint exista.

El input documentado debe coincidir con Zod. A su vez, Zod y la base deben coincidir en las reglas
de datos que se comprometieron en la HU. Si se descubre una diferencia, corregí el contrato y las
implementaciones relacionadas antes de cerrar el cambio.

## 5. Implementar por capas

Una vez acordados HU, modelo y contrato:

1. Crear la migración y las protecciones de base de datos.
2. Crear o actualizar el schema Zod y sus tipos.
3. Implementar el Servicio con la lógica de negocio y traducción de errores de Supabase.
4. Implementar la Action: comprobar la sesión, validar el `unknown` con Zod, llamar al Servicio y
   devolver `ActionResult<T>`.
5. Si aplica, crear el Route Handler reutilizando el Servicio y traduciendo errores a HTTP.
6. Implementar el formulario o vista según el contrato; la validación del cliente es solo una ayuda
   de experiencia y nunca una barrera de seguridad.

Las Server Actions y los Route Handlers son entradas públicas: verificá autorización en cada
operación; no dependas de que el proxy o la interfaz hayan bloqueado la navegación.

## 6. Verificar los criterios

Por cada criterio de aceptación, anotá cómo se verifica y el resultado. Incluí:

- Caso exitoso y defaults.
- Valores inválidos y límites.
- Duplicados y conflictos concurrentes cuando haya unicidad.
- Sesión ausente y permisos insuficientes, si aplican.
- Integridad/RLS de la base; considera también escrituras que no pasan por la Action cuando la tabla
  está expuesta a la Data API.
- Efectos secundarios y estado de la interfaz después del éxito o error.

Ejecutá las pruebas correspondientes y `pnpm check:full`. No marques un caso como probado sin haberlo
ejecutado.

## 7. Documentar y entregar

- Actualizá contrato, modelo de datos, resumen del módulo y esta guía/índices si cambió la estructura.
- Separá en la documentación lo implementado de lo pendiente.
- Creá la rama de trabajo desde `develop`, verificá los cambios y abrí el PR hacia `develop` según
  [`docs/Git_workflow.md`](./Git_workflow.md).

## Orden resumido

**Necesidad → HU y criterios → modelo y reglas de BD → contrato → migración y código → pruebas →
PR.**

Es un orden de trabajo, no una cascada rígida: si el contrato o el modelo revelan una ambigüedad,
volvé a aclarar los criterios antes de seguir.
