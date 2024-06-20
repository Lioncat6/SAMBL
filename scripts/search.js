
function lookup() {
    document.getElementById("err").innerHTML=" "
    document.getElementById("searchEnter").innerHTML="<div class=\"lds-ellipsis\"><div></div><div></div><div></div><div></div></div>"
    const query = document.getElementById('searchbox').value;
    if (query != "") {
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if(query.includes("https://open.spotify.com/artist/")) {
            const match = spotifyUrl.match(/\/artist\/([^/?]+)/);
            if (match) {
                const spfId  = match[1];
                
            } else {
                
            }
        } else if (uuidPattern.test(query)) {

        } else {
            invalidInput("Text searching is currently not supported!")
        }
    } else {
        invalidInput("Please enter a query")
    }
}

function invalidInput(reason){
    document.getElementById("err").innerHTML=reason
    document.getElementById("searchEnter").innerHTML="Search"
}

function fetchSpotifyArtist(data) {

}

function fetchMBArtist(data) {

}

function spotifySearch(data) {

}