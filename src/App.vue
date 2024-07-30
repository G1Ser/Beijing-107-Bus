<template>
  <div id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import * as Cesium from "cesium";
import { loadImagery } from "./hook/loadImagery";
import modifyMap from "./hook/filterColor";
import rawData from "./data/trans107_data.json";
const transData = rawData.segments[1];
// console.log(transData)
//全程长度
console.log(`全程总长${transData.distance}km`);
//车辆信息
console.log([transData.transit.lines]);
//公交路径
// console.log(transData.transit.path)
//起始点
// console.log(
//   `站点:${transData.transit.on_station.name},坐标:${transData.transit.on_station.location}`
// );
// //终点
// console.log(
//   `终点:${transData.transit.off_station.name},坐标:${transData.transit.off_station.location}`
// );
// //途径点
// const viaStops = () => {
//   transData.transit.via_stops.forEach((item) => {
//     console.log(`途径点:${item.name},坐标:${item.location}`);
//   });
// };
// viaStops();
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmODI2YzViMy0xY2UzLTQxZTEtOGU1Yi02NmQ2ZjI4MGY1OGMiLCJpZCI6MjMxMzEwLCJpYXQiOjE3MjIyMzI5MjB9.RgEchKNzmKu37UpediQwf4dpKLagFrnLPg0o1lngHqw";
// 高德地图api,其他地图存在位置偏移
const layer = loadImagery.gaode;
let viewer;
onMounted(() => {
  viewer = new Cesium.Viewer("cesiumContainer", {
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
  initData();
});
//此处还应有个英文名称
interface Stop {
  id:string;
  name: string;
  name_en:string;
  location: [number, number];
}
const stops: Stop[] = [];
const stopsData = (transData: any): Stop[] => {
  stops.push({
    id:transData.transit.on_station.id,
    name: transData.transit.on_station.name,
    name_en:transData.transit.on_station.name_en,
    location: [
      Number(transData.transit.on_station.location[0]),
      Number(transData.transit.on_station.location[1]),
    ],
  });
  transData.transit.via_stops.forEach((item) => {
    stops.push({
      id:item.id,
      name: item.name,
      name_en:item.name_en,
      location: [Number(item.location[0]), Number(item.location[1])],
    });
  });
  stops.push({
    id:transData.transit.off_station.id,
    name: transData.transit.off_station.name,
    name_en:transData.transit.off_station.name_en,
    location: [
      Number(transData.transit.off_station.location[0]),
      Number(transData.transit.off_station.location[1]),
    ],
  });
  return stops
};
const initData = () => {
  let positions = [];
  const path = transData.transit.path;
  path.forEach((item) => {
    positions.push(
      Cesium.Cartesian3.fromDegrees(Number(item[0]), Number(item[1]))
    );
  });
  const line = viewer.entities.add({
    polyline: {
      positions,
      width: 8,
      clampToGround: true,
      material: new Cesium.PolylineOutlineMaterialProperty({
        color: Cesium.Color.WHITE.withAlpha(0.8),
        outlineWidth: 2,
        outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
      }),
    },
  });
  stopsData(transData)
  stops.forEach(item => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(...item.location),
      model: {
        uri: '/src/assets/model/model.gltf',
        scale: 0.1
      }
    })
    viewer.entities.add({
      id:item.id,
      position: Cesium.Cartesian3.fromDegrees(...item.location,35),
      label:{
        text:item.name,
        font:"15px Helvetica",
        style:Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor:Cesium.Color.WHITE,
        backgroundColor:Cesium.Color.BLACK.withAlpha(0.5),
        showBackground:true,
      }
    })
  })
  viewer.flyTo(line, {
    duration: 3,
  });
};
</script>

<style lang="scss" scoped>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>