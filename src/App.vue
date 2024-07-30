<template>
  <div id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import * as Cesium from "cesium";
import { loadImagery } from "./hook/loadImagery";
import modifyMap from "./hook/filterColor";
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmODI2YzViMy0xY2UzLTQxZTEtOGU1Yi02NmQ2ZjI4MGY1OGMiLCJpZCI6MjMxMzEwLCJpYXQiOjE3MjIyMzI5MjB9.RgEchKNzmKu37UpediQwf4dpKLagFrnLPg0o1lngHqw";
// 高德地图api
const layer = loadImagery.cartoVoyager;
onMounted(() => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false, //实体详细信息
    animation: false, //动画
    timeline: false, //时间轴
    fullscreenButton: false, //全屏
    geocoder: false, //搜索
    homeButton: false, //主页
    sceneModePicker: false, //投影选择
    baseLayerPicker: false, //图层选择
    navigationHelpButton: false, //帮助
    imageryProvider: layer,
    // terrainProvider:Cesium.createWorldTerrain({
    //   requestWaterMask:true //水面特效
    // }), //高程数据
  });
  modifyMap(viewer, {
    invertColor: true,
    filterRGB: [70, 110, 120],
  });
});
</script>

<style lang="scss" scoped>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>