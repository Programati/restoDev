# HU-CAT-001 — Crear categoría

## Historia

Como **usuario con una sesión activa**, quiero **crear una categoría**, para **organizar los
productos del menú**.

## Criterios de aceptación

1. Dada una persona sin sesión, cuando intenta crear una categoría mediante la Action, la operación
   se rechaza con `UNAUTHORIZED`.
2. Dada una persona autenticada, cuando envía un nombre válido, se crea la categoría y se devuelve
   la categoría creada.
3. El nombre se recorta antes de guardarse, es obligatorio y debe tener entre 2 y 80 caracteres.
4. No se puede repetir un nombre, sin distinguir mayúsculas y minúsculas, incluso si la categoría
   existente está dada de baja. Se informa `CONFLICT`.
5. El ícono es opcional; si se envía, se recorta y debe tener entre 1 y 50 caracteres. Si se omite,
   se guarda como `null`.
6. El orden es un entero mayor o igual a cero; si se omite, su valor es `0`.
7. El estado activo es booleano y, si se omite, su valor es `true`.
8. El `slug` no se recibe del formulario: se genera desde el nombre en minúsculas, sin acentos y con
   palabras separadas por guiones. Si ya existe, se resuelve con un sufijo numérico (`-2`, `-3`,
   ...), incluso si el slug ocupado pertenece a una categoría dada de baja.
9. La categoría se crea con `deleted_at = null` y `updated_by` igual al usuario de la sesión.
10. Los datos inválidos se rechazan con `VALIDATION_ERROR` y errores asociados a los campos que
    fallaron.

## Alcance actual y pendientes

- Actualmente, cualquier usuario autenticado puede ejecutar la operación; todavía no se verifica
  un rol.
- Exigir el rol `admin` queda pendiente hasta que se defina e implemente el modelo de roles.
- La Server Action está implementada. El endpoint `POST /api/categories` es un objetivo futuro y
  todavía no existe.
- El registro en `audit_logs` queda pendiente hasta implementar el mecanismo de auditoría.

## Referencias

- Contrato: [`createCategory`](../../contracts/categories/createCategory.md).
- Modelo de datos: [`categories`](../../database/model/categories.md).
