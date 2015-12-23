

$(document).ready(function() {

});


// Get Clue
function getClue() {

    var XHR = new XMLHttpRequest();
    XHR.addEventListener('load', function(event) {
        var res = JSON.parse(event.currentTarget.response);
        var elem = document.getElementById("clue" + res.clueID);
        elem.style.setProperty('visibility', 'visible', 'important');
        elem.style.setProperty('display', 'block', 'important');
    });

    XHR.addEventListener('error', function(event) {
        alert('fail')
    });

    XHR.open('POST', '/getClue');

    XHR.send();

};

function reset() {
    var XHR = new XMLHttpRequest();
    XHR.addEventListener('load', function(event) {
        console.log("Clues Reset");
    });

    XHR.addEventListener('error', function(event) {
        alert('fail')
    });

    XHR.open('POST', '/resetClues');

    XHR.send();
}
