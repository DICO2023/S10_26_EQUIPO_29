import React,{useState} from 'react';
import {Activity,ArrowLeft,ArrowUpRight,Copy,Check} from 'lucide-react';
import {tools,cardDetails,brandPalettes} from './tools';
import {profiles} from './toolProfiles';
function Snippet({text}){
 const [status,setStatus]=useState('');
 async function copy(){try{await navigator.clipboard.writeText(text);setStatus('Copiado');}catch{setStatus('No se pudo copiar. Selecciona el texto del ejemplo.');}}
 return <div className="snippet"><div><span>Ejemplo ilustrativo</span><button onClick={copy} aria-label="Copiar snippet">{status==='Copiado'?<Check size={15}/>:<Copy size={15}/>} {status==='Copiado'?'Copiado':'Copiar'}</button></div><pre tabIndex={0}><code>{text}</code></pre><span className="sr-only" role="status">{status}</span></div>;
}
export function ToolDetail({id,onBack}){
 const tool=tools.find(t=>t.id===id);
 if(!tool)return <main className="tool-detail detail-missing wrap"><h1 id="detail-title" tabIndex={-1}>Herramienta no encontrada</h1><p>Esta ficha no está disponible en el catálogo.</p><button className="detail-back" onClick={onBack}><ArrowLeft size={16}/> Volver al catálogo</button></main>;
 const detail=cardDetails[tool.name],profile=profiles[id],brand=brandPalettes[tool.name];
 const tone=detail.healthScore>=80?'good':detail.healthScore>=60?'moderate':'low';
 const logo=id==='postgresql'?'/assets/cards/postgres-logo.svg':`/assets/brands/${id}.svg`;
 return <main className="tool-detail" style={{'--brand-start':brand.start,'--brand-end':brand.end,'--brand-tag':brand.tag}}>
  <section className="detail-cover" data-tool-id={id} aria-label={`Portada de ${tool.name}`}>
   <img className="detail-watermark" src={id==='postgresql'?'/assets/cards/postgres-watermark.svg':logo} alt=""/>
   <div className="wrap detail-cover-inner"><button className="detail-back" onClick={onBack}><ArrowLeft size={16}/> Volver al catálogo</button>
   <div className="detail-identity"><img src={logo} alt=""/><h1 id="detail-title" tabIndex={-1}>{tool.name}</h1></div>
   <div className="tool-tags"><span>{tool.category}</span><span>{detail.tag}</span><span>{tool.language}</span></div><p>{tool.description}</p></div>
  </section>
  <div className="detail-body wrap">
   <div className="detail-overview"><section><h2>Acerca de {tool.name}</h2><p className="detail-summary">{profile.summary}</p><h3>Características principales</h3><ul className="detail-features">{profile.features.map(f=><li key={f}><Check size={16}/>{f}</li>)}</ul>
   <div className="detail-actions"><a href={`https://github.com/${tool.repo}`} target="_blank" rel="noopener noreferrer">Repositorio <ArrowUpRight size={16}/></a><a href={detail.docs} target="_blank" rel="noopener noreferrer">Documentación oficial <ArrowUpRight size={16}/></a></div></section>
   <aside className="detail-metrics" aria-label="Datos técnicos"><div className="detail-health"><h2>Salud del repositorio</h2><span className={`health-score health-score--${tone}`} role="img" aria-label={`Salud del repositorio: ${detail.healthScore} de 100`} title="Puntuación ficticia de demostración; no representa una evaluación real del repositorio."><Activity className="health-icon" size={20}/><strong>{detail.healthScore}<span>/100</span></strong></span></div>
   <dl>{[['Estrellas',tool.stars.toLocaleString('es-CL')],['Issues abiertas',detail.openIssues],['Actividad',tool.activity],['Mantenedor activo',tool.maintained?'Sí':'Por confirmar'],['Última versión',detail.version||'Por confirmar'],['Licencia',tool.license],['Lenguaje',tool.language]].map(([label,value])=><div key={label} title="Datos de la maqueta; pendientes de verificación con el repositorio."><dt>{label}</dt><dd>{value}</dd></div>)}</dl></aside></div>
   <section className="detail-integrations"><h2>Ideas de integración</h2><p>Patrones de referencia para conectar {tool.name} con tu arquitectura.</p>{profile.ideas.map((idea,i)=><article className="integration" key={idea.title}><div className="integration-heading"><span className="integration-number">0{i+1}</span><h3>{idea.title}</h3><span className="integration-difficulty">{idea.difficulty}</span></div><dl className="integration-facts">{[['Tipo',idea.type],['Stack compatible',idea.stack],['Dependencias',idea.dependencies],['Disparador',idea.trigger]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><Snippet text={idea.snippet}/><a className="integration-docs" href={detail.docs} target="_blank" rel="noopener noreferrer">Consultar documentación <ArrowUpRight size={15}/></a></article>)}</section>
   <footer><button className="detail-back" onClick={onBack}><ArrowLeft size={16}/> Volver al catálogo</button></footer>
  </div>
 </main>;
}
