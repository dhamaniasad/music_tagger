var got = require('got');
window.$ = window.jQuery = require('./jquery.min.js');

$("#songForm").submit(function (event) {
    itunesFetch($('#songName').val());
    event.preventDefault();
});


function itunesFetch(data) {
 got('https://itunes.apple.com/search?term=' + data, {json:true}, function (err, data, res) {
    document.write(data.results[0].artistName);
});
}

