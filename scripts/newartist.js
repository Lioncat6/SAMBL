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
        const spImgUrl = data["images"][0]["url"]
        const spArtistName = data["name"]
        const spArtistUrl = data["external_urls"]["spotify"]
        console.log(spArtistName)
        console.log(spArtistUrl)
        console.log(spImgUrl)
        document.getElementById("artistImageContainer").innerHTML="<a href=\""+spImgUrl+"\" target=\"_blank\"><img src=\""+spImgUrl+"\"></a>"
        document.getElementById("spURL").setAttribute("href", spArtistUrl);
        document.getElementById("artistName").innerHTML=spArtistName
        document.getElementsByTagName("title")[0].innerHTML="SAMBL • "+spArtistName
        document.getElementById("contentContainer").innerHTML=`<a class=\"addToMBButton\" href=\"https://musicbrainz.org/artist/create?edit-artist.name=${spArtistName}&edit-artist.sort_name=${spArtistName}&edit-artist.url.0.text=${spArtistUrl}&edit-artist.url.0.link_type_id=194&edit-artist.edit_note=Artist sourced from Spotify using SAMBL ${spArtistUrl}\" target=\"_blank\"><div>Add to MusicBranz</div></a>`
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
                location.reload()
            }
        }
        
    }
}

const params = new URLSearchParams(new URL(window.location.href).search);
const spid = params.get("spid");

if ((spid)) {
    fetchSpotifyArtist(spid)
} else {
    dispErr("Incomplete Url!")
} 
