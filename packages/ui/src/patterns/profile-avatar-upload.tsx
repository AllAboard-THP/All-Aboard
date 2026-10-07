"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { Button } from "../components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/dialog";
import {
  computePixelCrop,
  getCroppedImageBlob,
  type Pan,
  type PixelCrop,
} from "../lib/crop-image";
import { cn } from "../lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;
const CROP_VIEWPORT_PX = 320;

export type ProfileAvatarUploadLabels = {
  hint: string;
  chooseLabel: string;
  changeLabel: string;
  removeLabel: string;
  cropTitle: string;
  cropConfirm: string;
  cropCancel: string;
  uploadingLabel: string;
  fileTooLargeError: string;
  invalidTypeError: string;
};

function AvatarCropViewport({
  imageSrc,
  imageSize,
  pan,
  zoom,
  onPanChange,
  onImageLoad,
}: {
  imageSrc: string;
  imageSize: { width: number; height: number } | null;
  pan: Pan;
  zoom: number;
  onPanChange: (pan: Pan) => void;
  onImageLoad: (size: { width: number; height: number }) => void;
}) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const baseScale = imageSize
    ? Math.max(
        CROP_VIEWPORT_PX / imageSize.width,
        CROP_VIEWPORT_PX / imageSize.height,
      )
    : null;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return;
    }
    onPanChange({
      x: dragRef.current.panX + (event.clientX - dragRef.current.startX),
      y: dragRef.current.panY + (event.clientY - dragRef.current.startY),
    });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      className="relative mx-auto touch-none overflow-hidden rounded-xl bg-muted"
      style={{ width: CROP_VIEWPORT_PX, height: CROP_VIEWPORT_PX }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={imageSrc}
        alt=""
        draggable={false}
        className="pointer-events-none absolute top-1/2 left-1/2 max-w-none select-none"
        style={
          baseScale && imageSize
            ? {
                width: imageSize.width * baseScale * zoom,
                height: imageSize.height * baseScale * zoom,
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`,
              }
            : { opacity: 0 }
        }
        onLoad={(event) => {
          const target = event.currentTarget;
          onImageLoad({
            width: target.naturalWidth,
            height: target.naturalHeight,
          });
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary/70 ring-inset"
        aria-hidden
      />
    </div>
  );
}

export function ProfileAvatarUploadField({
  labels,
  avatarUrl,
  initials,
  displayName,
  uploading = false,
  onUpload,
  onRemove,
  disabled = false,
  className,
}: {
  labels: ProfileAvatarUploadLabels;
  avatarUrl?: string;
  initials: string;
  displayName: string;
  uploading?: boolean;
  onUpload: (file: Blob) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);

  const pixelCrop = useMemo<PixelCrop | null>(() => {
    if (!imageSize) {
      return null;
    }
    return computePixelCrop(
      imageSize.width,
      imageSize.height,
      pan,
      zoom,
      CROP_VIEWPORT_PX,
    );
  }, [imageSize, pan, zoom]);

  const closeCrop = useCallback(() => {
    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
    }
    setCropSrc(null);
    setImageSize(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setCropping(false);
  }, [cropSrc]);

  useEffect(() => {
    return () => {
      if (cropSrc) {
        URL.revokeObjectURL(cropSrc);
      }
    };
  }, [cropSrc]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setLocalError(labels.invalidTypeError);
      return;
    }

    if (file.size > MAX_BYTES) {
      setLocalError(labels.fileTooLargeError);
      return;
    }

    setLocalError(null);
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setImageSize(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const confirmCrop = async () => {
    if (!cropSrc || !pixelCrop) {
      return;
    }

    setCropping(true);
    try {
      const blob = await getCroppedImageBlob(
        cropSrc,
        pixelCrop,
        "image/jpeg",
        0.92,
      );
      await onUpload(blob);
      closeCrop();
    } catch {
      setLocalError(labels.invalidTypeError);
      setCropping(false);
    }
  };

  const hasAvatar = Boolean(avatarUrl?.trim());

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm text-muted-foreground">{labels.hint}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-16 shrink-0">
          {hasAvatar ? (
            <AvatarImage src={avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploading || cropping}
            onClick={() => inputRef.current?.click()}
          >
            {uploading
              ? labels.uploadingLabel
              : hasAvatar
                ? labels.changeLabel
                : labels.chooseLabel}
          </Button>
          {hasAvatar && onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || uploading || cropping}
              onClick={() => void onRemove()}
            >
              {labels.removeLabel}
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={onFileChange}
      />
      {localError ? (
        <p className="text-sm text-destructive">{localError}</p>
      ) : null}

      <Dialog
        open={cropSrc != null}
        onOpenChange={(open) => {
          if (!open) {
            closeCrop();
          }
        }}
      >
        <DialogContent className="max-w-md gap-4">
          <DialogHeader>
            <DialogTitle>{labels.cropTitle}</DialogTitle>
          </DialogHeader>
          {cropSrc ? (
            <AvatarCropViewport
              imageSrc={cropSrc}
              imageSize={imageSize}
              pan={pan}
              zoom={zoom}
              onPanChange={setPan}
              onImageLoad={setImageSize}
            />
          ) : null}
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-primary"
            aria-label="Zoom"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={cropping}
              onClick={closeCrop}
            >
              {labels.cropCancel}
            </Button>
            <Button
              type="button"
              disabled={cropping || !pixelCrop}
              onClick={() => void confirmCrop()}
            >
              {cropping ? labels.uploadingLabel : labels.cropConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
