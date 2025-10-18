let latitude = (31.318217 + 31.31997) / 2, longitude = (121.392548 + 121.393845) / 2

/**
 * 支持旋转的跑道位置计算函数（默认南北向，可自定义旋转角度）
 * @param {number} distance - 距离（米）
 * @param {number} centerLat - 跑道中心点纬度
 * @param {number} centerLng - 跑道中心点经度
 * @param {number} rotation - 旋转角度（度，0°=东西向，90°=南北向，顺时针为正）
 * @param {number} offsetX - X方向偏移（米，向右为正）
 * @param {number} offsetY - Y方向偏移（米，向上为正）
 * @returns {Object} { latitude, longitude } 实时经纬度
 */
function getTrackPosition(distance, centerLat = latitude, centerLng = longitude, rotation = 90, offsetX = 0, offsetY = 0) {
    // 1. 标准跑道参数（内圈）
    const straightLength = 84.39; // 单段直道长度（米）
    const bandRadius = 36.5;       // 弯道半径（米）
    const bandCircumference = Math.PI * bandRadius; // 单段弯道长度（≈114.66米）
    const totalCircumference = 2 * straightLength + 2 * bandCircumference; // ≈400米

    // 2. 累计移动距离
    distance %= totalCircumference;

    // 3. 计算原始相对坐标（未旋转，默认东西向长轴）
    let x = 0, y = 0;
    if (distance <= straightLength) {
        // 阶段1：右侧直道（东西向时，向右为X正方向）
        x = straightLength / 2 - distance;
        y = -bandRadius;
    } else if (distance <= straightLength + bandCircumference) {
        // 阶段2：上弯道
        const arcDistance = distance - straightLength;
        const angle = arcDistance / bandRadius; // 0→π弧度（顺时针）
        x = -straightLength / 2 - bandRadius * Math.sin(angle);
        y = -bandRadius * Math.cos(angle);
    } else if (distance <= 2 * straightLength + bandCircumference) {
        // 阶段3：左侧直道
        const straight2Distance = distance - (straightLength + bandCircumference);
        x = -straightLength / 2 + straight2Distance;
        y = bandRadius;
    } else {
        // 阶段4：下弯道
        const arcDistance = distance - (2 * straightLength + bandCircumference);
        const angle = arcDistance / bandRadius; // 0→π弧度（顺时针）
        x = straightLength / 2 + bandRadius * Math.sin(angle);
        y = bandRadius * Math.cos(angle);
    }

    // 4. 叠加偏移量
    x += offsetX;
    y += offsetY;

    // 5. 坐标旋转（核心：将东西向转换为南北向或自定义角度）
    const rotationRad = rotation * Math.PI / 180; // 角度转弧度
    const cosRot = Math.cos(rotationRad);
    const sinRot = Math.sin(rotationRad);
    // 旋转公式：x' = x*cosθ - y*sinθ；y' = x*sinθ + y*cosθ
    const xRotated = x * cosRot - y * sinRot;
    const yRotated = x * sinRot + y * cosRot;

    // 6. 旋转后的坐标转换为经纬度
    const earthRadius = 6378137; // 地球赤道半径（米）
    const radLat = centerLat * Math.PI / 180;
    const lngPerMeter = 1 / (earthRadius * Math.cos(radLat)); // 1米对应的经度差（弧度）
    const latPerMeter = 1 / earthRadius; // 1米对应的纬度差（弧度）

    return {
        latitude: centerLat + (yRotated * latPerMeter) * (180 / Math.PI),
        longitude: centerLng + (xRotated * lngPerMeter) * (180 / Math.PI)
    };
}

/**
 * 计算两个经纬度坐标之间的直线距离（单位：米）
 * @param {number} lat1 - 第一个点的纬度（度）
 * @param {number} lng1 - 第一个点的经度（度）
 * @param {number} lat2 - 第二个点的纬度（度）
 * @param {number} lng2 - 第二个点的经度（度）
 * @returns {number} 两点之间的距离（米，保留2位小数）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    // 地球半径（米，WGS84椭球模型近似值）
    const earthRadius = 6371000;

    // 将角度转换为弧度
    const radLat1 = (lat1 * Math.PI) / 180;
    const radLng1 = (lng1 * Math.PI) / 180;
    const radLat2 = (lat2 * Math.PI) / 180;
    const radLng2 = (lng2 * Math.PI) / 180;

    // 计算纬度差和经度差
    const deltaLat = radLat2 - radLat1;
    const deltaLng = radLng2 - radLng1;

    // Haversine公式核心计算
    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(radLat1) * Math.cos(radLat2) *
        Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // 距离 = 地球半径 × 圆心角（弧度）
    const distance = earthRadius * c;

    return parseFloat(distance.toFixed(2));
}