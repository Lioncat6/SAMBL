const statusElement = document.getElementById('serverStatus');
let apiUrl = "https://s-api.lioncat6.com:20683";
function checkServerStatus() {
    fetch(`${apiUrl}/uptime`)
        .then(response => response.json())
        .then(data => {
            statusElement.innerHTML = `Server Online - Uptime: ${data.human_readable}`;
            statusElement.className = 'online';
        })
        .catch(() => {
            statusElement.innerHTML = '⚠️ Server Unreachable';
            statusElement.className = 'offline';
        });
}

// Check status immediately and then every 30 seconds
checkServerStatus();
setInterval(checkServerStatus, 30000);