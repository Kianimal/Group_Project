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

//Public API keys for Marvel and OMDB
var pubKEY = "f8e858e24706311bfa54317c9a8f43c2";
var movieKEY = "4a96b10d";

// List of heroes to randomly display on page load
var avengersList = ["iron+man",
                    "captain+america",
                    "thor",
                    "hulk",
                    "scarlet+witch",
                    "black+widow",
                    "vision"];

var thumbnails = [];
var comicUrls = [];

// Randomly selected initial display hero
var selected = avengersList[Math.floor(Math.random()*avengersList.length)];

//Search value
var searchString = selected;

//Marvel character search URL
var marvelUrl = 'https://gateway.marvel.com/v1/public/characters?name=' + searchString;

//Private Key obfuscation
function callMarvelBio(marvelUrl){
    database.ref().once("value", function(snapshot){
        callBioApi(marvelUrl,snapshot.val().prk);
    });
};

function callMarvelComics(comicUrls){
    database.ref().once("value", function(snapshot){
        $("#comicDisplayArea").empty();
        for(i=0;i<comicUrls.length;i++){
            callComicsApi(comicUrls[i],snapshot.val().prk);
        }
    });
};

//Display data
function callBioApi(url,privKEY) {

    // Used to create an encrypted hash to send to Marvel as required by their API
    var ts = new Date().getTime();
    var hash = CryptoJS.MD5(ts + privKEY + pubKEY).toString();

    // Same as .ajax call but with more predefined parameters.
    $.getJSON(url, {
        ts: ts,
        apikey: pubKEY,
        hash: hash
        })
        .done(function(data) {
        // Once the call completes we look at the whole dump to see what we want.
            console.log(data);
            appendCharBio(data);
            getComicUrls(data);
            callMarvelComics(comicUrls);
        })
        .fail(function(err){
        // Error codes are listed on the site but they're pretty self-explanatory
        console.log(err);
        console.log("error calling characterApi");
        });
};

function callComicsApi(url,privKEY) {

    // Used to create an encrypted hash to send to Marvel as required by their API
    var ts = new Date().getTime();
    var hash = CryptoJS.MD5(ts + privKEY + pubKEY).toString();

    // Same as .ajax call but with more predefined parameters.
    $.getJSON(url, {
        ts: ts,
        apikey: pubKEY,
        hash: hash
        })
        .done(function(data) {
        // Once the call completes we look at the whole dump to see what we want.
            console.log(data);
            appendComics(data);
        })
        .fail(function(err){
        // Error codes are listed on the site but they're pretty self-explanatory
        console.log(err);
        console.log("error calling comicsApi");
        });
};

// Append character biography
function appendCharBio(data){
    var charBio = document.getElementById("pBio");
    var nameText = data.data.results[0].name;
    var bioText = data.data.results[0].description;
    $(charBio).text(bioText);
    if (bioText == ""){
        backupBioData(data);
    }

    var thumbnail_char = document.getElementById("bioPic");
    $(thumbnail_char).attr("src",data.data.results[0].thumbnail.path + "." + 
                                data.data.results[0].thumbnail.extension);
    $(".name").text(nameText);
};

function appendComics(data){
        var comicLink = $("<a>");
        comicLink.attr("href",data.data.results[0].urls[0].url);
        comicLink.attr("target","new");

        var comicDiv = $("<div>");
        $(comicDiv).attr("class","comicImgContainer");

        var comicImg = $("<img>");
        $(comicImg).attr("src",data.data.results[0].thumbnail.path + "." +
                        data.data.results[0].thumbnail.extension);
        $(comicImg).attr("class","comicImg")

        $("#comicDisplayArea").append(comicLink);
        comicLink.append(comicDiv);
        comicDiv.append(comicImg);
}

// Gets comic thumbnail images
function getComicUrls(data){
    for(i=0;i<9;i++){
        comicUrls[i] = data.data.results[0].comics.items[i].resourceURI;
        comicUrls[i] = comicUrls[i].split(":");
        comicUrls[i] = comicUrls[i].join("s:");
    }
};

//OMDB functionality. Should be cleaned up a little, but that's less important for now.
function getMovies(){

    var movieUrl = 'https://www.omdbapi.com/?s=' + searchString + '&apikey=';

    $.ajax({
        url: movieUrl + movieKEY,
    }).done(function(response) {
        console.log(response);
        var arr = searchString.split("+");

        for(i=0;i<arr.length;i++){
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
        };

        searchString = arr.join(" ");

        //Checks against titles to make sure they are relevant, hopefully.
        //Prints 3 relevant titles to the console.
        var j=0;
        $("#moviePosters").empty();
        for(i=0;i<response.Search.length;i++){
            var title = response.Search[i].Title;
            var posterURL = response.Search[i].Poster;
            
            if(j<10){
                if(title.includes(searchString)){
                    console.log(title);
                    console.log(posterURL)
                    j++;

                    // Creating an element to hold the image
                    var image = $("<img>").attr("src", posterURL);

                    // Putting the entire movie above the previous movies
                    $("#moviePosters").append(image);
                }
            }
        }
    });
};

// Many characters have blank description info, for some reason.
// In this case, the marvel wiki link is given instead
// with an explanation that the Marvel API does not provide this data.
function backupBioData(data){
    var bioText = data.data.results[0].urls[1].url.split("?");
    var bioMsg = "Whoops! Sorry, sometimes the Marvel API is lacking in data. " + 
                "Looks like this is one of those times. Here is a link to this character's Marvel page.";
    var bioLink = $("<a>");
    bioLink.attr("href",bioText[0] + "?");
    bioLink.attr("target","new");
    bioLink.text("Click here for the wiki page.");
    $("#pBio").text(bioMsg);
    $("#pBio").append('<br/>');
    $("#pBio").append(bioLink);
};

// Search functionality on search button click
$("#btnSub").on("click", function(event){
    event.preventDefault();
    searchString = document.getElementById("searchBar").value;
    console.log(searchString);
    marvelUrl = 'https://gateway.marvel.com/v1/public/characters?name=' + searchString;
    console.log(marvelUrl);
    callMarvelBio(marvelUrl);
    getMovies();
});
$("#searchBar").keypress(function(e){
    if(e.which==13){
        event.preventDefault();
        searchString = document.getElementById("searchBar").value;
        console.log(searchString);
        marvelUrl = 'https://gateway.marvel.com/v1/public/characters?name=' + searchString;
        console.log(marvelUrl);
        callMarvelBio(marvelUrl);
        getMovies();
    }
});
var searchArray = [];
var searchTerm = "";

$(document).ready(function () {
    updateRecents();
})

$(document).on("click", "#btnSub", function () {
    event.preventDefault();
    addInput();    
    updateRecents();
    document.getElementById("heroSearch").reset();
    return false;
})

$(document).on("keypress", "#searchBar", function(e) {
    if(e.which==13){
        e.preventDefault();
        addInput();    
        updateRecents();
        document.getElementById("heroSearch").reset();
        return false;
    }
})

$(document).on("click", "#clearHist", function () {
    clearRecents();
})

function addInput () {
    searchTerm = $("#searchBar").val().trim();
    searchArray.unshift(searchTerm); 
    sessionStorage.setItem("searches", JSON.stringify(searchArray));
}

function updateRecents () {
    var newArray = JSON.parse(sessionStorage.getItem("searches"));
    console.log(newArray);
    $("#searchesAdded").empty();
    if(newArray != null){
        for (var i = 0; i < newArray.length; i++) {
            $("#searchesAdded").append(newArray[i] + "<br>");
        };
    };
}

function clearRecents () { 
    $("#searchesAdded").empty();
    sessionStorage.clear();
};

callMarvelBio(marvelUrl);
getMovies();