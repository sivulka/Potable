function OnPageNavRequest(origin, destination) {
    $(origin).addClass('invisible');
    $(origin).addClass('fixed');
    $(destination).removeClass('invisible');
    $(destination).removeClass('no-display');
    window.setTimeout(function () {
    // do stuff after animation has finished here
    }, 200);
    $(origin).addClass('no-display');
}