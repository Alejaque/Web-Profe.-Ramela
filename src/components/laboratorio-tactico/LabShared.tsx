'use client';
import { dorado, blanco } from '@/components/IdentidadOficial';

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

export type Tab = 'home' | 'analyzer' | 'board' | 'microcycle' | 'report' | 'pricing' | 'manual';
export type PlanTier = 'free' | 'pro' | 'staff' | 'club';
export type Audience = 'Infantil' | 'Juvenil' | 'Primera';
export type ClipSource = 'demo' | 'mp4' | 'youtube' | 'file';
export type Tool = 'select' | 'free' | 'arrow' | 'curve' | 'line' | 'run' | 'pass' | 'zone' | 'rect' | 'ellipse' | 'spotlight' | 'beam' | 'polygon' | 'text' | 'measure' | 'angle' | 'link' | 'eraser';
export type VideoWorkspaceTab = 'tagging' | 'drawing' | 'events' | 'timeline' | 'data' | 'heat' | 'presentation' | 'clips';
export type BoardWorkspaceTab = 'draw' | 'elements' | 'systems' | 'animate' | 'camera' | 'inspector';
export type StrokeKind = Exclude<Tool, 'select' | 'eraser'>;
export type TokenKind = 'home' | 'away' | 'neutral' | 'coach' | 'ball' | 'cone' | 'disc' | 'miniGoal' | 'goal' | 'mannequin' | 'hurdle' | 'ladder' | 'ring' | 'pole' | 'flag';
export type BoardViewMode = '2d' | '3d' | 'split';
export type EventTeam = 'Propio' | 'Rival' | 'Neutral';
export type EventOutcome = 'Positivo' | 'Negativo' | 'Neutro' | 'Ocasión' | 'Gol' | 'Error';

export interface Clip {
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

export interface Marker {
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

export interface Playlist {
  id: string;
  name: string;
  clipIds: string[];
  markerIds?: string[];
}

export interface CustomTagButton {
  id: string;
  group: string;
  label: string;
  color: string;
}

export interface MicroTask {
  id: string;
  text: string;
  done: boolean;
}

export interface MicroDay {
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

export interface Point { x: number; y: number; }

export interface Stroke {
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

export interface Token {
  id: string;
  kind: TokenKind;
  label: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  color?: string;
}

export interface BoardSnapshot {
  id: string;
  title: string;
  tokens: Token[];
  strokes: Stroke[];
  createdAt: string;
}

export interface BoardFrame {
  id: string;
  name: string;
  tokens: Token[];
  strokes: Stroke[];
}

export interface ReportData {
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

export interface PersistedState {
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

export const STORAGE_KEY = 'ramela-lab-tactico-v1';
export const WHATSAPP_NUMBER = '5493644670461';
export const SITE_URL = 'https://ramelafutbol.vercel.app';

export const PHASES = ['Ataque Organizado', 'Defensa Organizada', 'Transición Ofensiva', 'Transición Defensiva', 'Balón Parado (ABP)', 'Juego Reducido'];
export const SYSTEMS = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '5-3-2', 'Libre / Formativo'];
export const CONCEPTS = ['Salida desde el Fondo', 'Presión Tras Pérdida', 'Bloque Bajo', 'Tercer Hombre', 'Ataque Directo', 'Vigilancia Ofensiva', 'Coberturas', 'Desmarque', 'Finalización'];
export const MARKER_TAGS = ['Clave táctica', 'Salida', 'Presión', 'Cobertura', 'Desmarque', 'Error a Corregir', 'Buena decisión', 'ABP', 'Transición'];
export const TAG_GROUPS: Record<string, string[]> = {
  'Ataque': ['Salida', 'Progresión', 'Tercer hombre', 'Pase clave', 'Centro', 'Remate', 'Gol'],
  'Defensa': ['Presión', 'Recuperación', 'Repliegue', 'Bloque', 'Cobertura', 'Duelo', 'Despeje'],
  'Transiciones': ['Pérdida', 'Post-pérdida', 'Contraataque', 'Balance defensivo', 'Vigilancia'],
  'ABP': ['Tiro libre', 'Córner a favor', 'Córner en contra', 'Lateral', 'Saque de arco', 'Penal'],
  'Jugador / equipo': ['Buena decisión', 'Error a corregir', 'Clave táctica', 'Comunicación', 'Gestión emocional']
};
export const EVENT_OUTCOMES: EventOutcome[] = ['Positivo', 'Negativo', 'Neutro', 'Ocasión', 'Gol', 'Error'];
export const EVENT_ZONES = ['Tercio defensivo', 'Tercio medio', 'Tercio ofensivo', 'Carril Izquierdo', 'Carril central', 'Carril derecho', 'Área propia', 'Área rival'];
export const TAG_COLORS: Record<string, string> = {
  'Ataque': '#00a8ff', 'Defensa': '#ff5d73', 'Transiciones': '#ffd166', 'ABP': '#b388ff', 'Jugador / equipo': '#35e0a1'
};
export const TOKEN_CATALOG: Array<{ kind: TokenKind; label: string; hint: string }> = [
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
export const TRIAL_DAYS = 10;
export const AUDIENCES: Audience[] = ['Infantil', 'Juvenil', 'Primera'];

export const AUDIENCE_PROFILES: Record<Audience, {
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

export const PLAN_NAMES: Record<PlanTier, string> = {
  free: 'Prueba 10 días',
  pro: 'DT Pro',
  staff: 'Cuerpo Técnico',
  club: 'Club'
};

export interface PlanPrice {
  monthly: Record<'ARS' | 'USD', number>;
  annual: Record<'ARS' | 'USD', number>;
}

export interface RamelaLabConfig {
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
export const DEFAULT_PLAN_PRICES: Record<Exclude<PlanTier, 'free'>, PlanPrice> = {
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

export function getPlanPrice(tier: Exclude<PlanTier, 'free'>): PlanPrice {
  const fallback = DEFAULT_PLAN_PRICES[tier];
  if (typeof window === 'undefined') return fallback;
  const override = window.Ramela_LAB_CONFIG?.prices?.[tier];
  if (!override) return fallback;
  return {
    monthly: { ...fallback.monthly, ...(override.monthly || {}) },
    annual: { ...fallback.annual, ...(override.annual || {}) }
  };
}

export const IS_SAMPLE_MODE = typeof window !== 'undefined' && Boolean(window.Ramela_LAB_CONFIG?.sampleMode);

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function formatPreciseTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00.0';
  const base = formatTime(seconds);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${base}.${tenths}`;
}

export function trialDaysLeft(trialStartedAt: string) {
  const started = Date.parse(trialStartedAt);
  if (!Number.isFinite(started)) return TRIAL_DAYS;
  const elapsedDays = (Date.now() - started) / 86400000;
  return clamp(Math.ceil(TRIAL_DAYS - elapsedDays), 0, TRIAL_DAYS);
}

export function inferMarkerGroup(marker: Pick<Marker, 'label' | 'group'>) {
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

export function markerEnd(marker: Marker, fallbackDuration = 6) {
  return Math.max(marker.time, marker.endTime ?? marker.time + fallbackDuration);
}

export function distanceBetween(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function distanceToSegment(point: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (!lengthSq) return distanceBetween(point, a);
  const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq, 0, 1);
  return distanceBetween(point, { x: a.x + t * dx, y: a.y + t * dy });
}

export function strokeHit(stroke: Stroke, point: Point, tolerance = 18) {
  if (!stroke.points.length) return false;
  if (stroke.kind === 'text') {
    const anchor = stroke.points[0];
    const fontSize = stroke.fontSize || 24;
    const label = stroke.text || 'Texto';
    const boxWidth = Math.max(74, label.length * fontSize * 0.62 + 22);
    const pad = Math.max(tolerance, 16);
    return point.x >= anchor.x - 9 - pad && point.x <= anchor.x - 9 + boxWidth + pad
      && point.y >= anchor.y - fontSize - 9 - pad && point.y <= anchor.y + 11 + pad;
  }
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

export function getBeamRadius(stroke: Stroke) {
  if (stroke.radius) return clamp(stroke.radius, 18, 260);
  if (stroke.points.length >= 2) {
    return clamp(52 + distanceBetween(stroke.points[0], stroke.points[1]) * 0.16 + stroke.width * 4, 56, 150);
  }
  return 64;
}

export interface StrokeBounds { minX: number; minY: number; maxX: number; maxY: number; }

export function getStrokeBounds(stroke: Stroke): StrokeBounds {
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

export function strokeKindLabel(kind: StrokeKind) {
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

export function getEditablePointIndices(stroke: Stroke) {
  if (stroke.points.length <= 9) return stroke.points.map((_, index) => index);
  const handleCount = 7;
  const indices = Array.from({ length: handleCount }, (_, item) => Math.round((item / (handleCount - 1)) * (stroke.points.length - 1)));
  return Array.from(new Set(indices));
}

export function simplifyPoints(points: Point[], tolerance = 6): Point[] {
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

export function limitPointCount(points: Point[], maxPoints = 9): Point[] {
  if (points.length <= maxPoints) return points;
  return Array.from({ length: maxPoints }, (_, item) => points[Math.round((item / (maxPoints - 1)) * (points.length - 1))]);
}

export function simplifyCurvePoints(points: Point[]): Point[] {
  return limitPointCount(simplifyPoints(points, 7), 9);
}

export function smoothPath(points: Point[]) {
  if (points.length < 3) return pointsToPath(points);
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const mid = { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
    path += ` Q ${points[i].x} ${points[i].y}, ${mid.x} ${mid.y}`;
  }
  const last = points[points.length - 1];
  return `${path} L ${last.x} ${last.y}`;
}

export function wavyPath(points: Point[]) {
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

export function fieldDistanceMeters(stroke: Stroke) {
  if (stroke.points.length < 2) return 0;
  const a = stroke.points[0];
  const b = stroke.points[stroke.points.length - 1];
  const metersX = ((b.x - a.x) / 1000) * 105;
  const metersY = ((b.y - a.y) / 640) * 68;
  return Math.hypot(metersX, metersY);
}

export function csvEscape(value: string | number | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function downloadText(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadUrl(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

export function getYouTubeId(url: string) {
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

export function sourceLabel(source: ClipSource) {
  if (source === 'demo') return 'Simulación demo';
  if (source === 'youtube') return 'YouTube';
  if (source === 'file') return 'Archivo local';
  return 'Video web';
}

export function formationTokens(system = '4-3-3'): Token[] {
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

export function makeTasks(texts: string[]): MicroTask[] {
  return texts.map((text, index) => ({ id: `task-${index}-${Math.random().toString(36).slice(2, 6)}`, text, done: false }));
}

export function microTemplate(audience: Audience): MicroDay[] {
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

export function getDefaults(): PersistedState {
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

export function loadPersisted(): PersistedState {
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

export function interpolatePath(points: Point[], t: number): Point {
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

export function pointsToPath(points: Point[]) {
  if (!points.length) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

export function StrokeShape({
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

export function PitchLines({ width = 1000, height = 640, compact = false }: { width?: number; height?: number; compact?: boolean }) {
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

export function MiniPitch({ seed = 1 }: { seed?: number }) {
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

export function TacticalSimulation({ clip, time }: { clip: Clip; time: number }) {
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
