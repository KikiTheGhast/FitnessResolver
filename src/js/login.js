window.doLogin = async _ => {
    let username = document.getElementById('username').value, password = document.getElementById('password').value
    let json = await login(username, password)
    if (json.code != 1) alert(json.message)
    else window.location.href = '/confirm.html'
}