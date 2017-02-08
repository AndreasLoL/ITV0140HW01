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

$(document).on("pagebeforeshow","#search-page",function(){
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