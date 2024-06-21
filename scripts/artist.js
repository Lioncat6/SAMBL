function dispErr(error) {
    document.getElementById("err").innerHTML = error
}

async function fetchSpotifyArtist(artist) {
    var fsatoken = localStorage.getItem("spfAccessToken") 
    const response = await fetch('https://api.spotify.com/v1/artists/' + artist, {
      headers: {
        Authorization: 'Bearer ' + fsatoken
      }
    });
  
    const data = await response.json();
    console.log(data)
    if (!data["error"]) {
        const imgUrl = data["images"][0]
        document.getElementById("artistImageContainer").innerHTML="<a href=\""+imgUrl+"\" target=\"_blank\"><img src=\""+imgUrl+"\"></a>"
    } else {
        if (data["error"]["status"] == 404) {
            dispErr("Spotify artist not found!")
        } else if (data["error"]["status"] == 400) {
            dispErr("Invalid artist id!")
        } else {
            fsatoken = localStorage.getItem("spfAccessToken") 
            console.log(fsatoken)
            if (!fsatoken) {
                fsatoken = "";
            }
            if (fsatoken & fsatoken.length > 10) {
                linkSpotify()
                dispErr("Spotify Timeout | Please reload")
            }
        }
        
    }
}

async function downloadSpotifyAlbums (artist) {


}

const params = new URLSearchParams(new URL(window.location.href).search);
const spid = params.get("spid");
const mbid = params.get("mbid");

fetchSpotifyArtist(spid)