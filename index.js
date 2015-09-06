var got = require('got');

got('https://itunes.apple.com/search?term=rocket%20man', function (err, data, res) {
    document.write(data);
});
