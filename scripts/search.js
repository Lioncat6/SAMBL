
function lookup() {
    document.getElementById("err").innerHTML=" "
    document.getElementById("searchEnter").innerHTML="<div class=\"lds-ellipsis\"><div></div><div></div><div></div><div></div></div>"
    const query = document.getElementById('searchbox').value;
    var spftoken = localStorage.getItem("spfAccessToken") 
    if (!spftoken) {
        spftoken = "";
    }
    if (spftoken != undefined & spftoken.length > 10) {
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

            } else {
                invalidInput("Text searching is currently not supported!")
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
    const response = await fetch('https://api.spotify.com/v1/artists/' + artist, {
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
    const response = await fetch('https://musicbrainz.org/ws/2/url?limit=1&resource=https://open.spotify.com/artist/' + id);
    const rawdata = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawdata, "text/xml");
    if (response.status == 200){
        const mbid = doc.getElementsByTagName("url")[0].id
        console.log(mbid)
        location.assign("https://lioncat6.github.io/SAMBL/artist?spid="+id+"&mbid="+mbid);
    } else if (doc.getElementsByTagName("text")[0].innerhtml="Not Found") {
        console.log("add artist")
        location.assign("https://lioncat6.github.io/SAMBL/newartist?spid="+id);
    } else {
        invalidInput("MusicBrainz Error: " + doc.getElementsByTagName("text")[0].innerhtml)
    }
}

function spotifySearch(data) {

}
