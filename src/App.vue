<template>
  <div id="cesiumContainer"></div>
  <div class="panel" v-if="stops.length > 0">
    <div class="fromTo">
      <div>{{ stops[0].name }}</div>
      <img src="/src/assets/img/jt.png" alt="" />
      <div>{{ stops[stops.length - 1].name }}</div>
    </div>
    <div class="stopsInfo">
      <div class="stopStation" v-for="(stop, index) in stops" :key="stop.id" @click="selectStop(index)"
        :class="{ highlighted: selectedStop === index }">
        <!-- <img ref="img" class="img" src="/src/assets/img/icon.png" alt="" /> -->
        <span class="num">{{ index + 1 }}</span>{{ stop.name }}
      </div>
    </div>
    <div class="control">
      <div v-if="!play" id="playPauseBtn">
        <el-icon title="发车" @click="toPlay">
          <VideoPlay />
        </el-icon>
      </div>
      <div v-else id="playPauseBtn">
        <el-icon title="停车" @click="toPause">
          <VideoPause />
        </el-icon>
      </div>
      <div id="downBtn">
        <el-icon title="减速" @click="speedDown">
          <DArrowLeft />
        </el-icon>
      </div>
      <div id="upBtn">
        <el-icon title="加速" @click="speedUp">
          <DArrowRight />
        </el-icon>
      </div>
      <div>
        <el-icon title="重新发车" @click="toRefresh">
          <Refresh />
        </el-icon>
      </div>
      <div>{{ speed }}m/s</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";
import { loadImagery } from "./hook/loadImagery";
import modifyMap from "./hook/filterColor";
import rawData from "./data/trans107_data.json";
import { getSiteTimes, getSampleData } from "./hook/trajectory";
const transData = rawData.segments[1];
//车辆信息
console.log([transData.transit.lines]);
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmODI2YzViMy0xY2UzLTQxZTEtOGU1Yi02NmQ2ZjI4MGY1OGMiLCJpZCI6MjMxMzEwLCJpYXQiOjE3MjIyMzI5MjB9.RgEchKNzmKu37UpediQwf4dpKLagFrnLPg0o1lngHqw";
// 高德地图api,其他地图存在位置偏移
const layer = loadImagery.gaode;
let viewer: Cesium.Viewer;
let entities: Cesium.Entity;
let selectedStop = ref<number>();
const stops = ref<Stop[]>([]);
const positions = ref<Cesium.Cartesian3[]>([]);
interface Stop {
  id: string;
  name: string;
  name_en: string;
  location: [number, number];
}
const stopsData = (transData: any): Stop[] => {
  const stopsList: Stop[] = [];
  stopsList.push({
    id: transData.transit.on_station.id,
    name: transData.transit.on_station.name,
    name_en: transData.transit.on_station.name_en,
    location: [
      Number(transData.transit.on_station.location[0]),
      Number(transData.transit.on_station.location[1]),
    ],
  });
  transData.transit.via_stops.forEach((item) => {
    stopsList.push({
      id: item.id,
      name: item.name,
      name_en: item.name_en,
      location: [Number(item.location[0]), Number(item.location[1])],
    });
  });
  stopsList.push({
    id: transData.transit.off_station.id,
    name: transData.transit.off_station.name,
    name_en: transData.transit.off_station.name_en,
    location: [
      Number(transData.transit.off_station.location[0]),
      Number(transData.transit.off_station.location[1]),
    ],
  });
  return stopsList;
};
const initData = () => {
  const path = transData.transit.path;
  path.forEach((item) => {
    positions.value.push(
      Cesium.Cartesian3.fromDegrees(Number(item[0]), Number(item[1]))
    );
  });
  const line = viewer.entities.add({
    polyline: {
      positions: positions.value,
      width: 8,
      clampToGround: true,
      material: new Cesium.PolylineOutlineMaterialProperty({
        color: Cesium.Color.WHITE.withAlpha(0.8),
        outlineWidth: 2,
        outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
      }),
    },
  });
  const stopsList = stopsData(transData);
  stops.value = stopsList;
  stopsList.forEach((item) => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(...item.location),
      model: {
        uri: "/src/assets/model/model.gltf",
        scale: 0.1,
      },
    });
    viewer.entities.add({
      id: item.id,
      position: Cesium.Cartesian3.fromDegrees(...item.location, 35),
      label: {
        text: item.name,
        font: "15px Helvetica",
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.WHITE,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
        showBackground: true,
      },
    });
  });
  viewer.flyTo(line, {
    duration: 3,
  });
};
const selectStop = (index: number) => {
  selectedStop.value = index;
};
const play = ref<boolean>(false);
const isBegin = ref<boolean>(true);
const toBegin = () => {
  const timeObj = getSiteTimes(positions.value, 15);
  const start = Cesium.JulianDate.fromDate(new Date());
  const stop = Cesium.JulianDate.addSeconds(
    start,
    timeObj.timeSum,
    new Cesium.JulianDate()
  );
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  const property = getSampleData(positions.value, start, timeObj.siteTime);
  entities = viewer.entities.add({
    id: "bus",
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: start,
        stop: stop,
      }),
    ]),
    model: {
      uri: "/src/assets/model/bus.gltf",
      minimumPixelSize: 64,
      scale: 2.5,
    },
    position: property,
    orientation: new Cesium.VelocityOrientationProperty(property),
  });
  viewer.clock.onTick.addEventListener(stopPause);
};
const toPlay = () => {
  play.value = true;
  if (isBegin.value) {
    toBegin();
    isBegin.value = false;
  }
  viewer.clock.shouldAnimate = true;
  //跟随视角
  // viewer.trackedEntity = entities;
};
const toPause = () => {
  play.value = false;
  viewer.clock.shouldAnimate = false;
};
const toRefresh = () => {
  const upBtn = document.getElementById(
    "upBtn"
  ) as HTMLDivElement;
  const downBtn = document.getElementById(
    "downBtn"
  ) as HTMLDivElement;
  const removeEntity = () =>
    viewer.entities.values.find((entity) => {
      if (entity.id === "bus") {
        viewer.entities.remove(entity);
      }
    });
  play.value = false;
  isBegin.value = true;
  stop_index = 1;
  speed.value = 15;
  viewer.clockViewModel.multiplier = 1;
  upBtn.classList.remove("disabled")
  downBtn.classList.remove("disabled")
  viewer.clock.onTick.removeEventListener(stopPause);
  removeEntity();
};
const speed = ref<number>(15);
const speedDown = () => {
  const upBtn = document.getElementById(
    "upBtn"
  ) as HTMLDivElement;
  const downBtn = document.getElementById(
    "downBtn"
  ) as HTMLDivElement;
  upBtn.classList.remove("disabled")
  speed.value = speed.value - 5;
  if(speed.value === 20){
    viewer.clockViewModel.multiplier /= 1.25;
  }
  if(speed.value === 15){
    viewer.clockViewModel.multiplier = 1;
  }
  if(speed.value === 10){
    viewer.clockViewModel.multiplier /= 1.5;
  }
  if (speed.value === 5) {
    viewer.clockViewModel.multiplier /= 2;
    downBtn.classList.add("disabled")
  }
};
const speedUp = () => {
  const upBtn = document.getElementById(
    "upBtn"
  ) as HTMLDivElement;
  const downBtn = document.getElementById(
    "downBtn"
  ) as HTMLDivElement;
  downBtn.classList.remove("disabled")
  speed.value = speed.value + 5;
  if (speed.value === 10) {
    viewer.clockViewModel.multiplier *= 2;
  }
  if (speed.value === 15) {
    viewer.clockViewModel.multiplier = 1;
  }
  if (speed.value === 20) {
    viewer.clockViewModel.multiplier *= 1.3;
  }
  if (speed.value === 25) {
    viewer.clockViewModel.multiplier *= 1.25;
    upBtn.classList.add("disabled")
  }
};
let stop_index = 1;
//到站点就停止
const stopPause = () => {
  const currentTime = viewer.clock.currentTime; //当前时间
  const stopTime = viewer.clock.stopTime; //结束时间
  let sPosition = entities.position.getValue(currentTime);
  if (stop_index < stops.value.length - 1) {
    let ePosition = Cesium.Cartesian3.fromDegrees(
      ...stops.value[stop_index].location
    );
    let distance = Cesium.Cartesian3.distance(sPosition, ePosition);
    const randomDelay = Math.floor(Math.random() * (3000 - 1500 + 1)) + 1500;
    if (distance < 15) {
      viewer.clock.shouldAnimate = false;
      const playPauseBtn = document.getElementById(
        "playPauseBtn"
      ) as HTMLDivElement;
      playPauseBtn.classList.add("disabled");
      setTimeout(() => {
        viewer.clock.shouldAnimate = true;
        playPauseBtn.classList.remove("disabled");
      }, randomDelay);
      stop_index++;
    }
  }
  if (Cesium.JulianDate.greaterThanOrEquals(currentTime, stopTime)) {
    //路线已经跑完了
    toRefresh();
    return;
  }
};
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
</script>

<style lang="scss" scoped>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 20px;
  top: 40px;
  z-index: 1000;
  width: 500px;

  .fromTo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(4, 12, 46, 0.812);
    border: 1px solid #4f7cb1;
    height: 60px;
    padding: 0 30px 0 30px;

    div {
      color: #fff;
      font-size: 20px;
      line-height: 30px;
    }

    img {
      width: 20%;
    }
  }

  .stopsInfo {
    background-color: #142e6a5e;
    text-align: center;
    padding: 0 20px 0 20px;

    .stopStation {
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      float: left;
      width: 25px;
      height: 125px;
      font-family: "Microsoft YaHei", 微软雅黑;
      line-height: 15px;
      text-shadow: 0 1px 2px #00ffff95;
      font-weight: 500;
      margin: 30px 5px 10px 5px;
    }

    .num {
      display: inline-block;
      width: 20px;
      font-family: arial;
      padding-bottom: 6px;
    }
  }

  .control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: rgba(4, 12, 46, 0.812);
    border: 1px solid #4f7cb1;
    height: 50px;
    padding: 0 20px 0 20px;

    div {
      width: 30px;
      color: #fff;
      cursor: pointer;
    }

    .disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  }
}
</style>