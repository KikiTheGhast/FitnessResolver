//simulateDistance用于坐标计算，calculatedDistance用于上传
let positions = [], simulateDistance = 0, calculatedDistance = 0, fitnessId = window.localStorage.getItem('planId'), speed
let gradeType, recordId, timeoutId, startTime = 0

window.onload = _ => window.changeSpeed()

window.onClickStart = _ => {
    document.getElementById('start').disabled = true
    document.getElementById('end').disabled = false
    startRunning()
}

window.onClickEnd = _ => {
    document.getElementById('start').disabled = false
    document.getElementById('end').disabled = true
    endRunning()
}

window.changeSpeed = _ => {
    speed = +document.getElementById('speed').value
    document.getElementById('speedDisplay').innerText = shouldStop() ? '静止' : `${speed.toFixed(1)} min/km`
}

const shouldStop = _ => {
    return speed > 15
}

const startRunning = async _ => {
    positions = [], simulateDistance = 0, calculatedDistance = 0, time = 0
    let session = await post(urls.start, { fitnessId: fitnessId })
    if (session.status == 0) {
        let detail = session.detail
        gradeType = detail.gradeType, recordId = detail.strollRecordId, startTime = new Date().getTime()
        heartbeat(true)
    } else alert(session.message)
}

const heartbeat = async keep => {
    if (!shouldStop()) simulateDistance += 1000 / speed / 60
    let pos = getTrackPosition(simulateDistance)
    if (positions.length > 0) {
        let last = positions[positions.length - 1]
        calculatedDistance += Math.ceil(calculateDistance(pos.latitude, pos.longitude, last.latitude, last.longitude))
    }
    positions.push(pos)
    let data = await post(urls.heartbeat, constructData())
    if (data?.status ?? 0 != 0) alert(data.message)
    updateDisplay()
    if (keep) timeoutId = setTimeout(() => heartbeat(true), 1000);
}

const endRunning = async _ => {
    clearTimeout(timeoutId)
    heartbeat(false)
    let data = await post(urls.end, constructData())
    if (data?.status ?? 0 != 0) alert(data.message)
}

const constructData = _ => {
    return {
        fitnessId: fitnessId,
        gradeType: gradeType,
        strollDistance: calculatedDistance,
        submitTimestamp: new Date().getTime(),
        strollRecordId: recordId,
        strollDetail: JSON.stringify({
            map: positions.map(o => {
                return { x: o.longitude, y: o.latitude }
            })
        })
    }
}

const updateDisplay = _ => {
    let time = (new Date().getTime() - startTime) / 1000
    document.getElementById('progress').innerHTML = `时长：${formatTime(time)}<br>距离：${Math.floor(calculatedDistance) / 1000} 千米<br>配速：${Math.floor((time / 60) / (calculatedDistance / 1000) * 100) / 100} min/km`
}

const formatTime = time => {
    if (time == null || time <= 0) return '00:00:00'
    time = Math.floor(time)
    let hour = Math.floor(time / 3600)
    let hourStr = hour < 10 ? '0'.concat(hour) : hour
    let minute = time % 3600, a = Math.floor(minute / 60)
    let minuteStr = a < 10 ? '0'.concat(a) : a, o = minute % 60
    let secondStr = o < 10 ? '0'.concat(o) : o
    return "".concat(hourStr, ':').concat(minuteStr, ':').concat(secondStr)
} 