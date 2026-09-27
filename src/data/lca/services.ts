export const services = [
  {
    id: 'ia',
    number: '01',
    icon: 'tabler:cpu',
    title: 'IA y automatización inteligente',
    description: 'Convierte tareas repetitivas en procesos conectados, con control sobre los datos y las decisiones.',
    items: [
      'Asistentes internos y búsqueda documental con RAG',
      'Integración de CRM, ERP, correo y documentos',
      'Agentes con permisos limitados y supervisión humana',
    ],
    result: 'Un piloto medible antes de escalar.',
  },
  {
    id: 'seguridad',
    number: '02',
    icon: 'tabler:shield-check',
    title: 'Ciberseguridad gestionada',
    description:
      'Visibilidad sobre tus equipos, identidades y red. Alertas que se investigan y acciones que se acuerdan.',
    items: [
      'Detección y respuesta gestionadas: EDR / MDR',
      'Arquitectura Zero Trust, MFA y mínimo privilegio',
      'Vulnerabilidades, hardening y respuesta a incidentes',
    ],
    result: 'Riesgos priorizados y respuesta documentada.',
  },
  {
    id: 'pentesting',
    number: '03',
    icon: 'tabler:terminal-2',
    title: 'Pentesting y seguridad técnica',
    description: 'Identifica cómo podrían comprometer tu negocio y qué debes corregir primero.',
    items: [
      'Pentesting de aplicaciones, APIs e infraestructura',
      'Revisión de configuraciones cloud y accesos',
      'DevSecOps, secretos y cadena de suministro',
    ],
    result: 'Evidencias, plan de corrección y retest acordado.',
  },
  {
    id: 'cumplimiento',
    number: '04',
    icon: 'tabler:file-check',
    title: 'Cumplimiento y gobierno IT',
    description: 'Traduce los requisitos que afectan a tu empresa en controles, responsables y evidencias.',
    items: [
      'Preparación y adecuación: DORA, NIS2 y ENS',
      'Gestión del riesgo y evaluación de proveedores',
      'Privacidad, gobierno de IA y apoyo a ISO 27001',
    ],
    result: 'Una hoja de ruta ajustada a tu ámbito.',
  },
  {
    id: 'cloud',
    number: '05',
    icon: 'tabler:cloud-computing',
    title: 'Cloud y puesto de trabajo',
    description: 'Herramientas que funcionan juntas y accesos que acompañan a cada persona durante todo su ciclo.',
    items: [
      'Microsoft 365, Google Workspace e identidades',
      'Migraciones cloud, redes y gestión de dispositivos',
      'Soporte IT, inventario y optimización de licencias',
    ],
    result: 'Un entorno más sencillo de mantener.',
  },
  {
    id: 'continuidad',
    number: '06',
    icon: 'tabler:refresh',
    title: 'Continuidad y servicios web',
    description: 'Prepara tus sistemas y a tu equipo para seguir operando cuando algo falla.',
    items: [
      'Backups aislados y pruebas de restauración',
      'Planes de continuidad y formación frente al phishing',
      'Webs rápidas, hosting y mantenimiento técnico',
    ],
    result: 'Recuperación planificada y conocimiento compartido.',
  },
] as const;

export const serviceNames: Record<string, string> = Object.fromEntries([
  ...services.map(({ id, title }) => [id, title]),
  ['orientacion', 'Necesito orientación'],
]);
