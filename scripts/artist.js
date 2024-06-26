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
        downloadSpotifyAlbums(artist)
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

async function downloadSpotifyAlbums (artist) {
    var albumCount = 0;
    var currentOffset = 0;

    var fsatoken = localStorage.getItem("spfAccessToken") 
    const response = await fetch('https://api.spotify.com/v1/artists/' + artist + "/albums?limit=50", {
      headers: {
        Authorization: 'Bearer ' + fsatoken
      }
    });
  
    const data = await response.json();
    console.log(data)
    if (!data["error"]) {
        albumCount = data["total"]
        for (x in data["items"]) {
            spotifyAlbumList.push(data["items"][x])
            document.getElementById("loadingText").innerHTML="Loading albums from spotify... ("+x+"/"+albumCount+")"
        }
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
    while (currentOffset + 50 < albumCount) {
        currentOffset += 50;
        await new Promise(r => setTimeout(r, 500));
        var fsatoken = localStorage.getItem("spfAccessToken") 
        const response = await fetch('https://api.spotify.com/v1/artists/' + artist + "/albums?limit=50&offset=" + currentOffset, {
        headers: {
            Authorization: 'Bearer ' + fsatoken
        }
        });
    
        const data = await response.json();
        console.log(data)
        if (!data["error"]) {
            for (x in data["items"]) {
                spotifyAlbumList.push(data["items"][x])
                document.getElementById("loadingText").innerHTML="Loading albums from spotify... ("+Number(Number(x)+Number(currentOffset))+"/"+albumCount+")"
            }
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
    for (x in spotifyAlbumList) {
        console.log(spotifyAlbumList[x])
    }
    
    downloadMusicBrainzAlbums()
}

async function downloadMusicBrainzAlbums() {
    var albumCount = 0;
    var currentOffset = 0;
    document.getElementById("loadingText").innerHTML="Downloading MusicBrainz Albums..."
    const response = await fetch("https://musicbrainz.org/ws/2/release?artist="+mbid+"&inc=url-rels&fmt=json&offset=" + currentOffset);
    const data = await response.json();
    if (response.status == 200){
        console.log(data)
        albumCount = data["release-count"]
        for (x in data["releases"]) {
            mbAlbumList.push(data["releases"][x])
            document.getElementById("loadingText").innerHTML="Loading albums from MusicBrainz... ("+x+"/"+albumCount+")"
        }
    } else if (data["error"]="Not Found" || response.status == 404) {
        dispErr("Musicbrainz artist not found. URL likely malfomed");
    } else {
        dispErr("MusicBrainz Error: " + data["error"])
    }

    while (currentOffset + 15 < albumCount) {
        currentOffset += 15;
        await new Promise(r => setTimeout(r, 500));
        const response = await fetch("https://musicbrainz.org/ws/2/release?artist="+mbid+"&inc=url-rels&fmt=json&offset=" + currentOffset);
        const data = await response.json();
        if (response.status == 200){
            console.log(data)
            for (x in data["releases"]) {
                mbAlbumList.push(data["releases"][x])
                document.getElementById("loadingText").innerHTML="Loading albums from MusicBrainz... ("+Number(Number(x)+Number(currentOffset))+"/"+albumCount+")"
            }
        } else if (data["error"]="Not Found" || response.status == 404) {
            dispErr("Musicbrainz artist not found. URL likely malfomed");
        } else {
            dispErr("MusicBrainz Error: " + data["error"])
        }
    }
    document.getElementById("loadingContainer").innerHTML="";
    document.getElementById("loadingText").innerHTML=""

     for (x in mbAlbumList) {
        console.log(mbAlbumList[x])
    }
}

function processAlbums() {


}

function displayList(){

}

function addListItem() {

}

const params = new URLSearchParams(new URL(window.location.href).search);
const spid = params.get("spid");
const mbid = params.get("mbid");
var spotifyAlbumList = []; 
var mbAlbumList = []; 
if ((spid) && (mbid)) {
    document.getElementById("mbURL").setAttribute("href", "https://musicbrainz.org/artist/"+mbid);
    document.getElementById("loadingContainer").innerHTML="<div class=\"lds-facebook\"><div></div><div></div><div></div></div>";
    document.getElementById("loadingText").innerHTML="Loading albums from spotify..."
    fetchSpotifyArtist(spid)
} else {
    dispErr("Incomplete Url!")
} 
