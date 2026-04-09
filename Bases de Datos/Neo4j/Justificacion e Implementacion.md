# Justificacion de uso de Neo4j


Se usara Neo4j para mapear las relaciones entre usuarios y cursos, y entre usuarios y amigos.
Para visualizar esto podemos observar que MongoDB almacena los datos ricos de los usuarios,
haciendo uso de Neo4j podriamos simplemente crear un usuario con el `_id` del usuario dentro de MongoDB,
de igual forma se haria la creacion de los nodos de cursos. De este modo se podria mapear las relaciones en un
ambiente `index-free` que permite Neo4j y establecer relaciones de usuarios matriculados a x curso en tiempo constante.

```mermaid
graph LR
    subgraph MongoDB
        M1[("Documento Usuario (datos ricos)")]
        M2[("Documento Curso (datos ricos)")]
    end

    subgraph Neo4j
        N1((Usuario _id)) -->|:MATRICULADO_EN| N2((Curso _id))
    end

    M1 -.->|"_id compartido"| N1
    M2 -.->|"_id compartido"| N2
```

### Ventajas de este enfoque

* Rendimiento:
    `Index-Free Adjacency` permite saltar de un nodo a otro en tiempo O(1),
    sin importar el tamaño total de la base de datos.
* Desacoplamiento:
    Al asignarle la carga de las relaciones a Neo4j, se libera a MongoDB de almacenar arreglos enormes de referencias.
* Schemaless:
    Permite agregar nuevas relaciones sin alterar el esquema existente.

---

## Modelado de la base de datos y relaciones

En Neo4j todo se reduce a entidades (nodos) y relaciones (aristas), ambos pueden tener propiedades key-value.

### Relacion de matricula

La matricula no es algo estatico sino una accion que conecta a un estudiante con el curso que matriculo.

* Nodos involucrados:
    `(:Usuario)` y `(:Curso)`. Solo almacenan el id unico para relacionarse con los documentos completos en MongoDB.
* Relacion:
    `[:MATRICULADO_EN]`. Arista direccional que apunta de Usuario a Curso.
* Propiedades de la relacion:
    Los datos propios de la transaccion (fecha, estado, semestre) viven dentro de la flecha, no en los nodos.

```cypher
// Crear relacion de matricula entre nodos existentes
MATCH (u:Usuario {id: "user"}), (c:Curso {id: "curso"})
CREATE (u)-[:MATRICULADO_EN {fecha: "2026-xx-xx", estado: "ACTIVO", semestre: "I-2026"}]->(c)
```

```mermaid
graph LR
    U((Usuario)) -->|":MATRICULADO_EN {fecha, estado}"| C((Curso))

    classDef usuario fill:#dbe4ff,stroke:#1e5fa8,stroke-width:2px,color:#000;
    classDef curso fill:#d3f9d8,stroke:#15803d,stroke-width:2px,color:#000;
    class U usuario;
    class C curso;
```

---

### Relacion de amistad

Las redes sociales dentro de la plataforma se modelan conectando nodos del mismo tipo.

* Nodos involucrados:
    `(:Usuario)` en ambos extremos.
* Relacion:
    `[:ES_AMIGO_DE]`. Aunque todas las relaciones en Neo4j tienen una direccion tecnica al crearse (se trata como una conexion mutua).
* Propiedades de la relacion:
    Datos del vinculo social (fecha de inicio, etc.).

```cypher
// Crear amistad entre dos usuarios existentes
MATCH (u1:Usuario {id: "user"}), (u2:Usuario {id: "user2"})
CREATE (u1)-[:ES_AMIGO_DE {desde: "2026-xx-xx"}]->(u2)
```

```mermaid
graph LR
    U1((Usuario A)) <-->|":ES_AMIGO_DE {desde}"| U2((Usuario B))

    classDef usuario fill:#dbe4ff,stroke:#1e5fa8,stroke-width:2px,color:#000;
    class U1,U2 usuario;
```

---

## Flujo de hidratacion
Que es hidratar? Es el proceso de tomar los datos de los nodos y relaciones de Neo4j y combinarlos con los datos de los documentos de MongoDB para obtener la vista completa del usuario.

Cuando se solicita el perfil de un usuario, el backend sigue este flujo:

1. Consulta Neo4j para obtener la red del usuario.
2. Con esos identificadores, el backend hace una consulta a MongoDB.
3. MongoDB devuelve los documentos completos.
4. La vista se **hidrata** con esos datos.

```mermaid
sequenceDiagram
    participant Cliente
    participant Backend
    participant Neo4j
    participant MongoDB

    Cliente->>Backend: GET perfil/user
    Backend->>Neo4j: Busqueda de user en Neo4j
    Neo4j-->>Backend: Usuario y sus relaciones
    Backend->>MongoDB: Query de los documentos completos
    MongoDB-->>Backend: Documentos completos
    Backend-->>Cliente: Vista hidratada con datos completos
```

---

## Vista general del grafo del proyecto

El siguiente diagrama muestra un ejemplo de como lucen los nodos y relaciones en la base de datos.

```mermaid
graph TD
    %% Definicion de Nodos de Usuario
    U1((Usuario: Carlos))
    U2((Usuario: Ana))
    U3((Usuario: Pedro))

    %% Definicion de Nodos de Curso
    C1((Curso: Bases de Datos II))
    C2((Curso: Lenguajes))
    C3((Curso: Estructuras de Datos))

    %% Relaciones de Matricula (Usuario -> Curso)
    U1 -->|:MATRICULADO_EN| C1
    U2 -->|:MATRICULADO_EN| C2
    U3 -->|:MATRICULADO_EN| C3

    %% Relaciones de Amistad (Usuario <-> Usuario)
    U1 <-->|:ES_AMIGO_DE| U2
    U2 <-->|:ES_AMIGO_DE| U3
    U1 <-->|:ES_AMIGO_DE| U3

    %% Estilos
    classDef usuario fill:#dbe4ff,stroke:#1e5fa8,stroke-width:2px,color:#000;
    classDef curso fill:#d3f9d8,stroke:#15803d,stroke-width:2px,color:#000;

    class U1,U2,U3 usuario;
    class C1,C2,C3 curso;
```