'use strict';
require('dotenv').config();

const
    express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express().use(bodyParser.json());

app.listen(process.env.PORT || 8000, () => console.log('webhook is listening'));

app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let psid = webhook_event.sender.id;
            console.log("Sender PSID:", psid);

            if (webhook_event.message) {
                handleMessage(psid, webhook_event.message);        
            } else if (webhook_event.postback) {
                handlePostback(psid, webhook_event.postback);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = env.process.VERIFY_TOKEN;
    const ACESS_TOKEN = env.process.ACESS_TOKEN;

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }

});

function handleMessage(psid, message){
    let response;

    // Check if the message contains text
    if (message.text) {    

        // Create the payload for a basic text message
        response = {
            "text": `You sent the message: "${message.text}". Now send me an image!`
        }
    }  
    
    // Sends the response message
    callSendAPI(psid, response);
}

function handlePostback(psid, postback){

}

function callSendAPI(psid, res){
    let request_body = {
        "recipient": {
            "id": psid
        },
        "message": res
    }

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}