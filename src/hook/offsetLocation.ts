/*
 * @Description: 偏移地理坐标
 */
import * as Cesium from 'cesium'
export const offsetCoordinates = (location: [number, number], distance: number): [number, number] => {
    const position = Cesium.Cartesian3.fromDegrees(...location);

    // 偏移量向量
    const offsetX = Cesium.Cartesian3.multiplyByScalar(
        Cesium.Cartesian3.UNIT_X,
        distance,
        new Cesium.Cartesian3()
    );
    const offsetY = Cesium.Cartesian3.multiplyByScalar(
        Cesium.Cartesian3.UNIT_Y,
        distance,
        new Cesium.Cartesian3()
    );
    const offset = Cesium.Cartesian3.add(offsetX, offsetY, new Cesium.Cartesian3());
    // 计算新的位置
    const offsetPosition = Cesium.Cartesian3.add(position, offset, new Cesium.Cartesian3());

    // 将新的笛卡尔坐标转换为地理坐标
    const newCartographicPosition = Cesium.Cartographic.fromCartesian(offsetPosition);

    // 返回新的经纬度
    return [
        Cesium.Math.toDegrees(newCartographicPosition.longitude),
        Cesium.Math.toDegrees(newCartographicPosition.latitude)
    ];
}