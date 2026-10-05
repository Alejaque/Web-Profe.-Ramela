/**
 * Almacén mínimo del carrito basado en localStorage, pensado para usarse con
 * `useSyncExternalStore`. Los cursos son digitales, por lo que el carrito
 * guarda únicamente los `slug` de cada curso (sin cantidades).
 */
const STORAGE_KEY = "profe-ramela-carrito-v1";

const EMPTY: string[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedValue: string[] = EMPTY;

function parse(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return EMPTY;
  }
}

export function getCartSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

export function getServerCartSnapshot(): string[] {
  return EMPTY;
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeToCart(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setCart(next: string[]) {
  try {
    if (next.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // localStorage no disponible (modo privado, etc.): se ignora.
  }
  emit();
}
