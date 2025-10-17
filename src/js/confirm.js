window.onload = async _ => {
    let { detail, status, message } = await post(urls.queryPlan, { agencyId: "1977", page: 1, rows: 999 })
    if (status != 0) return alert('获取用户数据失败！\n' + message)
    let { current, studentName, studentNo, university } = detail
    document.getElementById('info').innerHTML = `
    姓名：${studentName}<br>
    学号：${studentNo}<br>
    学校：${university?.universityName ?? '无'}<br>
    计划：${current.length == 0 ? '未找到计划' : `${current[0].fitnessName} (ID: ${current[0].fitnessId})`}`
    if (current[0]) window.localStorage.setItem('planId', current[0].fitnessId)
}