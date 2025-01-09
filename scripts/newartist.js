let apiUrl = "https://s-api.lioncat6.com"
function dispErr(error) {
    document.getElementById("err").innerHTML = error
}

async function fetchSpotifyArtist(artist) {
    var fsatoken = localStorage.getItem("spfAccessToken") 
    const response = await fetch(apiUrl+'/v1/artists/' + artist, {
      headers: {
        Authorization: 'Bearer ' + fsatoken
      }
    });
  
    const data = await response.json();
    console.log(data)
    if (!data["error"]) {
        var spImgUrl = ""
        if (data["images"].length > 0){
            spImgUrl = data["images"][0]["url"]
        }
        const spArtistName = data["name"]
        const spArtistUrl = data["external_urls"]["spotify"]
        const spArtistId = data["id"]
        const spGenres = data["genres"]
        var spGenresString = ""
        for (x in spGenres) {
            if (x > 0) {
                spGenresString += ", "
            }
            spGenresString += spGenres[x]
        }
        const spFollowerCount = data["followers"]["total"]
        const spPopularity = data["popularity"]
        console.log(spArtistName)
        console.log(spArtistUrl)
        console.log(spImgUrl)
        console.log(spGenres)
        document.getElementById("artistImageContainer").innerHTML="<a href=\""+spImgUrl+"\" target=\"_blank\"><img src=\""+spImgUrl+"\"></a>"
        document.getElementById("spURL").setAttribute("href", spArtistUrl);
        document.getElementById("artistName").innerHTML=spArtistName
        document.title="SAMBL • "+spArtistName
        document.getElementById("artistFollowerCount").innerHTML = `<h2>${spFollowerCount} Followers</h2>`
        document.getElementById("artistGenres").innerHTML = `<p>${spGenresString}</p>`
        document.getElementById("contentContainer").innerHTML=`<a class=\"addToMBButton\" href=\"https://musicbrainz.org/artist/create?edit-artist.name=${spArtistName}&edit-artist.sort_name=${spArtistName}&edit-artist.url.0.text=${spArtistUrl}&edit-artist.url.0.link_type_id=194&edit-artist.edit_note=Artist sourced from Spotify using SAMBL ${spArtistUrl}\" target=\"_blank\"><div>Add to MusicBranz</div></a><a class=\"addToMBButton\" href=\"https://lioncat6.github.io/SAMBL/artist/?${spArtistId}&newArtist=true\" target=\"_blank\"><div>View Artist Anyway</div></a>`
        fetchMBArtist(artist)
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

async function fetchMBArtist(id) {
    const response = await fetch('https://musicbrainz.org/ws/2/url?limit=1&inc=artist-rels+label-rels+release-rels&fmt=json&resource=https://open.spotify.com/artist/' + id);
    const data = await response.json();
    if (response.status == 200){
        const mbid = data["relations"][0]["artist"]["id"]
        console.log(mbid)
        location.assign("https://lioncat6.github.io/SAMBL/artist?spid="+id+"&mbid="+mbid);
    } else if (data["error"]="Not Found" || response.status == 404) {
        console.log("add artist")
    } else {
        console.log("MusicBrainz Error: " + data["error"])
    }
}

const params = new URLSearchParams(new URL(window.location.href).search);
const spid = params.get("spid");

if ((spid)) {
    fetchSpotifyArtist(spid)
} else {
    dispErr("Incomplete Url!")
} 
