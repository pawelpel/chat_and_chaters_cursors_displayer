from tornado import websocket, web, ioloop
import json
import os


clients = []

class IndexHandler(web.RequestHandler):
    def get(self):
        self.render("index.html")


class SocketHandler(websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        print('Websocket opened!')

        if self not in clients:
            clients.append(self)

    def on_close(self):
        print('Websocket closed!')

        try:
            username = str(self.username)

            for c in clients:
                if c != self:
                    c.write_message({'type':'status',
                                    'value':'left',
                                     'name':username,
                                  'counter':str(len(clients)-1)})
        except:
            pass

        if self in clients:
            clients.remove(self)


    def on_message(self, message):

        message = json.loads(message)


        if 'value' in message.keys() and message['value'] == 'joined':
            self.username = message['name']

        message['counter'] = str(len(clients))


        message = json.dumps(message)

        for c in clients:
            c.write_message(message)



app = web.Application([(r'/ws', SocketHandler),
                       (r'/', IndexHandler),
                       (r'/(.*)', web.StaticFileHandler, {'path': os.getcwd()})])

if __name__ == "__main__":
    try:
        app.listen(8888)
        ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        pass

