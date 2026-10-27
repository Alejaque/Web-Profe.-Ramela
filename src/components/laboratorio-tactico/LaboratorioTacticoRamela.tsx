'use client';
import { dorado, blanco } from '@/components/IdentidadOficial';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react';
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, Award, BarChart3, BookOpen, BookmarkPlus, Box, Building2, CalendarDays, Camera,
  Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Circle, ClipboardList, Copy, Crosshair, Crown, Download, Edit3, Eraser,
  ExternalLink, FileDown, FileText, Film, Flame, FlipHorizontal2, Frame, Gauge, Globe2, Keyboard, Layers, Link2, ListFilter, Lock, Magnet, Maximize,
  MessageCircle, MonitorPlay, MousePointer2, Move3d, Orbit, Pause, Pencil, Play, Plus, Presentation, Printer, Redo2,
  RotateCcw, Route, Rows3, Ruler, Save, Search, Send, Settings2, Shapes, Share2, ShieldCheck, SkipBack, SkipForward, SlidersHorizontal,
  Sparkles, Spline, Square, Star, Table2, Tags, Timer, Trash2, Type, Undo2, Upload, Users, Volume2, VolumeX, Eye, Zap, ZoomIn, ZoomOut
} from 'lucide-react';


import { Tab, PlanTier, Audience, ClipSource, Tool, VideoWorkspaceTab, BoardWorkspaceTab, StrokeKind, TokenKind, BoardViewMode, EventTeam, EventOutcome, Clip, Marker, Playlist, CustomTagButton, MicroTask, MicroDay, Point, Stroke, Token, BoardSnapshot, BoardFrame, ReportData, PersistedState, STORAGE_KEY, WHATSAPP_NUMBER, SITE_URL, PHASES, SYSTEMS, CONCEPTS, MARKER_TAGS, TAG_GROUPS, EVENT_OUTCOMES, EVENT_ZONES, TAG_COLORS, TOKEN_CATALOG, TRIAL_DAYS, AUDIENCES, AUDIENCE_PROFILES, PLAN_NAMES, PlanPrice, RamelaLabConfig, DEFAULT_PLAN_PRICES, getPlanPrice, IS_SAMPLE_MODE, uid, clamp, formatTime, formatPreciseTime, trialDaysLeft, inferMarkerGroup, markerEnd, distanceBetween, distanceToSegment, strokeHit, getBeamRadius, StrokeBounds, getStrokeBounds, strokeKindLabel, getEditablePointIndices, simplifyPoints, limitPointCount, simplifyCurvePoints, smoothPath, wavyPath, fieldDistanceMeters, csvEscape, waLink, escapeHtml, downloadText, downloadUrl, getYouTubeId, sourceLabel, formationTokens, makeTasks, microTemplate, getDefaults, loadPersisted, interpolatePath, pointsToPath, StrokeShape, PitchLines, MiniPitch, TacticalSimulation } from "./LabShared";
import { VideoAnalyzer } from "./LabVideo";
import { TacticalBoard } from "./LabBoard";
interface MicroProps {
  data: MicroDay[];
  setData: React.Dispatch<React.SetStateAction<MicroDay[]>>;
  clips: Clip[];
  audience: Audience;
  setAudience: (audience: Audience) => void;
  showToast: (message: string) => void;
  openClip: (id: string) => void;
}

function MicrocyclePlanner({ data, setData, clips, audience, setAudience, showToast, openClip }: MicroProps) {
  const [selectedDayId, setSelectedDayId] = useState(data[0]?.id || '');
  const [newTask, setNewTask] = useState('');
  const selectedDay = data.find((day) => day.id === selectedDayId) || data[0];

  const updateDay = (id: string, patch: Partial<MicroDay>) => {
    setData((previous) => previous.map((day) => day.id === id ? { ...day, ...patch } : day));
  };

  const applyTemplate = (level: Audience) => {
    const next = microTemplate(level);
    setData(next);
    setSelectedDayId(next[0].id);
    setAudience(level);
    showToast(`Plantilla semanal ${level} cargada.`);
  };

  const addTask = () => {
    if (!selectedDay || !newTask.trim()) return;
    updateDay(selectedDay.id, { tasks: [...selectedDay.tasks, { id: uid('task'), text: newTask.trim(), done: false }] });
    setNewTask('');
  };

  if (!selectedDay) return null;
  const completed = selectedDay.tasks.filter((task) => task.done).length;

  return (
    <div className="module-stack">
      <div className="module-heading">
        <div>
          <span className="eyebrow"><CalendarDays size={16} /> Microciclo semanal</span>
          <h2>La semana ordenada según tu categoría</h2>
          <p>Cargá una plantilla, editá cada día, vinculá un clip y tildá tareas. Todo queda guardado automáticamente en este dispositivo.</p>
        </div>
        <a className="button secondary" href={`${SITE_URL}/planificador`} target="_blank" rel="noreferrer"><Sparkles size={16} /> Abrir Planificador IA actual <ExternalLink size={14} /></a>
      </div>

      <section className="panel template-bar">
        <div>
          <strong>Plantillas por categoría</strong>
          <p>No se planifica igual a un niño de 9 años que a un plantel de primera. La estructura cambia con un clic.</p>
        </div>
        <div className="segmented-control">
          {AUDIENCES.map((level) => (
            <button key={level} className={audience === level ? 'active' : ''} onClick={() => applyTemplate(level)}>
              {level === 'Primera' ? 'Primera / Profesional' : level}
            </button>
          ))}
        </div>
      </section>

      <div className="micro-grid">
        {data.map((day) => {
          const done = day.tasks.filter((task) => task.done).length;
          const pct = day.tasks.length ? Math.round((done / day.tasks.length) * 100) : 0;
          return (
            <button key={day.id} className={`micro-card ${selectedDay.id === day.id ? 'selected' : ''}`} onClick={() => setSelectedDayId(day.id)}>
              <span className="micro-top"><strong>{day.day}</strong><em>{day.code}</em></span>
              <span className="micro-title">{day.title}</span>
              <span className="micro-meta">{day.load} · {day.duration}</span>
              <span className="progress-track"><span style={{ width: `${pct}%` }} /></span>
              <small>{done}/{day.tasks.length} tareas · {pct}%</small>
            </button>
          );
        })}
      </div>

      <section className="panel micro-editor">
        <div className="micro-editor-grid">
          <div className="form-stack">
            <div className="panel-title-row"><h3>{selectedDay.day} · {selectedDay.code}</h3><span>{completed}/{selectedDay.tasks.length} tareas</span></div>
            <label className="field-label">Título de la sesión</label>
            <input value={selectedDay.title} onChange={(event) => updateDay(selectedDay.id, { title: event.target.value })} />
            <div className="filter-grid two">
              <div><label className="field-label">Código</label><input value={selectedDay.code} onChange={(event) => updateDay(selectedDay.id, { code: event.target.value })} /></div>
              <div><label className="field-label">Duración</label><input value={selectedDay.duration} onChange={(event) => updateDay(selectedDay.id, { duration: event.target.value })} /></div>
              <div><label className="field-label">Carga / intención</label><input value={selectedDay.load} onChange={(event) => updateDay(selectedDay.id, { load: event.target.value })} /></div>
              <div>
                <label className="field-label">Clip vinculado</label>
                <select value={selectedDay.clipId} onChange={(event) => updateDay(selectedDay.id, { clipId: event.target.value })}>
                  <option value="">Sin clip</option>
                  {clips.map((clip) => <option key={clip.id} value={clip.id}>{clip.title}</option>)}
                </select>
              </div>
            </div>
            <label className="field-label">Objetivo principal</label>
            <textarea className="textarea" rows={3} value={selectedDay.objective} onChange={(event) => updateDay(selectedDay.id, { objective: event.target.value })} />
            <label className="field-label">Notas para el cuerpo técnico</label>
            <textarea className="textarea" rows={3} value={selectedDay.notes} onChange={(event) => updateDay(selectedDay.id, { notes: event.target.value })} placeholder="Material, espacios, jugadores a observar, variante si llueve…" />
            {selectedDay.clipId && <button className="button secondary" onClick={() => openClip(selectedDay.clipId)}><Eye size={16} /> Abrir clip vinculado</button>}
          </div>

          <div>
            <h3 className="subsection-title"><ClipboardList size={18} /> Tareas de la sesión</h3>
            <div className="task-list">
              {selectedDay.tasks.map((task) => (
                <div className="task-item" key={task.id}>
                  <label>
                    <input type="checkbox" checked={task.done} onChange={(event) => updateDay(selectedDay.id, { tasks: selectedDay.tasks.map((item) => item.id === task.id ? { ...item, done: event.target.checked } : item) })} />
                    <span className={task.done ? 'done' : ''}>{task.text}</span>
                  </label>
                  <button onClick={() => updateDay(selectedDay.id, { tasks: selectedDay.tasks.filter((item) => item.id !== task.id) })}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <div className="inline-form">
              <input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTask()} placeholder="Nueva tarea: rondo, tarea principal, ABP…" />
              <button className="button primary" onClick={addTask}><Plus size={16} /></button>
            </div>
            <div className="micro-summary-card">
              <strong>Cómo se conecta con tu web</strong>
              <p>El Laboratorio ordena la semana y el video. Cuando necesites la sesión minuto a minuto, saltás al Planificador IA que ya vendés y volvés con el PDF/Excel.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ReportProps {
  report: ReportData;
  setReport: React.Dispatch<React.SetStateAction<ReportData>>;
  clips: Clip[];
  markers: Marker[];
  microcycle: MicroDay[];
  boardTitle: string;
  boardImage: string;
  showToast: (message: string) => void;
}

function ReportBuilder({ report, setReport, clips, markers, microcycle, boardTitle, boardImage, showToast }: ReportProps) {
  const selectedClip = clips.find((clip) => clip.id === report.clipId) || clips[0];
  const clipMarkers = selectedClip ? markers.filter((marker) => marker.clipId === selectedClip.id).sort((a, b) => a.time - b.time) : [];

  const patch = (next: Partial<ReportData>) => setReport((previous) => ({ ...previous, ...next }));

  const buildText = () => {
    const markerLines = clipMarkers.length
      ? clipMarkers.map((marker) => `- ${formatTime(marker.time)} · ${marker.label}: ${marker.note}`).join('\n')
      : '- Sin marcadores cargados.';
    const weekLines = microcycle.map((day) => `- ${day.day} (${day.code}): ${day.title} · ${day.duration}`).join('\n');
    return `PROFE. ALEJANDRO Ramela · LABORATORIO TÁCTICO\n${report.title}\nEquipo: ${report.team} · Categoría: ${report.category}\nRival/contexto: ${report.rival} · Fecha: ${report.date}\n\nOBJETIVO\n${report.objective}\n\nFORTALEZAS\n${report.strengths}\n\nA MEJORAR\n${report.improvements}\n\nPLAN DE ACCIÓN\n${report.plan}\n\nCLIP DE REFERENCIA\n${selectedClip ? `${selectedClip.title} (${selectedClip.concept})` : 'Sin clip'}\n${markerLines}\n\nSEMANA\n${weekLines}\n\nPIZARRA\n${boardTitle}\n\nGenerado en ramelafutbol.vercel.app`;
  };

  const buildHtml = () => {
    const markerHtml = clipMarkers.map((marker) => `<li><strong>${formatTime(marker.time)} · ${escapeHtml(marker.label)}:</strong> ${escapeHtml(marker.note)}</li>`).join('') || '<li>Sin marcadores cargados.</li>';
    const weekHtml = microcycle.map((day) => `<tr><td>${escapeHtml(day.day)}</td><td>${escapeHtml(day.code)}</td><td>${escapeHtml(day.title)}</td><td>${escapeHtml(day.duration)}</td></tr>`).join('');
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(report.title)}</title><style>
      body{font-family:Arial,sans-serif;color:#10233a;margin:0;background:#e8eef6}.page{max-width:900px;margin:24px auto;background:#fff;padding:42px;border-top:12px solid #00a8ff;box-shadow:0 8px 32px #10233a22}
      .brand{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #dbeafe;padding-bottom:18px}.brand h1{font-size:24px;margin:0;text-transform:uppercase}.brand p{color:#0284c7;font-weight:700;margin:4px 0}
      h2{font-size:23px;margin:26px 0 4px}h3{color:#0284c7;text-transform:uppercase;font-size:14px;letter-spacing:.08em;margin:26px 0 8px}p,li{line-height:1.55}.meta{color:#52657a}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.box{background:#f6f9fc;border:1px solid #dbeafe;padding:16px;border-radius:10px}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #dce6f2;padding:8px;text-align:left}img{width:100%;border-radius:10px;border:1px solid #dbeafe}.footer{margin-top:30px;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;padding-top:14px}@media print{body{background:#fff}.page{box-shadow:none;margin:0;max-width:none}}
    </style></head><body><main class="page">
      <div class="brand"><div><h1>Profe. Alejandro Ramela</h1><p>Laboratorio Táctico · Videoanálisis y planificación</p></div><div>${escapeHtml(report.date)}</div></div>
      <h2>${escapeHtml(report.title)}</h2><p class="meta"><strong>Equipo:</strong> ${escapeHtml(report.team)} · <strong>Categoría:</strong> ${escapeHtml(report.category)} · <strong>Rival/contexto:</strong> ${escapeHtml(report.rival)}</p>
      <h3>Objetivo</h3><p>${escapeHtml(report.objective)}</p>
      <div class="grid"><section class="box"><h3>Fortalezas</h3><p>${escapeHtml(report.strengths)}</p></section><section class="box"><h3>A mejorar</h3><p>${escapeHtml(report.improvements)}</p></section></div>
      <h3>Plan de acción</h3><p>${escapeHtml(report.plan)}</p>
      <h3>Clip de referencia</h3><p><strong>${escapeHtml(selectedClip?.title || 'Sin clip')}</strong>${selectedClip ? ` · ${escapeHtml(selectedClip.concept)} · ${escapeHtml(selectedClip.system)}` : ''}</p><ul>${markerHtml}</ul>
      <h3>Semana</h3><table><thead><tr><th>Día</th><th>Código</th><th>Sesión</th><th>Duración</th></tr></thead><tbody>${weekHtml}</tbody></table>
      <h3>Pizarra · ${escapeHtml(boardTitle)}</h3>${boardImage ? `<img src="${boardImage}" alt="Pizarra táctica">` : '<p>Adjuntá la pizarra desde el módulo Pizarra 2D con el botón “Usar en informe”.</p>'}
      <div class="footer">ramelafutbol.vercel.app · Profe. Alejandro Ramela · Fútbol Infantil, Juvenil y Primera</div>
    </main></body></html>`;
  };

  const printReport = () => {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=760');
    if (!popup) {
      showToast('El navegador bloqueó la ventana de impresión.');
      return;
    }
    popup.document.open();
    popup.document.write(buildHtml());
    popup.document.close();
    popup.focus();
    window.setTimeout(() => popup.print(), 450);
  };

  const copyReport = async () => {
    const text = buildText();
    try {
      await navigator.clipboard.writeText(text);
      showToast('Informe copiado al portapapeles.');
    } catch {
      downloadText('informe-Ramela.txt', text);
      showToast('No se pudo copiar; descargué el TXT.');
    }
  };

  return (
    <div className="module-stack">
      <div className="module-heading">
        <div>
          <span className="eyebrow"><FileText size={16} /> Informe táctico</span>
          <h2>Un informe claro para vos, tu cuerpo técnico o tu plantel</h2>
          <p>Combina objetivo, marcadores del video, semana de trabajo y pizarra. Imprimilo como PDF o compartilo por WhatsApp.</p>
        </div>
        <div className="heading-actions">
          <button className="button secondary" onClick={copyReport}><Copy size={16} /> Copiar</button>
          <button className="button primary" onClick={printReport}><Printer size={16} /> Imprimir / PDF</button>
        </div>
      </div>

      <div className="report-layout">
        <section className="panel form-stack">
          <label className="field-label">Título</label>
          <input value={report.title} onChange={(event) => patch({ title: event.target.value })} />
          <div className="filter-grid two">
            <div><label className="field-label">Equipo</label><input value={report.team} onChange={(event) => patch({ team: event.target.value })} /></div>
            <div><label className="field-label">Categoría</label><input value={report.category} onChange={(event) => patch({ category: event.target.value })} /></div>
            <div><label className="field-label">Rival / contexto</label><input value={report.rival} onChange={(event) => patch({ rival: event.target.value })} /></div>
            <div><label className="field-label">Fecha</label><input type="date" value={report.date} onChange={(event) => patch({ date: event.target.value })} /></div>
          </div>
          <label className="field-label">Objetivo</label>
          <textarea className="textarea" rows={3} value={report.objective} onChange={(event) => patch({ objective: event.target.value })} />
          <label className="field-label">Fortalezas</label>
          <textarea className="textarea" rows={3} value={report.strengths} onChange={(event) => patch({ strengths: event.target.value })} />
          <label className="field-label">A mejorar</label>
          <textarea className="textarea" rows={3} value={report.improvements} onChange={(event) => patch({ improvements: event.target.value })} />
          <label className="field-label">Plan de acción</label>
          <textarea className="textarea" rows={4} value={report.plan} onChange={(event) => patch({ plan: event.target.value })} />
          <label className="field-label">Clip de referencia</label>
          <select value={selectedClip?.id || ''} onChange={(event) => patch({ clipId: event.target.value })}>
            {clips.map((clip) => <option key={clip.id} value={clip.id}>{clip.title}</option>)}
          </select>
          <div className="button-row wrap">
            <button className="button whatsapp" onClick={() => window.open(waLink(buildText()), '_blank')}><Send size={16} /> Enviar a mi WhatsApp</button>
            <button className="button secondary" onClick={() => downloadText('informe-Ramela.txt', buildText())}><Download size={16} /> TXT</button>
            <button className="button secondary" onClick={() => downloadText('informe-Ramela.html', buildHtml(), 'text/html;charset=utf-8')}><Download size={16} /> HTML</button>
          </div>
          <p className="helper-text">Para PDF: tocá “Imprimir / PDF” y elegí “Guardar como PDF” en el destino de impresión.</p>
        </section>

        <section className="report-paper">
          <header>
            <div>
              <span>PROFE. ALEJANDRO Ramela</span>
              <p>Laboratorio Táctico</p>
            </div>
            <time>{report.date}</time>
          </header>
          <h3>{report.title}</h3>
          <p className="paper-meta"><strong>{report.team}</strong> · {report.category} · Rival/contexto: {report.rival}</p>
          <h4>Objetivo</h4><p>{report.objective}</p>
          <div className="paper-grid">
            <div><h4>Fortalezas</h4><p>{report.strengths}</p></div>
            <div><h4>A mejorar</h4><p>{report.improvements}</p></div>
          </div>
          <h4>Plan de acción</h4><p>{report.plan}</p>
          <h4>Clip y marcadores</h4>
          <p><strong>{selectedClip?.title || 'Sin clip'}</strong></p>
          <ul>{clipMarkers.map((marker) => <li key={marker.id}><strong>{formatTime(marker.time)} · {marker.label}:</strong> {marker.note}</li>)}</ul>
          <h4>Pizarra · {boardTitle}</h4>
          {boardImage ? <img src={boardImage} alt="Pizarra táctica adjunta" /> : <div className="paper-empty">Desde la Pizarra 2D, tocá “Usar en informe” para adjuntarla acá.</div>}
          <footer>ramelafutbol.vercel.app</footer>
        </section>
      </div>
    </div>
  );
}

interface PricingProps {
  planTier: PlanTier;
  trialStartedAt: string;
  activateDemo: (tier: PlanTier) => void;
  showToast: (message: string) => void;
}

function PricingPlans({ planTier, trialStartedAt, activateDemo }: PricingProps) {
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const daysLeft = trialDaysLeft(trialStartedAt);

  const plans: Array<{
    tier: PlanTier;
    name: string;
    audience: string;
    icon: React.ReactNode;
    monthly: Record<'ARS' | 'USD', number>;
    annual: Record<'ARS' | 'USD', number>;
    features: string[];
    highlight?: boolean;
  }> = [
    {
      tier: 'free', name: 'Prueba gratis', audience: '10 días con acceso completo tipo DT Pro, sin tarjeta', icon: <Zap size={22} />,
      monthly: { ARS: 0, USD: 0 }, annual: { ARS: 0, USD: 0 },
      features: ['VideoLab Pro completo por 10 días', 'Panel de etiquetado y telestración avanzada', 'Pizarras 2D y 3D con animación', 'Timeline, matriz y mapa zonal', 'Microciclo e informe profesional', 'Sin tarjeta para empezar']
    },
    {
      tier: 'pro', name: 'DT Pro', audience: 'Para el entrenador que analiza, diseña y planifica cada semana', icon: <Crown size={22} />,
      monthly: getPlanPrice('pro').monthly, annual: getPlanPrice('pro').annual, highlight: true,
      features: ['Clips, eventos y playlists ilimitados', 'Etiquetado con descriptores y botones propios', 'Telestración Pro + fotogramas con dibujos', 'Timeline por carriles, matriz y mapa de calor', 'Pizarra 2D/3D animada y biblioteca de materiales', 'Exportación CSV/XML/JSON, PNG y SVG']
    },
    {
      tier: 'staff', name: 'Cuerpo Técnico', audience: 'DT, ayudantes, PF, analista y entrenador de arqueros trabajando en equipo', icon: <Users size={22} />,
      monthly: getPlanPrice('staff').monthly, annual: getPlanPrice('staff').annual,
      features: ['Todo DT Pro', '5 usuarios del cuerpo técnico*', 'Espacios compartidos y comentarios por evento*', 'Presentaciones por línea, puesto y rival*', 'Plantillas comunes de etiquetado*', 'Prioridad de soporte']
    },
    {
      tier: 'club', name: 'Club', audience: 'Instituciones y academias con varias categorías y una misma metodología', icon: <Building2 size={22} />,
      monthly: getPlanPrice('club').monthly, annual: getPlanPrice('club').annual,
      features: ['Todo Cuerpo Técnico', 'Varias categorías, equipos y planteles*', 'Roles, permisos y metodología institucional*', 'Biblioteca común de pizarras y casos*', 'Capacitación de entrenadores', 'Acompañamiento de implementación']
    }
  ];

  const formatPrice = (value: number) => {
    if (!value) return '$0';
    return new Intl.NumberFormat(currency === 'ARS' ? 'es-AR' : 'en-US', {
      style: 'currency', currency, maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="module-stack">
      <div className="pricing-hero">
        <span className="eyebrow"><Crown size={16} /> {IS_SAMPLE_MODE ? 'Precios Pro para revisar' : 'Laboratorio Táctico Pro'}</span>
        <h2>Probá 10 días gratis. Después elegí tu nivel de trabajo.</h2>
        <p>Una suite profesional de videoanálisis, pizarras 2D/3D, planificación e informes. Empezás sin tarjeta con acceso completo y luego continuás como DT, cuerpo técnico o club.</p>
        <div className="pricing-controls">
          <div className="segmented-control">
            <button className={period === 'monthly' ? 'active' : ''} onClick={() => setPeriod('monthly')}>Mensual</button>
            <button className={period === 'annual' ? 'active' : ''} onClick={() => setPeriod('annual')}>Anual · 10% de descuento</button>
          </div>
          <div className="segmented-control">
            <button className={currency === 'ARS' ? 'active' : ''} onClick={() => setCurrency('ARS')}>Argentina · ARS</button>
            <button className={currency === 'USD' ? 'active' : ''} onClick={() => setCurrency('USD')}>Internacional · USD</button>
          </div>
        </div>
        <small>Argentina: DT Pro $40.000 · Cuerpo Técnico $70.000 · Club $90.000 por mes. El anual descuenta solo un 10% sobre 12 meses: $432.000, $756.000 y $972.000 (equivalente a $36.000, $63.000 y $81.000 por mes).</small>
      </div>

      <div className="pricing-grid four">
        {plans.map((plan) => {
          const price = period === 'monthly' ? plan.monthly[currency] : plan.annual[currency];
          const monthlyEquivalent = period === 'annual' && price ? Math.round(price / 12) : price;
          const current = planTier === plan.tier;
          return (
            <article key={plan.tier} className={`price-card ${plan.highlight ? 'highlight' : ''} ${current ? 'current' : ''}`}>
              {plan.highlight && <span className="recommended">Recomendado</span>}
              <div className="price-icon">{plan.icon}</div>
              <h3>{plan.name}</h3>
              <p>{plan.audience}</p>
              <div className="price-value">{formatPrice(price)}</div>
              <span className="priceperiod">{plan.tier === 'free' ? (daysLeft > 0 ? `10 días · te quedan ${daysLeft} en esta muestra` : '10 días · prueba finalizada en esta muestra') : price ? (period === 'monthly' ? 'por mes' : `por año · aprox. ${formatPrice(monthlyEquivalent)}/mes · 10% menos`) : 'sin tarjeta'}</span>
              <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul>
              {current && plan.tier === 'free' ? (
                daysLeft > 0
                  ? <button className="button secondary full" disabled><CheckCircle2 size={16} /> Prueba activa · {daysLeft} días</button>
                  : <button className="button primary full" onClick={() => activateDemo('free')}><Timer size={16} /> Reiniciar prueba de muestra</button>
              ) : current ? (
                <button className="button secondary full" disabled><CheckCircle2 size={16} /> Plan demo activo</button>
              ) : plan.tier === 'free' ? (
                <button className="button primary full" onClick={() => activateDemo('free')}><Timer size={16} /> Empezar prueba de 10 días</button>
              ) : (
                <div className="price-actions">
                  <button className="button primary full" onClick={() => activateDemo(plan.tier)}>Probar demo {plan.name}</button>
                  <a className="button ghost full" target="_blank" rel="noreferrer" href={waLink(`Hola Profe. Alejandro Ramela, quiero sumarme a la lista de lanzamiento del Laboratorio Táctico, plan ${plan.name} ${period === 'monthly' ? 'mensual' : 'anual'} (${currency}).`)}>Quiero este plan</a>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="strategy-grid">
        <article className="panel">
          <h3><Globe2 size={19} /> Crece con tu carrera</h3>
          <ul className="check-list">
            <li>Infantil, Juvenil y Primera con lenguaje y plantillas propias.</li>
            <li>Precios ARS para Argentina y USD para el exterior.</li>
            <li>La misma cuenta puede pasar de DT individual a cuerpo técnico o club.</li>
            <li>Se complementa con tus cursos, la Biblioteca y el Planificador IA.</li>
          </ul>
        </article>
        <article className="panel">
          <h3><ShieldCheck size={19} /> Prueba y continuidad</h3>
          <ul className="check-list">
            <li>10 días completos para analizar un partido real y preparar una semana.</li>
            <li>Mensual sin permanencia o anual con un descuento prudente del 10%.</li>
            <li>La versión en la nube sumará cuenta privada y videos guardados online.</li>
            <li>Tu trabajo y tus plantillas se conservan al pasar de plan.</li>
          </ul>
        </article>
        <article className="panel">
          <h3><Award size={19} /> Diferencial Alejandro Ramela</h3>
          <p>No es solo una app: es <strong>método + herramientas</strong>. La suscripción suma casos comentados por el Profe, plantillas por categoría y desafíos tácticos para seguir aprendiendo cada mes.</p>
        </article>
      </div>
      <p className="helper-text">* Las funciones colaborativas marcadas para Cuerpo Técnico/Club se activan en la etapa con cuentas y nube. En este MVP local se simula el nivel de acceso para probar límites y experiencia.</p>
    </div>
  );
}

const MANUAL_TEXT = `MANUAL DE USO · LABORATORIO TÁCTICO PRO · Prof. Alejandro Ramela
ramelafutbol.vercel.app

============================================================
1) EMPEZAR
============================================================
El Laboratorio Táctico une 5 módulos: Inicio, VideoLab Pro (videoanálisis),
Pizarras 2D/3D, Microciclo semanal e Informe. Sirve para entrenadores de
Infantil, Juvenil y Primera/Profesional, y complementa los cursos, la
Biblioteca de ejercicios y el Planificador IA de la web.

- Prueba gratis: 10 días con acceso completo, sin tarjeta.
- DT Pro: ARS 40.000/mes · Cuerpo Técnico: ARS 70.000/mes · Club: ARS 90.000/mes.
- Plan anual: 10% de descuento sobre 12 meses.
- Todo se guarda automáticamente en tu navegador (guardado local). Desde el
  Inicio podés Exportar un respaldo JSON, Importarlo en otra computadora o
  Restablecer el espacio de trabajo.
- Elegí tu categoría (Infantil / Juvenil / Primera) en el Inicio: cambian el
  enfoque y la plantilla del microciclo.

============================================================
2) LAS 6 REGLAS DE EDICIÓN (valen en VideoLab y en Pizarras)
============================================================
1. PUNTERO / EDITAR: es la herramienta para tocar lo ya dibujado. Tocá un
   dibujo y queda seleccionado, con un recuadro punteado y manijas.
2. MOVER: arrastrá el cuerpo del dibujo (cualquier parte que no sea una
   manija) y se mueve completo.
3. DEFORMAR: arrastrá los puntos blancos (extremos y vértices) para cambiar
   la forma: extremos de flechas, vértices de polígonos y puntos de control
   de curvas.
4. TAMAÑO: arrastrá la manija azul de la esquina inferior derecha para
   agrandar o achicar todo el dibujo. También hay botones Achicar/Agrandar
   en el inspector.
5. Escape: en cualquier momento, Escape cancela lo que estés haciendo y
   vuelve al Puntero, listo para otra acción.
6. BORRAR: hay 4 caminos. a) Botón Eliminar del inspector. b) Teclas
   Supr/Delete o Backspace con el dibujo seleccionado. c) Herramienta Borrar:
   tocá el dibujo. d) Deshacer para sacar el último trazo; Limpiar borra todos.

En el video: tocar la pantalla con el Puntero (o con cualquier herramienta
de dibujo) PAUSA el video automáticamente, para editar sobre el cuadro
congelado. Un toque sobre el video cuando está en pausa lo vuelve a
reproducir; las herramientas de dibujo mantienen la pausa.

============================================================
3) EL CILINDRO DE LUZ (resaltar un jugador)
============================================================
Es una columna vertical translúcida que envuelve al jugador, con elipse en
el suelo y en la parte superior. Está en Dibujar (VideoLab y Pizarras).

- Crear: arrastrá desde arriba hasta los pies del jugador (así definís la
  altura) o tocá directamente al jugador para una luz automática.
- Queda seleccionado al instante:
  · Punto de abajo (pies): mueve todo el cilindro.
  · Punto de arriba: cambia la altura.
  · Punto amarillo del costado: cambia el ancho.
  · Manija azul de la esquina: escala todo.
- En el inspector: Intensidad de luz, Ancho y Altura con deslizadores finos.
- Color: con las muestras de color cambiás el tinte de la luz.

============================================================
4) POLÍGONOS, CURVAS Y ÁNGULOS
============================================================
POLÍGONO (zona libre): cada toque agrega un vértice. Para cerrarlo: botón
"Cerrar polígono", tecla Enter o doble clic. Backspace borra el último
vértice; "Cancelar polígono" descarta todo; Escape cancela y vuelve al
Puntero. Ya cerrado, se borra como cualquier dibujo (Puntero + Eliminar /
Supr / herramienta Borrar). Para editarlo: Puntero + arrastrar vértices,
"Agregar punto" inserta un vértice en el lado más largo y "Borrar punto
elegido" quita el vértice seleccionado (mínimo 3).

CURVA: dibujá a mano alzada; al soltar, queda reducida a pocos puntos de
control editables. Con el Puntero arrastrá cada punto para curvarla a
gusto. "Dejar puntos editables" vuelve a simplificar una curva vieja.

ÁNGULO: tocá 3 puntos en orden: extremo, vértice, extremo. Muestra los
grados. Backspace corrige el último punto.

============================================================
5) VIDEOLAB PRO · SOLAPA POR SOLAPA
============================================================
El video queda siempre visible; cada solapa muestra al lado solo las
herramientas de ese trabajo.

A) ETIQUETAR (codificación rápida)
- Cargá el video: demo, archivo MP4 de tu equipo o enlace de YouTube.
- Botones por categoría (ataque, defensa, transiciones, balón parado,
  etc.) y descriptores (jugador, zona, resultado). Cada toque crea un
  marcador en el segundo actual.
- Recorte IN/OUT: con I y O o los botones definís inicio y fin del clip,
  con margen (lead/lag) ajustable y reproducción en bucle del tramo.
- Controles: play/pausa, cuadro a cuadro, velocidades (0.25x a 2x), zoom
  del reproductor y pantalla completa.

B) DIBUJAR (telestración)
- 18 herramientas: Puntero/editar, Libre, Flecha, Curva, Línea, Carrera,
  Pase, Zona, Rectángulo, Elipse, Cilindro de luz, Foco de suelo,
  Polígono, Texto, Medir, Ángulo, Vínculo entre jugadores y Borrar.
- Estilo: color, grosor, opacidad, relleno, punteado y sombra/brillo.
- Duración del dibujo: podés hacer que aparezca solo entre dos segundos.
- Todo dibujo nuevo queda seleccionado para ajustarlo en el acto.
- Captura PNG del cuadro con los dibujos para compartir.

C) EVENTOS
- Lista completa de marcadores: editar titulo, categoría, descriptores,
  tiempos IN/OUT y notas. Buscar y filtrar por categoría o texto.
- Cada evento reproduce su clip con un toque.

D) TIMELINE
- Línea de tiempo con zoom y carriles por categoría; los eventos que se
  superponen se reparten en subcarriles. Tocá un evento para ir a verlo.

E) DATOS
- Estadísticas por categoría, matriz de cruces (qué sigue a qué) y
  comparador A/B de dos momentos. Exportar CSV, XML o JSON.

F) MAPA DE CALOR
- Marcá sobre la cancha dónde ocurrieron las acciones y mirá el mapa de
  calor / zonas más usadas.

G) PRESENTAR
- Armadas de presentación: ordená clips en una playlist y reproducila de
  corrido para la charla con el plantel, con los dibujos visibles.

H) CLIPS
- Biblioteca de clips y casos cargados: abrir, renombrar, duplicar,
  eliminar y ver cuántos marcadores y dibujos tiene cada uno.

============================================================
6) PIZARRAS 2D + 3D · SOLAPA POR SOLAPA
============================================================
La pizarra queda fija; al costado cambia el panel de cada tarea. La vista
puede ser 2D, 3D o 2D+3D sincronizadas: es la MISMA pizarra, todo lo que
hagas en una se ve en la otra.

A) DIBUJAR / LUZ: las mismas 18 herramientas del video (puntero, cilindro
   de luz, curvas por puntos, polígonos, texto, medir, ángulos, vínculos)
   más estilo de trazo, deshacer/rehacer y limpiar.
B) ELEMENTOS: jugadores propios y rivales, arqueros, comodines, DT,
   pelotas, conos, platos, aros, vallas, escalera, estacas, banderines,
   maniquíes, mini arcos y arcos. Todo elemento se arrastra y en el
   Inspector se cambia tamaño, rotación, etiqueta y color.
C) SISTEMAS: formaciones 4-3-3, 4-2-3-1, 4-4-2, 3-5-2 y 5-3-2 para un
   equipo o ambos; plantillas de ejercicios (rondo, posesión, salida,
   finalización, circuito) y opciones de cancha (tema, tercios, carriles,
   grilla, ajuste a grilla y foto de fondo).
D) ANIMACIÓN: guardá "momentos" (foto 1, foto 2, foto 3) y reproducí la
   secuencia: las fichas y los trazos se mueven entre momentos. Control de
   velocidad incluido.
E) CÁMARA 3D: giro (yaw), inclinación (pitch) y zoom; modo Orbitar
   arrastrando; rotación automática; vistas rápidas y diseño preciso en 2D.
   En 3D podés seleccionar y mover; la edición fina de puntos se hace en 2D.
F) INSPECTOR / GUARDADAS: todo lo seleccionado se ajusta acá (color,
   grosor, relleno, texto, tamaño, puntos, duplicar, eliminar, traer al
   frente / enviar atrás). Guardá y cargá pizarras; exportá PNG o SVG;
   prepará el envío por WhatsApp (primero descargá el PNG y adjuntalo).

============================================================
7) MICROCICLO
============================================================
Semana de trabajo por días, con plantilla según categoría (Infantil,
Juvenil o Primera). Cada día: objetivo, contenido, tareas con tilde de
cumplido y clip vinculado del VideoLab. Ideal para bajar el análisis del
partido a la práctica.

============================================================
8) INFORME
============================================================
Armá el informe del partido o de la semana: titulo, rival, fecha,
observaciones,a los marcadores clave, foto de la pizarra y resumen del
microciclo. Botón imprimir / guardar PDF desde el navegador y envío por
WhatsApp.

============================================================
9) ATAJOS DE TECLADO
============================================================
VideoLab:
- Espacio o K: reproducir / pausar.  J: -5 s.  L: +5 s.
- Flechas izquierda/derecha: cuadro anterior / siguiente.
- I: marcar IN.  O: marcar OUT.
- En Dibujar: Enter cierra el polígono; Backspace borra el último vértice
  o el dibujo seleccionado; Supr/Delete elimina la selección;
  Escape vuelve al Puntero.
Pizarras:
- Enter cierra el polígono; Backspace borra el último vértice o la
  selección; Supr/Delete elimina trazo o elemento seleccionado;
  Escape vuelve al Puntero.
(Hacé clic una vez sobre el módulo para que reciba el teclado.)

============================================================
10) TRES FLUJOS DE TRABAJO LISTOS
============================================================
A) ANALIZAR UN GOL Y MOSTRARLO AL PLANTEL
1. VideoLab > Clips: cargá el partido. 2. Etiquetar: marcá la jugada con
IN/OUT. 3. Dibujar: pausá tocando el video, poné el cilindro de luz sobre
el jugador clave, una flecha para el desmarque y un texto corto.
4. Presentar: sumá el clip a una playlist y reproducilo en la charla.

B) DEL VIDEO A LA PIZARRA
1. En el video encontrás el problema (ej.: espacio entre líneas).
2. Pizarras > Sistemas: cargá la formación. 3. Dibujar: marcá la zona con
un polígono y la solución con flechas curvas. 4. Animación: guardá 2 o 3
momentos y mostralo en 3D. 5. Exportá el PNG para el grupo.

C) PREPARAR LA SEMANA
1. Microciclo: cargá la plantilla de tu categoría. 2. Vinculá a cada día
el clip que justifica el trabajo. 3. Informe: cerrá con el resumen para
el cuerpo técnico o la dirigencia.

============================================================
11) PROBLEMAS FRECUENTES
============================================================
- "Dibujo y no puedo moverlo": activá el Puntero (o presioná Escape) y
  tocá el dibujo. Con una herramienta de dibujo activa, cada toque crea.
- "El video sigue andando mientras dibujo": al tocar la pantalla se pausa
  solo. Si estabas con el Puntero y tocás de nuevo en vacío, alterna
  play/pausa; con herramientas de dibujo queda pausado.
- "No me cierra el polígono": necesitás 3 vértices o más; cerrá con el
  botón, Enter o doble clic.
- "La curva tiene demasiados puntos": queda simplificada sola; si es
  vieja, usá "Dejar puntos editables" en el inspector.
- "La luz tapa al jugador": bajá la Intensidad o achicá el ancho con el
  punto amarillo.
- "Perdí mi trabajo": se guarda solo en el navegador. Para respaldo,
  Inicio > Exportar JSON. Las cuentas y la nube llegan con la versión paga.

© 2026 Profe. Alejandro Ramela · Laboratorio Táctico Pro.
`;

interface ManualProps {
  goTab: (tab: Tab) => void;
  showToast: (message: string) => void;
}

function UserManual({ goTab, showToast }: ManualProps) {
  const downloadManual = () => {
    const blob = new Blob([MANUAL_TEXT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Manual_Laboratorio_Tactico_Ramela.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Manual descargado en formato TXT.');
  };

  const indexItems: Array<[string, string]> = [
    ['manual-empezar', '1 · Empezar'],
    ['manual-edicion', '2 · Reglas de edición'],
    ['manual-cilindro', '3 · Cilindro de luz'],
    ['manual-formas', '4 · Polígonos y curvas'],
    ['manual-videolab', '5 · VideoLab solapa por solapa'],
    ['manual-pizarras', '6 · Pizarras solapa por solapa'],
    ['manual-microciclo', '7 · Microciclo'],
    ['manual-informe', '8 · Informe'],
    ['manual-atajos', '9 · Atajos de teclado'],
    ['manual-flujos', '10 · Flujos de trabajo'],
    ['manual-problemas', '11 · Problemas frecuentes']
  ];

  return (
    <div className="module-stack manual-shell">
      <div className="module-heading">
        <div>
          <span className="eyebrow"><BookOpen size={16} /> Manual de uso</span>
          <h2>Todas las herramientas, explicadas paso a paso</h2>
          <p>Cómo analizar video, dibujar, editar cada objeto ya colocado, usar el cilindro de luz, trabajar las pizarras 2D/3D, armar el microciclo y cerrar el informe.</p>
        </div>
        <div className="heading-actions">
          <button className="button secondary" onClick={downloadManual}><FileDown size={16} /> Descargar manual (TXT)</button>
          <button className="button primary" onClick={() => goTab('analyzer')}><MonitorPlay size={16} /> Ir a practicar</button>
        </div>
      </div>

      <nav className="manual-index" aria-label="Índice del manual">
        {indexItems.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <section id="manual-empezar" className="panel manual-section">
        <h3><span>1</span> Empezar</h3>
        <p>El Laboratorio une <strong>VideoLab Pro</strong>, <strong>Pizarras 2D/3D</strong>, <strong>Microciclo</strong> e <strong>Informe</strong>, y complementa los cursos, la Biblioteca y el Planificador IA de la web. Sirve igual para Infantil, Juvenil y Primera.</p>
        <ul className="check-list">
          <li><strong>Prueba gratis de 10 días</strong> con acceso completo, sin tarjeta. Después: DT Pro $40.000/mes · Cuerpo Técnico $70.000/mes · Club $90.000/mes · anual con 10% de descuento.</li>
          <li>Todo se <strong>guarda automáticamente</strong> en este navegador. En el Inicio podés <strong>Exportar/Importar</strong> un respaldo JSON o <strong>Restablecer</strong>.</li>
          <li>Elegí tu <strong>categoría</strong> en el Inicio: cambia el enfoque y la plantilla del microciclo.</li>
        </ul>
      </section>

      <section id="manual-edicion" className="panel manual-section">
        <h3><span>2</span> Las 6 reglas de edición (VideoLab y Pizarras)</h3>
        <div className="manual-cards">
          <article><strong><MousePointer2 size={17} /> 1 · PUNTERO</strong><p>Tocá cualquier dibujo ya colocado y queda seleccionado con recuadro y manijas.</p></article>
          <article><strong><Move3d size={17} /> 2 · MOVER</strong><p>Arrastrá el cuerpo del dibujo para reubicarlo completo.</p></article>
          <article><strong><Spline size={17} /> 3 · DEFORMAR</strong><p>Arrastrá los puntos blancos: extremos, vértices y puntos de control de curvas.</p></article>
          <article><strong><Maximize size={17} /> 4 · TAMAÑO</strong><p>Manija azul de la esquina, o botones Achicar/Agrandar del inspector.</p></article>
          <article><strong><Keyboard size={17} /> 5 · ESCAPE</strong><p>Escape cancela lo que estés haciendo y vuelve al Puntero, listo para otra acción.</p></article>
          <article><strong><Trash2 size={17} /> 6 · BORRAR</strong><p>Botón Eliminar del inspector · Supr/Delete · herramienta Borrar tocando el dibujo · Deshacer el último · Limpiar todo.</p></article>
        </div>
        <p className="manual-note"><Pause size={16} /> <strong>En el video:</strong> tocar la pantalla con el Puntero —o con cualquier herramienta de dibujo— <strong>pausa el video automáticamente</strong> para editar sobre el cuadro congelado. Con el Puntero en pausa, un toque en zona vacía vuelve a reproducir; las herramientas de dibujo mantienen la pausa.</p>
      </section>

      <section id="manual-cilindro" className="panel manual-section">
        <h3><span>3</span> El cilindro de luz sobre un jugador</h3>
        <p>Es la <strong>columna vertical translúcida</strong> que envuelve al jugador, con elipse en el suelo y arriba. Está en la solapa <strong>Dibujar</strong> de VideoLab y de Pizarras (botón rayo).</p>
        <ol className="manual-steps">
          <li><strong>Crear:</strong> arrastrá desde arriba hasta los pies del jugador (definís la altura) o tocá directamente al jugador para una luz automática.</li>
          <li><strong>Mover:</strong> arrastrá el punto de los pies o el cuerpo del cilindro.</li>
          <li><strong>Altura:</strong> arrastrá el punto superior.</li>
          <li><strong>Ancho:</strong> arrastrá el punto <span className="dot-yellow" /> amarillo del costado.</li>
          <li><strong>Ajuste fino:</strong> en el inspector, Intensidad de luz, Ancho y Altura con deslizadores. El color cambia el tinte.</li>
        </ol>
      </section>

      <section id="manual-formas" className="panel manual-section">
        <h3><span>4</span> Polígonos, curvas y ángulos</h3>
        <ul className="check-list">
          <li><strong>Polígono:</strong> cada toque agrega un vértice. Cerrá con el botón <em>Cerrar polígono</em>, la tecla <strong>Enter</strong> o <strong>doble clic</strong>. <strong>Backspace</strong> borra el último vértice; <em>Cancelar</em> descarta; <strong>Escape</strong> cancela y vuelve al Puntero. Para borrarlo ya cerrado: Puntero → tocarlo → Eliminar (o Supr).</li>
          <li><strong>Editar polígono:</strong> arrastrá vértices; <em>Agregar punto</em> inserta uno en el lado más largo; <em>Borrar punto elegido</em> quita el seleccionado (mínimo 3).</li>
          <li><strong>Curva:</strong> dibujá a mano alzada; al soltar queda con pocos puntos de control. Arrastrá cada punto para curvarla. <em>Dejar puntos editables</em> simplifica una curva vieja.</li>
          <li><strong>Ángulo:</strong> 3 toques en orden extremo → vértice → extremo; muestra los grados.</li>
        </ul>
      </section>

      <section id="manual-videolab" className="panel manual-section">
        <h3><span>5</span> VideoLab Pro · solapa por solapa</h3>
        <p>El video queda siempre visible; cada solapa muestra al lado solo las herramientas de ese trabajo.</p>
        <div className="manual-cards">
          <article><strong><Tags size={17} /> Etiquetar</strong><p>Botones por categoría y descriptores; cada toque crea un marcador. Recorte IN/OUT con margen, cuadro a cuadro y velocidades.</p></article>
          <article><strong><Pencil size={17} /> Dibujar</strong><p>18 herramientas de telestración con estilo completo. Todo dibujo nuevo queda seleccionado. Captura PNG del cuadro.</p></article>
          <article><strong><ListFilter size={17} /> Eventos</strong><p>Lista de marcadores: título, categoría, tiempos y notas, con búsqueda y filtros. Un toque reproduce el clip.</p></article>
          <article><strong><Timer size={17} /> Timeline</strong><p>Línea de tiempo con zoom y carriles por categoría; los solapados se separan en subcarriles.</p></article>
          <article><strong><BarChart3 size={17} /> Datos</strong><p>Estadísticas, matriz de cruces y comparador A/B. Exportá CSV, XML o JSON.</p></article>
          <article><strong><Flame size={17} /> Mapa de calor</strong><p>Marcá en la cancha dónde pasaron las acciones y mirá las zonas calientes.</p></article>
          <article><strong><Presentation size={17} /> Presentar</strong><p>Playlists de clips con dibujos para reproducir de corrido en la charla.</p></article>
          <article><strong><Film size={17} /> Clips</strong><p>Biblioteca de casos: video demo, MP4 propio o YouTube. Abrir, renombrar, duplicar y eliminar.</p></article>
        </div>
      </section>

      <section id="manual-pizarras" className="panel manual-section">
        <h3><span>6</span> Pizarras 2D + 3D · solapa por solapa</h3>
        <p>Es <strong>la misma pizarra</strong> en 2D y en 3D: lo que hacés en una vista se refleja en la otra. En 3D seleccionás y movés; la edición fina de puntos se hace en 2D.</p>
        <div className="manual-cards">
          <article><strong><Pencil size={17} /> Dibujar / Luz</strong><p>Las 18 herramientas: puntero, libre, flecha, curva por puntos, línea, carrera, pase, zona, rectángulo, elipse, cilindro de luz, foco, polígono, texto, medir, ángulo, vínculo y borrar.</p></article>
          <article><strong><Shapes size={17} /> Elementos</strong><p>Jugadores, arqueros, comodines, DT, pelotas, conos, platos, aros, vallas, escalera, estacas, banderines, maniquíes, mini arcos y arcos.</p></article>
          <article><strong><Users size={17} /> Sistemas</strong><p>4-3-3, 4-2-3-1, 4-4-2, 3-5-2 y 5-3-2; plantillas de ejercicios y opciones de cancha (tema, tercios, carriles, grilla, foto de fondo).</p></article>
          <article><strong><Film size={17} /> Animación</strong><p>Guardá momentos y reproducí la secuencia: fichas y trazos se mueven entre fotos, con control de velocidad.</p></article>
          <article><strong><Orbit size={17} /> Cámara 3D</strong><p>Giro, inclinación y zoom; orbitar arrastrando; rotación automática y vistas rápidas.</p></article>
          <article><strong><Settings2 size={17} /> Inspector / Guardadas</strong><p>Color, grosor, relleno, texto, tamaño, rotación, puntos, duplicar, eliminar, capas. Guardá pizarras y exportá PNG/SVG o WhatsApp.</p></article>
        </div>
      </section>

      <section id="manual-microciclo" className="panel manual-section">
        <h3><span>7</span> Microciclo semanal</h3>
        <p>La semana día por día con plantilla según categoría. Cada día tiene objetivo, contenido, tareas con tilde y un <strong>clip vinculado</strong> del VideoLab: así el análisis del partido baja directo a la práctica.</p>
      </section>

      <section id="manual-informe" className="panel manual-section">
        <h3><span>8</span> Informe</h3>
        <p>Armá el informe del partido o de la semana con los marcadores clave, la foto de la pizarra (botón <em>Usar en informe</em> dentro de Pizarras) y el resumen del microciclo. Imprimí o guardá PDF desde el navegador y compartí por WhatsApp.</p>
      </section>

      <section id="manual-atajos" className="panel manual-section">
        <h3><span>9</span> Atajos de teclado</h3>
        <div className="manual-shortcuts">
          <div><kbd>Espacio</kbd> / <kbd>K</kbd><span>Reproducir / pausar</span></div>
          <div><kbd>J</kbd> / <kbd>L</kbd><span>−5 s / +5 s</span></div>
          <div><kbd>←</kbd> / <kbd>→</kbd><span>Cuadro anterior / siguiente</span></div>
          <div><kbd>I</kbd> / <kbd>O</kbd><span>Marcar IN / OUT</span></div>
          <div><kbd>Enter</kbd><span>Cerrar polígono</span></div>
          <div><kbd>Backspace</kbd><span>Borrar último vértice o selección</span></div>
          <div><kbd>Supr</kbd><span>Eliminar dibujo o elemento seleccionado</span></div>
          <div><kbd>Escape</kbd><span>Cancelar y volver al Puntero</span></div>
        </div>
        <p className="manual-note">Hacé clic una vez sobre el módulo para que reciba el teclado. Los atajos no actúan mientras escribís en un campo de texto.</p>
      </section>

      <section id="manual-flujos" className="panel manual-section">
        <h3><span>10</span> Tres flujos de trabajo listos</h3>
        <div className="manual-cards">
          <article><strong>A · Analizar un gol y mostrarlo</strong><ol className="manual-steps"><li>Clips: cargá el partido.</li><li>Etiquetar: recortá con IN/OUT.</li><li>Dibujar: tocá el video (se pausa), cilindro de luz al jugador clave, flecha al desmarque y texto corto.</li><li>Presentar: playlist y a la charla.</li></ol></article>
          <article><strong>B · Del video a la pizarra</strong><ol className="manual-steps"><li>Detectás el problema en el video.</li><li>Sistemas: cargá la formación.</li><li>Polígono para la zona y curvas para la solución.</li><li>Animación en 2D/3D y PNG para el grupo.</li></ol></article>
          <article><strong>C · Preparar la semana</strong><ol className="manual-steps"><li>Microciclo: plantilla de tu categoría.</li><li>Vinculá un clip a cada día.</li><li>Informe: resumen para el cuerpo técnico.</li></ol></article>
        </div>
      </section>

      <section id="manual-problemas" className="panel manual-section">
        <h3><span>11</span> Problemas frecuentes</h3>
        <ul className="check-list">
          <li><strong>“No puedo mover un dibujo”</strong> → activá el Puntero o presioná Escape y tocá el dibujo. Con una herramienta de dibujo activa, cada toque crea.</li>
          <li><strong>“El video sigue andando”</strong> → al tocar la pantalla se pausa solo. Con el Puntero en pausa, un toque en vacío alterna play/pausa.</li>
          <li><strong>“No cierra el polígono”</strong> → necesitás 3+ vértices; cerrá con el botón, Enter o doble clic.</li>
          <li><strong>“La curva no se deja curvar”</strong> → seleccionala con el Puntero y arrastrá sus puntos; si es vieja, <em>Dejar puntos editables</em>.</li>
          <li><strong>“La luz tapa al jugador”</strong> → bajá la Intensidad o achicá el ancho con el punto amarillo.</li>
          <li><strong>“Cambié de computadora”</strong> → Inicio → Exportar JSON allá, Importar acá. Cuentas y nube llegan con la versión paga.</li>
        </ul>
        <div className="button-row wrap">
          <button className="button secondary" onClick={downloadManual}><FileDown size={16} /> Descargar este manual (TXT)</button>
          <button className="button secondary" onClick={() => goTab('board')}><Box size={16} /> Ir a las Pizarras</button>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [initial] = useState<PersistedState>(loadPersisted);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [planTier, setPlanTier] = useState<PlanTier>(initial.planTier);
  const [audience, setAudience] = useState<Audience>(initial.audience);
  const [clips, setClips] = useState<Clip[]>(initial.clips);
  const [markers, setMarkers] = useState<Marker[]>(initial.markers);
  const [playlists, setPlaylists] = useState<Playlist[]>(initial.playlists);
  const [selectedClipId, setSelectedClipId] = useState(initial.selectedClipId);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(initial.selectedPlaylistId);
  const [microcycle, setMicrocycle] = useState<MicroDay[]>(initial.microcycle);
  const [boardTitle, setBoardTitle] = useState(initial.boardTitle);
  const [trialStartedAt, setTrialStartedAt] = useState(initial.trialStartedAt);
  const [boardTokens, setBoardTokens] = useState<Token[]>(initial.boardTokens);
  const [boardStrokes, setBoardStrokes] = useState<Stroke[]>(initial.boardStrokes);
  const [boardFrames, setBoardFrames] = useState<BoardFrame[]>(initial.boardFrames);
  const [snapshots, setSnapshots] = useState<BoardSnapshot[]>(initial.snapshots);
  const [annotations, setAnnotations] = useState<Record<string, Stroke[]>>(initial.annotations);
  const [customTagButtons, setCustomTagButtons] = useState<CustomTagButton[]>(initial.customTagButtons);
  const [report, setReport] = useState<ReportData>(initial.report);
  const [reportBoardImage, setReportBoardImage] = useState('');
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3600);
  };

  useEffect(() => {
    const state: PersistedState = {
      planTier, trialStartedAt, audience, clips, markers, playlists, selectedClipId, selectedPlaylistId,
      microcycle, boardTitle, boardTokens, boardStrokes, boardFrames, snapshots, annotations, customTagButtons, report
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Si el almacenamiento está lleno, el MVP sigue funcionando en memoria.
    }
  }, [planTier, trialStartedAt, audience, clips, markers, playlists, selectedClipId, selectedPlaylistId, microcycle, boardTitle, boardTokens, boardStrokes, boardFrames, snapshots, annotations, customTagButtons, report]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const goTab = (tab: Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activateDemo = (tier: PlanTier) => {
    setPlanTier(tier);
    if (tier === 'free') {
      setTrialStartedAt(new Date().toISOString());
      showToast('Prueba gratis de 10 días activada con acceso completo tipo DT Pro.');
    } else {
      showToast(`Demo local ${PLAN_NAMES[tier]} activada para probar sin límites.`);
    }
  };

  const exportWorkspace = () => {
    const state: PersistedState = {
      planTier, trialStartedAt, audience, clips, markers, playlists, selectedClipId, selectedPlaylistId,
      microcycle, boardTitle, boardTokens, boardStrokes, boardFrames, snapshots, annotations, customTagButtons, report
    };
    downloadText('laboratorio-tactico-Ramela-respaldo.json', JSON.stringify(state, null, 2), 'application/json;charset=utf-8');
    showToast('Respaldo JSON descargado.');
  };

  const importWorkspace = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as PersistedState;
      if (!Array.isArray(parsed.clips) || !Array.isArray(parsed.microcycle)) throw new Error('Formato inválido');
      setPlanTier(parsed.planTier || 'free');
      setTrialStartedAt(parsed.trialStartedAt || new Date().toISOString());
      setAudience(parsed.audience || 'Juvenil');
      setClips(parsed.clips);
      setMarkers(parsed.markers || []);
      setPlaylists(parsed.playlists || []);
      setSelectedClipId(parsed.selectedClipId || parsed.clips[0]?.id || '');
      setSelectedPlaylistId(parsed.selectedPlaylistId || '');
      setMicrocycle(parsed.microcycle);
      setBoardTitle(parsed.boardTitle || 'Pizarra importada');
      setBoardTokens(parsed.boardTokens || []);
      setBoardStrokes(parsed.boardStrokes || []);
      setBoardFrames(parsed.boardFrames?.length ? parsed.boardFrames : getDefaults().boardFrames);
      setSnapshots(parsed.snapshots || []);
      setAnnotations(parsed.annotations || {});
      setCustomTagButtons(parsed.customTagButtons || []);
      setReport(parsed.report || getDefaults().report);
      showToast('Respaldo importado correctamente.');
    } catch {
      showToast('Ese archivo no es un respaldo válido del Laboratorio.');
    }
  };

  const resetWorkspace = () => {
    if (!window.confirm('¿Restablecer el Laboratorio con los datos de ejemplo? Se borran los cambios guardados en este navegador.')) return;
    const defaults = getDefaults();
    setPlanTier(defaults.planTier);
    setTrialStartedAt(defaults.trialStartedAt);
    setAudience(defaults.audience);
    setClips(defaults.clips);
    setMarkers(defaults.markers);
    setPlaylists(defaults.playlists);
    setSelectedClipId(defaults.selectedClipId);
    setSelectedPlaylistId(defaults.selectedPlaylistId);
    setMicrocycle(defaults.microcycle);
    setBoardTitle(defaults.boardTitle);
    setBoardTokens(defaults.boardTokens);
    setBoardStrokes(defaults.boardStrokes);
    setBoardFrames(defaults.boardFrames);
    setSnapshots(defaults.snapshots);
    setAnnotations(defaults.annotations);
    setCustomTagButtons(defaults.customTagButtons);
    setReport(defaults.report);
    setReportBoardImage('');
    showToast('Laboratorio restablecido.');
  };

  const profile = AUDIENCE_PROFILES[audience];
  const completedTasks = microcycle.reduce((acc, day) => acc + day.tasks.filter((task) => task.done).length, 0);
  const totalTasks = microcycle.reduce((acc, day) => acc + day.tasks.length, 0);
  const daysLeftForTrial = trialDaysLeft(trialStartedAt);
  const effectivePlanTier: PlanTier = planTier === 'free' && daysLeftForTrial > 0 ? 'pro' : planTier;
  const planButtonLabel = planTier === 'free' ? (daysLeftForTrial > 0 ? `Prueba · ${daysLeftForTrial}d` : 'Prueba vencida') : PLAN_NAMES[planTier];

  const navItems: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Inicio', icon: <Activity size={16} /> },
    { id: 'analyzer', label: 'VideoLab Pro', icon: <MonitorPlay size={16} /> },
    { id: 'board', label: 'Pizarras 2D/3D', icon: <Box size={16} /> },
    { id: 'microcycle', label: 'Microciclo', icon: <CalendarDays size={16} /> },
    { id: 'report', label: 'Informe', icon: <FileText size={16} /> },
    { id: 'pricing', label: 'Planes', icon: <Crown size={16} /> },
    { id: 'manual', label: 'Manual', icon: <BookOpen size={16} /> }
  ];

  return (
    <div className="app-shell">
      {toast && <div className="toast" role="status"><CheckCircle2 size={19} /> {toast}</div>}
      <a className="whatsapp-float" href={waLink('Hola Profe. Alejandro Ramela, quiero consultar por el nuevo Laboratorio Táctico.')} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp">
        <MessageCircle size={27} />
      </a>

      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand-lockup" onClick={() => goTab('home')} aria-label="Ir al inicio del Laboratorio Táctico">
            <img src={dorado} alt="Escudo dorado RamelaFútbol" className="official-lab-crest" />
            <span className="brand-copy">
              <strong><em>PROFE.</em> ALEJANDRO Ramela</strong>
              <small>LABORATORIO TÁCTICO PRO · VIDEO + 2D/3D + SEMANA</small>
            </span>
          </button>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {navItems.map((item) => (
              <button key={item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => goTab(item.id)}>{item.icon} {item.label}</button>
            ))}
          </nav>
          <div className="topbar-actions">
            <button className="plan-button" onClick={() => goTab('pricing')}><Crown size={16} /> {planButtonLabel}</button>
            <a className="site-link" href="/"><ArrowLeft size={16} /> Volver a la web</a>
          </div>
        </div>
        <div className="mobile-web-return"><a href="/"><ArrowLeft size={16} /> Volver a la web</a></div>
        <nav className="mobile-nav" aria-label="Navegación móvil">
          {navItems.map((item) => (
            <button key={item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => goTab(item.id)}>{item.icon} {item.label}</button>
          ))}
        </nav>
      </header>

      <main className="main-container">
        {activeTab === 'home' && (
          <div className="module-stack">
            <section className="hero-card">
              <div className="hero-glow" />
              <div className="hero-copy">
                <span className="hero-pill"><span /> {IS_SAMPLE_MODE ? 'MUESTRA V4 PRO · EDICIÓN DIRECTA CON EL PUNTERO · TODAVÍA NO ESTÁ EN LA WEB' : 'NUEVO PRODUCTO PREMIUM · INFANTIL · JUVENIL · PRIMERA'}</span>
                <h1>Analizá. Dibujá. Planificá. <strong>Entrená con método.</strong></h1>
                <p>La versión Pro reúne codificación de video, telestración con cilindro de luz editable, timeline y datos, pizarras 2D/3D animadas, microciclo e informes. Ahora cada dibujo ya colocado se toca, se mueve, se deforma por puntos y se borra en el acto: Escape vuelve siempre al Puntero.</p>
                <div className="hero-buttons">
                  <button className="button primary large" onClick={() => goTab('analyzer')}><MonitorPlay size={19} /> Abrir VideoLab Pro</button>
                  <button className="button secondary large" onClick={() => goTab('board')}><Box size={19} /> Pizarras 2D + 3D</button>
                  <button className="button ghost large" onClick={() => goTab('pricing')}><Crown size={19} /> Prueba 10 días y planes</button>
                </div>
                <div className="hero-stats">
                  <div><strong>30+</strong><span>botones y descriptores de análisis</span></div>
                  <div><strong>18</strong><span>herramientas de dibujo/diagramación</span></div>
                  <div><strong>2D+3D</strong><span>pizarra animada y cámara orbital</span></div>
                  <div><strong>10 días</strong><span>de prueba completa sin tarjeta</span></div>
                </div>
              </div>
              <div className="hero-photo-card">
                <img src="/images/profe-alejandro.jpg" alt="Profe. Alejandro Ramela en la cancha" />
                <div className="hero-photo-overlay">
                  <span>ENTRENADOR · FORMADOR</span>
                  <strong>Profe. Alejandro Ramela</strong>
                  <p>+30 años de experiencia convertidos en método, material y herramientas.</p>
                </div>
              </div>
            </section>

            <section className="panel audience-panel">
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow"><Users size={16} /> Una misma herramienta, tres realidades</span>
                  <h2>Elegí tu categoría y el Laboratorio cambia el enfoque</h2>
                </div>
                <div className="segmented-control">
                  {AUDIENCES.map((level) => (
                    <button key={level} className={audience === level ? 'active' : ''} onClick={() => { setAudience(level); setMicrocycle(microTemplate(level)); showToast(`Contexto ${level} activado y microciclo actualizado.`); }}>
                      {level === 'Primera' ? 'Primera / Profesional' : level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="audience-profile-grid">
                <div>
                  <span className="profile-ages">{profile.ages}</span>
                  <h3>{profile.label}: {profile.promise}</h3>
                  <p>{profile.recommended}</p>
                </div>
                <ul className="check-list two-cols">
                  {profile.principles.map((item) => <li key={item}><Check size={16} /> {item}</li>)}
                </ul>
                <div className="watchout"><AlertTriangle size={19} /><p>{profile.watchout}</p></div>
              </div>
            </section>

            <section>
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow"><Activity size={16} /> Flujo de trabajo Alejandro Ramela</span>
                  <h2>Del partido a la práctica en cuatro pasos</h2>
                </div>
                <span className="muted-label">Se complementa con la Biblioteca y el Planificador IA</span>
              </div>
              <div className="module-cards">
                <button className="module-card" onClick={() => goTab('analyzer')}>
                  <span><MonitorPlay size={25} /></span><small>01 · OBSERVAR Y CODIFICAR</small><strong>VideoLab Pro</strong>
                  <p>Botones por categoría, descriptores, recorte IN/OUT, telestración, timeline por carriles, matriz, mapa zonal y presentaciones.</p><em>Analizar <ArrowRight size={15} /></em>
                </button>
                <button className="module-card" onClick={() => goTab('board')}>
                  <span><Box size={25} /></span><small>02 · EXPLICAR Y ANIMAR</small><strong>Pizarras 2D + 3D</strong>
                  <p>Materiales, textos, sombras, focos, mediciones, plantillas, secuencias por momentos y cámara 3D. Exportá PNG/SVG.</p><em>Dibujar <ArrowRight size={15} /></em>
                </button>
                <button className="module-card" onClick={() => goTab('microcycle')}>
                  <span><CalendarDays size={25} /></span><small>03 · ORDENAR</small><strong>Microciclo semanal</strong>
                  <p>Plantillas distintas para Infantil, Juvenil y Primera. Vinculá clips y controlá tareas por día.</p><em>Planificar <ArrowRight size={15} /></em>
                </button>
                <button className="module-card" onClick={() => goTab('report')}>
                  <span><FileText size={25} /></span><small>04 · COMPARTIR</small><strong>Informe listo</strong>
                  <p>Resumen profesional con marcadores, semana y pizarra para imprimir o enviar por WhatsApp.</p><em>Crear informe <ArrowRight size={15} /></em>
                </button>
              </div>
            </section>

            <section className="dashboard-grid">
              <article className="panel dashboard-main">
                <div className="panel-title-row"><h3><Activity size={19} /> Tu espacio de trabajo</h3><span>Guardado automático local</span></div>
                <div className="dashboard-stats">
                  <div><strong>{clips.length}</strong><span>clips/casos</span></div>
                  <div><strong>{markers.length}</strong><span>marcadores</span></div>
                  <div><strong>{playlists.length}</strong><span>playlists</span></div>
                  <div><strong>{snapshots.length}</strong><span>pizarras guardadas</span></div>
                  <div><strong>{completedTasks}/{totalTasks}</strong><span>tareas de la semana</span></div>
                </div>
                <div className="quick-actions">
                  <button className="button primary" onClick={() => goTab('analyzer')}><Play size={16} /> Seguir analizando</button>
                  <button className="button secondary" onClick={() => goTab('microcycle')}><CalendarDays size={16} /> Revisar semana</button>
                  <button className="button secondary" onClick={() => goTab('report')}><Printer size={16} /> Preparar informe</button>
                  <button className="button ghost" onClick={() => goTab('manual')}><BookOpen size={16} /> Manual de uso</button>
                </div>
              </article>

              <article className="panel product-fit">
                <h3><ShieldCheck size={19} /> Cómo encaja en tu web</h3>
                <ul className="check-list">
                  <li><strong>No reemplaza cursos:</strong> los potencia con práctica semanal.</li>
                  <li><strong>No duplica la Biblioteca:</strong> acá se trabaja video propio y del rival.</li>
                  <li><strong>No duplica el Planificador IA:</strong> enlaza la sesión minuto a minuto.</li>
                  <li><strong>Suma recurrencia:</strong> suscripción mensual/anual y planes para clubes.</li>
                </ul>
                <div className="button-row wrap">
                  <a className="button ghost" href={`${SITE_URL}/biblioteca`} target="_blank" rel="noreferrer">Biblioteca actual <ExternalLink size={14} /></a>
                  <a className="button ghost" href={`${SITE_URL}/planificador`} target="_blank" rel="noreferrer">Planificador IA <ExternalLink size={14} /></a>
                </div>
              </article>

              <article className="panel backup-panel">
                <h3><Save size={19} /> Respaldo del MVP</h3>
                <p>Exportá tu trabajo en JSON para moverlo de navegador o guardarlo. En la versión premium esto será automático en la nube.</p>
                <div className="button-row wrap">
                  <button className="button secondary" onClick={exportWorkspace}><Download size={16} /> Exportar</button>
                  <button className="button secondary" onClick={() => importRef.current?.click()}><Upload size={16} /> Importar</button>
                  <button className="button ghost" onClick={resetWorkspace}><RotateCcw size={16} /> Restablecer</button>
                  <input ref={importRef} type="file" accept="application/json" hidden onChange={importWorkspace} />
                </div>
              </article>
            </section>
          </div>
        )}

        {activeTab === 'analyzer' && (
          <VideoAnalyzer
            clips={clips} setClips={setClips} markers={markers} setMarkers={setMarkers}
            playlists={playlists} setPlaylists={setPlaylists} selectedClipId={selectedClipId}
            setSelectedClipId={setSelectedClipId} selectedPlaylistId={selectedPlaylistId}
            setSelectedPlaylistId={setSelectedPlaylistId} annotations={annotations} setAnnotations={setAnnotations}
            customTagButtons={customTagButtons} setCustomTagButtons={setCustomTagButtons}
            planTier={effectivePlanTier} audience={audience} showToast={showToast} goPlans={() => goTab('pricing')}
          />
        )}

        {activeTab === 'board' && (
          <TacticalBoard
            title={boardTitle} setTitle={setBoardTitle} tokens={boardTokens} setTokens={setBoardTokens}
            strokes={boardStrokes} setStrokes={setBoardStrokes} frames={boardFrames} setFrames={setBoardFrames}
            snapshots={snapshots} setSnapshots={setSnapshots}
            planTier={effectivePlanTier} showToast={showToast} goPlans={() => goTab('pricing')}
            onUseInReport={(image) => { setReportBoardImage(image); showToast('Pizarra adjunta al informe.'); goTab('report'); }}
          />
        )}

        {activeTab === 'microcycle' && (
          <MicrocyclePlanner
            data={microcycle} setData={setMicrocycle} clips={clips} audience={audience} setAudience={setAudience}
            showToast={showToast} openClip={(id) => { setSelectedClipId(id); goTab('analyzer'); }}
          />
        )}

        {activeTab === 'report' && (
          <ReportBuilder
            report={report} setReport={setReport} clips={clips} markers={markers} microcycle={microcycle}
            boardTitle={boardTitle} boardImage={reportBoardImage} showToast={showToast}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingPlans planTier={planTier} trialStartedAt={trialStartedAt} activateDemo={activateDemo} showToast={showToast} />
        )}

        {activeTab === 'manual' && (
          <UserManual goTab={goTab} showToast={showToast} />
        )}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={blanco} alt="RamelaFútbol" style={{width:50,height:50,objectFit:"contain"}} />
            <div><strong>Profe. Alejandro Ramela</strong><p>Laboratorio Táctico · Fútbol Infantil, Juvenil y Primera</p></div>
          </div>
          <div className="footer-links">
            <a href={SITE_URL} target="_blank" rel="noreferrer">ramelafutbol.vercel.app</a>
            <a href={`${SITE_URL}/biblioteca`} target="_blank" rel="noreferrer">Biblioteca</a>
            <a href={`${SITE_URL}/planificador`} target="_blank" rel="noreferrer">Planificador IA</a>
            <a href={waLink('Hola Profe. Alejandro Ramela, quiero consultar por el Laboratorio Táctico.')} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
          <p>© 2026 Profe. Alejandro Ramela. {IS_SAMPLE_MODE ? 'Muestra HTML de revisión: no está publicada ni cobra suscripciones. Sirve para probar y corregir antes de implementarla.' : 'MVP funcional local para validar el producto antes de conectar cuentas, nube y pagos.'}</p>
        </div>
      </footer>
    </div>
  );
                      }
