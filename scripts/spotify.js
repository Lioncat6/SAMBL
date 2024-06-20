
function generateRandomString(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
 
    for (let i = 0; i < length; i++) {
       const randomIndex = Math.floor(Math.random() * charset.length);
       result += charset[randomIndex];
    }
 
    return result;
 }

function linkSpotify() {
    var client_id = '57d875faab2243bca6bf51d4c6899b7d';
    var redirect_uri = 'https://lioncat6.github.io/SAMBL/callback';
    
    var state = generateRandomString(16);
    
    localStorage.setItem("spfStateKey", state);
    var scope = 'user-read-private user-read-email';
    
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(client_id);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    url += '&state=' + encodeURIComponent(state);
    window.open(url)
}

function callback() {
    const url = window.location.href
    if (url.includes("access_token")) {
        const urlParams = new URLSearchParams(new URL(url).hash.slice(1));
        const accessToken = urlParams.get("access_token");
        localStorage.setItem("spfAccessToken", accessToken);
        const bc = new BroadcastChannel("sambl");
        bc.postMessage("samblRefresh");
        window.close()
    } else {
        const urlParams = new URLSearchParams(new URL(url).hash.slice(1));
        var err = urlParams.get("error");
        if (!err) {
            err = "no code provided" 
        }
        console.log(err)
        document.getElementById("err").innerHTML=err
        localStorage.setItem("spfAccessToken", undefined);
    }
}


async function getProfile(accessToken) {
    let token = accessToken
    console.log(token)
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });
  
    const data = await response.json();
    console.log(data)
    if (!data["error"]) {
        document.getElementById("spfloggedIn").innerHTML=data["display_name"]
    } else {
        var localtoken = localStorage.getItem("spfAccessToken") 
        console.log(localtoken)
        if (!localtoken) {
            localtoken = "";
        }
        if (localtoken != undefined & localtoken.length > 10) {
            linkSpotify()
        }
    }
    
}

function spfButton(){
    linkSpotify()
}

const bc = new BroadcastChannel("sambl");

bc.onmessage = (event) => {
    if (event = "samblRefresh"){
        bc.close();
        location.reload()
    }
};

if (window.location.href.includes("/callback")) {
    callback()
} else if (window.location.href.includes("header")) {
    var ac = localStorage.getItem("spfAccessToken") 
    console.log(ac)
    if (!ac){
        ac == "";
    }
    if (ac != undefined & ac.length > 10) {
        getProfile(ac)
    }
}
