from tornado import websocket, web, ioloop
import json


clients = []

class SocketHandler(websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        print('Websocket opened!')
        if self not in clients:
            clients.append(self)

    def on_close(self):
        print('Websocket closed!')
        if self in clients:
            clients.remove(self)

    def on_message(self, message):
        self.write_message('Server got: ' + message)



app = web.Application([(r'/ws', SocketHandler)])

if __name__ == "__main__":
    app.listen(8888)
    ioloop.IOLoop.instance().start()