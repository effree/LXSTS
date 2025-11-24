$('.toggle-theme').click( function (){
    $('html').toggleClass('dark-theme light-theme');
    if($('html').hasClass('dark-theme')){
        localStorage.setItem('theme', 'dark-theme');
    }else{
        localStorage.setItem('theme', 'light-theme');
    }
})

document.addEventListener("DOMContentLoaded", function() {
    if (localStorage.getItem("theme") === null) {
        $('html').addClass('dark-theme');
    }else{
        $('html').addClass(localStorage.getItem('theme'));
    }
})