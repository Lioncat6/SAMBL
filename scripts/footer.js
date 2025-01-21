const statusElement = document.getElementById('serverStatus');
let apiUrl = "https://s-api.lioncat6.com";

function checkServerStatus() {
    fetch(`${apiUrl}/uptime`)
        .then(response => {
            if (response.status === 200) {
                return response.json().then(data => {
                    if (data.motd) {
                        statusElement.innerHTML = `Server Online: ${data.human_readable} | ${data.motd}`;
                    } else {
                        statusElement.innerHTML = `Server Online: ${data.human_readable}`;
                    }
                    statusElement.className = 'online';
                });
            } else if (response.status === 503) {
                statusElement.innerHTML = `⚠️ Server failed to connect to Spotify`;
                statusElement.className = 'offline';
            } else {
                statusElement.innerHTML = `⚠️ Unknown Server Error`;
                statusElement.className = 'offline';
            }
        })
        .catch(error => {
            console.error(error);
            statusElement.innerHTML = '⚠️ Server Unreachable';
            statusElement.className = 'offline';
        });
}

// Check status immediately and then every 30 seconds
checkServerStatus();
setInterval(checkServerStatus, 30000);
