# Phaser MMORPG
My attempt at an MMORPG game using the Zenva academy course.

## Installation

To run this project you will need to install npm dependencies in both the server and client directories so run `yarn` or `npm install` from inside both directories.

Also it requires either Docker or a local Mongo client for the server side to function properly.

## Environment variables

Inside the server directory run `cp example.env .env`.

Then modify the .env with the proper values if running your own mongo server.

An email and password is required for resetting passwords (not yet implemented).

## Loading Docker Image

If you have neither [Docker](https://docs.docker.com) nor [Mongo](https://www.mongodb.com/) on your system I would recommend [Docker](https://docs.docker.com/) as it is very useful.

Once you have docker run `yarn mongo:up` from the server folder, otherwise you should edit the proper environment variables in your `.env` file.

## Starting the server

Inside the server directory run `yarn start` or `npm run start`.

Wait for the message `server running on port: 3000` or whatever port you specified in your .env file.

Leave this running.

## Starting the client

From a different console inside the client directory run `yarn start` or `npm run start` and wait for the `Compiled Successfully` message.

Open your browser to localhost:8000.
