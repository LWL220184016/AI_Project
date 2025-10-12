const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const connection = require('./connectionHandler.js');
const crypto = require('crypto');


const sessionStore = new MySQLStore({
    // expiration: 86400000, // Session expiration time in milliseconds (24 hours)
    expiration: 1500000, // Session expiration time in milliseconds (15 minutes)
    checkExpirationInterval: 1500000, // Check for expired sessions and delete every 15 minute
    endConnectionOnClose: true, // Close MySQL connection when the store is closed
    createDatabaseTable: true, // Create the sessions table if it doesn't exist
    schema: {
        tableName: 'sessions', // Table name for storing sessions
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, connection);

const SESSION = session({
    secret: generateSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, name: "c"}, // Note: secure should be set to true when in a production environment and the site is served over HTTPS
    store: sessionStore
});

function generateSecret() {
    return crypto.randomBytes(64).toString('hex');
}

module.exports = SESSION;

