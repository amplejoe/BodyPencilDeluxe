let express = require('express');
let cors = require('cors')
const app = express();
app.use(cors()); // allow all origins -> Access-Control-Allow-Origin: *
const http = require('http').createServer(app);
const gameServer = require('./modules/GameServer');

gameServer.start(http);

const port = 3001;
http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
