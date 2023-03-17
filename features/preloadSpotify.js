const {
    ipcRenderer
} = require("electron");
const moment = require("moment");
const apiCall = require("./apiCall.js");



let access_token = undefined;
let access_token_set_at = undefined;

const inputs = {
    playButton: undefined,
    pauseButton: undefined,
    nextButton: undefined,
    previousButton: undefined,
    repeatButton: undefined,
    shuffleButton: undefined,
    searchInput: undefined
};

const metadata = {
    artistLabel: undefined,
    songLabel: undefined,
    albumArtImg: undefined,
}

const initialSetup = {
    Setup: () => {
        window.addEventListener('DOMContentLoaded', () => {
            ipcRenderer.send('config-request');
            initialSetup.SetupIPCListeners();
            initialSetup.SetDOMElements();
            initialSetup.SetupEventListeners();

            setInterval(player.RefreshPlayerState, 3000)
        })
    },
    SetupIPCListeners: () => {
        ipcRenderer.on('config-reply', function (event, data) {
            access_token = data['spotify_access_token'];
            access_token_set_at = data['spotify_access_token_set_at'];
            if (!access_token || moment(Date.now()).diff(moment(access_token_set_at), 'm') >= 50) {
                ipcRenderer.send('spotify-auth');
            }
            else {
                player.RefreshPlayerState();
            }
        });

        ipcRenderer.on('spotify-auth-done', function (event, data) {
            access_token = data;
            player.RefreshPlayerState();
        });
    },
    SetDOMElements: () => {
        inputs.playButton = document.querySelector("#play");
        inputs.pauseButton = document.querySelector("#pause");
        inputs.nextButton = document.querySelector("#next");
        inputs.previousButton = document.querySelector("#previous");
        inputs.shuffleButton = document.querySelector("#shuffle");
        inputs.repeatButton = document.querySelector("#repeat");
        inputs.searchInput = document.querySelector("#search");
        metadata.artistLabel = document.querySelector("#artist");
        metadata.songLabel = document.querySelector("#song");
        metadata.albumArtImg = document.querySelector("#albumart");
    },
    SetupEventListeners: () => {
        inputs.playButton.addEventListener('click', async () => {
            apiCall.Put('https://api.spotify.com/v1/me/player/play', {}, access_token).then(player.RefreshPlayerState);
        });

        inputs.pauseButton.addEventListener('click', async () => {
            apiCall.Put('https://api.spotify.com/v1/me/player/pause', {}, access_token).then(player.RefreshPlayerState);
        });

        inputs.nextButton.addEventListener('click', async () => {
            apiCall.Post('https://api.spotify.com/v1/me/player/next', {}, access_token).then(player.RefreshPlayerState);
        });

        inputs.previousButton.addEventListener('click', async () => {
            apiCall.Post('https://api.spotify.com/v1/me/player/previous', {}, access_token).then(player.RefreshPlayerState);
        });

        inputs.searchInput.addEventListener('change', async () => {
            var searchTerm = inputs.searchInput.value;
            var typesToSearch = "album,artist,track,playlist";
            if (searchTerm.includes(":")) {
                var typeKey = searchTerm.split(":")[0];
                switch (typeKey) {
                    case 'a':
                        typesToSearch = "album";
                        break;
                    case 'b':
                        typesToSearch = "artist";
                        break;
                    case 't':
                        typesToSearch = "track";
                        break;
                    case 'p':
                        typesToSearch = "playlist";
                        break;
                }
                searchTerm = searchTerm.split(":")[1];
            }

            var searchTerm = encodeURIComponent(searchTerm);
            var response = await apiCall.Get(`https://api.spotify.com/v1/search?q=${searchTerm}&type=${typesToSearch}`, access_token);
            search.PopulateSearchResults(response);
            search.SetupSearchEventListeners();
        });

        inputs.repeatButton.addEventListener('click', async () => {
            var currentIcon = inputs.repeatButton.innerHTML;
            var state = "";
            if (currentIcon == "repeat") {
                state = "context";
                inputs.repeatButton.innerHTML = "repeat_on";
            }
            else if (currentIcon == "repeat_on") {
                state = "track";
                inputs.repeatButton.innerHTML = "repeat_one_on";
            }
            else {
                state = "off";
                inputs.repeatButton.innerHTML = "repeat";
            }
            apiCall.Put(`https://api.spotify.com/v1/me/player/repeat?state=${state}`, {}, access_token).then(player.RefreshPlayerState);
        });

        inputs.shuffleButton.addEventListener('click', async () => {
            var currentIcon = inputs.shuffleButton.innerHTML;
            var shuffle = true;
            inputs.shuffleButton.innerHTML = "shuffle_on"
            if (currentIcon == "shuffle_on") {
                inputs.shuffleButton.innerHTML = "shuffle"
                shuffle = false;
            }
            apiCall.Put(`https://api.spotify.com/v1/me/player/shuffle?state=${shuffle}`, {}, access_token).then(player.RefreshPlayerState);
        });
    }
};

const search = {
    SetupSearchEventListeners: () => {
        document.querySelectorAll(".search-result.album").forEach(x => x.addEventListener('click', async (event) => {
            await search.PlayAlbum(event.currentTarget.dataset.id);
        }));

        document.querySelectorAll(".search-result.track").forEach(x => x.addEventListener('click', async (event) => {
            await search.PlayTrack(event.currentTarget.dataset.id);
        }));

        document.querySelectorAll(".search-result.artist").forEach(x => x.addEventListener('click', async (event) => {
            await search.PlayArtist(event.currentTarget.dataset.id);
        }));

        document.querySelectorAll(".search-result.playlist").forEach(x => x.addEventListener('click', async (event) => {
            await search.PlayPlaylist(event.currentTarget.dataset.id);
        }));
    },

    PopulateSearchResults: (response) => {
        let searchResults = document.querySelector("#searchResults");
        searchResults.style.display = "initial";
        document.querySelector("#searchResults").innerHTML = search.GetHtmlForSearchResults(response.data);
    },
    GetHtmlForSearchResults: (data) => {
        var html = data.albums?.items.map(x => search.GetAlbumItem(x)).join('') ?? "";
        html += data.tracks?.items.map(x => search.GetTrackItem(x)).join('') ?? "";
        html += data.artists?.items.map(x => search.GetArtistItem(x)).join('') ?? "";
        html += data.playlists?.items.map(x => search.GetPlaylistItem(x)).join('') ?? "";
        return html;
    },
    GetAlbumItem: (album) => {
        return `
        <div class="album search-result" data-id="${album.id}">
            <span class="material-icons">album</span>
            <img src="${album.images[2].url}"/>
            <div>
                <div class="album-name">${album.name}</div>
                <div class="album-artist">${album.artists[0].name}</div>
            </div>
        </div>
    `
    },
    GetTrackItem: (track) => {
        return `
        <div class="track search-result" data-id="${track.id}">
            <span class="material-icons">music_note</span>
            <img src="${track.album.images[2].url}"/>
            <div>
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artists[0].name}</div>
            </div>
        </div>
    `
    },
    GetArtistItem: (artist) => {
        return `
        <div class="artist search-result" data-id="${artist.id}">
            <span class="material-icons">person</span>
            <img src="${artist.images[0]?.url}"/>
            <div>
                <div class="artist-name">${artist.name}</div>
            </div>
        </div>
    `
    },
    GetPlaylistItem: (playlist) => {
        return `
        <div class="playlist search-result" data-id="${playlist.id}">
            <span class="material-icons">queue_music</span>
            <img src="${playlist.images[0]?.url}"/>
            <div>
                <div class="playlist-name">${playlist.name}</div>
            </div>
        </div>
    `
    },
    PlayAlbum: async (albumId) => {
        var tracksResponse = await apiCall.Get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, access_token);
        var uris = tracksResponse.data.items.map(x => x.uri);
        await apiCall.Put('https://api.spotify.com/v1/me/player/play', { uris }, access_token);
        player.RefreshPlayerState();
    },
    PlayTrack: async (trackId) => {
        await apiCall.Put('https://api.spotify.com/v1/me/player/play', { uris: [`spotify:track:${trackId}`] }, access_token);
        player.RefreshPlayerState();
    },
    PlayArtist: async (artistId) => {
        var tracksResponse = await apiCall.Get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, access_token);
        var uris = tracksResponse.data.tracks.map(x => `spotify:track:${x.id}`);
        await apiCall.Put('https://api.spotify.com/v1/me/player/play', { uris }, access_token);
        player.RefreshPlayerState();
    },
    PlayPlaylist: async (playlistId) => {
        var tracksResponse = await apiCall.Get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, access_token);
        var uris = tracksResponse.data.items.map(x => `spotify:track:${x.track.id}`);
        await apiCall.Put('https://api.spotify.com/v1/me/player/play', { uris }, access_token);
        player.RefreshPlayerState();
    }
};


const player = {
    RefreshPlayerState: async () => {
        var response = await apiCall.Get('https://api.spotify.com/v1/me/player', access_token);
        var playerState = {
            albumArtUrl: response.data.item?.album?.images[1].url,
            artist: response.data.item?.artists[0].name,
            song: response.data.item?.name,
            isPlaying: response.data['is_playing'],
            shuffleState: response.data['shuffle_state'],
            repeatState: response.data['repeat_state']
        }
        player.SetMetadata(playerState);
        player.ShowHidePlayPause(playerState);
        player.UpdateShuffleButton(playerState);
        player.UpdateRepeatButton(playerState);
    },
    SetMetadata: (playerState) => {
        metadata.artistLabel.innerHTML = playerState.artist ?? "";
        metadata.songLabel.innerHTML = playerState.song ?? "";
        metadata.albumArtImg.src = playerState.albumArtUrl ?? "";
    },
    ShowHidePlayPause: (playerState) => {
        if (playerState.isPlaying) {
            inputs.pauseButton.style.display = 'initial';
            inputs.playButton.style.display = 'none';
        }
        else {
            inputs.pauseButton.style.display = 'none';
            inputs.playButton.style.display = 'initial';
        }
    },
    UpdateShuffleButton: (playerState) => {
        if (playerState.shuffleState) {
            inputs.shuffleButton.innerHTML = 'shuffle_on';
        }
        else {
            inputs.shuffleButton.innerHTML = 'shuffle';
        }
    },
    UpdateRepeatButton: (playerState) => {
        if (playerState.repeatState == "track") {
            inputs.repeatButton.innerHTML = 'repeat_one_on';
        }
        else if (playerState.repeatState == "context") {
            inputs.repeatButton.innerHTML = 'repeat_on';
        }
        else {
            inputs.repeatButton.innerHTML = 'repeat';
        }
    }
}

initialSetup.Setup();
