# Instrucciones de trabajo — RestoDev

Estas instrucciones son obligatorias.

## Procedimiento obligatorio

1. **Leer las reglas:** revisar los documentos de `docs/` y sus subdirectorios relacionados con la tarea.
2. **Analizar el proyecto:** inspeccionar el código, las ramas, las dependencias y los cambios existentes para determinar el estado real. No utilizar `PROGRESO.md` como referencia.
3. **Planificar:** identificar qué falta, qué archivos deben modificarse y cómo cumplir las reglas documentadas.
4. **Informar:** explicar al usuario los cambios previstos y esperar su aprobación antes de ejecutarlos.
5. **Crear una rama:** seguir `docs/Git_workflow.md`. Nunca modificar directamente `main` ni `develop`.
6. **Implementar:** respetar el stack, la arquitectura, las convenciones y los contratos documentados.
7. **Verificar:** ejecutar `pnpm check:full` y las pruebas correspondientes. Corregir los errores detectados.
8. **Entregar:** resumir los cambios realizados, los resultados de las verificaciones y los pendientes. Abrir un PR hacia `develop` sin fusionarlo automáticamente.

## Reglas generales

- `docs/` es la fuente de referencia para las reglas del proyecto.
- El código y la configuración actual del repositorio determinan qué está implementado.
- No duplicar documentación ni introducir tecnologías que contradigan las reglas.
- Si existen contradicciones o decisiones sin definir, consultar antes de implementar.
- Consultar la documentación de la versión instalada antes de modificar código Next.js.
- No exponer credenciales ni modificar producción sin autorización.
- No afirmar que algo funciona sin verificarlo.
