var got = require('got');
var walk = require('walk');
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

// Walk the directory tree and look for .mp3 files
function walkTree(path) {
    var files = [];
    var mp3Files = [];

    var walker = walk.walk(path, {followLinks: false});

    walker.on('file', function (root, stat, next) {
        files.push(root + '/' + stat.name);
        next();
    });

    walker.on('end', function () {
        for (var i = 0; i < files.length; i++) {
            if (/.mp3$/.test(files[i])) {
                mp3Files.push(files[i]);
            }
        }
        console.log(mp3Files);
    });
}
