import {
  DEFAULT_TEXTURE_FALLBACK_MATERIAL,
  normalizeMaterialKey,
  aliasMaterialKey,
  getMaterialVisualOverride,
  getVisualPolicy
} from "@/utils/texture";
import i18n from "@/plugins/i18n";

const PRODUCT_TYPE_TEXTURE_MAP: Record<string, string> = {
  COMMAND: "COMMAND_BLOCK",
  GIVE_CUSTOM: "CHEST",
  GIVE_CUSTOM_ITEM: "CHEST",
  POTION_EFFECT: "SPLASH_POTION",
  RECYCLE_COMMAND: "HOPPER",
  RECYCLE_COMMAND_ITEM: "HOPPER",
  RECYCLE_CUSTOM: "HOPPER",
  RECYCLE_CUSTOM_ITEM: "HOPPER",
  GROUP_BUY_VOUCHER: "PAPER",
};

function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) {
      return text;
    }
  }
  return "";
}

export function resolveProductIconMaterial(product: Record<string, unknown> | null | undefined): string {
  if (!product) {
    return DEFAULT_TEXTURE_FALLBACK_MATERIAL;
  }

  const explicitMaterial = firstNonEmpty(
    product.displayMaterial,
    product.material,
    product.itemMaterial,
    product.materialKey
  );
  if (explicitMaterial) {
    return normalizeMaterialKey(explicitMaterial);
  }

  const productType = normalizeMaterialKey(product.productType ?? product.type);
  return PRODUCT_TYPE_TEXTURE_MAP[productType] || DEFAULT_TEXTURE_FALLBACK_MATERIAL;
}

export function resolveListingIconMaterial(listing: Record<string, unknown> | null | undefined): string {
  if (!listing) {
    return DEFAULT_TEXTURE_FALLBACK_MATERIAL;
  }

  return normalizeMaterialKey(
    firstNonEmpty(
      listing.displayMaterial,
      listing.material,
      listing.itemMaterial,
      listing.materialKey
    )
  ) || DEFAULT_TEXTURE_FALLBACK_MATERIAL;
}

export function resolveOrderIconMaterial(order: Record<string, unknown> | null | undefined): string {
  if (!order) {
    return DEFAULT_TEXTURE_FALLBACK_MATERIAL;
  }

  return normalizeMaterialKey(
    firstNonEmpty(
      order.displayMaterial,
      order.productDisplayMaterial,
      order.material,
      order.itemMaterial,
      order.productMaterial,
      order.sku
    )
  ) || DEFAULT_TEXTURE_FALLBACK_MATERIAL;
}

export function resolveDisplayIconUrl(item: Record<string, unknown> | null | undefined): string {
  if (!item) {
    return "";
  }

  return firstNonEmpty(
    item.displayIconPath,
    item.iconUrl,
    item.iconPath,
    item.icon,
    item.productIcon,
    item.productIconUrl,
    item.productDisplayIconPath
  );
}

export function resolveRawMaterialLabel(item: Record<string, unknown> | null | undefined): string {
  if (!item) {
    return "";
  }
  return firstNonEmpty(item.itemMaterial, item.material, item.displayMaterial, item.materialKey);
}

// ==========================================
// API DYNAMIC TRANSLATION & OVERRIDES RESOLVERS
// ==========================================

export function getLocalizedMaterialName(material: string, options: { includeGlobalOverride?: boolean } = {}): string {
  const key = normalizeMaterialKey(material);
  const aliasKey = aliasMaterialKey(key);
  if (!key) {
    return "未知物品";
  }
  const policy = getVisualPolicy();
  const includeGlobalOverride = options.includeGlobalOverride !== false && policy.globalCustomNameEnabled !== false;
  const visual = includeGlobalOverride ? getMaterialVisualOverride(key) : null;
  if (visual && visual.displayNameOverride) {
    return String(visual.displayNameOverride);
  }

  const tKey = `materials.${key}`;
  const tAliasKey = `materials.${aliasKey}`;
  // Look up in loaded i18n materials dictionary
  if (i18n.global.te(tKey)) {
    return i18n.global.t(tKey);
  }
  if (aliasKey && i18n.global.te(tAliasKey)) {
    return i18n.global.t(tAliasKey);
  }

  // Fallback to key formatting
  const humanized = key.toLowerCase().replace(/_/g, " ");
  return humanized.charAt(0).toUpperCase() + humanized.slice(1);
}

export type DisplayVisualResult = {
  material: string;
  title: string;
  forceIconPath: string;
  includeMaterialOverride: boolean;
};

export function resolveDisplayVisual(
  baseMaterial: string | null | undefined,
  displayNameOverride: string | null | undefined,
  displayMaterial: string | null | undefined,
  displayIconPath: string | null | undefined,
  fallbackName: string = "",
  options: { category: "official" | "market" }
): DisplayVisualResult {
  const policy = getVisualPolicy();
  const category = options.category;
  const categoryIconEnabled = category === "official"
    ? policy.officialProductCustomIconEnabled !== false
    : policy.marketListingCustomIconEnabled !== false;
  const categoryNameEnabled = category === "official"
    ? policy.officialProductCustomNameEnabled !== false
    : policy.marketListingCustomNameEnabled !== false;

  const baseKey = normalizeMaterialKey(baseMaterial) || DEFAULT_TEXTURE_FALLBACK_MATERIAL;
  const globalVisual = getMaterialVisualOverride(baseKey);
  const customName = String(displayNameOverride || "").trim();
  const customMaterial = normalizeMaterialKey(displayMaterial);
  const customIconPath = String(displayIconPath || "").trim();
  const fallback = String(fallbackName || "").trim();
  const resolvedMaterial = customMaterial || baseKey || DEFAULT_TEXTURE_FALLBACK_MATERIAL;

  let forceIconPath = "";
  if (policy.globalCustomIconEnabled && policy.iconPolicyMode === "HARD" && globalVisual?.iconPath) {
    forceIconPath = String(globalVisual.iconPath);
  } else if (categoryIconEnabled && customIconPath) {
    forceIconPath = customIconPath;
  } else if (!customMaterial && policy.globalCustomIconEnabled && policy.iconPolicyMode === "SOFT" && globalVisual?.iconPath) {
    forceIconPath = String(globalVisual.iconPath);
  }

  let resolvedName = "";
  if (policy.globalCustomNameEnabled && policy.namePolicyMode === "HARD" && globalVisual?.displayNameOverride) {
    resolvedName = String(globalVisual.displayNameOverride);
  } else if (categoryNameEnabled && customName) {
    const normCustom = normalizeMaterialKey(customName);
    const customAlias = aliasMaterialKey(normCustom);
    const customHasI18n = normCustom && (
      i18n.global.te(`materials.${normCustom}`) || 
      (customAlias && i18n.global.te(`materials.${customAlias}`))
    );
    if (customHasI18n) {
      resolvedName = getLocalizedMaterialName(normCustom, { includeGlobalOverride: true });
    } else {
      resolvedName = customName;
    }
  } else if (fallback) {
    const normFallback = normalizeMaterialKey(fallback);
    const fallbackAlias = aliasMaterialKey(normFallback);
    const fallbackHasI18n = normFallback && (
      i18n.global.te(`materials.${normFallback}`) || 
      (fallbackAlias && i18n.global.te(`materials.${fallbackAlias}`))
    );
    if (fallbackHasI18n) {
      resolvedName = getLocalizedMaterialName(normFallback, { includeGlobalOverride: true });
    } else {
      resolvedName = fallback;
    }
  } else if (!customMaterial && policy.globalCustomNameEnabled && policy.namePolicyMode === "SOFT" && globalVisual?.displayNameOverride) {
    resolvedName = String(globalVisual.displayNameOverride);
  } else {
    resolvedName = getLocalizedMaterialName(resolvedMaterial, { includeGlobalOverride: false });
  }

  return {
    material: resolvedMaterial,
    title: resolvedName || getLocalizedMaterialName(resolvedMaterial, { includeGlobalOverride: false }),
    forceIconPath,
    includeMaterialOverride: policy.globalCustomIconEnabled !== false,
  };
}

export function resolveListingDisplayVisual(listing: any, metaDisplayName = ""): DisplayVisualResult {
  return resolveDisplayVisual(
    listing?.itemMaterial ?? listing?.material ?? listing?.materialKey,
    listing?.displayNameOverride,
    listing?.displayMaterial,
    listing?.displayIconPath ?? listing?.iconUrl ?? listing?.iconPath,
    metaDisplayName,
    { category: "market" }
  );
}

export function resolveProductDisplayVisual(product: any): DisplayVisualResult {
  const baseMaterial = resolveProductIconMaterial(product);
  return resolveDisplayVisual(
    baseMaterial,
    product?.displayNameOverride,
    product?.displayMaterial,
    product?.displayIconPath ?? product?.iconUrl ?? product?.iconPath ?? product?.imageUrl,
    product?.title || product?.name || "",
    { category: "official" }
  );
}

export function resolveOrderDisplayVisual(order: any): DisplayVisualResult {
  return resolveDisplayVisual(
    order?.itemMaterial ?? order?.material ?? order?.productMaterial ?? order?.sku,
    order?.displayNameOverride ?? order?.productTitle ?? order?.productName,
    order?.displayMaterial,
    order?.displayIconPath ?? order?.iconUrl ?? order?.iconPath,
    order?.productTitle || order?.productName || "",
    { category: "official" }
  );
}
