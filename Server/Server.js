const express = require('express');
const cors = require('cors');
const PHPServer = require('php-fpm');
const path = require('path')
const getApiRoutes_userData = require('./routers/userData.js'); // Adjust the path if necessary
const getApiRoutes_recipeGet = require('./routers/recipe(get).js'); // Adjust the path if necessary
const getApiRoutes_recipePost = require('./routers/recipe(post).js'); // Adjust the path if necessary
const getApiRoutes_recipeDelete = require('./routers/recipe(delete).js'); // Adjust the path if necessary
const getApiRoutes_recipePut = require('./routers/recipe(put).js'); // Adjust the path if necessary
const getApiRoutes_checkDir_upload = require('./routers/upload.js'); // Adjust the path if necessary

const getApiRoutes_foodGet = require('./routers/food(get).js'); // Adjust the path if necessary

const postApiRoutes_emailVerification = require('./routers/emailVerification(post).js'); // Adjust the path if necessary
const postApiRoutes_register = require('./routers/register(post).js'); // Adjust the path if necessary
const postApiRoutes_login = require('./routers/login(post).js'); // Adjust the path if necessary
const postApiRoutes_saveDraft = require('./routers/drafts.js'); // Adjust the path if necessary
const postApiRoutes_saveComment = require('./routers/comment.js'); // Adjust the path if necessary


// const testCookieRoutes = require('./routers/testCookie.js'); // work
// const connection = require('./connectionHandler.js');

const app = express();
const port = 8080;

const phpServer = new PHPServer({
  documentRoot: '/php_file',
  host: '127.0.0.1',
  port: 9000, // PHP-FPM service's TCP port
});

// https://supreme-funicular-x5wg597xpp6xcp5r7-8080.app.github.dev/php/other/show_database.php

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',

];

app.use(express.static(path.join(__dirname, 'php_file/uploads/recipeImage')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'build')));
app.use('/php', phpServer);
app.use(cors({
    origin: function(origin, callback){
      console.log("origin = " + origin);
      // allow requests with no origin (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        var msg = 'message: The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
}));

app.use('/api', getApiRoutes_userData);
app.use('/api', getApiRoutes_recipeGet);
app.use('/api', getApiRoutes_recipePost);
app.use('/api', getApiRoutes_recipeDelete);
app.use('/api', getApiRoutes_recipePut);
app.use('/api', getApiRoutes_checkDir_upload);

app.use('/api', getApiRoutes_foodGet);

app.use('/api', postApiRoutes_emailVerification);
app.use('/api', postApiRoutes_register);
app.use('/api', postApiRoutes_login);
app.use('/api', postApiRoutes_saveDraft);
app.use('/api', postApiRoutes_saveComment);
// app.use('/api', testCookieRoutes);


// -----------------------------------------------------------------------------------------
app.get('/checkDir', (req, res) => {
// app.get('/checkDir/:dir', (req, res) => {
  // const directoryPath = req.params.dir;

  const fs = require('fs');
  const directoryPath = 'Server/images/recipe/';

  // Check if the directory exists
  if (fs.existsSync(directoryPath)) {
      console.log('Directory exists.');
      console.log(`Current Working Directory: ${process.cwd()}`);
      res.json({ message: 'Directory exists.' });

  } else {
      console.log(directoryPath + '  Directory does not exist.');
      console.log(`Current Working Directory: ${process.cwd()}`);
      res.json({ message: directoryPath + '  Directory does not exist.' });
  }
});

app.listen(port, function () {
  console.log('Server listening on port ' + port);
});
// node Server


