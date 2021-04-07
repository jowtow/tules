const { ipcRenderer } = require("electron");
const axios = require('axios').default;

let apiBaseUri = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';

window.addEventListener('DOMContentLoaded', () => {
    let apiKey;
    ipcRenderer.send('config-request');
    ipcRenderer.on('config-reply', function (event, data) {
        apiKey = data['dictionary_apikey'];
    });
    let searchDebounce;
    let searchInput = document.querySelector("#searchText");
    let results = document.querySelector('#results');
    searchInput.focus();
    searchInput.addEventListener('keydown', () => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(definitionApiCall, 500);
    })

    function definitionApiCall() {
        if (!searchInput.value || searchInput.value == ""){
            results.style.display = "none";
            return;
        }
            
        axios.get(apiBaseUri + searchInput.value + "?key=" + apiKey)
            .then((response) => {
                console.log(response);
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
                let headword = info.hwi.hw;
                let functionalLabel = info.fl;
                let pronunciation = info.hwi.prs[0]?.mw ?? '';
                let synonymText = '';
                if (info.syns)
                    synonymText = "<br/><h2>Synonyms</h2>" + info.syns[0]?.pt[0][1]?.replace(/{sc}/g, "<i>")?.replace(/{\/sc}/g, "...</i>") ?? '';

                results.innerHTML = `<h1>${searchInput.value}</h1>`;
                results.innerHTML += `<h2>${headword} (${functionalLabel}) | ${pronunciation}</h2>`;
                results.innerHTML += `<ol><li>${info.shortdef[0]}</li>`
                    + (info.shortdef[1] ? `<li>${info.shortdef[1]}</li>` : '')
                    + (info.shortdef[2] ? `<li>${info.shortdef[2]}</li>` : '')
                    + `</ol>`;
                results.innerHTML += synonymText;
                results.style.display = "block";
            });
    }
})

