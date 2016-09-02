var Botkit = require('/root/brobot/lib/Botkit.js');
var http = require('http');

var controller = Botkit.slackbot({
	debug: true
});

controller.saveTeam({id: 'T1XMTH7G8'}, function(){});

controller.setupWebserver(6969, function(err, webserver) {
	controller.createWebhookEndpoints(webserver);
});

controller.on('slash_command', function(bot, message) {

	if (message.command === 'spot') {
		var symbol = message.text? message.text: message.channel_name;
		symbol = symbol.toUpperCase();

		http.get('http://phisix-api3.appspot.com/stocks/' + symbol + '.json', function(response) {
			var responseText = ''
			response.on('data', function(chunk) {
				responseText += chunk;
			});

			response.on('end', function() {
				if(responseText) {
					var data = JSON.parse(responseText);
					var price = data.stock[0].price.amount;
					var change = data.stock[0].percent_change;

					var replyMessage = symbol + ' *' + change + '%*' + ' ' + price;

					bot.replyPublic(message, replyMessage)
				} 
				else {
					bot.replyPublic(message, 'Faggot.');
				}
			});

		})
	}
});