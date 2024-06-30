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
        const spImgUrl = ""
        if (data["images"].length > 0){
            spImgUrl = data["images"][0]["url"]
        }
        const spArtistName = data["name"]
        const spArtistUrl = data["external_urls"]["spotify"]
        console.log(spArtistName)
        console.log(spArtistUrl)
        console.log(spImgUrl)
        document.getElementById("artistImageContainer").innerHTML="<a href=\""+spImgUrl+"\" target=\"_blank\"><img src=\""+spImgUrl+"\"></a>"
        document.getElementById("spURL").setAttribute("href", spArtistUrl);
        document.getElementById("artistName").innerHTML=spArtistName
        document.getElementsByTagName("title")[0].innerHTML="SAMBL • "+spArtistName
        downloadSpotifyAlbums(artist)
    } else {
        if (response.status == 404) {
            dispErr("Spotify artist not found!")
        } else if (response.status == 400) {
            dispErr("Invalid artist id!")
        } else {
            fsatoken = localStorage.getItem("spfAccessToken") 
            console.log(fsatoken)
            if (!fsatoken) {
                fsatoken = "";
            }
            if (fsatoken && fsatoken.length > 10) {
                dispErr("Spotify Timeout | Please reload")
                localStorage.setItem("spfLastAuthenticated", 0) //forces spotify.js to reauth on reload.
                //location.reload()
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
            if (fsatoken && fsatoken.length > 10) {
                dispErr("Spotify Timeout | Please reload")
                //location.reload()
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
                if (fsatoken && fsatoken.length > 10) {
                    dispErr("Spotify Timeout | Please reload")
                    //location.reload()
                }
            }
            
        }
    }
    
    downloadMusicBrainzAlbums()
}

async function downloadMusicBrainzAlbums() {
    var albumCount = 0;
    var currentOffset = 0;
    document.getElementById("loadingText").innerHTML="Downloading MusicBrainz Albums 1/2..."
    const response = await fetch("https://musicbrainz.org/ws/2/release?artist="+mbid+"&inc=url-rels&fmt=json&offset=" + currentOffset);
    const data = await response.json();
    if (response.status == 200){
        console.log(data)
        albumCount = data["release-count"]
        for (x in data["releases"]) {
            mbAlbumList.push(data["releases"][x])
            document.getElementById("loadingText").innerHTML="Loading albums from MusicBrainz 1/2... ("+x+"/"+albumCount+")"
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
                document.getElementById("loadingText").innerHTML="Loading albums from MusicBrainz 1/2... ("+Number(Number(x)+Number(currentOffset))+"/"+albumCount+")"
            }
        } else if (data["error"]="Not Found" || response.status == 404) {
            dispErr("Musicbrainz artist not found. URL likely malfomed");
        } else {
            dispErr("MusicBrainz Error: " + data["error"])
        }
    }
    downloadMusicBrainzAlbums2()
}

async function downloadMusicBrainzAlbums2() {
    var albumCount = 0;
    var currentOffset = 0;
    document.getElementById("loadingText").innerHTML="Downloading MusicBrainz Albums 2/2..."
    const response = await fetch("https://musicbrainz.org/ws/2/release?track_artist="+mbid+"&inc=url-rels&fmt=json&offset=" + currentOffset);
    const data = await response.json();
    if (response.status == 200){
        console.log(data)
        albumCount = data["release-count"]
        for (x in data["releases"]) {
            mbAlbumList.push(data["releases"][x])
            document.getElementById("loadingText").innerHTML="Loading albums from MusicBrainz 2/2... ("+x+"/"+albumCount+")"
        }
    } else if (data["error"]="Not Found" || response.status == 404) {
        dispErr("Musicbrainz artist not found. URL likely malfomed");
    } else {
        dispErr("MusicBrainz Error: " + data["error"])
    }

    while (currentOffset + 15 < albumCount) {
        currentOffset += 15;
        await new Promise(r => setTimeout(r, 500));
        const response = await fetch("https://musicbrainz.org/ws/2/release?track_artist="+mbid+"&inc=url-rels&fmt=json&offset=" + currentOffset);
        const data = await response.json();
        if (response.status == 200){
            console.log(data)
            for (x in data["releases"]) {
                mbAlbumList.push(data["releases"][x])
                document.getElementById("loadingText").innerHTML="Loading albums from MusicBrainz 2/2... ("+Number(Number(x)+Number(currentOffset))+"/"+albumCount+")"
            }
        } else if (data["error"]="Not Found" || response.status == 404) {
            dispErr("Musicbrainz artist not found. URL likely malfomed");
        } else {
            dispErr("MusicBrainz Error: " + data["error"])
        }
    }
    document.getElementById("loadingContainer").innerHTML="";
    document.getElementById("loadingText").innerHTML=""
    processAlbums()
}

function processAlbums() {
    var green = 0
    var red = 0
    var orange = 0
    var total = 0
    displayList()
    for (x in spotifyAlbumList){
        var albumStatus = "red"
        var albumMBUrl = ""
        var currentAlbum = spotifyAlbumList[x]
        var spotifyUrl = currentAlbum["external_urls"]["spotify"]
        var spotifyId = currentAlbum["id"]
        var spotifyName = currentAlbum["name"]
        var spotifyImageURL = currentAlbum["images"][0]["url"]
        var spotifyAlbumArtists = currentAlbum["artists"]
        for (y in mbAlbumList) {
            var currentMBRelease = mbAlbumList[y]
            var mbReleaseName = currentMBRelease["title"]
            var mbReleaseUrls = currentMBRelease["relations"]
            for (z in mbReleaseUrls) {
                if (mbReleaseUrls[z]["url"]["resource"] == spotifyUrl){
                    albumMBUrl = "https://musicbrainz.org/release/"+currentMBRelease["id"]
                    albumStatus = "green"
                    break
                }
            }
            if (albumStatus == "green") {
                break
            } else if (mbReleaseName.toUpperCase() == spotifyName.toUpperCase()){
                albumStatus = "orange"
            } 
        }
        total++
        if (albumStatus == "green") {
            green++
        } else if(albumStatus == "orange") {
            orange++
        } else {
            red++
        }
        var mbLinkHtml = ""
        if (albumMBUrl) {
            var mbLinkHtml = "<a href=\""+albumMBUrl+"\" target=\"_blank\"><img class=\"albumMB\" src=\"../assets/images/MusicBrainz_Logo.svg\" /></a>"
        }
        var spArtistsHtml = ""
        for (x in spotifyAlbumArtists){
            if (x > 0) {
                spArtistsHtml+=", "
            }
            var currentArtist = spotifyAlbumArtists[x]
            var artistName = currentArtist["name"]
            var artistUrl = currentArtist["external_urls"]["spotify"]
            spArtistsHtml +="<a href=\""+artistUrl+"\" target=\"_blank\">"+artistName+"</a>"
        }
        var htmlToAppend = "<div class=\"album listItem\"><div class=\"statusPill "+albumStatus+"\"></div><div class=\"albumCover\"><a href=\""+spotifyImageURL+"\" target=\"_blank\"><img src=\""+spotifyImageURL+"\" /></a></div><div class=\"textContainer\"><div class=\"albumTitle\"><a href=\""+spotifyUrl+"\" target=\"_blank\" >"+spotifyName+"</a>"+mbLinkHtml+"</div><div class=\"artists\">"+spArtistsHtml+"</div></div><a class=\"aTisketButton\" href=\"https://atisket.pulsewidth.org.uk/?spf_id="+spotifyId+"&preferred_vendor=spf\" target=\"_blank\"><div>A-tisket</div></a></div>"
        var htmlObject = document.createElement('div');
        htmlObject.innerHTML = htmlToAppend
        document.getElementById("albumList").append(htmlObject)
    }
    if (orange == 1){
        document.getElementById("statusText").innerHTML="Albums on musicBrainz: "+green+"/"+total+" ~ 1 album has a matching name but no associated link"
    } else if (orange > 0) {
        document.getElementById("statusText").innerHTML="Albums on musicBrainz: "+green+"/"+total+" ~ "+orange +" albums have matching names but no associated link"
    } else {
        document.getElementById("statusText").innerHTML="Albums on musicBrainz: "+green+"/"+total
    }
    

}

function displayList(){
    document.getElementById("albumContainer").style.display="flex";
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


function searchList() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("listSearch");
    filter = input.value.toUpperCase();
    table = document.getElementById("albumList");
    tr = table.getElementsByClassName("listItem");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByClassName("albumTitle")[0].getElementsByTagName("a")[0];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
  }