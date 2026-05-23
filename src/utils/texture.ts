import { apiClient } from "@/api/client";

type MaterialVisualOverride = {
  displayNameOverride?: string | null;
  iconPath?: string | null;
};

export type VisualPolicy = {
  globalCustomIconEnabled?: boolean;
  globalCustomNameEnabled?: boolean;
  officialProductCustomIconEnabled?: boolean;
  officialProductCustomNameEnabled?: boolean;
  officialProductUploadImageEnabled?: boolean;
  marketListingCustomIconEnabled?: boolean;
  marketListingCustomNameEnabled?: boolean;
  marketListingUploadImageEnabled?: boolean;
  iconPolicyMode?: "SOFT" | "HARD";
  namePolicyMode?: "SOFT" | "HARD";
};

let materialVisualOverrides: Record<string, MaterialVisualOverride> = {};
let materialVisualOverridesLoaded = false;
let materialVisualOverridesPromise: Promise<void> | null = null;
let visualPolicy: VisualPolicy = {};

export function setVisualPolicy(policyData: unknown): void {
  if (policyData && typeof policyData === "object") {
    visualPolicy = { ...policyData } as VisualPolicy;
  }
}

export function getVisualPolicy(): VisualPolicy {
  return visualPolicy;
}

export const MATERIAL_TEXTURE_OVERRIDES: Record<string, string[]> = {
  MOSS_CARPET: ["moss_carpet"],
  GRASS: ["short_grass", "grass"],
  TALL_GRASS: ["tall_grass"],
};

export const DEFAULT_TEXTURE_FALLBACK_MATERIAL = "BUNDLE";

export const REMOTE_TEXTURE_BASES = [
  "https://mcasset.cloud/1.21/assets/minecraft/textures",
  "https://mcasset.cloud/1.20.6/assets/minecraft/textures",
];

export function getTextureBaseUrl(): string {
  const apiBase = apiClient.defaults.baseURL || "";
  if (apiBase.endsWith("/api")) {
    return apiBase.slice(0, -4) + "/textures";
  }
  return "/textures";
}

export function resolveAssetUrl(path: string | null | undefined): string {
  const text = String(path || "").trim();
  if (!text) {
    return "";
  }
  if (
    /^[a-z]+:\/\//i.test(text) ||
    text.startsWith("//") ||
    text.startsWith("data:")
  ) {
    return text;
  }

  const apiBase = apiClient.defaults.baseURL || "";
  const host = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : "";
  return text.startsWith("/") ? `${host}${text}` : `${host}/${text}`;
}

export function normalizeMaterialKey(text: unknown): string {
  return String(text || "")
    .toUpperCase()
    .replace(/^MINECRAFT:/, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function aliasMaterialKey(text: unknown): string {
  const key = normalizeMaterialKey(text);
  if (!key) {
    return "";
  }
  if (key.startsWith("BLOCK_OF_") && key.length > "BLOCK_OF_".length) {
    return `${key.slice("BLOCK_OF_".length)}_BLOCK`;
  }
  return key;
}

export function setMaterialVisualOverrides(rows: unknown): void {
  const source = rows as { overrides?: unknown[]; materials?: unknown[] };
  const list = Array.isArray(rows)
    ? rows
    : Array.isArray(source?.overrides)
      ? source.overrides
      : Array.isArray(source?.materials)
        ? source.materials
        : [];
  const map: Record<string, MaterialVisualOverride> = {};

  for (const raw of list) {
    const item = raw as Record<string, unknown>;
    const key = normalizeMaterialKey(
      item.materialKey ?? item.material ?? item.key
    );
    if (!key) {
      continue;
    }
    map[key] = {
      displayNameOverride: String(item.displayNameOverride ?? "").trim() || null,
      iconPath:
        String(item.iconPath ?? item.iconUrl ?? item.displayIconPath ?? "").trim() ||
        null,
    };
  }

  materialVisualOverrides = map;
  materialVisualOverridesLoaded = true;
}

export async function ensureMaterialVisualOverrides(): Promise<void> {
  if (materialVisualOverridesLoaded) {
    return;
  }
  if (materialVisualOverridesPromise) {
    return materialVisualOverridesPromise;
  }

  materialVisualOverridesPromise = apiClient
    .get("/meta/material-overrides")
    .then((res) => {
      setMaterialVisualOverrides(res.data?.overrides || res.data?.materials || res.data || []);
      setVisualPolicy(res.data?.policy || {});
    })
    .catch(() => {
      materialVisualOverridesLoaded = true;
    })
    .finally(() => {
      materialVisualOverridesPromise = null;
    });

  return materialVisualOverridesPromise;
}

export function getMaterialVisualOverride(
  material: string | null | undefined
): MaterialVisualOverride | null {
  const key = normalizeMaterialKey(material);
  const aliasKey = aliasMaterialKey(key);
  return materialVisualOverrides[key] || materialVisualOverrides[aliasKey] || null;
}

export function buildTextureAliases(material: string | null | undefined): string[] {
  const key = normalizeMaterialKey(material);
  const aliasKey = aliasMaterialKey(key);
  const aliases = new Set<string>();
  if (!key) {
    return [];
  }

  aliases.add(key.toLowerCase());
  if (aliasKey) {
    aliases.add(aliasKey.toLowerCase());
  }
  if (key.startsWith("LEGACY_")) {
    aliases.add(key.slice("LEGACY_".length).toLowerCase());
  }

  const override = MATERIAL_TEXTURE_OVERRIDES[key];
  if (Array.isArray(override)) {
    for (const value of override) {
      aliases.add(String(value).toLowerCase());
    }
  }

  return Array.from(aliases);
}

export function getTextureCandidates(
  material: string | null | undefined,
  customIconUrl?: string | null
): string[] {
  const candidates: string[] = [];
  const visual = getMaterialVisualOverride(material);
  const overrideIconUrl = resolveAssetUrl(customIconUrl || visual?.iconPath || "");

  if (overrideIconUrl) {
    candidates.push(overrideIconUrl);
  }

  const names = buildTextureAliases(material);
  if (names.length === 0) {
    return [...candidates, ...getFallbackTextureCandidates()];
  }

  const textureBase = getTextureBaseUrl();

  for (const textureName of names) {
    candidates.push(`${textureBase}/item/${textureName}.png`);
  }
  for (const textureName of names) {
    candidates.push(`${textureBase}/block/${textureName}.png`);
  }

  for (const base of REMOTE_TEXTURE_BASES) {
    for (const textureName of names) {
      candidates.push(`${base}/item/${textureName}.png`);
      candidates.push(`${base}/block/${textureName}.png`);
    }
  }

  const fallbackCandidates = getFallbackTextureCandidates();
  fallbackCandidates.forEach((candidate) => {
    if (!candidates.includes(candidate)) {
      candidates.push(candidate);
    }
  });

  return candidates;
}

export function getFallbackTextureCandidates(): string[] {
  const names = buildTextureAliases(DEFAULT_TEXTURE_FALLBACK_MATERIAL);
  const candidates: string[] = [];
  const textureBase = getTextureBaseUrl();

  for (const textureName of names) {
    candidates.push(`${textureBase}/item/${textureName}.png`);
    candidates.push(`${textureBase}/block/${textureName}.png`);
  }
  for (const base of REMOTE_TEXTURE_BASES) {
    for (const textureName of names) {
      candidates.push(`${base}/item/${textureName}.png`);
      candidates.push(`${base}/block/${textureName}.png`);
    }
  }
  return candidates;
}
