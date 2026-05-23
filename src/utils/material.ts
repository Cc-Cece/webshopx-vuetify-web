/**
 * Minecraft Material MDI fallback icon mapper
 */
export function getMaterialIcon(material: string | null | undefined): string {
  if (!material) return "mdi-package-variant-closed";
  const mat = material.toLowerCase().replace("minecraft:", "");

  if (mat.includes("sword")) return "mdi-sword";
  if (mat.includes("pickaxe")) return "mdi-pickaxe";
  if (mat.includes("axe") && !mat.includes("pickaxe")) return "mdi-axe";
  if (mat.includes("shovel")) return "mdi-shovel";
  if (mat.includes("hoe")) return "mdi-hoe";
  if (mat.includes("helmet")) return "mdi-shield-half-full";
  if (mat.includes("chestplate")) return "mdi-shield-outline";
  if (mat.includes("leggings")) return "mdi-shield-outline";
  if (mat.includes("boots")) return "mdi-shoe-formal";
  if (
    mat.includes("diamond") ||
    mat.includes("emerald") ||
    mat.includes("gem")
  )
    return "mdi-gemstone-value";
  if (
    mat.includes("gold") ||
    mat.includes("iron") ||
    mat.includes("netherite") ||
    mat.includes("ingot")
  )
    return "mdi-crystal-ball";
  if (mat.includes("coal") || mat.includes("charcoal") || mat.includes("fire"))
    return "mdi-fire";
  if (mat.includes("book")) return "mdi-book-open-page-variant";
  if (mat.includes("potion")) return "mdi-bottle-tonic-plus";
  if (mat.includes("totem")) return "mdi-shield-cross";
  if (mat.includes("elytra")) return "mdi-wings";
  if (mat.includes("beacon")) return "mdi-lighthouse";
  if (mat.includes("apple")) return "mdi-food-apple";
  if (mat.includes("bread")) return "mdi-bread-slice";
  if (
    mat.includes("shulker") ||
    mat.includes("box") ||
    mat.includes("chest")
  )
    return "mdi-package-variant";
  if (mat.includes("spawner") || mat.includes("grid")) return "mdi-grid";
  if (mat.includes("command") || mat.includes("console"))
    return "mdi-console-line";
  if (
    mat.includes("voucher") ||
    mat.includes("coupon") ||
    mat.includes("ticket")
  )
    return "mdi-ticket-percent";

  return "mdi-package-variant-closed";
}
