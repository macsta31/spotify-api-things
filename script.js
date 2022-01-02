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
        console.log(songTitle);

        const result = await fetch(`https://api.spotify.com/v1/search?q=track%3A${songTitle}&type=track&market=ES&limit=10&offset=5`, {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' + token
            }
        });
        const data = await result.json();
        return data.tracks.items;
    }

    return {
        getToken() {
            return _getToken();
        },
        _getTracks(token, songTitle) {
            return _getTracks(token, songTitle);
        }
    }

})();


const UIController = (function() {
    // object to hold references to


    const DOMElements = {

        songs: '#songs',
        song : '#search-bar',
        submitButton : '#button',
        dataBox : '#data-box',
        hfToken: '#hidden_token',
        hfSong: '#hidden_song_title'
    }


    //public methods
    return {
        inputField() {
            return {
                songTitle: document.querySelector(DOMElements.song),
                songs: document.querySelector(DOMElements.songs),
                button: document.querySelector(DOMElements.submitButton),
                data: document.querySelector(DOMElements.dataBox),
            }
        },
        createTrack(name, artist) {
            const html = `<a href="#" class="list-item">${name} <br> By: ${artist}</a>`;
            document.querySelector(DOMElements.songs).insertAdjacentHTML('beforeend', html);
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

        resetSongs() {
            this.inputField().songs.innerHTML = '';
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
        console.log(songTitle);
        

        
        UICtrl.storeToken(token);
        

        const songs = await APICtrl._getTracks(token, songTitle);


        songs.forEach(s => {
            UICtrl.createTrack(s.name, s.artists[0].name);
        });

    });

    return {
        init() {
            console.log('App is starting');
            
        }
    }
})(UIController, APIController);


APPController.init();
