import socketio from 'socket.io';

export default class GameManager {
  private io: socketio.Server;

  constructor(io: socketio.Server) {
    this.io = io;
  }

  setup() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.io.on('connection', (socket: socketio.Socket) => {
      // player disconnected
      socket.on('disconnect', () => {
        console.log(`Player Disconnected: ${socket.id}`);
      });

      socket.on('newPlayer', (obj: any) => {
        console.log('new player event recieved', obj);
        socket.broadcast.emit('newPlayer', socket.id);
      });

      console.log('player connected to our game');
      console.log(socket.id);
    });
  }
}
