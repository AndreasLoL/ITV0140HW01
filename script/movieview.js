
/**
 * Created by ANDREAS on 05.02.2017.
 */

console.log("https://cinemalife.herokuapp.com/movies/" + getUrlParameter('id'));

$.ajax({
    type: "GET",
    dataType: "json",
    url: "https://cinemalife.herokuapp.com/movies/" + getUrlParameter('id'),
    success: function(data){
       dataToPageInformation(data)
    },
    error : function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
        console.log(textStatus);
        console.log(jqXHR);
    }
});

function dataToPageInformation(data) {
    $("#title").text(data["title"]);
    $("#description").text(data["description"]);
    $("#logo").attr("src", data["logoURL"]);
    $("#video").attr("src", convertStringToEmbed(data["videoURL"]))
    $("#rating").text("Rating: " + data["rating"]);
    $("#release-date").text("Release date: " + data["releaseDate"]);
    $("#loader-div-mv").css("display", "none");
    $("#content-div-mv").css("display", "inline");
}

function getUrlParameter(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}

function convertStringToEmbed(url) {
    return url.replace("watch?v=", "embed/");
}