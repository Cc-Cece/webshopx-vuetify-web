<template>
  <div
    :style="containerStyle"
    class="d-inline-flex align-center justify-center position-relative mc-icon-container"
  >
    <v-img
      v-if="currentSrc"
      :src="currentSrc"
      :width="size"
      :height="size"
      :alt="material || 'Minecraft Icon'"
      class="mc-pixel-image"
      @error="handleError"
    >
      <template #placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="16"
            width="1.5"
          ></v-progress-circular>
        </v-row>
      </template>
    </v-img>

    <v-icon v-else :size="size" :color="color || 'primary'">
      {{ fallbackIcon }}
    </v-icon>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ensureMaterialVisualOverrides, getTextureCandidates } from "@/utils/texture";
import { getMaterialIcon } from "@/utils/material";

interface Props {
  material?: string | null;
  iconUrl?: string | null;
  size?: number | string;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  material: "",
  iconUrl: "",
  size: 36,
  color: "primary",
});

const currentSrc = ref<string>("");
let candidateUrls: string[] = [];
let currentIndex = 0;

// Resolve fallback icon name
const fallbackIcon = computed(() => {
  return getMaterialIcon(props.material);
});

// Container style
const containerStyle = computed(() => {
  const s = typeof props.size === "number" ? `${props.size}px` : props.size;
  return {
    width: s,
    height: s,
  };
});

// Load texture candidates and set current source
const initTextureLoader = () => {
  candidateUrls = getTextureCandidates(props.material, props.iconUrl);
  currentIndex = 0;
  if (candidateUrls.length > 0) {
    currentSrc.value = candidateUrls[0];
  } else {
    currentSrc.value = "";
  }
};

const initTextureLoaderWithOverrides = async () => {
  initTextureLoader();
  await ensureMaterialVisualOverrides();
  initTextureLoader();
};

// Handle load error by trying next candidate
const handleError = () => {
  currentIndex++;
  if (currentIndex < candidateUrls.length) {
    currentSrc.value = candidateUrls[currentIndex];
  } else {
    currentSrc.value = "";
  }
};

// Watch for prop updates to reload
watch(() => [props.material, props.iconUrl], initTextureLoaderWithOverrides, { deep: true });

onMounted(() => {
  initTextureLoaderWithOverrides();
});
</script>

<style scoped>
.mc-icon-container {
  overflow: visible;
  user-select: none;
}

.mc-pixel-image :deep(img) {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  object-fit: contain;
}
</style>
