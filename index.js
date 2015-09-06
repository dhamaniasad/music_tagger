var got = require('got');
window.$ = window.jQuery = require('./jquery.min.js');

$("#songForm").submit(function (event) {
    itunesFetch($('#songName').val());
    event.preventDefault();
});


function itunesFetch(data) {
    got('https://itunes.apple.com/search?term=' + data, {json: true}, function (err, data, res) {
        $('#artwork').attr('src', data.results[0].artworkUrl100);
        $('#song').text((data.results[0].trackName));
        $('#album').text((data.results[0].collectionName));
        $('#artist').text((data.results[0].artistName));
        $('#released').text((data.results[0].releaseDate));
    });
}
