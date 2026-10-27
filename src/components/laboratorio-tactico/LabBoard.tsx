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

export function TacticalBoard(props: BoardProps) {
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
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) redoStroke(); else undoStroke();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      redoStroke();
      return;
    }
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
      <button onClick={undoStroke} disabled={!strokes.length} title="Deshacer trazo (Ctrl+Z)"><Undo2 size={17} /><span>Deshacer</span></button>
      <button onClick={redoStroke} disabled={!redoStack.length} title="Rehacer trazo (Ctrl+Mayús+Z)"><Redo2 size={17} /><span>Rehacer</span></button>
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
            {tool === 'select' && <div className="tool-context-row"><MousePointer2 size={16} /><span><strong>Puntero / editar:</strong> tocá un dibujo para seleccionarlo. Arrastrá el cuerpo para moverlo, los puntos blancos para deformarlo y la manija azul de la esquina para cambiar su tamaño. Supr/Delete o el botón rojo «Eliminar …» borra la selección (los textos se agarran tocando el cartelito en cualquier parte). Ctrl+Z deshace y Ctrl+Mayús+Z rehace.</span></div>}
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
              <button className="button danger-button full" onClick={deleteSelectedStroke}><Trash2 size={15} /> Eliminar {strokeKindLabel(selectedStroke.kind).toLowerCase()} (o Supr)</button>
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
