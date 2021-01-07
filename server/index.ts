import express, {
  Request,
  Response,
} from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import passport from 'passport';
import socketio from 'socket.io';

import {
  port, mongoConnectionUrl, mongoUserName, mongoPassword, corsOrigin,
} from './env';
import HttpException from './HttpException';
import routes from './routes/main';
import passwordRoutes from './routes/password';
import secureRoutes from './routes/secure';

// require passport auth
import './auth/auth';

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket: socketio.Socket) => {
  // player disconnected
  // socket.on('disconnect', () => {
  //   console.log('player disconnected from our game');
  // });
  console.log('player connected to our game');
  console.log(socket);
});

// setup mongo connection
const mongoConfig: mongoose.ConnectOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

if (mongoUserName && mongoPassword) {
  mongoConfig.authSource = 'admin';
  mongoConfig.user = mongoUserName;
  mongoConfig.pass = mongoPassword;
}

if (!mongoConnectionUrl) {
  console.log('MONGO_CONNECTION_URL is not found!');
  process.exit(1);
}

mongoose.connect(mongoConnectionUrl, mongoConfig);

mongoose.connection.on('error', (err: Error) => {
  console.log(err);
  process.exit(1);
});

// update express settings
// parse application/x-www-form-urlencoded data
app.use(bodyParser.urlencoded({ extended: false }));
// parse json objects
app.use(bodyParser.json());
app.use(cookieParser());
console.log(`corsOrigin = ${corsOrigin}`);

app.get('/profile.html', passport.authenticate('jwt', { session: false }),
  (_req: Request, res: Response) => res.status(200).sendFile('profile.html', { root: './public' }));

// serve public directory as static
app.use(express.static(`${__dirname}/public`));

// serve the index page as default
app.get('/', (_req: Request, res: Response) => {
  res.send(`${__dirname}/index.html`);
});

// setup routes
app.use('/', routes);
app.use('/', passwordRoutes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes);

// catch all other routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: '404 - Not Found',
    status: 404,
  });
});

// handle errors
app.use((
  err: HttpException,
  _req: Request,
  res: Response,
) => {
  res.status(err.status || 500).json({ error: err.message, status: 500 });
});

mongoose.connection.on('connected', () => {
  console.log('connected to mongo');
  server.listen(port, () => {
    console.log(`server running on port: ${port}`);
  });
});
