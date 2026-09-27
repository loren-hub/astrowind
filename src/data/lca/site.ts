/** Brand and public contact data. Keep operational promises in the service contract. */
export const company = {
  name: 'LCA Technology Solutions',
  email: 'info@lcatechnologysolutions.com',
  linkedin: 'https://www.linkedin.com/company/lca-ts/',
  location: 'Madrid · Albacete · Servicio en toda España',
};

/** Complete with the registered details before publishing the legal pages. */
export const legal = {
  registeredName: '',
  taxId: '',
  address: '',
  registry: '',
  privacyEmail: company.email,
  revised: '27 de septiembre de 2026',
};

export const contactEnabled = import.meta.env.PUBLIC_CONTACT_ENABLED === 'true';
export const siteIndexable = import.meta.env.PUBLIC_SITE_INDEXABLE === 'true';

export const navigation = [
  { label: 'Servicios', href: '/#servicios' },
  { label: 'IA aplicada', href: '/#ia' },
  { label: 'Cómo trabajamos', href: '/#proceso' },
  { label: 'Perspectivas', href: '/#perspectivas' },
];

export const faqs = [
  {
    question: '¿Trabajáis con empresas que no tienen departamento IT?',
    answer:
      'Sí. Podemos actuar como tu equipo de apoyo tecnológico o colaborar con el que ya tienes. Empezamos por conocer tus sistemas, las personas que los utilizan y los procesos que no pueden detenerse. Después acordamos prioridades, alcance y responsables.',
  },
  {
    question: '¿Qué incluye un servicio de seguridad gestionada o MDR?',
    answer:
      'Acordamos las fuentes que se monitorizan, la detección y análisis de alertas, las acciones de respuesta y los informes. La cobertura horaria, los tiempos de atención, las herramientas y la capacidad de intervención se definen en la propuesta y el SLA. Así sabes exactamente qué está cubierto.',
  },
  {
    question: '¿Por dónde empiezo con la inteligencia artificial?',
    answer:
      'Por una tarea repetitiva con datos disponibles y un resultado medible: clasificar solicitudes, extraer datos de documentos o consultar conocimiento interno. Definimos un piloto con revisión humana, evaluamos calidad y coste y solo lo ampliamos cuando aporta valor.',
  },
  {
    question: '¿DORA, NIS2 y ENS se aplican a cualquier pyme?',
    answer:
      'No de forma general. DORA se dirige al sector financiero y contempla el riesgo de sus proveedores TIC. NIS2 depende del sector, tamaño, excepciones y normativa nacional aplicable. El ENS afecta al sector público y a determinados sistemas de sus proveedores. Primero analizamos tu ámbito y tus obligaciones contractuales.',
  },
  {
    question: '¿Cómo realizáis un pentesting sin afectar al negocio?',
    answer:
      'Definimos por escrito la autorización, los activos, las ventanas de prueba, las exclusiones y el contacto para incidencias. Entregamos evidencias, prioridades de corrección y una revisión posterior según el alcance contratado.',
  },
  {
    question: '¿Podéis mantener las herramientas que ya utilizamos?',
    answer:
      'Sí. Revisamos Microsoft 365, Google Workspace, servidores, aplicaciones y proveedores antes de proponer cambios. Buscamos reducir complejidad y aprovechar lo que ya funciona. Las migraciones se planifican con copia de seguridad y posibilidad de reversión.',
  },
];

export const insights = [
  {
    tag: 'IA Y GOBIERNO',
    title: 'Dar acceso a un agente también es una decisión de seguridad.',
    text: 'Identidades, permisos y límites de actuación para llevar la IA a procesos reales.',
    href: company.linkedin,
  },
  {
    tag: 'INFRAESTRUCTURA',
    title: 'La seguridad del software empieza antes del despliegue.',
    text: 'Credenciales, servidores de CI/CD y dependencias: la cadena de suministro también cuenta.',
    href: 'https://www.linkedin.com/posts/lca-ts_doc-activity-7492837565348159488-5Tdn',
  },
  {
    tag: 'RESILIENCIA',
    title: 'Una copia de seguridad necesita una prueba de recuperación.',
    text: 'Aislamiento, permisos y restauración para preparar la continuidad del negocio.',
    href: company.linkedin,
  },
];
