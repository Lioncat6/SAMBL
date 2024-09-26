let apiUrl = "https://us2.bot-hosting.net:20683"
function lookup() {
    document.getElementById("err").innerHTML=" "
    document.getElementById("searchEnter").innerHTML="<div class=\"lds-ellipsis\"><div></div><div></div><div></div><div></div></div>"
    const query = document.getElementById('searchbox').value;
    var spftoken = localStorage.getItem("spfAccessToken") 
    var spfName = localStorage.getItem("spfName")
    if (!spftoken) {
        spftoken = "";
    }
    //spftoken != undefined && spftoken.length > 10 && spfName != ""
    if (true) {
        if (query != "") {
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if(query.includes("https://open.spotify.com/artist/")) {
                const match = query.match(/\/artist\/([^/?]+)/);
                if (match) {
                    const spfId  = match[1];
                    fetchSpotifyArtist(spfId)
                } else {
                    
                }
            } else if (uuidPattern.test(query)) {
                invalidInput("MB Lookup isn't currently supported; Please enter a spotify artist link instead!")
            } else if (query.includes("https://open.spotify.com/")) {
                invalidInput("This type of link isn't currently supported; Please enter a spotify artist link instead!")
            } else {
                invalidInput("Text searching is currently not supported; Please enter a spotify artist link instead!")
            }
        } else {
            invalidInput("Please enter a query")
        }
    } else {
        invalidInput("Please login to spotify")
    }
}

function invalidInput(reason){
    document.getElementById("err").innerHTML=reason
    document.getElementById("searchEnter").innerHTML="Search"
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
        console.log(data)
        fetchMBArtist(artist)
    } else {
        if (data["error"]["status"] == 404) {
            invalidInput("Spotify artist not found!")
        } else if (data["error"]["status"] == 400) {
            invalidInput("Invalid artist id!")
        } else {
            fsatoken = localStorage.getItem("spfAccessToken") 
            console.log(fsatoken)
            if (!fsatoken) {
                fsatoken = "";
            }
            if (fsatoken & fsatoken.length > 10) {
                linkSpotify()
                invalidInput("Spotify Timeout | Please try again")
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
        invalidInput(" ");
        location.assign("https://lioncat6.github.io/SAMBL/artist?spid="+id+"&mbid="+mbid);
    } else if (data["error"]="Not Found" || response.status == 404) {
        console.log("add artist")
        invalidInput(" ")
        location.assign("https://lioncat6.github.io/SAMBL/newartist?spid="+id);
    } else {
        invalidInput("MusicBrainz Error: " + data["error"])
    }
}

function spotifySearch(data) {

}

document.addEventListener("keydown", function(e) {
  if (e.keyCode == 13) {
    e.preventDefault()
    lookup()
  }
});
