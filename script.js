document.addEventListener('DOMContentLoaded', function(){

    var ws = new WebSocket("ws://localhost:8888/ws");
    
    ws.onopen = function() {
       ws.send("Hello, world");
    };
    
    
    document.querySelector('body').onmousemove = function(e){
        ws.send(e.clientX + ' ' + e.clientY);
    }
    
    
    ws.onmessage = function (evt) {
       document.querySelector('h1').innerHTML = evt.data;
    };

    
}, false);