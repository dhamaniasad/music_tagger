var got = require('got');
var walk = require('walk');
var ipc = require('ipc');
var fs = require('fs');
var ffmetadata = require("ffmetadata");
// Due to Electron being a CommonJS environment, the thing below has to be done
// (https://github.com/atom/electron/issues/254)
window.$ = window.jQuery = require('./js/jquery.min.js');
var currentIndex = 0;
var mp3s = null;
var playSample = null;
var fetchedData = null;
var fetchedIndex = 0;

$("#songForm").submit(function (event) {
    itunesFetch($('#songName').val());
    event.preventDefault();
});


function itunesFetch(data) {
    got('https://itunes.apple.com/search?term=' + data, {json: true}, function (err, data, res) {
        fetchedData = data.results;
        fetchedIndex = 0;
        updateFetchedDisplay();
    });
}

function updateFetchedDisplay () {
    var artworkUrl = fetchedData[fetchedIndex].artworkUrl100.replace('100x100', '150x150');
        $('#fetched_artwork').attr('src', artworkUrl);
        $('#fetched_song').text((fetchedData[fetchedIndex].trackName));
        $('#fetched_genre').text((fetchedData[fetchedIndex].primaryGenreName));
        $('#fetched_album').text((fetchedData[fetchedIndex].collectionName));
        $('#fetched_artist').text((fetchedData[fetchedIndex].artistName));
        var releaseDate = new Date(fetchedData[fetchedIndex].releaseDate);
        $('#fetched_released').text(releaseDate.getFullYear());
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
        walkTree(dir.toString(), countUpdater);
        $('#dirPath').text('Scanning directory for MP3 files. Please wait...');
        function countUpdater(mp3Files) {
            mp3s = mp3Files;
            $('#dirPath').text('Loaded ' + dir + ' with ' + mp3Files.length + ' .mp3 files');
            identifier(mp3Files);
        }
    }
});

function identifier(mp3Files) {
    $('.filenameContainer').css({'display': 'block'});
    $('#fileName').text(mp3Files[currentIndex]);
    newSample(mp3Files[currentIndex]);
    readMetadata(mp3Files[currentIndex], getMetadata);
    function getMetadata (metadata) {
        if (metadata === null) {
            console.log("OMG ERROR!1!!!1!");
            $('#song').text('---');
            $('#genre').text('---');
            $('#album').text('---');
            $('#artist').text('---');
            $('#released').text('---');
        }
        else {
            $('#song').text(metadata.title);
            $('#genre').text(metadata.genre[0]);
            $('#album').text(metadata.album);
            $('#artist').text(metadata.artist[0]);
            $('#released').text(metadata.year);
            var picture = metadata.picture[0];
            var base64data = new Buffer(picture.data).toString('base64');
            $('#artwork').attr('src', 'data:image/' + picture.format + ';base64,' + base64data);
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
    playSample.stop();
    currentIndex += 1;
    identifier(mp3s);
    $('#playBtn').text('Play Song');
});

function newSample (path) {
 playSample = new Howl({
  urls: [path],
  autoplay: false,
  loop: false,
  onend: function() {
  },
    onplay: function () {
        this.playing = true;
    },
    onpause: function () {
        this.playing = false;
    }
});
}

$('#playBtn').on('click', function () {
    if (playSample.playing === true) {
        playSample.pause();
        $(this).text('Play Song');
    }
    else if (playSample.playing === false || playSample.playing === undefined) {
        playSample.play();
        $(this).text('Pause Song');
    }
});

$('#updtBtn').on('click', function () {
    updateTags(currentIndex);
});

function updateTags(currentIndex) {
    var data = {
        artist: $('#fetched_artist').text(),
        title: $('#fetched_song').text(),
        album: $('#fetched_album').text(),
        date: $('#fetched_released').text(),
        genre: $('#fetched_genre').text()
    };
    ffmetadata.write(mp3s[currentIndex], data, function (err) {
        if (err) console.error("Error writing metadata", err);
        else console.log("Data written");
    });
}
