import Express from "express";
import http from "http";
import fireSocketServer from './socket.js';

const app = Express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use("/", Express.static("client"));

server.listen(PORT, () => console.log(`XO 🚀🚀 | PORT: ${PORT}`));

fireSocketServer(server);