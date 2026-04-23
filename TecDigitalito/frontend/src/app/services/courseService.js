
/**
 * 
 *  Aclaracion sobre esta area, se tiene diferentes imagenes stock para demostrar como se ven los cursos y tambien
 *  se tienen cursos con datos de prueba para el mismo proposito y simular como fucionarai esto con datos reales
 *  Todo esto se realiza por medio de la bandera USE_MOCK que se encuentra en la aprte de abajo.
 *  Si es True los datos retornados seran los datos de prueba pero si es falsa se conectara a la base de datos por medio de fetch 
 *  y se obtendran los datos de los cursos. 
 *  Aunque pareza tedioso hacer el cambio a la hora de lograr la conexion real se le puede pedir 
 *  a la IA que elimine el uso del flag y el servicio quedaria completamente funcional ya que 
 *  el backend estaria listo para recibir las peticiones.
 *  Estara listo cuando se tengan los endpoint del backend para los cursos. Estos se ubicarian en la carpeta 
 *  Backend/src/controllers/course.controller.js y Backend/src/routes/course.routes.js.
 *  Aca nos referimos a api como 
 */

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1643199187247-b3b6009bf0bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjbGFzc3Jvb20lMjBkYXRhYmFzZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzc2OTI1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1643199121319-b3b5695e4acb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxlZHVjYXRpb24lMjBjbGFzc3Jvb20lMjBkYXRhYmFzZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzc2OTI1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1723987251277-18fc0a1effd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxlZHVjYXRpb24lMjBjbGFzc3Jvb20lMjBkYXRhYmFzZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzc2OTI1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxlZHVjYXRpb24lMjBjbGFzc3Jvb20lMjBkYXRhYmFzZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzc2OTI1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1705579610258-215a3e0025aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxlZHVjYXRpb24lMjBjbGFzc3Jvb20lMjBkYXRhYmFzZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzc2OTI1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1649421493620-48f1bb0484cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxlZHVjYXRpb24lMjBjbGFzc3Jvb20lMjBkYXRhYmFzZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzc2OTI1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
];

const USE_MOCK = true;

const MOCK_COURSES = {
  'uuid-1': {
    id: 'uuid-1', name: 'Bases de Datos II', code: 'IC-XXXX',
    bannerImageUrl: STOCK_IMAGES[5], startDate: '2026-02-10', endDate: '2026-06-20',
    description: 'Curso avanzado de bases de datos que cubre modelado NoSQL, bases distribuidas, optimización de consultas, índices avanzados y arquitecturas modernas como grafos y documentos.',
    professor: { name: 'Dr. Carlos Ramírez', email: 'carlos.ramirez@tec.ac.cr' },
    credits: 4, semester: 'I Semestre 2026',
    contentTree: [
      {
        id: 'sec-1', title: 'Unidad 1: Fundamentos NoSQL', type: 'section', children: [
          {
            id: 'top-1-1', title: 'Introducción a NoSQL', type: 'topic', children: [
              {
                id: 'sub-1-1-1', title: 'Tipos de bases NoSQL', type: 'subtopic', blocks: [
                  { id: 'b1', type: 'text', content: 'Las bases NoSQL se clasifican en: documentos, clave-valor, columnas anchas y grafos.' },
                  { id: 'b2', type: 'file', name: 'Lectura_NoSQL.pdf', size: '2.4 MB', url: '#' },
                ]
              },
              {
                id: 'sub-1-1-2', title: 'CAP Theorem', type: 'subtopic', blocks: [
                  { id: 'b3', type: 'text', content: 'El teorema CAP establece que solo se pueden garantizar 2 de 3: Consistencia, Disponibilidad, Tolerancia a particiones.' },
                  { id: 'b4', type: 'image', name: 'cap_diagram.png', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600', caption: 'Diagrama CAP' },
                ]
              },
            ]
          },
          {
            id: 'top-1-2', title: 'MongoDB Fundamentals', type: 'topic', children: [
              {
                id: 'sub-1-2-1', title: 'Modelado de Documentos', type: 'subtopic', blocks: [
                  { id: 'b5', type: 'text', content: 'El modelado en MongoDB se basa en documentos JSON embebidos y referencias.' },
                  { id: 'b6', type: 'file', name: 'MongoDB_Guide.pdf', size: '5.1 MB', url: '#' },
                ]
              },
            ]
          },
        ]
      },
      {
        id: 'sec-2', title: 'Unidad 2: Bases de Grafos', type: 'section', children: [
          {
            id: 'top-2-1', title: 'Neo4j y Cypher', type: 'topic', children: [
              {
                id: 'sub-2-1-1', title: 'Consultas Cypher', type: 'subtopic', blocks: [
                  { id: 'b7', type: 'text', content: 'Cypher es el lenguaje declarativo de Neo4j para consultar grafos.' },
                ]
              },
            ]
          },
        ]
      },
      { id: 'sec-3', title: 'Unidad 3: Optimización', type: 'section', children: [] },
    ],
    evaluations: [
      {
        id: 'qz-1', title: 'Quiz 1: Fundamentos NoSQL', startAt: '2026-03-15T08:00', endAt: '2026-03-15T23:59', status: 'finished',
        questions: [
          { id: 'q1', prompt: '¿Cuál NO es un tipo de base NoSQL?', options: ['Documentos', 'Relacional', 'Clave-Valor', 'Grafos'], correctOption: 1 },
          { id: 'q2', prompt: '¿MongoDB es una base de datos de tipo...?', options: ['Clave-Valor', 'Columnas', 'Documentos', 'Grafos'], correctOption: 2 },
          { id: 'q3', prompt: '¿Qué garantiza el teorema CAP?', options: ['C+A+P simultáneo es imposible', 'Velocidad máxima', 'Seguridad total', 'Ninguna'], correctOption: 0 },
        ]
      },
      {
        id: 'qz-2', title: 'Quiz 2: Neo4j y Grafos', startAt: '2026-04-20T08:00', endAt: '2026-04-20T23:59', status: 'active',
        questions: [
          { id: 'q4', prompt: '¿Lenguaje de consulta de Neo4j?', options: ['SQL', 'GraphQL', 'Cypher', 'Gremlin'], correctOption: 2 },
          { id: 'q5', prompt: '¿Qué representa un nodo en Neo4j?', options: ['Tabla', 'Entidad', 'Columna', 'Índice'], correctOption: 1 },
        ]
      },
      { id: 'qz-3', title: 'Quiz 3: Optimización', startAt: '2026-05-10T08:00', endAt: '2026-05-10T23:59', status: 'scheduled', questions: [] },
    ],
    enrolledStudents: [
      { id: 's1', fullName: 'María López Fernández', email: 'maria.lopez@estudiantec.cr', grade: 92 },
      { id: 's2', fullName: 'Juan Pérez Solano', email: 'juan.perez@estudiantec.cr', grade: 78 },
      { id: 's3', fullName: 'Ana Rodríguez Mora', email: 'ana.rodriguez@estudiantec.cr', grade: 85 },
      { id: 's4', fullName: 'Carlos Méndez Arias', email: 'carlos.mendez@estudiantec.cr', grade: 45 },
      { id: 's5', fullName: 'Sofía Herrera Vargas', email: 'sofia.herrera@estudiantec.cr', grade: 68 },
      { id: 's6', fullName: 'Diego Calvo Jiménez', email: 'diego.calvo@estudiantec.cr', grade: 91 },
      { id: 's7', fullName: 'Valeria Quesada', email: 'valeria.quesada@estudiantec.cr', grade: 55 },
      { id: 's8', fullName: 'Andrés Vindas Castro', email: 'andres.vindas@estudiantec.cr', grade: null },
    ]
  },
  'uuid-2': {
    id: 'uuid-2', name: 'Arquitectura de Computadores', code: 'IC-XXXX',
    bannerImageUrl: STOCK_IMAGES[3], startDate: '2026-02-10', endDate: '2026-06-20',
    description: 'Organización y arquitectura de sistemas computacionales modernos: pipelines, jerarquía de memoria, multiprocesador y RISC/CISC.',
    professor: { name: 'Dra. Laura Solano', email: 'laura.solano@tec.ac.cr' },
    credits: 4, semester: 'I Semestre 2026',
    contentTree: [
      {
        id: 'sa1', title: 'Unidad 1: Fundamentos', type: 'section', children: [
          {
            id: 'ta1', title: 'Pipeline', type: 'topic', children: [
              {
                id: 'sua1', title: 'Etapas del pipeline', type: 'subtopic', blocks: [
                  { id: 'ba1', type: 'text', content: 'Pipeline clásico RISC: Fetch, Decode, Execute, Memory Access, Write Back.' }
                ]
              }
            ]
          }
        ]
      }
    ],
    evaluations: [],
    enrolledStudents: [
      { id: 's10', fullName: 'Pedro Castillo', email: 'pedro.castillo@estudiantec.cr', grade: 88 },
      { id: 's11', fullName: 'Lucía Navarro', email: 'lucia.navarro@estudiantec.cr', grade: 72 },
    ]
  },
  'uuid-3': {
    id: 'uuid-3', name: 'Compiladores e Intérpretes', code: 'IC-XXXX',
    bannerImageUrl: STOCK_IMAGES[0], startDate: '2026-02-10', endDate: '2026-06-20',
    description: 'Estudio profundo de las fases de un compilador: análisis léxico, sintáctico, semántico y generación de código intermedio y objeto.',
    professor: { name: 'Ing. Roberto Alfaro', email: 'roberto.alfaro@tec.ac.cr' },
    credits: 4, semester: 'I Semestre 2026',
    contentTree: [
      {
        id: 'sec-c1', title: 'Unidad 1: Análisis Léxico', type: 'section', children: [
          {
            id: 'top-c1-1', title: 'Autómatas Finitos', type: 'topic', children: [
              {
                id: 'sub-c1-1-1', title: 'AFN a AFD', type: 'subtopic', blocks: [
                  { id: 'bc1', type: 'text', content: 'Conversión de autómatas no deterministas a deterministas mediante el algoritmo de subconjuntos.' },
                  { id: 'bc2', type: 'file', name: 'Algoritmo_Subconjuntos.pdf', size: '1.2 MB', url: '#' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-c2', title: 'Entregables y Tareas', type: 'section', children: [
          {
            id: 'top-c2-1', title: 'Tarea 1: Analizador Léxico', type: 'topic', children: [
              {
                id: 'sub-c2-1-1', title: 'Especificación de la Tarea', type: 'subtopic', blocks: [
                  { id: 'bc3', type: 'text', content: 'Desarrollar un analizador léxico para el lenguaje Mini-Pascal utilizando JFlex o herramientas similares.' },
                  { id: 'bc4', type: 'file', name: 'Enunciado_Tarea1.pdf', size: '850 KB', url: '#' }
                ]
              }
            ]
          }
        ]
      }
    ],
    evaluations: [
      {
        id: 'qz-c1', title: 'Examen Parcial 1', startAt: '2026-04-05T08:00', endAt: '2026-04-05T11:00', status: 'scheduled',
        questions: [
          { id: 'qc1', prompt: '¿Cuál es la función del analizador léxico?', options: ['Generar código','Agrupar caracteres en tokens','Validar tipos','Optimizar'], correctOption: 1 }
        ]
      }
    ],
    enrolledStudents: [
      { id: 's20', fullName: 'Estudiante Demo', email: 'demo@tec.ac.cr', grade: 95 }
    ]
  },
  'uuid-4': {
    id: 'uuid-4', name: 'Redes de Computadores', code: 'IC-XXXX',
    bannerImageUrl: STOCK_IMAGES[1], startDate: '2026-02-10', endDate: '2026-06-20',
    description: 'Fundamentos de redes, protocolos de comunicación, seguridad y administración de infraestructuras de red.',
    professor: { name: 'Ing. Silvia Mata', email: 'silvia.mata@tec.ac.cr' },
    credits: 3, semester: 'I Semestre 2026',
    contentTree: [
      {
        id: 'sec-r1', title: 'Unidad 1: Modelo OSI', type: 'section', children: [
          {
            id: 'top-r1-1', title: 'Capas del Modelo', type: 'topic', children: [
              {
                id: 'sub-r1-1-1', title: 'Capa Física y Enlace', type: 'subtopic', blocks: [
                  { id: 'br1', type: 'text', content: 'Protocolos de nivel inferior y medios de transmisión.' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'sec-r2', title: 'Laboratorios', type: 'section', children: [
          {
            id: 'top-r2-1', title: 'Laboratorio 1: Wireshark', type: 'topic', children: [
              {
                id: 'sub-r2-1-1', title: 'Captura de paquetes', type: 'subtopic', blocks: [
                  { id: 'br2', type: 'text', content: 'Análisis de tráfico HTTP y TCP utilizando Wireshark.' },
                  { id: 'br3', type: 'image', name: 'wireshark_logo.png', url: 'https://www.wireshark.org/assets/theme-2023/images/wireshark-logo.png', caption: 'Herramienta Wireshark' }
                ]
              }
            ]
          }
        ]
      }
    ],
    evaluations: [
      {
        id: 'qz-r1', title: 'Quiz 1: Capas OSI', startAt: '2026-03-20T10:00', endAt: '2026-03-20T23:59', status: 'finished',
        questions: [
          { id: 'qr1', prompt: '¿Cuántas capas tiene el modelo OSI?', options: ['5','6','7','8'], correctOption: 2 }
        ]
      }
    ],
    enrolledStudents: [
      { id: 's20', fullName: 'Estudiante Demo', email: 'demo@tec.ac.cr', grade: 88 }
    ]
  }
};

const mock_getEnrolled = () => [
  { course_id: 'uuid-3', course_name: 'Compiladores e Intérpretes', course_code: 'IC-XXXX', course_image_url: STOCK_IMAGES[0] },
  { course_id: 'uuid-4', course_name: 'Redes de Computadores', course_code: 'IC-XXXX', course_image_url: STOCK_IMAGES[1] },
];

const mock_getTeaching = () => [
  { course_id: 'uuid-1', course_name: 'Bases de Datos II', course_code: 'IC-XXXX', course_image_url: STOCK_IMAGES[5] },
  { course_id: 'uuid-2', course_name: 'Arquitectura de Computadores', course_code: 'IC-XXXX', course_image_url: STOCK_IMAGES[3] },
];

const mock_getCatalog = () => [
  { course_id: 'uuid-5', course_name: 'Sistemas Operativos', course_code: 'IC-XXXX', course_image_url: STOCK_IMAGES[2] },
  { course_id: 'uuid-6', course_name: 'Ingeniería de Software', course_code: 'IC-XXXX', course_image_url: STOCK_IMAGES[4] },
  { course_id: 'uuid-7', course_name: 'Inteligencia Artificial', course_code: 'IC-XXXX', course_image_url: STOCK_IMAGES[0] },
];

const mock_enroll = (id) => {
  console.log(`Matriculado en: ${id}`);
  return { success: true };
};

export const courseService = {
  getEnrolledCourses: async (token) => {
    if (USE_MOCK) return mock_getEnrolled();
    const res = await fetch('/api/courses/enrolled', { headers: { 'Authorization': `Bearer ${token}` } });
    return await res.json();
  },

  getTeachingCourses: async (token) => {
    if (USE_MOCK) return mock_getTeaching();
    const res = await fetch('/api/courses/teaching', { headers: { 'Authorization': `Bearer ${token}` } });
    return await res.json();
  },

  getCatalog: async () => {
    if (USE_MOCK) return mock_getCatalog();
    const res = await fetch('/api/courses/catalog');
    return await res.json();
  },

  enrollInCourse: async (courseId, token) => {
    if (USE_MOCK) return mock_enroll(courseId);
    const res = await fetch(`/api/courses/enroll/${courseId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    return await res.json();
  },

  getCourseById: async (courseId, token) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return MOCK_COURSES[courseId] || null;
    }
    const res = await fetch(`/api/courses/${courseId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) return null;
    return await res.json();
  }
};
