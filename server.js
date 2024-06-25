// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('ws');
const axios = require('axios');

const app = express();
const server = createServer(app);
const wss = new Server({ server });

const lambdaUrl = 'https://pdzsl5xw2kwfmvauo5g77wok3q0yffpl.lambda-url.us-east-2.on.aws/';
const mt4LoginUrl = 'https://mt4.mtapi.io/Connect';
const mt4OrderSendUrl = 'https://mt4.mtapi.io/OrderSend';

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const messageString = message.toString();
    console.log('Received:', messageString); 

    if (messageString === 'trade') {
      try {
        console.log('Connecting to Backend...');
        
        console.log('Get Master Trade... (Pinging Lambda Function)');
        const tradeDetails = await axios.get(lambdaUrl);
        
        console.log('Replicating Master Trade...');

        const connectionIdResponse = await axios.get(mt4LoginUrl, {
          params: {
            user: '44712225',
            password: 'tfkp48',
            host: '18.209.126.198',
            port: '443'
          }
        });
        const connectionId = connectionIdResponse.data;

        const result = await axios.get(mt4OrderSendUrl, {
          params: {
            id: connectionId,
            symbol: tradeDetails.data.symbol,
            operation: tradeDetails.data.operation,
            volume: tradeDetails.data.volume,
            takeprofit: tradeDetails.data.takeprofit,
            comment: tradeDetails.data.comment
          }
        });

        console.log('Successfully Replicated Master Trade...');
        
        console.log('Displaying Trade Details:');
        ws.send(JSON.stringify(result.data));
      } catch (error) {
        console.error('Error during trade process:', error);
        ws.send(JSON.stringify({ status: 'error', error: error.message }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('WebSocket server is running on port 3001');
});
