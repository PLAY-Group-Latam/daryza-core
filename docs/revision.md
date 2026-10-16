vuelve a revisar y modulo por modulo porfa admin y store integracion todo porfavor, end to end
Lineamientos para la revisión integral del proyecto
Objetivo
Realizar una revisión integral del proyecto para identificar inconsistencias, errores, omisiones y posibles riesgos, considerando que el desarrollo ya se encuentra implementado.
Alcance de la revisión

- Revisar la estructura general del proyecto y su arquitectura.
- Contrastar los requerimientos, funcionalidades y reglas de negocio existentes con la implementación.
- Identificar errores funcionales, inconsistencias de datos y comportamientos inesperados.
- Revisar validaciones, manejo de errores, permisos y controles de acceso.
- Verificar integraciones con servicios externos, APIs y otros sistemas.
- Revisar configuraciones relevantes para los entornos de desarrollo, pruebas y producción.
- Evaluar aspectos básicos de seguridad, rendimiento y mantenibilidad.
- Identificar funcionalidades incompletas, duplicadas o que no se comporten de acuerdo con lo esperado.
  Criterios de revisión

1. No asumir que la implementación es correcta solo porque ya existe. Validar el comportamiento real y contrastarlo con los requerimientos disponibles.
2. No inventar requerimientos ni reglas de negocio. Si falta información para validar un comportamiento, registrarlo como pendiente de confirmación.
3. Evitar cambios innecesarios. En esta etapa, priorizar el análisis y el registro de hallazgos antes de modificar código o configuraciones.
4. Mantener la trazabilidad. Cada hallazgo debe indicar dónde ocurre, cómo reproducirlo y qué evidencia lo respalda, cuando sea posible.
5. Diferenciar hechos de hipótesis. Señalar claramente los problemas confirmados, los riesgos potenciales y los puntos que requieren validación.
6. Evaluar el impacto. Priorizar los hallazgos según su gravedad y efecto en el funcionamiento del sistema.
   Registro de hallazgos
   Para cada hallazgo, documentar:

- Título: descripción breve y concreta.
- Ubicación: módulo, archivo, endpoint o funcionalidad involucrada.
- Descripción: qué sucede y cuál es la inconsistencia detectada.
- Comportamiento esperado: únicamente cuando esté respaldado por los requerimientos o reglas conocidas.
- Pasos para reproducir: instrucciones para verificar el problema, si aplica.
- Evidencia: mensajes de error, resultados, capturas o fragmentos relevantes.
- Impacto: consecuencias para el usuario, los datos o la operación.
- Prioridad: crítica, alta, media o baja.
- Estado: confirmado, por validar, pendiente de definición o resuelto.
- Recomendación: propuesta de corrección o siguiente paso.
  Entregables esperados

1. Resumen general del estado del proyecto.
2. Lista priorizada de inconsistencias y defectos identificados.
3. Riesgos técnicos y puntos pendientes de confirmación.
4. Recomendaciones de corrección, sin aplicar cambios no autorizados.
5. Checklist de validaciones realizadas y áreas que no pudieron revisarse.
   Forma de trabajo

- Revisar el proyecto por módulos y funcionalidades.
- Seguir los flujos principales de principio a fin.
- Comprobar las relaciones entre frontend, backend, base de datos, APIs e integraciones.
- Validar los casos habituales y, cuando corresponda, los casos límite.
- Registrar los hallazgos con evidencia y evitar reportar como error aquello que no pueda sustentarse.
- Al finalizar el análisis, presentar los resultados y proponer un orden de atención antes de ejecutar cambios.
  Restricción importante
  Esta revisión busca detectar y documentar inconsistencias en la implementación existente. No se deben cambiar reglas de negocio, eliminar funcionalidades ni realizar refactorizaciones amplias sin justificación y autorización previa.
