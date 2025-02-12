import { getUserAgent, getApiUrl } from "../scripts/config.js";
const userAgent = getUserAgent();
let apiUrl = getApiUrl();
function dispErr(error) {
	document.getElementById("err").innerHTML = error;
}

document.addEventListener("DOMContentLoaded", function () {
	document.getElementById("listSearch").addEventListener("keyup", searchList);
	document.getElementById("filterSearch").addEventListener("click", filter);
	document.getElementById("applyfilter").addEventListener("click", applyFilter);
});

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
	let mostPopularArtistWithOutImage = null;
	for (const artistId of artistIds) {
		const fsatoken = localStorage.getItem("spfAccessToken");
		const response = await fetch(`${apiUrl}/v1/artists/${artistId.trim()}`, {
			headers: {
				Authorization: `Bearer ${fsatoken}`,
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
			} else if (data["followers"]["total"] > mostPAFCount) {
				mostPAFCount = data["followers"]["total"];
				mostPopularArtistWithOutImage = data;
			}

			await downloadSpotifyAlbums(artistId.trim());
			await new Promise((resolve) => setTimeout(resolve, 500)); // Delay to avoid rate limiting
		} else {
			console.error(`Error fetching artist ${artistId}: ${data["error"]}`);
		}
	}

	if (mostPopularArtist) {
		updateArtistInfo(mostPopularArtist, allArtistNames, allArtistUrls, totalFollowers, true);
	} else {
		updateArtistInfo(mostPopularArtistWithOutImage, allArtistNames, allArtistUrls, totalFollowers, false);
		//dispErr("No valid artist data found with images");
	}
	downloadMusicBrainzAlbums();
}

function updateArtistInfo(artist, allNames, allUrls, totalFollowers, mostPopular) {
	var spImgUrl = "";
	if (artist["images"].length > 0) {
		spImgUrl = artist["images"][0]["url"];
	}
	const spArtistName = allNames.join(" / ");
	const spGenres = artist["genres"];
	const spGenresString = spGenres.join(", ");
	const spPopularity = artist["popularity"];

	if (mostPopular) {
		const popularityBar = document.getElementById("artistPopularityFill");
		const popularityContainer = document.getElementById("artistPopularityContainer");
		popularityBar.style.width = spPopularity + "%";
		popularityContainer.title = "Popularity: " + spPopularity + "%";
	}

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
	const response = await fetch(`${apiUrl}/v1/artists/${artist}`, {
		headers: {
			Authorization: `Bearer ${fsatoken}`,
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
		for (let genre in spGenres) {
			if (genre > 0) {
				spGenresString += ", ";
			}
			spGenresString += spGenres[genre];
		}
		const spFollowerCount = data["followers"]["total"];
		const spPopularity = data["popularity"];
		const popularityBar = document.getElementById("artistPopularityFill");
		const popularityContainer = document.getElementById("artistPopularityContainer");
		popularityBar.style.width = spPopularity + "%";
		popularityContainer.title = "Popularity: " + spPopularity + "%";
		console.log(spArtistName);
		console.log(spArtistUrl);
		console.log(spImgUrl);
		console.log(spGenres);
		document.getElementById("artistImageContainer").innerHTML = `<a href="${spImgUrl}" target="_blank"><img src="${spImgUrl}"></a>`;
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
	const response = await fetch(`${apiUrl}/v1/artists/${artist}/albums?limit=50`, {
		headers: {
			Authorization: `Bearer ${fsatoken}`,
		},
	});

	const data = await response.json();
	console.log(data);
	if (!data["error"]) {
		albumCount = data["total"];
		for (let album in data["items"]) {
			spotifyAlbumList.push(data["items"][album]);
			document.getElementById("loadingText").innerHTML = `Loading albums from spotify... (${album}/${albumCount})`;
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
		const response = await fetch(`${apiUrl}/v1/artists/${artist}/albums?limit=50&offset=${currentOffset}`, {
			headers: {
				Authorization: `Bearer ${fsatoken}`,
			},
		});

		const data = await response.json();
		console.log(data);
		if (!data["error"]) {
			for (let album in data["items"]) {
				spotifyAlbumList.push(data["items"][album]);
				document.getElementById("loadingText").innerHTML = `Loading albums from spotify... (${Number(Number(album) + Number(currentOffset))}/${albumCount})`;
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
	if (!newArtist) {
		await fetchMusicBrainzAlbums("artist");
		await fetchMusicBrainzAlbums("track_artist");
		document.getElementById("loadingContainer").innerHTML = "";
		document.getElementById("loadingText").innerHTML = "";
		processAlbums();
	} else {
		document.getElementById("loadingContainer").innerHTML = "";
		document.getElementById("loadingText").innerHTML = "";
		processAlbums();
	}
}

async function fetchMusicBrainzAlbums(type) {
	var albumCount = 0;
	var currentOffset = 0;
	document.getElementById("loadingText").innerHTML = `Downloading MusicBrainz Albums (${type === "artist" ? "1/2" : "2/2"})...`;
	let success = false;
	let tries = 0;

	while (!success && tries < 5) {
		try {
			const response = await fetch(`https://musicbrainz.org/ws/2/release?${type}=${mbid}&inc=url-rels+recordings&fmt=json&limit=100&offset=${currentOffset}`, {
				headers: {
					"User-Agent": userAgent,
				},
			});
			const data = await response.json();
			if (response.status == 200) {
				console.log(data);
				albumCount = data["release-count"];
				for (let release in data["releases"]) {
					mbAlbumList.push(data["releases"][release]);
					document.getElementById("loadingText").innerHTML = `Loading albums from MusicBrainz (${type === "artist" ? "1/2" : "2/2"})... (${release}/${albumCount})`;
				}
				success = true;
			} else if ((data["error"] = "Not Found" || response.status == 404) && !newArtist) {
				dispErr("Musicbrainz artist not found. URL likely malformed");
				break;
			} else {
				console.log("MusicBrainz Error: " + data["error"]);
				throw new Error(data["error"]);
			}
		} catch (error) {
			if (error.message.includes("Your requests are exceeding the allowable rate limit.")) {
				await new Promise((r) => setTimeout(r, 1000 * tries)); // Slow down and retry
			} else {
				console.error("Error fetching MusicBrainz data:", error);
				dispErr("Error fetching MusicBrainz data, please reload!");
				break;
			}
		}
		tries++;
	}

	while (currentOffset + 100 < albumCount) {
		currentOffset += 100;
		success = false;
		tries = 0;

		while (!success && tries < 5) {
			try {
				const response = await fetch(`https://musicbrainz.org/ws/2/release?${type}=${mbid}&inc=url-rels+recordings&fmt=json&limit=100&offset=${currentOffset}`, {
					headers: {
						"User-Agent": userAgent,
					},
				});
				const data = await response.json();
				if (response.status == 200) {
					console.log(data);
					for (let release in data["releases"]) {
						mbAlbumList.push(data["releases"][release]);
						document.getElementById("loadingText").innerHTML = `Loading albums from MusicBrainz (${type === "artist" ? "1/2" : "2/2"})... (${Number(Number(release) + Number(currentOffset))}/${albumCount})`;
					}
					success = true;
				} else if ((data["error"] = "Not Found" || response.status == 404)) {
					dispErr("Musicbrainz artist not found. URL likely malformed");
					break;
				} else {
					console.log("MusicBrainz Error: " + data["error"]);
					throw new Error(data["error"]);
				}
			} catch (error) {
				if (error.message.includes("Your requests are exceeding the allowable rate limit.")) {
					await new Promise((r) => setTimeout(r, 1000 * tries)); // Slow down and retry
				} else {
					console.error("Error fetching MusicBrainz data:", error);
					dispErr("Error fetching MusicBrainz data, please reload!");
					break;
				}
			}
			tries++;
		}
		await new Promise((r) => setTimeout(r, 100));
	}
}

function capFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
function normalizeText(text) {
	let normalizedText = text.toUpperCase().replace(/\s/g, "");
	let textRemovedChars = normalizedText.replace(/['’!?.,:;(){}\[\]<>\/\\|_\-+=*&^%$#@~`“”«»„“”¿¡]/g, "");
	if (textRemovedChars == "") {
		textRemovedChars = normalizedText;
	}
	return textRemovedChars;
}

var green = 0;
var red = 0;
var orange = 0;
var total = 0;
function processAlbums() {
	displayList();
	for (let album in spotifyAlbumList) {
		var albumStatus = "red";
		var albumMBUrl = "";
		var pillTooltipText = "";
		var currentAlbum = spotifyAlbumList[album];
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
		var finalTrackCount = 0;
		var finalReleaseDate = 0;
		var finalMBID = "";
		for (let mbAlbum in mbAlbumList) {
			var currentMBRelease = mbAlbumList[mbAlbum];
			var mbReleaseName = currentMBRelease["title"];
			var mbReleaseUrls = currentMBRelease["relations"];
			var albumMBUPC = currentMBRelease["barcode"];
			var MBTrackCount = currentMBRelease["media"][0]["track-count"];
			var MBReleaseDate = currentMBRelease["date"];
			for (let releaseUrl in mbReleaseUrls) {
				if (mbReleaseUrls[releaseUrl]["url"]["resource"] == spotifyUrl) {
					finalMBID = currentMBRelease["id"];
					albumMBUrl = "https://musicbrainz.org/release/" + finalMBID;
					albumStatus = "green";
					finalTrackCount = MBTrackCount;
					finalReleaseDate = MBReleaseDate;
					break;
				}
			}
			if (albumStatus == "green") {
				finalTrackCount = MBTrackCount;
				finalReleaseDate = MBReleaseDate;
				finalMBID = currentMBRelease["id"];
				break;
			} else if (normalizeText(mbReleaseName) == normalizeText(spotifyName)) {
				finalMBID = currentMBRelease["id"];
				albumMBUrl = "https://musicbrainz.org/release/" + finalMBID;
				albumStatus = "orange";
				finalTrackCount = MBTrackCount;
				finalReleaseDate = MBReleaseDate;
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
			var mbLinkHtml = `<a href="${albumMBUrl}" target="_blank"><img class="albumMB" src="../assets/images/MusicBrainz_logo_icon.svg" /></a>`;
		} else if (albumMBUrl) {
			var mbLinkHtml = `<a href="${albumMBUrl}" target="_blank"><img class="albumMB" src="../assets/images/MB_Error.svg" title="Warning: This could be the incorrect MB release for this album!" /></a>`;
		}
		var spArtistsHtml = "";
		for (let album in spotifyAlbumArtists) {
			if (album > 0) {
				spArtistsHtml += ", ";
			}
			var currentArtist = spotifyAlbumArtists[album];
			var artistName = currentArtist["name"];
			var artistUrl = currentArtist["external_urls"]["spotify"];
			var artistId = currentArtist["id"];
			const aristSAMBLurl = `../newartist?spid=${artistId}`;
			spArtistsHtml += `<a href="${artistUrl}" target="_blank">${artistName}</a><a href="${aristSAMBLurl}" target="_blank"><img class="SAMBLicon" src="../assets/images/favicon.svg" /></a>`;
		}
		let iconsHtml = "";
		if (albumStatus != "red") {
			if (!albumMBUPC || albumMBUPC == null) {
				iconsHtml += `<img class="upcIcon" src="../assets/images/noUPC.svg" title="This release is missing a UPC/Barcode!">`;
			}
			if (finalTrackCount != spotifyTrackCount) {
				iconsHtml += `<div class="numDiff" title="This release has a differing track count! [SP: ${spotifyTrackCount} MB: ${finalTrackCount}]">#</div>`;
			}
			if (finalReleaseDate == "" || finalReleaseDate == undefined || !finalReleaseDate) {
				const spotifyYear = spotifyReleaseDate.split("-")[0];
				const spotifyMonth = spotifyReleaseDate.split("-")[1];
				const spotifyDay = spotifyReleaseDate.split("-")[2];
				const editNote = encodeURIComponent(`Added release date from Spotify using SAMBL: ${spotifyUrl}`);
				iconsHtml += `<a class="dateDiff" href="https://musicbrainz.org/release/${finalMBID}/edit?events.0.date.year=${spotifyYear}&events.0.date.month=${spotifyMonth}&events.0.date.day=${spotifyDay}&edit_note=${editNote}" title="This release is missing a release date!\n[Click to Fix] - Requires MB Release Edit Seeding Helper" target="_blank" rel="nooperner">🗓</a>`;
			} else if (finalReleaseDate != spotifyReleaseDate) {
				iconsHtml += `<div class="dateDiff" title="This release has a differing release date! [SP: ${spotifyReleaseDate} MB: ${finalReleaseDate}]\n(This may indicate that you have to split a release.)">🗓</div>`;
			}
		}
		const htmlToAppend = `
	<div class="album listItem">
		<div class="statusPill ${albumStatus}" title="${pillTooltipText}"></div>
		<div class="albumCover">
			<a href="${spotifyImageURL}" target="_blank"><img src="${spotifyImageURL}" /></a>
		</div>
		<div class="textContainer">
			<div class="albumTitle">
				<a href="${spotifyUrl}" target="_blank">${spotifyName}</a>
				${mbLinkHtml}
			</div>
			<div class="artists">${spArtistsHtml}</div>
			<div class="albumInfo">
				<div>${spotifyReleaseDate} • ${capFirst(spotifyAlbumType)} • ${spotifyTrackString}</div>
				${iconsHtml}
			</div>
		</div>
		<a class="aTisketButton" href="https://atisket.pulsewidth.org.uk/?spf_id=${spotifyId}&preferred_vendor=spf" target="_blank"><div>A-tisket</div></a>
		<a class="harmonyButton" href="https://harmony.pulsewidth.org.uk/release?url=${spotifyUrl}&category=preferred" target="_blank"><div>Harmony</div></a>
	</div>`;
		var htmlObject = document.createElement("div");
		htmlObject.innerHTML = htmlToAppend;
		document.getElementById("albumList").append(htmlObject);
	}
	if (orange == 1) {
		document.getElementById("statusText").innerHTML = `Albums on musicBrainz: ${green}/${total} ~ 1 album has a matching name but no associated link`;
	} else if (orange > 0) {
		document.getElementById("statusText").innerHTML = `Albums on musicBrainz: ${green}/${total} ~ ${orange} albums have matching names but no associated link`;
	} else {
		document.getElementById("statusText").innerHTML = `Albums on musicBrainz: ${green}/${total}`;
	}
}

function displayList() {
	document.getElementById("albumContainer").style.display = "flex";
}

function addListItem() {}

const params = new URLSearchParams(new URL(window.location.href).search);
const spid = params.get("spid");
const spids = params.get("spids");
const newArtist = params.get("newArtist");
let mbid = params.get("mbid");
if (!mbid) {
	mbid = params.get("artist_mbid");
}
var spotifyAlbumList = [];
var mbAlbumList = [];
if (spid) {
	if (mbid) {
		document.getElementById("mbURL").setAttribute("href", `https://musicbrainz.org/artist/${mbid}`);
		document.getElementById("loadingContainer").innerHTML = '<div class="lds-facebook"><div></div><div></div><div></div></div>';
		document.getElementById("loadingText").innerHTML = "Loading albums from spotify...";
		fetchSpotifyArtist(spid);
	} else if (newArtist) {
		async function fetchMBArtist(id) {
			const response = await fetch(`https://musicbrainz.org/ws/2/url?limit=1&inc=artist-rels+label-rels+release-rels&fmt=json&resource=https://open.spotify.com/artist/${id}`);
			const data = await response.json();
			if (response.status == 200) {
				const mbid = data["relations"][0]["artist"]["id"];
				console.log(mbid);
				location.assign(`../artist?spid=${id}&mbid=${mbid}`);
			} else if ((data["error"] = "Not Found" || response.status == 404)) {
				console.log("add artist");
			} else {
				console.log("MusicBrainz Error: " + data["error"]);
			}
		}
		fetchMBArtist(spid);
		dispErr("Displaying artist page without MBID");
		document.getElementById("mbURL").setAttribute("href", `https://musicbrainz.org/artist/${mbid}`);
		document.getElementById("loadingContainer").innerHTML = '<div class="lds-facebook"><div></div><div></div><div></div></div>';
		document.getElementById("loadingText").innerHTML = "Loading albums from spotify...";
		fetchSpotifyArtist(spid);
	} else {
		dispErr("Incomplete Url! Missing Musicbrainz ID!");
	}
} else if (spids) {
	document.getElementById("mbURL").setAttribute("href", `https://musicbrainz.org/artist/${mbid}`);
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
let hasProblem = false;
const variousArtistsList = ["Various Artists", "Artistes Variés", "Verschiedene Künstler", "Varios Artistas", "ヴァリアス・アーティスト"];

function searchList() {
	let input, filter, table, tr, td, i, txtValue, color, artistString;
	input = document.getElementById("listSearch");
	filter = input.value.toUpperCase();
	table = document.getElementById("albumList");
	tr = table.getElementsByClassName("listItem");
	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByClassName("albumTitle")[0].getElementsByTagName("a")[0];
		color = tr[i].getElementsByClassName("statusPill")[0].classList[1];
		artistString = tr[i].getElementsByClassName("artists")[0].innerHTML;
		let hasNoUpc = tr[i].getElementsByClassName("upcIcon").length > 0;
		let countDiff = tr[i].getElementsByClassName("numDiff").length > 0;
		let dateDiff = tr[i].getElementsByClassName("dateDiff").length > 0;
		if (td) {
			txtValue = td.textContent || td.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				const isVariousArtists = variousArtistsList.some((artist) => artistString.includes(artist));
				if (((showGreen && color == "green") || (showOrange && color == "orange") || (showRed && color == "red")) && !(hideVarious && isVariousArtists) && !(hasProblem && !hasNoUpc && !countDiff && !dateDiff)) {
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
	document.getElementById("hasProblem").checked = hasProblem;
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
	hasProblem = document.getElementById("hasProblem").checked;
	searchList();
}

function closeFilter() {
	document.getElementById("filterList").style.display = "none";
}

function dragElement(elmnt) {
	//from w3 schools
	var pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
	if (document.getElementById(elmnt.id + "Header")) {
		/* if present, the header is where you move the DIV from:*/
		document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
	} else {
		/* otherwise, move the DIV from anywhere inside the DIV:*/
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top = elmnt.offsetTop - pos2 + "px";
		elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
	}

	function closeDragElement() {
		/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

searchList();
dragElement(document.getElementById("filterList"));
