Actúa como un Product Manager y Diseñador de Sistemas Senior. Diseña la arquitectura funcional completa, el modelo conceptual de datos y los flujos de usuario para una plataforma integral de gestión de ventas, eventos presenciales y cálculo de comisiones multinivel básico (Agente -> Supervisor -> Empresa).

El sistema debe operar de forma continua en el día a día para los agentes comerciales, pero con capacidades especializadas para activaciones y ferias presenciales.

---

### CONTEXTO Y CASO DE USO PRINCIPAL
Una empresa envía un equipo de agentes y supervisores a eventos presenciales (por ejemplo, ferias comerciales en Texas). Durante el evento, los agentes capturan prospectos (leads) en campo en tiempo real. La plataforma debe otorgar control total de lo ocurrido en el evento (leads capturados, conversiones, costos asociados y rendimiento por agente). 

Fuera de los eventos, la aplicación sigue en uso normal: los agentes continúan gestionando leads cotidianos, seguimiento de ventas, agenda y producción regular.

---

### REGLAS DE NEGOCIO CLAVE
1. Esquema de Comisiones:
   - Toda venta cerrada genera una comisión para el Agente vendedor directo.
   - El Supervisor directo de ese agente percibe automáticamente un porcentaje/comisión por las ventas de su equipo subordinado.
   - La plataforma debe registrar y desglosar el margen neto para la empresa tras deducir las comisiones del agente y del supervisor.
2. Jerarquía y Atribución:
   - Cada lead y cada venta deben atribuirse inequívocamente a: un Agente, un Supervisor y (opcionalmente) un Evento origen.
   - Los leads pueden capturarse vinculados a un Evento activo o de forma independiente (prospección diaria).

---

### ROLES Y PERMISOS REQUERIDOS

1. Dueño / Administrador General:
   - Visibilidad global: Dashboard ejecutivo con métricas de ventas brutas, comisiones pagadas a agentes/supervisores y ganancia neta final.
   - Gestión de usuarios: Alta, asignación de supervisores a agentes, roles y parametrización de comisiones.
   - Gestión y auditoría de eventos: Presupuesto/costos de cada feria vs. retorno de inversión (ROI) generado en ventas.
   - Reportes consolidados descargables con filtros por período, evento, supervisor, agente y producto.

2. Supervisor:
   - Panel de equipo: Rendimiento acumulado y en tiempo real de sus agentes a cargo.
   - Métricas de comisiones propias devengadas por la producción de su equipo.
   - Seguimiento del pipeline de leads de su equipo asignado y reasignación de contactos si un agente está inactivo.

3. Agente / Vendedor:
   - Modo Evento / Captura Rápida: Formulario ultrarrápido y optimizado para móvil para registrar prospectos en ferias (contacto, notas, nivel de interés, fotos/documentos).
   - Modo Diario: Gestión de cartera propia, pipeline de leads (Nuevo, Contactado, Cita, Seguimiento, Cerrado, Perdido).
   - Notas, recordatorios y registro de interacciones con cada cliente.
   - Dashboard personal: Ventas cerradas, comisiones ganadas acumuladas y estatus de cobro.

---

### ENTREGABLES ESPERADOS
Por favor genera:
1. Matriz de Módulos Funcionales detallando objetivos, entradas y salidas de cada módulo.
2. Flujo de Vida del Lead: Desde su captura en el evento (o prospección externa) hasta el cierre y liquidación de comisiones.
3. Modelo Conceptual de Datos: Listado de entidades principales (Usuarios, Equipos, Eventos, Leads, Ventas, Comisiones) con sus atributos esenciales y relaciones.
4. Lógica y Motor de Comisiones: Explicación paso a paso de cómo se liquidan las ventas y cómo se resuelve la jerarquía agente-supervisor.
5. Requerimientos Funcionales y No Funcionales (usabilidad móvil en ferias, funcionamiento con conexión inestable, auditoría e integridad de reportes financieros).