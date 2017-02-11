/**
 * Created by ANDREAS on 04.02.2017.
 */

var movies = [];
var trending = [];
var sorted = [];
var upcomingMoviesLoaded = false;
var trendingMoviesLoaded = false;

function notifyDataLoaded() {
    if (upcomingMoviesLoaded && trendingMoviesLoaded) {
        console.log("notified");
        $("#loader-div").css("display", "none");
        $("#content-div").css("display", "inline");
    }
}


$(document).on("pagebeforeshow","#pageone",function(){
    if (movies.length == 0 || trending.length == 0) {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "https://cinemalife.herokuapp.com/movies/trending",
            success: function(data){
                trending = data;
                $.each(data, function(i, movie){
                    movies.push(movie);
                    var id = movie["uniqueID"];
                    $('#trending-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#" data-parm="ayy"><img src="' + movie["logoURL"] +'"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p></a></li>').listview('refresh')
                });
                trendingMoviesLoaded = true;
                notifyDataLoaded();
            },
            error : function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                console.log(textStatus);
                console.log(jqXHR);
            }
        });

        $.ajax({
            type: "GET",
            dataType: "json",
            url: "https://cinemalife.herokuapp.com/movies/upcoming",
            success: function(data){
                $.each(data, function(i, movie){
                    movies.push(movie);
                    var id = movie["uniqueID"];
                    $('#upcoming-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#"><img src="' + movie["logoURL"] +'"><h2 style="font-size: 16px;">' + movie["title"] + '</h2><p style="line-height: 15px">' + movie["description"] + '</p></a></li>').listview('refresh')
                });
                upcomingMoviesLoaded = true;
                notifyDataLoaded();
            },
            error : function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                console.log(textStatus);
                console.log(jqXHR);
            }
        });
    }

});

function loadMovieView(id) {
    $.mobile.navigate("movieview.html?id="+ id, { transition: "slide", changeHash: true });
}

function showTopList() {
    $("#top-loader-div").css("display", "none");
    $("#top-content-div").css("display", "inline");
}
$(document).on("pagebeforeshow","#trending-page",function(){
    if ($('#top-list').find('li').size() == 0) {
        if (sorted.length == 0) {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "https://cinemalife.herokuapp.com/movies/sorted",
                success: function(data){
                    sorted = data;
                    fillTopList()
                },
                error : function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                    console.log(textStatus);
                    console.log(jqXHR);
                }
            });
        } else {
            fillTopList();
        }
    } else {
        showTopList();
    }
});

function fillTopList() {
    for (var i = 0; i < 5; i++) {
        if (i < sorted.length) {
            var movie = sorted[i];
            var id = movie["uniqueID"];
            $('#top-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#"><img src="' + movie["logoURL"] +'"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p><p class="ui-li-aside" style="line-height: 110px" "><strong>' + movie["rating"] + '</strong></p></a></li>').listview('refresh')
        }
    }

    showTopList();
}

$(document).on("pagebeforeshow","#search-page2",function(){

    $('#search-basic').keyup(function(event) {
        if (event.which === 13) {
            $(this).blur();
        }
    });

    if ($('#search-result-list').find('li').size() == 0) {
        if (movies.length == 0) {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "https://cinemalife.herokuapp.com/movies/",
                success: function(data){
                    movies = data;
                    fillResultList(movies);
                },
                error : function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                    console.log(textStatus);
                    console.log(jqXHR);
                }
            });
        } else {
            fillResultList(movies)
        }
    }
});


$(document).on("pagebeforeshow","#search-page",function(){
    $('#search-basic2').keyup(function(event) {
        if (event.which === 13) {
            $(this).blur();
            var searchURL = "http://api.themoviedb.org/3/search/movie?api_key=16e23eaf0dd6d6eaef45c66aad2bc97c&query=" + encodeURIComponent($("#search-basic2").val());
            $("#search-result-list2").empty();
            $.ajax({
                type: "GET",
                dataType: "json",
                url: searchURL,
                success: function(data){
                    var allResults = data["results"];
                    $.each(allResults, function(i, movie){
                        var id = movie["id"];
                        var title = movie["original_title"];
                        var rating = movie["vote_average"] + "/10";
                        var description = movie["overview"];
                        var logoURL = "http://image.tmdb.org/t/p/w185" + movie["poster_path"];
                        $('#search-result-list2').append('<li><a onclick="loadMovieView(' + id + ')" href="#" data-parm="ayy"><img src="' + logoURL +'"><h2>' + title + " " + rating + '</h2><p>' + description + '</p></a></li>').listview('refresh')
                    });
                    trendingMoviesLoaded = true;
                    notifyDataLoaded();
                },
                error : function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                    console.log(textStatus);
                    console.log(jqXHR);
                }
            });
        }
    });
});

function fillResultList(foundMovies) {
    $('#search-result-list').empty();
    $.each(foundMovies, function(i, movie){
        var id = movie["uniqueID"];
        $('#search-result-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#"><img src="' + movie["logoURL"] +'"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p><p class="ui-li-aside" style="line-height: 110px" "><strong>' + movie["rating"] + '</strong></p></a></li>').listview('refresh')
    });
}

function updateSearchResults() {
    var input = document.getElementById("search-basic").value;
    var newMovies = [];

    for (var i = 0; i < movies.length; i++) {
        if (movies[i]["title"].toLowerCase().indexOf(input.toLowerCase()) > -1) {
            newMovies.push(movies[i]);
        }
    }

    fillResultList(newMovies);
}

$(document).on("pagebeforeshow","#watch-list-page",function(){
    $('#watch-list-list').empty();
    var watchList = JSON.parse(localStorage.getItem("watch-list"));
    $.each(watchList, function(i, movie){
        var id = movie["uniqueID"];
        $('#watch-list-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#"><img src="' + movie["logoURL"] +'"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p><p class="ui-li-aside" style="line-height: 110px" "><strong>' + movie["rating"] + '</strong></p></a></li>').listview('refresh')
    });
});

$(document).on("pagebeforeshow","#watched-movies-page",function(){
    $('#watched-movies-list').empty();
    var watchedList = sortAlphabetically(JSON.parse(localStorage.getItem("watched-movies-list")));
    $.each(watchedList, function(i, movie){
        var id = movie["uniqueID"];
        $('#watched-movies-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#"><img src="' + movie["logoURL"] +'"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p><p class="ui-li-aside" style="line-height: 110px" "><strong>' + movie["rating"] + '</strong></p></a></li>').listview('refresh')
    });
});

function sortByDate(watchedList) {
    watchedList.sort(function (a, b) {
        var date1 = new Date(convertStringToCorrectDateFormat(a["releaseDate"]));
        var date2 = new Date(convertStringToCorrectDateFormat(b["releaseDate"]));
        console.log(date1.toDateString());
        if (date1 > date2) {
            return 1;
        } else {
            return -1;
        }
    });

    return watchedList;
}

function sortByRating(watchedList) {
    watchedList.sort(function (a, b) {
        if (a["rating"] == "Coming Soon") {
            return 1;
        } else if (b["rating"] == "Coming Soon") {
            return -1;
        } else {
            var rating1 = parseFloat(a["rating"].split("/")[0]);
            var rating2 = parseFloat(b["rating"].split("/")[0]);
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
    watchedList.sort(function (a, b) {
        if (a["title"] <  b["title"]) {
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
    var sortedWatchlist;
    if (sort == "release-date") {
        sortedWatchlist = sortByDate(watchedList);
    } else if (sort == "rating") {
        sortedWatchlist = sortByRating(watchedList);
    } else if (sort == "alphabetically") {
        sortedWatchlist = sortAlphabetically(watchedList);
    }

    $("#watched-movies-list").empty();
    $.each(sortedWatchlist, function (i, movie) {
        var id = movie["uniqueID"];
        $('#watched-movies-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#"><img src="' + movie["logoURL"] + '"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p><p class="ui-li-aside" style="line-height: 110px" "><strong>' + movie["rating"] + '</strong></p></a></li>').listview('refresh')
    });
});

$('#watch-list-sorter').change(function () {
    var sort = $(this).val();
    var watchedList = getWatchList();
    var sortedWatchlist;
    if (sort == "release-date") {
        sortedWatchlist = sortByDate(watchedList);
    } else if (sort == "rating") {
        sortedWatchlist = sortByRating(watchedList);
    } else if (sort == "alphabetically") {
        sortedWatchlist = sortAlphabetically(watchedList);
    }
    $("#watch-list-list").empty();
    $.each(sortedWatchlist, function (i, movie) {
        var id = movie["uniqueID"];
        $('#watch-list-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#"><img src="' + movie["logoURL"] + '"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p><p class="ui-li-aside" style="line-height: 110px" "><strong>' + movie["rating"] + '</strong></p></a></li>').listview('refresh')
    });
});

function convertStringToCorrectDateFormat(dateAsString) {
    var parts = dateAsString.split(".");
    return new Date(parts[2], parts[1], parts[0])
}