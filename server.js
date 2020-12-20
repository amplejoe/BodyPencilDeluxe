let express = require('express');
let cors = require('cors')
const app = express();
app.use(cors()); // allow all origins -> Access-Control-Allow-Origin: *
const http = require('http').createServer(app);
const gameServer = require('./server_modules/GameServer');

gameServer.start(http);

var hostFolder = "public";
var port = process.env.PORT || 3000;

// host public folder
app.use(express.static(hostFolder));

http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
