/**
 * Created by ANDREAS on 04.02.2017.
 */

var movies = [];
var trending = [];
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
                    $('#trending-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#" data-parm="ayy"><img src="' + movie["logoURL"] +'"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p></a><a href="#modify" data-transition="pop" data-icon="edit">Modify</a></li>').listview('refresh')
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
                    $('#upcoming-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#"><img src="' + movie["logoURL"] +'"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p></a><a href="#modify" data-transition="pop" data-icon="edit">Modify</a></li>').listview('refresh')
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

$(document).on("pagebeforeshow","#trending-page",function(){ // When entering pagetwo
    if ($('#top-list').find('li').size() == 0) {
        if (trending.length == 0) {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "https://cinemalife.herokuapp.com/movies/trending",
                success: function(data){
                    trending = data;
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
    }
});

function fillTopList() {
    console.log("fill called");
    for (var i = 0; i < 3; i++) {
        if (i < trending.length) {
            var movie = trending[i];
            var id = movie["uniqueID"];
            $('#top-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#"><img src="' + movie["logoURL"] +'"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p></a><a href="#modify" data-transition="pop" data-icon="edit">Modify</a></li>').listview('refresh')
        }
    }
}