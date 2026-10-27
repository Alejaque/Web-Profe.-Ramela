'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, Award, BarChart3, BookOpen, BookmarkPlus, Box, Building2, CalendarDays, Camera,
  Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Circle, ClipboardList, Copy, Crosshair, Crown, Download, Edit3, Eraser,
  ExternalLink, FileDown, FileText, Film, Flame, FlipHorizontal2, Frame, Gauge, Globe2, Keyboard, Layers, Link2, ListFilter, Lock, Magnet, Maximize,
  MessageCircle, MonitorPlay, MousePointer2, Move3d, Orbit, Pause, Pencil, Play, Plus, Presentation, Printer, Redo2,
  RotateCcw, Route, Rows3, Ruler, Save, Search, Send, Settings2, Shapes, Share2, ShieldCheck, SkipBack, SkipForward, SlidersHorizontal,
  Sparkles, Spline, Square, Star, Table2, Tags, Timer, Trash2, Type, Undo2, Upload, Users, Volume2, VolumeX, Eye, Zap, ZoomIn, ZoomOut
} from 'lucide-react';

// ============================================================
// LABORATORIO TÁCTICO Alejandro Ramela · MVP funcional local
// ============================================================

type Tab = 'home' | 'analyzer' | 'board' | 'microcycle' | 'report' | 'pricing' | 'manual';
type PlanTier = 'free' | 'pro' | 'staff' | 'club';
type Audience = 'Infantil' | 'Juvenil' | 'Primera';
type ClipSource = 'demo' | 'mp4' | 'youtube' | 'file';
type Tool = 'select' | 'free' | 'arrow' | 'curve' | 'line' | 'run' | 'pass' | 'zone' | 'rect' | 'ellipse' | 'spotlight' | 'beam' | 'polygon' | 'text' | 'measure' | 'angle' | 'link' | 'eraser';
type VideoWorkspaceTab = 'tagging' | 'drawing' | 'events' | 'timeline' | 'data' | 'heat' | 'presentation' | 'clips';
type BoardWorkspaceTab = 'draw' | 'elements' | 'systems' | 'animate' | 'camera' | 'inspector';
type StrokeKind = Exclude<Tool, 'select' | 'eraser'>;
type TokenKind = 'home' | 'away' | 'neutral' | 'coach' | 'ball' | 'cone' | 'disc' | 'miniGoal' | 'goal' | 'mannequin' | 'hurdle' | 'ladder' | 'ring' | 'pole' | 'flag';
type BoardViewMode = '2d' | '3d' | 'split';
type EventTeam = 'Propio' | 'Rival' | 'Neutral';
type EventOutcome = 'Positivo' | 'Negativo' | 'Neutro' | 'Ocasión' | 'Gol' | 'Error';

interface Clip {
  id: string;
  title: string;
  level: Audience;
  phase: string;
  system: string;
  concept: string;
  source: ClipSource;
  url: string;
  durationSec: number;
  notes: string;
  favorite: boolean;
  createdAt: string;
}

interface Marker {
  id: string;
  clipId: string;
  time: number;
  label: string;
  note: string;
  endTime?: number;
  group?: string;
  team?: EventTeam;
  player?: string;
  zone?: string;
  outcome?: EventOutcome;
  rating?: number;
  fieldX?: number;
  fieldY?: number;
  descriptors?: string[];
}

interface Playlist {
  id: string;
  name: string;
  clipIds: string[];
  markerIds?: string[];
}

interface CustomTagButton {
  id: string;
  group: string;
  label: string;
  color: string;
}

interface MicroTask {
  id: string;
  text: string;
  done: boolean;
}

interface MicroDay {
  id: string;
  day: string;
  code: string;
  title: string;
  load: string;
  duration: string;
  objective: string;
  notes: string;
  clipId: string;
  tasks: MicroTask[];
}

interface Point { x: number; y: number; }

interface Stroke {
  id: string;
  kind: StrokeKind;
  color: string;
  width: number;
  points: Point[];
  opacity?: number;
  fillOpacity?: number;
  dashed?: boolean;
  shadow?: boolean;
  text?: string;
  fontSize?: number;
  radius?: number;
  startTime?: number;
  endTime?: number;
  name?: string;
}

interface Token {
  id: string;
  kind: TokenKind;
  label: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  color?: string;
}

interface BoardSnapshot {
  id: string;
  title: string;
  tokens: Token[];
  strokes: Stroke[];
  createdAt: string;
}

interface BoardFrame {
  id: string;
  name: string;
  tokens: Token[];
  strokes: Stroke[];
}

interface ReportData {
  title: string;
  team: string;
  category: string;
  rival: string;
  date: string;
  objective: string;
  strengths: string;
  improvements: string;
  plan: string;
  clipId: string;
}

interface PersistedState {
  planTier: PlanTier;
  trialStartedAt: string;
  audience: Audience;
  clips: Clip[];
  markers: Marker[];
  playlists: Playlist[];
  selectedClipId: string;
  selectedPlaylistId: string;
  microcycle: MicroDay[];
  boardTitle: string;
  boardTokens: Token[];
  boardStrokes: Stroke[];
  boardFrames: BoardFrame[];
  snapshots: BoardSnapshot[];
  annotations: Record<string, Stroke[]>;
  customTagButtons: CustomTagButton[];
  report: ReportData;
}

const STORAGE_KEY = 'ramela-lab-tactico-v1';
const WHATSAPP_NUMBER = '5493644670461';
const SITE_URL = 'https://ramelafutbol.vercel.app';

const PHASES = ['Ataque Organizado', 'Defensa Organizada', 'Transición Ofensiva', 'Transición Defensiva', 'Balón Parado (ABP)', 'Juego Reducido'];
const SYSTEMS = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '5-3-2', 'Libre / Formativo'];
const CONCEPTS = ['Salida desde el Fondo', 'Presión Tras Pérdida', 'Bloque Bajo', 'Tercer Hombre', 'Ataque Directo', 'Vigilancia Ofensiva', 'Coberturas', 'Desmarque', 'Finalización'];
const MARKER_TAGS = ['Clave táctica', 'Salida', 'Presión', 'Cobertura', 'Desmarque', 'Error a Corregir', 'Buena decisión', 'ABP', 'Transición'];
const TAG_GROUPS: Record<string, string[]> = {
  'Ataque': ['Salida', 'Progresión', 'Tercer hombre', 'Pase clave', 'Centro', 'Remate', 'Gol'],
  'Defensa': ['Presión', 'Recuperación', 'Repliegue', 'Bloque', 'Cobertura', 'Duelo', 'Despeje'],
  'Transiciones': ['Pérdida', 'Post-pérdida', 'Contraataque', 'Balance defensivo', 'Vigilancia'],
  'ABP': ['Tiro libre', 'Córner a favor', 'Córner en contra', 'Lateral', 'Saque de arco', 'Penal'],
  'Jugador / equipo': ['Buena decisión', 'Error a corregir', 'Clave táctica', 'Comunicación', 'Gestión emocional']
};
const EVENT_OUTCOMES: EventOutcome[] = ['Positivo', 'Negativo', 'Neutro', 'Ocasión', 'Gol', 'Error'];
const EVENT_ZONES = ['Tercio defensivo', 'Tercio medio', 'Tercio ofensivo', 'Carril Izquierdo', 'Carril central', 'Carril derecho', 'Área propia', 'Área rival'];
const TAG_COLORS: Record<string, string> = {
  'Ataque': '#00a8ff', 'Defensa': '#ff5d73', 'Transiciones': '#ffd166', 'ABP': '#b388ff', 'Jugador / equipo': '#35e0a1'
};
const TOKEN_CATALOG: Array<{ kind: TokenKind; label: string; hint: string }> = [
  { kind: 'home', label: 'Jugador propio', hint: 'Celeste' },
  { kind: 'away', label: 'Jugador rival', hint: 'Rojo' },
  { kind: 'neutral', label: 'Comodín', hint: 'Amarillo' },
  { kind: 'coach', label: 'DT / apoyo', hint: 'Blanco' },
  { kind: 'ball', label: 'Balón', hint: 'Pelota' },
  { kind: 'cone', label: 'Cono', hint: 'Naranja' },
  { kind: 'disc', label: 'Plato', hint: 'Marcador plano' },
  { kind: 'miniGoal', label: 'Mini arco', hint: 'Portería chica' },
  { kind: 'goal', label: 'Arco', hint: 'Portería' },
  { kind: 'mannequin', label: 'Muñeco', hint: 'Barrera/defensor' },
  { kind: 'hurdle', label: 'Valla', hint: 'Salto' },
  { kind: 'ladder', label: 'Escalera', hint: 'Coordinación' },
  { kind: 'ring', label: 'Aro', hint: 'Apoyo/precisión' },
  { kind: 'pole', label: 'Poste', hint: 'Pique/estaca' },
  { kind: 'flag', label: 'Bandera', hint: 'Punto de referencia' }
];
const TRIAL_DAYS = 10;
const AUDIENCES: Audience[] = ['Infantil', 'Juvenil', 'Primera'];

const AUDIENCE_PROFILES: Record<Audience, {
  label: string;
  ages: string;
  promise: string;
  principles: string[];
  watchout: string;
  recommended: string;
}> = {
  Infantil: {
    label: 'Infantil',
    ages: '6 a 12 años · Escuelitas y formativas',
    promise: 'Observar, jugar y corregir con consignas cortas, mucho balón y cero lenguaje adulto innecesario.',
    principles: ['1 idea por clip', 'Juego antes que explicación larga', 'Correcciones positivas y visibles', 'Participación de todos'],
    watchout: 'La pizarra sirve para mostrar espacios y recorridos simples. No usarla para saturar al chico con sistemas de primera división.',
    recommended: 'Usá clips de 20–40 segundos, una pregunta y una tarea de cancha inmediata.'
  },
  Juvenil: {
    label: 'Juvenil',
    ages: '13 a 19 años · Divisiones formativas',
    promise: 'Conectar el video con el modelo de juego, la toma de decisiones y la progresión semanal del jugador.',
    principles: ['Concepto + contexto', 'Roles por puesto', 'Carga acorde al crecimiento', 'Autonomía para decidir'],
    watchout: 'Relacioná cada marcador con una tarea observable de entrenamiento y volvé a medirlo en el partido siguiente.',
    recommended: 'Armá playlists por puesto o línea y compartí 3–5 clips antes de la práctica.'
  },
  Primera: {
    label: 'Primera / Profesional',
    ages: 'Primera, reserva, ascenso y amateur competitivo',
    promise: 'Analizar ventajas, preparar el plan de partido y coordinar al cuerpo técnico con evidencia en video.',
    principles: ['Plan de partido', 'Ventajas y riesgos', 'ABP y variantes', 'Comunicación al plantel'],
    watchout: 'Separá análisis propio, rival y mensajes finales. El plantel necesita claridad, no una videoteca infinita.',
    recommended: 'Trabajá con playlists de 6–10 acciones, informe A4 y microciclo MD sincronizado.'
  }
};

const PLAN_NAMES: Record<PlanTier, string> = {
  free: 'Prueba 10 días',
  pro: 'DT Pro',
  staff: 'Cuerpo Técnico',
  club: 'Club'
};

interface PlanPrice {
  monthly: Record<'ARS' | 'USD', number>;
  annual: Record<'ARS' | 'USD', number>;
}

interface RamelaLabConfig {
  sampleMode?: boolean;
  prices?: Partial<Record<Exclude<PlanTier, 'free'>, Partial<PlanPrice>>>;
}

declare global {
  interface Window {
    Ramela_LAB_CONFIG?: RamelaLabConfig;
  }
}

// Precios definidos para la versión Pro. El anual aplica un 10% de descuento
// sobre 12 mensualidades (descuento mínimo y proporcional).
// En la muestra HTML pueden modificarse desde window.Ramela_LAB_CONFIG.
const DEFAULT_PLAN_PRICES: Record<Exclude<PlanTier, 'free'>, PlanPrice> = {
  pro: {
    monthly: { ARS: 40000, USD: 39 },
    annual: { ARS: 432000, USD: 421 }
  },
  staff: {
    monthly: { ARS: 70000, USD: 69 },
    annual: { ARS: 756000, USD: 745 }
  },
  club: {
    monthly: { ARS: 90000, USD: 89 },
    annual: { ARS: 972000, USD: 961 }
  }
};

function getPlanPrice(tier: Exclude<PlanTier, 'free'>): PlanPrice {
  const fallback = DEFAULT_PLAN_PRICES[tier];
  if (typeof window === 'undefined') return fallback;
  const override = window.Ramela_LAB_CONFIG?.prices?.[tier];
  if (!override) return fallback;
  return {
    monthly: { ...fallback.monthly, ...(override.monthly || {}) },
    annual: { ...fallback.annual, ...(override.annual || {}) }
  };
}

const IS_SAMPLE_MODE = typeof window !== 'undefined' && Boolean(window.Ramela_LAB_CONFIG?.sampleMode);

function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

function formatPreciseTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00.0';
  const base = formatTime(seconds);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${base}.${tenths}`;
}

function trialDaysLeft(trialStartedAt: string) {
  const started = Date.parse(trialStartedAt);
  if (!Number.isFinite(started)) return TRIAL_DAYS;
  const elapsedDays = (Date.now() - started) / 86400000;
  return clamp(Math.ceil(TRIAL_DAYS - elapsedDays), 0, TRIAL_DAYS);
}

function inferMarkerGroup(marker: Pick<Marker, 'label' | 'group'>) {
  if (marker.group) return marker.group;
  for (const [group, labels] of Object.entries(TAG_GROUPS)) {
    if (labels.some((label) => label.toLowerCase() === marker.label.toLowerCase())) return group;
  }
  if (/presión|cobertura|bloque|repliegue|recuperación/i.test(marker.label)) return 'Defensa';
  if (/salida|desmarque|gol|remate|centro|tercer/i.test(marker.label)) return 'Ataque';
  if (/transición|pérdida|contraataque/i.test(marker.label)) return 'Transiciones';
  if (/abp|córner|tiro libre|penal/i.test(marker.label)) return 'ABP';
  return 'Jugador / equipo';
}

function markerEnd(marker: Marker, fallbackDuration = 6) {
  return Math.max(marker.time, marker.endTime ?? marker.time + fallbackDuration);
}

function distanceBetween(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function distanceToSegment(point: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (!lengthSq) return distanceBetween(point, a);
  const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq, 0, 1);
  return distanceBetween(point, { x: a.x + t * dx, y: a.y + t * dy });
}

function strokeHit(stroke: Stroke, point: Point, tolerance = 18) {
  if (!stroke.points.length) return false;
  if (stroke.kind === 'text') return distanceBetween(point, stroke.points[0]) < 55;
  if (stroke.kind === 'beam' && stroke.points.length >= 2) {
    const [source, target] = stroke.points;
    const radius = getBeamRadius(stroke);
    const ry = clamp(radius * 0.24, 10, 46);
    const insideCylinder = Math.abs(point.x - target.x) <= radius + tolerance
      && point.y >= Math.min(source.y, target.y) - ry - tolerance
      && point.y <= target.y + ry + tolerance;
    const ellipseValue = ((point.x - target.x) / Math.max(1, radius + tolerance)) ** 2
      + ((point.y - target.y) / Math.max(1, ry + tolerance)) ** 2;
    return insideCylinder || ellipseValue <= 1;
  }
  if (['zone', 'rect', 'ellipse', 'spotlight'].includes(stroke.kind) && stroke.points.length >= 2) {
    const [a, b] = stroke.points;
    return point.x >= Math.min(a.x, b.x) - tolerance && point.x <= Math.max(a.x, b.x) + tolerance
      && point.y >= Math.min(a.y, b.y) - tolerance && point.y <= Math.max(a.y, b.y) + tolerance;
  }
  for (let i = 1; i < stroke.points.length; i += 1) {
    if (distanceToSegment(point, stroke.points[i - 1], stroke.points[i]) <= tolerance + stroke.width) return true;
  }
  return stroke.points.some((item) => distanceBetween(point, item) <= tolerance);
}

function getBeamRadius(stroke: Stroke) {
  if (stroke.radius) return clamp(stroke.radius, 18, 260);
  if (stroke.points.length >= 2) {
    return clamp(52 + distanceBetween(stroke.points[0], stroke.points[1]) * 0.16 + stroke.width * 4, 56, 150);
  }
  return 64;
}

interface StrokeBounds { minX: number; minY: number; maxX: number; maxY: number; }

function getStrokeBounds(stroke: Stroke): StrokeBounds {
  if (stroke.kind === 'beam' && stroke.points.length >= 2) {
    const [source, target] = stroke.points;
    const radius = getBeamRadius(stroke);
    const ry = clamp(radius * 0.24, 10, 46);
    return {
      minX: target.x - radius,
      maxX: target.x + radius,
      minY: Math.min(source.y, target.y) - ry,
      maxY: target.y + ry
    };
  }
  if (stroke.kind === 'text' && stroke.points.length) {
    const point = stroke.points[0];
    const fontSize = stroke.fontSize || 24;
    const width = Math.max(74, (stroke.text || 'Texto').length * fontSize * 0.62 + 22);
    return {
      minX: point.x - 9,
      maxX: point.x - 9 + width,
      minY: point.y - fontSize - 9,
      maxY: point.y + 11
    };
  }
  return stroke.points.reduce<StrokeBounds>((acc, point) => ({
    minX: Math.min(acc.minX, point.x),
    maxX: Math.max(acc.maxX, point.x),
    minY: Math.min(acc.minY, point.y),
    maxY: Math.max(acc.maxY, point.y)
  }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
}

function strokeKindLabel(kind: StrokeKind) {
  const labels: Record<StrokeKind, string> = {
    free: 'Trazo libre',
    arrow: 'Flecha',
    curve: 'Curva',
    line: 'Línea',
    run: 'Carrera',
    pass: 'Pase',
    zone: 'Zona',
    rect: 'Rectángulo',
    ellipse: 'Elipse',
    spotlight: 'Foco de suelo',
    beam: 'Cilindro de luz',
    polygon: 'Polígono',
    text: 'Texto',
    measure: 'Medición',
    angle: 'Ángulo',
    link: 'Vínculo'
  };
  return labels[kind] || kind;
}

function getEditablePointIndices(stroke: Stroke) {
  if (stroke.points.length <= 9) return stroke.points.map((_, index) => index);
  const handleCount = 7;
  const indices = Array.from({ length: handleCount }, (_, item) => Math.round((item / (handleCount - 1)) * (stroke.points.length - 1)));
  return Array.from(new Set(indices));
}

function simplifyPoints(points: Point[], tolerance = 6): Point[] {
  if (points.length <= 2) return points;
  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop() as [number, number];
    let maxDistance = 0;
    let splitIndex = -1;
    for (let index = start + 1; index < end; index += 1) {
      const distance = distanceToSegment(points[index], points[start], points[end]);
      if (distance > maxDistance) {
        maxDistance = distance;
        splitIndex = index;
      }
    }
    if (splitIndex > 0 && maxDistance > tolerance) {
      keep[splitIndex] = true;
      stack.push([start, splitIndex], [splitIndex, end]);
    }
  }
  return points.filter((_, index) => keep[index]);
}

function limitPointCount(points: Point[], maxPoints = 9): Point[] {
  if (points.length <= maxPoints) return points;
  return Array.from({ length: maxPoints }, (_, item) => points[Math.round((item / (maxPoints - 1)) * (points.length - 1))]);
}

function simplifyCurvePoints(points: Point[]): Point[] {
  return limitPointCount(simplifyPoints(points, 7), 9);
}

function smoothPath(points: Point[]) {
  if (points.length < 3) return pointsToPath(points);
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const mid = { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
    path += ` Q ${points[i].x} ${points[i].y}, ${mid.x} ${mid.y}`;
  }
  const last = points[points.length - 1];
  return `${path} L ${last.x} ${last.y}`;
}

function wavyPath(points: Point[]) {
  if (points.length < 2) return pointsToPath(points);
  const a = points[0];
  const b = points[points.length - 1];
  const length = Math.max(distanceBetween(a, b), 1);
  const steps = clamp(Math.round(length / 34), 3, 22);
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const normal = angle + Math.PI / 2;
  const wavePoints: Point[] = [];
  for (let i = 0; i <= steps * 2; i += 1) {
    const t = i / (steps * 2);
    const base = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    const offset = i === 0 || i === steps * 2 ? 0 : Math.sin(t * Math.PI * steps) * 14;
    wavePoints.push({ x: base.x + Math.cos(normal) * offset, y: base.y + Math.sin(normal) * offset });
  }
  return pointsToPath(wavePoints);
}

function fieldDistanceMeters(stroke: Stroke) {
  if (stroke.points.length < 2) return 0;
  const a = stroke.points[0];
  const b = stroke.points[stroke.points.length - 1];
  const metersX = ((b.x - a.x) / 1000) * 105;
  const metersY = ((b.y - a.y) / 640) * 68;
  return Math.hypot(metersX, metersY);
}

function csvEscape(value: string | number | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function downloadText(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadUrl(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

function getYouTubeId(url: string) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&#]+)/i,
    /youtu\.be\/([^?&#]+)/i,
    /youtube\.com\/embed\/([^?&#]+)/i,
    /youtube\.com\/shorts\/([^?&#]+)/i
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return '';
}

function sourceLabel(source: ClipSource) {
  if (source === 'demo') return 'Simulación demo';
  if (source === 'youtube') return 'YouTube';
  if (source === 'file') return 'Archivo local';
  return 'Video web';
}

function formationTokens(system = '4-3-3'): Token[] {
  const formations: Record<string, Array<[string, number, number]>> = {
    '4-3-3': [
      ['1', 82, 320], ['2', 230, 110], ['4', 210, 250], ['6', 210, 390], ['3', 230, 530],
      ['5', 390, 320], ['8', 455, 205], ['10', 455, 435], ['7', 650, 120], ['9', 675, 320], ['11', 650, 520]
    ],
    '4-2-3-1': [
      ['1', 82, 320], ['2', 230, 110], ['4', 210, 250], ['6', 210, 390], ['3', 230, 530],
      ['5', 380, 250], ['8', 380, 390], ['7', 555, 130], ['10', 545, 320], ['11', 555, 510], ['9', 700, 320]
    ],
    '4-4-2': [
      ['1', 82, 320], ['2', 230, 110], ['4', 210, 250], ['6', 210, 390], ['3', 230, 530],
      ['7', 440, 120], ['5', 420, 250], ['8', 420, 390], ['11', 440, 520], ['9', 660, 250], ['10', 660, 390]
    ],
    '3-5-2': [
      ['1', 82, 320], ['2', 225, 175], ['4', 205, 320], ['6', 225, 465], ['7', 420, 95],
      ['5', 395, 215], ['8', 395, 320], ['10', 395, 425], ['11', 420, 545], ['9', 650, 250], ['19', 650, 390]
    ],
    '5-3-2': [
      ['1', 82, 320], ['2', 245, 90], ['4', 215, 200], ['6', 200, 320], ['3', 215, 440], ['11', 245, 550],
      ['5', 420, 220], ['8', 420, 320], ['10', 420, 420], ['9', 650, 250], ['19', 650, 390]
    ]
  };
  const base = formations[system] || formations['4-3-3'];
  const home = base.map(([label, x, y], index) => ({ id: `home-${index + 1}`, kind: 'home' as TokenKind, label, x, y }));
  const away = base.map(([label, x, y], index) => ({
    id: `away-${index + 1}`,
    kind: 'away' as TokenKind,
    label,
    x: 1000 - x,
    y
  }));
  return [...home, ...away, { id: 'ball-1', kind: 'ball', label: '⚽', x: 500, y: 320 }];
}

function makeTasks(texts: string[]): MicroTask[] {
  return texts.map((text, index) => ({ id: `task-${index}-${Math.random().toString(36).slice(2, 6)}`, text, done: false }));
}

function microTemplate(audience: Audience): MicroDay[] {
  if (audience === 'Infantil') {
    const rows: Array<[string, string, string, string, string, string, string[]]> = [
      ['Lunes', 'JUEGO', 'Coordinación y conducción jugando', 'Baja / Lúdica', '60 min', 'Tocar muchas veces el balón y levantar la mirada.', ['Juego de persecución con balón', 'Circuito corto de conducción', 'Partido 3v3 con porterías chicas']],
      ['Martes', 'LIBRE', 'Descanso y familia', 'Recuperación', 'Libre', 'Disfrutar y recuperarse.', ['Sin tarea obligatoria']],
      ['Miércoles', 'TÉCNICA', 'Pase, control y pared en juegos', 'Media', '65 min', 'Jugar a uno o dos toques buscando al compañero libre.', ['Rondo simple', 'Pared y desmarque', 'Partido condicionado por zonas']],
      ['Jueves', 'LIBRE', 'Descanso', 'Recuperación', 'Libre', 'Llegar con ganas al próximo estímulo.', ['Sin tarea obligatoria']],
      ['Viernes', 'EQUIPO', 'Salir jugando y mini partido', 'Media', '60 min', 'Ocupar espacios y ayudarse sin amontonarse.', ['Juego de dos zonas', 'Mini partido con consigna única', 'Cierre: qué aprendimos']],
      ['Sábado', 'ENCUENTRO', 'Encuentro formativo', 'Partido', 'Según torneo', 'Jugar, rotar puestos y resolver en equipo.', ['Todos juegan', 'Rotar posiciones', 'Registrar dos aciertos del equipo']],
      ['Domingo', 'LIBRE', 'Descanso', 'Recuperación', 'Libre', 'Recuperar y compartir en familia.', ['Sin tarea obligatoria']]
    ];
    return rows.map(([day, code, title, load, duration, objective, tasks], index) => ({
      id: `micro-infantil-${index}`, day, code, title, load, duration, objective, notes: '', clipId: '', tasks: makeTasks(tasks)
    }));
  }

  if (audience === 'Juvenil') {
    const rows: Array<[string, string, string, string, string, string, string[]]> = [
      ['Lunes', 'MD-5', 'Fuerza técnica y principios de salida', 'Fuerza / Técnica', '75 min', 'Salir limpio y sostener intensidad técnica.', ['Activación con rondos', 'Salida 7v5', 'Fuerza preventiva']],
      ['Martes', 'MD-4', 'Presión, coberturas y transiciones', 'Tensión táctica', '85 min', 'Recuperar y atacar rápido sin perder equilibrio.', ['Presión tras pérdida 6v6+2', 'Transición a tres porterías', 'Video: 3 marcadores']],
      ['Miércoles', 'REC', 'Recuperación / estudio / técnica individual', 'Baja', '40 min', 'Recuperar y reforzar un gesto por puesto.', ['Movilidad', 'Técnica individual opcional']],
      ['Jueves', 'MD-2', 'Velocidad táctica y finalización', 'Velocidad', '70 min', 'Decidir rápido en último tercio.', ['Ataque 8v6', 'Finalización tras centro', 'ABP ofensivo']],
      ['Viernes', 'MD-1', 'Activación y plan de partido', 'Activación', '45 min', 'Repasar roles, ABP y primera presión.', ['Rondo de activación', '11v0 por líneas', 'ABP defensivo']],
      ['Sábado', 'PARTIDO', 'Competencia oficial', 'Partido', '90 min', 'Ejecutar el plan y competir por líneas.', ['Registrar momentos del partido', 'Completar informe breve']],
      ['Domingo', 'MD+1', 'Recuperación y análisis', 'Regenerativo', '35 min', 'Recuperar y aprender de tres acciones.', ['Regenerativo', 'Playlist post-partido']]
    ];
    return rows.map(([day, code, title, load, duration, objective, tasks], index) => ({
      id: `micro-juvenil-${index}`, day, code, title, load, duration, objective, notes: '', clipId: '', tasks: makeTasks(tasks)
    }));
  }

  const rows: Array<[string, string, string, string, string, string, string[]]> = [
    ['Lunes', 'MD-5', 'Fuerza táctica: salida y presión rival', 'Fuerza táctica', '80 min', 'Superar primera presión y fijar ventajas interiores.', ['Salida vs presión alta', 'Juego de posición 8v6', 'Fuerza específica']],
    ['Martes', 'MD-4', 'Tensión: transiciones y bloque medio', 'Tensión / Resistencia', '90 min', 'Atacar tras robo y proteger carril central.', ['Transición 9v7', 'Bloque medio + salida rápida', 'Informe rival']],
    ['Miércoles', 'MD-3', 'Velocidad táctica y último tercio', 'Velocidad táctica', '70 min', 'Rupturas, tercer hombre y finalización.', ['Ataque directo condicionado', 'Centros y ocupaciones', 'ABP ofensivo']],
    ['Jueves', 'MD-2', 'Reactivación y balón parado', 'Reactivación', '55 min', 'Ajustes de ABP y variantes de plan B.', ['ABP ofensivo/defensivo', '11v11 corto', 'Roles de cambio']],
    ['Viernes', 'MD-1', 'Activación pre-partido', 'Activación', '40 min', 'Claridad total de roles y señales.', ['Activación', 'Salida ensayada', 'Charla final']],
    ['Sábado', 'PARTIDO', 'Fecha oficial', 'Competición', '90 min', 'Ejecutar plan y gestionar momentos.', ['Registro por bloques de 15 minutos', 'Ajustes entretiempo']],
    ['Domingo', 'MD+1', 'Recuperación y videoanálisis', 'Recuperación', '40 min', 'Cerrar aprendizaje y preparar próxima semana.', ['Regenerativo', 'Playlist post-partido', 'Informe cuerpo técnico']]
  ];
  return rows.map(([day, code, title, load, duration, objective, tasks], index) => ({
    id: `micro-primera-${index}`, day, code, title, load, duration, objective, notes: '', clipId: '', tasks: makeTasks(tasks)
  }));
}

function getDefaults(): PersistedState {
  const clips: Clip[] = [
    {
      id: 'clip-salida', title: 'Salida limpia desde el fondo bajo presión alta', level: 'Primera', phase: 'Ataque Organizado', system: '4-3-3', concept: 'Salida desde el Fondo', source: 'demo', url: '', durationSec: 14,
      notes: 'Simulación de muestra: el pivote baja entre centrales, se fija al 9 rival y el interior recibe orientado.', favorite: true, createdAt: new Date().toISOString()
    },
    {
      id: 'clip-presion', title: 'Presión tras pérdida en carril central', level: 'Primera', phase: 'Transición Defensiva', system: '4-2-3-1', concept: 'Presión Tras Pérdida', source: 'demo', url: '', durationSec: 12,
      notes: 'Los tres jugadores cercanos cierran líneas de pase y orientan la recuperación hacia adentro.', favorite: false, createdAt: new Date().toISOString()
    },
    {
      id: 'clip-bloque', title: 'Basculación de bloque medio-bajo', level: 'Juvenil', phase: 'Defensa Organizada', system: '5-3-2', concept: 'Bloque Bajo', source: 'demo', url: '', durationSec: 13,
      notes: 'El equipo protege el carril central, reduce distancia entre líneas y salta con cobertura.', favorite: false, createdAt: new Date().toISOString()
    },
    {
      id: 'clip-tercer', title: 'Pared y aparición del tercer hombre', level: 'Juvenil', phase: 'Ataque Organizado', system: '4-3-3', concept: 'Tercer Hombre', source: 'demo', url: '', durationSec: 12,
      notes: 'El primer pase atrae, la descarga elimina presión y el tercer hombre recibe de frente.', favorite: true, createdAt: new Date().toISOString()
    },
    {
      id: 'clip-banda', title: 'Salir jugando por la banda sin amontonarse', level: 'Infantil', phase: 'Juego Reducido', system: 'Libre / Formativo', concept: 'Desmarque', source: 'demo', url: '', durationSec: 11,
      notes: 'Consigna simple: abrir la cancha, mirar antes de recibir y buscar al compañero libre.', favorite: false, createdAt: new Date().toISOString()
    },
    {
      id: 'clip-robo', title: 'Robar y salir rápido a la miniportería', level: 'Infantil', phase: 'Transición Ofensiva', system: 'Libre / Formativo', concept: 'Ataque Directo', source: 'demo', url: '', durationSec: 10,
      notes: 'Al recuperar, primer pase hacia adelante o conducción decidida. Todos participan del ataque.', favorite: false, createdAt: new Date().toISOString()
    }
  ];

  return {
    planTier: 'free',
    trialStartedAt: new Date().toISOString(),
    audience: 'Juvenil',
    clips,
    markers: [
      { id: 'm1', clipId: 'clip-salida', time: 3, endTime: 9, group: 'Ataque', team: 'Propio', player: '5 · Pivote', zone: 'Tercio defensivo', outcome: 'Positivo', rating: 4, fieldX: 24, fieldY: 50, label: 'Salida', note: 'El pivote se ubica entre centrales y genera 3v2.' },
      { id: 'm2', clipId: 'clip-salida', time: 8, endTime: 13, group: 'Jugador / equipo', team: 'Propio', player: '8 · Interior', zone: 'Tercio medio', outcome: 'Positivo', rating: 5, fieldX: 48, fieldY: 42, label: 'Clave táctica', note: 'El interior recibe entre líneas con perfil abierto.' },
      { id: 'm3', clipId: 'clip-presion', time: 4, endTime: 9, group: 'Transiciones', team: 'Propio', player: 'Primer salto', zone: 'Tercio medio', outcome: 'Positivo', rating: 4, fieldX: 55, fieldY: 48, label: 'Post-pérdida', note: 'Primer salto en menos de 3 segundos tras perder.' },
      { id: 'm4', clipId: 'clip-tercer', time: 7, endTime: 11, group: 'Ataque', team: 'Propio', player: '10 · Enlace', zone: 'Tercio ofensivo', outcome: 'Positivo', rating: 5, fieldX: 68, fieldY: 45, label: 'Tercer hombre', note: 'Descarga de primera y ruptura del tercer hombre.' },
      { id: 'm5', clipId: 'clip-banda', time: 5, endTime: 9, group: 'Ataque', team: 'Propio', player: 'Extremo', zone: 'Carril derecho', outcome: 'Positivo', rating: 3, fieldX: 52, fieldY: 82, label: 'Desmarque', note: 'El jugador de banda se abre y crea espacio interior.' }
    ],
    playlists: [
      { id: 'playlist-semana', name: 'Semana de partido', clipIds: ['clip-salida', 'clip-presion'], markerIds: ['m1', 'm2', 'm3'] },
      { id: 'playlist-formativo', name: 'Formativo: decidir jugando', clipIds: ['clip-banda', 'clip-robo', 'clip-tercer'], markerIds: ['m5', 'm4'] }
    ],
    selectedClipId: 'clip-salida',
    selectedPlaylistId: 'playlist-semana',
    microcycle: microTemplate('Juvenil'),
    boardTitle: 'Salida 4-3-3 vs presión alta',
    boardTokens: formationTokens('4-3-3'),
    boardStrokes: [
      { id: 'stroke-demo-1', kind: 'arrow', color: '#00a8ff', width: 5, points: [{ x: 390, y: 320 }, { x: 515, y: 245 }] },
      { id: 'stroke-demo-2', kind: 'arrow', color: '#ffd166', width: 5, points: [{ x: 455, y: 205 }, { x: 590, y: 160 }] }
    ],
    boardFrames: [{
      id: 'frame-inicial', name: 'Momento 1 · Foto inicial',
      tokens: formationTokens('4-3-3'),
      strokes: [
        { id: 'frame-stroke-1', kind: 'arrow', color: '#00a8ff', width: 5, points: [{ x: 390, y: 320 }, { x: 515, y: 245 }] },
        { id: 'frame-stroke-2', kind: 'arrow', color: '#ffd166', width: 5, points: [{ x: 455, y: 205 }, { x: 590, y: 160 }] }
      ]
    }],
    snapshots: [],
    annotations: {},
    customTagButtons: [],
    report: {
      title: 'Informe táctico semanal',
      team: 'Mi equipo',
      category: 'Juvenil',
      rival: 'Próximo rival',
      date: new Date().toISOString().slice(0, 10),
      objective: 'Salir limpio bajo presión y atacar rápido tras recuperar.',
      strengths: 'El equipo reconoce cuándo bajar al pivote y cuándo jugar directo a banda.',
      improvements: 'Reducir pérdidas en carril central y mejorar coberturas del primer salto.',
      plan: 'MD-5 salida, MD-4 presión y transición, MD-2 velocidad y ABP, MD-1 activación.',
      clipId: 'clip-salida'
    }
  };
}

function loadPersisted(): PersistedState {
  const defaults = getDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const clips = Array.isArray(parsed.clips) ? parsed.clips.map((clip) => (
      clip.source === 'file' && clip.url.startsWith('blob:') ? { ...clip, url: '' } : clip
    )) : defaults.clips;
    return {
      ...defaults,
      ...parsed,
      clips,
      trialStartedAt: typeof parsed.trialStartedAt === 'string' ? parsed.trialStartedAt : defaults.trialStartedAt,
      markers: Array.isArray(parsed.markers) ? parsed.markers.map((marker) => ({
        ...marker,
        group: inferMarkerGroup(marker),
        team: marker.team || 'Propio',
        player: marker.player || '',
        zone: marker.zone || 'Sin zona',
        outcome: marker.outcome || 'Neutro',
        rating: marker.rating || 3,
        endTime: marker.endTime ?? marker.time + 6
      })) : defaults.markers,
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists.map((playlist) => ({ ...playlist, markerIds: playlist.markerIds || [] })) : defaults.playlists,
      microcycle: Array.isArray(parsed.microcycle) ? parsed.microcycle : defaults.microcycle,
      boardTokens: Array.isArray(parsed.boardTokens) ? parsed.boardTokens.map((token) => ({ scale: 1, rotation: 0, ...token })) : defaults.boardTokens,
      boardStrokes: Array.isArray(parsed.boardStrokes) ? parsed.boardStrokes : defaults.boardStrokes,
      boardFrames: Array.isArray(parsed.boardFrames) && parsed.boardFrames.length ? parsed.boardFrames : defaults.boardFrames,
      snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : defaults.snapshots,
      annotations: parsed.annotations && typeof parsed.annotations === 'object' ? parsed.annotations : {},
      customTagButtons: Array.isArray(parsed.customTagButtons) ? parsed.customTagButtons : [],
      report: { ...defaults.report, ...(parsed.report || {}) }
    };
  } catch {
    return defaults;
  }
}

function interpolatePath(points: Point[], t: number): Point {
  if (!points.length) return { x: 500, y: 281 };
  if (points.length === 1) return points[0];
  const scaled = clamp(t, 0, 1) * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(scaled));
  const local = scaled - index;
  return {
    x: points[index].x + (points[index + 1].x - points[index].x) * local,
    y: points[index].y + (points[index + 1].y - points[index].y) * local
  };
}

function pointsToPath(points: Point[]) {
  if (!points.length) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function StrokeShape({
  stroke,
  selected = false,
  onSelect,
  editable = false,
  selectedPointIndex = null,
  onPointDown,
  onResizeDown
}: {
  stroke: Stroke;
  selected?: boolean;
  onSelect?: (stroke: Stroke, event: ReactPointerEvent<SVGGElement>) => void;
  editable?: boolean;
  selectedPointIndex?: number | null;
  onPointDown?: (stroke: Stroke, index: number, event: ReactPointerEvent<SVGElement>) => void;
  onResizeDown?: (stroke: Stroke, event: ReactPointerEvent<SVGElement>) => void;
}) {
  if (!stroke.points.length) return null;
  const commonStyle = {
    opacity: stroke.opacity ?? 1,
    filter: stroke.shadow ? `drop-shadow(0 5px 5px rgba(0,0,0,.55)) drop-shadow(0 0 7px ${stroke.color})` : undefined,
    cursor: onSelect ? 'grab' : undefined
  } as React.CSSProperties;
  const selectProps = onSelect ? {
    onPointerDown: (event: ReactPointerEvent<SVGGElement>) => {
      event.stopPropagation();
      event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
      onSelect(stroke, event);
    }
  } : {};
  const bounds = getStrokeBounds(stroke);
  const pointIndices = getEditablePointIndices(stroke);
  const selectionBox = selected && Number.isFinite(bounds.minX) ? (
    <g className="stroke-selection-layer">
      <rect x={bounds.minX - 14} y={bounds.minY - 14} width={Math.max(28, bounds.maxX - bounds.minX + 28)} height={Math.max(28, bounds.maxY - bounds.minY + 28)} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="8 6" rx="8" pointerEvents="none" />
      {editable && pointIndices.map((index) => {
        const point = stroke.points[index];
        if (!point) return null;
        return (
          <circle
            key={`point-${index}`}
            className="stroke-handle point-handle"
            data-handle-index={index}
            cx={point.x}
            cy={point.y}
            r={selectedPointIndex === index ? 11 : 9}
            fill={selectedPointIndex === index ? '#00a8ff' : '#ffffff'}
            stroke="#02101f"
            strokeWidth="3"
            onPointerDown={(event) => {
              event.stopPropagation();
              event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
              onPointDown?.(stroke, index, event);
            }}
          ><title>{stroke.kind === 'beam' ? (index === 0 ? 'Arrastrá para cambiar la altura' : 'Arrastrá para mover el cilindro') : 'Arrastrá este punto'}</title></circle>
        );
      })}
      {editable && stroke.kind === 'beam' && stroke.points.length >= 2 && (
        <circle
          className="stroke-handle beam-radius-handle"
          data-handle-index={2}
          cx={stroke.points[1].x + getBeamRadius(stroke)}
          cy={stroke.points[1].y}
          r="10"
          fill="#ffd166"
          stroke="#02101f"
          strokeWidth="3"
          onPointerDown={(event) => {
            event.stopPropagation();
            event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
            onPointDown?.(stroke, 2, event);
          }}
        ><title>Arrastrá para cambiar el ancho del cilindro</title></circle>
      )}
      {editable && (
        <g
          className="stroke-handle resize-handle"
          transform={`translate(${bounds.maxX + 14} ${bounds.maxY + 14})`}
          onPointerDown={(event) => {
            event.stopPropagation();
            event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
            onResizeDown?.(stroke, event);
          }}
        >
          <title>Arrastrá para agrandar o achicar</title>
          <circle r="11" fill="#00a8ff" stroke="#ffffff" strokeWidth="3" />
          <path d="M-5 5 L5 -5 M1 -5 L5 -5 L5 -1 M-1 5 L-5 5 L-5 1" fill="none" stroke="#02101f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </g>
  ) : null;

  if (stroke.kind === 'beam' && stroke.points.length >= 2) {
    const [source, target] = stroke.points;
    const centerX = target.x;
    const topY = Math.min(source.y, target.y);
    const bottomY = target.y;
    const radius = getBeamRadius(stroke);
    const ry = clamp(radius * 0.24, 10, 46);
    const intensity = clamp(stroke.fillOpacity ?? 0.42, 0.08, 0.85);
    const idSuffix = stroke.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const cylinderId = `beam-cylinder-${idSuffix}`;
    const glowId = `beam-glow-${idSuffix}`;
    const bodyPath = [
      `M ${centerX - radius} ${topY}`,
      `L ${centerX - radius} ${bottomY}`,
      `A ${radius} ${ry} 0 0 0 ${centerX + radius} ${bottomY}`,
      `L ${centerX + radius} ${topY}`,
      `A ${radius} ${ry} 0 0 1 ${centerX - radius} ${topY}`,
      'Z'
    ].join(' ');
    return (
      <g style={commonStyle} {...selectProps}>
        <defs>
          <linearGradient id={cylinderId} gradientUnits="userSpaceOnUse" x1={centerX - radius} y1={topY} x2={centerX + radius} y2={topY}>
            <stop offset="0%" stopColor={stroke.color} stopOpacity={Math.min(0.58, intensity * 1.05)} />
            <stop offset="20%" stopColor="#ffffff" stopOpacity={Math.max(0.08, intensity * 0.38)} />
            <stop offset="50%" stopColor="#ffffff" stopOpacity={Math.min(0.52, intensity * 0.78)} />
            <stop offset="80%" stopColor="#ffffff" stopOpacity={Math.max(0.08, intensity * 0.36)} />
            <stop offset="100%" stopColor={stroke.color} stopOpacity={Math.min(0.58, intensity * 1.02)} />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={Math.min(0.76, intensity * 1.2)} />
            <stop offset="52%" stopColor={stroke.color} stopOpacity={Math.min(0.5, intensity * 0.86)} />
            <stop offset="100%" stopColor={stroke.color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={centerX} cy={bottomY} rx={radius * 1.08} ry={ry * 1.18} fill={`url(#${glowId})`} />
        <path d={bodyPath} fill={`url(#${cylinderId})`} stroke="#ffffff" strokeOpacity="0.58" strokeWidth={Math.max(1.4, stroke.width * 0.38)} />
        <path d={`M ${centerX - radius * 0.34} ${topY + ry * 0.35} L ${centerX - radius * 0.34} ${bottomY - ry * 0.25}`} stroke="#ffffff" strokeOpacity="0.22" strokeWidth={Math.max(7, radius * 0.16)} strokeLinecap="round" />
        <ellipse cx={centerX} cy={topY} rx={radius} ry={ry} fill="#ffffff" fillOpacity={Math.min(0.28, intensity * 0.42)} stroke="#ffffff" strokeOpacity="0.62" strokeWidth="2" />
        <ellipse cx={centerX} cy={bottomY} rx={radius} ry={ry} fill={stroke.color} fillOpacity={Math.min(0.24, intensity * 0.38)} stroke="#ffffff" strokeOpacity="0.82" strokeWidth="2.4" />
        {selectionBox}
      </g>
    );
  }

  if ((stroke.kind === 'zone' || stroke.kind === 'rect' || stroke.kind === 'ellipse' || stroke.kind === 'spotlight') && stroke.points.length >= 2) {
    const [a, b] = stroke.points;
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const width = Math.abs(b.x - a.x);
    const height = Math.abs(b.y - a.y);
    const fillOpacity = stroke.fillOpacity ?? (stroke.kind === 'spotlight' ? 0.34 : 0.16);
    return (
      <g style={commonStyle} {...selectProps}>
        {stroke.kind === 'ellipse' || stroke.kind === 'spotlight' ? (
          <>
            {stroke.kind === 'spotlight' && <ellipse cx={a.x + (b.x - a.x) / 2 + 10} cy={a.y + (b.y - a.y) / 2 + 13} rx={width / 2} ry={height / 2} fill="#000" opacity="0.32" />}
            <ellipse cx={a.x + (b.x - a.x) / 2} cy={a.y + (b.y - a.y) / 2} rx={width / 2} ry={height / 2} fill={stroke.color} fillOpacity={fillOpacity} stroke={stroke.color} strokeWidth={stroke.width} strokeDasharray={stroke.dashed ? '12 8' : undefined} />
            {stroke.kind === 'spotlight' && <ellipse cx={a.x + (b.x - a.x) / 2} cy={a.y + (b.y - a.y) / 2} rx={Math.max(0, width / 2 - 12)} ry={Math.max(0, height / 2 - 12)} fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="2" />}
          </>
        ) : (
          <rect x={x} y={y} width={width} height={height} fill={stroke.color} fillOpacity={fillOpacity} stroke={stroke.color} strokeWidth={stroke.width} strokeDasharray={stroke.dashed || stroke.kind === 'zone' ? '12 8' : undefined} rx="10" />
        )}
        {selectionBox}
      </g>
    );
  }

  if (stroke.kind === 'text') {
    const point = stroke.points[0];
    const fontSize = stroke.fontSize || 24;
    const text = stroke.text || 'Texto';
    const width = Math.max(74, text.length * fontSize * 0.62 + 22);
    return (
      <g style={commonStyle} {...selectProps}>
        <rect x={point.x - 9} y={point.y - fontSize - 9} width={width} height={fontSize + 20} rx="9" fill="rgba(2,9,20,.78)" stroke={stroke.color} strokeWidth="2" />
        <text x={point.x + 2} y={point.y + 3} fill={stroke.color} fontSize={fontSize} fontWeight="900" fontFamily="Arial,sans-serif">{text}</text>
        {selectionBox}
      </g>
    );
  }

  if (stroke.kind === 'polygon') {
    const points = stroke.points.map((point) => `${point.x},${point.y}`).join(' ');
    return (
      <g style={commonStyle} {...selectProps}>
        {stroke.points.length >= 3
          ? <polygon points={points} fill={stroke.color} fillOpacity={stroke.fillOpacity ?? 0.18} stroke={stroke.color} strokeWidth={stroke.width} strokeDasharray={stroke.dashed ? '12 8' : undefined} />
          : <polyline points={points} fill="none" stroke={stroke.color} strokeWidth={stroke.width} strokeLinecap="round" />}
        {stroke.points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="6" fill="#fff" stroke={stroke.color} strokeWidth="3" />)}
        {selectionBox}
      </g>
    );
  }

  if (stroke.kind === 'angle' && stroke.points.length >= 2) {
    const [a, b, c] = stroke.points;
    let label = 'Ángulo';
    if (a && b && c) {
      const v1 = { x: a.x - b.x, y: a.y - b.y };
      const v2 = { x: c.x - b.x, y: c.y - b.y };
      const denominator = Math.max(1, Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y));
      const degrees = Math.round(Math.acos(clamp((v1.x * v2.x + v1.y * v2.y) / denominator, -1, 1)) * 180 / Math.PI);
      label = `${degrees}°`;
    }
    return (
      <g style={commonStyle} {...selectProps}>
        <polyline points={stroke.points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={stroke.color} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" />
        {stroke.points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="6" fill="#fff" stroke={stroke.color} strokeWidth="3" />)}
        {b && <text x={b.x + 14} y={b.y - 12} fill={stroke.color} fontSize="23" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#02101f" strokeWidth="4" paintOrder="stroke">{label}</text>}
        {selectionBox}
      </g>
    );
  }

  const end = stroke.points[stroke.points.length - 1];
  const prev = stroke.points[Math.max(0, stroke.points.length - 2)] || end;
  const angle = Math.atan2(end.y - prev.y, end.x - prev.x);
  const hasArrow = ['arrow', 'curve', 'pass', 'run'].includes(stroke.kind);
  const head = hasArrow ? [
    `${end.x},${end.y}`,
    `${end.x - 24 * Math.cos(angle - Math.PI / 7)},${end.y - 24 * Math.sin(angle - Math.PI / 7)}`,
    `${end.x - 24 * Math.cos(angle + Math.PI / 7)},${end.y - 24 * Math.sin(angle + Math.PI / 7)}`
  ].join(' ') : '';
  const path = stroke.kind === 'run' ? wavyPath(stroke.points)
    : stroke.kind === 'curve' || stroke.kind === 'free' ? smoothPath(stroke.points)
      : pointsToPath(stroke.points);
  const dashed = stroke.dashed || stroke.kind === 'line' || stroke.kind === 'pass' ? '14 10' : undefined;
  const midpoint = stroke.points.length >= 2 ? {
    x: (stroke.points[0].x + end.x) / 2,
    y: (stroke.points[0].y + end.y) / 2
  } : end;

  return (
    <g style={commonStyle} {...selectProps}>
      {onSelect && <path d={path} fill="none" stroke="transparent" strokeWidth={Math.max(22, stroke.width + 16)} strokeLinecap="round" strokeLinejoin="round" />}
      <path d={path} fill="none" stroke={stroke.color} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed} />
      {hasArrow && <polygon points={head} fill={stroke.color} />}
      {stroke.kind === 'link' && stroke.points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="9" fill="#02101f" stroke={stroke.color} strokeWidth="4" />)}
      {stroke.kind === 'measure' && (
        <>
          {stroke.points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="7" fill="#fff" stroke={stroke.color} strokeWidth="4" />)}
          <text x={midpoint.x} y={midpoint.y - 12} textAnchor="middle" fill={stroke.color} fontSize="23" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#02101f" strokeWidth="5" paintOrder="stroke">{fieldDistanceMeters(stroke).toFixed(1)} m</text>
        </>
      )}
      {stroke.text && (
        <text x={midpoint.x + 10} y={midpoint.y - 10} fill={stroke.color} fontSize={stroke.fontSize || 20} fontWeight="900" fontFamily="Arial,sans-serif" stroke="#02101f" strokeWidth="4" paintOrder="stroke">{stroke.text}</text>
      )}
      {selectionBox}
    </g>
  );
}

function PitchLines({ width = 1000, height = 640, compact = false }: { width?: number; height?: number; compact?: boolean }) {
  const sx = width / 1000;
  const sy = height / 640;
  const sw = compact ? 2 : 3;
  return (
    <g stroke="#ffffff" strokeOpacity="0.72" strokeWidth={sw} fill="none">
      <rect x={35 * sx} y={30 * sy} width={930 * sx} height={580 * sy} />
      <line x1={500 * sx} y1={30 * sy} x2={500 * sx} y2={610 * sy} />
      <circle cx={500 * sx} cy={320 * sy} r={82 * sx} />
      <circle cx={500 * sx} cy={320 * sy} r="4" fill="#ffffff" />
      <rect x={35 * sx} y={180 * sy} width={135 * sx} height={280 * sy} />
      <rect x={830 * sx} y={180 * sy} width={135 * sx} height={280 * sy} />
      <rect x={35 * sx} y={250 * sy} width={52 * sx} height={140 * sy} />
      <rect x={913 * sx} y={250 * sy} width={52 * sx} height={140 * sy} />
      <circle cx={125 * sx} cy={320 * sy} r="4" fill="#ffffff" />
      <circle cx={875 * sx} cy={320 * sy} r="4" fill="#ffffff" />
    </g>
  );
}

function MiniPitch({ seed = 1 }: { seed?: number }) {
  const points = Array.from({ length: 9 }, (_, i) => ({
    x: 80 + ((seed * 83 + i * 97) % 840),
    y: 65 + ((seed * 47 + i * 61) % 430)
  }));
  return (
    <svg className="mini-pitch" viewBox="0 0 1000 560" aria-hidden="true">
      <rect width="1000" height="560" fill="#073d24" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={i * 125} y="0" width="62" height="560" fill="#ffffff" opacity="0.035" />
      ))}
      <PitchLines width={1000} height={560} compact />
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r="14" fill={index % 3 === 0 ? '#ef476f' : '#00a8ff'} stroke="#fff" strokeWidth="3" />
      ))}
      <path d={`M ${points[0].x} ${points[0].y} C ${points[3].x} ${points[3].y}, ${points[5].x} ${points[5].y}, ${points[8].x} ${points[8].y}`} fill="none" stroke="#ffd166" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function TacticalSimulation({ clip, time }: { clip: Clip; time: number }) {
  const t = clamp(time / Math.max(1, clip.durationSec), 0, 1);
  const homeBase: Array<[string, number, number]> = [
    ['1', 90, 281], ['2', 235, 100], ['4', 215, 220], ['6', 215, 345], ['3', 235, 465],
    ['5', 390, 281], ['8', 465, 180], ['10', 465, 385], ['7', 650, 110], ['9', 675, 281], ['11', 650, 455]
  ];
  const awayBase = homeBase.map(([label, x, y]) => [label, 1000 - x, y] as [string, number, number]);
  const ballPath: Point[] = clip.id.includes('presion')
    ? [{ x: 565, y: 281 }, { x: 505, y: 250 }, { x: 555, y: 190 }, { x: 690, y: 210 }, { x: 815, y: 281 }]
    : clip.id.includes('bloque')
      ? [{ x: 800, y: 150 }, { x: 650, y: 220 }, { x: 540, y: 300 }, { x: 610, y: 390 }, { x: 760, y: 420 }]
      : clip.id.includes('robo')
        ? [{ x: 430, y: 300 }, { x: 540, y: 245 }, { x: 660, y: 250 }, { x: 800, y: 281 }, { x: 910, y: 281 }]
        : [{ x: 125, y: 281 }, { x: 280, y: 225 }, { x: 390, y: 300 }, { x: 540, y: 210 }, { x: 700, y: 245 }, { x: 860, y: 281 }];
  const ball = interpolatePath(ballPath, t);
  const phaseText = t < 0.33 ? '1 · Inicio de la acción' : t < 0.72 ? '2 · Desarrollo y ventaja' : '3 · Cierre / decisión';

  const moveToken = (x: number, y: number, index: number, away = false) => {
    const direction = away ? -1 : 1;
    const runnerBoost = index >= 8 ? t * 55 * direction : index >= 5 ? t * 28 * direction : t * 12 * direction;
    return {
      x: x + runnerBoost + Math.sin(time * 0.75 + index) * 5,
      y: y + Math.cos(time * 0.55 + index * 1.3) * 6
    };
  };

  return (
    <svg className="simulation-pitch" viewBox="0 0 1000 562" role="img" aria-label={`Simulación táctica: ${clip.title}`}>
      <rect width="1000" height="562" fill="#073d24" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={i * 100} y="0" width="50" height="562" fill="#ffffff" opacity="0.035" />
      ))}
      <PitchLines width={1000} height={562} />
      <path d={pointsToPath(ballPath)} fill="none" stroke="#ffd166" strokeOpacity="0.42" strokeWidth="5" strokeDasharray="10 10" strokeLinecap="round" />
      {awayBase.map(([label, x, y], index) => {
        const p = moveToken(x, y, index, true);
        return (
          <g key={`away-${label}-${index}`}>
            <circle cx={p.x} cy={p.y} r="20" fill="#d90429" stroke="#fff" strokeWidth="3" />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">{label}</text>
          </g>
        );
      })}
      {homeBase.map(([label, x, y], index) => {
        const p = moveToken(x, y, index, false);
        return (
          <g key={`home-${label}-${index}`}>
            <circle cx={p.x} cy={p.y} r="20" fill="#00a8ff" stroke="#fff" strokeWidth="3" />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fill="#02101f" fontSize="14" fontWeight="900">{label}</text>
          </g>
        );
      })}
      <circle cx={ball.x} cy={ball.y} r="13" fill="#fff" stroke="#111" strokeWidth="2" />
      <text x={ball.x} y={ball.y + 4} textAnchor="middle" fontSize="11">⚽</text>
      <g>
        <rect x="28" y="24" width="286" height="38" rx="12" fill="#02101f" fillOpacity="0.82" />
        <text x="44" y="49" fill="#7dd7ff" fontSize="16" fontWeight="800">{phaseText}</text>
      </g>
    </svg>
  );
}

interface AnalyzerProps {
  clips: Clip[];
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
  markers: Marker[];
  setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>;
  playlists: Playlist[];
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
  selectedClipId: string;
  setSelectedClipId: (id: string) => void;
  selectedPlaylistId: string;
  setSelectedPlaylistId: (id: string) => void;
  annotations: Record<string, Stroke[]>;
  setAnnotations: React.Dispatch<React.SetStateAction<Record<string, Stroke[]>>>;
  customTagButtons: CustomTagButton[];
  setCustomTagButtons: React.Dispatch<React.SetStateAction<CustomTagButton[]>>;
  planTier: PlanTier;
  audience: Audience;
  showToast: (message: string) => void;
  goPlans: () => void;
}

function VideoAnalyzer(props: AnalyzerProps) {
  const {
    clips, setClips, markers, setMarkers, playlists, setPlaylists,
    selectedClipId, setSelectedClipId, selectedPlaylistId, setSelectedPlaylistId,
    annotations, setAnnotations, customTagButtons, setCustomTagButtons, planTier, audience, showToast, goPlans
  } = props;

  const selectedClip = clips.find((clip) => clip.id === selectedClipId) || clips[0];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerWrapRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const overlayRef = useRef<SVGSVGElement | null>(null);
  const annotationDragRef = useRef<null | {
    id: string;
    mode: 'move' | 'point' | 'resize';
    index?: number;
    startPointer: Point;
    startPoints: Point[];
    startBounds: StrokeBounds;
    startRadius?: number;
    startFontSize?: number;
  }>(null);

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'Todas' | Audience>('Todas');
  const [phaseFilter, setPhaseFilter] = useState('Todas');
  const [systemFilter, setSystemFilter] = useState('Todas');
  const [conceptFilter, setConceptFilter] = useState('Todas');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(selectedClip?.durationSec || 0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeedValue] = useState(1);
  const [muted, setMuted] = useState(false);
  const [youtubeStart, setYoutubeStart] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [videoTool, setVideoTool] = useState<Tool>('free');
  const [drawColor, setDrawColor] = useState('#ffd166');
  const [videoStrokeWidth, setVideoStrokeWidth] = useState(5);
  const [videoStrokeOpacity, setVideoStrokeOpacity] = useState(1);
  const [videoFillOpacity, setVideoFillOpacity] = useState(0.22);
  const [videoStrokeDashed, setVideoStrokeDashed] = useState(false);
  const [videoStrokeShadow, setVideoStrokeShadow] = useState(true);
  const [videoText, setVideoText] = useState('¡Acá!');
  const [annotationDuration, setAnnotationDuration] = useState(5);
  const [showAllAnnotations, setShowAllAnnotations] = useState(false);
  const [draftStroke, setDraftStroke] = useState<Stroke | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState('');
  const [selectedAnnotationPointIndex, setSelectedAnnotationPointIndex] = useState<number | null>(null);
  const [videoPendingPoints, setVideoPendingPoints] = useState<Point[]>([]);
  const [redoAnnotations, setRedoAnnotations] = useState<Stroke[]>([]);
  const [inPoint, setInPoint] = useState(0);
  const [outPoint, setOutPoint] = useState(0);
  const [loopSelection, setLoopSelection] = useState(false);
  const [preRoll, setPreRoll] = useState(4);
  const [postRoll, setPostRoll] = useState(7);
  const [timelineZoom, setTimelineZoom] = useState(1);

  const [markerLabel, setMarkerLabel] = useState(MARKER_TAGS[0]);
  const [markerNote, setMarkerNote] = useState('');
  const [markerGroup, setMarkerGroup] = useState('Jugador / equipo');
  const [markerTeam, setMarkerTeam] = useState<EventTeam>('Propio');
  const [markerPlayer, setMarkerPlayer] = useState('');
  const [markerZone, setMarkerZone] = useState(EVENT_ZONES[1]);
  const [markerOutcome, setMarkerOutcome] = useState<EventOutcome>('Neutro');
  const [markerRating, setMarkerRating] = useState(3);
  const [markerFieldPoint, setMarkerFieldPoint] = useState<Point>({ x: 50, y: 50 });
  const [editingMarkerId, setEditingMarkerId] = useState('');
  const [selectedMarkerId, setSelectedMarkerId] = useState('');
  const [compareMarkerIds, setCompareMarkerIds] = useState<string[]>([]);
  const [eventSearch, setEventSearch] = useState('');
  const [eventGroupFilter, setEventGroupFilter] = useState('Todos');
  const [eventTeamFilter, setEventTeamFilter] = useState('Todos');
  const [eventOutcomeFilter, setEventOutcomeFilter] = useState('Todos');
  const [matrixDimension, setMatrixDimension] = useState<'outcome' | 'zone' | 'team'>('outcome');
  const [customTagLabel, setCustomTagLabel] = useState('');
  const [customTagGroup, setCustomTagGroup] = useState('Jugador / equipo');
  const [presentationIndex, setPresentationIndex] = useState(0);
  const [videoWorkspaceTab, setVideoWorkspaceTab] = useState<VideoWorkspaceTab>('tagging');
  const [drawPaletteOpen, setDrawPaletteOpen] = useState(true);

  const [form, setForm] = useState({
    title: '', url: '', level: audience as Audience, phase: PHASES[0], system: SYSTEMS[0], concept: CONCEPTS[0], durationSec: 60, notes: ''
  });
  const [editingClipId, setEditingClipId] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const pausePlayback = () => {
    setPlaying(false);
    videoRef.current?.pause();
  };

  const openVideoWorkspace = (tab: VideoWorkspaceTab) => {
    setVideoWorkspaceTab(tab);
    const shouldDraw = tab === 'drawing';
    setDrawing(shouldDraw);
    if (shouldDraw) {
      pausePlayback();
      setDrawPaletteOpen(true);
    }
  };

  const chooseVideoTool = (tool: Tool) => {
    setVideoTool(tool);
    setVideoWorkspaceTab('drawing');
    setDrawing(true);
    setDraftStroke(null);
    if (!['polygon', 'angle'].includes(tool)) setVideoPendingPoints([]);
    pausePlayback();
  };

  const clipMarkers = useMemo(
    () => markers.filter((marker) => marker.clipId === selectedClip?.id).sort((a, b) => a.time - b.time),
    [markers, selectedClip?.id]
  );

  const filteredMarkers = useMemo(() => clipMarkers.filter((marker) => {
    const group = inferMarkerGroup(marker);
    const query = eventSearch.trim().toLowerCase();
    const matchesQuery = !query || `${marker.label} ${marker.note} ${marker.player || ''} ${group}`.toLowerCase().includes(query);
    return matchesQuery
      && (eventGroupFilter === 'Todos' || group === eventGroupFilter)
      && (eventTeamFilter === 'Todos' || (marker.team || 'Propio') === eventTeamFilter)
      && (eventOutcomeFilter === 'Todos' || (marker.outcome || 'Neutro') === eventOutcomeFilter);
  }), [clipMarkers, eventSearch, eventGroupFilter, eventTeamFilter, eventOutcomeFilter]);

  const eventStats = useMemo(() => {
    const count = (items: string[]) => items.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item]: (acc[item] || 0) + 1 }), {});
    return {
      byGroup: count(clipMarkers.map((marker) => inferMarkerGroup(marker))),
      byLabel: count(clipMarkers.map((marker) => marker.label)),
      byOutcome: count(clipMarkers.map((marker) => marker.outcome || 'Neutro')),
      byTeam: count(clipMarkers.map((marker) => marker.team || 'Propio')),
      byZone: count(clipMarkers.map((marker) => marker.zone || 'Sin zona'))
    };
  }, [clipMarkers]);

  const visibleAnnotations = useMemo(() => (annotations[selectedClip?.id || ''] || []).filter((stroke) => {
    if (showAllAnnotations || stroke.startTime === undefined) return true;
    return currentTime >= stroke.startTime && currentTime <= (stroke.endTime ?? stroke.startTime + 5);
  }), [annotations, selectedClip?.id, showAllAnnotations, currentTime]);

  const selectedAnnotation = (annotations[selectedClip?.id || ''] || []).find((stroke) => stroke.id === selectedAnnotationId);

  const filteredClips = useMemo(() => clips.filter((clip) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || `${clip.title} ${clip.notes} ${clip.concept}`.toLowerCase().includes(q);
    return matchesSearch
      && (levelFilter === 'Todas' || clip.level === levelFilter)
      && (phaseFilter === 'Todas' || clip.phase === phaseFilter)
      && (systemFilter === 'Todas' || clip.system === systemFilter)
      && (conceptFilter === 'Todas' || clip.concept === conceptFilter)
      && (!favoritesOnly || clip.favorite);
  }), [clips, search, levelFilter, phaseFilter, systemFilter, conceptFilter, favoritesOnly]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(selectedClip?.durationSec || 0);
    setPlaying(false);
    setYoutubeStart(0);
    setMarkerNote('');
    setEditingMarkerId('');
    setSelectedMarkerId('');
    setInPoint(0);
    setOutPoint(selectedClip?.durationSec || 0);
    setLoopSelection(false);
    setVideoPendingPoints([]);
    setDraftStroke(null);
    setSelectedAnnotationId('');
    setSelectedAnnotationPointIndex(null);
    annotationDragRef.current = null;
    setPresentationIndex(0);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [selectedClip?.id]);

  useEffect(() => {
    if (!selectedClip || selectedClip.source !== 'demo' || !playing) return;
    const timer = window.setInterval(() => {
      setCurrentTime((previous) => {
        const next = previous + 0.1 * speed;
        if (loopSelection && outPoint > inPoint && next >= outPoint) return inPoint;
        if (next >= selectedClip.durationSec) {
          setPlaying(false);
          return selectedClip.durationSec;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [selectedClip, playing, speed, loopSelection, inPoint, outPoint]);

  if (!selectedClip) {
    return <div className="empty-card">Todavía no hay clips. Agregá el primero desde el panel de carga.</div>;
  }

  const customClipsCount = clips.filter((clip) => clip.source !== 'demo').length;
  const freeLimitReached = planTier === 'free' && customClipsCount >= 3 && !editingClipId;

  const seek = (time: number) => {
    const safe = clamp(time, 0, Math.max(duration || selectedClip.durationSec, 0));
    setCurrentTime(safe);
    if (selectedClip.source === 'mp4' || selectedClip.source === 'file') {
      if (videoRef.current) videoRef.current.currentTime = safe;
    }
    if (selectedClip.source === 'youtube') setYoutubeStart(Math.floor(safe));
  };

  const togglePlay = async () => {
    if (selectedClip.source === 'demo') {
      if (currentTime >= selectedClip.durationSec) setCurrentTime(0);
      setPlaying((v) => !v);
      return;
    }
    if (selectedClip.source === 'youtube') {
      showToast('En YouTube usá los controles del reproductor; los marcadores sí quedan guardados.');
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused) {
        await video.play();
        setPlaying(true);
      } else {
        video.pause();
        setPlaying(false);
      }
    } catch {
      showToast('El navegador no pudo reproducir este archivo o enlace.');
    }
  };

  const handlePlayerShellPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    if (target.closest('button, input, select, textarea, a')) return;
    if (selectedClip.source === 'youtube') return;
    if (videoWorkspaceTab === 'drawing' || playing) pausePlayback();
    else void togglePlay();
  };

  const setSpeed = (value: number) => {
    setSpeedValue(value);
    if (videoRef.current) videoRef.current.playbackRate = value;
  };

  const frameStep = (frames: number) => {
    seek(currentTime + frames / 30);
    setPlaying(false);
    if (videoRef.current) videoRef.current.pause();
  };

  const markInPoint = () => {
    setInPoint(currentTime);
    if (outPoint <= currentTime) setOutPoint(Math.min(duration || selectedClip.durationSec, currentTime + 6));
    showToast(`IN marcado en ${formatPreciseTime(currentTime)}.`);
  };

  const markOutPoint = () => {
    setOutPoint(currentTime);
    if (inPoint >= currentTime) setInPoint(Math.max(0, currentTime - 6));
    showToast(`OUT marcado en ${formatPreciseTime(currentTime)}.`);
  };

  const handleAnalyzerKeys = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setDraftStroke(null);
      setVideoPendingPoints([]);
      annotationDragRef.current = null;
      setVideoTool('select');
      setVideoWorkspaceTab('drawing');
      setDrawing(true);
      pausePlayback();
      showToast('Puntero activado: tocá un dibujo para moverlo o arrastrá sus puntos para editarlo.');
      return;
    }
    if (videoWorkspaceTab === 'drawing' && event.key === 'Enter' && videoTool === 'polygon') {
      event.preventDefault();
      finishVideoPolygon();
      return;
    }
    if (videoWorkspaceTab === 'drawing' && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      if (videoPendingPoints.length) {
        setVideoPendingPoints((previous) => previous.slice(0, -1));
        showToast('Último vértice borrado.');
      } else if (selectedAnnotationId) {
        deleteSelectedAnnotation();
      }
      return;
    }
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'k') { event.preventDefault(); void togglePlay(); }
    else if (key === 'j') seek(currentTime - 5);
    else if (key === 'l') seek(currentTime + 5);
    else if (key === 'arrowleft') frameStep(-1);
    else if (key === 'arrowright') frameStep(1);
    else if (key === 'i') markInPoint();
    else if (key === 'o') markOutPoint();
    else if (key === 'm') showToast('Usá el panel de marcadores o un botón rápido para crear el evento en este segundo.');
  };

  const addOrUpdateMarker = () => {
    if (!markerNote.trim()) {
      showToast('Escribí una observación breve para el marcador.');
      return;
    }
    const safeEnd = Math.max(currentTime, outPoint > currentTime ? outPoint : currentTime + postRoll);
    const payload: Partial<Marker> = {
      label: markerLabel,
      note: markerNote.trim(),
      time: currentTime,
      endTime: safeEnd,
      group: markerGroup,
      team: markerTeam,
      player: markerPlayer.trim(),
      zone: markerZone,
      outcome: markerOutcome,
      rating: markerRating,
      fieldX: markerFieldPoint.x,
      fieldY: markerFieldPoint.y
    };
    if (editingMarkerId) {
      setMarkers((previous) => previous.map((marker) => marker.id === editingMarkerId ? { ...marker, ...payload } : marker));
      setEditingMarkerId('');
      showToast('Evento actualizado con todos sus descriptores.');
    } else {
      const marker = { id: uid('marker'), clipId: selectedClip.id, ...payload } as Marker;
      setMarkers((previous) => [...previous, marker]);
      setSelectedMarkerId(marker.id);
      showToast(`Evento “${markerLabel}” guardado en ${formatPreciseTime(currentTime)}.`);
    }
    setMarkerNote('');
  };

  const quickTag = (group: string, label: string) => {
    const eventTime = clamp(currentTime, 0, duration || selectedClip.durationSec || currentTime);
    const marker: Marker = {
      id: uid('event'), clipId: selectedClip.id,
      time: eventTime,
      endTime: Math.min(duration || selectedClip.durationSec || eventTime + postRoll, eventTime + postRoll),
      group, label,
      note: `${label} registrado desde el panel rápido. Contexto: ${selectedClip.phase} · ${selectedClip.concept}.`,
      team: markerTeam, player: markerPlayer.trim(), zone: markerZone, outcome: markerOutcome, rating: markerRating,
      fieldX: markerFieldPoint.x, fieldY: markerFieldPoint.y,
      descriptors: [`Pre-roll ${preRoll}s`, `Post-roll ${postRoll}s`]
    };
    setMarkers((previous) => [...previous, marker]);
    setSelectedMarkerId(marker.id);
    setMarkerGroup(group);
    setMarkerLabel(label);
    showToast(`Evento rápido: ${label} en ${formatPreciseTime(eventTime)} (incluye ${preRoll}s previos al revisar).`);
  };

  const editMarker = (marker: Marker) => {
    openVideoWorkspace('events');
    setEditingMarkerId(marker.id);
    setSelectedMarkerId(marker.id);
    setMarkerLabel(marker.label);
    setMarkerNote(marker.note);
    setMarkerGroup(inferMarkerGroup(marker));
    setMarkerTeam(marker.team || 'Propio');
    setMarkerPlayer(marker.player || '');
    setMarkerZone(marker.zone || EVENT_ZONES[1]);
    setMarkerOutcome(marker.outcome || 'Neutro');
    setMarkerRating(marker.rating || 3);
    setMarkerFieldPoint({ x: marker.fieldX ?? 50, y: marker.fieldY ?? 50 });
    setInPoint(Math.max(0, marker.time - preRoll));
    setOutPoint(markerEnd(marker));
    seek(marker.time);
  };

  const jumpToMarker = (marker: Marker) => {
    setSelectedMarkerId(marker.id);
    if (marker.clipId !== selectedClip.id) {
      setSelectedClipId(marker.clipId);
      showToast('Clip del evento cargado. Tocá otra vez el evento para ir al segundo exacto.');
      return;
    }
    setInPoint(Math.max(0, marker.time - preRoll));
    setOutPoint(markerEnd(marker));
    seek(Math.max(0, marker.time - preRoll));
  };

  const toggleCompareMarker = (markerId: string) => {
    setCompareMarkerIds((previous) => previous.includes(markerId)
      ? previous.filter((id) => id !== markerId)
      : [...previous.slice(-1), markerId]);
  };

  const exportEvents = (format: 'csv' | 'xml' | 'json') => {
    const rows = clipMarkers.map((marker) => ({
      clip: selectedClip.title,
      inicio: Number(marker.time.toFixed(2)),
      fin: Number(markerEnd(marker).toFixed(2)),
      grupo: inferMarkerGroup(marker),
      evento: marker.label,
      equipo: marker.team || 'Propio',
      jugador: marker.player || '',
      zona: marker.zone || '',
      resultado: marker.outcome || 'Neutro',
      valoracion: marker.rating || 3,
      nota: marker.note,
      x: marker.fieldX ?? '',
      y: marker.fieldY ?? ''
    }));
    const safeName = selectedClip.title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-').replace(/^-|-$/g, '') || 'eventos-Ramela';
    if (format === 'json') {
      downloadText(`${safeName}-eventos.json`, JSON.stringify(rows, null, 2), 'application/json;charset=utf-8');
    } else if (format === 'csv') {
      const header = Object.keys(rows[0] || { clip: '', inicio: '', fin: '', grupo: '', evento: '', equipo: '', jugador: '', zona: '', resultado: '', valoracion: '', nota: '', x: '', y: '' });
      const content = [header.join(';'), ...rows.map((row) => header.map((key) => csvEscape((row as Record<string, string | number>)[key])).join(';'))].join('\n');
      downloadText(`${safeName}-eventos.csv`, content, 'text/csv;charset=utf-8');
    } else {
      const xmlRows = rows.map((row) => `  <event start="${row.inicio}" end="${row.fin}" group="${escapeHtml(row.grupo)}" label="${escapeHtml(row.evento)}" team="${escapeHtml(row.equipo)}" player="${escapeHtml(row.jugador)}" zone="${escapeHtml(row.zona)}" outcome="${escapeHtml(row.resultado)}"><note>${escapeHtml(row.nota)}</note></event>`).join('\n');
      downloadText(`${safeName}-eventos.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<ramelaLab clip="${escapeHtml(selectedClip.title)}">\n${xmlRows}\n</ramelaLab>`, 'application/xml;charset=utf-8');
    }
    showToast(`Eventos exportados en ${format.toUpperCase()} para Excel u otro software.`);
  };

  const createCustomTagButton = () => {
    if (!customTagLabel.trim()) return;
    const button: CustomTagButton = {
      id: uid('tag'), group: customTagGroup, label: customTagLabel.trim(), color: TAG_COLORS[customTagGroup] || '#00a8ff'
    };
    setCustomTagButtons((previous) => [...previous, button]);
    setCustomTagLabel('');
    showToast(`Botón personalizado “${button.label}” agregado al panel.`);
  };

  const saveClipNotes = (notes: string) => {
    setClips((previous) => previous.map((clip) => clip.id === selectedClip.id ? { ...clip, notes } : clip));
  };

  const startEditClip = (clip: Clip) => {
    openVideoWorkspace('clips');
    setEditingClipId(clip.id);
    setForm({
      title: clip.title,
      url: clip.url,
      level: clip.level,
      phase: clip.phase,
      system: clip.system,
      concept: clip.concept,
      durationSec: clip.durationSec,
      notes: clip.notes
    });
    setSelectedClipId(clip.id);
  };

  const submitClip = () => {
    if (!form.title.trim()) {
      showToast('El clip necesita un título.');
      return;
    }
    if (freeLimitReached) {
      showToast('La prueba vencida permite 3 clips propios. Activá DT Pro para clips ilimitados.');
      goPlans();
      return;
    }
    let source: ClipSource = 'demo';
    let url = form.url.trim();
    const youtubeId = getYouTubeId(url);
    if (youtubeId) {
      source = 'youtube';
      url = `https://www.youtube.com/embed/${youtubeId}`;
    } else if (url) {
      source = 'mp4';
    }

    if (editingClipId) {
      setClips((previous) => previous.map((clip) => clip.id === editingClipId ? {
        ...clip, title: form.title.trim(), url, source: clip.source === 'file' && !url ? 'file' : source,
        level: form.level, phase: form.phase, system: form.system, concept: form.concept,
        durationSec: Math.max(1, Number(form.durationSec) || 60), notes: form.notes
      } : clip));
      showToast('Clip actualizado.');
      setEditingClipId('');
    } else {
      const clip: Clip = {
        id: uid('clip'), title: form.title.trim(), url, source, level: form.level, phase: form.phase,
        system: form.system, concept: form.concept, durationSec: Math.max(1, Number(form.durationSec) || 60),
        notes: form.notes, favorite: false, createdAt: new Date().toISOString()
      };
      setClips((previous) => [clip, ...previous]);
      setSelectedClipId(clip.id);
      showToast(source === 'demo' ? 'Caso táctico creado con simulación.' : 'Clip agregado a tu videoteca.');
    }
    setForm({ title: '', url: '', level: audience, phase: PHASES[0], system: SYSTEMS[0], concept: CONCEPTS[0], durationSec: 60, notes: '' });
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (planTier === 'free' && customClipsCount >= 3) {
      showToast('Llegaste al límite de la prueba vencida: 3 clips propios.');
      goPlans();
      return;
    }
    const clip: Clip = {
      id: uid('clip'), title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      level: audience, phase: PHASES[0], system: SYSTEMS[0], concept: CONCEPTS[0], source: 'file',
      url: URL.createObjectURL(file), durationSec: 0, notes: 'Video abierto desde este dispositivo. En la versión en la nube se sube a tu cuenta privada.',
      favorite: false, createdAt: new Date().toISOString()
    };
    setClips((previous) => [clip, ...previous]);
    setSelectedClipId(clip.id);
    showToast('Video local cargado para analizar.');
  };

  const deleteClip = (clip: Clip) => {
    if (!window.confirm(`¿Eliminar "${clip.title}" y sus marcadores?`)) return;
    const remaining = clips.filter((item) => item.id !== clip.id);
    setClips(remaining);
    setMarkers((previous) => previous.filter((marker) => marker.clipId !== clip.id));
    setPlaylists((previous) => previous.map((playlist) => ({ ...playlist, clipIds: playlist.clipIds.filter((id) => id !== clip.id) })));
    if (selectedClipId === clip.id && remaining[0]) setSelectedClipId(remaining[0].id);
    showToast('Clip eliminado.');
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    if (planTier === 'free' && playlists.length >= 2) {
      showToast('La prueba vencida incluye 2 playlists. Pasá a DT Pro para crear más.');
      goPlans();
      return;
    }
    const playlist = { id: uid('playlist'), name: newPlaylistName.trim(), clipIds: [selectedClip.id] };
    setPlaylists((previous) => [...previous, playlist]);
    setSelectedPlaylistId(playlist.id);
    setNewPlaylistName('');
    showToast('Playlist creada con el clip actual.');
  };

  const toggleClipInPlaylist = (playlistId: string) => {
    setPlaylists((previous) => previous.map((playlist) => {
      if (playlist.id !== playlistId) return playlist;
      const exists = playlist.clipIds.includes(selectedClip.id);
      return { ...playlist, clipIds: exists ? playlist.clipIds.filter((id) => id !== selectedClip.id) : [...playlist.clipIds, selectedClip.id] };
    }));
  };

  const currentPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId) || playlists[0];
  const nextInPlaylist = () => {
    if (!currentPlaylist?.clipIds.length) return;
    const index = currentPlaylist.clipIds.indexOf(selectedClip.id);
    const nextId = currentPlaylist.clipIds[(index + 1 + currentPlaylist.clipIds.length) % currentPlaylist.clipIds.length];
    setSelectedClipId(nextId);
  };

  const toggleMarkerInPresentation = (markerId: string) => {
    if (!currentPlaylist) {
      showToast('Primero creá o elegí una playlist/presentación.');
      return;
    }
    setPlaylists((previous) => previous.map((playlist) => {
      if (playlist.id !== currentPlaylist.id) return playlist;
      const markerIds = playlist.markerIds || [];
      return { ...playlist, markerIds: markerIds.includes(markerId) ? markerIds.filter((id) => id !== markerId) : [...markerIds, markerId] };
    }));
  };

  const movePresentationMarker = (markerId: string, direction: -1 | 1) => {
    if (!currentPlaylist) return;
    setPlaylists((previous) => previous.map((playlist) => {
      if (playlist.id !== currentPlaylist.id) return playlist;
      const markerIds = [...(playlist.markerIds || [])];
      const index = markerIds.indexOf(markerId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= markerIds.length) return playlist;
      [markerIds[index], markerIds[nextIndex]] = [markerIds[nextIndex], markerIds[index]];
      return { ...playlist, markerIds };
    }));
  };

  const presentationMarkers = (currentPlaylist?.markerIds || [])
    .map((id) => markers.find((marker) => marker.id === id))
    .filter((marker): marker is Marker => Boolean(marker));

  const goPresentationMarker = (index: number) => {
    const marker = presentationMarkers[index];
    if (!marker) return;
    setPresentationIndex(index);
    jumpToMarker(marker);
  };

  const svgElementToImage = (svg: SVGSVGElement, width: number, height: number) => new Promise<HTMLImageElement>((resolve, reject) => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo rasterizar el SVG')); };
    image.src = url;
  });

  const captureFrame = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#02101f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    try {
      if (selectedClip.source === 'demo') {
        const simulation = playerWrapRef.current?.querySelector('.simulation-pitch') as SVGSVGElement | null;
        if (!simulation) throw new Error('Sin simulación');
        ctx.drawImage(await svgElementToImage(simulation, canvas.width, canvas.height), 0, 0, canvas.width, canvas.height);
      } else if (selectedClip.source === 'youtube') {
        showToast('YouTube no permite capturar su imagen desde otro sitio. Usá la pizarra o un archivo MP4 propio.');
        return;
      } else {
        const video = videoRef.current;
        if (!video || !video.videoWidth) {
          showToast('Primero cargá un video MP4/WebM o un archivo local.');
          return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      if (overlayRef.current && visibleAnnotations.length) {
        ctx.drawImage(await svgElementToImage(overlayRef.current, canvas.width, canvas.height), 0, 0, canvas.width, canvas.height);
      }
      ctx.fillStyle = 'rgba(2,16,31,.82)';
      ctx.fillRect(18, canvas.height - 58, 360, 40);
      ctx.fillStyle = '#7dd7ff';
      ctx.font = '800 21px Arial';
      ctx.fillText(`Ramela Lab · ${formatPreciseTime(currentTime)}`, 32, canvas.height - 30);
      downloadUrl(canvas.toDataURL('image/png'), `fotograma-telestrado-${formatTime(currentTime).replace(':', '-')}.png`);
      showToast('Fotograma con dibujos descargado.');
    } catch {
      showToast('Este video externo no permite capturar fotogramas por permisos CORS.');
    }
  };

  const getOverlayPoint = (event: ReactPointerEvent<SVGSVGElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 1000, 0, 1000),
      y: clamp(((event.clientY - rect.top) / rect.height) * 562, 0, 562)
    };
  };

  const getOverlayPointFromClient = (clientX: number, clientY: number): Point => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 1000, 0, 1000),
      y: clamp(((clientY - rect.top) / rect.height) * 562, 0, 562)
    };
  };

  const updateAnnotation = (id: string, updater: (stroke: Stroke) => Stroke) => {
    setAnnotations((previous) => ({
      ...previous,
      [selectedClip.id]: (previous[selectedClip.id] || []).map((stroke) => stroke.id === id ? updater(stroke) : stroke)
    }));
  };

  const startAnnotationDrag = (
    stroke: Stroke,
    mode: 'move' | 'point' | 'resize',
    startPointer: Point,
    index?: number
  ) => {
    pausePlayback();
    setVideoWorkspaceTab('drawing');
    setDrawing(true);
    setVideoTool('select');
    setSelectedAnnotationId(stroke.id);
    setSelectedAnnotationPointIndex(mode === 'point' ? (index ?? null) : null);
    annotationDragRef.current = {
      id: stroke.id,
      mode,
      index,
      startPointer,
      startPoints: structuredClone(stroke.points),
      startBounds: getStrokeBounds(stroke),
      startRadius: getBeamRadius(stroke),
      startFontSize: stroke.fontSize || 24
    };
  };

  const selectAnnotation = (stroke: Stroke, event: ReactPointerEvent<SVGGElement>) => {
    startAnnotationDrag(stroke, 'move', getOverlayPointFromClient(event.clientX, event.clientY));
  };

  const startAnnotationPointDrag = (stroke: Stroke, index: number, event: ReactPointerEvent<SVGElement>) => {
    startAnnotationDrag(stroke, 'point', getOverlayPointFromClient(event.clientX, event.clientY), index);
  };

  const startAnnotationResize = (stroke: Stroke, event: ReactPointerEvent<SVGElement>) => {
    startAnnotationDrag(stroke, 'resize', getOverlayPointFromClient(event.clientX, event.clientY));
  };

  const deleteSelectedAnnotation = () => {
    if (!selectedAnnotation) return;
    setAnnotations((previous) => ({
      ...previous,
      [selectedClip.id]: (previous[selectedClip.id] || []).filter((stroke) => stroke.id !== selectedAnnotation.id)
    }));
    setSelectedAnnotationId('');
    setSelectedAnnotationPointIndex(null);
    annotationDragRef.current = null;
    showToast(`${strokeKindLabel(selectedAnnotation.kind)} eliminado.`);
  };

  const duplicateSelectedAnnotation = () => {
    if (!selectedAnnotation) return;
    const copy: Stroke = {
      ...structuredClone(selectedAnnotation),
      id: uid('annotation'),
      points: selectedAnnotation.points.map((point) => ({ x: clamp(point.x + 28, 0, 1000), y: clamp(point.y + 28, 0, 562) }))
    };
    setAnnotations((previous) => ({ ...previous, [selectedClip.id]: [...(previous[selectedClip.id] || []), copy] }));
    setSelectedAnnotationId(copy.id);
    setSelectedAnnotationPointIndex(null);
    showToast('Dibujo duplicado y seleccionado.');
  };

  const deleteSelectedAnnotationPoint = () => {
    if (!selectedAnnotation || selectedAnnotationPointIndex === null) return;
    const minPoints = selectedAnnotation.kind === 'polygon' ? 4 : 3;
    if (selectedAnnotation.points.length < minPoints) {
      showToast(selectedAnnotation.kind === 'polygon' ? 'Un polígono necesita al menos 3 vértices.' : 'Este trazo necesita conservar sus puntos principales.');
      return;
    }
    updateAnnotation(selectedAnnotation.id, (stroke) => ({
      ...stroke,
      points: stroke.points.filter((_, index) => index !== selectedAnnotationPointIndex)
    }));
    setSelectedAnnotationPointIndex(null);
  };

  const addAnnotationMidpoint = () => {
    if (!selectedAnnotation || selectedAnnotation.points.length < 2) return;
    const points = selectedAnnotation.points;
    const segmentCount = selectedAnnotation.kind === 'polygon' ? points.length : points.length - 1;
    let bestIndex = 0;
    let bestLength = -1;
    for (let index = 0; index < segmentCount; index += 1) {
      const length = distanceBetween(points[index], points[(index + 1) % points.length]);
      if (length > bestLength) { bestLength = length; bestIndex = index; }
    }
    const a = points[bestIndex];
    const b = points[(bestIndex + 1) % points.length];
    const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const nextPoints = selectedAnnotation.kind === 'polygon' && bestIndex === points.length - 1
      ? [...points, midpoint]
      : [...points.slice(0, bestIndex + 1), midpoint, ...points.slice(bestIndex + 1)];
    updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, points: nextPoints }));
    setSelectedAnnotationPointIndex(bestIndex + 1);
  };

  const scaleSelectedAnnotation = (factor: number) => {
    if (!selectedAnnotation) return;
    const bounds = getStrokeBounds(selectedAnnotation);
    const center = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
    updateAnnotation(selectedAnnotation.id, (stroke) => ({
      ...stroke,
      points: stroke.points.map((point) => ({
        x: clamp(center.x + (point.x - center.x) * factor, 0, 1000),
        y: clamp(center.y + (point.y - center.y) * factor, 0, 562)
      })),
      radius: stroke.kind === 'beam' ? clamp(getBeamRadius(stroke) * factor, 18, 260) : stroke.radius,
      fontSize: stroke.kind === 'text' ? clamp(Math.round((stroke.fontSize || 24) * factor), 12, 54) : stroke.fontSize
    }));
  };

  const makeVideoStroke = (kind: StrokeKind, points: Point[]): Stroke => ({
    id: uid('annotation'),
    kind,
    color: drawColor,
    width: videoStrokeWidth,
    points,
    opacity: videoStrokeOpacity,
    fillOpacity: kind === 'beam' ? Math.max(videoFillOpacity, 0.42) : videoFillOpacity,
    dashed: videoStrokeDashed,
    shadow: videoStrokeShadow,
    text: kind === 'text' ? videoText.trim() || 'Texto' : undefined,
    fontSize: 25,
    radius: kind === 'beam' ? clamp(54 + videoStrokeWidth * 5, 56, 120) : undefined,
    startTime: annotationDuration ? currentTime : undefined,
    endTime: annotationDuration ? currentTime + annotationDuration : undefined
  });

  const eraseVideoAt = (point: Point) => {
    setAnnotations((previous) => {
      const current = previous[selectedClip.id] || [];
      const target = [...current].reverse().find((stroke) => strokeHit(stroke, point, 16));
      if (!target) return previous;
      return { ...previous, [selectedClip.id]: current.filter((stroke) => stroke.id !== target.id) };
    });
  };

  const finishVideoPolygon = () => {
    if (videoPendingPoints.length < 3) return;
    const stroke = makeVideoStroke('polygon', videoPendingPoints);
    setAnnotations((previous) => ({ ...previous, [selectedClip.id]: [...(previous[selectedClip.id] || []), stroke] }));
    setSelectedAnnotationId(stroke.id);
    setSelectedAnnotationPointIndex(null);
    setVideoPendingPoints([]);
    setRedoAnnotations([]);
    showToast('Polígono creado y seleccionado. Con el Puntero podés moverlo, editar vértices o eliminarlo.');
  };

  const overlayDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    pausePlayback();
    if (!drawing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getOverlayPoint(event);
    if (videoTool === 'select') {
      setSelectedAnnotationId('');
      setSelectedAnnotationPointIndex(null);
      return;
    }
    if (videoTool === 'eraser') {
      eraseVideoAt(point);
      setSelectedAnnotationId('');
      setSelectedAnnotationPointIndex(null);
      return;
    }
    if (videoTool === 'text') {
      const stroke = makeVideoStroke('text', [point]);
      setAnnotations((previous) => ({ ...previous, [selectedClip.id]: [...(previous[selectedClip.id] || []), stroke] }));
      setSelectedAnnotationId(stroke.id);
      setSelectedAnnotationPointIndex(0);
      setRedoAnnotations([]);
      return;
    }
    if (videoTool === 'polygon' || videoTool === 'angle') {
      const next = [...videoPendingPoints, point];
      if (videoTool === 'angle' && next.length === 3) {
        const stroke = makeVideoStroke('angle', next);
        setAnnotations((previous) => ({ ...previous, [selectedClip.id]: [...(previous[selectedClip.id] || []), stroke] }));
        setSelectedAnnotationId(stroke.id);
        setSelectedAnnotationPointIndex(null);
        setVideoPendingPoints([]);
        setRedoAnnotations([]);
      } else {
        setVideoPendingPoints(next);
      }
      return;
    }
    setDraftStroke(makeVideoStroke(videoTool, [point, point]));
  };

  const overlayMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const point = getOverlayPoint(event);
    const drag = annotationDragRef.current;
    if (drag) {
      updateAnnotation(drag.id, (stroke) => {
        if (drag.mode === 'move') {
          const delta = { x: point.x - drag.startPointer.x, y: point.y - drag.startPointer.y };
          return {
            ...stroke,
            points: drag.startPoints.map((item) => ({ x: clamp(item.x + delta.x, 0, 1000), y: clamp(item.y + delta.y, 0, 562) }))
          };
        }
        if (drag.mode === 'resize') {
          const startWidth = Math.max(12, drag.startBounds.maxX - drag.startBounds.minX);
          const startHeight = Math.max(12, drag.startBounds.maxY - drag.startBounds.minY);
          const scaleX = clamp((point.x - drag.startBounds.minX) / startWidth, 0.08, 5);
          const scaleY = clamp((point.y - drag.startBounds.minY) / startHeight, 0.08, 5);
          return {
            ...stroke,
            points: drag.startPoints.map((item) => ({
              x: clamp(drag.startBounds.minX + (item.x - drag.startBounds.minX) * scaleX, 0, 1000),
              y: clamp(drag.startBounds.minY + (item.y - drag.startBounds.minY) * scaleY, 0, 562)
            })),
            radius: stroke.kind === 'beam' ? clamp((drag.startRadius || getBeamRadius(stroke)) * scaleX, 18, 260) : stroke.radius,
            fontSize: stroke.kind === 'text' ? clamp(Math.round((drag.startFontSize || 24) * ((scaleX + scaleY) / 2)), 12, 54) : stroke.fontSize
          };
        }
        const index = drag.index ?? 0;
        if (stroke.kind === 'beam' && drag.startPoints.length >= 2) {
          const [startSource, startTarget] = drag.startPoints;
          if (index === 2) return { ...stroke, radius: clamp(Math.abs(point.x - startTarget.x), 18, 260) };
          if (index === 0) return { ...stroke, points: [{ x: startTarget.x, y: clamp(point.y, 0, startTarget.y - 24) }, startTarget] };
          const height = startTarget.y - startSource.y;
          return { ...stroke, points: [{ x: point.x, y: clamp(point.y - height, 0, 538) }, point] };
        }
        if ((stroke.kind === 'curve' || stroke.kind === 'free') && drag.startPoints.length > 9) {
          const origin = drag.startPoints[index] || drag.startPointer;
          const delta = { x: point.x - origin.x, y: point.y - origin.y };
          const sigma = Math.max(2, (drag.startPoints.length - 1) / 7);
          return {
            ...stroke,
            points: drag.startPoints.map((item, itemIndex) => {
              const weight = Math.exp(-(((itemIndex - index) ** 2) / (2 * sigma * sigma)));
              return { x: clamp(item.x + delta.x * weight, 0, 1000), y: clamp(item.y + delta.y * weight, 0, 562) };
            })
          };
        }
        return {
          ...stroke,
          points: drag.startPoints.map((item, itemIndex) => itemIndex === index ? point : item)
        };
      });
      return;
    }
    if (drawing && videoTool === 'eraser' && event.buttons) { eraseVideoAt(point); return; }
    if (!draftStroke) return;
    if (draftStroke.kind === 'free' || draftStroke.kind === 'curve') {
      setDraftStroke({ ...draftStroke, points: [...draftStroke.points, point] });
    } else {
      setDraftStroke({ ...draftStroke, points: [draftStroke.points[0], point] });
    }
  };

  const overlayUp = () => {
    if (annotationDragRef.current) {
      annotationDragRef.current = null;
      return;
    }
    if (!draftStroke) return;
    const first = draftStroke.points[0];
    const last = draftStroke.points[draftStroke.points.length - 1];
    if (draftStroke.kind === 'beam') {
      const bottom = first.y > last.y ? first : last;
      const topY = distanceBetween(first, last) > 7 ? Math.min(first.y, last.y) : Math.max(0, bottom.y - 300);
      const dragRadius = Math.abs(last.x - first.x) >= 34 ? Math.abs(last.x - first.x) : draftStroke.radius;
      const finalStroke: Stroke = {
        ...draftStroke,
        points: [{ x: bottom.x, y: topY }, bottom],
        radius: clamp(dragRadius || getBeamRadius(draftStroke), 30, 240)
      };
      setAnnotations((previous) => ({ ...previous, [selectedClip.id]: [...(previous[selectedClip.id] || []), finalStroke] }));
      setSelectedAnnotationId(finalStroke.id);
      setSelectedAnnotationPointIndex(null);
      setRedoAnnotations([]);
      setDraftStroke(null);
      showToast('Cilindro de luz aplicado. Quedó seleccionado: podés moverlo, cambiar altura o ancho.');
      return;
    }
    if (draftStroke.points.length >= 2 && (distanceBetween(first, last) > 7 || draftStroke.points.length > 3)) {
      const finalStroke: Stroke = draftStroke.kind === 'curve'
        ? { ...draftStroke, points: simplifyCurvePoints(draftStroke.points) }
        : draftStroke;
      setAnnotations((previous) => ({ ...previous, [selectedClip.id]: [...(previous[selectedClip.id] || []), finalStroke] }));
      setSelectedAnnotationId(finalStroke.id);
      setSelectedAnnotationPointIndex(null);
      setRedoAnnotations([]);
    }
    setDraftStroke(null);
  };

  const undoAnnotation = () => {
    const current = annotations[selectedClip.id] || [];
    const last = current[current.length - 1];
    if (!last) return;
    setRedoAnnotations((previous) => [...previous, last]);
    if (selectedAnnotationId === last.id) { setSelectedAnnotationId(''); setSelectedAnnotationPointIndex(null); }
    setAnnotations((previous) => ({ ...previous, [selectedClip.id]: current.slice(0, -1) }));
  };

  const redoAnnotation = () => {
    const next = redoAnnotations[redoAnnotations.length - 1];
    if (!next) return;
    setRedoAnnotations((previous) => previous.slice(0, -1));
    setAnnotations((previous) => ({ ...previous, [selectedClip.id]: [...(previous[selectedClip.id] || []), next] }));
    setSelectedAnnotationId(next.id);
  };

  const clearAnnotations = () => {
    setAnnotations((previous) => ({ ...previous, [selectedClip.id]: [] }));
    setSelectedAnnotationId('');
    setSelectedAnnotationPointIndex(null);
    annotationDragRef.current = null;
    setVideoPendingPoints([]);
    setDraftStroke(null);
    showToast('Dibujos del clip eliminados.');
  };

  const youtubeSrc = selectedClip.source === 'youtube'
    ? `${selectedClip.url}${selectedClip.url.includes('?') ? '&' : '?'}start=${youtubeStart}&rel=0`
    : '';

  return (
    <div className={`module-stack analyzer-shell video-workspace video-tab-${videoWorkspaceTab}`} tabIndex={0} onKeyDown={handleAnalyzerKeys}>
      <div className="module-heading">
        <div>
          <span className="eyebrow"><MonitorPlay size={16} /> VideoLab Pro · Analizador de Video</span>
          <h2>Codificá el partido como un analista profesional</h2>
          <p>Panel de botones, descriptores, recorte IN/OUT, telestración avanzada, timeline por carriles, matriz de datos, mapa de calor y presentación de eventos.</p>
        </div>
        <div className="heading-actions">
          <button className="button secondary" onClick={() => fileInputRef.current?.click()}><Upload size={17} /> Abrir video del dispositivo</button>
          <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={handleFile} />
          <span className="plan-pill"><ShieldCheck size={15} /> {PLAN_NAMES[planTier]}</span>
        </div>
      </div>

      {planTier === 'free' && (
        <div className="notice-bar"><Lock size={17} /> Tu prueba terminó o está limitada: {customClipsCount}/3 clips propios y {playlists.length}/2 playlists. <button onClick={goPlans}>Activar un plan</button></div>
      )}

      <nav className="workspace-tabs video-workspace-tabs" aria-label="Solapas de trabajo del VideoLab">
        <div className="workspace-tabs-intro">
          <strong>¿Qué querés hacer ahora?</strong>
          <span>El video queda fijo y a la derecha aparece solo la herramienta de esa tarea.</span>
        </div>
        <div className="workspace-tab-buttons">
          {[
            ['tagging', 'Etiquetar acciones', <Tags size={17} />],
            ['drawing', 'Dibujar / Luz', <Pencil size={17} />],
            ['events', 'Eventos', <BookmarkPlus size={17} />],
            ['timeline', 'Timeline', <Rows3 size={17} />],
            ['data', 'Datos / Matriz', <BarChart3 size={17} />],
            ['heat', 'Mapa de calor', <Crosshair size={17} />],
            ['presentation', 'Presentación', <Presentation size={17} />],
            ['clips', 'Clips', <Film size={17} />]
          ].map(([tab, label, icon]) => (
            <button
              key={tab as string}
              className={videoWorkspaceTab === tab ? 'active' : ''}
              onClick={() => openVideoWorkspace(tab as VideoWorkspaceTab)}
            >{icon} {label as string}</button>
          ))}
        </div>
      </nav>

      <div className="analyzer-grid">
        <section className="panel player-panel">
          <div className="player-shell" ref={playerWrapRef} onPointerDown={handlePlayerShellPointerDown}>
            {selectedClip.source === 'demo' && <TacticalSimulation clip={selectedClip} time={currentTime} />}
            {selectedClip.source === 'youtube' && (
              <iframe key={`${selectedClip.id}-${youtubeStart}`} src={youtubeSrc} title={selectedClip.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            )}
            {(selectedClip.source === 'mp4' || selectedClip.source === 'file') && selectedClip.url && (
              <video
                ref={videoRef}
                src={selectedClip.url}
                playsInline
                preload="metadata"
                muted={muted}
                onLoadedMetadata={(event) => {
                  const nextDuration = event.currentTarget.duration || selectedClip.durationSec;
                  setDuration(nextDuration);
                  if (selectedClip.durationSec !== Math.round(nextDuration)) {
                    setClips((previous) => previous.map((clip) => clip.id === selectedClip.id ? { ...clip, durationSec: Math.round(nextDuration) } : clip));
                  }
                }}
                onTimeUpdate={(event) => {
                  const nextTime = event.currentTarget.currentTime;
                  if (loopSelection && outPoint > inPoint && nextTime >= outPoint) {
                    event.currentTarget.currentTime = inPoint;
                    setCurrentTime(inPoint);
                  } else {
                    setCurrentTime(nextTime);
                  }
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
            )}
            {(selectedClip.source === 'mp4' || selectedClip.source === 'file') && !selectedClip.url && (
              <div className="player-empty">
                <AlertTriangle size={36} />
                <strong>Este archivo local debe volver a abrirse</strong>
                <p>Por seguridad del navegador, los videos del dispositivo no quedan guardados al recargar. En la versión en la nube se almacenan en tu cuenta.</p>
                <button className="button primary" onClick={() => fileInputRef.current?.click()}>Abrir video nuevamente</button>
              </div>
            )}

            <svg
              ref={overlayRef}
              className={`annotation-overlay ${drawing ? 'drawing' : ''} ${videoTool === 'select' ? 'selecting' : ''}`}
              viewBox="0 0 1000 562"
              onPointerDown={overlayDown}
              onPointerMove={overlayMove}
              onPointerUp={overlayUp}
              onPointerCancel={overlayUp}
              onDoubleClick={() => { if (videoTool === 'polygon') finishVideoPolygon(); }}
            >
              {visibleAnnotations.map((stroke) => (
                <StrokeShape
                  key={stroke.id}
                  stroke={stroke}
                  selected={stroke.id === selectedAnnotationId}
                  editable={stroke.id === selectedAnnotationId && videoWorkspaceTab === 'drawing'}
                  selectedPointIndex={stroke.id === selectedAnnotationId ? selectedAnnotationPointIndex : null}
                  onSelect={videoWorkspaceTab === 'drawing' && videoTool === 'select' ? selectAnnotation : undefined}
                  onPointDown={startAnnotationPointDrag}
                  onResizeDown={startAnnotationResize}
                />
              ))}
              {videoPendingPoints.length > 0 && <StrokeShape stroke={makeVideoStroke(videoTool === 'angle' ? 'angle' : 'polygon', videoPendingPoints)} />}
              {draftStroke && <StrokeShape stroke={draftStroke} />}
            </svg>

            <div className="player-badges">
              <span>{sourceLabel(selectedClip.source)}</span>
              <span>{selectedClip.level}</span>
              {drawing && <span className="drawing-badge">{videoTool === 'select' ? 'Puntero / editar' : videoTool === 'eraser' ? 'Borrar: tocá un dibujo' : `Dibujar: ${strokeKindLabel(videoTool as StrokeKind)}`}</span>}
              {loopSelection && <span>Loop {formatTime(inPoint)}–{formatTime(outPoint)}</span>}
            </div>

            {videoWorkspaceTab === 'drawing' && (
              <div className={`floating-draw-palette ${drawPaletteOpen ? 'open' : 'closed'}`} onPointerDown={(event) => event.stopPropagation()}>
                <button className="palette-toggle" onClick={() => setDrawPaletteOpen((value) => !value)} title={drawPaletteOpen ? 'Plegar herramientas' : 'Desplegar herramientas'}>
                  <Pencil size={18} /> {drawPaletteOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {drawPaletteOpen && (
                  <>
                    <div className="floating-tool-grid">
                      {[
                        ['select', 'Puntero', <MousePointer2 size={18} />],
                        ['beam', 'Luz', <Zap size={18} />],
                        ['spotlight', 'Foco', <Crosshair size={18} />],
                        ['free', 'Libre', <Pencil size={18} />],
                        ['arrow', 'Flecha', <ArrowRight size={18} />],
                        ['curve', 'Curva', <Spline size={18} />],
                        ['polygon', 'Polígono', <Shapes size={18} />],
                        ['text', 'Texto', <Type size={18} />],
                        ['measure', 'Medir', <Ruler size={18} />],
                        ['eraser', 'Borrar', <Eraser size={18} />]
                      ].map(([tool, label, icon]) => (
                        <button key={tool as string} className={videoTool === tool ? 'active' : ''} onClick={() => chooseVideoTool(tool as Tool)} title={tool === 'beam' ? 'Cilindro de luz: arrastrá desde arriba hasta los pies del jugador o tocá al jugador' : tool === 'select' ? 'Puntero: tocá un dibujo para moverlo y editar sus puntos' : label as string}>
                          {icon}<span>{label as string}</span>
                        </button>
                      ))}
                    </div>
                    <div className="floating-color-row">
                      {['#ffd166', '#00a8ff', '#ffffff', '#ff5d8f'].map((color) => (
                        <button key={color} className={drawColor === color ? 'active' : ''} style={{ background: color }} onClick={() => setDrawColor(color)} aria-label={`Color ${color}`} />
                      ))}
                    </div>
                    <div className="floating-palette-actions">
                      <button onClick={undoAnnotation} disabled={!(annotations[selectedClip.id] || []).length} title="Deshacer"><Undo2 size={16} /></button>
                      <button onClick={() => void captureFrame()} title="Capturar fotograma con dibujos"><Camera size={16} /></button>
                    </div>
                    <p>{videoTool === 'beam' ? 'Arrastrá desde arriba hasta los pies del jugador o tocá al jugador.' : videoTool === 'select' ? 'Tocá un dibujo: cuerpo mueve, puntos deforman, esquina cambia tamaño.' : 'Dibujá directamente sobre el video. Escape vuelve al Puntero.'}</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="timeline-wrap">
            <input
              type="range" min="0" max={Math.max(duration || selectedClip.durationSec, 0)} step="0.1" value={currentTime}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Posición del video"
            />
            <div className="timeline-markers">
              {clipMarkers.map((marker) => (
                <button
                  key={marker.id}
                  style={{ left: `${(marker.time / Math.max(duration || selectedClip.durationSec, 1)) * 100}%` }}
                  title={`${formatTime(marker.time)} · ${marker.label}`}
                  onClick={() => seek(marker.time)}
                />
              ))}
            </div>
          </div>

          <div className="player-controls pro-controls">
            <button className="mini-button" onClick={() => seek(currentTime - 10)} title="Retroceder 10 segundos">-10s</button>
            <button className="icon-button" onClick={() => frameStep(-1)} title="Un fotograma atrás (←)"><SkipBack size={17} /></button>
            <button className="play-button" onClick={togglePlay}>{playing ? <Pause size={22} /> : <Play size={22} />}</button>
            <button className="icon-button" onClick={() => frameStep(1)} title="Un fotograma adelante (→)"><SkipForward size={17} /></button>
            <button className="mini-button" onClick={() => seek(currentTime + 10)} title="Adelantar 10 segundos">+10s</button>
            <span className="time-label">{formatPreciseTime(currentTime)} / {formatTime(duration || selectedClip.durationSec)}</span>
            <div className="speed-group" aria-label="Velocidad de reproducción">
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
                <button key={value} className={speed === value ? 'active' : ''} onClick={() => setSpeed(value)}>{value}x</button>
              ))}
            </div>
            <button className="icon-button" onClick={() => setMuted((v) => !v)} title="Silencio">{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
            <button className="icon-button" onClick={() => void captureFrame()} title="Capturar fotograma con dibujos"><Camera size={18} /></button>
            <button className="icon-button" onClick={() => playerWrapRef.current?.requestFullscreen?.()} title="Pantalla completa"><Maximize size={18} /></button>
          </div>

          <div className="clip-edit-bar">
            <div className="clip-edit-actions">
              <button className="mini-button" onClick={markInPoint}><Frame size={14} /> IN · {formatPreciseTime(inPoint)}</button>
              <button className="mini-button" onClick={markOutPoint}><Frame size={14} /> OUT · {formatPreciseTime(outPoint)}</button>
              <button className="mini-button" onClick={() => seek(inPoint)}><Play size={14} /> Ir al IN</button>
              <label className="checkbox-inline"><input type="checkbox" checked={loopSelection} onChange={(event) => setLoopSelection(event.target.checked)} /> Repetir recorte</label>
            </div>
            <div className="range-pair" aria-label="Ajuste fino del recorte">
              <label>IN <input type="range" min="0" max={Math.max(duration || selectedClip.durationSec, 0)} step="0.1" value={inPoint} onChange={(event) => setInPoint(Number(event.target.value))} /></label>
              <label>OUT <input type="range" min="0" max={Math.max(duration || selectedClip.durationSec, 0)} step="0.1" value={outPoint} onChange={(event) => setOutPoint(Number(event.target.value))} /></label>
            </div>
            <span className="keyboard-hint"><Keyboard size={15} /> Espacio/K play · J/L ±5s · ←/→ fotograma · I/O recorte</span>
          </div>

          <div className="clip-title-row">
            <div>
              <h3>{selectedClip.title}</h3>
              <p>{selectedClip.phase} · {selectedClip.system} · {selectedClip.concept}</p>
            </div>
            <div className="row-actions">
              <button className="mini-button" onClick={() => setClips((previous) => previous.map((clip) => clip.id === selectedClip.id ? { ...clip, favorite: !clip.favorite } : clip))}>
                <Star size={15} className={selectedClip.favorite ? 'filled-star' : ''} /> Favorito
              </button>
              <button className="mini-button" onClick={() => startEditClip(selectedClip)}><Edit3 size={15} /> Editar</button>
              <button className="mini-button danger" onClick={() => deleteClip(selectedClip)}><Trash2 size={15} /></button>
            </div>
          </div>

          <label className="field-label">Nota metodológica del clip</label>
          <textarea className="textarea" value={selectedClip.notes} onChange={(event) => saveClipNotes(event.target.value)} rows={3} placeholder="Qué debe mirar el jugador, qué corregir y cómo llevarlo a la cancha…" />
        </section>

        <aside className="panel library-panel">
          <div className="panel-title-row">
            <h3><Film size={19} /> Videoteca</h3>
            <span>{filteredClips.length} clips</span>
          </div>
          <label className="search-box">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar concepto, jugada o nota…" />
          </label>
          <div className="filter-grid">
            <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as 'Todas' | Audience)}>
              <option value="Todas">Todas las categorías</option>
              {AUDIENCES.map((level) => <option key={level} value={level}>{level === 'Primera' ? 'Primera / Profesional' : level}</option>)}
            </select>
            <select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}>
              <option value="Todas">Todas las fases</option>
              {PHASES.map((phase) => <option key={phase}>{phase}</option>)}
            </select>
            <select value={systemFilter} onChange={(event) => setSystemFilter(event.target.value)}>
              <option value="Todas">Todos los sistemas</option>
              {SYSTEMS.map((system) => <option key={system}>{system}</option>)}
            </select>
            <select value={conceptFilter} onChange={(event) => setConceptFilter(event.target.value)}>
              <option value="Todas">Todos los conceptos</option>
              {CONCEPTS.map((concept) => <option key={concept}>{concept}</option>)}
            </select>
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={favoritesOnly} onChange={(event) => setFavoritesOnly(event.target.checked)} />
            Mostrar solo favoritos
          </label>
          <div className="clip-list">
            {filteredClips.map((clip, index) => (
              <article key={clip.id} className={`clip-card ${clip.id === selectedClip.id ? 'selected' : ''}`}>
                <button className="clip-main" onClick={() => setSelectedClipId(clip.id)}>
                  <MiniPitch seed={index + clip.title.length} />
                  <span className="clip-card-copy">
                    <strong>{clip.title}</strong>
                    <small>{clip.level} · {clip.phase}</small>
                    <small>{formatTime(clip.durationSec)} · {markers.filter((marker) => marker.clipId === clip.id).length} marcadores</small>
                  </span>
                  {clip.favorite && <Star size={16} className="filled-star" />}
                </button>
                <div className="clip-card-actions">
                  <button onClick={() => startEditClip(clip)}><Edit3 size={14} /> Editar</button>
                  <button onClick={() => deleteClip(clip)}><Trash2 size={14} /> Borrar</button>
                </div>
              </article>
            ))}
            {!filteredClips.length && <div className="empty-mini">Ningún clip coincide con esos filtros.</div>}
          </div>
        </aside>
      </div>

      <section className="panel drawing-work-panel">
        <div className="panel-title-row"><h3><Pencil size={20} /> Dibujar sobre el video</h3><span>Paleta completa al lado de la pantalla</span></div>
          <div className="telestration-dock">
            <div className="telestration-head">
              <button className={`tool-button ${drawing ? 'active' : ''}`} onClick={() => openVideoWorkspace(drawing ? 'tagging' : 'drawing')}><Pencil size={16} /> {drawing ? 'Volver a Etiquetar' : 'Telestrar sobre el video'}</button>
              <div className="color-swatches">
                {['#ffd166', '#00a8ff', '#ffffff', '#ff5d8f', '#80ed99', '#ff8500', '#b388ff'].map((color) => (
                  <button key={color} className={drawColor === color ? 'active' : ''} style={{ background: color }} onClick={() => setDrawColor(color)} aria-label={`Color ${color}`} />
                ))}
              </div>
              <input className="color-picker" type="color" value={drawColor} onChange={(event) => setDrawColor(event.target.value)} aria-label="Color personalizado" />
              <button className="mini-button" onClick={undoAnnotation} disabled={!(annotations[selectedClip.id] || []).length}><Undo2 size={15} /></button>
              <button className="mini-button" onClick={redoAnnotation} disabled={!redoAnnotations.length}><Redo2 size={15} /></button>
              <button className="mini-button" onClick={clearAnnotations}><Trash2 size={15} /> Todo</button>
            </div>
            <div className="tool-strip" aria-label="Herramientas de dibujo sobre video">
              {[
                ['select', 'Puntero / editar', <MousePointer2 size={15} />], ['free', 'Libre', <Pencil size={15} />], ['arrow', 'Flecha', <ArrowRight size={15} />], ['curve', 'Curva', <Spline size={15} />],
                ['line', 'Línea', <Edit3 size={15} />], ['run', 'Carrera', <Route size={15} />], ['pass', 'Pase', <Share2 size={15} />],
                ['zone', 'Zona', <Square size={15} />], ['rect', 'Rectángulo', <Square size={15} />], ['ellipse', 'Elipse', <Circle size={15} />], ['beam', 'Cilindro de luz', <Zap size={15} />], ['spotlight', 'Foco suelo', <Crosshair size={15} />],
                ['polygon', 'Polígono', <Shapes size={15} />], ['text', 'Texto', <Type size={15} />], ['measure', 'Medir', <Ruler size={15} />],
                ['angle', 'Ángulo', <Gauge size={15} />], ['link', 'Vínculo', <Link2 size={15} />], ['eraser', 'Borrar', <Eraser size={15} />]
              ].map(([tool, label, icon]) => (
                <button key={tool as string} className={videoTool === tool ? 'active' : ''} onClick={() => chooseVideoTool(tool as Tool)}>{icon} {label as string}</button>
              ))}
            </div>
            {videoTool === 'beam' && <div className="beam-help"><Zap size={17} /><span><strong>Cilindro de luz:</strong> arrastrá desde arriba hasta los pies del jugador para definir la altura, o tocá directamente al jugador. Queda seleccionado: el punto inferior lo mueve, el superior cambia la altura y el punto amarillo cambia el ancho. El Relleno controla la intensidad.</span></div>}
            {videoTool === 'select' && <div className="beam-help pointer-help"><MousePointer2 size={17} /><span><strong>Puntero / editar:</strong> tocá un dibujo para seleccionarlo. Arrastrá el cuerpo para moverlo, los puntos blancos para deformarlo y la manija azul de la esquina para cambiar su tamaño. Supr/Delete elimina la selección.</span></div>}
            <div className="style-controls">
              <label>Grosor <span>{videoStrokeWidth}px</span><input type="range" min="2" max="12" step="1" value={videoStrokeWidth} onChange={(event) => setVideoStrokeWidth(Number(event.target.value))} /></label>
              <label>Opacidad <span>{Math.round(videoStrokeOpacity * 100)}%</span><input type="range" min="0.25" max="1" step="0.05" value={videoStrokeOpacity} onChange={(event) => setVideoStrokeOpacity(Number(event.target.value))} /></label>
              <label>Relleno <span>{Math.round(videoFillOpacity * 100)}%</span><input type="range" min="0" max="0.75" step="0.05" value={videoFillOpacity} onChange={(event) => setVideoFillOpacity(Number(event.target.value))} /></label>
              <label className="checkbox-inline"><input type="checkbox" checked={videoStrokeDashed} onChange={(event) => setVideoStrokeDashed(event.target.checked)} /> Punteado</label>
              <label className="checkbox-inline"><input type="checkbox" checked={videoStrokeShadow} onChange={(event) => setVideoStrokeShadow(event.target.checked)} /> Sombra/brillo</label>
              <label className="checkbox-inline"><input type="checkbox" checked={showAllAnnotations} onChange={(event) => setShowAllAnnotations(event.target.checked)} /> Ver todos los dibujos</label>
            </div>
            <div className="annotation-meta-row">
              <label>Texto al tocar <input value={videoText} onChange={(event) => setVideoText(event.target.value)} placeholder="Ej.: ¡Hombre libre!" /></label>
              <label>Duración del dibujo
                <select value={annotationDuration} onChange={(event) => setAnnotationDuration(Number(event.target.value))}>
                  <option value={2}>2 segundos</option><option value={5}>5 segundos</option><option value={10}>10 segundos</option><option value={0}>Todo el clip</option>
                </select>
              </label>
              {videoTool === 'polygon' && (
                <div className="polygon-actions">
                  <button className="button secondary" onClick={finishVideoPolygon} disabled={videoPendingPoints.length < 3}><Check size={16} /> Cerrar polígono ({videoPendingPoints.length})</button>
                  <button className="mini-button" onClick={() => setVideoPendingPoints((previous) => previous.slice(0, -1))} disabled={!videoPendingPoints.length}>Borrar último vértice</button>
                  <button className="mini-button danger" onClick={() => setVideoPendingPoints([])} disabled={!videoPendingPoints.length}>Cancelar polígono</button>
                  <span className="muted-label">Cada toque agrega un vértice. Cerrá con el botón, Enter o doble clic. Backspace borra el último; Escape cancela y vuelve al Puntero.</span>
                </div>
              )}
              {videoTool === 'angle' && <span className="muted-label">Tocá 3 puntos: extremo · vértice · extremo. Van {videoPendingPoints.length}/3. Backspace borra el último.</span>}
            </div>

            <div className="annotation-editor-panel">
              <div className="annotation-editor-head">
                <strong><MousePointer2 size={16} /> {selectedAnnotation ? `Editando: ${strokeKindLabel(selectedAnnotation.kind)}` : 'Sin dibujo seleccionado'}</strong>
                {selectedAnnotation && <span>{selectedAnnotation.points.length} punto(s)</span>}
              </div>
              {selectedAnnotation ? (
                <>
                  <p>En el video: <strong>cuerpo</strong> = mover · <strong>puntos blancos</strong> = deformar · <strong>manija azul</strong> = tamaño. Para borrar también podés tocarlo con Borrar o usar Supr/Delete.</p>
                  <div className="style-controls annotation-editor-controls">
                    <label>Color
                      <span className="color-input-row"><input className="color-picker" type="color" value={selectedAnnotation.color} onChange={(event) => updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, color: event.target.value }))} /><span>{selectedAnnotation.color}</span></span>
                    </label>
                    <label>Grosor <span>{selectedAnnotation.width}px</span><input type="range" min="2" max="16" step="1" value={selectedAnnotation.width} onChange={(event) => updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, width: Number(event.target.value) }))} /></label>
                    <label>Opacidad <span>{Math.round((selectedAnnotation.opacity ?? 1) * 100)}%</span><input type="range" min="0.15" max="1" step="0.05" value={selectedAnnotation.opacity ?? 1} onChange={(event) => updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, opacity: Number(event.target.value) }))} /></label>
                    <label>{selectedAnnotation.kind === 'beam' ? 'Intensidad de luz' : 'Relleno'} <span>{Math.round((selectedAnnotation.fillOpacity ?? 0.18) * 100)}%</span><input type="range" min="0" max="0.85" step="0.05" value={selectedAnnotation.fillOpacity ?? 0.18} onChange={(event) => updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, fillOpacity: Number(event.target.value) }))} /></label>
                    {selectedAnnotation.kind === 'beam' && (
                      <>
                        <label>Ancho del cilindro <span>{Math.round(getBeamRadius(selectedAnnotation) * 2)}</span><input type="range" min="36" max="420" step="4" value={getBeamRadius(selectedAnnotation) * 2} onChange={(event) => updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, radius: Number(event.target.value) / 2 }))} /></label>
                        <label>Altura del cilindro <span>{Math.round(Math.abs(selectedAnnotation.points[1].y - selectedAnnotation.points[0].y))}</span><input type="range" min="60" max="540" step="5" value={Math.abs(selectedAnnotation.points[1].y - selectedAnnotation.points[0].y)} onChange={(event) => updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, points: [{ x: stroke.points[1].x, y: clamp(stroke.points[1].y - Number(event.target.value), 0, 562) }, stroke.points[1]] }))} /></label>
                      </>
                    )}
                    {(selectedAnnotation.kind === 'text' || selectedAnnotation.text) && (
                      <>
                        <label>Texto <input value={selectedAnnotation.text || ''} onChange={(event) => updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, text: event.target.value }))} /></label>
                        <label>Tamaño del texto <span>{selectedAnnotation.fontSize || 24}</span><input type="range" min="14" max="54" step="1" value={selectedAnnotation.fontSize || 24} onChange={(event) => updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, fontSize: Number(event.target.value) }))} /></label>
                      </>
                    )}
                    <label className="checkbox-inline"><input type="checkbox" checked={Boolean(selectedAnnotation.dashed)} onChange={(event) => updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, dashed: event.target.checked }))} /> Punteado</label>
                    <label className="checkbox-inline"><input type="checkbox" checked={Boolean(selectedAnnotation.shadow)} onChange={(event) => updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, shadow: event.target.checked }))} /> Sombra/brillo</label>
                  </div>
                  <div className="editor-action-grid">
                    <button className="mini-button" onClick={() => scaleSelectedAnnotation(0.9)}><ZoomOut size={14} /> Achicar</button>
                    <button className="mini-button" onClick={() => scaleSelectedAnnotation(1.1)}><ZoomIn size={14} /> Agrandar</button>
                    <button className="mini-button" onClick={duplicateSelectedAnnotation}><Copy size={14} /> Duplicar</button>
                    <button className="mini-button danger" onClick={deleteSelectedAnnotation}><Trash2 size={14} /> Eliminar {selectedAnnotation.kind === 'polygon' ? 'polígono' : selectedAnnotation.kind === 'beam' ? 'cilindro' : 'dibujo'}</button>
                    {['curve', 'polygon', 'free', 'angle'].includes(selectedAnnotation.kind) && <button className="mini-button" onClick={addAnnotationMidpoint}><Plus size={14} /> Agregar punto</button>}
                    {selectedAnnotationPointIndex !== null && ['curve', 'polygon', 'free'].includes(selectedAnnotation.kind) && <button className="mini-button danger" onClick={deleteSelectedAnnotationPoint}><Trash2 size={14} /> Borrar punto elegido</button>}
                    {selectedAnnotation.kind === 'curve' && <button className="mini-button" onClick={() => { updateAnnotation(selectedAnnotation.id, (stroke) => ({ ...stroke, points: simplifyCurvePoints(stroke.points) })); setSelectedAnnotationPointIndex(null); }}><Spline size={14} /> Dejar puntos editables</button>}
                  </div>
                  <button className="button secondary full" onClick={() => chooseVideoTool('select')}><MousePointer2 size={15} /> Seguir editando con el Puntero</button>
                </>
              ) : (
                <p>Creá un dibujo o activá <strong>Puntero / editar</strong> y tocá uno ya colocado. También podés presionar <strong>Escape</strong> en cualquier momento para volver al Puntero.</p>
              )}
            </div>
          </div>
      </section>

      <section className="panel tagging-panel">
        <div className="panel-title-row">
          <h3><Tags size={20} /> Panel de etiquetado rápido</h3>
          <span>Un clic = un evento con pre/post-roll</span>
        </div>
        <div className="tagging-descriptors">
          <label>Equipo
            <select value={markerTeam} onChange={(event) => setMarkerTeam(event.target.value as EventTeam)}>
              <option>Propio</option><option>Rival</option><option>Neutral</option>
            </select>
          </label>
          <label>Resultado
            <select value={markerOutcome} onChange={(event) => setMarkerOutcome(event.target.value as EventOutcome)}>
              {EVENT_OUTCOMES.map((outcome) => <option key={outcome}>{outcome}</option>)}
            </select>
          </label>
          <label>Zona
            <select value={markerZone} onChange={(event) => setMarkerZone(event.target.value)}>
              {EVENT_ZONES.map((zone) => <option key={zone}>{zone}</option>)}
            </select>
          </label>
          <label>Jugador / línea
            <input value={markerPlayer} onChange={(event) => setMarkerPlayer(event.target.value)} placeholder="Ej.: 8 · Interior / Línea media" />
          </label>
          <label>Valoración <strong>{markerRating}/5</strong>
            <input type="range" min="1" max="5" step="1" value={markerRating} onChange={(event) => setMarkerRating(Number(event.target.value))} />
          </label>
          <label>Pre-roll <strong>{preRoll}s</strong>
            <input type="range" min="0" max="12" step="1" value={preRoll} onChange={(event) => setPreRoll(Number(event.target.value))} />
          </label>
          <label>Post-roll <strong>{postRoll}s</strong>
            <input type="range" min="2" max="20" step="1" value={postRoll} onChange={(event) => setPostRoll(Number(event.target.value))} />
          </label>
        </div>
        <div className="tag-groups-grid">
          {Object.entries(TAG_GROUPS).map(([group, labels]) => (
            <div className="tag-group-card" key={group} style={{ '--tag-color': TAG_COLORS[group] } as React.CSSProperties}>
              <h4>{group}</h4>
              <div>
                {[...labels, ...customTagButtons.filter((button) => button.group === group).map((button) => button.label)].map((label) => (
                  <button key={`${group}-${label}`} onClick={() => quickTag(group, label)}>{label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="custom-tag-row">
          <select value={customTagGroup} onChange={(event) => setCustomTagGroup(event.target.value)}>
            {Object.keys(TAG_GROUPS).map((group) => <option key={group}>{group}</option>)}
          </select>
          <input value={customTagLabel} onChange={(event) => setCustomTagLabel(event.target.value)} placeholder="Crear botón propio: ej. Salto del lateral, 2ª pelota, Vigilancia…" />
          <button className="button secondary" onClick={createCustomTagButton}><Plus size={16} /> Agregar botón</button>
        </div>
        <p className="helper-text">Armá tu propio lenguaje de análisis. Los botones personalizados quedan guardados en este espacio de trabajo y alimentan la timeline, la matriz y las exportaciones.</p>
      </section>

      <section className="panel event-timeline-panel">
        <div className="panel-title-row">
          <h3><Rows3 size={20} /> Timeline de eventos por carriles</h3>
          <div className="timeline-zoom-controls">
            <button className="mini-button" onClick={() => setTimelineZoom((value) => clamp(value - 0.5, 1, 4))}><ZoomOut size={15} /></button>
            <input type="range" min="1" max="4" step="0.5" value={timelineZoom} onChange={(event) => setTimelineZoom(Number(event.target.value))} aria-label="Zoom de la timeline" />
            <button className="mini-button" onClick={() => setTimelineZoom((value) => clamp(value + 0.5, 1, 4))}><ZoomIn size={15} /></button>
            <span>{timelineZoom}x</span>
          </div>
        </div>
        <div className="event-timeline-scroll">
          <div className="event-timeline-inner" style={{ width: `${timelineZoom * 100}%` }}>
            <div className="timeline-ruler">
              {[0, 25, 50, 75, 100].map((percent) => <span key={percent} style={{ left: `${percent}%` }}>{formatTime(((duration || selectedClip.durationSec) * percent) / 100)}</span>)}
            </div>
            {Object.keys(TAG_GROUPS).map((group) => {
              const laneMarkers = filteredMarkers.filter((marker) => inferMarkerGroup(marker) === group);
              const sublaneEnds: number[] = [];
              const positionedMarkers = laneMarkers.map((marker) => {
                const end = markerEnd(marker);
                let sublane = sublaneEnds.findIndex((itemEnd) => marker.time >= itemEnd);
                if (sublane < 0) {
                  sublaneEnds.push(end);
                  sublane = sublaneEnds.length - 1;
                } else {
                  sublaneEnds[sublane] = end;
                }
                return { marker, sublane };
              });
              return (
                <div className="timeline-lane" key={group}>
                  <span className="lane-label" style={{ color: TAG_COLORS[group] }}>{group}</span>
                  <div className="lane-track" style={{ height: `${Math.max(34, Math.max(1, sublaneEnds.length) * 29 + 5)}px` }}>
                    <i className="lane-playhead" style={{ left: `${(currentTime / Math.max(duration || selectedClip.durationSec, 1)) * 100}%` }} />
                    {positionedMarkers.map(({ marker, sublane }) => {
                      const total = Math.max(duration || selectedClip.durationSec, 1);
                      const left = (marker.time / total) * 100;
                      const width = Math.max(2.5, ((markerEnd(marker) - marker.time) / total) * 100);
                      return (
                        <button
                          key={marker.id}
                          className={`event-block ${selectedMarkerId === marker.id ? 'selected' : ''}`}
                          style={{ left: `${left}%`, width: `${width}%`, top: `${4 + sublane * 29}px`, background: TAG_COLORS[group] }}
                          title={`${formatPreciseTime(marker.time)} · ${marker.label} · ${marker.note}`}
                          onClick={() => jumpToMarker(marker)}
                        >{marker.label}</button>
                      );
                    })}
                    {!laneMarkers.length && <em>Sin eventos visibles</em>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {selectedMarkerId && (() => {
          const marker = clipMarkers.find((item) => item.id === selectedMarkerId);
          return marker ? <div className="selected-event-banner"><strong>{formatPreciseTime(marker.time)}–{formatPreciseTime(markerEnd(marker))} · {marker.label}</strong><span>{inferMarkerGroup(marker)} · {marker.team || 'Propio'} · {marker.player || 'Equipo'} · {marker.zone || 'Sin zona'} · {marker.outcome || 'Neutro'} · ★ {marker.rating || 3}/5</span><p>{marker.note}</p></div> : null;
        })()}
      </section>

      <section className="analysis-dashboard-grid">
        <article className="panel dashboard-chart-panel">
          <div className="panel-title-row"><h3><BarChart3 size={19} /> Dashboard del clip</h3><span>{clipMarkers.length} eventos</span></div>
          <div className="stat-bars">
            {Object.entries(eventStats.byGroup).sort((a, b) => b[1] - a[1]).map(([group, count]) => (
              <button key={group} onClick={() => setEventGroupFilter(group)}>
                <span>{group}</span>
                <i><b style={{ width: `${(count / Math.max(1, clipMarkers.length)) * 100}%`, background: TAG_COLORS[group] || '#00a8ff' }} /></i>
                <strong>{count}</strong>
              </button>
            ))}
            {!clipMarkers.length && <div className="empty-mini">Etiquetá la primera acción para ver estadísticas.</div>}
          </div>
          <div className="mini-stat-row">
            {Object.entries(eventStats.byOutcome).map(([outcome, count]) => <button key={outcome} onClick={() => setEventOutcomeFilter(outcome)}>{outcome}: <strong>{count}</strong></button>)}
          </div>
          <div className="export-row">
            <button className="mini-button" onClick={() => exportEvents('csv')}><Table2 size={15} /> CSV / Excel</button>
            <button className="mini-button" onClick={() => exportEvents('xml')}><FileDown size={15} /> XML</button>
            <button className="mini-button" onClick={() => exportEvents('json')}><Download size={15} /> JSON</button>
          </div>
        </article>

        <article className="panel matrix-panel">
          <div className="panel-title-row">
            <h3><Table2 size={19} /> Matriz de datos</h3>
            <select className="matrix-select" value={matrixDimension} onChange={(event) => setMatrixDimension(event.target.value as 'outcome' | 'zone' | 'team')}>
              <option value="outcome">Evento × Resultado</option>
              <option value="zone">Evento × Zona</option>
              <option value="team">Evento × Equipo</option>
            </select>
          </div>
          <div className="matrix-scroll">
            <table className="data-matrix">
              <thead>
                <tr><th>Evento</th>{(matrixDimension === 'outcome' ? EVENT_OUTCOMES : matrixDimension === 'zone' ? EVENT_ZONES : ['Propio', 'Rival', 'Neutral']).map((column) => <th key={column}>{column}</th>)}</tr>
              </thead>
              <tbody>
                {Array.from(new Set(clipMarkers.map((marker) => marker.label))).map((label) => (
                  <tr key={label}>
                    <th>{label}</th>
                    {(matrixDimension === 'outcome' ? EVENT_OUTCOMES : matrixDimension === 'zone' ? EVENT_ZONES : ['Propio', 'Rival', 'Neutral']).map((column) => {
                      const matches = clipMarkers.filter((marker) => marker.label === label && ((matrixDimension === 'outcome' && (marker.outcome || 'Neutro') === column) || (matrixDimension === 'zone' && (marker.zone || '') === column) || (matrixDimension === 'team' && (marker.team || 'Propio') === column)));
                      return <td key={column}><button disabled={!matches.length} onClick={() => { setEventSearch(label); if (matrixDimension === 'outcome') setEventOutcomeFilter(column); if (matrixDimension === 'team') setEventTeamFilter(column); if (matches[0]) jumpToMarker(matches[0]); }}>{matches.length || '·'}</button></td>;
                    })}
                  </tr>
                ))}
                {!clipMarkers.length && <tr><td colSpan={7}>Todavía no hay datos para cruzar.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="helper-text">Tocá una celda para filtrar y saltar al primer video que cumple esa combinación.</p>
        </article>

        <article className="panel heatmap-panel">
          <div className="panel-title-row"><h3><Crosshair size={19} /> Mapa zonal / calor</h3><span>X–Y del evento</span></div>
          <svg className="heatmap-pitch" viewBox="0 0 300 190" role="img" aria-label="Mapa de calor de eventos en la cancha">
            <rect width="300" height="190" rx="12" fill="#08452c" />
            {Array.from({ length: 15 }).map((_, index) => {
              const col = index % 5;
              const row = Math.floor(index / 5);
              const count = clipMarkers.filter((marker) => {
                const x = marker.fieldX ?? 50;
                const y = marker.fieldY ?? 50;
                return x >= col * 20 && x < (col + 1) * 20 && y >= row * 33.34 && y < (row + 1) * 33.34;
              }).length;
              return count ? <rect key={index} x={col * 60} y={row * 63.33} width="60" height="63.33" fill="#ffd166" opacity={clamp(0.18 + count * 0.17, 0.18, 0.78)} /> : null;
            })}
            <g fill="none" stroke="#ffffff" strokeOpacity=".55" strokeWidth="1.6">
              <rect x="8" y="8" width="284" height="174" rx="6" /><line x1="150" y1="8" x2="150" y2="182" /><circle cx="150" cy="95" r="28" />
              <rect x="8" y="50" width="42" height="90" /><rect x="250" y="50" width="42" height="90" />
            </g>
            {clipMarkers.map((marker) => (
              <g key={marker.id} className="heatmap-dot" onClick={() => jumpToMarker(marker)}>
                <circle cx={((marker.fieldX ?? 50) / 100) * 300} cy={((marker.fieldY ?? 50) / 100) * 190} r={selectedMarkerId === marker.id ? 8 : 5.5} fill={TAG_COLORS[inferMarkerGroup(marker)] || '#00a8ff'} stroke="#fff" strokeWidth="2" />
              </g>
            ))}
          </svg>
          <div className="zone-summary">
            {Object.entries(eventStats.byZone).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([zone, count]) => <span key={zone}>{zone}: <strong>{count}</strong></span>)}
          </div>
          <p className="helper-text">Al crear o editar un evento podés tocar la mini-cancha para ubicarlo. El mapa ayuda a ver dónde se repite el problema o la ventaja.</p>
        </article>
      </section>

      <div className="three-column-grid">
        <section className="panel events-work-panel">
          <div className="panel-title-row"><h3><BookmarkPlus size={19} /> Eventos / Marcadores Pro</h3><span>{formatPreciseTime(currentTime)}</span></div>
          <div className="event-filter-bar">
            <label className="search-box compact"><Search size={16} /><input value={eventSearch} onChange={(event) => setEventSearch(event.target.value)} placeholder="Buscar evento, jugador o nota…" /></label>
            <div className="filter-grid three">
              <select value={eventGroupFilter} onChange={(event) => setEventGroupFilter(event.target.value)}><option>Todos</option>{Object.keys(TAG_GROUPS).map((group) => <option key={group}>{group}</option>)}</select>
              <select value={eventTeamFilter} onChange={(event) => setEventTeamFilter(event.target.value)}><option>Todos</option><option>Propio</option><option>Rival</option><option>Neutral</option></select>
              <select value={eventOutcomeFilter} onChange={(event) => setEventOutcomeFilter(event.target.value)}><option>Todos</option>{EVENT_OUTCOMES.map((outcome) => <option key={outcome}>{outcome}</option>)}</select>
            </div>
            {(eventSearch || eventGroupFilter !== 'Todos' || eventTeamFilter !== 'Todos' || eventOutcomeFilter !== 'Todos') && <button className="mini-button" onClick={() => { setEventSearch(''); setEventGroupFilter('Todos'); setEventTeamFilter('Todos'); setEventOutcomeFilter('Todos'); }}><ListFilter size={14} /> Limpiar filtros · {filteredMarkers.length}/{clipMarkers.length}</button>}
          </div>
          <div className="form-stack event-editor">
            <div className="filter-grid two">
              <label>Grupo
                <select value={markerGroup} onChange={(event) => { setMarkerGroup(event.target.value); const first = TAG_GROUPS[event.target.value]?.[0]; if (first) setMarkerLabel(first); }}>
                  {Object.keys(TAG_GROUPS).map((group) => <option key={group}>{group}</option>)}
                </select>
              </label>
              <label>Evento
                <select value={markerLabel} onChange={(event) => setMarkerLabel(event.target.value)}>
                  {Array.from(new Set([...(TAG_GROUPS[markerGroup] || []), ...MARKER_TAGS, ...customTagButtons.map((button) => button.label)])).map((tag) => <option key={tag}>{tag}</option>)}
                </select>
              </label>
              <label>Equipo
                <select value={markerTeam} onChange={(event) => setMarkerTeam(event.target.value as EventTeam)}><option>Propio</option><option>Rival</option><option>Neutral</option></select>
              </label>
              <label>Resultado
                <select value={markerOutcome} onChange={(event) => setMarkerOutcome(event.target.value as EventOutcome)}>{EVENT_OUTCOMES.map((outcome) => <option key={outcome}>{outcome}</option>)}</select>
              </label>
              <label>Zona
                <select value={markerZone} onChange={(event) => setMarkerZone(event.target.value)}>{EVENT_ZONES.map((zone) => <option key={zone}>{zone}</option>)}</select>
              </label>
              <label>Valoración ★ {markerRating}/5
                <input type="range" min="1" max="5" step="1" value={markerRating} onChange={(event) => setMarkerRating(Number(event.target.value))} />
              </label>
            </div>
            <input value={markerPlayer} onChange={(event) => setMarkerPlayer(event.target.value)} placeholder="Jugador, puesto o línea: Ej.: 8 · Interior derecho" />
            <div className="field-point-picker">
              <div>
                <strong>Ubicación en cancha</strong>
                <span>X {Math.round(markerFieldPoint.x)} · Y {Math.round(markerFieldPoint.y)} — tocá la cancha</span>
              </div>
              <svg viewBox="0 0 300 190" onPointerDown={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setMarkerFieldPoint({ x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100), y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100) });
              }}>
                <rect width="300" height="190" rx="12" fill="#08452c" />
                <g fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6"><rect x="8" y="8" width="284" height="174" rx="6" /><line x1="150" y1="8" x2="150" y2="182" /><circle cx="150" cy="95" r="28" /><rect x="8" y="50" width="42" height="90" /><rect x="250" y="50" width="42" height="90" /></g>
                <circle cx={(markerFieldPoint.x / 100) * 300} cy={(markerFieldPoint.y / 100) * 190} r="9" fill="#ffd166" stroke="#02101f" strokeWidth="3" />
              </svg>
            </div>
            <textarea className="textarea" value={markerNote} onChange={(event) => setMarkerNote(event.target.value)} rows={3} placeholder="Ej.: el interior recibe perfilado y rompe la primera presión…" />
            <button className="button primary full" onClick={addOrUpdateMarker}><Save size={16} /> {editingMarkerId ? 'Actualizar evento' : `Crear evento en ${formatPreciseTime(currentTime)}`}</button>
            {editingMarkerId && <button className="button ghost full" onClick={() => { setEditingMarkerId(''); setMarkerNote(''); }}>Cancelar edición</button>}
          </div>
          <div className="marker-list pro-marker-list">
            {filteredMarkers.map((marker) => {
              const group = inferMarkerGroup(marker);
              const inPresentation = (currentPlaylist?.markerIds || []).includes(marker.id);
              return (
                <div className={`marker-item pro ${selectedMarkerId === marker.id ? 'selected' : ''}`} key={marker.id} style={{ '--event-color': TAG_COLORS[group] || '#00a8ff' } as React.CSSProperties}>
                  <button className="marker-time" onClick={() => jumpToMarker(marker)}>{formatPreciseTime(marker.time)}<small>{formatPreciseTime(markerEnd(marker))}</small></button>
                  <div className="marker-copy">
                    <strong>{marker.label}</strong>
                    <div className="marker-meta-chips">
                      <span>{group}</span><span>{marker.team || 'Propio'}</span><span>{marker.outcome || 'Neutro'}</span><span>★ {marker.rating || 3}/5</span>
                      {marker.player && <span>{marker.player}</span>}{marker.zone && <span>{marker.zone}</span>}
                    </div>
                    <p>{marker.note}</p>
                    <div className="marker-inline-actions">
                      <button onClick={() => toggleMarkerInPresentation(marker.id)}>{inPresentation ? <Check size={13} /> : <Presentation size={13} />} {inPresentation ? 'En presentación' : 'A presentación'}</button>
                      <button className={compareMarkerIds.includes(marker.id) ? 'active' : ''} onClick={() => toggleCompareMarker(marker.id)}>A/B</button>
                    </div>
                  </div>
                  <div className="marker-actions">
                    <button onClick={() => editMarker(marker)} title="Editar evento"><Edit3 size={14} /></button>
                    <button onClick={() => setMarkers((previous) => previous.filter((item) => item.id !== marker.id))} title="Eliminar evento"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
            {!filteredMarkers.length && <div className="empty-mini">Ningún evento coincide con los filtros. Creá uno desde el panel rápido.</div>}
          </div>
          {compareMarkerIds.length > 0 && (
            <div className="compare-card">
              <h4>Comparación A/B</h4>
              <div>
                {compareMarkerIds.map((id, index) => {
                  const marker = clipMarkers.find((item) => item.id === id);
                  return marker ? <button key={id} onClick={() => jumpToMarker(marker)}><strong>{index === 0 ? 'A' : 'B'} · {marker.label}</strong><span>{formatPreciseTime(marker.time)} · {marker.team || 'Propio'} · {marker.outcome || 'Neutro'} · ★ {marker.rating || 3}</span><small>{marker.note}</small></button> : null;
                })}
              </div>
            </div>
          )}
        </section>

        <section className="panel presentation-work-panel">
          <div className="panel-title-row"><h3><Presentation size={19} /> Playlists y presentación</h3><span>{playlists.length}</span></div>
          <div className="form-stack">
            <select value={currentPlaylist?.id || ''} onChange={(event) => { setSelectedPlaylistId(event.target.value); setPresentationIndex(0); }}>
              {playlists.map((playlist) => <option key={playlist.id} value={playlist.id}>{playlist.name} · {playlist.clipIds.length} clips · {(playlist.markerIds || []).length} eventos</option>)}
            </select>
            {currentPlaylist && (
              <button className="button secondary full" onClick={() => toggleClipInPlaylist(currentPlaylist.id)}>
                {currentPlaylist.clipIds.includes(selectedClip.id) ? <><Check size={16} /> Quitar clip actual</> : <><Plus size={16} /> Agregar clip actual</>}
              </button>
            )}
            <button className="button ghost full" onClick={nextInPlaylist}><SkipForward size={16} /> Siguiente de la playlist</button>
            <div className="inline-form">
              <input value={newPlaylistName} onChange={(event) => setNewPlaylistName(event.target.value)} placeholder="Nueva playlist: Rival, línea, puesto…" />
              <button className="button primary" onClick={createPlaylist}><Plus size={16} /></button>
            </div>
          </div>
          <div className="playlist-clips">
            {currentPlaylist?.clipIds.map((id, index) => {
              const clip = clips.find((item) => item.id === id);
              if (!clip) return null;
              return (
                <button key={`${id}-${index}`} className={clip.id === selectedClip.id ? 'active' : ''} onClick={() => setSelectedClipId(clip.id)}>
                  <span>{index + 1}</span><strong>{clip.title}</strong><ChevronRight size={15} />
                </button>
              );
            })}
            {!currentPlaylist?.clipIds.length && <div className="empty-mini">Playlist vacía.</div>}
          </div>

          <div className="presentation-box">
            <div className="presentation-head">
              <h4><Presentation size={17} /> Secuencia para mostrar</h4>
              <span>{presentationMarkers.length} eventos</span>
            </div>
            <div className="presentation-controls">
              <button className="mini-button" onClick={() => goPresentationMarker(Math.max(0, presentationIndex - 1))} disabled={!presentationMarkers.length}><SkipBack size={14} /> Anterior</button>
              <button className="button primary" onClick={() => goPresentationMarker(clamp(presentationIndex, 0, Math.max(0, presentationMarkers.length - 1)))} disabled={!presentationMarkers.length}><Play size={15} /> Ir al actual</button>
              <button className="mini-button" onClick={() => goPresentationMarker(Math.min(presentationMarkers.length - 1, presentationIndex + 1))} disabled={!presentationMarkers.length}>Siguiente <SkipForward size={14} /></button>
            </div>
            <div className="presentation-list">
              {presentationMarkers.map((marker, index) => (
                <div key={marker.id} className={`presentation-item ${index === presentationIndex ? 'active' : ''}`}>
                  <button className="presentation-main" onClick={() => goPresentationMarker(index)}>
                    <span>{index + 1}</span>
                    <span><strong>{marker.label}</strong><small>{clips.find((clip) => clip.id === marker.clipId)?.title || 'Clip'} · {formatPreciseTime(marker.time)}</small></span>
                  </button>
                  <div>
                    <button onClick={() => movePresentationMarker(marker.id, -1)} title="Subir"><ChevronUp size={14} /></button>
                    <button onClick={() => movePresentationMarker(marker.id, 1)} title="Bajar"><ChevronDown size={14} /></button>
                    <button onClick={() => toggleMarkerInPresentation(marker.id)} title="Quitar"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {!presentationMarkers.length && <div className="empty-mini">Agregá eventos con “A presentación” para armar la charla de video en orden.</div>}
            </div>
          </div>
        </section>

        <section className="panel clip-form-work-panel">
          <div className="panel-title-row"><h3><Link2 size={19} /> {editingClipId ? 'Editar clip' : 'Agregar clip o caso'}</h3></div>
          <div className="form-stack">
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Título de la jugada o ejercicio" />
            <input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="URL de YouTube, MP4 o WebM (vacío = simulación)" />
            <div className="filter-grid two">
              <select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value as Audience })}>
                {AUDIENCES.map((level) => <option key={level} value={level}>{level === 'Primera' ? 'Primera / Profesional' : level}</option>)}
              </select>
              <select value={form.phase} onChange={(event) => setForm({ ...form, phase: event.target.value })}>{PHASES.map((phase) => <option key={phase}>{phase}</option>)}</select>
              <select value={form.system} onChange={(event) => setForm({ ...form, system: event.target.value })}>{SYSTEMS.map((system) => <option key={system}>{system}</option>)}</select>
              <select value={form.concept} onChange={(event) => setForm({ ...form, concept: event.target.value })}>{CONCEPTS.map((concept) => <option key={concept}>{concept}</option>)}</select>
            </div>
            <label className="field-label">Duración estimada en segundos (para YouTube/simulación)</label>
            <input type="number" min="1" value={form.durationSec} onChange={(event) => setForm({ ...form, durationSec: Number(event.target.value) })} />
            <textarea className="textarea" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} placeholder="Nota metodológica inicial" />
            <button className="button primary full" onClick={submitClip}><Save size={16} /> {editingClipId ? 'Guardar cambios' : 'Agregar a la videoteca'}</button>
            {editingClipId && <button className="button ghost full" onClick={() => setEditingClipId('')}>Cancelar edición</button>}
            <p className="helper-text">En producción, los archivos se suben a almacenamiento privado y los enlaces se firman por usuario. En este MVP, el archivo local solo vive durante la sesión.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

interface BoardProps {
  title: string;
  setTitle: (title: string) => void;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  strokes: Stroke[];
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
  frames: BoardFrame[];
  setFrames: React.Dispatch<React.SetStateAction<BoardFrame[]>>;
  snapshots: BoardSnapshot[];
  setSnapshots: React.Dispatch<React.SetStateAction<BoardSnapshot[]>>;
  planTier: PlanTier;
  showToast: (message: string) => void;
  goPlans: () => void;
  onUseInReport: (image: string) => void;
}

function TacticalBoard(props: BoardProps) {
  const { title, setTitle, tokens, setTokens, strokes, setStrokes, frames, setFrames, snapshots, setSnapshots, planTier, showToast, goPlans, onUseInReport } = props;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svg3dRef = useRef<SVGSVGElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const dragStrokeLastRef = useRef<Point | null>(null);
  const orbitRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [boardWorkspaceTab, setBoardWorkspaceTab] = useState<BoardWorkspaceTab>('draw');
  const [viewMode, setViewMode] = useState<BoardViewMode>('2d');
  const [color, setColor] = useState('#00a8ff');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [fillOpacity, setFillOpacity] = useState(0.18);
  const [strokeDashed, setStrokeDashed] = useState(false);
  const [strokeShadow, setStrokeShadow] = useState(true);
  const [boardText, setBoardText] = useState('¡Atacar este espacio!');
  const [boardFontSize, setBoardFontSize] = useState(25);
  const [formation, setFormation] = useState('4-3-3');
  const [formationTarget, setFormationTarget] = useState<'both' | 'home' | 'away'>('both');
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [selectedStrokeId, setSelectedStrokeId] = useState('');
  const [dragTokenId, setDragTokenId] = useState('');
  const [dragStrokeId, setDragStrokeId] = useState('');
  const [draftStroke, setDraftStroke] = useState<Stroke | null>(null);
  const [pendingPoints, setPendingPoints] = useState<Point[]>([]);
  const [selectedStrokePointIndex, setSelectedStrokePointIndex] = useState<number | null>(null);
  const strokeEditDragRef = useRef<null | {
    id: string;
    mode: 'move' | 'point' | 'resize';
    index?: number;
    startPointer: Point;
    startPoints: Point[];
    startBounds: StrokeBounds;
    startRadius?: number;
    startFontSize?: number;
  }>(null);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [showThirds, setShowThirds] = useState(true);
  const [showChannels, setShowChannels] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [fieldTheme, setFieldTheme] = useState<'green' | 'night' | 'blueprint' | 'paper'>('green');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [cameraYaw, setCameraYaw] = useState(-18);
  const [cameraPitch, setCameraPitch] = useState(42);
  const [cameraZoom, setCameraZoom] = useState(0.98);
  const [cameraMode, setCameraMode] = useState<'move' | 'orbit'>('move');
  const [autoRotate, setAutoRotate] = useState(false);
  const [playingSequence, setPlayingSequence] = useState(false);
  const [sequenceProgress, setSequenceProgress] = useState(0);
  const [sequenceSpeed, setSequenceSpeed] = useState(1);
  const [activeFrameId, setActiveFrameId] = useState(frames[0]?.id || '');
  const selectedToken = tokens.find((token) => token.id === selectedTokenId);
  const selectedStroke = strokes.find((stroke) => stroke.id === selectedStrokeId);

  const openBoardWorkspace = (tab: BoardWorkspaceTab) => {
    setBoardWorkspaceTab(tab);
    if (tab === 'camera' && viewMode === '2d') setViewMode('3d');
    if (tab === 'draw') setCameraMode('move');
    if (tab === 'elements') setTool('select');
  };

  const chooseBoardTool = (nextTool: Tool) => {
    setTool(nextTool);
    setBoardWorkspaceTab('draw');
    setCameraMode('move');
    if (nextTool !== 'polygon' && nextTool !== 'angle') setPendingPoints([]);
    if (nextTool !== 'select') {
      setSelectedStrokeId('');
      setSelectedStrokePointIndex(null);
      strokeEditDragRef.current = null;
    }
  };

  const updateBoardStroke = (id: string, updater: (stroke: Stroke) => Stroke) => {
    setStrokes((previous) => previous.map((stroke) => stroke.id === id ? updater(stroke) : stroke));
  };

  useEffect(() => {
    if (!autoRotate || viewMode === '2d') return;
    const timer = window.setInterval(() => setCameraYaw((value) => (value + 1.2 + 180) % 360 - 180), 50);
    return () => window.clearInterval(timer);
  }, [autoRotate, viewMode]);

  useEffect(() => {
    if (!playingSequence || frames.length < 2) return;
    const timer = window.setInterval(() => {
      setSequenceProgress((previous) => {
        const next = previous + 0.018 * sequenceSpeed;
        return next >= frames.length - 1 ? 0 : next;
      });
    }, 33);
    return () => window.clearInterval(timer);
  }, [playingSequence, frames.length, sequenceSpeed]);

  const displayTokens = useMemo(() => {
    if (!playingSequence || frames.length < 2) return tokens;
    const fromIndex = clamp(Math.floor(sequenceProgress), 0, frames.length - 2);
    const toIndex = fromIndex + 1;
    const local = clamp(sequenceProgress - fromIndex, 0, 1);
    const from = frames[fromIndex]?.tokens || [];
    const to = frames[toIndex]?.tokens || [];
    const merged = from.map((token) => {
      const next = to.find((item) => item.id === token.id);
      if (!next) return token;
      return {
        ...token,
        x: token.x + (next.x - token.x) * local,
        y: token.y + (next.y - token.y) * local,
        rotation: (token.rotation || 0) + ((next.rotation || 0) - (token.rotation || 0)) * local,
        scale: (token.scale || 1) + ((next.scale || 1) - (token.scale || 1)) * local
      };
    });
    const extras = to.filter((token) => !from.some((item) => item.id === token.id));
    return [...merged, ...extras];
  }, [playingSequence, frames, sequenceProgress, tokens]);

  const displayStrokes = (() => {
    if (!playingSequence || frames.length < 2) return strokes;
    const fromIndex = clamp(Math.floor(sequenceProgress), 0, frames.length - 1);
    const toIndex = clamp(fromIndex + 1, 0, frames.length - 1);
    const fraction = clamp(sequenceProgress - fromIndex, 0, 1);
    const fromStrokes = frames[fromIndex]?.strokes || [];
    const toStrokes = frames[toIndex]?.strokes || [];
    if (fromIndex === toIndex) return toStrokes;
    const animated = toStrokes.map((stroke) => {
      const previous = fromStrokes.find((item) => item.id === stroke.id);
      const nextOpacity = stroke.opacity ?? 1;
      if (!previous) return { ...stroke, opacity: nextOpacity * Math.max(0.08, fraction) };
      const previousOpacity = previous.opacity ?? 1;
      return {
        ...stroke,
        opacity: previousOpacity + (nextOpacity - previousOpacity) * fraction,
        points: previous.points.length === stroke.points.length
          ? stroke.points.map((point, pointIndex) => ({
              x: previous.points[pointIndex].x + (point.x - previous.points[pointIndex].x) * fraction,
              y: previous.points[pointIndex].y + (point.y - previous.points[pointIndex].y) * fraction
            }))
          : stroke.points
      };
    });
    const disappearing = fromStrokes
      .filter((stroke) => !toStrokes.some((item) => item.id === stroke.id))
      .map((stroke) => ({ ...stroke, opacity: (stroke.opacity ?? 1) * (1 - fraction) }));
    return [...disappearing, ...animated];
  })();

  const normalizeBoardPoint = (point: Point): Point => snapToGrid
    ? { x: clamp(Math.round(point.x / 25) * 25, 0, 1000), y: clamp(Math.round(point.y / 25) * 25, 0, 640) }
    : { x: clamp(point.x, 0, 1000), y: clamp(point.y, 0, 640) };

  const get2dPoint = (event: ReactPointerEvent<SVGSVGElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return normalizeBoardPoint({
      x: ((event.clientX - rect.left) / rect.width) * 1000,
      y: ((event.clientY - rect.top) / rect.height) * 640
    });
  };

  const projectPoint = (point: Point, height = 0) => {
    const yaw = cameraYaw * Math.PI / 180;
    const xNorm = (point.x - 500) / 500;
    const yNorm = (point.y - 320) / 320;
    const rotatedX = xNorm * Math.cos(yaw) - yNorm * Math.sin(yaw);
    const depth = xNorm * Math.sin(yaw) + yNorm * Math.cos(yaw);
    const verticalScale = 0.34 + (clamp(cameraPitch, 15, 85) / 90) * 0.72;
    const perspective = cameraZoom * (1 + depth * 0.23);
    return {
      x: 500 + rotatedX * 455 * cameraZoom,
      y: 358 + depth * 300 * verticalScale * cameraZoom - height * perspective,
      depth,
      scale: perspective,
      verticalScale
    };
  };

  const unprojectPoint = (screen: Point): Point => {
    const yaw = cameraYaw * Math.PI / 180;
    const verticalScale = 0.34 + (clamp(cameraPitch, 15, 85) / 90) * 0.72;
    const rotatedX = (screen.x - 500) / (455 * cameraZoom);
    const depth = (screen.y - 358) / (300 * verticalScale * cameraZoom);
    const xNorm = rotatedX * Math.cos(yaw) + depth * Math.sin(yaw);
    const yNorm = -rotatedX * Math.sin(yaw) + depth * Math.cos(yaw);
    return normalizeBoardPoint({ x: 500 + xNorm * 500, y: 320 + yNorm * 320 });
  };

  const get3dPoint = (event: ReactPointerEvent<SVGSVGElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return unprojectPoint({
      x: ((event.clientX - rect.left) / rect.width) * 1000,
      y: ((event.clientY - rect.top) / rect.height) * 700
    });
  };

  const get2dPointFromClient = (clientX: number, clientY: number): Point => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return normalizeBoardPoint({ x: ((clientX - rect.left) / rect.width) * 1000, y: ((clientY - rect.top) / rect.height) * 640 });
  };

  const get3dPointFromClient = (clientX: number, clientY: number): Point => {
    const rect = svg3dRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return unprojectPoint({ x: ((clientX - rect.left) / rect.width) * 1000, y: ((clientY - rect.top) / rect.height) * 700 });
  };

  const makeBoardStroke = (kind: StrokeKind, points: Point[]): Stroke => ({
    id: uid('stroke'),
    kind,
    color,
    width: strokeWidth,
    points,
    opacity: strokeOpacity,
    fillOpacity: kind === 'beam' ? Math.max(fillOpacity, 0.42) : fillOpacity,
    radius: kind === 'beam' ? clamp(54 + strokeWidth * 5, 56, 120) : undefined,
    dashed: strokeDashed,
    shadow: strokeShadow,
    text: kind === 'text' ? boardText.trim() || 'Texto' : undefined,
    fontSize: boardFontSize
  });

  const eraseBoardAt = (point: Point) => {
    setStrokes((previous) => {
      const target = [...previous].reverse().find((stroke) => strokeHit(stroke, point, 18));
      return target ? previous.filter((stroke) => stroke.id !== target.id) : previous;
    });
  };

  const finishBoardPolygon = () => {
    if (pendingPoints.length < 3) return;
    const stroke = makeBoardStroke('polygon', pendingPoints);
    setStrokes((previous) => [...previous, stroke]);
    setSelectedStrokeId(stroke.id);
    setSelectedStrokePointIndex(null);
    setPendingPoints([]);
    setRedoStack([]);
    showToast('Polígono creado y seleccionado. Con Mover/editar podés moverlo, editar vértices o eliminarlo.');
  };

  const handleBoardDown = (rawPoint: Point) => {
    const point = normalizeBoardPoint(rawPoint);
    setPlayingSequence(false);
    if (tool === 'eraser') { eraseBoardAt(point); return; }
    if (tool === 'text') {
      const stroke = makeBoardStroke('text', [point]);
      setStrokes((previous) => [...previous, stroke]);
      setSelectedStrokeId(stroke.id);
      setSelectedStrokePointIndex(0);
      setRedoStack([]);
      return;
    }
    if (tool === 'polygon' || tool === 'angle') {
      const next = [...pendingPoints, point];
      if (tool === 'angle' && next.length === 3) {
        const stroke = makeBoardStroke('angle', next);
        setStrokes((previous) => [...previous, stroke]);
        setSelectedStrokeId(stroke.id);
        setSelectedStrokePointIndex(null);
        setPendingPoints([]);
        setRedoStack([]);
      } else {
        setPendingPoints(next);
      }
      return;
    }
    if (tool === 'select') {
      setSelectedTokenId('');
      setSelectedStrokeId('');
      setSelectedStrokePointIndex(null);
      return;
    }
    setDraftStroke(makeBoardStroke(tool, [point, point]));
  };

  const handleBoardMove = (rawPoint: Point) => {
    const point = normalizeBoardPoint(rawPoint);
    const editDrag = strokeEditDragRef.current;
    if (editDrag) {
      updateBoardStroke(editDrag.id, (stroke) => {
        if (editDrag.mode === 'move') {
          const delta = { x: point.x - editDrag.startPointer.x, y: point.y - editDrag.startPointer.y };
          return {
            ...stroke,
            points: editDrag.startPoints.map((item) => ({ x: clamp(item.x + delta.x, 0, 1000), y: clamp(item.y + delta.y, 0, 640) }))
          };
        }
        if (editDrag.mode === 'resize') {
          const startWidth = Math.max(12, editDrag.startBounds.maxX - editDrag.startBounds.minX);
          const startHeight = Math.max(12, editDrag.startBounds.maxY - editDrag.startBounds.minY);
          const scaleX = clamp((point.x - editDrag.startBounds.minX) / startWidth, 0.08, 5);
          const scaleY = clamp((point.y - editDrag.startBounds.minY) / startHeight, 0.08, 5);
          return {
            ...stroke,
            points: editDrag.startPoints.map((item) => ({
              x: clamp(editDrag.startBounds.minX + (item.x - editDrag.startBounds.minX) * scaleX, 0, 1000),
              y: clamp(editDrag.startBounds.minY + (item.y - editDrag.startBounds.minY) * scaleY, 0, 640)
            })),
            radius: stroke.kind === 'beam' ? clamp((editDrag.startRadius || getBeamRadius(stroke)) * scaleX, 18, 260) : stroke.radius,
            fontSize: stroke.kind === 'text' ? clamp(Math.round((editDrag.startFontSize || 24) * ((scaleX + scaleY) / 2)), 12, 54) : stroke.fontSize
          };
        }
        const index = editDrag.index ?? 0;
        if (stroke.kind === 'beam' && editDrag.startPoints.length >= 2) {
          const [startSource, startTarget] = editDrag.startPoints;
          if (index === 2) return { ...stroke, radius: clamp(Math.abs(point.x - startTarget.x), 18, 260) };
          if (index === 0) return { ...stroke, points: [{ x: startTarget.x, y: clamp(point.y, 0, startTarget.y - 24) }, startTarget] };
          const height = startTarget.y - startSource.y;
          return { ...stroke, points: [{ x: point.x, y: clamp(point.y - height, 0, 616) }, point] };
        }
        if ((stroke.kind === 'curve' || stroke.kind === 'free') && editDrag.startPoints.length > 9) {
          const origin = editDrag.startPoints[index] || editDrag.startPointer;
          const delta = { x: point.x - origin.x, y: point.y - origin.y };
          const sigma = Math.max(2, (editDrag.startPoints.length - 1) / 7);
          return {
            ...stroke,
            points: editDrag.startPoints.map((item, itemIndex) => {
              const weight = Math.exp(-(((itemIndex - index) ** 2) / (2 * sigma * sigma)));
              return { x: clamp(item.x + delta.x * weight, 0, 1000), y: clamp(item.y + delta.y * weight, 0, 640) };
            })
          };
        }
        return {
          ...stroke,
          points: editDrag.startPoints.map((item, itemIndex) => itemIndex === index ? point : item)
        };
      });
      return;
    }
    if (dragTokenId) {
      const target = { x: clamp(point.x + dragOffsetRef.current.x, 0, 1000), y: clamp(point.y + dragOffsetRef.current.y, 0, 640) };
      const snapped = normalizeBoardPoint(target);
      setTokens((previous) => previous.map((token) => token.id === dragTokenId ? { ...token, x: snapped.x, y: snapped.y } : token));
      return;
    }
    if (dragStrokeId) {
      if (!dragStrokeLastRef.current) {
        dragStrokeLastRef.current = point;
        return;
      }
      const delta = { x: point.x - dragStrokeLastRef.current.x, y: point.y - dragStrokeLastRef.current.y };
      dragStrokeLastRef.current = point;
      setStrokes((previous) => previous.map((stroke) => stroke.id === dragStrokeId
        ? { ...stroke, points: stroke.points.map((item) => ({ x: clamp(item.x + delta.x, 0, 1000), y: clamp(item.y + delta.y, 0, 640) })) }
        : stroke));
      return;
    }
    if (tool === 'eraser') { eraseBoardAt(point); return; }
    if (!draftStroke) return;
    if (draftStroke.kind === 'free' || draftStroke.kind === 'curve') {
      setDraftStroke({ ...draftStroke, points: [...draftStroke.points, point] });
    } else {
      setDraftStroke({ ...draftStroke, points: [draftStroke.points[0], point] });
    }
  };

  const handleBoardUp = () => {
    setDragTokenId('');
    setDragStrokeId('');
    dragStrokeLastRef.current = null;
    strokeEditDragRef.current = null;
    orbitRef.current = null;
    if (!draftStroke) return;
    const [a, b] = [draftStroke.points[0], draftStroke.points[draftStroke.points.length - 1]];
    const distance = a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 0;
    if (draftStroke.kind === 'beam' && a && b) {
      const bottom = a.y > b.y ? a : b;
      const topY = distance > 8 ? Math.min(a.y, b.y) : Math.max(0, bottom.y - 300);
      const dragRadius = Math.abs(b.x - a.x) >= 34 ? Math.abs(b.x - a.x) : draftStroke.radius;
      const finalStroke: Stroke = {
        ...draftStroke,
        points: [{ x: bottom.x, y: topY }, bottom],
        radius: clamp(dragRadius || getBeamRadius(draftStroke), 30, 240)
      };
      setStrokes((previous) => [...previous, finalStroke]);
      setSelectedStrokeId(finalStroke.id);
      setSelectedStrokePointIndex(null);
      setRedoStack([]);
      setDraftStroke(null);
      showToast('Cilindro de luz aplicado. Quedó seleccionado: podés moverlo, cambiar altura o ancho.');
      return;
    }
    if (distance > 8 || draftStroke.points.length > 3) {
      const finalStroke: Stroke = draftStroke.kind === 'curve'
        ? { ...draftStroke, points: simplifyCurvePoints(draftStroke.points) }
        : draftStroke;
      setStrokes((previous) => [...previous, finalStroke]);
      setSelectedStrokeId(finalStroke.id);
      setSelectedStrokePointIndex(null);
      setRedoStack([]);
    }
    setDraftStroke(null);
  };

  const boardDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    handleBoardDown(get2dPoint(event));
  };

  const boardMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.buttons || dragTokenId || dragStrokeId || draftStroke) handleBoardMove(get2dPoint(event));
  };

  const boardUp = () => handleBoardUp();

  const board3dDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    if (cameraMode === 'orbit' && tool === 'select' && !dragTokenId) {
      orbitRef.current = { x: event.clientX, y: event.clientY, yaw: cameraYaw, pitch: cameraPitch };
      return;
    }
    handleBoardDown(get3dPoint(event));
  };

  const board3dMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (orbitRef.current) {
      const dx = event.clientX - orbitRef.current.x;
      const dy = event.clientY - orbitRef.current.y;
      setCameraYaw(clamp(orbitRef.current.yaw + dx * 0.35, -180, 180));
      setCameraPitch(clamp(orbitRef.current.pitch + dy * 0.25, 15, 85));
      return;
    }
    if (event.buttons || dragTokenId || dragStrokeId || draftStroke) handleBoardMove(get3dPoint(event));
  };

  const startTokenDrag = (token: Token, point: Point, event: ReactPointerEvent<SVGGElement>) => {
    if (tool !== 'select' || playingSequence) return;
    event.stopPropagation();
    setSelectedTokenId(token.id);
    setSelectedStrokeId('');
    setDragTokenId(token.id);
    dragOffsetRef.current = { x: token.x - point.x, y: token.y - point.y };
  };

  const startStrokeEditDrag = (
    stroke: Stroke,
    mode: 'move' | 'point' | 'resize',
    startPointer: Point,
    index?: number
  ) => {
    setTool('select');
    setSelectedStrokeId(stroke.id);
    setSelectedTokenId('');
    setSelectedStrokePointIndex(mode === 'point' ? (index ?? null) : null);
    strokeEditDragRef.current = {
      id: stroke.id,
      mode,
      index,
      startPointer,
      startPoints: structuredClone(stroke.points),
      startBounds: getStrokeBounds(stroke),
      startRadius: getBeamRadius(stroke),
      startFontSize: stroke.fontSize || 24
    };
  };

  const selectStroke = (stroke: Stroke, point?: Point) => {
    if (tool !== 'select') return;
    if (point) {
      startStrokeEditDrag(stroke, 'move', point);
      return;
    }
    setSelectedStrokeId(stroke.id);
    setSelectedTokenId('');
    setSelectedStrokePointIndex(null);
    setDragStrokeId(stroke.id);
    dragStrokeLastRef.current = null;
  };

  const startStrokePointDrag = (stroke: Stroke, index: number, event: ReactPointerEvent<SVGElement>) => {
    startStrokeEditDrag(stroke, 'point', get2dPointFromClient(event.clientX, event.clientY), index);
  };

  const startStrokeResize = (stroke: Stroke, event: ReactPointerEvent<SVGElement>) => {
    startStrokeEditDrag(stroke, 'resize', get2dPointFromClient(event.clientX, event.clientY));
  };

  const deleteSelectedStroke = () => {
    if (!selectedStroke) return;
    setStrokes((previous) => previous.filter((stroke) => stroke.id !== selectedStroke.id));
    setSelectedStrokeId('');
    setSelectedStrokePointIndex(null);
    strokeEditDragRef.current = null;
    showToast(`${strokeKindLabel(selectedStroke.kind)} eliminado.`);
  };

  const addStrokeMidpoint = () => {
    if (!selectedStroke || selectedStroke.points.length < 2) return;
    const points = selectedStroke.points;
    const segmentCount = selectedStroke.kind === 'polygon' ? points.length : points.length - 1;
    let bestIndex = 0;
    let bestLength = -1;
    for (let index = 0; index < segmentCount; index += 1) {
      const length = distanceBetween(points[index], points[(index + 1) % points.length]);
      if (length > bestLength) { bestLength = length; bestIndex = index; }
    }
    const a = points[bestIndex];
    const b = points[(bestIndex + 1) % points.length];
    const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const nextPoints = selectedStroke.kind === 'polygon' && bestIndex === points.length - 1
      ? [...points, midpoint]
      : [...points.slice(0, bestIndex + 1), midpoint, ...points.slice(bestIndex + 1)];
    updateBoardStroke(selectedStroke.id, (stroke) => ({ ...stroke, points: nextPoints }));
    setSelectedStrokePointIndex(bestIndex + 1);
  };

  const deleteSelectedStrokePoint = () => {
    if (!selectedStroke || selectedStrokePointIndex === null) return;
    const minPoints = selectedStroke.kind === 'polygon' ? 4 : 3;
    if (selectedStroke.points.length < minPoints) {
      showToast(selectedStroke.kind === 'polygon' ? 'Un polígono necesita al menos 3 vértices.' : 'Este trazo necesita conservar sus puntos principales.');
      return;
    }
    updateBoardStroke(selectedStroke.id, (stroke) => ({
      ...stroke,
      points: stroke.points.filter((_, index) => index !== selectedStrokePointIndex)
    }));
    setSelectedStrokePointIndex(null);
  };

  const scaleSelectedStroke = (factor: number) => {
    if (!selectedStroke) return;
    const bounds = getStrokeBounds(selectedStroke);
    const center = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
    updateBoardStroke(selectedStroke.id, (stroke) => ({
      ...stroke,
      points: stroke.points.map((point) => ({
        x: clamp(center.x + (point.x - center.x) * factor, 0, 1000),
        y: clamp(center.y + (point.y - center.y) * factor, 0, 640)
      })),
      radius: stroke.kind === 'beam' ? clamp(getBeamRadius(stroke) * factor, 18, 260) : stroke.radius,
      fontSize: stroke.kind === 'text' ? clamp(Math.round((stroke.fontSize || 24) * factor), 12, 54) : stroke.fontSize
    }));
  };

  const handleBoardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setDraftStroke(null);
      setPendingPoints([]);
      strokeEditDragRef.current = null;
      setTool('select');
      showToast('Puntero activado: tocá un dibujo para moverlo o arrastrá sus puntos para editarlo.');
      return;
    }
    if (event.key === 'Enter' && tool === 'polygon') {
      event.preventDefault();
      finishBoardPolygon();
      return;
    }
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      if (pendingPoints.length) {
        setPendingPoints((previous) => previous.slice(0, -1));
        showToast('Último vértice borrado.');
      } else if (selectedStroke) {
        deleteSelectedStroke();
      } else if (selectedTokenId) {
        setTokens((previous) => previous.filter((token) => token.id !== selectedTokenId));
        setSelectedTokenId('');
        showToast('Elemento eliminado.');
      }
    }
  };

  const tokenDefaultLabel = (kind: TokenKind, count: number) => {
    if (kind === 'ball') return '⚽';
    if (kind === 'cone') return '▲';
    if (kind === 'coach') return 'DT';
    if (kind === 'neutral') return 'C';
    if (['disc', 'miniGoal', 'goal', 'mannequin', 'hurdle', 'ladder', 'ring', 'pole', 'flag'].includes(kind)) return '';
    return String(count);
  };

  const addToken = (kind: TokenKind) => {
    const sameKind = tokens.filter((token) => token.kind === kind).length;
    const token: Token = {
      id: uid(kind),
      kind,
      label: tokenDefaultLabel(kind, sameKind + 1),
      x: 430 + (sameKind % 5) * 38,
      y: 270 + (sameKind % 4) * 34,
      scale: kind === 'goal' ? 1.25 : 1,
      rotation: kind === 'ladder' ? 0 : 0
    };
    setTokens((previous) => [...previous, token]);
    setSelectedTokenId(token.id);
    setSelectedStrokeId('');
    setTool('select');
    showToast(`${TOKEN_CATALOG.find((item) => item.kind === kind)?.label || 'Elemento'} agregado. Arrastralo y ajustá tamaño/rotación.`);
  };

  const applyFormation = () => {
    const generated = formationTokens(formation);
    if (formationTarget === 'both') {
      setTokens(generated);
    } else {
      const equipmentAndBall = tokens.filter((token) => !['home', 'away'].includes(token.kind));
      const kept = tokens.filter((token) => token.kind === (formationTarget === 'home' ? 'away' : 'home'));
      const replacement = generated.filter((token) => token.kind === formationTarget);
      setTokens([...kept, ...replacement, ...equipmentAndBall]);
    }
    setSelectedTokenId('');
    showToast(`Sistema ${formation} cargado ${formationTarget === 'both' ? 'para ambos equipos' : formationTarget === 'home' ? 'solo para el equipo propio' : 'solo para el rival'}.`);
  };

  const applyExerciseTemplate = (template: 'rondo' | 'posesion' | 'salida' | 'finalizacion' | 'circuito') => {
    const make = (kind: TokenKind, label: string, x: number, y: number, scale = 1, rotation = 0): Token => ({ id: uid(kind), kind, label, x, y, scale, rotation });
    let nextTokens: Token[] = [];
    let nextStrokes: Stroke[] = [];
    let nextTitle = title;
    if (template === 'rondo') {
      nextTitle = 'Rondo 4v1 · Mantener y cambiar de orientación';
      nextTokens = [
        make('home', '1', 330, 190), make('home', '2', 670, 190), make('home', '3', 670, 450), make('home', '4', 330, 450),
        make('away', '1', 500, 320), make('ball', '⚽', 360, 215),
        make('cone', '', 275, 140), make('cone', '', 725, 140), make('cone', '', 725, 500), make('cone', '', 275, 500)
      ];
      nextStrokes = [
        { id: uid('stroke'), kind: 'rect', color: '#ffd166', width: 4, fillOpacity: 0.08, dashed: true, shadow: true, points: [{ x: 275, y: 140 }, { x: 725, y: 500 }] },
        { id: uid('stroke'), kind: 'pass', color: '#00a8ff', width: 5, shadow: true, points: [{ x: 330, y: 190 }, { x: 650, y: 190 }] },
        { id: uid('stroke'), kind: 'run', color: '#ffffff', width: 4, shadow: true, points: [{ x: 670, y: 190 }, { x: 670, y: 420 }] }
      ];
    } else if (template === 'posesion') {
      nextTitle = 'Posesión 6v6 + 2 comodines · Jugar con el libre';
      const homePos: Array<[number, number]> = [[250, 150], [420, 120], [620, 150], [250, 480], [430, 510], [620, 480]];
      const awayPos: Array<[number, number]> = [[350, 240], [520, 220], [700, 250], [350, 400], [530, 420], [700, 390]];
      nextTokens = [
        ...homePos.map(([x, y], index) => make('home', String(index + 1), x, y)),
        ...awayPos.map(([x, y], index) => make('away', String(index + 1), x, y)),
        make('neutral', 'C1', 500, 320), make('neutral', 'C2', 790, 320), make('ball', '⚽', 455, 300),
        make('miniGoal', '', 155, 320, 1, 90), make('miniGoal', '', 855, 320, 1, -90)
      ];
      nextStrokes = [
        { id: uid('stroke'), kind: 'rect', color: '#00a8ff', width: 4, fillOpacity: 0.07, dashed: true, points: [{ x: 180, y: 90 }, { x: 830, y: 550 }] },
        { id: uid('stroke'), kind: 'spotlight', color: '#ffd166', width: 3, fillOpacity: 0.18, shadow: true, points: [{ x: 430, y: 235 }, { x: 585, y: 405 }] },
        { id: uid('stroke'), kind: 'curve', color: '#ffd166', width: 5, shadow: true, points: [{ x: 430, y: 300 }, { x: 560, y: 240 }, { x: 740, y: 300 }] }
      ];
    } else if (template === 'salida') {
      nextTitle = 'Salida 7v5 · Superar la primera presión';
      nextTokens = [
        make('home', '1', 90, 320), make('home', '2', 230, 120), make('home', '4', 210, 250), make('home', '6', 210, 390), make('home', '3', 230, 520),
        make('home', '5', 380, 320), make('home', '8', 500, 220),
        make('away', '9', 330, 320), make('away', '7', 430, 140), make('away', '11', 430, 500), make('away', '10', 520, 320), make('away', '8', 560, 430),
        make('ball', '⚽', 115, 320), make('miniGoal', '', 880, 140, 1, -90), make('miniGoal', '', 880, 320, 1, -90), make('miniGoal', '', 880, 500, 1, -90),
        make('cone', '', 650, 90), make('cone', '', 650, 550), make('cone', '', 920, 90), make('cone', '', 920, 550)
      ];
      nextStrokes = [
        { id: uid('stroke'), kind: 'arrow', color: '#00a8ff', width: 5, shadow: true, points: [{ x: 380, y: 320 }, { x: 285, y: 320 }] },
        { id: uid('stroke'), kind: 'pass', color: '#ffd166', width: 5, shadow: true, points: [{ x: 230, y: 120 }, { x: 480, y: 210 }] },
        { id: uid('stroke'), kind: 'curve', color: '#ffffff', width: 5, shadow: true, points: [{ x: 500, y: 220 }, { x: 660, y: 160 }, { x: 830, y: 160 }] },
        { id: uid('stroke'), kind: 'text', color: '#ffd166', width: 3, fontSize: 25, shadow: true, text: '¡Tercer hombre!', points: [{ x: 545, y: 120 }] }
      ];
    } else if (template === 'finalizacion') {
      nextTitle = 'Finalización · Pared, centro y ocupación del área';
      nextTokens = [
        make('home', '8', 300, 320), make('home', '10', 470, 260), make('home', '7', 610, 110), make('home', '9', 730, 300), make('home', '11', 690, 430),
        make('away', '4', 760, 250), make('away', '6', 765, 390), make('away', '1', 905, 320),
        make('ball', '⚽', 325, 320), make('goal', '', 945, 320, 1.25, -90),
        make('cone', '', 420, 190), make('cone', '', 560, 190), make('mannequin', '', 645, 320), make('disc', '', 760, 320)
      ];
      nextStrokes = [
        { id: uid('stroke'), kind: 'pass', color: '#00a8ff', width: 5, shadow: true, points: [{ x: 320, y: 320 }, { x: 455, y: 265 }] },
        { id: uid('stroke'), kind: 'run', color: '#ffffff', width: 5, shadow: true, points: [{ x: 470, y: 260 }, { x: 610, y: 140 }] },
        { id: uid('stroke'), kind: 'curve', color: '#ffd166', width: 6, shadow: true, points: [{ x: 610, y: 125 }, { x: 745, y: 190 }, { x: 780, y: 315 }] },
        { id: uid('stroke'), kind: 'spotlight', color: '#ff5d8f', width: 3, fillOpacity: 0.16, shadow: true, points: [{ x: 675, y: 225 }, { x: 850, y: 430 }] }
      ];
    } else {
      nextTitle = 'Circuito técnico-coordinativo · Estaciones';
      nextTokens = [
        make('home', '1', 160, 150), make('home', '2', 160, 480), make('neutral', 'C', 500, 320), make('coach', 'DT', 500, 90),
        make('ladder', '', 300, 150, 1.2, 0), make('hurdle', '', 470, 150, 1.1, 0), make('ring', '', 640, 150, 1.1, 0), make('miniGoal', '', 830, 150, 1, -90),
        make('pole', '', 300, 480), make('pole', '', 390, 480), make('pole', '', 480, 480), make('cone', '', 640, 480), make('cone', '', 720, 480), make('miniGoal', '', 850, 480, 1, -90),
        make('ball', '⚽', 185, 150), make('ball', '⚽', 185, 480)
      ];
      nextStrokes = [
        { id: uid('stroke'), kind: 'curve', color: '#00a8ff', width: 5, shadow: true, points: [{ x: 190, y: 150 }, { x: 330, y: 110 }, { x: 500, y: 150 }, { x: 690, y: 110 }, { x: 810, y: 150 }] },
        { id: uid('stroke'), kind: 'curve', color: '#ffd166', width: 5, shadow: true, points: [{ x: 190, y: 480 }, { x: 330, y: 430 }, { x: 430, y: 520 }, { x: 560, y: 450 }, { x: 820, y: 480 }] },
        { id: uid('stroke'), kind: 'text', color: '#80ed99', width: 3, fontSize: 24, shadow: true, text: 'Rotar cada 6 minutos', points: [{ x: 365, y: 335 }] }
      ];
    }
    setTitle(nextTitle);
    setTokens(nextTokens);
    setStrokes(nextStrokes);
    setSelectedTokenId('');
    setSelectedStrokeId('');
    setPlayingSequence(false);
    showToast('Plantilla de ejercicio cargada. Ahora adaptala a tu categoría y espacio.');
  };

  const addBoardFrame = () => {
    if (planTier === 'free' && frames.length >= 3) {
      showToast('La prueba vencida permite 3 momentos. Activá DT Pro para secuencias ilimitadas.');
      goPlans();
      return;
    }
    const frame: BoardFrame = {
      id: uid('frame'), name: `Momento ${frames.length + 1}`,
      tokens: structuredClone(tokens), strokes: structuredClone(strokes)
    };
    setFrames((previous) => [...previous, frame]);
    setActiveFrameId(frame.id);
    showToast('Momento agregado. Mové las fichas y guardá el siguiente para animar la secuencia.');
  };

  const loadBoardFrame = (frame: BoardFrame) => {
    setTokens(structuredClone(frame.tokens));
    setStrokes(structuredClone(frame.strokes));
    setActiveFrameId(frame.id);
    setPlayingSequence(false);
    showToast(`${frame.name} cargado para editar.`);
  };

  const updateActiveFrame = () => {
    if (!activeFrameId) return;
    setFrames((previous) => previous.map((frame) => frame.id === activeFrameId ? { ...frame, tokens: structuredClone(tokens), strokes: structuredClone(strokes) } : frame));
    showToast('Momento activo actualizado con la pizarra actual.');
  };

  const handleBackgroundImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBackgroundImage(String(reader.result || ''));
      showToast('Imagen de fondo cargada. Podés dibujar sobre una captura o foto de cancha.');
    };
    reader.readAsDataURL(file);
  };

  const flipBoard = () => {
    setTokens((previous) => previous.map((token) => ({ ...token, x: 1000 - token.x })));
    setStrokes((previous) => previous.map((stroke) => ({ ...stroke, points: stroke.points.map((point) => ({ ...point, x: 1000 - point.x })) })));
    showToast('Sentido de ataque invertido.');
  };

  const undoStroke = () => {
    const last = strokes[strokes.length - 1];
    if (!last) return;
    setRedoStack((previous) => [...previous, last]);
    setStrokes((previous) => previous.slice(0, -1));
  };

  const redoStroke = () => {
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    setRedoStack((previous) => previous.slice(0, -1));
    setStrokes((previous) => [...previous, next]);
  };

  const saveSnapshot = () => {
    if (planTier === 'free' && snapshots.length >= 2) {
      showToast('La prueba vencida guarda 2 pizarras. DT Pro guarda sin límite.');
      goPlans();
      return;
    }
    setSnapshots((previous) => [{
      id: uid('board'), title: title || 'Pizarra sin título', tokens: structuredClone(tokens), strokes: structuredClone(strokes), createdAt: new Date().toISOString()
    }, ...previous]);
    showToast('Pizarra guardada en este dispositivo.');
  };

  const getSvgMarkup = () => {
    const svg = viewMode === '3d' ? svg3dRef.current : svgRef.current;
    if (!svg) return '';
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', '1600');
    clone.setAttribute('height', viewMode === '3d' ? '1120' : '1024');
    return new XMLSerializer().serializeToString(clone);
  };

  const exportSvg = () => {
    downloadText(`${title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-') || 'pizarra-Ramela'}.svg`, getSvgMarkup(), 'image/svg+xml;charset=utf-8');
    showToast('Pizarra SVG descargada.');
  };

  const generatePng = () => new Promise<string>((resolve, reject) => {
    const markup = getSvgMarkup();
    const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = viewMode === '3d' ? 1120 : 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas no disponible'));
        return;
      }
      ctx.fillStyle = '#073d24';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo generar la imagen'));
    };
    image.src = url;
  });

  const exportPng = async () => {
    try {
      const dataUrl = await generatePng();
      downloadUrl(dataUrl, `${title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-') || 'pizarra-Ramela'}.png`);
      showToast('Pizarra PNG descargada.');
    } catch {
      showToast('No se pudo exportar el PNG en este navegador.');
    }
  };

  const useInReport = async () => {
    try {
      const dataUrl = await generatePng();
      onUseInReport(dataUrl);
    } catch {
      showToast('No se pudo adjuntar la pizarra al informe.');
    }
  };

  const tokenFill = (token: Token) => token.color || (token.kind === 'home' ? '#00a8ff' : token.kind === 'away' ? '#d90429' : token.kind === 'neutral' ? '#ffd166' : '#ffffff');

  const tokenShape = (token: Token) => {
    const selected = token.id === selectedTokenId;
    const scale = token.scale || 1;
    const rotation = token.rotation || 0;
    const playerLike = ['home', 'away', 'neutral', 'coach'].includes(token.kind);
    let content: React.ReactNode = null;
    if (token.kind === 'cone') {
      content = <><polygon points="0,-24 -21,19 21,19" fill="#ff8500" stroke="#fff" strokeWidth="3" /><rect x="-15" y="4" width="30" height="6" fill="#fff" opacity=".85" /></>;
    } else if (token.kind === 'disc') {
      content = <ellipse cx="0" cy="0" rx="25" ry="11" fill="#ffd166" stroke="#fff" strokeWidth="3" />;
    } else if (token.kind === 'ball') {
      content = <><circle cx="0" cy="0" r="17" fill="#ffffff" stroke="#111827" strokeWidth="3" /><text x="0" y="5" textAnchor="middle" fontSize="15">⚽</text></>;
    } else if (token.kind === 'miniGoal' || token.kind === 'goal') {
      const w = token.kind === 'goal' ? 54 : 34;
      const h = token.kind === 'goal' ? 28 : 20;
      content = <><path d={`M ${-w} ${h} V ${-h} H ${w} V ${h}`} fill="rgba(255,255,255,.08)" stroke="#ffffff" strokeWidth="6" strokeLinejoin="round" /><path d={`M ${-w * .66} ${h} V ${-h} M ${-w * .33} ${h} V ${-h} M 0 ${h} V ${-h} M ${w * .33} ${h} V ${-h} M ${w * .66} ${h} V ${-h} M ${-w} 0 H ${w}`} stroke="#dbeafe" strokeOpacity=".45" strokeWidth="1.6" /></>;
    } else if (token.kind === 'mannequin') {
      content = <><circle cx="0" cy="-27" r="10" fill="#ffd166" stroke="#fff" strokeWidth="3" /><rect x="-14" y="-18" width="28" height="48" rx="9" fill="#ffd166" stroke="#fff" strokeWidth="3" /><path d="M-22 34 H22" stroke="#fff" strokeWidth="5" strokeLinecap="round" /></>;
    } else if (token.kind === 'hurdle') {
      content = <><path d="M-36 -18 H36" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" /><path d="M-30 -18 L-38 22 M30 -18 L38 22 M-38 22 H-18 M18 22 H38" stroke="#ffd166" strokeWidth="5" strokeLinecap="round" /></>;
    } else if (token.kind === 'ladder') {
      content = <><rect x="-48" y="-20" width="96" height="40" rx="6" fill="rgba(255,209,102,.12)" stroke="#ffd166" strokeWidth="4" />{[-32, -16, 0, 16, 32].map((x) => <line key={x} x1={x} y1="-20" x2={x} y2="20" stroke="#ffd166" strokeWidth="3" />)}</>;
    } else if (token.kind === 'ring') {
      content = <circle cx="0" cy="0" r="24" fill="rgba(128,237,153,.08)" stroke="#80ed99" strokeWidth="7" />;
    } else if (token.kind === 'pole') {
      content = <><path d="M0 26 V-30" stroke="#ff5d8f" strokeWidth="7" strokeLinecap="round" /><ellipse cx="0" cy="27" rx="16" ry="6" fill="#111827" stroke="#fff" strokeWidth="2" /></>;
    } else if (token.kind === 'flag') {
      content = <><path d="M-4 28 V-32" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" /><polygon points="-4,-32 30,-22 -4,-11" fill="#ff5d73" stroke="#fff" strokeWidth="2" /></>;
    } else {
      content = <><circle cx="0" cy="0" r="24" fill={tokenFill(token)} stroke="#ffffff" strokeWidth="4" />{showLabels && <text x="0" y="6" textAnchor="middle" fill={token.kind === 'away' ? '#ffffff' : '#02101f'} fontSize={token.label.length > 2 ? 13 : 17} fontWeight="900" fontFamily="Arial,sans-serif">{token.label}</text>}</>;
    }
    return (
      <g key={token.id} className="board-token" transform={`translate(${token.x} ${token.y}) rotate(${rotation}) scale(${scale})`} onPointerDown={(event) => startTokenDrag(token, get2dPointFromClient(event.clientX, event.clientY), event)}>
        <ellipse cx="4" cy={playerLike ? 25 : 18} rx="25" ry="8" fill="#000" opacity=".28" />
        {content}
        {selected && <circle cx="0" cy="0" r="38" fill="none" stroke="#ffd166" strokeWidth="3.5" strokeDasharray="7 6" />}
      </g>
    );
  };

  const projectedPointString = (points: Point[], height = 0) => points.map((point) => {
    const projected = projectPoint(point, height);
    return `${projected.x},${projected.y}`;
  }).join(' ');

  const projectedPath = (points: Point[], height = 0) => points.map((point, index) => {
    const projected = projectPoint(point, height);
    return `${index === 0 ? 'M' : 'L'} ${projected.x} ${projected.y}`;
  }).join(' ');

  const rotatedTokenPoint = (token: Token, dx: number, dy: number): Point => {
    const angle = (token.rotation || 0) * Math.PI / 180;
    const scale = token.scale || 1;
    return {
      x: token.x + (dx * Math.cos(angle) - dy * Math.sin(angle)) * scale,
      y: token.y + (dx * Math.sin(angle) + dy * Math.cos(angle)) * scale
    };
  };

  const projectedStrokeShape = (stroke: Stroke) => {
    const selected = stroke.id === selectedStrokeId;
    const groupProps = tool === 'select' ? { onPointerDown: (event: ReactPointerEvent<SVGGElement>) => { event.stopPropagation(); selectStroke(stroke); } } : {};
    const style = { opacity: stroke.opacity ?? 1, filter: stroke.shadow ? `drop-shadow(0 7px 6px rgba(0,0,0,.5)) drop-shadow(0 0 7px ${stroke.color})` : undefined } as React.CSSProperties;
    if (stroke.kind === 'text') {
      const point = projectPoint(stroke.points[0], 18);
      return <g key={stroke.id} style={style} {...groupProps}><rect x={point.x - 8} y={point.y - 30} width={Math.max(80, (stroke.text || 'Texto').length * 14)} height="38" rx="9" fill="rgba(2,9,20,.82)" stroke={stroke.color} strokeWidth="2" /><text x={point.x + 3} y={point.y - 5} fill={stroke.color} fontSize="21" fontWeight="900" fontFamily="Arial,sans-serif">{stroke.text || 'Texto'}</text></g>;
    }
    if (stroke.kind === 'beam' && stroke.points.length >= 2) {
      const [sourcePoint, targetPoint] = stroke.points;
      const beamHeight = clamp(Math.abs(targetPoint.y - sourcePoint.y) * 0.55, 100, 215);
      const ground = projectPoint(targetPoint);
      const top = projectPoint(targetPoint, beamHeight);
      const radius = getBeamRadius(stroke);
      const baseRx = Math.max(20, radius * ground.scale);
      const topRx = Math.max(18, radius * top.scale);
      const idSuffix = stroke.id.replace(/[^a-zA-Z0-9_-]/g, '');
      const cylinderId = `beam3d-cylinder-${idSuffix}`;
      const glowId = `beam3d-glow-${idSuffix}`;
      const intensity = clamp(stroke.fillOpacity ?? 0.42, 0.08, 0.85);
      const bodyPath = [
        `M ${ground.x - baseRx} ${ground.y}`,
        `L ${top.x - topRx} ${top.y}`,
        `A ${topRx} ${Math.max(5, topRx * 0.3)} 0 0 1 ${top.x + topRx} ${top.y}`,
        `L ${ground.x + baseRx} ${ground.y}`,
        `A ${baseRx} ${Math.max(6, baseRx * 0.3)} 0 0 0 ${ground.x - baseRx} ${ground.y}`,
        'Z'
      ].join(' ');
      return (
        <g key={stroke.id} style={style} {...groupProps}>
          <defs>
            <linearGradient id={cylinderId} gradientUnits="userSpaceOnUse" x1={ground.x - baseRx} y1={ground.y} x2={ground.x + baseRx} y2={ground.y}>
              <stop offset="0%" stopColor={stroke.color} stopOpacity={Math.min(0.58, intensity * 1.05)} />
              <stop offset="20%" stopColor="#ffffff" stopOpacity={Math.max(0.08, intensity * 0.38)} />
              <stop offset="50%" stopColor="#ffffff" stopOpacity={Math.min(0.52, intensity * 0.78)} />
              <stop offset="80%" stopColor="#ffffff" stopOpacity={Math.max(0.08, intensity * 0.36)} />
              <stop offset="100%" stopColor={stroke.color} stopOpacity={Math.min(0.58, intensity * 1.02)} />
            </linearGradient>
            <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={Math.min(0.76, intensity * 1.2)} />
              <stop offset="52%" stopColor={stroke.color} stopOpacity={Math.min(0.5, intensity * 0.86)} />
              <stop offset="100%" stopColor={stroke.color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx={ground.x} cy={ground.y} rx={baseRx * 1.08} ry={baseRx * 0.35} fill={`url(#${glowId})`} />
          <path d={bodyPath} fill={`url(#${cylinderId})`} stroke="#ffffff" strokeOpacity=".55" strokeWidth="1.8" />
          <ellipse cx={top.x} cy={top.y} rx={topRx} ry={Math.max(5, topRx * 0.3)} fill="#ffffff" fillOpacity={Math.min(0.28, intensity * 0.42)} stroke="#ffffff" strokeOpacity=".62" strokeWidth="1.8" />
          <ellipse cx={ground.x} cy={ground.y} rx={baseRx} ry={baseRx * 0.3} fill={stroke.color} fillOpacity={Math.min(0.24, intensity * 0.38)} stroke="#ffffff" strokeOpacity=".82" strokeWidth="2.2" />
          {selected && <ellipse cx={ground.x} cy={ground.y} rx={baseRx + 8} ry={baseRx * 0.3 + 5} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="8 6" />}
        </g>
      );
    }
    if (['zone', 'rect', 'ellipse', 'spotlight'].includes(stroke.kind) && stroke.points.length >= 2) {
      const [a, b] = stroke.points;
      const shapePoints: Point[] = stroke.kind === 'ellipse' || stroke.kind === 'spotlight'
        ? Array.from({ length: 40 }).map((_, index) => {
          const angle = (index / 40) * Math.PI * 2;
          return { x: a.x + (b.x - a.x) / 2 + Math.cos(angle) * Math.abs(b.x - a.x) / 2, y: a.y + (b.y - a.y) / 2 + Math.sin(angle) * Math.abs(b.y - a.y) / 2 };
        })
        : [{ x: a.x, y: a.y }, { x: b.x, y: a.y }, { x: b.x, y: b.y }, { x: a.x, y: b.y }];
      return <polygon key={stroke.id} {...groupProps} style={style} points={projectedPointString(shapePoints)} fill={stroke.color} fillOpacity={stroke.fillOpacity ?? 0.18} stroke={selected ? '#fff' : stroke.color} strokeWidth={stroke.width} strokeDasharray={stroke.dashed ? '10 7' : undefined} />;
    }
    if (stroke.kind === 'polygon') {
      return <polygon key={stroke.id} {...groupProps} style={style} points={projectedPointString(stroke.points)} fill={stroke.color} fillOpacity={stroke.fillOpacity ?? 0.18} stroke={selected ? '#fff' : stroke.color} strokeWidth={stroke.width} />;
    }
    let path = projectedPath(stroke.points);
    if (stroke.kind === 'run' && stroke.points.length >= 2) {
      const a = projectPoint(stroke.points[0]);
      const b = projectPoint(stroke.points[stroke.points.length - 1]);
      const angle = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
      path = Array.from({ length: 29 }).map((_, index) => {
        const t = index / 28;
        const offset = index === 0 || index === 28 ? 0 : Math.sin(t * Math.PI * 7) * 8;
        return `${index === 0 ? 'M' : 'L'} ${a.x + (b.x - a.x) * t + Math.cos(angle) * offset} ${a.y + (b.y - a.y) * t + Math.sin(angle) * offset}`;
      }).join(' ');
    }
    const end = projectPoint(stroke.points[stroke.points.length - 1]);
    const prev = projectPoint(stroke.points[Math.max(0, stroke.points.length - 2)]);
    const angle = Math.atan2(end.y - prev.y, end.x - prev.x);
    const hasArrow = ['arrow', 'curve', 'pass', 'run'].includes(stroke.kind);
    const head = `${end.x},${end.y} ${end.x - 22 * Math.cos(angle - Math.PI / 7)},${end.y - 22 * Math.sin(angle - Math.PI / 7)} ${end.x - 22 * Math.cos(angle + Math.PI / 7)},${end.y - 22 * Math.sin(angle + Math.PI / 7)}`;
    const first = projectPoint(stroke.points[0]);
    const mid = { x: (first.x + end.x) / 2, y: (first.y + end.y) / 2 };
    return (
      <g key={stroke.id} style={style} {...groupProps}>
        <path d={path} fill="none" stroke={selected ? '#fff' : stroke.color} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={stroke.dashed || stroke.kind === 'line' || stroke.kind === 'pass' ? '12 8' : undefined} />
        {hasArrow && <polygon points={head} fill={selected ? '#fff' : stroke.color} />}
        {stroke.kind === 'measure' && <text x={mid.x} y={mid.y - 10} textAnchor="middle" fill={stroke.color} fontSize="20" fontWeight="900" fontFamily="Arial,sans-serif" stroke="#02101f" strokeWidth="4" paintOrder="stroke">{fieldDistanceMeters(stroke).toFixed(1)} m</text>}
        {stroke.kind === 'link' && stroke.points.map((point, index) => { const projected = projectPoint(point); return <circle key={index} cx={projected.x} cy={projected.y} r="7" fill="#02101f" stroke={stroke.color} strokeWidth="3" />; })}
      </g>
    );
  };

  const renderProjectedPitch = () => {
    const fill = fieldTheme === 'paper' ? '#dcebd7' : fieldTheme === 'night' ? '#0a2040' : fieldTheme === 'blueprint' ? '#0d2f57' : '#0a4a2b';
    const line = (a: Point, b: Point, key: string, opacity = 0.72, dashed = false) => <path key={key} d={projectedPath([a, b])} stroke="#fff" strokeOpacity={opacity} strokeWidth="2.3" strokeDasharray={dashed ? '8 7' : undefined} fill="none" />;
    const circlePoints = Array.from({ length: 56 }).map((_, index) => {
      const angle = (index / 56) * Math.PI * 2;
      return { x: 500 + Math.cos(angle) * 82, y: 320 + Math.sin(angle) * 82 };
    });
    return (
      <g>
        <polygon points={projectedPointString([{ x: 20, y: 15 }, { x: 980, y: 15 }, { x: 980, y: 625 }, { x: 20, y: 625 }])} fill="#000" opacity=".3" transform="translate(18 36)" />
        <polygon points={projectedPointString([{ x: 20, y: 15 }, { x: 980, y: 15 }, { x: 980, y: 625 }, { x: 20, y: 625 }])} fill="#02140b" opacity=".92" transform="translate(0 22)" />
        <polygon points={projectedPointString([{ x: 20, y: 15 }, { x: 980, y: 15 }, { x: 980, y: 625 }, { x: 20, y: 625 }])} fill={fill} stroke="rgba(255,255,255,.28)" strokeWidth="2" />
        {Array.from({ length: 9 }).map((_, index) => index % 2 === 0 ? <polygon key={index} points={projectedPointString([{ x: 20 + index * 107, y: 15 }, { x: 20 + (index + 1) * 107, y: 15 }, { x: 20 + (index + 1) * 107, y: 625 }, { x: 20 + index * 107, y: 625 }])} fill="#fff" opacity=".035" /> : null)}
        {showGrid && Array.from({ length: 9 }).map((_, index) => line({ x: 100 + index * 100, y: 30 }, { x: 100 + index * 100, y: 610 }, `grid-v-${index}`, .16))}
        {showGrid && Array.from({ length: 5 }).map((_, index) => line({ x: 35, y: 130 + index * 100 }, { x: 965, y: 130 + index * 100 }, `grid-h-${index}`, .16))}
        {showThirds && line({ x: 333, y: 30 }, { x: 333, y: 610 }, 'third-1', .28, true)}
        {showThirds && line({ x: 666, y: 30 }, { x: 666, y: 610 }, 'third-2', .28, true)}
        {showChannels && [200, 400, 600, 800].map((x) => line({ x, y: 30 }, { x, y: 610 }, `channel-${x}`, .24, true))}
        <polygon points={projectedPointString([{ x: 35, y: 30 }, { x: 965, y: 30 }, { x: 965, y: 610 }, { x: 35, y: 610 }])} fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2.5" />
        {line({ x: 500, y: 30 }, { x: 500, y: 610 }, 'halfway')}
        <polygon points={projectedPointString(circlePoints)} fill="none" stroke="#fff" strokeOpacity=".72" strokeWidth="2.3" />
        <polygon points={projectedPointString([{ x: 35, y: 180 }, { x: 170, y: 180 }, { x: 170, y: 460 }, { x: 35, y: 460 }])} fill="none" stroke="#fff" strokeOpacity=".72" strokeWidth="2.3" />
        <polygon points={projectedPointString([{ x: 830, y: 180 }, { x: 965, y: 180 }, { x: 965, y: 460 }, { x: 830, y: 460 }])} fill="none" stroke="#fff" strokeOpacity=".72" strokeWidth="2.3" />
        <polygon points={projectedPointString([{ x: 35, y: 250 }, { x: 87, y: 250 }, { x: 87, y: 390 }, { x: 35, y: 390 }])} fill="none" stroke="#fff" strokeOpacity=".72" strokeWidth="2.3" />
        <polygon points={projectedPointString([{ x: 913, y: 250 }, { x: 965, y: 250 }, { x: 965, y: 390 }, { x: 913, y: 390 }])} fill="none" stroke="#fff" strokeOpacity=".72" strokeWidth="2.3" />
      </g>
    );
  };

  const token3dShape = (token: Token) => {
    const selected = token.id === selectedTokenId;
    const ground = projectPoint(token);
    const tokenScale = token.scale || 1;
    const s = ground.scale * tokenScale;
    const height = ['home', 'away', 'neutral', 'coach'].includes(token.kind) ? 44 : token.kind === 'mannequin' ? 46 : token.kind === 'goal' ? 38 : token.kind === 'miniGoal' ? 30 : token.kind === 'cone' ? 28 : token.kind === 'hurdle' ? 26 : token.kind === 'pole' || token.kind === 'flag' ? 50 : token.kind === 'ball' ? 12 : 5;
    const top = projectPoint(token, height * tokenScale);
    const groundPoint = (dx: number, dy: number, z = 0) => projectPoint(rotatedTokenPoint(token, dx, dy), z * tokenScale);
    let content: React.ReactNode = null;
    if (['home', 'away', 'neutral', 'coach'].includes(token.kind)) {
      content = <><path d={`M ${ground.x} ${ground.y} L ${top.x} ${top.y + 13 * s}`} stroke={tokenFill(token)} strokeWidth={8 * s} strokeLinecap="round" /><circle cx={top.x} cy={top.y} r={21 * s} fill={tokenFill(token)} stroke="#fff" strokeWidth={3.2 * s} />{showLabels && <text x={top.x} y={top.y + 5 * s} textAnchor="middle" fill={token.kind === 'away' ? '#fff' : '#02101f'} fontSize={(token.label.length > 2 ? 11 : 15) * s} fontWeight="900" fontFamily="Arial,sans-serif">{token.label}</text>}</>;
    } else if (token.kind === 'ball') {
      content = <><circle cx={top.x} cy={top.y} r={15 * s} fill="#fff" stroke="#111827" strokeWidth={2.6 * s} /><text x={top.x} y={top.y + 4 * s} textAnchor="middle" fontSize={13 * s}>⚽</text></>;
    } else if (token.kind === 'cone') {
      const left = groundPoint(-21, 6); const right = groundPoint(21, 6);
      content = <polygon points={`${top.x},${top.y} ${left.x},${left.y} ${right.x},${right.y}`} fill="#ff8500" stroke="#fff" strokeWidth={2.5 * s} />;
    } else if (token.kind === 'disc' || token.kind === 'ring') {
      content = <ellipse cx={ground.x} cy={ground.y} rx={(token.kind === 'ring' ? 27 : 24) * s} ry={(token.kind === 'ring' ? 12 : 9) * s} fill={token.kind === 'ring' ? 'rgba(128,237,153,.1)' : '#ffd166'} stroke={token.kind === 'ring' ? '#80ed99' : '#fff'} strokeWidth={4 * s} />;
    } else if (token.kind === 'miniGoal' || token.kind === 'goal') {
      const half = token.kind === 'goal' ? 58 : 36;
      const leftGround = groundPoint(-half, 0); const rightGround = groundPoint(half, 0); const leftTop = groundPoint(-half, 0, token.kind === 'goal' ? 38 : 30); const rightTop = groundPoint(half, 0, token.kind === 'goal' ? 38 : 30);
      content = <path d={`M ${leftGround.x} ${leftGround.y} L ${leftTop.x} ${leftTop.y} L ${rightTop.x} ${rightTop.y} L ${rightGround.x} ${rightGround.y}`} fill="rgba(255,255,255,.08)" stroke="#fff" strokeWidth={5 * s} strokeLinejoin="round" />;
    } else if (token.kind === 'mannequin') {
      content = <><path d={`M ${ground.x} ${ground.y} L ${top.x} ${top.y + 10 * s}`} stroke="#ffd166" strokeWidth={20 * s} strokeLinecap="round" /><circle cx={top.x} cy={top.y} r={10 * s} fill="#ffd166" stroke="#fff" strokeWidth={2.5 * s} /></>;
    } else if (token.kind === 'hurdle') {
      const leftGround = groundPoint(-36, 0); const rightGround = groundPoint(36, 0); const leftTop = groundPoint(-36, 0, 30); const rightTop = groundPoint(36, 0, 30);
      content = <path d={`M ${leftGround.x} ${leftGround.y} L ${leftTop.x} ${leftTop.y} L ${rightTop.x} ${rightTop.y} L ${rightGround.x} ${rightGround.y}`} fill="none" stroke="#ffd166" strokeWidth={5 * s} strokeLinejoin="round" />;
    } else if (token.kind === 'ladder') {
      const corners = [groundPoint(-52, -20), groundPoint(52, -20), groundPoint(52, 20), groundPoint(-52, 20)];
      content = <><polygon points={corners.map((point) => `${point.x},${point.y}`).join(' ')} fill="rgba(255,209,102,.12)" stroke="#ffd166" strokeWidth={3.5 * s} />{[-32, -16, 0, 16, 32].map((dx) => { const a = groundPoint(dx, -20); const b = groundPoint(dx, 20); return <path key={dx} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke="#ffd166" strokeWidth={2.4 * s} />; })}</>;
    } else if (token.kind === 'pole' || token.kind === 'flag') {
      content = <><path d={`M ${ground.x} ${ground.y} L ${top.x} ${top.y}`} stroke={token.kind === 'flag' ? '#fff' : '#ff5d8f'} strokeWidth={5 * s} strokeLinecap="round" />{token.kind === 'flag' && <polygon points={`${top.x},${top.y} ${top.x + 30 * s},${top.y + 9 * s} ${top.x},${top.y + 19 * s}`} fill="#ff5d73" stroke="#fff" strokeWidth={1.6 * s} />}</>;
    }
    return (
      <g key={token.id} className="board-token token-3d" onPointerDown={(event) => startTokenDrag(token, get3dPointFromClient(event.clientX, event.clientY), event)}>
        <ellipse cx={ground.x + 5 * s} cy={ground.y + 5 * s} rx={26 * s} ry={9 * s} fill="#000" opacity=".32" />
        {selected && <ellipse cx={ground.x} cy={ground.y} rx={38 * s} ry={15 * s} fill="none" stroke="#ffd166" strokeWidth={3 * s} strokeDasharray="7 6" />}
        {content}
      </g>
    );
  };

  const renderFloatingBoardTools = () => (
    <div className="floating-board-tools" aria-label="Herramientas rápidas sobre la pizarra">
      {[
        ['select', 'Puntero', <MousePointer2 size={17} />],
        ['beam', 'Luz', <Zap size={17} />],
        ['spotlight', 'Foco', <Crosshair size={17} />],
        ['free', 'Libre', <Pencil size={17} />],
        ['arrow', 'Flecha', <ArrowRight size={17} />],
        ['curve', 'Curva', <Spline size={17} />],
        ['polygon', 'Polígono', <Shapes size={17} />],
        ['text', 'Texto', <Type size={17} />],
        ['measure', 'Medir', <Ruler size={17} />],
        ['eraser', 'Borrar', <Eraser size={17} />]
      ].map(([item, label, icon]) => (
        <button key={item as string} className={tool === item ? 'active' : ''} onClick={() => chooseBoardTool(item as Tool)} title={item === 'beam' ? 'Cilindro de luz: arrastrá desde arriba hasta los pies del jugador o tocá al jugador' : item === 'select' ? 'Puntero: tocá un dibujo para moverlo y editar sus puntos' : label as string}>
          {icon}<span>{label as string}</span>
        </button>
      ))}
      <button onClick={undoStroke} disabled={!strokes.length} title="Deshacer trazo"><Undo2 size={17} /><span>Deshacer</span></button>
    </div>
  );

  return (
    <div className={`module-stack board-workspace board-tab-${boardWorkspaceTab}`} tabIndex={0} onKeyDown={handleBoardKeyDown}>
      <div className="module-heading">
        <div>
          <span className="eyebrow"><Layers size={16} /> Pizarras Pro 2D + 3D</span>
          <h2>Diseñá, animá y mostrá la idea desde cualquier ángulo</h2>
          <p>Dibujo profesional, biblioteca de materiales, textos, sombras, resaltados, mediciones, plantillas de ejercicios, secuencias por momentos y cámara 3D sincronizada con la misma pizarra.</p>
        </div>
        <div className="heading-actions">
          <button className="button secondary" onClick={saveSnapshot}><Save size={16} /> Guardar</button>
          <button className="button primary" onClick={exportPng}><Download size={16} /> PNG</button>
        </div>
      </div>

      <nav className="workspace-tabs board-workspace-tabs" aria-label="Solapas de trabajo de la pizarra">
        <div className="workspace-tabs-intro">
          <strong>Trabajá por tareas</strong>
          <span>La pizarra queda fija y al costado cambia solo la herramienta que necesitás.</span>
        </div>
        <div className="workspace-tab-buttons">
          {[
            ['draw', 'Dibujar / Luz', <Pencil size={17} />],
            ['elements', 'Elementos', <Shapes size={17} />],
            ['systems', 'Sistemas', <Users size={17} />],
            ['animate', 'Animación', <Film size={17} />],
            ['camera', 'Cámara 3D', <Orbit size={17} />],
            ['inspector', 'Inspector / Guardadas', <Settings2 size={17} />]
          ].map(([tab, label, icon]) => (
            <button key={tab as string} className={boardWorkspaceTab === tab ? 'active' : ''} onClick={() => openBoardWorkspace(tab as BoardWorkspaceTab)}>{icon} {label as string}</button>
          ))}
        </div>
      </nav>

      <section className="panel board-command-center">
        <div className="board-view-switcher">
          <div>
            <span className="eyebrow"><Move3d size={15} /> Vista de trabajo</span>
            <h3>{viewMode === '2d' ? 'Pizarra 2D táctica' : viewMode === '3d' ? 'Pizarra 3D con cámara' : '2D + 3D sincronizadas'}</h3>
          </div>
          <div className="segmented-control">
            <button className={viewMode === '2d' ? 'active' : ''} onClick={() => setViewMode('2d')}><Layers size={15} /> 2D</button>
            <button className={viewMode === '3d' ? 'active' : ''} onClick={() => setViewMode('3d')}><Box size={15} /> 3D</button>
            <button className={viewMode === 'split' ? 'active' : ''} onClick={() => setViewMode('split')}><Rows3 size={15} /> 2D + 3D</button>
          </div>
          <div className="board-quick-stats">
            <span><strong>{tokens.length}</strong> elementos</span>
            <span><strong>{strokes.length}</strong> trazos</span>
            <span><strong>{frames.length}</strong> momentos</span>
          </div>
        </div>

        <div className="board-control-grid">
          <div className="board-control-card wide board-tools-card">
            <span className="control-title"><Shapes size={16} /> Herramientas de dibujo y diagramación</span>
            <div className="tool-strip board-tools">
              {[
                ['select', 'Puntero / editar', <MousePointer2 size={15} />], ['free', 'Libre', <Pencil size={15} />], ['arrow', 'Flecha', <ArrowRight size={15} />],
                ['curve', 'Curva', <Spline size={15} />], ['line', 'Línea', <Edit3 size={15} />], ['run', 'Carrera', <Route size={15} />],
                ['pass', 'Pase', <Share2 size={15} />], ['rect', 'Rectángulo', <Square size={15} />], ['zone', 'Zona', <Square size={15} />],
                ['ellipse', 'Elipse', <Circle size={15} />], ['beam', 'Cilindro de luz', <Zap size={15} />], ['spotlight', 'Foco suelo', <Crosshair size={15} />], ['polygon', 'Polígono', <Shapes size={15} />],
                ['text', 'Texto', <Type size={15} />], ['measure', 'Medir', <Ruler size={15} />], ['angle', 'Ángulo', <Gauge size={15} />],
                ['link', 'Vínculo', <Link2 size={15} />], ['eraser', 'Borrar trazo', <Eraser size={15} />]
              ].map(([item, label, icon]) => (
                <button key={item as string} className={tool === item ? 'active' : ''} onClick={() => chooseBoardTool(item as Tool)}>{icon} {label as string}</button>
              ))}
            </div>
            {tool === 'select' && <div className="tool-context-row"><MousePointer2 size={16} /><span><strong>Puntero / editar:</strong> tocá un dibujo para seleccionarlo. Arrastrá el cuerpo para moverlo, los puntos blancos para deformarlo y la manija azul de la esquina para cambiar su tamaño. Supr/Delete elimina la selección.</span></div>}
            {tool === 'beam' && <div className="tool-context-row"><Zap size={16} /><span><strong>Cilindro de luz:</strong> arrastrá desde arriba hasta los pies del jugador para definir la altura, o tocá directamente al jugador. Queda seleccionado: el punto inferior lo mueve, el superior cambia la altura y el punto amarillo cambia el ancho. El Relleno controla la intensidad.</span></div>}
            {tool === 'polygon' && <div className="tool-context-row"><span>Cada toque agrega un vértice ({pendingPoints.length}). Cerrá con el botón, Enter o doble clic. Backspace borra el último; Escape cancela y vuelve al Puntero.</span><button className="mini-button" onClick={finishBoardPolygon} disabled={pendingPoints.length < 3}><Check size={14} /> Cerrar polígono</button><button className="mini-button" onClick={() => setPendingPoints((previous) => previous.slice(0, -1))} disabled={!pendingPoints.length}>Borrar último vértice</button><button className="mini-button danger" onClick={() => setPendingPoints([])} disabled={!pendingPoints.length}>Cancelar polígono</button></div>}
            {tool === 'angle' && <div className="tool-context-row"><span>Tocá extremo → vértice → extremo. Puntos: {pendingPoints.length}/3.</span><button className="mini-button" onClick={() => setPendingPoints([])}>Reiniciar</button></div>}
            {tool === 'text' && <div className="tool-context-row text-tool-row"><input value={boardText} onChange={(event) => setBoardText(event.target.value)} placeholder="Texto que se colocará al tocar la cancha" /><label>Tamaño <input type="range" min="16" max="42" step="1" value={boardFontSize} onChange={(event) => setBoardFontSize(Number(event.target.value))} /></label></div>}
          </div>

          <div className="board-control-card board-style-card">
            <span className="control-title"><SlidersHorizontal size={16} /> Estilo del trazo</span>
            <div className="color-swatches board-swatches">
              {['#00a8ff', '#ffd166', '#ffffff', '#ff5d8f', '#80ed99', '#ff8500', '#b388ff', '#111827'].map((item) => (
                <button key={item} className={`swatch ${color === item ? 'active' : ''}`} style={{ background: item }} onClick={() => setColor(item)} aria-label={`Color ${item}`} />
              ))}
              <input className="color-picker" type="color" value={color} onChange={(event) => setColor(event.target.value)} aria-label="Color personalizado" />
            </div>
            <div className="style-controls vertical">
              <label>Grosor <span>{strokeWidth}px</span><input type="range" min="2" max="14" step="1" value={strokeWidth} onChange={(event) => setStrokeWidth(Number(event.target.value))} /></label>
              <label>Opacidad <span>{Math.round(strokeOpacity * 100)}%</span><input type="range" min="0.2" max="1" step="0.05" value={strokeOpacity} onChange={(event) => setStrokeOpacity(Number(event.target.value))} /></label>
              <label>Relleno <span>{Math.round(fillOpacity * 100)}%</span><input type="range" min="0" max="0.8" step="0.05" value={fillOpacity} onChange={(event) => setFillOpacity(Number(event.target.value))} /></label>
            </div>
            <div className="check-grid">
              <label className="checkbox-inline"><input type="checkbox" checked={strokeDashed} onChange={(event) => setStrokeDashed(event.target.checked)} /> Punteado</label>
              <label className="checkbox-inline"><input type="checkbox" checked={strokeShadow} onChange={(event) => setStrokeShadow(event.target.checked)} /> Sombra/brillo</label>
            </div>
            <div className="button-row wrap">
              <button className="mini-button" onClick={undoStroke} disabled={!strokes.length}><Undo2 size={15} /> Deshacer</button>
              <button className="mini-button" onClick={redoStroke} disabled={!redoStack.length}><Redo2 size={15} /> Rehacer</button>
              <button className="mini-button danger" onClick={() => { setStrokes([]); setRedoStack([]); setSelectedStrokeId(''); }}><Eraser size={15} /> Limpiar trazos</button>
            </div>
          </div>

          <div className="board-control-card board-systems-card">
            <span className="control-title"><Users size={16} /> Sistemas y cancha</span>
            <div className="filter-grid two">
              <label>Sistema
                <select value={formation} onChange={(event) => setFormation(event.target.value)}>
                  {['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '5-3-2'].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>Aplicar a
                <select value={formationTarget} onChange={(event) => setFormationTarget(event.target.value as 'both' | 'home' | 'away')}>
                  <option value="both">Ambos equipos</option><option value="home">Solo propio</option><option value="away">Solo rival</option>
                </select>
              </label>
              <label>Tema
                <select value={fieldTheme} onChange={(event) => setFieldTheme(event.target.value as typeof fieldTheme)}>
                  <option value="green">Césped</option><option value="night">Nocturna</option><option value="blueprint">Plano azul</option><option value="paper">Papel / imprimir</option>
                </select>
              </label>
              <label>Fondo
                <button className="mini-button full" onClick={() => backgroundInputRef.current?.click()}><Upload size={14} /> Foto/captura</button>
                <input ref={backgroundInputRef} type="file" accept="image/*" hidden onChange={handleBackgroundImage} />
              </label>
            </div>
            <div className="button-row wrap">
              <button className="button secondary" onClick={applyFormation}>Cargar sistema</button>
              <button className="mini-button" onClick={flipBoard}><FlipHorizontal2 size={15} /> Invertir ataque</button>
              {backgroundImage && <button className="mini-button danger" onClick={() => setBackgroundImage('')}>Quitar fondo</button>}
            </div>
            <div className="check-grid">
              <label className="checkbox-inline"><input type="checkbox" checked={showThirds} onChange={(event) => setShowThirds(event.target.checked)} /> Tercios</label>
              <label className="checkbox-inline"><input type="checkbox" checked={showChannels} onChange={(event) => setShowChannels(event.target.checked)} /> 5 carriles</label>
              <label className="checkbox-inline"><input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} /> Grilla</label>
              <label className="checkbox-inline"><input type="checkbox" checked={snapToGrid} onChange={(event) => setSnapToGrid(event.target.checked)} /> <Magnet size={13} /> Ajustar a grilla</label>
              <label className="checkbox-inline"><input type="checkbox" checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} /> Números/nombres</label>
            </div>
          </div>

          <div className="board-control-card board-templates-card">
            <span className="control-title"><Sparkles size={16} /> Plantillas de ejercicios</span>
            <div className="template-buttons">
              <button onClick={() => applyExerciseTemplate('rondo')}>Rondo 4v1</button>
              <button onClick={() => applyExerciseTemplate('posesion')}>Posesión 6v6+2</button>
              <button onClick={() => applyExerciseTemplate('salida')}>Salida 7v5</button>
              <button onClick={() => applyExerciseTemplate('finalizacion')}>Finalización</button>
              <button onClick={() => applyExerciseTemplate('circuito')}>Circuito técnico</button>
            </div>
            <p className="helper-text">Cargan jugadores, materiales, zonas y recorridos editables. Después guardás momentos para animarlos.</p>
          </div>

          <div className="board-control-card token-catalog-card">
            <span className="control-title"><Plus size={16} /> Biblioteca de elementos de entrenamiento</span>
            <div className="token-catalog">
              {TOKEN_CATALOG.map((item) => (
                <button key={item.kind} onClick={() => addToken(item.kind)}>
                  <strong>{item.label}</strong><small>{item.hint}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="board-control-card sequence-card">
            <span className="control-title"><Film size={16} /> Animación por momentos</span>
            <div className="button-row wrap">
              <button className="mini-button" onClick={addBoardFrame}><Plus size={15} /> Guardar momento</button>
              <button className="mini-button" onClick={updateActiveFrame} disabled={!activeFrameId}><Save size={15} /> Actualizar activo</button>
              <button className="button primary" onClick={() => setPlayingSequence((value) => !value)} disabled={frames.length < 2}>{playingSequence ? <Pause size={15} /> : <Play size={15} />} {playingSequence ? 'Pausar' : 'Animar'}</button>
            </div>
            <label className="range-label">Secuencia
              <input type="range" min="0" max={Math.max(0, frames.length - 1)} step="0.01" value={sequenceProgress} onChange={(event) => { setSequenceProgress(Number(event.target.value)); setPlayingSequence(true); }} />
            </label>
            <label className="range-label">Velocidad · {sequenceSpeed}x
              <input type="range" min="0.4" max="2.5" step="0.1" value={sequenceSpeed} onChange={(event) => setSequenceSpeed(Number(event.target.value))} />
            </label>
            <div className="frame-list">
              {frames.map((frame, index) => (
                <div key={frame.id} className={`frame-item ${frame.id === activeFrameId ? 'active' : ''}`}>
                  <button onClick={() => loadBoardFrame(frame)}><span>{index + 1}</span><strong>{frame.name}</strong><small>{frame.tokens.length} fichas · {frame.strokes.length} trazos</small></button>
                  <button className="icon-small" onClick={() => setFrames((previous) => previous.filter((item) => item.id !== frame.id))} disabled={frames.length <= 1}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {viewMode !== '2d' && (
          <div className="camera-dock">
            <div className="camera-title"><Orbit size={18} /><div><strong>Cámara 3D</strong><span>La misma pizarra, vista con profundidad, sombras y altura.</span></div></div>
            <div className="camera-presets">
              <button onClick={() => { setCameraYaw(0); setCameraPitch(80); setCameraZoom(1); }}>Cenital</button>
              <button onClick={() => { setCameraYaw(0); setCameraPitch(34); setCameraZoom(1); }}>TV lateral</button>
              <button onClick={() => { setCameraYaw(-38); setCameraPitch(43); setCameraZoom(1); }}>Esquina</button>
              <button onClick={() => { setCameraYaw(90); setCameraPitch(36); setCameraZoom(0.96); }}>Detrás del arco</button>
              <button onClick={() => { setCameraYaw(180); setCameraPitch(42); setCameraZoom(1); }}>Banco rival</button>
            </div>
            <label>Giro {Math.round(cameraYaw)}°<input type="range" min="-180" max="180" step="1" value={cameraYaw} onChange={(event) => setCameraYaw(Number(event.target.value))} /></label>
            <label>Altura {Math.round(cameraPitch)}°<input type="range" min="15" max="85" step="1" value={cameraPitch} onChange={(event) => setCameraPitch(Number(event.target.value))} /></label>
            <label>Zoom {cameraZoom.toFixed(2)}x<input type="range" min="0.68" max="1.28" step="0.02" value={cameraZoom} onChange={(event) => setCameraZoom(Number(event.target.value))} /></label>
            <div className="segmented-control compact">
              <button className={cameraMode === 'move' ? 'active' : ''} onClick={() => setCameraMode('move')}>Mover fichas</button>
              <button className={cameraMode === 'orbit' ? 'active' : ''} onClick={() => { setCameraMode('orbit'); setTool('select'); }}>Orbitar arrastrando</button>
            </div>
            <label className="checkbox-inline"><input type="checkbox" checked={autoRotate} onChange={(event) => setAutoRotate(event.target.checked)} /> Giro automático</label>
          </div>
        )}
      </section>

      <div className="board-layout">
        <section className="panel board-panel">
          <div className="board-title-row">
            <input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Título de la pizarra" />
            <div className="row-actions">
              <button className="mini-button" onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}><Box size={15} /> {viewMode === '3d' ? 'Volver 2D' : 'Ver en 3D'}</button>
              <button className="mini-button" onClick={exportSvg}><FileDown size={15} /> SVG</button>
              <button className="mini-button" onClick={useInReport}><FileText size={15} /> Usar en informe</button>
            </div>
          </div>

          <div className={`board-surfaces ${viewMode}`}>
            {viewMode !== '3d' && (
              <div className="board-surface-wrap">
                <div className="surface-label"><Layers size={15} /> 2D · Diseño preciso {playingSequence && <span>Animando secuencia</span>}</div>
                {boardWorkspaceTab === 'draw' && renderFloatingBoardTools()}
                <svg
                  ref={svgRef}
                  className={`tactical-board ${tool !== 'select' ? 'drawing' : ''} theme-${fieldTheme}`}
                  viewBox="0 0 1000 640"
                  onPointerDown={boardDown}
                  onPointerMove={boardMove}
                  onPointerUp={boardUp}
                  onPointerCancel={boardUp}
                  onPointerLeave={boardUp}
                  onDoubleClick={() => { if (tool === 'polygon') finishBoardPolygon(); }}
                >
                  <defs>
                    <pattern id="pitch-stripes" width="100" height="640" patternUnits="userSpaceOnUse">
                      <rect width="50" height="640" fill="#0a4a2b" />
                      <rect x="50" width="50" height="640" fill="#073d24" />
                    </pattern>
                  </defs>
                  <rect width="1000" height="640" fill={fieldTheme === 'green' ? 'url(#pitch-stripes)' : fieldTheme === 'night' ? '#06172e' : fieldTheme === 'blueprint' ? '#0b2a4d' : '#e8f1df'} />
                  {backgroundImage && <image href={backgroundImage} x="0" y="0" width="1000" height="640" preserveAspectRatio="none" opacity="0.9" />}
                  {showGrid && (
                    <g stroke="#ffffff" strokeOpacity="0.13" strokeWidth="1.5">
                      {Array.from({ length: 9 }).map((_, index) => <line key={`v-${index}`} x1={100 + index * 100} y1="30" x2={100 + index * 100} y2="610" />)}
                      {Array.from({ length: 5 }).map((_, index) => <line key={`h-${index}`} x1="35" y1={130 + index * 100} x2="965" y2={130 + index * 100} />)}
                    </g>
                  )}
                  {showThirds && (
                    <g stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="9 9">
                      <line x1="333" y1="30" x2="333" y2="610" />
                      <line x1="666" y1="30" x2="666" y2="610" />
                    </g>
                  )}
                  {showChannels && (
                    <g stroke="#7dd7ff" strokeOpacity="0.26" strokeWidth="2" strokeDasharray="7 8">
                      {[200, 400, 600, 800].map((x) => <line key={x} x1={x} y1="30" x2={x} y2="610" />)}
                    </g>
                  )}
                  <PitchLines />
                  <text x="500" y="58" textAnchor="middle" fill={fieldTheme === 'paper' ? '#14532d' : '#ffffff'} fillOpacity="0.22" fontSize="28" fontWeight="900" fontFamily="Arial,sans-serif">Ramela · LABORATORIO TÁCTICO PRO</text>
                  {displayStrokes.map((stroke) => (
                    <StrokeShape
                      key={stroke.id}
                      stroke={stroke}
                      selected={stroke.id === selectedStrokeId}
                      editable={stroke.id === selectedStrokeId && !playingSequence}
                      selectedPointIndex={stroke.id === selectedStrokeId ? selectedStrokePointIndex : null}
                      onSelect={tool === 'select' && !playingSequence ? (item, event) => selectStroke(item, get2dPointFromClient(event.clientX, event.clientY)) : undefined}
                      onPointDown={startStrokePointDrag}
                      onResizeDown={startStrokeResize}
                    />
                  ))}
                  {pendingPoints.length > 0 && <StrokeShape stroke={makeBoardStroke(tool === 'angle' ? 'angle' : 'polygon', pendingPoints)} />}
                  {draftStroke && <StrokeShape stroke={draftStroke} />}
                  {displayTokens.map(tokenShape)}
                </svg>
              </div>
            )}

            {viewMode !== '2d' && (
              <div className="board-surface-wrap">
                <div className="surface-label"><Box size={15} /> 3D · Cámara {Math.round(cameraYaw)}° / {Math.round(cameraPitch)}° {cameraMode === 'orbit' ? <span>Arrastrá para orbitar</span> : <span>Mové fichas o dibujá sobre el plano</span>}</div>
                {boardWorkspaceTab === 'draw' && renderFloatingBoardTools()}
                <svg
                  ref={svg3dRef}
                  className={`tactical-board board-3d ${tool !== 'select' ? 'drawing' : ''} ${cameraMode === 'orbit' ? 'orbiting' : ''}`}
                  viewBox="0 0 1000 700"
                  onPointerDown={board3dDown}
                  onPointerMove={board3dMove}
                  onPointerUp={boardUp}
                  onPointerCancel={boardUp}
                  onPointerLeave={boardUp}
                >
                  <defs>
                    <linearGradient id="board3dSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#020914" />
                      <stop offset="55%" stopColor="#061b34" />
                      <stop offset="100%" stopColor="#020914" />
                    </linearGradient>
                    <radialGradient id="board3dGlow" cx="50%" cy="42%" r="58%">
                      <stop offset="0%" stopColor="#00a8ff" stopOpacity=".2" />
                      <stop offset="62%" stopColor="#00a8ff" stopOpacity=".04" />
                      <stop offset="100%" stopColor="#00a8ff" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width="1000" height="700" fill="url(#board3dSky)" />
                  <rect width="1000" height="700" fill="url(#board3dGlow)" />
                  <text x="500" y="42" textAnchor="middle" fill="#7dd7ff" fillOpacity=".34" fontSize="25" fontWeight="900" fontFamily="Arial,sans-serif">Ramela · VISTA TÁCTICA 3D</text>
                  {renderProjectedPitch()}
                  {displayStrokes.map(projectedStrokeShape)}
                  {pendingPoints.length > 0 && projectedStrokeShape(makeBoardStroke(tool === 'angle' ? 'angle' : 'polygon', pendingPoints))}
                  {draftStroke && projectedStrokeShape(draftStroke)}
                  {[...displayTokens].sort((a, b) => projectPoint(a).depth - projectPoint(b).depth).map(token3dShape)}
                </svg>
              </div>
            )}
          </div>
          <p className="helper-text">
            Tip profesional: diseñá en 2D, guardá 2–4 momentos, tocá “Animar” y pasá a 3D para explicarlo con profundidad. En 3D, “Orbitar” mueve la cámara; “Mover fichas” permite arrastrar elementos y seguir dibujando.
          </p>
        </section>

        <aside className="panel board-side">
          <h3><Settings2 size={18} /> Inspector de selección</h3>
          {selectedToken ? (
            <div className="form-stack inspector-stack">
              <span className="selected-kind">{TOKEN_CATALOG.find((item) => item.kind === selectedToken.kind)?.label || selectedToken.kind}</span>
              <label className="field-label">Número, nombre corto o rol</label>
              <input value={selectedToken.label} maxLength={8} onChange={(event) => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, label: event.target.value } : token))} />
              <div className="token-position-grid">
                <label>X<input type="number" min="0" max="1000" value={Math.round(selectedToken.x)} onChange={(event) => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, x: clamp(Number(event.target.value), 0, 1000) } : token))} /></label>
                <label>Y<input type="number" min="0" max="640" value={Math.round(selectedToken.y)} onChange={(event) => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, y: clamp(Number(event.target.value), 0, 640) } : token))} /></label>
              </div>
              <label className="range-label">Tamaño · {(selectedToken.scale || 1).toFixed(2)}x
                <input type="range" min="0.45" max="2.6" step="0.05" value={selectedToken.scale || 1} onChange={(event) => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, scale: Number(event.target.value) } : token))} />
              </label>
              <label className="range-label">Rotación · {Math.round(selectedToken.rotation || 0)}°
                <input type="range" min="-180" max="180" step="5" value={selectedToken.rotation || 0} onChange={(event) => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, rotation: Number(event.target.value) } : token))} />
              </label>
              {['home', 'away', 'neutral', 'coach'].includes(selectedToken.kind) && (
                <label className="field-label">Color de camiseta/ficha
                  <span className="color-input-row"><input className="color-picker" type="color" value={selectedToken.color || tokenFill(selectedToken)} onChange={(event) => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, color: event.target.value } : token))} /><button className="mini-button" onClick={() => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, color: undefined } : token))}>Color default</button></span>
                </label>
              )}
              <div className="button-row wrap">
                <button className="mini-button" onClick={() => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, scale: clamp((token.scale || 1) - 0.15, 0.45, 2.6) } : token))}><ZoomOut size={14} /> Achicar</button>
                <button className="mini-button" onClick={() => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, scale: clamp((token.scale || 1) + 0.15, 0.45, 2.6) } : token))}><ZoomIn size={14} /> Agrandar</button>
                <button className="mini-button" onClick={() => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, rotation: ((token.rotation || 0) - 15 + 540) % 360 - 180 } : token))}>↺ 15°</button>
                <button className="mini-button" onClick={() => setTokens((previous) => previous.map((token) => token.id === selectedToken.id ? { ...token, rotation: ((token.rotation || 0) + 15 + 540) % 360 - 180 } : token))}>↻ 15°</button>
              </div>
              <div className="button-row wrap">
                <button className="mini-button" onClick={() => {
                  setTokens((previous) => {
                    const index = previous.findIndex((token) => token.id === selectedToken.id);
                    if (index < 0) return previous;
                    const next = [...previous];
                    const [item] = next.splice(index, 1);
                    next.push(item);
                    return next;
                  });
                }}>Traer al frente</button>
                <button className="mini-button" onClick={() => {
                  setTokens((previous) => {
                    const index = previous.findIndex((token) => token.id === selectedToken.id);
                    if (index < 0) return previous;
                    const next = [...previous];
                    const [item] = next.splice(index, 1);
                    next.unshift(item);
                    return next;
                  });
                }}>Enviar atrás</button>
              </div>
              <button className="button secondary full" onClick={() => {
                const copy = { ...selectedToken, id: uid(selectedToken.kind), x: clamp(selectedToken.x + 38, 0, 1000), y: clamp(selectedToken.y + 38, 0, 640) };
                setTokens((previous) => [...previous, copy]);
                setSelectedTokenId(copy.id);
              }}><Copy size={15} /> Duplicar elemento</button>
              <button className="button danger-button full" onClick={() => { setTokens((previous) => previous.filter((token) => token.id !== selectedToken.id)); setSelectedTokenId(''); }}><Trash2 size={15} /> Eliminar elemento</button>
            </div>
          ) : selectedStroke ? (
            <div className="form-stack inspector-stack">
              <span className="selected-kind">Editando: {strokeKindLabel(selectedStroke.kind)} · {selectedStroke.points.length} punto(s)</span>
              <p className="helper-text">En la pizarra 2D: <strong>cuerpo</strong> = mover · <strong>puntos blancos</strong> = deformar · <strong>manija azul</strong> = tamaño. En 3D podés seleccionarlo y moverlo; la edición fina de puntos se hace en 2D.</p>
              <label className="field-label">Color
                <span className="color-input-row"><input className="color-picker" type="color" value={selectedStroke.color} onChange={(event) => setStrokes((previous) => previous.map((stroke) => stroke.id === selectedStroke.id ? { ...stroke, color: event.target.value } : stroke))} /><span>{selectedStroke.color}</span></span>
              </label>
              <label className="range-label">Grosor · {selectedStroke.width}px
                <input type="range" min="2" max="16" step="1" value={selectedStroke.width} onChange={(event) => setStrokes((previous) => previous.map((stroke) => stroke.id === selectedStroke.id ? { ...stroke, width: Number(event.target.value) } : stroke))} />
              </label>
              <label className="range-label">Opacidad · {Math.round((selectedStroke.opacity ?? 1) * 100)}%
                <input type="range" min="0.15" max="1" step="0.05" value={selectedStroke.opacity ?? 1} onChange={(event) => setStrokes((previous) => previous.map((stroke) => stroke.id === selectedStroke.id ? { ...stroke, opacity: Number(event.target.value) } : stroke))} />
              </label>
              <label className="range-label">{selectedStroke.kind === 'beam' ? 'Intensidad de luz' : 'Relleno'} · {Math.round((selectedStroke.fillOpacity ?? 0.16) * 100)}%
                <input type="range" min="0" max="0.85" step="0.05" value={selectedStroke.fillOpacity ?? 0.16} onChange={(event) => setStrokes((previous) => previous.map((stroke) => stroke.id === selectedStroke.id ? { ...stroke, fillOpacity: Number(event.target.value) } : stroke))} />
              </label>
              {selectedStroke.kind === 'beam' && selectedStroke.points.length >= 2 && (
                <>
                  <label className="range-label">Ancho del cilindro · {Math.round(getBeamRadius(selectedStroke) * 2)}
                    <input type="range" min="36" max="420" step="4" value={getBeamRadius(selectedStroke) * 2} onChange={(event) => updateBoardStroke(selectedStroke.id, (stroke) => ({ ...stroke, radius: Number(event.target.value) / 2 }))} />
                  </label>
                  <label className="range-label">Altura del cilindro · {Math.round(Math.abs(selectedStroke.points[1].y - selectedStroke.points[0].y))}
                    <input type="range" min="60" max="620" step="5" value={Math.abs(selectedStroke.points[1].y - selectedStroke.points[0].y)} onChange={(event) => updateBoardStroke(selectedStroke.id, (stroke) => ({ ...stroke, points: [{ x: stroke.points[1].x, y: clamp(stroke.points[1].y - Number(event.target.value), 0, 640) }, stroke.points[1]] }))} />
                  </label>
                </>
              )}
              {(selectedStroke.kind === 'text' || selectedStroke.text) && (
                <>
                  <label className="field-label">Texto</label>
                  <input value={selectedStroke.text || ''} onChange={(event) => setStrokes((previous) => previous.map((stroke) => stroke.id === selectedStroke.id ? { ...stroke, text: event.target.value } : stroke))} />
                  <label className="range-label">Tamaño del texto
                    <input type="range" min="15" max="46" step="1" value={selectedStroke.fontSize || 24} onChange={(event) => setStrokes((previous) => previous.map((stroke) => stroke.id === selectedStroke.id ? { ...stroke, fontSize: Number(event.target.value) } : stroke))} />
                  </label>
                </>
              )}
              <div className="check-grid">
                <label className="checkbox-inline"><input type="checkbox" checked={Boolean(selectedStroke.dashed)} onChange={(event) => setStrokes((previous) => previous.map((stroke) => stroke.id === selectedStroke.id ? { ...stroke, dashed: event.target.checked } : stroke))} /> Punteado</label>
                <label className="checkbox-inline"><input type="checkbox" checked={Boolean(selectedStroke.shadow)} onChange={(event) => setStrokes((previous) => previous.map((stroke) => stroke.id === selectedStroke.id ? { ...stroke, shadow: event.target.checked } : stroke))} /> Sombra/brillo</label>
              </div>
              <div className="button-row wrap">
                <button className="mini-button" onClick={() => scaleSelectedStroke(0.9)}><ZoomOut size={14} /> Achicar</button>
                <button className="mini-button" onClick={() => scaleSelectedStroke(1.1)}><ZoomIn size={14} /> Agrandar</button>
                {['curve', 'polygon', 'free', 'angle'].includes(selectedStroke.kind) && <button className="mini-button" onClick={addStrokeMidpoint}><Plus size={14} /> Agregar punto</button>}
                {selectedStrokePointIndex !== null && ['curve', 'polygon', 'free'].includes(selectedStroke.kind) && <button className="mini-button danger" onClick={deleteSelectedStrokePoint}><Trash2 size={14} /> Borrar punto elegido</button>}
                {selectedStroke.kind === 'curve' && <button className="mini-button" onClick={() => { updateBoardStroke(selectedStroke.id, (stroke) => ({ ...stroke, points: simplifyCurvePoints(stroke.points) })); setSelectedStrokePointIndex(null); }}><Spline size={14} /> Dejar puntos editables</button>}
              </div>
              <button className="button secondary full" onClick={() => {
                const copy: Stroke = { ...structuredClone(selectedStroke), id: uid('stroke'), points: selectedStroke.points.map((point) => ({ x: clamp(point.x + 28, 0, 1000), y: clamp(point.y + 28, 0, 640) })) };
                setStrokes((previous) => [...previous, copy]);
                setSelectedStrokeId(copy.id);
                setSelectedStrokePointIndex(null);
              }}><Copy size={15} /> Duplicar trazo</button>
              <button className="button danger-button full" onClick={deleteSelectedStroke}><Trash2 size={15} /> Eliminar {selectedStroke.kind === 'polygon' ? 'polígono' : selectedStroke.kind === 'beam' ? 'cilindro' : 'trazo'} (o Supr)</button>
            </div>
          ) : <p className="helper-text">Con “Puntero / editar” tocá una ficha, un material o un trazo para moverlo y cambiar tamaño, rotación, color, texto, sombra y posición. Escape vuelve siempre al Puntero.</p>}

          <div className="side-divider" />
          <h3><Save size={18} /> Pizarras guardadas</h3>
          <div className="snapshot-list">
            {snapshots.map((snapshot) => (
              <div className="snapshot-item" key={snapshot.id}>
                <button onClick={() => { setTitle(snapshot.title); setTokens(structuredClone(snapshot.tokens)); setStrokes(structuredClone(snapshot.strokes)); showToast('Pizarra cargada.'); }}>
                  <strong>{snapshot.title}</strong>
                  <small>{new Date(snapshot.createdAt).toLocaleDateString('es-AR')} · {snapshot.tokens.length} fichas</small>
                </button>
                <button className="icon-small" onClick={() => setSnapshots((previous) => previous.filter((item) => item.id !== snapshot.id))}><Trash2 size={15} /></button>
              </div>
            ))}
            {!snapshots.length && <div className="empty-mini">Guardá tu primera pizarra para reutilizarla.</div>}
          </div>

          <div className="side-divider" />
          <h3><Share2 size={18} /> Compartir idea</h3>
          <button className="button whatsapp full" onClick={() => window.open(waLink(`Hola, te comparto la idea táctica "${title}" creada en el Laboratorio Táctico del Profe. Alejandro Ramela. Adjunto la imagen exportada desde la pizarra.`), '_blank')}>
            <Send size={16} /> Preparar WhatsApp
          </button>
          <p className="helper-text">WhatsApp no adjunta archivos desde un enlace: primero descargá el PNG y adjuntalo en el chat.</p>
        </aside>
      </div>
    </div>
  );
}

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
            <span className="brand-badge">AR</span>
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
            <a className="site-link" href={SITE_URL} target="_blank" rel="noreferrer">Web Alejandro Ramela <ExternalLink size={14} /></a>
          </div>
        </div>
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
            <span className="brand-badge small">AR</span>
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
