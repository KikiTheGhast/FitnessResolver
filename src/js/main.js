let positions = [], distance = 0, time, fitnessId = window.localStorage.getItem('planId')
let gradeType, recordId, timeoutId

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

const startRunning = async _ => {
    positions = [], distance = 0, time = 0
    let session = await post(urls.start, { fitnessId: fitnessId })
    if (session.status == 0) {
        let detail = session.detail
        gradeType = detail.gradeType, recordId = detail.strollRecordId
        heartbeat(true)
    } else alert(session.message)
}

const heartbeat = async keep => {
    let pos = getTrackPositionWithRotation(time++)
    if (positions.length > 0) {
        let last = positions[positions.length - 1]
        distance += Math.ceil(calculateDistance(pos.latitude, pos.longitude, last.latitude, last.longitude))
    }
    positions.push(pos)
    await post(urls.heartbeat, constructData())
    updateDisplay()
    if (keep) timeoutId = setTimeout(() => heartbeat(true), 1000);
}

const endRunning = async _ => {
    clearTimeout(timeoutId)
    heartbeat(false)
    await post(urls.end, constructData())
}

const constructData = _ => {
    return {
        fitnessId: fitnessId,
        gradeType: gradeType,
        strollDistance: distance,
        submitTimestamp: new Date().getTime(),
        strollRecordId: recordId,
        strollDetail: JSON.stringify({
            map: positions.map(o => {
                return { x: o.longitude, y: o.latitude }
            })
        })
    }
}

const updateDisplay = _ => document.getElementById('progress').innerHTML = `时长：${formatTime(time)}<br>距离：${Math.floor(distance) / 1000}千米<br>配速：${Math.floor((time / 60) / (distance / 1000) * 100) / 100}min/km`

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