import type { ProjectMediaAsset } from "@shared/schema";

type MediaLike = Partial<ProjectMediaAsset> & {
  label?: string | null;
  alt?: string | null;
  galleryImages?: string[] | null;
};

type MediaSource = {
  mediaAssets?: ProjectMediaAsset[] | null;
  modalMediaAssets?: ProjectMediaAsset[] | null;
  modalMediaUrls?: string[] | null;
  modalMediaType?: string | null;
  galleryImages?: string[] | null;
  clientName?: string | null;
  projectTitle?: string | null;
};

const LEGACY_ID_PREFIX = "legacy_media";

function sanitizeAsset(
  asset: MediaLike,
  index: number,
  fallbackType: ProjectMediaAsset["type"],
  fallbackAltBase: string,
): ProjectMediaAsset | null {
  const rawUrl =
    typeof asset?.url === "string"
      ? asset.url.trim()
      : typeof (asset as any)?.src === "string"
      ? (asset as any).src.trim()
      : undefined;

  if (!rawUrl) {
    return null;
  }

  const rawType = typeof asset?.type === "string" ? asset.type.toLowerCase() : "";
  const type: ProjectMediaAsset["type"] =
    rawType === "video" || rawType === "image" ? (rawType as ProjectMediaAsset["type"]) : fallbackType;

  const fallbackAlt = `${fallbackAltBase} media ${index + 1}`;

  const altText =
    typeof asset?.altText === "string" && asset.altText.trim()
      ? asset.altText.trim()
      : typeof asset?.alt === "string" && asset.alt.trim()
      ? asset.alt.trim()
      : fallbackAlt;

  const caption =
    typeof asset?.caption === "string" && asset.caption.trim()
      ? asset.caption.trim()
      : typeof asset?.label === "string" && asset.label.trim()
      ? asset.label.trim()
      : undefined;

  const baseId =
    typeof asset?.id === "string" && asset.id.trim()
      ? asset.id.trim()
      : `${LEGACY_ID_PREFIX}_${index}_${encodeURIComponent(rawUrl)}`;

  return {
    id: baseId,
    type,
    url: rawUrl,
    altText,
    caption,
  };
}

export function buildProjectMediaAssets(source?: MediaSource | null): ProjectMediaAsset[] {
  if (!source) {
    return [];
  }

  const fallbackAltBase = source.clientName || source.projectTitle || "Project";

  const candidates =
    source.mediaAssets?.length
      ? source.mediaAssets
      : source.modalMediaAssets?.length
      ? source.modalMediaAssets
      : null;

  if (candidates && candidates.length > 0) {
    return candidates
      .map((asset, index) =>
        sanitizeAsset(asset, index, asset?.type === "video" ? "video" : "image", fallbackAltBase),
      )
      .filter((asset): asset is ProjectMediaAsset => Boolean(asset));
  }

  const legacyUrls =
    (Array.isArray(source.modalMediaUrls) && source.modalMediaUrls.length > 0
      ? source.modalMediaUrls
      : Array.isArray(source.galleryImages)
      ? source.galleryImages
      : []) ?? [];

  const fallbackType: ProjectMediaAsset["type"] =
    source.modalMediaType === "carousel" ? "image" : "video";

  return legacyUrls
    .map((url, index) =>
      sanitizeAsset({ url }, index, fallbackType, fallbackAltBase),
    )
    .filter((asset): asset is ProjectMediaAsset => Boolean(asset));
}







