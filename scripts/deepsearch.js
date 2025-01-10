let apiUrl = "https://s-api.lioncat6.com";
function dispErr(error) {
	document.getElementById("err").innerHTML = error;
}

async function fetchSpotifyArtist(artist) {
	const response = await fetch(apiUrl + "/v1/artists/" + artist, {});
	const data = await response.json();
	console.log(data);
	if (!data["error"]) {
		var spImgUrl = "";
		if (data["images"].length > 0) {
			spImgUrl = data["images"][0]["url"];
		}
		const spArtistName = data["name"];
		const spArtistUrl = data["external_urls"]["spotify"];
		const spArtistId = data["id"];
		const spGenres = data["genres"];
		var spGenresString = "";
		for (x in spGenres) {
			if (x > 0) {
				spGenresString += ", ";
			}
			spGenresString += spGenres[x];
		}
		const spFollowerCount = data["followers"]["total"];
		const spPopularity = data["popularity"];
		console.log(spArtistName);
		console.log(spArtistUrl);
		console.log(spImgUrl);
		console.log(spGenres);
		document.getElementById("artistImageContainer").innerHTML = '<a href="' + spImgUrl + '" target="_blank"><img src="' + spImgUrl + '"></a>';
		document.getElementById("spURL").setAttribute("href", spArtistUrl);
		document.getElementById("artistName").innerHTML = spArtistName;
		document.title = "SAMBL • " + spArtistName;
		document.getElementById("artistFollowerCount").innerHTML = `<h2>${spFollowerCount} Followers</h2>`;
		document.getElementById("artistGenres").innerHTML = `<p>${spGenresString}</p>`;
		fetchMBArtist(artist);
	} else {
		if (data["error"]["status"] == 404) {
			dispErr("Spotify artist not found!");
		} else if (data["error"]["status"] == 400) {
			dispErr("Invalid artist id!");
		} else {
			dispErr("Spotify Timeout | Please reload");
		}
	}
}

async function fetchMBArtist(id) {
	const response = await fetch("https://musicbrainz.org/ws/2/url?limit=1&inc=artist-rels+label-rels+release-rels&fmt=json&resource=https://open.spotify.com/artist/" + id);
	const data = await response.json();
	if (response.status == 200) {
		const mbid = data["relations"][0]["artist"]["id"];
		console.log(mbid);
		location.assign("https://lioncat6.github.io/SAMBL/artist?spid=" + id + "&mbid=" + mbid);
	} else if ((data["error"] = "Not Found" || response.status == 404)) {
		console.log("add artist");
	} else {
		console.log("MusicBrainz Error: " + data["error"]);
	}
}


function updateOutput(text){
	document.getElementById("output").textContent = text;
}

async function deepSearch(spID){
	updateOutput("Method 1: Release URL Relationships")
	updateOutput("")
}

const params = new URLSearchParams(new URL(window.location.href).search);
const spid = params.get("spid");

if (spid) {
	fetchSpotifyArtist(spid);
} else {
	dispErr("Incomplete Url!");
}

