const APIController = (function() {
    const clientID = '85db4bae48b546eb97603fbd30275463';
    const clientSecret = '10dfcc70cd9b4012ba5c534ca80265d0';

    // private methods


    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientID + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getTracks = async (token, songTitle) => {


        const result = await fetch(`https://api.spotify.com/v1/search?q=track%3A${songTitle}&type=track&market=US&limit=12&offset=0`, {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' + token
            }
        });
        const data = await result.json();
        return data.tracks.items;
    }

    const _getTrack = async(token, id) => {
        const result = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' + token
            }
        });
        const data = await result.json();
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getTracks(token, songTitle) {
            return _getTracks(token, songTitle);
        },
        getTrack(token, id){
            return _getTrack(token, id);
        }

    }

})();


const UIController = (function() {
    // object to hold references to


    const DOMElements = {

        songs: '#songs',
        song : '#search-bar',
        data: '#lyrics',
        submitButton : '#button',
        hfToken: '#hidden_token',
        hfSong: '#hidden_song_title',
        listItem: '.list-item',
        songButton: '.song-button'
    }


    //public methods
    return {
        inputField() {
            return {
                songTitle: document.querySelector(DOMElements.song),
                songs: document.querySelector(DOMElements.songs),
                button: document.querySelector(DOMElements.submitButton),
                data: document.querySelector(DOMElements.data),
                listItem: document.querySelector(DOMElements.listItem),
                songButton: document.querySelector(DOMElements.songButton)
            }
        },
        createTrack(name, artist, img, id) {
            const html = `
            <button class="song-button" value="${id}">
                            <p style="display:none">${id}</p>
                            <a href="#">${name} <br> By: ${artist}</a>
                            <img src="${img}" class="list-item-image" value="${id}">

                        </button>`;
            
            document.querySelector(DOMElements.songs).insertAdjacentHTML('beforeend', html);

        },

        createSongData(name, artist, img, duration, popularity, date, explicit){

            html = `
    
                <div id="img-box">
                    <img class='data-image' src="${img}" alt="">
                </div>
                <div id="song-metaData">
                    <h2>Artist: ${artist}</h2>
                    <h2>Name: ${name}</h2>
                    </h2>
                    <p>Release Date: ${date}</p>
                    <p>Duration: ${duration} </p>
                    <p>Explicit: ${explicit} </p>
                    <p>Popularity: ${popularity} </p>
                    
                </div>`;


            document.querySelector(DOMElements.data).insertAdjacentHTML('beforeend', html);

        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return{
                token: document.querySelector(DOMElements.hfToken).value
            }
        },
        storeSong(value){
            document.querySelector(DOMElements.hfSong).value = value
        },
        getStoredToken() {
            return{
                token: document.querySelector(DOMElements.hfSong).value
            }
        },
        getSongId() {
            return {
                id: document.querySelector(DOMElements.listItem).value
            }
        },

        resetSongs() {
            this.inputField().songs.innerHTML = '';
        },

        resetSongData() {
            this.inputField().data.innerHTML = '';
        }


    }
})();


const APPController = (function(UICtrl, APICtrl) {

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    // create submit button click event listener
    DOMInputs.button.addEventListener('click', async (e) => {
        e.preventDefault();

        UICtrl.resetSongs();

        const token = await APICtrl.getToken();

        const songTitle =  await DOMInputs.songTitle.value;

        

        
        UICtrl.storeToken(token);
        

        const songs = await APICtrl.getTracks(token, songTitle);


        songs.forEach(s => {
            UICtrl.createTrack(s.name, s.artists[0].name, s.album.images[1].url, s.id);
        });

    });

    const getDuration = (duration) => {
        var minutes = Math.floor(duration / 60000);
        var seconds = ((duration % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    DOMInputs.songs.addEventListener('click', async (e) => {
        e.preventDefault();

        UICtrl.resetSongData();

        const token = await APICtrl.getToken();

        const id = e.path[1].childNodes[1].innerText

        const data = await APICtrl.getTrack(token, id);

        const duration = getDuration(data.duration_ms);



        UICtrl.createSongData(data.name, data.artists[0].name, data.album.images[0].url, duration, data.popularity, data.album.release_date, data.explicit);


    });

    return {
        init() {
            console.log('App is starting');
            
        }
    }
})(UIController, APIController);


APPController.init();
