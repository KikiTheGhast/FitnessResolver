const urls = {
    login: 'https://user.ymq.me/public/public/login',
    queryPlan: 'https://edu.ymq.me/webservice/wechat/student/fitness/queryOneStudentFitness.do',
    renewal: 'https://user.ymq.me/public/token/renewal',
    start: 'https://edu.ymq.me/webservice/wechat/student/stroll/makeStroll.do',
    heartbeat: 'https://edu.ymq.me/webservice/wechat/student/stroll/saveStroll.do',//1s一次
    end: 'https://edu.ymq.me/webservice/wechat/student/stroll/submitStroll.do'
}

let token = window.localStorage.getItem('token') ?? ''

const getSn = (body, time, token) => {
    for (var r = Object.assign({}, { snTime: time, token: token }, body), s = "", i = Object.keys(r).sort(), a = i.length, u = 0; u < a; u++)
        s += i[u] + "=" + r[i[u]] + "&";
    return md5(s)
}

const post = async (url, body) => {
    let time = new Date().getTime()
    let sn = getSn(body, time, token)
    let form = JSON.stringify({
        body: body,
        header: {
            token: token,
            snTime: time,
            sn: sn,
            from: 'wx'
        }
    })

    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'x-sn-verify': md5(form),
        },
        body: form
    })
    return response.json().then(json => {
        console.log(url, body, json)
        return json
    })
}

const login = async (username, password) => {
    let json = await post(urls.login, {
        identifier: username,
        credential: password,
        client_id: 1000,
        identity_type: 1
    })
    if (json.code == 1) {
        token = json?.userinfo?.token ?? ''
        window.localStorage.setItem('token', token)
    }
    return json
}