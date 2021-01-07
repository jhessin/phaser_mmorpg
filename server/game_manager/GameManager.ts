import socketio from 'socket.io';

export default class GameManager {
  io: socketio.Server;

  constructor(io: socketio.Server) {
    this.io = io;
  }

  setup() {
    this.io.on('connection', (socket: socketio.Socket) => {
      // player disconnected
      socket.on('disconnect', () => {
        console.log('player disconnected from our game');
      });

      socket.on('newPlayer', (obj: any) => {
        console.log(obj);
        console.log('newPlayer event caught');

        // broadcast an event to every OTHER socket
        socket.broadcast.emit('newPlayer', socket.id, 'socket.broadcast');

        // broadcast an event to ALL sockets including this one.
        this.io.emit('newPlayer', socket.id, 'io.emit');
      });
      console.log('player connected to our game');
      console.log(socket.id);
    });
  }
}
