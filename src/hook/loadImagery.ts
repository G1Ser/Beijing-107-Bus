/*
 * @Description: 加载影像图层
 */
import * as Cesium from 'cesium'
//定义图层加载函数的返回类型
interface ImageryLoaders {
    hot: Cesium.UrlTemplateImageryProvider;
    cartoVoyager: Cesium.UrlTemplateImageryProvider;
    cartoDark: Cesium.UrlTemplateImageryProvider;
    gaode: Cesium.UrlTemplateImageryProvider;
}

export const loadImagery: ImageryLoaders = {
    //加载Humanitarian OpenStreetMap Team style地图
    hot: new Cesium.UrlTemplateImageryProvider({
        url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c'],
        minimumLevel: 4,
        maximumLevel: 18,
    }),
    //加载carto Basemaps 航海风格地图
    cartoVoyager: new Cesium.UrlTemplateImageryProvider({
        url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        minimumLevel: 4,
        maximumLevel: 18,
    }),
    //加载carto Basemaps 黑暗风格地图
    cartoDark: new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        minimumLevel: 4,
        maximumLevel: 18,
    }),
    //加载高德地图
    gaode: new Cesium.UrlTemplateImageryProvider({
        // url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
        url: '/api/appmaptile?style=9&x={x}&y={y}&z={z}&ltype=11',
        minimumLevel: 4,
        maximumLevel: 18,
    })
}
