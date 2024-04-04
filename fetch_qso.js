const WebSocketClient = require("websocket").client;

const fs = require("fs");

const groupID = 220;

const client = new WebSocketClient();

const relations = [];

client.on("connectFailed", function(error) {
	console.log("Connect Error: " + error.toString());
});

client.on("connect", function(connection) {
	connection.on("error", function(error) {
		console.log("Connection Error: " + error.toString());
	});

	connection.on("close", function() {
		console.log("Connection Closed");
	});

	let i = 0;

	connection.on("message", function(message) {

		message = message.utf8Data;

		if(message[0] === "0") {
			return;
		}

		const command = message.slice(0, 2)
		const data = message.slice(2);

		//console.log(command);

		if(command == 42) {
			const parsedData = JSON.parse(data)[1];

			if(parsedData.topic === "LH-Startup") {
				i++;

				console.log(i);

				const payload = JSON.parse(parsedData.payload);

				relations.push(payload);

				if(i % 499 === 0) {
					console.log(payload);
					fs.writeFileSync("./relations.json", JSON.stringify(relations));
					connection.sendUTF(`42["searchMongo",{"query":{"sql":"DestinationID = ${groupID} AND Start < ${payload.Start}"},"amount":499}]`);
				}
			}
		}
	});

	connection.sendUTF("40");
	connection.sendUTF(`42["searchMongo",{"query":{"sql":"DestinationID = ${groupID}"},"amount":499}]`);
});

client.connect("wss://api.brandmeister.network/lh/?EIO=4&transport=websocket", "echo-protocol");
