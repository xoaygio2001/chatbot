require("dotenv").config();
import request from "request";

import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.API_KEY
}))

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;




let getHomePage = (req, res) => {
    return res.send("Xin chao");
};

let getWebhook = (req, res) => {

    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            // Respond with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
};

let postWebhook = (req, res) => {
    let body = req.body

    console.log('body: ' + body);

    // Send a 200 OK response if this is a page webhook

    if (body.object === "page") {

        //iterates
        body.entry.forEach(function (entry) {

            //gets
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            //Get the
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            //check if the event
            //pass the event
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        })

        // Returns a '200 OK' response to all requests
        res.status(200).send("EVENT_RECEIVED");

        // Determine which webhooks were triggered and get sender PSIDs and locale, message content and more.

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
};

// Handles messages events
async function handleMessage(sender_psid, received_message) {

    let response;

    let test = false;

    let randomNumber = Math.floor(Math.random() * (6 - 1) + 1);

    //check
    if (received_message.text) {


        try {
            console.log(received_message.text);
            let answer;

            await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: received_message.text }]
            }).then(res => {
                console.log(res.data.choices[0].message.content);
                answer = res.data.choices[0].message.content;
            })

            response = {
                "text": answer
            }
        } catch (e) {
            console.log(e)
        }


    } else if (received_message.attachments) {
        let attachment_url = received_message.attachments[0].payload.url;

        response = {
            "attachment": {
                "type": "image",
                "payload": {
                    "url": "https://omnitos.com/wp-content/uploads/2021/04/4ee1ad2ffbb00866fb7c55c61786e95d.jpg",
                    "is_reusable": true
                }
            }
        }
        test = true;
    }

    //send the response

    if (test != false) {
        callSendAPI(sender_psid, response, 2);
    } else {
        callSendAPI(sender_psid, response, 1);
    }

}

// Handle messaging_postback events
function handlePostback(sender_psid, received_postback) {

}

// Send reponse messages via the Send API
function callSendAPI(sender_psid, response, kq) {

    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    //Send the HTTP
    if (kq == 1) {

        request({
            "uri": "https://graph.facebook.com/v2.6/me/messages",
            "qs": { "access_token": PAGE_ACCESS_TOKEN },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (!err) {
                console.log('message sent')
            } else {
                console.log('Unable to send message: ' + err)
            }
        }
        )
    } else {

        request({
            "uri": "https://graph.facebook.com/v2.6/me/messages",
            "qs": { "access_token": PAGE_ACCESS_TOKEN },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (!err) {
                console.log('message sent')
            } else {
                console.log('Unable to send message: ' + err)
            }
        }
        )

    }



}


module.exports = {
    getHomePage,
    getWebhook,
    postWebhook

}
