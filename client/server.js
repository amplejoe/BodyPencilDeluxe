let express = require('express');
let cors = require('cors')
const app = express();
app.use(cors()); // allow all origins -> Access-Control-Allow-Origin: *

hostFolder = "public";
port = 3000;


// host public folder
app.use(express.static(hostFolder));
// var serveIndex = require('serve-index');

app.listen(port, () => {
    console.log(`Serving client at http://localhost:${port}/index.html`);
});