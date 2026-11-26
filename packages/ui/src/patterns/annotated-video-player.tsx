"use client";

import {
  CheckCircle2,
  MessageSquarePlus,
  MessagesSquare,
  Minus,
  Plus,
  RotateCcw,
  SquareDashed,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Button } from "../components/button";
import { Textarea } from "../components/textarea";
import { formatRecorderClock } from "../hooks/media-recorder";
import { cn } from "../lib/utils";
import {
  markerPercent,
  parseClock,
  rectFromPoints,
  rectToBox,
  toRelativePoint,
  videoContentBox,
  type Box,
  type RelativeRect,
} from "../lib/video-annotation-geometry";

/** View model of an annotation reply. No API types: the app maps them (#197). */
export type VideoAnnotationReplyView = {
  id: string;
  authorName: string;
  /** Absent once deleted. */
  body?: string;
  mine: boolean;
  deleted: boolean;
  edited: boolean;
};

export type VideoAnnotationView = {
  id: string;
  atMs: number;
  rect?: RelativeRect;
  authorName: string;
  /** Absent once deleted. */
  body?: string;
  mine: boolean;
  resolved: boolean;
  deleted: boolean;
  edited: boolean;
  replies: VideoAnnotationReplyView[];
};

export type NewVideoAnnotation = {
  atMs: number;
  rect?: RelativeRect;
  body: string;
};

export type AnnotatedVideoLabels = {
  video: string;
  annotate: string;
  annotations: string;
  unread: string;
  markers: string;
  composerTitle: string;
  time: string;
  earlier: string;
  later: string;
  pointArea: string;
  removeArea: string;
  drawHint: string;
  bodyPlaceholder: string;
  send: string;
  cancel: string;
  reply: string;
  replyPlaceholder: string;
  resolve: string;
  reopen: string;
  resolved: string;
  edit: string;
  save: string;
  delete: string;
  edited: string;
  deletedAnnotation: string;
  deletedReply: string;
  empty: string;
  error: string;
  close: string;
};

export const annotatedVideoLabelsFr: AnnotatedVideoLabels = {
  video: "Message vidéo",
  annotate: "Annoter",
  annotations: "Annotations",
  unread: "non lues",
  markers: "Repères des annotations",
  composerTitle: "Nouvelle annotation",
  time: "Moment",
  earlier: "Une seconde plus tôt",
  later: "Une seconde plus tard",
  pointArea: "Pointer une zone",
  removeArea: "Retirer la zone",
  drawHint: "Tracez un rectangle sur l'image.",
  bodyPlaceholder: "Votre question ou remarque…",
  send: "Envoyer",
  cancel: "Annuler",
  reply: "Répondre",
  replyPlaceholder: "Votre réponse…",
  resolve: "Marquer comme résolue",
  reopen: "Rouvrir",
  resolved: "Résolue",
  edit: "Modifier",
  save: "Enregistrer",
  delete: "Supprimer",
  edited: "modifiée",
  deletedAnnotation: "Annotation supprimée",
  deletedReply: "Réponse supprimée",
  empty: "Aucune annotation pour l'instant.",
  error: "L'action n'a pas abouti. Réessayez.",
  close: "Fermer",
};

export type AnnotatedVideoPlayerProps = {
  src: string;
  poster?: string;
  /** Recorded duration. Browser recordings often report no duration of their own. */
  durationMs?: number;
  labels: AnnotatedVideoLabels;
  annotations: VideoAnnotationView[];
  unreadCount?: number;
  /** False while the message is still uploading. */
  canAnnotate?: boolean;
  /** Called when the annotations panel opens (marks them read). */
  onOpenPanel?: () => void;
  onClosePanel?: () => void;
  onCreate: (input: NewVideoAnnotation) => Promise<void>;
  onReply: (annotationId: string, body: string) => Promise<void>;
  onResolve: (annotationId: string, resolved: boolean) => Promise<void>;
  onEdit: (annotationId: string, body: string) => Promise<void>;
  onDelete: (annotationId: string) => Promise<void>;
  onEditReply: (replyId: string, body: string) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
  className?: string;
};

type Draft = {
  atMs: number;
  clock: string;
  rect?: RelativeRect;
  drawing: boolean;
  body: string;
};

const BODY_MAX = 1000;

function useContentBox(
  wrapper: HTMLDivElement | null,
  video: HTMLVideoElement | null,
): Box | null {
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    if (!wrapper || !video) return;
    const measure = () => {
      setBox(
        videoContentBox(
          video.clientWidth,
          video.clientHeight,
          video.videoWidth,
          video.videoHeight,
        ),
      );
    };
    measure();
    video.addEventListener("loadedmetadata", measure);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(video);
    return () => {
      video.removeEventListener("loadedmetadata", measure);
      observer?.disconnect();
    };
  }, [wrapper, video]);

  return box;
}

/**
 * Video message player with timestamped annotations (#197): markers under the
 * video, a rectangle over the paused frame, and a thread per annotation.
 */
export function AnnotatedVideoPlayer({
  src,
  poster,
  durationMs,
  labels,
  annotations,
  unreadCount = 0,
  canAnnotate = true,
  onOpenPanel,
  onClosePanel,
  onCreate,
  onReply,
  onResolve,
  onEdit,
  onDelete,
  onEditReply,
  onDeleteReply,
  className,
}: AnnotatedVideoPlayerProps) {
  const [wrapperEl, setWrapperEl] = useState<HTMLDivElement | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const box = useContentBox(wrapperEl, videoEl);
  const [currentMs, setCurrentMs] = useState(0);
  const [mediaDurationMs, setMediaDurationMs] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<RelativeRect | null>(null);
  const panelId = useId();

  const totalMs =
    durationMs && durationMs > 0 ? durationMs : (mediaDurationMs ?? 0);
  const selected = annotations.find((a) => a.id === selectedId) ?? null;
  const shownRect = draft ? (dragRect ?? draft.rect) : selected?.rect;

  const pause = useCallback(() => {
    videoEl?.pause();
  }, [videoEl]);

  const seek = useCallback(
    (atMs: number) => {
      if (!videoEl) return;
      videoEl.pause();
      videoEl.currentTime = atMs / 1000;
      setCurrentMs(atMs);
    },
    [videoEl],
  );

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    onOpenPanel?.();
  }, [onOpenPanel]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    onClosePanel?.();
  }, [onClosePanel]);

  async function run(action: () => Promise<void>): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      await action();
      return true;
    } catch {
      setError(labels.error);
      return false;
    } finally {
      setBusy(false);
    }
  }

  function startDraft() {
    pause();
    const atMs = Math.round((videoEl?.currentTime ?? 0) * 1000);
    setSelectedId(null);
    setDraft({ atMs, clock: formatRecorderClock(atMs), drawing: false, body: "" });
  }

  function shiftDraft(deltaMs: number) {
    if (!draft) return;
    const max = totalMs > 0 ? totalMs : Number.POSITIVE_INFINITY;
    const atMs = Math.min(max, Math.max(0, draft.atMs + deltaMs));
    setDraft({ ...draft, atMs, clock: formatRecorderClock(atMs) });
    seek(atMs);
  }

  function selectAnnotation(annotation: VideoAnnotationView) {
    setDraft(null);
    setSelectedId(annotation.id);
    seek(annotation.atMs);
    if (!panelOpen) openPanel();
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draft?.drawing || !box) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    dragStart.current = toRelativePoint(
      event.clientX - bounds.left,
      event.clientY - bounds.top,
      box,
    );
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragRect(null);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragStart.current || !box) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const point = toRelativePoint(
      event.clientX - bounds.left,
      event.clientY - bounds.top,
      box,
    );
    setDragRect(rectFromPoints(dragStart.current, point));
  }

  function onPointerUp() {
    if (!dragStart.current) return;
    dragStart.current = null;
    if (draft && dragRect) {
      setDraft({ ...draft, rect: dragRect, drawing: false });
    }
    setDragRect(null);
  }

  async function submitDraft() {
    if (!draft) return;
    const body = draft.body.trim();
    if (!body) return;
    const ok = await run(() =>
      onCreate({
        atMs: draft.atMs,
        ...(draft.rect ? { rect: draft.rect } : {}),
        body,
      }),
    );
    if (ok) {
      setDraft(null);
      if (!panelOpen) openPanel();
    }
  }

  useEffect(() => {
    if (!draft?.drawing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dragStart.current = null;
        setDragRect(null);
        setDraft((current) => (current ? { ...current, drawing: false } : current));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft?.drawing]);

  const count = annotations.filter((a) => !a.deleted).length;

  return (
    <div data-slot="annotated-video" className={cn("flex w-full flex-col gap-2", className)}>
      <div ref={setWrapperEl} className="relative w-full">
        <video
          ref={setVideoEl}
          controls={!draft?.drawing}
          playsInline
          preload="metadata"
          src={src}
          poster={poster}
          aria-label={labels.video}
          onTimeUpdate={(event) =>
            setCurrentMs(Math.round(event.currentTarget.currentTime * 1000))
          }
          onLoadedMetadata={(event) => {
            const seconds = event.currentTarget.duration;
            if (Number.isFinite(seconds) && seconds > 0) {
              setMediaDurationMs(Math.round(seconds * 1000));
            }
          }}
          className="aspect-video w-full rounded-lg bg-black object-contain"
        />
        {shownRect && box ? (
          <div
            aria-hidden
            data-testid="annotation-rect"
            className="pointer-events-none absolute rounded-sm border-2 border-amber-400 bg-amber-400/15 shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
            style={rectToBox(shownRect, box)}
          />
        ) : null}
        {draft?.drawing ? (
          <div
            data-testid="annotation-draw-surface"
            className="absolute inset-0 cursor-crosshair touch-none rounded-lg ring-2 ring-amber-400/70"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        ) : null}
      </div>

      {totalMs > 0 ? (
        <Timeline
          labels={labels}
          totalMs={totalMs}
          currentMs={currentMs}
          annotations={annotations}
          selectedId={selectedId}
          draftAtMs={draft?.atMs}
          onSeek={seek}
          onSelect={selectAnnotation}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {canAnnotate && !draft ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={startDraft}
            data-testid="annotate-button"
          >
            <MessageSquarePlus />
            {labels.annotate}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-expanded={panelOpen}
          aria-controls={panelId}
          onClick={() => (panelOpen ? closePanel() : openPanel())}
          data-testid="annotations-toggle"
        >
          <MessagesSquare />
          {labels.annotations}
          <span className="tabular-nums">({count})</span>
          {unreadCount > 0 && !panelOpen ? (
            <span
              data-testid="annotations-unread"
              aria-label={`${unreadCount} ${labels.unread}`}
              className="rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground tabular-nums"
            >
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="m-0 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {draft ? (
        <DraftForm
          labels={labels}
          draft={draft}
          busy={busy}
          onChange={setDraft}
          onShift={shiftDraft}
          onClockCommit={(clock) => {
            const parsed = parseClock(clock);
            if (parsed == null) {
              setDraft({ ...draft, clock: formatRecorderClock(draft.atMs) });
              return;
            }
            const atMs = totalMs > 0 ? Math.min(parsed, totalMs) : parsed;
            setDraft({ ...draft, atMs, clock: formatRecorderClock(atMs) });
            seek(atMs);
          }}
          onSubmit={() => {
            void submitDraft();
          }}
          onCancel={() => {
            setDraft(null);
            setDragRect(null);
          }}
        />
      ) : null}

      {panelOpen ? (
        <AnnotationList
          id={panelId}
          labels={labels}
          annotations={annotations}
          selectedId={selectedId}
          busy={busy}
          onSelect={selectAnnotation}
          onClose={closePanel}
          onReply={(id, body) => run(() => onReply(id, body))}
          onResolve={(id, resolved) => run(() => onResolve(id, resolved))}
          onEdit={(id, body) => run(() => onEdit(id, body))}
          onDelete={(id) => run(() => onDelete(id))}
          onEditReply={(id, body) => run(() => onEditReply(id, body))}
          onDeleteReply={(id) => run(() => onDeleteReply(id))}
        />
      ) : null}
    </div>
  );
}

function Timeline({
  labels,
  totalMs,
  currentMs,
  annotations,
  selectedId,
  draftAtMs,
  onSeek,
  onSelect,
}: {
  labels: AnnotatedVideoLabels;
  totalMs: number;
  currentMs: number;
  annotations: VideoAnnotationView[];
  selectedId: string | null;
  draftAtMs?: number;
  onSeek: (atMs: number) => void;
  onSelect: (annotation: VideoAnnotationView) => void;
}) {
  return (
    <div
      role="group"
      aria-label={labels.markers}
      data-testid="annotation-timeline"
      className="relative h-5 w-full"
    >
      <div
        className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 cursor-pointer rounded-full bg-muted-foreground/20"
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (bounds.width <= 0) return;
          onSeek(Math.round(((event.clientX - bounds.left) / bounds.width) * totalMs));
        }}
      >
        <div
          className="h-full rounded-full bg-primary/60"
          style={{ width: `${markerPercent(currentMs, totalMs)}%` }}
        />
      </div>
      {annotations.map((annotation) => (
        <button
          key={annotation.id}
          type="button"
          data-testid="annotation-marker"
          aria-label={`${formatRecorderClock(annotation.atMs)} ${
            annotation.body ?? labels.deletedAnnotation
          }`.slice(0, 120)}
          title={formatRecorderClock(annotation.atMs)}
          onClick={() => onSelect(annotation)}
          className={cn(
            "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            annotation.deleted || annotation.resolved ? "bg-muted-foreground/50" : "bg-amber-500",
            annotation.id === selectedId && "size-4 ring-2 ring-amber-400",
          )}
          style={{ left: `${markerPercent(annotation.atMs, totalMs)}%` }}
        />
      ))}
      {draftAtMs != null ? (
        <span
          aria-hidden
          className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-amber-500"
          style={{ left: `${markerPercent(draftAtMs, totalMs)}%` }}
        />
      ) : null}
    </div>
  );
}

function DraftForm({
  labels,
  draft,
  busy,
  onChange,
  onShift,
  onClockCommit,
  onSubmit,
  onCancel,
}: {
  labels: AnnotatedVideoLabels;
  draft: Draft;
  busy: boolean;
  onChange: (draft: Draft) => void;
  onShift: (deltaMs: number) => void;
  onClockCommit: (clock: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const clockId = useId();
  return (
    <form
      data-testid="annotation-draft"
      className="flex flex-col gap-2 rounded-lg border border-border bg-background p-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="m-0 text-xs font-medium">{labels.composerTitle}</p>
      <div className="flex flex-wrap items-center gap-1">
        <label htmlFor={clockId} className="text-xs text-muted-foreground">
          {labels.time}
        </label>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-7"
          aria-label={labels.earlier}
          onClick={() => onShift(-1000)}
        >
          <Minus />
        </Button>
        <input
          id={clockId}
          value={draft.clock}
          inputMode="decimal"
          data-testid="annotation-clock"
          onChange={(event) => onChange({ ...draft, clock: event.target.value })}
          onBlur={(event) => onClockCommit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onClockCommit(event.currentTarget.value);
            }
          }}
          className="w-14 rounded-md border border-border bg-background px-1.5 py-0.5 text-center font-mono text-xs tabular-nums"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-7"
          aria-label={labels.later}
          onClick={() => onShift(1000)}
        >
          <Plus />
        </Button>
        {draft.rect ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange({ ...draft, rect: undefined, drawing: false })}
            data-testid="annotation-remove-area"
          >
            <X />
            {labels.removeArea}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant={draft.drawing ? "secondary" : "ghost"}
            aria-pressed={draft.drawing}
            onClick={() => onChange({ ...draft, drawing: !draft.drawing })}
            data-testid="annotation-point-area"
          >
            <SquareDashed />
            {labels.pointArea}
          </Button>
        )}
      </div>
      {draft.drawing ? (
        <p className="m-0 text-xs text-muted-foreground">{labels.drawHint}</p>
      ) : null}
      <Textarea
        value={draft.body}
        maxLength={BODY_MAX}
        rows={2}
        placeholder={labels.bodyPlaceholder}
        aria-label={labels.bodyPlaceholder}
        data-testid="annotation-body"
        onChange={(event) => onChange({ ...draft, body: event.target.value })}
        className="min-h-14 text-sm"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {labels.cancel}
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={busy || draft.body.trim().length === 0}
          data-testid="annotation-submit"
        >
          {labels.send}
        </Button>
      </div>
    </form>
  );
}

function AnnotationList({
  id,
  labels,
  annotations,
  selectedId,
  busy,
  onSelect,
  onClose,
  onReply,
  onResolve,
  onEdit,
  onDelete,
  onEditReply,
  onDeleteReply,
}: {
  id: string;
  labels: AnnotatedVideoLabels;
  annotations: VideoAnnotationView[];
  selectedId: string | null;
  busy: boolean;
  onSelect: (annotation: VideoAnnotationView) => void;
  onClose: () => void;
  onReply: (id: string, body: string) => Promise<boolean>;
  onResolve: (id: string, resolved: boolean) => Promise<boolean>;
  onEdit: (id: string, body: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onEditReply: (id: string, body: string) => Promise<boolean>;
  onDeleteReply: (id: string) => Promise<boolean>;
}) {
  return (
    <section
      id={id}
      aria-label={labels.annotations}
      data-testid="annotations-panel"
      className="flex flex-col gap-2 rounded-lg border border-border bg-background p-2"
    >
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-xs font-semibold">{labels.annotations}</h3>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-6"
          aria-label={labels.close}
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      {annotations.length === 0 ? (
        <p className="m-0 text-xs text-muted-foreground">{labels.empty}</p>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {annotations.map((annotation) => (
            <AnnotationItem
              key={annotation.id}
              labels={labels}
              annotation={annotation}
              selected={annotation.id === selectedId}
              busy={busy}
              onSelect={() => onSelect(annotation)}
              onReply={(body) => onReply(annotation.id, body)}
              onResolve={() => onResolve(annotation.id, !annotation.resolved)}
              onEdit={(body) => onEdit(annotation.id, body)}
              onDelete={() => onDelete(annotation.id)}
              onEditReply={onEditReply}
              onDeleteReply={onDeleteReply}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function AnnotationItem({
  labels,
  annotation,
  selected,
  busy,
  onSelect,
  onReply,
  onResolve,
  onEdit,
  onDelete,
  onEditReply,
  onDeleteReply,
}: {
  labels: AnnotatedVideoLabels;
  annotation: VideoAnnotationView;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  onReply: (body: string) => Promise<boolean>;
  onResolve: () => Promise<boolean>;
  onEdit: (body: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onEditReply: (id: string, body: string) => Promise<boolean>;
  onDeleteReply: (id: string) => Promise<boolean>;
}) {
  const [reply, setReply] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <li
      data-testid="annotation-item"
      data-resolved={annotation.resolved || undefined}
      className={cn(
        "flex flex-col gap-1.5 rounded-md border p-2 text-sm",
        selected ? "border-amber-400" : "border-border",
        annotation.resolved && "opacity-75",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="rounded bg-amber-500/15 px-1.5 font-mono text-xs tabular-nums text-amber-700 hover:bg-amber-500/25 dark:text-amber-300"
        >
          {formatRecorderClock(annotation.atMs)}
        </button>
        {annotation.rect ? (
          <SquareDashed aria-hidden className="size-3.5 text-muted-foreground" />
        ) : null}
        <span className="text-xs font-medium">{annotation.authorName}</span>
        {annotation.resolved ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5" />
            {labels.resolved}
          </span>
        ) : null}
      </div>

      {annotation.deleted ? (
        <p className="m-0 text-xs italic text-muted-foreground">
          {labels.deletedAnnotation}
        </p>
      ) : editing !== null ? (
        <InlineEditor
          labels={labels}
          value={editing}
          busy={busy}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={async () => {
            if (await onEdit(editing.trim())) setEditing(null);
          }}
        />
      ) : (
        <p className="m-0 whitespace-pre-wrap">
          {annotation.body}
          {annotation.edited ? (
            <span className="ml-1 text-[10px] text-muted-foreground">({labels.edited})</span>
          ) : null}
        </p>
      )}

      {!annotation.deleted && editing === null ? (
        <div className="flex flex-wrap gap-1">
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={busy} onClick={() => void onResolve()}>
            {annotation.resolved ? <RotateCcw /> : <CheckCircle2 />}
            {annotation.resolved ? labels.reopen : labels.resolve}
          </Button>
          {annotation.mine ? (
            <>
              <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" disabled={busy} onClick={() => setEditing(annotation.body ?? "")}>
                {labels.edit}
              </Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive" disabled={busy} onClick={() => void onDelete()}>
                {labels.delete}
              </Button>
            </>
          ) : null}
        </div>
      ) : null}

      {annotation.replies.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-1 border-l-2 border-border pl-2">
          {annotation.replies.map((item) => (
            <ReplyItem
              key={item.id}
              labels={labels}
              reply={item}
              busy={busy}
              onEdit={(body) => onEditReply(item.id, body)}
              onDelete={() => onDeleteReply(item.id)}
            />
          ))}
        </ul>
      ) : null}

      {!annotation.deleted ? (
        <form
          className="flex gap-1"
          onSubmit={async (event) => {
            event.preventDefault();
            const body = reply.trim();
            if (!body) return;
            if (await onReply(body)) setReply("");
          }}
        >
          <input
            value={reply}
            maxLength={BODY_MAX}
            placeholder={labels.replyPlaceholder}
            aria-label={labels.replyPlaceholder}
            data-testid="annotation-reply-input"
            onChange={(event) => setReply(event.target.value)}
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
          />
          <Button type="submit" size="sm" className="h-7 px-2 text-xs" disabled={busy || !reply.trim()}>
            {labels.reply}
          </Button>
        </form>
      ) : null}
    </li>
  );
}

function ReplyItem({
  labels,
  reply,
  busy,
  onEdit,
  onDelete,
}: {
  labels: AnnotatedVideoLabels;
  reply: VideoAnnotationReplyView;
  busy: boolean;
  onEdit: (body: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <li data-testid="annotation-reply" className="flex flex-col gap-0.5 text-xs">
      <span className="font-medium">{reply.authorName}</span>
      {reply.deleted ? (
        <span className="italic text-muted-foreground">{labels.deletedReply}</span>
      ) : editing !== null ? (
        <InlineEditor
          labels={labels}
          value={editing}
          busy={busy}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={async () => {
            if (await onEdit(editing.trim())) setEditing(null);
          }}
        />
      ) : (
        <span className="whitespace-pre-wrap">
          {reply.body}
          {reply.edited ? (
            <span className="ml-1 text-[10px] text-muted-foreground">({labels.edited})</span>
          ) : null}
        </span>
      )}
      {reply.mine && !reply.deleted && editing === null ? (
        <span className="flex gap-2">
          <button type="button" className="text-[11px] text-muted-foreground hover:underline" disabled={busy} onClick={() => setEditing(reply.body ?? "")}>
            {labels.edit}
          </button>
          <button type="button" className="text-[11px] text-destructive hover:underline" disabled={busy} onClick={() => void onDelete()}>
            {labels.delete}
          </button>
        </span>
      ) : null}
    </li>
  );
}

function InlineEditor({
  labels,
  value,
  busy,
  onChange,
  onCancel,
  onSave,
}: {
  labels: AnnotatedVideoLabels;
  value: string;
  busy: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Textarea
        value={value}
        maxLength={BODY_MAX}
        rows={2}
        aria-label={labels.edit}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 text-xs"
      />
      <div className="flex justify-end gap-1">
        <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onCancel}>
          {labels.cancel}
        </Button>
        <Button type="button" size="sm" className="h-7 px-2 text-xs" disabled={busy || !value.trim()} onClick={onSave}>
          {labels.save}
        </Button>
      </div>
    </div>
  );
}
