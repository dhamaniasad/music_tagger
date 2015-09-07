var got = require('got');
var walk = require('walk');
var ipc = require('ipc');
var fs = require('fs');
// Due to Electron being a CommonJS environment, the thing below has to be done
// (https://github.com/atom/electron/issues/254)
window.$ = window.jQuery = require('./js/jquery.min.js');
var currentIndex = 0;

$("#songForm").submit(function (event) {
    itunesFetch($('#songName').val());
    event.preventDefault();
});


function itunesFetch(data) {
    got('https://itunes.apple.com/search?term=' + data, {json: true}, function (err, data, res) {
        var artworkUrl = data.results[0].artworkUrl100.replace('100x100', '150x150');
        $('#fetched_artwork').attr('src', artworkUrl);
        $('#fetched_song').text((data.results[0].trackName));
        $('#fetched_genre').text((data.results[0].primaryGenreName));
        $('#fetched_album').text((data.results[0].collectionName));
        $('#fetched_artist').text((data.results[0].artistName));
        var releaseDate = new Date(data.results[0].releaseDate);
        $('#fetched_released').text(releaseDate.getFullYear());
    });
}

// Walk the directory tree and look for .mp3 files
function walkTree(path, callback) {
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
        callback(mp3Files);
    });
}

function openFolderDialog() {
    return ipc.sendSync('synchronous-message', 'openFolderDialog');
}

$('#loadFolderBtn').on('click', function () {
    var dir = openFolderDialog();
    if (dir === null) {

    }
    else {
        var mp3Files = walkTree(dir.toString(), countUpdater);
        $('#dirPath').text('Scanning directory for MP3 files. Please wait...');
        function countUpdater(mp3Files) {
            $('#dirPath').text('Loaded ' + dir + ' with ' + mp3Files.length + ' .mp3 files');
            identifier(mp3Files);
        }
    }
});

function identifier(mp3Files) {
    $('.filenameContainer').css({'display': 'block'});
    $('#fileName').text(mp3Files[currentIndex]);
    readMetadata(mp3Files[currentIndex], getMetadata);
    function getMetadata (metadata) {
        if (metadata === null) {
            console.log("OMG ERROR!1!!!1!")
            $('#song').text('---');
            $('#genre').text('---');
            $('#album').text('---');
            $('#artist').text('---');
            $('#released').text('---');
        }
    }
}

function readMetadata(fileName, callback) {
    var mm = require('musicmetadata');

// create a new parser from a node ReadStream
    var parser = mm(fs.createReadStream(fileName), function (err, metadata) {
        if (err) callback(null);
        callback(metadata);
    });
}

$('#nextBtn').on('click', function () {
    currentIndex += 1;
});
