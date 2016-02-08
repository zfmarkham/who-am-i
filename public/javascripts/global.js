

$(document).ready(function() {

});


// Get Clue
function getClue() {

    var XHR = new XMLHttpRequest();
    XHR.addEventListener('load', function(event) {
        var res = JSON.parse(event.currentTarget.response);
        if (res.revealClue) {
            var elem = document.getElementById("clue" + res.clueID);
            elem.style.setProperty('visibility', 'visible', 'important');
            elem.style.setProperty('display', 'block', 'important');
        }
        else {
            alert("No more clues");
        }
    });

    XHR.addEventListener('error', function(event) {
        alert('fail')
    });

    XHR.open('POST', '/getClue');

    XHR.send();

}

function submitGuess() {
    var XHR = new XMLHttpRequest();
    XHR.addEventListener('load', function(event) {
        var res = JSON.parse(event.currentTarget.response);

        if (res.correct) {
            alert("Correct!");
        }
        else {
            alert("Wrong!");
        }
    });

    XHR.addEventListener('error', function(event) {
        alert('fail')
    });

    XHR.open('POST', '/submitGuess');

    var formData = new FormData();
    formData.append('guess', document.getElementById("guessInput").value);

    XHR.send(formData);
}

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

function levelSelect(questionId) {
    window.location = '/play/' + questionId;
}


// Gradient colours : [#d4af37, fff, d4af37]
function tweenGloss() {
    var elems = document.getElementsByTagName('svg');

    var sticker = elems[0];

    //TweenLite.to(sticker, 1, {width: "0%"});
    TweenLite.to("#grad", 0.7, {onUpdate: updateTween});
}

function updateTween() {
    var elems = document.getElementsByTagName('svg');
    var sticker = elems[0];

    var grad = sticker.getElementById('grad');

    var stops = grad.getElementsByTagName('stop');

    //for (var i = 0; i < stops.length; i++)
    //{
    //    var stop = stops[i];
    //    var val = Number(stop.getAttribute('offset'));
    //    stop.setAttribute('offset', val *  (1 - this.ratio));
    //}

    stops[0].setAttribute('offset', (1 - this.ratio) - 0.1);
    stops[1].setAttribute('offset', (1 - this.ratio) - 0.05);
    stops[2].setAttribute('offset', (1 - this.ratio));
}