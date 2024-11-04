let apiUrl = "https://s-api.lioncat6.com:20683";

function dispErr(error) {
	document.getElementById("err").innerHTML = error;
}

let multiple = false;

async function fetchSpotifyArtists(artists) {
	multiple = true;
	const artistIds = artists.split(",");
	console.log(artistIds);
	let mostPopularArtist = null;
	let mostPAFCount = 0;
	let allArtistNames = [];
	let allArtistUrls = [];
	let totalFollowers = 0;
	for (const artistId of artistIds) {
		const fsatoken = localStorage.getItem("spfAccessToken");
		const response = await fetch(`${apiUrl}/v1/artists/${artistId.trim()}`, {
			headers: {
				Authorization: "Bearer " + fsatoken,
			},
		});
		const data = await response.json();

		totalFollowers = totalFollowers + data["followers"]["total"];

		if (!data["error"]) {
			if (!allArtistNames.includes(data["name"])) {
				allArtistNames.push(data["name"]);
			}
			allArtistUrls.push(data["external_urls"]["spotify"]);

			if (data["images"].length > 0 && data["followers"]["total"] > mostPAFCount) {
				mostPAFCount = data["followers"]["total"];
				mostPopularArtist = data;
			}

			await downloadSpotifyAlbums(artistId.trim());
			await new Promise((resolve) => setTimeout(resolve, 500)); // Delay to avoid rate limiting
		} else {
			console.error(`Error fetching artist ${artistId}: ${data["error"]}`);
		}
	}

	if (mostPopularArtist) {
		updateArtistInfo(mostPopularArtist, allArtistNames, allArtistUrls, totalFollowers);
	} else {
		dispErr("No valid artist data found with images");
	}
	await downloadMusicBrainzAlbums();
	processAlbums();
}

function updateArtistInfo(artist, allNames, allUrls, totalFollowers) {
	const spImgUrl = artist["images"][0]["url"];
	const spArtistName = allNames.join(" / ");
	const spGenres = artist["genres"];
	const spGenresString = spGenres.join(", ");
	const spPopularity = artist["popularity"];

	document.getElementById("artistImageContainer").innerHTML = `<a href="${spImgUrl}" target="_blank"><img src="${spImgUrl}"></a>`;
	document.getElementById("artistName").innerHTML = spArtistName;
	document.title = "SAMBL • " + spArtistName;
	document.getElementById("artistFollowerCount").innerHTML = `<h2>${totalFollowers} Followers</h2>`;
	document.getElementById("artistGenres").innerHTML = `<p>${spGenresString}</p>`;

	// Create Spotify icons for each artist URL
	const spotifyIconsHtml = allUrls.map((url) => `<a href="${url}" target="_blank"><img src="../assets/images/Spotify_icon.svg" alt="Spotify" class="spIcon"></a>`).join("");
	document.getElementsByClassName("spURLContainer")[0].innerHTML = spotifyIconsHtml;
}

async function fetchSpotifyArtist(artist) {
	var fsatoken = localStorage.getItem("spfAccessToken");
	const response = await fetch(`${apiUrl}/v1/artists/` + artist, {
		headers: {
			Authorization: "Bearer " + fsatoken,
		},
	});

	const data = await response.json();
	console.log(data);
	if (!data["error"]) {
		var spImgUrl = "";
		if (data["images"].length > 0) {
			spImgUrl = data["images"][0]["url"];
		}
		const spArtistName = data["name"];
		const spArtistUrl = data["external_urls"]["spotify"];
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
		downloadSpotifyAlbums(artist);
	} else {
		if (response.status == 404) {
			dispErr("Spotify artist not found!");
		} else if (response.status == 400) {
			dispErr("Invalid artist id!");
		} else {
			fsatoken = localStorage.getItem("spfAccessToken");
			console.log(fsatoken);
			if (!fsatoken) {
				fsatoken = "";
			}
			if (fsatoken && fsatoken.length > 10) {
				dispErr("Spotify Timeout | Please reload");
				localStorage.setItem("spfLastAuthenticated", 0); //forces spotify.js to reauth on reload.
				//location.reload()
			}
		}
	}
}

async function downloadSpotifyAlbums(artist) {
	var albumCount = 0;
	var currentOffset = 0;

	var fsatoken = localStorage.getItem("spfAccessToken");
	const response = await fetch(`${apiUrl}/v1/artists/` + artist + "/albums?limit=50", {
		headers: {
			Authorization: "Bearer " + fsatoken,
		},
	});

	const data = await response.json();
	console.log(data);
	if (!data["error"]) {
		albumCount = data["total"];
		for (x in data["items"]) {
			spotifyAlbumList.push(data["items"][x]);
			document.getElementById("loadingText").innerHTML = "Loading albums from spotify... (" + x + "/" + albumCount + ")";
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
	while (currentOffset + 50 < albumCount) {
		currentOffset += 50;
		await new Promise((r) => setTimeout(r, 250));
		var fsatoken = localStorage.getItem("spfAccessToken");
		const response = await fetch(`${apiUrl}/v1/artists/` + artist + "/albums?limit=50&offset=" + currentOffset, {
			headers: {
				Authorization: "Bearer " + fsatoken,
			},
		});

		const data = await response.json();
		console.log(data);
		if (!data["error"]) {
			for (x in data["items"]) {
				spotifyAlbumList.push(data["items"][x]);
				document.getElementById("loadingText").innerHTML = "Loading albums from spotify... (" + Number(Number(x) + Number(currentOffset)) + "/" + albumCount + ")";
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
	}
	if (!multiple) {
		downloadMusicBrainzAlbums();
	}
}

async function downloadMusicBrainzAlbums() {
	var albumCount = 0;
	var currentOffset = 0;
	document.getElementById("loadingText").innerHTML = "Downloading MusicBrainz Albums 1/2...";
	const response = await fetch("https://musicbrainz.org/ws/2/release?artist=" + mbid + "&inc=url-rels&fmt=json&limit=100&offset=" + currentOffset);
	const data = await response.json();
	if (response.status == 200) {
		console.log(data);
		albumCount = data["release-count"];
		for (x in data["releases"]) {
			mbAlbumList.push(data["releases"][x]);
			document.getElementById("loadingText").innerHTML = "Loading albums from MusicBrainz 1/2... (" + x + "/" + albumCount + ")";
		}
	} else if ((data["error"] = "Not Found" || response.status == 404)) {
		dispErr("Musicbrainz artist not found. URL likely malfomed");
	} else {
		dispErr("MusicBrainz Error: " + data["error"]);
	}

	while (currentOffset + 100 < albumCount) {
		currentOffset += 100;
		await new Promise((r) => setTimeout(r, 500));
		const response = await fetch("https://musicbrainz.org/ws/2/release?artist=" + mbid + "&inc=url-rels&fmt=json&limit=100&offset=" + currentOffset);
		const data = await response.json();
		if (response.status == 200) {
			console.log(data);
			for (x in data["releases"]) {
				mbAlbumList.push(data["releases"][x]);
				document.getElementById("loadingText").innerHTML = "Loading albums from MusicBrainz 1/2... (" + Number(Number(x) + Number(currentOffset)) + "/" + albumCount + ")";
			}
		} else if ((data["error"] = "Not Found" || response.status == 404)) {
			dispErr("Musicbrainz artist not found. URL likely malfomed");
		} else {
			dispErr("MusicBrainz Error: " + data["error"]);
		}
	}
	downloadMusicBrainzAlbums2();
}

async function downloadMusicBrainzAlbums2() {
	var albumCount = 0;
	var currentOffset = 0;
	document.getElementById("loadingText").innerHTML = "Downloading MusicBrainz Albums 2/2...";
	const response = await fetch("https://musicbrainz.org/ws/2/release?track_artist=" + mbid + "&inc=url-rels&fmt=json&limit=100&offset=" + currentOffset);
	const data = await response.json();
	if (response.status == 200) {
		console.log(data);
		albumCount = data["release-count"];
		for (x in data["releases"]) {
			mbAlbumList.push(data["releases"][x]);
			document.getElementById("loadingText").innerHTML = "Loading albums from MusicBrainz 2/2... (" + x + "/" + albumCount + ")";
		}
	} else if ((data["error"] = "Not Found" || response.status == 404)) {
		dispErr("Musicbrainz artist not found. URL likely malfomed");
	} else {
		dispErr("MusicBrainz Error: " + data["error"]);
	}

	while (currentOffset + 100 < albumCount) {
		currentOffset += 100;
		await new Promise((r) => setTimeout(r, 500));
		const response = await fetch("https://musicbrainz.org/ws/2/release?track_artist=" + mbid + "&inc=url-rels&fmt=json&limit=100&offset=" + currentOffset);
		const data = await response.json();
		if (response.status == 200) {
			console.log(data);
			for (x in data["releases"]) {
				mbAlbumList.push(data["releases"][x]);
				document.getElementById("loadingText").innerHTML = "Loading albums from MusicBrainz 2/2... (" + Number(Number(x) + Number(currentOffset)) + "/" + albumCount + ")";
			}
		} else if ((data["error"] = "Not Found" || response.status == 404)) {
			dispErr("Musicbrainz artist not found. URL likely malfomed");
		} else {
			dispErr("MusicBrainz Error: " + data["error"]);
		}
	}
	document.getElementById("loadingContainer").innerHTML = "";
	document.getElementById("loadingText").innerHTML = "";
	if (!multiple) {
		processAlbums();
	}
}

function capFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

var green = 0;
var red = 0;
var orange = 0;
var total = 0;
function processAlbums() {
	displayList();
	for (x in spotifyAlbumList) {
		var albumStatus = "red";
		var albumMBUrl = "";
		var pillTooltipText = "";
		var currentAlbum = spotifyAlbumList[x];
		var spotifyUrl = currentAlbum["external_urls"]["spotify"];
		var spotifyId = currentAlbum["id"];
		var spotifyName = currentAlbum["name"];
		var spotifyImageURL = currentAlbum["images"][0]["url"];
		var spotifyAlbumArtists = currentAlbum["artists"];
		var spotifyReleaseDate = currentAlbum["release_date"];
		var spotifyTrackCount = currentAlbum["total_tracks"];
		var spotifyTrackString = spotifyTrackCount + " Track";
		var spotifyAlbumUPC = ""; //unused for now
		if (spotifyTrackCount > 1) {
			spotifyTrackString = spotifyTrackCount + " Tracks";
		}
		var spotifyAlbumType = currentAlbum["album_type"];
		for (y in mbAlbumList) {
			var currentMBRelease = mbAlbumList[y];
			var mbReleaseName = currentMBRelease["title"];
			var mbReleaseUrls = currentMBRelease["relations"];
			var albumMBUPC = currentMBRelease["barcode"];
			for (z in mbReleaseUrls) {
				if (mbReleaseUrls[z]["url"]["resource"] == spotifyUrl) {
					albumMBUrl = "https://musicbrainz.org/release/" + currentMBRelease["id"];
					albumStatus = "green";
					break;
				}
			}
			if (albumStatus == "green") {
				break;
			} else if (mbReleaseName.toUpperCase().replace(/\s/g, "") == spotifyName.toUpperCase().replace(/\s/g, "")) {
				albumMBUrl = "https://musicbrainz.org/release/" + currentMBRelease["id"];
				albumStatus = "orange";
			}
		}
		total++;
		if (albumStatus == "green") {
			pillTooltipText = "This album has a MB release with a matching Spotify URL";
			green++;
		} else if (albumStatus == "orange") {
			pillTooltipText = "This album has a MB release with a matching name but no associated link";
			orange++;
		} else {
			pillTooltipText = "This album has no MB release with a matching name or URL";
			red++;
		}
		var mbLinkHtml = "";
		if (albumMBUrl && albumStatus == "green") {
			var mbLinkHtml = '<a href="' + albumMBUrl + '" target="_blank"><img class="albumMB" src="../assets/images/MusicBrainz_logo_icon.svg" /></a>';
		} else if (albumMBUrl) {
			var mbLinkHtml = '<a href="' + albumMBUrl + '" target="_blank"><img class="albumMB" src="../assets/images/MB_Error.svg" title="Warning: This could be the incorrect MB release for this album!" /></a>';
		}
		var spArtistsHtml = "";
		for (x in spotifyAlbumArtists) {
			if (x > 0) {
				spArtistsHtml += ", ";
			}
			var currentArtist = spotifyAlbumArtists[x];
			var artistName = currentArtist["name"];
			var artistUrl = currentArtist["external_urls"]["spotify"];
			spArtistsHtml += '<a href="' + artistUrl + '" target="_blank">' + artistName + "</a>";
		}
		var iconsHtml = "";
		if (!albumMBUPC || albumMBUPC == null) {
			iconsHtml += '<img class="upcIcon" src="../assets/images/noUPC.svg" title="This release is missing a UPC/Barcode!">';
		}
		var htmlToAppend =
			'<div class="album listItem"><div class="statusPill ' +
			albumStatus +
			'" title="' +
			pillTooltipText +
			'"></div><div class="albumCover"><a href="' +
			spotifyImageURL +
			'" target="_blank"><img src="' +
			spotifyImageURL +
			'" /></a></div><div class="textContainer"><div class="albumTitle"><a href="' +
			spotifyUrl +
			'" target="_blank" >' +
			spotifyName +
			"</a>" +
			mbLinkHtml +
			'</div><div class="artists">' +
			spArtistsHtml +
			'</div><div class="albumInfo"><div>' +
			spotifyReleaseDate +
			" • " +
			capFirst(spotifyAlbumType) +
			" • " +
			spotifyTrackString +
			"</div>" +
			iconsHtml +
			'</div></div><a class="aTisketButton" href="https://atisket.pulsewidth.org.uk/?spf_id=' +
			spotifyId +
			'&preferred_vendor=spf" target="_blank"><div>A-tisket</div></a> <a class="harmonyButton" href="https://harmony.pulsewidth.org.uk/release?url=' +
			spotifyUrl +
			'&musicbrainz=&deezer=&itunes=&spotify=&tidal=&beatport=" target="_blank"><div>Harmony</div></a></div>';
		var htmlObject = document.createElement("div");
		htmlObject.innerHTML = htmlToAppend;
		document.getElementById("albumList").append(htmlObject);
	}
	if (orange == 1) {
		document.getElementById("statusText").innerHTML = "Albums on musicBrainz: " + green + "/" + total + " ~ 1 album has a matching name but no associated link";
	} else if (orange > 0) {
		document.getElementById("statusText").innerHTML = "Albums on musicBrainz: " + green + "/" + total + " ~ " + orange + " albums have matching names but no associated link";
	} else {
		document.getElementById("statusText").innerHTML = "Albums on musicBrainz: " + green + "/" + total;
	}
}

function displayList() {
	document.getElementById("albumContainer").style.display = "flex";
}

function addListItem() {}

const params = new URLSearchParams(new URL(window.location.href).search);
const spid = params.get("spid");
const spids = params.get("spids");
let mbid = params.get("mbid");
if (!mbid) {
	mbid = params.get("artist_mbid");
}
var spotifyAlbumList = [];
var mbAlbumList = [];
if (spid) {
	if (mbid) {
		document.getElementById("mbURL").setAttribute("href", "https://musicbrainz.org/artist/" + mbid);
		document.getElementById("loadingContainer").innerHTML = '<div class="lds-facebook"><div></div><div></div><div></div></div>';
		document.getElementById("loadingText").innerHTML = "Loading albums from spotify...";
		fetchSpotifyArtist(spid);
	} else {
		dispErr("Incomplete Url! Missing Musicbrainz ID!");
	}
} else if (spids) {
	document.getElementById("mbURL").setAttribute("href", "https://musicbrainz.org/artist/" + mbid);
	document.getElementById("loadingContainer").innerHTML = '<div class="lds-facebook"><div></div><div></div><div></div></div>';
	document.getElementById("loadingText").innerHTML = "Loading multiple spotify artists...";
	fetchSpotifyArtists(spids);
} else {
	dispErr("Incomplete Url! Missing Spotify ID!");
}

let showGreen = true;
let showOrange = true;
let showRed = true;

let hideVarious = false;

const variousArtistsList = ["Various Artists", "Artistes Variés", "Verschiedene Künstler", "Varios Artistas", "ヴァリアス・アーティスト"];

function searchList() {
	var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("listSearch");
	filter = input.value.toUpperCase();
	table = document.getElementById("albumList");
	tr = table.getElementsByClassName("listItem");
	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByClassName("albumTitle")[0].getElementsByTagName("a")[0];
		color = tr[i].getElementsByClassName("statusPill")[0].classList[1];
		artistString = tr[i].getElementsByClassName("artists")[0].innerHTML;
		if (td) {
			txtValue = td.textContent || td.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				const isVariousArtists = variousArtistsList.some((artist) => artistString.includes(artist));
				if (((showGreen && color == "green") || (showOrange && color == "orange") || (showRed && color == "red")) && !(hideVarious && isVariousArtists)) {
					tr[i].style.display = "";
				} else {
					tr[i].style.display = "none";
				}
			} else {
				tr[i].style.display = "none";
			}
		}
	}
}

function filter() {
	document.getElementById("filterList").style.display = "block";
	document.getElementById("showGreen").checked = showGreen;
	document.getElementById("showOrange").checked = showOrange;
	document.getElementById("showRed").checked = showRed;
	document.getElementById("hideVarious").checked = hideVarious;
	document.getElementById("greenLabel").innerHTML = ` Show Green <i>(${green})</i>`;
	document.getElementById("orangeLabel").innerHTML = ` Show Orange <i>(${orange})</i>`;
	document.getElementById("redLabel").innerHTML = ` Show Red <i>(${red})</i>`;
}

function applyFilter() {
	document.getElementById("filterList").style.display = "none";
	showGreen = document.getElementById("showGreen").checked;
	showOrange = document.getElementById("showOrange").checked;
	showRed = document.getElementById("showRed").checked;
	hideVarious = document.getElementById("hideVarious").checked;
	searchList();
}

function closeFilter() {
	document.getElementById("filterList").style.display = "none";
}

searchList();
