const http = require('http');
const port = process.env.APP_PORT || 8080;

const server = http.createServer((req, res) => {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World!\n');
});

server.on('close', () => {
	console.log('Gracefully shutting down server');
});

server.listen(port, () => {
	console.log('Server running at http://localhost:'+port);
});

function exitOn(signal) {
	process.on(signal, () => {
		server.close(() => {
			process.exit();
		});
	});
}

// required so that node actually shuts down when receiving SIGINT
// from Ctrl+C in terminal or SIGTERM from 'docker stop' command
exitOn('SIGTERM');
exitOn('SIGINT');
