import {tools,cardDetails,brandPalettes,defaultBrand} from './tools';
import {ToolDetail} from './ToolDetail';
import {useToolNavigation} from './useToolNavigation';
import {useCardTilt} from './useCardTilt';
import {useAnimatedCatalog} from './useAnimatedCatalog';
import {RevealHeading,usePageReveal} from './PageReveal';
import {MetalBorder} from './MetalBorder';
import {HeroLights} from './HeroLights';
import React, {useState, useRef, useEffect} from 'react';
import {Activity, ArrowUpRight, ArrowRight, Search, SlidersHorizontal, X, Database, ShieldCheck, CreditCard, BrainCircuit, ChartNoAxesCombined, SearchCheck, LoaderCircle} from 'lucide-react';
import '@fontsource-variable/inter';
const promptExamples = [
 'Diseña un SaaS multi-tenant con aislamiento de datos, SSO mediante OIDC y RBAC por organización.',
 'Propón una arquitectura orientada a eventos con colas, reintentos e idempotencia para procesar pagos.',
 'Diseña un RAG privado con búsqueda híbrida, permisos por documento y modelos alojados en nuestra infraestructura.',
 'Define un stack de observabilidad con métricas, logs y trazas distribuidas para microservicios en Kubernetes.',
 'Propón una API de alta disponibilidad con PostgreSQL, caché distribuida y escalado horizontal para 10.000 solicitudes/s.'
];

function useExamplePlaceholder(paused) {
 const [text, setText] = useState(promptExamples[0]);
 useEffect(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timeout;
  let index = 0;
  let length = promptExamples[0].length;
  let deleting = true;
  function tick() {
   const current = promptExamples[index];
   length += deleting ? -1 : 1;
   setText(current.slice(0, length));
   let delay = deleting ? 10 : 48;
   if (length === 0) {
    index = (index + 1) % promptExamples.length;
    deleting = false;
    delay = 350;
   } else if (length === current.length && !deleting) {
    deleting = true;
    delay = 2600;
   }
   timeout = window.setTimeout(tick, delay);
  }
  function restart() {
   window.clearTimeout(timeout);
   index = 0;
   length = promptExamples[0].length;
   deleting = true;
   setText(promptExamples[0]);
   if (!paused && !motion.matches) timeout = window.setTimeout(tick, 2600);
  }
  restart();
  motion.addEventListener('change', restart);
  return () => {
   window.clearTimeout(timeout);
   motion.removeEventListener('change', restart);
  };
 }, [paused]);
 return text;
}

const categories=['Todas','Autenticación','Bases de datos','Pagos','IA','Analítica','Búsqueda'];
const icons={'Autenticación':ShieldCheck,'Bases de datos':Database,'Pagos':CreditCard,'IA':BrainCircuit,'Analítica':ChartNoAxesCombined,'Búsqueda':SearchCheck};

function ToolCard({ tool, onOpen }) {
 const tiltRef = useCardTilt();
 const logo = `/assets/brands/${tool.name.toLowerCase()}.svg`;
 const detail = cardDetails[tool.name];
 const healthTone = detail.healthScore >= 80 ? 'good' : detail.healthScore >= 60 ? 'moderate' : 'low';
 const healthLabel = {good:'Salud alta',moderate:'Salud media',low:'Salud baja'}[healthTone];
 const brand = brandPalettes[tool.name] || defaultBrand;
 const extraTags = [...new Set(detail.extraTags || [])].filter(tag => ![tool.category, detail.tag, tool.language].includes(tag));
 const postgres = tool.name === 'PostgreSQL';
 const metrics = [
  ['Última versión', detail.version || 'Por confirmar'],
  ['Estrellas', tool.stars.toLocaleString('es-CL')],
  ['Issues abiertas', detail.openIssues.toLocaleString('es-CL')],
  ['Actividad', tool.activity],
  ['Licencia', tool.license]
 ];
 return <article data-tool-id={tool.id} onClick={e=>{if(!e.target.closest('a,button,summary,details')&&!window.getSelection()?.toString())onOpen(tool.id,e.currentTarget.querySelector('.detail-link'));}} ref={tiltRef} className="tool-card" aria-label={tool.name} style={{
  '--brand-start': brand.start, '--brand-end': brand.end, '--brand-tag': brand.tag
 }}>
  <div className="card-surface">
  <div className="tool-card-intro">
   {postgres ? <div className="card-watermark" aria-hidden="true"><img src="/assets/cards/postgres-watermark.svg" alt=""/></div> : <img className="brand-watermark" src={logo} alt="" aria-hidden="true"/>}
   <div className="tool-card-title">
    {postgres ? <div className="tool-logo"><img src="/assets/cards/postgres-logo.svg" alt=""/></div> : <img className={tool.name === 'Lago' ? 'brand-logo brand-wordmark' : 'brand-logo'} src={logo} alt=""/>}
    <h3 className={tool.name === 'Lago' ? 'sr-only' : undefined}>{tool.name}</h3>
   </div>
   <div className="tool-tags">
    <span>{tool.category}</span><span>{detail.tag}</span>
    <span className="language-tag" title="Lenguaje principal del repositorio">{tool.language}</span>
    {extraTags.length > 0 && <details className="tag-overflow">
     <summary aria-label={`Ver ${extraTags.length} etiquetas adicionales de ${tool.name}`}>+{extraTags.length}</summary>
     <ul aria-label="Etiquetas adicionales">{extraTags.map(tag=><li key={tag}>{tag}</li>)}</ul>
    </details>}
   </div>
   <p>{tool.description}</p>
  </div>
  <div className="tool-card-details">
   <div className="card-tech-summary">
   <span className={"health-score health-score--"+healthTone} role="img" aria-label={`Salud del repositorio: ${detail.healthScore} de 100`} title={`${healthLabel}. Puntuación ficticia de demostración; no representa una evaluación real del repositorio.`}>
    <Activity size={20} strokeWidth={1.75} className="health-icon" aria-hidden="true"/>
    <strong aria-hidden="true">{detail.healthScore}<span>/100</span></strong>
   </span>
   </div>
   <dl className="tool-metrics">{metrics.map(([label,value],index)=><React.Fragment key={label}>
    {index > 0 && <div className="metric-divider" aria-hidden="true"><img src="/assets/cards/divider.svg" alt=""/></div>}
    <div className="tool-metric"><dt>{label}</dt><dd>{value}</dd></div>
   </React.Fragment>)}</dl>
   <div className="tool-actions">
    <a className="detail-link" href={'#herramienta/'+tool.id} onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();onOpen(tool.id,e.currentTarget);}}} aria-label={'Ver detalle de '+tool.name}>Ver detalle <ArrowRight size={14}/></a>
    <a href={'https://github.com/'+tool.repo} target="_blank" rel="noopener noreferrer" aria-label={'Ver repositorio de '+tool.name+' (otra pestaña)'}>Repositorio ↗</a>
   </div>
  </div>
  <div className="card-glare" aria-hidden="true"/>
  </div>
 </article>;
}

const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function App(){
 const navigation=useToolNavigation();
 const isDetail=navigation.id!==null;
 const [query,setQuery]=useState(''),[error,setError]=useState(''),[phase,setPhase]=useState('idle'),[search,setSearch]=useState(''),[category,setCategory]=useState('Todas'),[filters,setFilters]=useState(false),[language,setLanguage]=useState(''),[license,setLicense]=useState(''),[maintenance,setMaintenance]=useState(''),[stars,setStars]=useState('');
 const [promptFocused, setPromptFocused] = useState(false);
 const placeholder = useExamplePlaceholder(isDetail || promptFocused || Boolean(query) || phase === 'loading');
 const input=useRef(null), timer=useRef(null);useEffect(()=>()=>clearTimeout(timer.current),[]);
 const filtered=tools.filter(t=>(category==='Todas'||t.category===category)&&normalize(t.name+' '+t.description).includes(normalize(search))&&(!language||t.language===language)&&(!license||t.license===license)&&(!maintenance||(maintenance==='active'?t.maintained:!t.maintained))&&t.stars>=Number(stars));
 const displayed=useAnimatedCatalog(filtered);
 usePageReveal([phase,filters,...displayed.map(t=>t.name)].join('|'));
 const active=[language,license,maintenance,stars].filter(Boolean).length;
 function clear(){setSearch('');setCategory('Todas');setLanguage('');setLicense('');setMaintenance('');setStars('');}
 function submit(e){e.preventDefault();if(!query.trim()){setError('Describe la aplicación que quieres construir para empezar.');input.current.focus();return;}setError('');setPhase('loading');timer.current=setTimeout(()=>setPhase('done'),1100);}
 return <><a href="#asistente" className="skip">Ir al contenido</a><header><div className="nav wrap"><a className="brand" href="#"><img className="openbridge-logo" src="/assets/brands/openbridge.svg" alt="OpenBridge"/></a><nav aria-label="Principal"><a href="#asistente" onClick={e=>{if(isDetail){e.preventDefault();navigation.toLanding('#asistente');}}}>Asistente</a><a href="#catalogo" onClick={e=>{if(isDetail){e.preventDefault();navigation.toLanding('#catalogo');}}}>Catálogo</a></nav></div></header>
 <main hidden={isDetail} id="landing-view"><section className="hero" id="asistente"><HeroLights inputRef={input}/><div className="hero-inner"><RevealHeading as="h1" text="¿Qué quieres construir?" mobileBreak/><p className="intro">Tu próxima aplicación empieza con las herramientas adecuadas.<br className="desktop-break"/> Describe tu idea y explora cómo conectarlas.</p>
 <form className={'composer '+(error?'invalid':'')} onSubmit={submit}><MetalBorder/><label htmlFor="prompt" className="sr-only">Describe tu aplicación</label><textarea ref={input} id="prompt" value={query} maxLength={3000} disabled={phase==='loading'} onChange={e=>{setQuery(e.target.value);setError('');}} placeholder={placeholder} onFocus={()=>setPromptFocused(true)} onBlur={()=>setPromptFocused(false)} aria-describedby="prompt-error" aria-invalid={!!error}/><div className="composer-footer"><button className="primary" disabled={phase==='loading'} type="submit">{phase==='loading'?<><LoaderCircle className="spin" size={17}/> Generando…</>:<>Generar propuesta <ArrowRight size={17}/></>}</button></div></form>
 <p id="prompt-error" className="error" role="alert">{error}</p>
 </div></section>
 <div className="catalog-shell"><div className="wrap"><div aria-live="polite" aria-busy={phase==='loading'}>{phase==='loading'&&<div className="loading"><LoaderCircle className="spin" size={18}/> Preparando la propuesta de demostración…</div>}{phase==='done'&&<section className="proposal"><div className="section-top"><div><RevealHeading text="Un estudio de yoga, conectado."/></div><button className="icon-button" aria-label="Cerrar propuesta" onClick={()=>setPhase('idle')}><X size={20}/></button></div><p>Esta respuesta fija ilustra el caso de reservas de yoga; no es un análisis de tu consulta.</p><div className="stack">{[['React','Interfaz y calendario'],['FastAPI','Reglas de reservas y cupos'],['PostgreSQL','Clases, horarios y reservas'],['Keycloak','Identidad y acceso']].map(([n,d])=><div key={n}><strong>{n}</strong><span>{d}</span></div>)}</div><div className="architecture">React <ArrowRight size={16}/> FastAPI <ArrowRight size={16}/> PostgreSQL</div><p className="small">Keycloak gestiona la identidad; la API valida permisos. Las transacciones y reglas de la aplicación deben impedir superar los cupos. Alojamiento propio, sin pagos en esta primera versión.</p><a className="text-link" href="#catalogo" onClick={()=>{clear();setSearch('PostgreSQL');}}>Explorar PostgreSQL en el catálogo <ArrowRight size={15}/></a></section>}</div>
 <section className="catalog" id="catalogo"><div className="section-top"><div><RevealHeading text="Explora el ecosistema open source"/></div></div>
 <div className="search-row"><div className="search-box"><Search size={19}/><label htmlFor="search" className="sr-only">Buscar herramientas</label><input id="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar herramientas por nombre o descripción…"/>{search&&<button className="icon-button" aria-label="Borrar búsqueda" onClick={()=>setSearch('')}><X size={16}/></button>}</div><button className={'filter-button '+(filters?'selected':'')} aria-expanded={filters} aria-controls="filters" onClick={()=>setFilters(!filters)}><SlidersHorizontal size={16}/> Filtros {active>0&&<span className="badge">{active}</span>}</button></div>
 <div className="categories" aria-label="Categorías">{categories.map(c=><button key={c} aria-pressed={category===c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
 {filters && (
  <div className="filters" id="filters">
   <label>Lenguaje
    <select value={language} onChange={e => setLanguage(e.target.value)}>
     <option value="">Todos</option>
     {Array.from(new Set(tools.map(tool => tool.language))).map(value => <option key={value} value={value}>{value}</option>)}
    </select>
   </label>
   <label>Licencia
    <select value={license} onChange={e => setLicense(e.target.value)}>
     <option value="">Todos</option>
     {Array.from(new Set(tools.map(tool => tool.license))).map(value => <option key={value} value={value}>{value}</option>)}
    </select>
   </label>
   <label>Mantenimiento
    <select value={maintenance} onChange={e => setMaintenance(e.target.value)}>
     <option value="">Todos</option><option value="active">Activo</option><option value="review">Por revisar</option>
    </select>
   </label>
   <label>Estrellas mínimas
    <select value={stars} onChange={e => setStars(e.target.value)}>
     <option value="">Sin mínimo</option><option value="10000">10.000</option><option value="20000">20.000</option><option value="50000">50.000</option>
    </select>
   </label>
  </div>
 )}
 <div className="results-meta"><span aria-live="polite">{filtered.length} {filtered.length===1?'herramienta':'herramientas'}{category!=='Todas'?' en '+category:''}</span>{(active>0||search||category!=='Todas')&&<button onClick={clear}>Limpiar filtros <X size={13}/></button>}</div>
 <div className="grid">{displayed.map(tool=><ToolCard key={tool.name} tool={tool} onOpen={navigation.open}/>)}</div>
 {filtered.length===0&&displayed.length===0&&<div className="empty"><Search size={30}/><h3>No encontramos coincidencias</h3><p>Prueba otro término o quita alguno de los filtros.</p><button onClick={clear} className="primary">Ver todas las herramientas</button></div>}
 </section><footer><a className="brand" href="#"><img className="openbridge-logo" src="/assets/brands/openbridge.svg" alt="OpenBridge"/></a><a href="#asistente">Volver al asistente <ArrowUpRight size={14}/></a></footer></div></div></main>{isDetail&&<ToolDetail id={navigation.id} onBack={navigation.back}/>}</>;
}
