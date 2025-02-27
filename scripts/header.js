document.addEventListener("DOMContentLoaded", async function () {
	// Inset Menu
	const configMenuHTML = `
		<div id="configMenu" style="display: none;">
			<h3 id="configMenuHeader">Configure SAMBL <i class="fa-solid fa-up-down-left-right moveIcon"></i></h3>
			<form id="configBoxes">
				<div class="checkbox-wrapper">
					<input type="checkbox" id="showHarmony" name="showHarmony" class="substituted" />
					<label for="showHarmony" id="harmonyLabel"> Show Harmony Button</label><br />
				</div>
				<div class="checkbox-wrapper">
					<input type="checkbox" id="showAtisket" name="showAtisket" class="substituted" />
					<label for="showAtisket" id="AtisketLabel"> Show A-Tisket Button</label><br />
				</div>
				<br />
				<div class="text-input-wrapper">
					<label for="harmonyConfig" id="harmonyConfigLabel">Harmony Parameters:</label>
					<input type="text" id="harmonyConfig" name="harmonyConfig" class="substituted" />
					<a href="https://github.com/Lioncat6/SAMBL/wiki/Harmony-Parameters" rel="nooperner" target="_blank" style="margin-left: 5px;">?</a><br />
				</div>
				<br /><button id="saveConfig" type="button">Save</button>
			</form>
		</div>
	`;
	parent.document.getElementById("main").insertAdjacentHTML("beforeend", configMenuHTML);
	document.getElementById("configButton").addEventListener("click", openConfig);
	parent.document.getElementById("saveConfig").addEventListener("click", saveConfig);
	dragElement(parent.document.getElementById("configMenu"));
});

function openConfig() {
	parent.document.getElementById("configMenu").style.display = "block";

	let settingsJson = JSON.parse(localStorage.getItem("settings"));
	let showHarmony = true,
		showAtisket = true,
		harmonyConfig = "&category=preferred";
	if (settingsJson) {
		try {
			showHarmony = settingsJson.showHarmony || showHarmony;
			showAtisket = settingsJson.showAtisket || showAtisket;
			harmonyConfig = settingsJson.harmonyConfig || harmonyConfig;
		} catch (e) {
			console.log("Saved settings not present or invalid");
		}
	}
	parent.document.getElementById("showHarmony").checked = showHarmony;
	parent.document.getElementById("showAtisket").checked = showAtisket;
	parent.document.getElementById("harmonyConfig").value = harmonyConfig;
}

function saveConfig() {
	parent.document.getElementById("configMenu").style.display = "none";
	let showHarmony = parent.document.getElementById("showHarmony").checked;
	let showAtisket = parent.document.getElementById("showAtisket").checked;
	let harmonyConfig = parent.document.getElementById("harmonyConfig").value;
	let settings = {
		showHarmony: showHarmony,
		showAtisket: showAtisket,
		harmonyConfig: harmonyConfig,
	};
	const settingsString = JSON.stringify(settings);
	if (settingsString != localStorage.getItem("settings")) {
		localStorage.setItem("settings", settingsString);
		parent.location.reload();
	}
}

function dragElement(elmnt) {
	//from w3 schools
	var pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
	if (parent.document.getElementById(elmnt.id + "Header")) {
		parent.document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
		parent.document.getElementById(elmnt.id + "Header").ontouchstart = dragMouseDown;
	} else {
		elmnt.onmousedown = dragMouseDown;
		elmnt.ontouchstart = dragMouseDown;
	}
	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		pos3 = e.clientX || e.touches[0].clientX;
		pos4 = e.clientY || e.touches[0].clientY;
		parent.document.onmouseup = closeDragElement;
		parent.document.ontouchend = closeDragElement;
		parent.document.onmousemove = elementDrag;
		parent.document.ontouchmove = elementDrag;
	}
	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		pos1 = pos3 - (e.clientX || e.touches[0].clientX);
		pos2 = pos4 - (e.clientY || e.touches[0].clientY);
		pos3 = e.clientX || e.touches[0].clientX;
		pos4 = e.clientY || e.touches[0].clientY;
		elmnt.style.top = elmnt.offsetTop - pos2 + "px";
		elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
	}
	function closeDragElement() {
		parent.document.onmouseup = null;
		parent.document.ontouchend = null;
		parent.document.onmousemove = null;
		parent.document.ontouchmove = null;
	}
}
