/**
 * Created by ANDREAS on 04.02.2017.
 */

var movies = [];

$.ajax({
    type: "GET",
    dataType: "json",
    url: "https://cinemalife.herokuapp.com/movies/upcoming",
    success: function(data){
        $.each(data, function(i, movie){
            movies.push(movie);
            var id = movie["uniqueID"];
            $('#trending-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#" data-parm="ayy"><img src="' + movie["logoURL"] +'"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p></a><a href="#modify" data-transition="pop" data-icon="edit">Modify</a></li>').listview('refresh')
        });
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
    url: "https://cinemalife.herokuapp.com/movies/trending",
    success: function(data){
        $.each(data, function(i, movie){
            movies.push(movie);
            var id = movie["uniqueID"];
            $('#upcoming-list').append('<li><a onclick="loadMovieView(' + id + ')" href="#"><img src="' + movie["logoURL"] +'"><h2>' + movie["title"] + '</h2><p>' + movie["description"] + '</p></a><a href="#modify" data-transition="pop" data-icon="edit">Modify</a></li>').listview('refresh')
        });
        console.log(movies)
    },
    error : function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
        console.log(textStatus);
        console.log(jqXHR);
    }
});

function loadMovieView(id) {
    $.mobile.navigate("movieview.html?id="+ id, { transition: "slide", changeHash: true });
}