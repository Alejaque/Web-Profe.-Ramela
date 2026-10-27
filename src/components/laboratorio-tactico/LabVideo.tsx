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


import { Tab, PlanTier, Audience, ClipSource, Tool, VideoWorkspaceTab, BoardWorkspaceTab, StrokeKind, TokenKind, BoardViewMode, EventTeam, EventOutcome, Clip, Marker, Playlist, CustomTagButton, MicroTask, MicroDay, Point, Stroke, Token, BoardSnapshot, BoardFrame, ReportData, PersistedState, STORAGE_KEY, WHATSAPP_NUMBER, SITE_URL, PHASES, SYSTEMS, CONCEPTS, MARKER_TAGS, TAG_GROUPS, EVENT_OUTCOMES, EVENT_ZONES, TAG_COLORS, TOKEN_CATALOG, TRIAL_DAYS, AUDIENCES, AUDIENCE_PROFILES, PLAN_NAMES, PlanPrice, RamelaLabConfig, DEFAULT_PLAN_PRICES, getPlanPrice, IS_SAMPLE_MODE, uid, clamp, formatTime, formatPreciseTime, trialDaysLeft, inferMarkerGroup, markerEnd, distanceBetween, distanceToSegment, strokeHit, getBeamRadius, StrokeBounds, getStrokeBounds, strokeKindLabel, getEditablePointIndices, simplifyPoints, limitPointCount, simplifyCurvePoints, smoothPath, wavyPath, fieldDistanceMeters, csvEscape, waLink, escapeHtml, downloadText, downloadUrl, getYouTubeId, sourceLabel, formationTokens, makeTasks, microTemplate, getDefaults, loadPersisted, interpolatePath, pointsToPath, StrokeShape, PitchLines, MiniPitch, TacticalSimulation } from "./LabShared";
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

export function VideoAnalyzer(props: AnalyzerProps) {
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
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) redoAnnotation(); else undoAnnotation();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      redoAnnotation();
      return;
    }
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
                      <button onClick={undoAnnotation} disabled={!(annotations[selectedClip.id] || []).length} title="Deshacer (Ctrl+Z)"><Undo2 size={16} /></button>
                      <button onClick={redoAnnotation} disabled={!redoAnnotations.length} title="Rehacer (Ctrl+Mayús+Z)"><Redo2 size={16} /></button>
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
            {videoTool === 'select' && <div className="beam-help pointer-help"><MousePointer2 size={17} /><span><strong>Puntero / editar:</strong> tocá un dibujo para seleccionarlo. Arrastrá el cuerpo para moverlo, los puntos blancos para deformarlo y la manija azul de la esquina para cambiar su tamaño. Supr/Delete o el botón rojo «Eliminar …» borra la selección (los textos se agarran tocando el cartelito en cualquier parte). Ctrl+Z deshace y Ctrl+Mayús+Z rehace.</span></div>}
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
                  <p>En el video: <strong>cuerpo</strong> = mover · <strong>puntos blancos</strong> = deformar · <strong>manija azul</strong> = tamaño. Para borrar: el botón rojo de abajo, tocarlo con Borrar o Supr/Delete. Los textos se seleccionan tocando el cartelito en cualquier parte.</p>
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
                    <button className="mini-button danger" onClick={deleteSelectedAnnotation}><Trash2 size={14} /> Eliminar {strokeKindLabel(selectedAnnotation.kind).toLowerCase()}</button>
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
          <div className="button-row wrap">
            <button className="mini-button danger" onClick={() => { if (window.confirm('¿Borrar todos los eventos de este clip?')) { setMarkers((previous) => previous.filter((item) => item.clipId !== selectedClip.id)); showToast('Eventos del clip eliminados. Queda guardado en este dispositivo.'); } }}><Trash2 size={14} /> Borrar eventos del clip</button>
            <button className="mini-button danger" onClick={() => { if (window.confirm('¿Borrar TODOS los eventos de todos los clips? Queda guardado en este dispositivo.')) { setMarkers([]); showToast('Todos los eventos eliminados. Queda guardado en este dispositivo.'); } }}><Trash2 size={14} /> Borrar todos los eventos</button>
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
                    <button onClick={() => { setMarkers((previous) => previous.filter((item) => item.id !== marker.id)); showToast('Evento eliminado.'); }} title="Eliminar evento"><Trash2 size={14} /></button>
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
