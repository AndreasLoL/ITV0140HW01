
/**
 * Created by ANDREAS on 05.02.2017.
 */


var movieInformation;
var watchList = getWatchList();
var watchedList = getWatchedMoviesList();
var urlParameter = getUrlParameter("id");


if (jsonArrayContains(watchedList, getUrlParameter("id"), "uniqueID")) {
    movieInformation = findPageDataFromMemory(watchedList,urlParameter);
    dataToPageInformation(movieInformation);
} else if (jsonArrayContains(watchList, getUrlParameter("id"), "uniqueID")) {
    console.log("local2");
    movieInformation = findPageDataFromMemory(watchList,urlParameter);
    dataToPageInformation(movieInformation);
} else {
    $("#loader-div-mv").css("display", "inline");
    $("#content-div-mv").css("display", "none");
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "https://cinemalife.herokuapp.com/movies/" + getUrlParameter('id'),
        success: function(data){
            console.log("online");
            movieInformation = data;
            dataToPageInformation(data);
        },
        error : function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jqXHR);
        }
    });
}




function findPageDataFromMemory(movieList, searchID) {
    var foundMovie = "";
    $.each(movieList, function(i, movie){
        var id = movie["uniqueID"];
        if (id == searchID) {
            foundMovie = movie;
        }
    });

    return foundMovie;
}

function generateCorrectControlButtons() {
    $("#control-btns").empty();
    var watchList = getWatchList();
    if (jsonArrayContains(watchList, movieInformation["title"], "title")) {
        $("#control-btns").append('<a href="#" onclick="removeFromWatchList()" class="ui-btn">Remove From Watch List</a>')
    } else {
        $("#control-btns").append('<a href="#" onclick="addToWatchList()" id="add-to-watch-list" class="ui-btn">Add To Watch List</a>');
    }

    var watchedMoviesList = getWatchedMoviesList();
    if (jsonArrayContains(watchedMoviesList, movieInformation["title"], "title")) {
        $("#control-btns").append('<a href="#" onclick="removeFromWatchedMoviesList()" class="ui-btn">I Have Not Watched This Movie</a>');
    } else {
        $("#control-btns").append('<a href="#" onclick="addToWatchedMoviesList()" class="ui-btn">I Have Seen This Movie</a>');
    }
}

function dataToPageInformation(data) {
    $("#title").text(data["title"]);
    $("#description").text(data["description"]);
    $("#logo").attr("src", data["logoURL"]);
    $("#video").attr("src", convertStringToEmbed(data["videoURL"]));
    $("#rating").text("Rating: " + data["rating"]);
    $("#release-date").text("Release date: " + data["releaseDate"]);
    $("#loader-div-mv").css("display", "none");
    $("#content-div-mv").css("display", "inline");
    generateCorrectControlButtons();
}

function getUrlParameter(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}

function convertStringToEmbed(url) {
    return url.replace("watch?v=", "embed/");
}

function getWatchList() {
    if (localStorage.getItem("watch-list") == null || localStorage.getItem("watch-list").length == 0) {
        localStorage.setItem("watch-list", "[]");
    }
    return JSON.parse(localStorage.getItem("watch-list"));
}

function getWatchedMoviesList() {
    if (localStorage.getItem("watched-movies-list") == null || localStorage.getItem("watched-movies-list").length == 0) {
        localStorage.setItem("watched-movies-list", "[]");
    }
    return JSON.parse(localStorage.getItem("watched-movies-list"));
}


function addToWatchList() {
    var watchList = getWatchList();
    if (!jsonArrayContains(watchList, movieInformation["title"], "title")) {
        watchList.push(movieInformation);
        localStorage.setItem("watch-list", JSON.stringify(watchList));
        generateCorrectControlButtons()
    } else {
        console.log("already added movie");
    }
}

function removeFromWatchList() {
    var watchList = getWatchList();
    if (jsonArrayContains(watchList, movieInformation["title"], "title")) {
        var index = watchList.indexOf(movieInformation);
        watchList.splice(index, 1);
        localStorage.setItem("watch-list", JSON.stringify(watchList));
        generateCorrectControlButtons()
    } else {
        console.log("already added movie");
    }
}

function removeFromWatchedMoviesList() {
    var watchedMoviesList = getWatchedMoviesList();
    if (jsonArrayContains(watchedMoviesList, movieInformation["title"], "title")) {
        var index = watchedMoviesList.indexOf(movieInformation);
        watchedMoviesList.splice(index, 1);
        localStorage.setItem("watched-movies-list", JSON.stringify(watchedMoviesList));
        generateCorrectControlButtons()
    } else {
        console.log("already added movie");
    }
}

function addToWatchedMoviesList() {
    var watchedMoviesList = getWatchedMoviesList();
    if (!jsonArrayContains(watchedMoviesList, movieInformation["title"], "title")) {
        watchedMoviesList.push(movieInformation);
        localStorage.setItem("watched-movies-list", JSON.stringify(watchedMoviesList));
        generateCorrectControlButtons()
    } else {
        console.log("already added movie to watched list");
    }
}

function jsonArrayContains(jsonArray, newTitle, jsonParam) {
    for (var i = 0; i < jsonArray.length; i++) {
        var title = jsonArray[i][jsonParam];
        if (title == newTitle) {
            return true;
        }
    }

    return false;
}