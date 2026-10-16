export const tools=[
['PostgreSQL','Bases de datos','Una base sólida para los datos de tu aplicación. Relacional, extensible y preparada para consultas complejas.','C','PostgreSQL',18400,'Hace 2 días',true,'postgres/postgres','#7db5d8'],
['Keycloak','Autenticación','Inicio de sesión único, gestión de usuarios y control de acceso para tus aplicaciones.','Java','Apache-2.0',25400,'Hace 1 día',true,'keycloak/keycloak','#92cce5'],
['Meilisearch','Búsqueda','Búsqueda rápida y tolerante a errores para que tus usuarios encuentren lo que necesitan.','Rust','MIT',51200,'Hace 3 días',true,'meilisearch/meilisearch','#ed9bd6'],
['Ollama','IA','Ejecuta modelos de lenguaje en tu infraestructura e intégralos en tus propias experiencias.','Go','MIT',89000,'Hace 1 día',true,'ollama/ollama','#e4e4e7'],
['Plausible','Analítica','Entiende cómo se utiliza tu producto con analítica web sencilla y centrada en la privacidad.','Elixir','AGPL-3.0',19800,'Hace 4 días',true,'plausible/analytics','#a2a4f8'],
['Lago','Pagos','Componentes para gestionar facturación por uso y suscripciones en tus productos.','Ruby','AGPL-3.0',7800,'Hace 5 días',true,'getlago/lago','#a1cba9'],
['Qdrant','Bases de datos','Búsqueda vectorial para recuperar información relevante y construir aplicaciones con IA.','Rust','Apache-2.0',21000,'Hace 2 días',true,'qdrant/qdrant','#ef809b'],
['Umami','Analítica','Métricas esenciales de tu sitio en una interfaz simple, con opción de alojamiento propio.','TypeScript','MIT',22300,'Hace 6 días',true,'umami-software/umami','#e6e6e6'],
['Typesense','Búsqueda','Un motor de búsqueda para crear experiencias de descubrimiento en tus aplicaciones.','C++','GPL-3.0',16200,'Hace 90 días',false,'typesense/typesense','#f4c88e']
].map(([name,category,description,language,license,stars,activity,maintained,repo,color])=>({id:name.toLowerCase(),name,category,description,language,license,stars,activity,maintained,repo,color}));
// Health scores and open issue counts are fictional prototype data.
export const cardDetails = {
 PostgreSQL: { healthScore: 94, openIssues: 28, tag: 'Relacional', version: '15.2.4', docs: 'https://www.postgresql.org/docs/' },
 Keycloak: { healthScore: 72, openIssues: 342, tag: 'Identidad', docs: 'https://www.keycloak.org/documentation' },
 Meilisearch: { healthScore: 48, openIssues: 116, tag: 'Texto completo', docs: 'https://www.meilisearch.com/docs' },
 Ollama: { healthScore: 87, openIssues: 428, tag: 'Modelos locales', docs: 'https://docs.ollama.com/' },
 Plausible: { healthScore: 65, openIssues: 64, tag: 'Analítica web', docs: 'https://plausible.io/docs' },
 Lago: { healthScore: 35, openIssues: 93, tag: 'Facturación', docs: 'https://docs.getlago.com/' },
 Qdrant: { healthScore: 93, openIssues: 147, tag: 'Vectorial', docs: 'https://qdrant.tech/documentation/' },
 Umami: { healthScore: 78, openIssues: 81, tag: 'Analítica web', docs: 'https://umami.is/docs' },
 Typesense: { healthScore: 56, openIssues: 205, tag: 'Texto completo', docs: 'https://typesense.org/docs/' }
};

// Curated demo palettes; PostgreSQL follows the supplied Figma reference.
// These tokens can come from each tool's catalog record when an API is connected.
export const brandPalettes = {
 PostgreSQL: { start: '#0f1839', end: '#002ec5', tag: '#2749ba' },
 Keycloak: { start: '#10252e', end: '#075477', tag: '#14617b' },
 Meilisearch: { start: '#30152e', end: '#802563', tag: '#8b306e' },
 Ollama: { start: '#202020', end: '#414141', tag: '#505050' },
 Plausible: { start: '#171c42', end: '#3847a3', tag: '#4654b1' },
 Lago: { start: '#152a21', end: '#245d40', tag: '#2b684b' },
 Qdrant: { start: '#32131e', end: '#8a2144', tag: '#a32850' },
 Umami: { start: '#171717', end: '#363636', tag: '#494949' },
 Typesense: { start: '#302011', end: '#815020', tag: '#875323' }
};
export const defaultBrand = { start: '#222222', end: '#303030', tag: '#454545' };
