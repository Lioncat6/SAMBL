
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
                invalidInpuInconsistent("Text searching is currently not supported!")
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
            }
        }
        
    }
}

async function fetchMBArtist(id) {
    const response = await fetch('https://musicbrainz.org/ws/2/url?limit=1&resource=https://open.spotify.com/artist/' + id);
    const rawdata = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawdata, "text/xml");
    console.log(doc.getElementsByTagName("url")[0].id)
}

function spotifySearch(data) {

}
