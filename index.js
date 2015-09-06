var got = require('got');
window.$ = window.jQuery = require('./jquery.min.js');

$("#songForm").submit(function (event) {
    itunesFetch($('#songName').val());
    event.preventDefault();
});


function itunesFetch(data) {
    got('https://itunes.apple.com/search?term=' + data, {json: true}, function (err, data, res) {
        var artworkUrl = data.results[0].artworkUrl100.replace('100x100', '150x150');
        $('#artwork').attr('src', artworkUrl);
        $('#song').text((data.results[0].trackName));
        $('#genre').text((data.results[0].primaryGenreName));
        $('#album').text((data.results[0].collectionName));
        $('#artist').text((data.results[0].artistName));
        $('#released').text((data.results[0].releaseDate));
    });
}
