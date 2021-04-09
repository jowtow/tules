const { ipcRenderer } = require("electron");
const axios = require('axios').default;

let apiBaseUri = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';
let searchInput, results, apiKey;
window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('config-request');
    ipcRenderer.on('config-reply', function (event, data) {
        apiKey = data['dictionary_apikey'];
    });
    let searchDebounce;
    searchInput = document.querySelector("#searchText");
    results = document.querySelector('#results');
    searchInput.focus();
    searchInput.addEventListener('keydown', () => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(definitionApiCall, 500);
    })
})

function definitionApiCall() {
    if (!searchInput.value || searchInput.value == "") {
        results.style.display = "none";
        return;
    }

    axios.get(apiBaseUri + searchInput.value + "?key=" + apiKey)
        .then((response) => {
            ipcRenderer.send('dictionaryApiCall', { searchTerm: searchInput.value });
            let info = response.data[0];
            if (!info.meta) {
                // no dice
                results.innerHTML = '<div>Did you mean ... </div><ul>'
                for (let i = 0; i < response.data.length; i++) {
                    results.innerHTML += `<li>${response.data[i]}</li>`
                }
                results.innerHTML += "</ul>"
                results.style.display = "block";
                return;
            }
            let sound = info.hwi.prs[0]?.sound?.audio ?? '';

            let headword = info.hwi.hw;
            let functionalLabel = info.fl;
            let pronunciation = info.hwi.prs[0]?.mw ?? '';
            let synonymText = '';
            if (info.syns)
                synonymText = "<br/><h2>Synonyms</h2>" + info.syns[0]?.pt[0][1]?.replace(/{sc}/g, "<i>")?.replace(/{\/sc}/g, "...</i>") ?? '';

            let headinghtml = `<div id="heading">${searchInput.value}`
            if (sound) {
                let audioUrl = getAudioUrl(sound);
                headinghtml += `<audio id="audio1" src="${audioUrl}"></audio>`
                headinghtml += `<span id="speaker">🔊</span>`;
            }
            headinghtml += '</div>';
            results.innerHTML = headinghtml;
            results.innerHTML += `<h2>${headword} (${functionalLabel}) | ${pronunciation}</h2>`;
            results.innerHTML += `<ol><li>${info.shortdef[0]}</li>`
                + (info.shortdef[1] ? `<li>${info.shortdef[1]}</li>` : '')
                + (info.shortdef[2] ? `<li>${info.shortdef[2]}</li>` : '')
                + `</ol>`;
            results.innerHTML += synonymText;
            results.style.display = "block";

            document.getElementById("speaker").addEventListener("click", () => {
                var audio = document.querySelector("#audio1");
                audio.play();
            })
        });

}

function getAudioUrl(sound) {
    let subdir;
    let alphaRegEx = new RegExp(/[a-zA-Z]/g);
    if (sound.substr(0, 3) === "bix") {
        subdir = "bix";
    }
    else if (sound.substr(0, 2) === "gg") {
        subdir = "gg"
    }
    else if (!alphaRegEx.test(sound.substr(0, 1))) {
        subdir = "number"
    }
    else {
        subdir = sound.substr(0, 1);
    }

    let audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${sound}.mp3`
    console.log(audioUrl);
    return audioUrl;
}