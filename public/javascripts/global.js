

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

function tweenGloss() {
    var sticker = event.currentTarget;

    createGlossGradient(sticker);

    sticker.onclick = null;

    TweenMax.to(sticker, 0.55, {onUpdate: updateTween, ease: Linear.easeNone});
}

function createGlossGradient(sticker) {
    var stickerDefs = sticker.getElementsByTagName('defs')[0];
    var ns = sticker.namespaceURI;
    var grad = document.createElementNS(ns, 'linearGradient');
    grad.setAttribute('id', 'glossgrad');
    grad.setAttribute('x1', '22.3');
    grad.setAttribute('y1', '342.88');
    grad.setAttribute('x2', '227.7');
    grad.setAttribute('y2', '-12.88');
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');

    for (var i = 0; i < 3; i++)
    {
        var stop = document.createElementNS(ns, 'stop');
        stop.setAttribute('offset', String(i * -0.2));
        stop.setAttribute('stop-color', '#fff');
        if (i != 1)stop.setAttribute('stop-opacity', '0');
        grad.appendChild(stop);
    }

    stickerDefs.appendChild(grad);

    var oldRect = sticker.getElementsByTagName('rect')[1];

    var rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', oldRect.getAttribute('x'));
    rect.setAttribute('y', oldRect.getAttribute('y'));
    rect.setAttribute('width', oldRect.getAttribute('width'));
    rect.setAttribute('height', oldRect.getAttribute('height'));
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke-miterlimit', oldRect.getAttribute('stroke-miterlimit'));
    rect.setAttribute('stroke-width', oldRect.getAttribute('stroke-width'));
    rect.setAttribute('stroke', 'url(#glossgrad)');

    sticker.appendChild(rect);
}

function updateTween() {
    var sticker = this.target;
    var stops = sticker.getElementById('glossgrad').getElementsByTagName('stop');

    var ratio = (this.ratio * 1.8) - 0.4;

    stops[0].setAttribute('offset', Math.max(0, ratio - 0.4));
    stops[1].setAttribute('offset', Math.max(0, ratio - 0.2));
    stops[2].setAttribute('offset', Math.max(0, ratio));
}