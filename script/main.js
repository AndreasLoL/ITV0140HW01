/**
 * Created by ANDREAS on 04.02.2017.
 */

var upcomingMoviesLoaded = false;
var trendingMoviesLoaded = false;
var movieInformation;

var api_key = "16e23eaf0dd6d6eaef45c66aad2bc97c";

function notifyDataLoaded() {
    if (upcomingMoviesLoaded && trendingMoviesLoaded) {
        $("#loader-div").css("display", "none");
        $("#content-div").css("display", "inline");
    }
}

function moviesToListView(movieList, listID, limit) {
    $.each(movieList.slice(0, limit), function(i, movie){
        var id = movie["id"];
        var title = movie["original_title"];
        var rating = movie["vote_average"] + "/10";
        if (rating == "0/10") {
            rating = "Coming Soon"
        }
        var description = movie["overview"];
        var release_date = convertDateToCorrectForm(movie["release_date"]);
        var logoURL = "http://image.tmdb.org/t/p/w185" + movie["poster_path"];
        $(listID).append('<li><a onclick="loadMovieView(' + id + ')" href="#">' +
            '<img src="' + logoURL +'"><h2>' + title + '</h2><p>' + description + '</p>' +
            '<p class="ui-li-aside" style="line-height: 110px" "><strong>' + release_date + " " + rating + '</strong></p>' +
            '</a></li>').listview('refresh')
    });
}

$(document).on("pagebeforeshow","#pageone",function(){
    if (!trendingMoviesLoaded || !upcomingMoviesLoaded) {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "https://api.themoviedb.org/3/movie/now_playing?api_key=" + api_key + "&language=en-US&page=1&region=US",
            success: function(data){
                moviesToListView(data["results"], "#trending-list", 5);
                trendingMoviesLoaded = true;
                notifyDataLoaded();
            },
            error : function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });

        $.ajax({
            type: "GET",
            dataType: "json",
            url: "https://api.themoviedb.org/3/movie/upcoming?api_key=" + api_key + "&language=en-US&page=1&region=US",
            success: function(data){
                moviesToListView(data["results"], "#upcoming-list", 10);
                upcomingMoviesLoaded = true;
                notifyDataLoaded();
            },
            error : function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

});

function loadMovieView(id) {
    $.mobile.navigate("#movie-view?id="+ id, { transition: "slide", changeHash: true });
}

function showTopList() {
    $("#top-loader-div").css("display", "none");
    $("#top-content-div").css("display", "inline");
}
$(document).on("pagebeforeshow","#trending-page",function(){
    if ($('#top-list').find('li').size() == 0) {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "https://api.themoviedb.org/3/movie/top_rated?api_key=" + api_key +"&language=en-US&page=1",
                success: function(data){
                    var allResults = data["results"];
                    moviesToListView(allResults, "#top-list", 20);
                    showTopList();
                },
                error : function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            });
    } else {
        showTopList();
    }
});

$(document).on("pagebeforeshow","#search-page",function(){
    $('#search-basic').keyup(function(event) {
        if (event.which === 13) {
            $(this).blur();
            var searchURL = "http://api.themoviedb.org/3/search/movie?api_key=16e23eaf0dd6d6eaef45c66aad2bc97c&query=" + encodeURIComponent($("#search-basic").val());
            $.ajax({
                type: "GET",
                dataType: "json",
                url: searchURL,
                success: function(data){
                    $('#search-result-list').empty();
                    var allResults = data["results"];
                    moviesToListView(allResults, "#search-result-list", 20);
                },
                error : function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            });
        }
    });
});

$(document).on("pagebeforeshow","#watch-list-page",function(){
    $('#watch-list-list').empty();
    var watchList = sortAlphabetically(JSON.parse(localStorage.getItem("watch-list")));
    moviesToListView(watchList, "#watch-list-list", 100);
});

$(document).on("pagebeforeshow","#watched-movies-page",function(){
    $('#watched-movies-list').empty();
    var watchedList = sortAlphabetically(JSON.parse(localStorage.getItem("watched-movies-list")));
    moviesToListView(watchedList, "#watched-movies-list", 100);
});

$(document).on("pagebeforeshow","#movie-view",function(){
    var urlParameter = getUrlParameter("id");
    var watchList = getWatchList();
    var watchedList = getWatchedMoviesList();

    if (jsonArrayContains(watchedList, getUrlParameter("id"), "id")) {
        movieInformation = findPageDataFromMemory(watchedList,urlParameter);
        dataToPageInformation(movieInformation);
    } else if (jsonArrayContains(watchList, getUrlParameter("id"), "id")) {
        movieInformation = findPageDataFromMemory(watchList,urlParameter);
        dataToPageInformation(movieInformation);
    } else {
        $("#loader-div-mv").css("display", "inline");
        $("#content-div-mv").css("display", "none");
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "https://api.themoviedb.org/3/movie/" + getUrlParameter('id') + "?api_key=" + api_key + "&append_to_response=videos,casts",
            success: function(data){
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
});

$(document).on("pagehide","#movie-view",function(){
    var src= $("#video").attr('src');
    $("#video").attr('src',src);
});

function getUrlParameter(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}

function findPageDataFromMemory(movieList, searchID) {
    var foundMovie = "";
    $.each(movieList, function(i, movie){
        var id = movie["id"];
        if (id == searchID) {
            foundMovie = movie;
        }
    });

    return foundMovie;
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
    console.log(data);
    $("#video").attr("src", convertStringToEmbed(data["videos"]["results"][0]["key"]));
    $("#title").text(data["original_title"]);
    $("#description").text(data["overview"]);
    $("#logo").attr("src", "http://image.tmdb.org/t/p/w185" + data["poster_path"]);
    $("#rating").text("Rating: " + data["vote_average"] + "/10");
    $("#release-date").text("Release date: " + convertDateToCorrectForm(data["release_date"]));
    $("#vote-count").text("Votes: " + data["vote_count"]);
    $("#genres").text("Genres:" + genresToString(data["genres"]));
    var castAsString = castToString(data["casts"]["cast"]);
    $("#cast").text("Cast: " + castAsString.substring(0, castAsString.length - 2));
    $("#loader-div-mv").css("display", "none");
    $("#content-div-mv").css("display", "inline");
    generateCorrectControlButtons();
}

function genresToString(listOfGenres) {
    var genreAsString = "";
    $.each(listOfGenres, function(i, genre){
        genreAsString += " " + genre["name"];
    });

    return genreAsString;
}

function castToString(listOfCast) {
    var castAsString = "";
    console.log(listOfCast);
    $.each(listOfCast.slice(0, 10), function(i, actor){
        castAsString += actor["name"] + ", ";
    });

    return castAsString;
}

function sortByDate(watchedList) {
    watchedList.sort(function (a, b) {
        var date1 = new Date(convertStringToCorrectDateFormat(a["release_date"]));
        var date2 = new Date(convertStringToCorrectDateFormat(b["release_date"]));
        if (date1 > date2) {
            return 1;
        } else {
            return -1;
        }
    });

    return watchedList;
}

function convertDateToCorrectForm(date) {
    var splitDate = date.split("-");
    return splitDate[1] + "/" + splitDate[2] + "/" + splitDate[0];
}

function sortByRating(watchedList) {
    watchedList.sort(function (a, b) {
        if (a["rating"] == 0) {
            return 1;
        } else if (b["vote_average"] == 0) {
            return -1;
        } else {
            var rating1 = parseFloat(a["vote_average"]);
            var rating2 = parseFloat(b["vote_average"]);
            if (rating1 < rating2) {
                return 1;
            } else {
                return -1;
            }
        }
    });

    return watchedList;
}

function sortAlphabetically(watchedList) {
    if (watchedList == null) {
        return [];
    }

    watchedList.sort(function (a, b) {
        if (a["original_title"] <  b["original_title"]) {
            return -1;
        } return 1;
    });

    return watchedList;
}


function getWatchedMoviesList() {
    if (localStorage.getItem("watched-movies-list") == null || localStorage.getItem("watched-movies-list").length == 0) {
        localStorage.setItem("watched-movies-list", "[]");
    }
    return JSON.parse(localStorage.getItem("watched-movies-list"));
}

function getWatchList() {
    if (localStorage.getItem("watch-list") == null || localStorage.getItem("watch-list").length == 0) {
        localStorage.setItem("watch-list", "[]");
    }
    return JSON.parse(localStorage.getItem("watch-list"));
}

$('#watched-list-sorter').change(function () {
    var sort = $(this).val();
    var watchedList = getWatchedMoviesList();
    var sortedWatchedList;

    if (watchedList == null || watchedList.length <= 1) {
        return;
    }

    if (sort == "release-date") {
        sortedWatchedList = sortByDate(watchedList);
    } else if (sort == "rating") {
        sortedWatchedList = sortByRating(watchedList);
    } else if (sort == "alphabetically") {
        sortedWatchedList = sortAlphabetically(watchedList);
    }

    $("#watched-movies-list").empty();
    moviesToListView(sortedWatchedList, "#watched-movies-list", 100);
});

$('#watch-list-sorter').change(function () {
    var sort = $(this).val();
    var watchedList = getWatchList();
    var sortedWatchlist;

    if (watchedList == null || watchedList.length <= 1) {
        return;
    }

    if (sort == "release-date") {
        sortedWatchlist = sortByDate(watchedList);
    } else if (sort == "rating") {
        sortedWatchlist = sortByRating(watchedList);
    } else if (sort == "alphabetically") {
        sortedWatchlist = sortAlphabetically(watchedList);
    }
    $("#watch-list-list").empty();
    moviesToListView(sortedWatchlist, "#watch-list-list", 100);
});

function convertStringToCorrectDateFormat(dateAsString) {
    var parts = dateAsString.split("-");
    return new Date(parts[0], parts[1], parts[2])
}

function convertStringToEmbed(url) {
    return "https://www.youtube.com/embed/" + url + "?autoplay=0";
}

function addToWatchList() {
    var watchList = getWatchList();
    if (!jsonArrayContains(watchList, movieInformation["original_title"], "original_title")) {
        watchList.push(movieInformation);
        localStorage.setItem("watch-list", JSON.stringify(watchList));
        generateCorrectControlButtons()
    }
}

function removeFromWatchList() {
    var watchList = getWatchList();
    if (jsonArrayContains(watchList, movieInformation["original_title"], "original_title")) {
        var index = watchList.indexOf(movieInformation);
        watchList.splice(index, 1);
        localStorage.setItem("watch-list", JSON.stringify(watchList));
        generateCorrectControlButtons()
    }
}

function removeFromWatchedMoviesList() {
    var watchedMoviesList = getWatchedMoviesList();
    if (jsonArrayContains(watchedMoviesList, movieInformation["original_title"], "original_title")) {
        var index = watchedMoviesList.indexOf(movieInformation);
        watchedMoviesList.splice(index, 1);
        localStorage.setItem("watched-movies-list", JSON.stringify(watchedMoviesList));
        generateCorrectControlButtons()
    }
}

function addToWatchedMoviesList() {
    var watchedMoviesList = getWatchedMoviesList();
    if (!jsonArrayContains(watchedMoviesList, movieInformation["original_title"], "original_title")) {
        watchedMoviesList.push(movieInformation);
        localStorage.setItem("watched-movies-list", JSON.stringify(watchedMoviesList));
        generateCorrectControlButtons()
    }
}