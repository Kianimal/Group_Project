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

//API Keys
var PRIV_KEY = "719b06e810e889c309ae3d338ec2165637a414b5";
var PUBLIC_KEY = "f8e858e24706311bfa54317c9a8f43c2";
var movieKEY = "4a96b10d";

//search val
var searchString = "iron+man";

var marvelUrl = 'https://gateway.marvel.com/v1/public/characters?name=' + searchString;

//Display data
var thumbnail_char; //thumbnail image of the character
var thumbnail_1;    //thumbnail image for the first comic
var thumbnail_2;    //thumbnail image for the second comic
var thumbnail_3;    //thumbnail image for the third comic
var charBio; //text description of the character

function getMarvel(url) {

    // Used to create an encrypted hash to send to Marvel as required by their API
    var ts = new Date().getTime();
    var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();

    $.getJSON(url, {
        ts: ts,
        apikey: PUBLIC_KEY,
        hash: hash
        })
        .done(function(data) {
        // sort of a long dump you will need to sort through
            console.log(data);
            getCharData(data);
            getComicImg(data);
        })
        .fail(function(err){
        // the error codes are listed on the dev site
        console.log(err);
        });
};

function getThumbnail(data){
    var holder = data.data.results[0].thumbnail.path + "." + data.data.results[0].thumbnail.extension;
    return holder;
};

function getCharData(data){
    thumbnail_char = $("<img>");
    thumbnail_char.attr("src",getThumbnail(data));
    var info = data.data.results[0].description;
    charBio = $("<p>");
    charBio.text(info);
};

function getComicImg(data){
    thumbnail_1 = $("<img>");

    thumbnail_char.attr("src",data.data.results[0].thumbnail.path + "." + 
                        data.data.results[0].thumbnail.extension);

    // var comicUrl = data.data.results[0].comics.items[0].resourceURI;
};

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

        for(i=0;i<response.Search.length;i++){
            var title = response.Search[i].Title;
            if(title.includes(searchString)){
                console.log(title);
            }
        }
    });
};

getMovies();
getMarvel(marvelUrl);