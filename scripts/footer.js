const statusElement = document.getElementById('serverStatus');
let apiUrl = "https://s-api.lioncat6.com:20683";

function checkServerStatus() {
    fetch(`${apiUrl}/uptime`)
        .then(response => {
            if (!response.ok) { // Check if response status is not ok
                if (response.status == 503) {
                    statusElement.innerHTML = `⚠️ Server failed to connect to Spotify`;
                    statusElement.className = 'offline';
                } else {
                    statusElement.innerHTML = `⚠️ Unknown Server Error`;
                    statusElement.className = 'offline';
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            statusElement.innerHTML = `Server Online: ${data.human_readable}`;
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
