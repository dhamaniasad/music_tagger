var got = require('got');
window.$ = window.jQuery = require('./jquery.min.js');

$("#songForm").submit(function (event) {
    alert("Handler for .submit() called.");
    event.preventDefault();
});


//got('https://itunes.apple.com/search?term=rocket%20man', function (err, data, res) {
//    document.write(data);
//});
