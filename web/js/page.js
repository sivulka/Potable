function OnPageNavRequest(origin, destination) {
    jQuery.noConflict();
    
    $(origin).addClass('invisible');
    $(origin).addClass('fixed');
    $(destination).removeClass('invisible');
    $(destination).removeClass('no-display');
    window.setTimeout(function () {
    // do stuff after animation has finished here
    }, 200);
    $(origin).addClass('no-display');
}

function OnModalPageRequest(origin, destination, modal)
{
    $(origin).addClass('invisible');
    $(origin).addClass('fixed');
    $(destination).removeClass('invisible');
    $(destination).removeClass('no-display');
    window.setTimeout(function () {
    // do stuff after animation has finished here
    }, 200);
    $(origin).addClass('no-display');
    
    jQuery.noConflict();
    $(modal).modal('show');
}
