document.addEventListener('DOMContentLoaded', function(){

    function MouseTogether(){
        if(!(this instanceof MouseTogether)) return new MouseTogether();
        
        this.usernameButton = document.querySelector('input[name=submit]');
        this.usernameInput = document.querySelector('input[name=username]');
        this.username = '';
        
        this.joined = false;
        this.id = 'img_'+Math.round(Math.random()*1000000) + '';
        
        this.message = document.querySelector('input[name=message]');
        this.messageSendButton = document.querySelector('input[name=sendmessage]');
        
        this.activityBox = document.querySelector('#activity');
        
        this.playerCounter = document.querySelector('#counter');
        
        this.body = document.querySelector('body');
        
        this.init();
        this.onMessage();
        this.onClose();
    }
    
    
    MouseTogether.prototype.init = function(){

        
        /* HERE CHANGE YOUR IP */ 
        this.ws = new WebSocket("ws://192.168.0.100:8888/ws");
        
        this.usernameButton.onclick = function(e){      
            e.preventDefault();
        
            this.usernameButton .setAttribute('disabled', 'disabled');
            this.usernameInput.setAttribute('readonly', 'readonly');
            this.username = this.usernameInput.value;
        
            this.messageSendButton.removeAttribute('disabled');
            this.onOpen(this.username);
            this.joined = true;
            
        }.bind(this);
        
        this.messageSendButton.onclick = function(e){
            e.preventDefault();
            
            this.sendData({
                type: 'message',
                name: this.username,
                message: this.message.value
            })
            
            this.message.value = "";
        }.bind(this);
        
        this.body.onmousemove = function(e){
            if(this.joined){
                this.sendData({
                    type: 'mouse',
                    x: e.clientX,
                    y: e.clientY,
                    id: this.id
                })
            }
        }.bind(this);
    }
    
    
    MouseTogether.prototype.onOpen = function(username){
        
        this.ws.onopen = function() {
            console.log('Connection opened');
            
            this.sendData({
                type: 'status',
                value: 'joined',
                name: username,
            })
        }.bind(this);
        
        this.ws.onopen();
    }
    
    
    MouseTogether.prototype.onMessage = function(){
        
        this.ws.onmessage = function(e){
            var answer = JSON.parse(e.data);
            
            if(answer['id']){
                if(answer['id'] !== this.id){
                    var cursor = document.getElementById(answer['id']);
                    
                    if(cursor === null){
                        var newCursor = document.createElement('img');
                        newCursor.setAttribute('id', answer['id']);
                        newCursor.classList.add('cursors');
                        newCursor.setAttribute('src', 'cursor.png');
                        this.body.appendChild(newCursor);
                    } else {
                        cursor.style = "left: "+answer['x']+"px; top: "+answer['y']+'px';   
                    }
                }
            } else {
                this.renderRow(answer);
            }
            
            this.playerCounter.innerHTML = answer['counter'];
            
        }.bind(this);
    }

    
    MouseTogether.prototype.renderRow = function(data){
        
        var span = document.createElement('span');
        
        span.classList.add('message')
        
        if(data['type'] === 'message'){
            span.innerHTML = '<strong>'+data['name']+': </strong>'+data['message'];
            span.innerHTML += '<br>';
            this.activityBox.appendChild(span);
            
        } else if (data['type'] === 'status'){
            
            span.classList.add('status');
            span.innerHTML = '<strong>'+data['name']+'</strong> has '+data['value'];
            span.innerHTML += '<br>';
            this.activityBox.appendChild(span);
        }
    }
    
    
    MouseTogether.prototype.onClose = function(){
        
        this.ws.onclose = function(){
            console.log('Connection closed');
            
            this.sendData({
                type: 'status',
                value: 'left',
                name: username,
            })
        }.bind(this);
    }
    
    
    MouseTogether.prototype.sendData = function(data){
        
        this.ws.send(JSON.stringify(data))
    }

    var mousetogether = MouseTogether();
    
}, false);