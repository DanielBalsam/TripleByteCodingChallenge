const AlgoApp = {
  init: init
};

module.exports = AlgoApp;

function init() {
  // server.js
  'use strict';

  const Hapi = require('hapi');
  const Raven = require('raven');
  const fs = require('fs');
  const Boom = require('boom');
  const mongoose = require('mongoose');
  const glob = require('glob');
  const path = require('path');
  const config = require('./config');

  const imageService = require('./tools/amazon-s3/imageService');

  const cluster = require('cluster');
  const numCPUs = require('os').cpus().length;

  //don't need to cluster locally, plus easier to catch errors locally this way
  if (cluster.isMaster && config.environment === "production") {
    initiateMasterProcess();
  } else {
    registerServer();
  }

  function initiateMasterProcess() {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      cluster.fork();
    });

    //no Sentry locally either
    Raven.config(config.sentryConfig).install();

    console.log('Sentry enabled');
  }

  function registerServer() {
    const server = new Hapi.Server();

    //http connection for redirects only
    establishHttpConnectionAndStartRedirect();
    establishHttpsConnection(server);

    createRoutes(server);

    // Start the server
    server.start(connectToDatabase);

    //init Amazon S3 bucket for user images
    imageService.initS3Bucket();

    //global error interceptor
    process.on('uncaughtException', globalErrorInterceptor);
  }

  function establishHttpConnectionAndStartRedirect() {
    //http connection only exists to redirect to https
    var http = new Hapi.Server();

    http.connection({port: 80})

    var redirect = function (req, reply) {
      reply.redirect('https://localhost:9000/' + req.params.path);
    }

    http.route({ method: '*', path: '/{path*}', handler: redirect });

    http.start((err) => {
      if (err) {
        throw err;
      }
    });
  }

  function establishHttpsConnection(server) {
    const cert = fs.readFileSync(path.join(__dirname, '../cert/cert.crt'));
    const key = fs.readFileSync(path.join(__dirname, '../cert/key.key'));

    const tls = {
      cert: cert,
      key: key
    };

    server.connection({ port: config.sslPort, tls: tls });
  }

  function createRoutes(server) {
    //we need to register our authentication scheme
    //before we create API routes
    server.register(require('hapi-auth-jwt'), (err) => {
      // We're giving the strategy both a name
      // and scheme of 'jwt'
      server.auth.strategy('jwt', 'jwt', {
        key: config.secret,
        verifyOptions: { algorithms: ['HS256'] }
      });

      // use glob to autogenerate routes
      // if they are in specified paths
      glob.sync('lib/api/**/routes/**/*.js')
        .forEach(file => {
          const route = require('./' + file.split("lib/")[1]);
          server.route(route);
        });
    });

    //public facing SPA
    server.register(require('inert'), () => {
      server.route({
          method: 'GET',
          path: '/{param*}',
          handler: {
              directory: {
                  path: 'public',
                  listing: false,
                  index: ['index.html']
              }
          }
      });

      //return SPA if in correct directories, don't allow 404
      server.ext('onPostHandler', (request, reply) => {
        const response = request.response;
        if (response.isBoom && response.output.statusCode === 404) {
          return reply.file('public/index.html');
        }
        return reply.continue();
      });
    });
  }

  function connectToDatabase(err) {
    if (err) {
      throw err;
    }

    const dbUrl = 'mongodb+srv://' + config.dbUser + ':'+config.dbConnectionString+config.dbClusterUrl;

    // Once started, connect to Mongo through Mongoose
    mongoose.connect(dbUrl, {}, (err) => {
      if (err) {
        throw err;
      }

      console.log('we got a server going');
    });
  }

  function globalErrorInterceptor(err) {
    //this only supresses errors if Raven is not running,
    //which it is in production. In production it will
    //log the error to Sentry
    console.log(err);

    if (config.enviroment === "production") {
      Raven.captureException(err);
    }
  }
}
