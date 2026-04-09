# Guía de Neo4j

Este documento detalla los conceptos principales, las consultas estándar y las convenciones de nomenclatura para la interacción con la base de datos Neo4j en este proyecto.

## 1. Arquitectura Base

Neo4j es una base de datos orientada a grafos. Su esquema depende de tres elementos fundamentales:

- **Nodos**: Entidades/registros dentro del dominio (ej. `(e:Estudiante)`).
- **Relaciones**: Conexiones tipadas y direccionales entre nodos (ej. `-[r:MATRICULADO_EN]->`).
- **Propiedades**: Pares clave-valor asignados a nodos o relaciones (ej. `{id: 1, estado: 'activo'}`).

## 2. Sintaxis de Consultas (Cypher)

Cypher es el lenguaje de consultas declarativo de Neo4j. A continuación se detalla la sintaxis esencial para operaciones CRUD.

### Crear (Insert)
Para insertar nodos aislados o establecer conexiones:

```cypher
// Crear un nodo
CREATE (n:Estudiante {id_estudiante: '12345', nombre: 'Juan Perez'})

// Crear nodos y relaciones simultáneamente
CREATE (e:Estudiante {nombre: 'Ana'})-[:MATRICULADO_EN {semestre: 'I-2026'}]->(c:Curso {codigo: 'BD2'})
```

### Consultar (Match & Return)
Para consultar el grafo mediante patrones:

```cypher
// Recuperar un nodo específico
MATCH (e:Estudiante {id_estudiante: '12345'})
RETURN e

// Recuperar nodos relacionados (Traversing)
MATCH (e:Estudiante)-[r:MATRICULADO_EN]->(c:Curso)
WHERE c.codigo = 'BD2'
RETURN e, r, c
```

### Actualizar (Set)
Para modificar las propiedades de un nodo o relación existente:

```cypher
MATCH (e:Estudiante {id_estudiante: '12345'})
SET e.estado = 'inactivo'
RETURN e
```

### Eliminar (Delete)
Para remover nodos. Si un nodo tiene relaciones, estas deben ser separadas (`DETACH`) antes de su eliminación.

```cypher
MATCH (e:Estudiante {id_estudiante: '12345'})
DETACH DELETE e
```

## 3. Operaciones y Buenas Prácticas

- **Resolución de nodos previa a la conexión**: Al crear relaciones entre entidades existentes, siempre deben ser resueltas primero utilizando `MATCH` para evitar la duplicación de nodos.
  ```cypher
  MATCH (e:Estudiante {id_estudiante: '123'}), (c:Curso {codigo: 'BD2'})
  CREATE (e)-[:MATRICULADO_EN]->(c)
  ```
- **Idempotencia**: Utilizar `MERGE` en lugar de `CREATE` cuando un nodo o relación solo deba crearse en caso de no existir previamente.

## 4. Convenciones de Nomenclatura

- **Etiquetas de Nodos (Labels)**: PascalCase (ej. `Estudiante`, `SesionCurso`)
- **Tipos de Relaciones**: UPPER_SNAKE_CASE (ej. `MATRICULADO_EN`, `IMPARTE_CURSO`)
- **Propiedades**: snake_case (ej. `id_estudiante`, `fecha_creacion`)
