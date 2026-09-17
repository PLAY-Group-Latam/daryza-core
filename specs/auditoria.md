# SPEC — Auditoría, comprensión y corrección de Store & Core

## 1. Objetivo

Realizar una auditoría técnica del proyecto compuesto por **Core** y **Store**, con el objetivo de:

- Entender primero cómo está construido y cómo funciona actualmente el sistema.
- Identificar errores, inconsistencias, código pendiente o comportamientos que no correspondan con la lógica actual del proyecto.
- Corregir los problemas encontrados de forma segura.
- Mantener las reglas de negocio y flujos existentes.
- Evitar introducir funcionalidades, reglas o comportamientos nuevos que no hayan sido solicitados.

Este trabajo debe realizarse bajo un principio fundamental:

> **No cambiar la lógica de negocio existente. Primero entenderla, luego detectar dónde está mal implementada o incompleta y finalmente corregirla.**

No se busca rediseñar el sistema ni refactorizar por gusto. El objetivo es **estabilizar y corregir lo que ya existe**.

---

# 2. Principio principal: entender antes de modificar

Antes de realizar cualquier cambio, se debe estudiar el proyecto.

El análisis debe comenzar entendiendo:

- Arquitectura de Core.
- Arquitectura de Store.
- Responsabilidades de cada proyecto.
- Comunicación entre Core y Store.
- Modelos principales.
- Relaciones entre entidades.
- APIs.
- Flujos principales.
- Autenticación.
- Productos.
- Carrito.
- Checkout.
- Órdenes.
- Pagos.
- Importación.
- Exportación.
- Búsqueda.
- Stock.
- Precios.
- Promociones.
- Configuraciones importantes.

No modificar código durante esta primera etapa salvo que sea estrictamente necesario para poder ejecutar o inspeccionar el proyecto.

La prioridad inicial es obtener un **mapa real del sistema**, basado en el código existente y no en suposiciones.

---

# 3. Regla de no invención

Durante toda la auditoría:

### NO se debe:

- Inventar nuevas reglas de negocio.
- Crear funcionalidades que no existen.
- Cambiar flujos porque podrían “ser mejores”.
- Cambiar estructuras sin necesidad.
- Hacer refactors grandes sin relación con un problema detectado.
- Cambiar nombres o contratos solamente por preferencia personal.
- Eliminar funcionalidades existentes porque parezcan innecesarias.
- Introducir nuevas validaciones sin que exista una regla que las justifique.
- Modificar comportamiento funcional sin identificar primero el motivo.
- Crear nuevos pendientes basados únicamente en recomendaciones subjetivas.

### SÍ se debe:

- Seguir la lógica existente.
- Identificar inconsistencias.
- Identificar errores reales.
- Identificar funcionalidades incompletas.
- Identificar código que contradice las reglas actuales.
- Identificar problemas de integración entre Core y Store.
- Corregir implementaciones que no respetan las reglas actuales.
- Mantener compatibilidad siempre que sea posible.
- Explicar cualquier cambio realizado.

---

# 4. Cómo tratar las reglas de negocio

Las reglas de negocio existentes son la fuente de verdad.

Si durante la auditoría se encuentra una parte del código que contradice una regla actual, se debe corregir el código para adaptarlo a esa regla.

Por ejemplo:

### Regla actual

El SKU puede repetirse entre diferentes productos.

Si alguna parte del sistema continúa asumiendo:

```text
SKU = producto único
```

debe identificarse y corregirse.

Pero no se debe inventar una nueva forma de manejar los SKUs.

La solución debe basarse en cómo actualmente funciona el sistema y en los identificadores que ya existen.

---

# 5. Ejemplo inicial: SKU

El cambio de unicidad del SKU es uno de los casos que debe auditarse.

No limitarse a buscar solamente:

```text
sku
```

También revisar implementaciones que puedan asumir indirectamente que el SKU es único.

Por ejemplo:

```text
unique()
groupBy()
keyBy()
updateOrCreate()
firstWhere()
findBySku()
where('sku', ...)
```

Así como:

- índices UNIQUE en base de datos;
- validaciones;
- queries;
- servicios;
- repositories;
- importadores;
- exportadores;
- búsquedas;
- carrito;
- checkout;
- órdenes;
- APIs;
- respuestas del backend;
- estados del frontend;
- objetos indexados por SKU;
- Maps/Sets;
- React keys;
- deduplicación;
- filtros;
- componentes de búsqueda.

La finalidad no es cambiar todo lo relacionado al SKU, sino determinar:

> **¿En este punto del sistema se está utilizando el SKU de una forma incompatible con la regla actual?**

Si no existe un problema, no modificarlo.

---

# 6. Auditoría de Core

Revisar progresivamente las diferentes capas de Core.

### Base de datos

Revisar:

- tablas;
- columnas;
- índices;
- constraints;
- foreign keys;
- migraciones;
- relaciones;
- datos existentes relevantes.

### Modelos

Revisar:

- relaciones;
- casts;
- scopes;
- accessors/mutators;
- reglas implícitas;
- identificadores utilizados.

### Validaciones

Revisar:

- Form Requests;
- validators;
- reglas de creación;
- reglas de actualización;
- validaciones de importación.

### Servicios y lógica

Revisar:

- Services;
- Actions;
- Use Cases;
- Repositories;
- Jobs;
- Commands;
- procesos batch.

### APIs

Revisar:

- endpoints;
- controllers;
- requests;
- resources;
- responses;
- parámetros;
- filtros;
- paginación;
- errores.

### Integraciones

Revisar específicamente la comunicación con Store.

Determinar:

- qué información envía Core;
- qué información espera Store;
- identificadores utilizados;
- contratos;
- errores;
- casos límite.

---

# 7. Auditoría de Store

Revisar cómo Store consume y utiliza la información proporcionada por Core.

Analizar:

- servicios de API;
- hooks;
- stores;
- estados globales;
- componentes;
- páginas;
- formularios;
- búsqueda;
- filtros;
- carrito;
- checkout;
- órdenes;
- autenticación;
- manejo de errores.

Prestar especial atención a situaciones donde el frontend pueda asumir una condición que ya no es válida.

Por ejemplo:

```text
SKU → producto único
```

cuando actualmente:

```text
SKU → uno o varios productos
```

Pero nuevamente:

> **No cambiar el comportamiento si el código actual ya funciona correctamente.**

---

# 8. Flujos principales a validar

La auditoría debe recorrer los flujos existentes, no solamente revisar archivos de manera aislada.

Como mínimo:

### Productos

```text
Crear
Editar
Consultar
Listar
Buscar
Filtrar
```

### Importación

```text
Archivo
→ Validación
→ Procesamiento
→ Creación/actualización
→ Resultado
```

### Exportación

```text
Consulta
→ Transformación
→ Generación
→ Archivo
```

### Compra

```text
Producto
→ Detalle
→ Carrito
→ Checkout
→ Orden
→ Pago
→ Confirmación
```

### Usuario

```text
Registro
→ Login
→ Sesión
→ Carrito
→ Compra
→ Historial
```

Para cada flujo identificar errores reales o inconsistencias.

---

# 9. Auditoría basada en problemas reales

Los hallazgos deben clasificarse según evidencia.

### Error confirmado

El código presenta un comportamiento incorrecto que puede reproducirse o demostrarse.

### Inconsistencia

Dos partes del sistema manejan una misma funcionalidad de manera diferente sin que exista una razón definida.

### Pendiente existente

Existe una funcionalidad incompleta o un comportamiento que ya forma parte del alcance actual pero quedó pendiente.

### Riesgo técnico

Existe una implementación que podría generar problemas, pero no debe modificarse automáticamente.

Los riesgos técnicos deben documentarse y dejarse como observación si no existe una necesidad inmediata de corregirlos.

---

# 10. No convertir observaciones en nuevos pendientes

Es importante diferenciar entre:

> "Encontré algo que podría mejorarse"

y:

> "Encontré un problema que debemos corregir."

Solo el segundo debe convertirse automáticamente en trabajo de corrección.

Ejemplo:

```text
El código podría refactorizarse para utilizar otro patrón.
```

Esto NO significa que exista un pendiente.

En cambio:

```text
El carrito utiliza el SKU como identificador y esto provoca que
dos productos diferentes con el mismo SKU se comporten como uno solo.
```

Esto SÍ es un problema real y debe corregirse porque contradice la regla actual.

---

# 11. Proceso de trabajo

El trabajo debe realizarse en las siguientes etapas:

## Fase 1 — Entendimiento

Analizar Core y Store.

Documentar brevemente:

- arquitectura;
- tecnologías;
- módulos;
- entidades principales;
- comunicación;
- flujos;
- puntos críticos.

No hacer cambios funcionales.

---

## Fase 2 — Auditoría

Buscar problemas reales en:

- productos;
- SKU;
- búsqueda;
- importación;
- exportación;
- carrito;
- checkout;
- órdenes;
- pagos;
- APIs;
- frontend;
- backend;
- base de datos;
- integración Core ↔ Store.

Registrar cada hallazgo con evidencia.

---

## Fase 3 — Priorización

Priorizar:

1. Errores que rompen funcionalidades.
2. Errores que generan información incorrecta.
3. Errores de integración Core ↔ Store.
4. Errores derivados de reglas de negocio actuales.
5. Pendientes funcionales existentes.
6. Problemas menores.

No priorizar refactors o mejoras que no sean necesarias para resolver un problema.

---

## Fase 4 — Corrección

Resolver los problemas encontrados uno por uno.

Cada corrección debe ser:

- pequeña;
- controlada;
- coherente con la arquitectura actual;
- compatible con los flujos existentes;
- fácil de probar.

Evitar cambios masivos.

---

## Fase 5 — Pruebas

Después de cada corrección:

- ejecutar las pruebas existentes;
- agregar pruebas únicamente cuando sean necesarias;
- probar el flujo afectado;
- comprobar Core;
- comprobar Store;
- comprobar integración cuando corresponda.

Una corrección no debe considerarse terminada solamente porque compile.

Debe verificarse el comportamiento.

---

# 12. Registro de hallazgos

Cada problema encontrado debe registrarse de esta forma:

```text
ID:
Sistema: Core / Store / Ambos
Módulo:
Archivo:
Funcionalidad:

Problema:
Descripción concreta del problema.

Comportamiento actual:
Qué hace actualmente el sistema.

Comportamiento esperado:
Qué debería hacer según la lógica/regla actual.

Evidencia:
Código, flujo o comportamiento que demuestra el problema.

Impacto:
Qué funcionalidad afecta.

Solución:
Cambio mínimo necesario para corregirlo.

Pruebas:
Cómo comprobar que fue solucionado.

Estado:
Pendiente / En progreso / Corregido / Validado
```

---

# 13. Regla para decidir si modificar código

Antes de modificar cualquier código responder:

1. ¿Existe un problema real?
2. ¿Puedo demostrarlo?
3. ¿Qué regla actual está incumpliendo?
4. ¿Cuál es el comportamiento esperado?
5. ¿Cuál es el cambio mínimo para corregirlo?
6. ¿Qué otras funcionalidades pueden verse afectadas?
7. ¿Cómo voy a comprobar que la corrección funciona?

Si alguna de estas preguntas no puede responderse, **no realizar el cambio todavía**.

---

# 14. Criterio de finalización

El trabajo se considera correcto cuando:

- Se entiende la arquitectura principal de Core y Store.
- Los flujos principales fueron revisados.
- Los usos relevantes del SKU fueron auditados.
- Los errores reales encontrados fueron documentados.
- Los problemas prioritarios fueron corregidos.
- Core y Store mantienen consistencia.
- Las pruebas afectadas fueron ejecutadas.
- No se introdujeron nuevas reglas de negocio.
- No se agregaron funcionalidades fuera del alcance.
- No se realizaron refactors innecesarios.

---

# 15. Regla fundamental del proyecto

Este trabajo debe seguir siempre este criterio:

> **Entender → Detectar → Evidenciar → Corregir → Probar.**

No:

> **Entender → Rediseñar → Cambiar → Inventar mejoras.**

El objetivo es dejar el proyecto **más estable, consistente y confiable**, respetando la lógica y las reglas de negocio que ya existen.
