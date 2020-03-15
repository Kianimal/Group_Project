//Firebase config

var firebaseConfig = {
    apiKey: "AIzaSyBbGk5Fx5bNpLW3xAg_p4NBtjkr-oA-1tY",
    authDomain: "fir-tutorialproject-36349.firebaseapp.com",
    databaseURL: "https://fir-tutorialproject-36349.firebaseio.com",
    projectId: "fir-tutorialproject-36349",
    storageBucket: "fir-tutorialproject-36349.appspot.com",
    messagingSenderId: "401228501941",
    appId: "1:401228501941:web:74c55348e3ac1f08c37ffc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

//Private Key obfuscation
function getMarvelData(){
    database.ref().on("value", function(snapshot){
        callMarvelApi(marvelUrl,snapshot.val().prk);
    });
};

//Public API keys for Marvel and OMDB
var PUBLIC_KEY = "f8e858e24706311bfa54317c9a8f43c2";
var movieKEY = "4a96b10d";

//Search value
var searchString = "iron+man";

//Marvel URL. Hard coded, will need a more dynamic solution.
var marvelUrl = 'https://gateway.marvel.com/v1/public/characters?name=' + searchString;

//Display data
var thumbnail_char; //thumbnail image of the character
var thumbnail_1;    //thumbnail image for the first comic
var thumbnail_2;    //thumbnail image for the second comic
var thumbnail_3;    //thumbnail image for the third comic
var charBio; //text description of the character

function callMarvelApi(url,PRIV_KEY) {

    // Used to create an encrypted hash to send to Marvel as required by their API
    var ts = new Date().getTime();
    var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();

    // Same as .ajax call but with more predefined parameters.
    $.getJSON(url, {
        ts: ts,
        apikey: PUBLIC_KEY,
        hash: hash
        })
        .done(function(data) {
        // Once the call completes we look at the whole dump to see what we want.
            console.log(data);
            getCharBio(data);
            getComicImg(data);
            getThumbnail(data);
        })
        .fail(function(err){
        // Error codes are listed on the site but they're pretty self-explanatory
        console.log(err);
        });
};

// Gets the thumbnails for characters and comics.
function getThumbnail(data){
    var img = data.data.results[0].thumbnail.path + "." + data.data.results[0].thumbnail.extension;
    console.log(img);
    return img;
};

// Gets the character bio data.
function getCharBio(data){
    var info = data.data.results[0].description;
    console.log(info);
    return info;
};

// Will display the character data. Needs append functionality, but we will work on that together.
// function displayCharData(){
//     thumbnail_char = $("<img>");
//     thumbnail_char.attr("src",getThumbnail(data));
//     charBio = $("<p>");
//     charBio.text(getCharBio(data));
// }

// Gets comic thumbnail images
function getComicImg(data){
    thumbnail_1 = $("<img>");
    thumbnail_1.attr("src",data.data.results[0].thumbnail.path + "." + 
                        data.data.results[0].thumbnail.extension);
};


//OMDB functionality. Should be cleaned up a little, but that's less important for now.
function getMovies(){

    var movieUrl = 'http://www.omdbapi.com/?s=' + searchString + '&apikey=';

    $.ajax({
        url: movieUrl + movieKEY,
    }).done(function(response) {
        console.log(response);
        var arr = searchString.split("+");

        for(i=0;i<arr.length;i++){
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
        };

        searchString = arr.join(" ");
        console.log("Search string: " + searchString);

        //Checks against titles to make sure they are relevant, hopefully.
        for(i=0;i<response.Search.length;i++){
            var title = response.Search[i].Title;
            if(title.includes(searchString)){
                console.log(title);
            }
        }
    });
};

getMovies();
getMarvelData();
// getMarvel(marvelUrl);