/**
 * @Description  : 计算站点时间
 */
interface SiteTimes {
  timeSum: number;
  siteTime: number[];
}
import * as Cesium from "cesium";
// 计算两点的距离
const spaceDistance = (a: Cesium.Cartesian3, b: Cesium.Cartesian3): number => {
  return parseFloat(Cesium.Cartesian3.distance(a, b).toFixed(2));
};
const getSiteTimes = (pArr: Cesium.Cartesian3[], speed: number): SiteTimes => {
  let timeSum = 0;//计算总时间
  let times: number[] = [];//计算每个路径之间的时间
  for (let i = 0; i < pArr.length; i++) {
    if (i == 0) {
      times.push(0);
      continue;
    }
    // 计算时间总数
    timeSum += spaceDistance(pArr[i - 1], pArr[i]) / speed;
    // 每个轨迹点所对应的系统时间
    times.push(timeSum);

  }
  return { timeSum: timeSum, siteTime: times };
};


const getSampleData = (pArr:Cesium.Cartesian3[], start:Cesium.JulianDate, siteTime:number[]):Cesium.SampledPositionProperty => {
  const property = new Cesium.SampledPositionProperty();
  for (let i = 0; i < pArr.length; i++) {
    //每一个轨迹点所对应的系统时间
    const time = Cesium.JulianDate.addSeconds(
      start,
      siteTime[i],
      new Cesium.JulianDate()
    );
    property.addSample(time, pArr[i]);
  }
  return property;
};

export { getSiteTimes, getSampleData };
