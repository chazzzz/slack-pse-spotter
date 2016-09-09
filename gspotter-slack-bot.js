var Botkit = require('botkit');
var http = require('http');

var controller = Botkit.slackbot({
	debug: true
});

controller.saveTeam({
	id: 'T1XMTH7G8'
}, function() {});

controller.setupWebserver(6969, function(err, webserver) {
	controller.createWebhookEndpoints(webserver);
});

controller.on('slash_command', function(bot, message) {

	if (message.command === '/spot') {
		bot.replyAcknowledge();
		var symbol = message.text ? message.text : message.channel_name;
		symbol = symbol.toUpperCase();

		http.get('http://phisix-api3.appspot.com/stocks/' + symbol + '.json', function(response) {
			var responseText = ''
			response.on('data', function(chunk) {
				responseText += chunk;
			});

			response.on('end', function() {
				if (responseText) {
					var data = JSON.parse(responseText);
					var price = data.stock[0].price.amount;
					var change = data.stock[0].percent_change;

					var replyMessage = symbol + ' ' + price + ' (' + change + '%)';

					bot.replyPublicDelayed(message, replyMessage)
				} else {
					bot.replyPublic(message, 'Sorry I didn\'t understand what you mean. Would you like to watch me dance instead?');
				}


			});

		})
	}

	if (message.command === '/gainers' || message.command === '/losers' || message.command === '/actives') {
		var url = 'http://www.pse.com.ph/stockMarket/dailySummary.html?method=getAdvancedSecurity&limit=10&ajax=true';
		if(message.command === '/losers') 
			url = 'http://www.pse.com.ph/stockMarket/dailySummary.html?method=getDeclinesSecurity&limit=10&ajax=true';
		if(message.command === '/actives')
			url = 'http://www.pse.com.ph/stockMarket/dailySummary.html?method=getTopSecurity&limit=10&ajax=true';

		console.log('Requesting data to...', url);
		http.get( url , function(response) {
			var responseText = '';

			response.on('data', function(chunk) {
				responseText += chunk;
			});

			response.on('end', function() {
				if (responseText) {
					var data = JSON.parse(responseText);

					var responseSize = data.count;
					var replyMessage = '';
					for (var i = 0; i < responseSize; i++) {
						var symbol = data.records[i].securitySymbol;
						var price = data.records[i].lastTradePrice;
						var change = data.records[i].percChangeClose;

						change = parseFloat(Math.round(change * 100)/100).toFixed(2);
						replyMessage += '#' +  symbol.toLowerCase() + " " + price + " (" + change + "%)\n";
					}

					bot.replyPublicDelayed(message, replyMessage);
				} else {
					bot.replyPublicDelayed(message, 'Unrecognized response');
				}
			});
		});
		bot.replyAcknowledge();
	}
});
