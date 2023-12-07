<script setup lang="ts">
import { initMap } from "@/utils/mapUtils";
import { tilesLoaded } from "@/utils/mapUtils";
import {useWebGlOverlayView} from "@/composables/useWebGlOverlayView";
import {useThreeScene} from "@/composables/useThreeScene";
import {useThreeRaycaster} from "@/composables/useThreeRaycaster";
import {useThreeTransformControls} from "@/composables/useThreeTransformControls";
import {onMounted} from "vue";

const { initScene } = useThreeScene()
const { initWebGLOverlay, requestRedraw, getMap} = useWebGlOverlayView()
const { getCurrentIntersections } = useThreeRaycaster()
const { addTransformControls } = useThreeTransformControls()
const map = await initMap("map-mount");
await tilesLoaded(map);

const anchor = { lat: 52, lng: 11, altitude: 0 };

const noModels = new Map()
await initScene(noModels);
await initWebGLOverlay(map, anchor);
requestRedraw();

function edit3DObject() {
  google.maps.event.addListener(getMap()!, 'mousedown', getIntersectedObjects);

  function getIntersectedObjects() {
    const intersects = getCurrentIntersections();

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if ((obj && obj.type === 'Group') || obj.type === 'Mesh') {
        addTransformControls(obj);
      }
    }
  }
}

function zoomOut() {
  map.setZoom(map.getZoom()! - 1)
  console.log('new zoomLvl: ', map.getZoom())
}

onMounted(() => {
  edit3DObject()
});
</script>

<template>
    <div class="zoom-button" @click="zoomOut">zoom out</div>
</template>

<style>
.zoom-button {
  background-color: red;
  width: 100px;
  height: 50px;
  text-align: center;
  cursor: pointer;
  position: absolute;
  z-index: 1000;
}
</style>
