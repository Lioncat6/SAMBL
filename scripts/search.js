let apiUrl = "https://s-api.lioncat6.com:20683";

function dispErr(error) {
	document.getElementById("err").innerHTML = error;
}
var spotifyArtistList = [];
async function searchSpotify(query) {
	var fsatoken = localStorage.getItem("spfAccessToken");
	const response = await fetch(`${apiUrl}/v1/search?q=` + query + "&type=artist&limit=20", {
		headers: {
			Authorization: "Bearer " + fsatoken,
		},
	});

	const data = await response.json();
	console.log(data);
	if (!data["error"]) {
		for (x in data["artists"]["items"]) {
			console.log(x)
			spotifyArtistList.push(data["artists"]["items"][x]);
		}
	} else {
		if (data["error"]["status"] == 404) {
			dispErr("Spotify artist not found!");
		} else if (data["error"]["status"] == 400) {
			dispErr("Invalid artist id!");
		} else {
			fsatoken = localStorage.getItem("spfAccessToken");
			console.log(fsatoken);
			if (!fsatoken) {
				fsatoken = "";
			}
			if (fsatoken && fsatoken.length > 10) {
				dispErr("Spotify Timeout | Please reload");
				//location.reload()
			}
		}
	}
	await processArtists();
}

function capFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

async function fetchMBArtist(id) {
	try {
		const response = await fetch("https://musicbrainz.org/ws/2/url?limit=1&inc=artist-rels+label-rels+release-rels&fmt=json&resource=https://open.spotify.com/artist/" + id);
		const data = await response.json();
		if (response.status == 200) {
			const mbid = data["relations"][0]["artist"]["id"];
			return [true, "https://lioncat6.github.io/SAMBL/artist?spid=" + id + "&artist_mbid=" + mbid];
		} else if ((data["error"] = "Not Found" || response.status == 404)) {
			return [false, "https://lioncat6.github.io/SAMBL/newartist?spid=" + id];
		} else {
			console.log("MusicBrainz Error: " + data["error"]);
			return [null, "https://lioncat6.github.io/SAMBL/newartist?spid=" + id];
		}
	} catch {
		return [null, "https://lioncat6.github.io/SAMBL/newartist?spid=" + id];
	}
}

async function processArtists() {
	var elements = [];
	var total = 0;
	displayList();
	for (x in spotifyArtistList) {
		var currentArtist = spotifyArtistList[x];
		var spotifyUrl = currentArtist["external_urls"]["spotify"];
		var spotifyId = currentArtist["id"];
		var spotifyName = currentArtist["name"];
		var spotifyImageURL = "";
		if (currentArtist["images"][0]){
			spotifyImageURL = currentArtist["images"][0]["url"];
		}
		var spotifyFollowers = currentArtist["followers"]["total"];
		const spGenres = currentArtist["genres"];
		var spGenresString = "";
		for (x in spGenres) {
			if (x > 0) {
				spGenresString += ", ";
			}
			spGenresString += spGenres[x];
		}
		total++;
	
		var viewButtonHtml = "";
		// let mbUrlData = await fetchMBArtist(spotifyId);
		// if (mbUrlData[0] == true){
		// 	viewButtonHtml = '<a class="viewButton" href="' + mbUrlData[1] + '"><div>View Artist</div></a>';
		// } else {
		// 	viewButtonHtml = '<a class="viewButton" href="' + mbUrlData[1] + '"><div>Add <img class="artistMB" src="../assets/images/MusicBrainz_logo_icon.svg"></div></a>';
		// }
		
		viewButtonHtml = '<a class="viewButton"><div>Loading <div class="loader"></div></div></a>';

		var spotifyImgHtml = "";
		if (!(!spotifyImageURL || spotifyImageURL == "")){
			spotifyImgHtml = '<div class="artistIcon"><a href="' + spotifyImageURL + '" target="_blank"><img src="' + spotifyImageURL + '" /></a></div>';
		}
	
		var htmlToAppend =
			'<div class="album listItem" style="--background-image: url(' + spotifyImageURL + ');">' + spotifyImgHtml +
			'<div class="textContainer">' +
			'<div class="artistName"><a href="' + spotifyUrl + '" target="_blank">' + spotifyName + '</a></div>' +
			'<div class="artistInfo">' + spotifyFollowers + ' Followers</div>' +
			'<div class="artistGenres">' + spGenresString + '</div>' +
			'</div>' + viewButtonHtml + '</div>';
	
		var htmlObject = document.createElement("div");
		elements.push([htmlObject.getElementsByClassName('viewButton')[0], spotifyId])
		htmlObject.innerHTML = htmlToAppend;
		document.getElementById("artistList").append(htmlObject);
		
	}	
	checkArtistStatus(elements);
}

async function checkArtistStatus(elements) {
	for (let element of elements) {
		let viewButton = element[0];
		let spotifyId = element[1];
		let mbUrlData = await fetchMBArtist(spotifyId);
		if (mbUrlData[0] == true) {
			viewButton.innerHTML = '<a class="viewButton" href="' + mbUrlData[1] + '"><div>View Artist</div></a>';
		} else {
			viewButton.innerHTML = '<a class="viewButton" href="' + mbUrlData[1] + '"><div>Add <img class="artistMB" src="../assets/images/MusicBrainz_logo_icon.svg"></div></a>';
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	
}

function displayList() {
	document.getElementById("artistContainer").style.display = "flex";
}

function addListItem() {}

const params = new URLSearchParams(new URL(window.location.href).search);
const query = params.get("query");
if (!query) {
	dispErr("Malformed url; Lacking a query!");
} else {
    document.getElementById("searchFor").innerHTML="Search Results for \""+query+"\""
	document.title="SAMBL • Results for \""+query+"\""
    searchSpotify(query)
}
