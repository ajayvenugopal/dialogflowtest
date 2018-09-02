'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Text, Card, Image, Suggestion, Payload} = require('dialogflow-fulfillment');
const request = require('request');
const http = require('http');
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

// Wikipedia link and image URLs
const wikipediaTemperatureUrl = 'https://en.wikipedia.org/wiki/Temperature';
const wikipediaTemperatureImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Thermally_Agitated_Molecule.gif';
const wikipediaCelsiusUrl = 'https://en.wikipedia.org/wiki/Celsius';
const wikipediaCelsiusImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Celsius_original_thermometer.png';
const wikipediaFahrenheitUrl = 'https://en.wikipedia.org/wiki/Fahrenheit';
const wikipediaFahrenheitImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Fahrenheit_small.jpg';
const wikipediaKelvinUrl = 'https://en.wikipedia.org/wiki/Kelvin';
const wikipediaKelvinImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Lord_Kelvin_photograph.jpg';
const wikipediaRankineUrl = 'https://en.wikipedia.org/wiki/Rankine_scale';
const wikipediaRankineImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/58/Rankine_William_signature.jpg';


const host = '35.227.63.202';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to Synoris`);
    // agent.add(new Card({
    //     title: `Vibrating molecules`,
    //     imageUrl: wikipediaTemperatureImageUrl,
    //     text: `Did you know that temperature is really just a measure of how fast molecules are vibrating around?! 😱`,
    //     buttonText: 'Temperature Wikipedia Page', 
    //     buttonUrl: wikipediaTemperatureUrl
    //   })
    // );
    agent.add(`What you would like to do ?, i can help with book and track shipment`);
    agent.add(new Suggestion(`Book new shipment`));
    agent.add(new Suggestion(`Check shipment status`));

  }

  function task(agent) {
    // Get parameters from Dialogflow to convert
    const temperature = agent.parameters.temperature;
    const unit = agent.parameters.unit;
    console.log(`User requested to convert 11=  ${unit} `);

    let convertedTemp, convertedUnit, temperatureHistory;
    if (unit === `Book`) {
    
    //   temperatureHistory = new Card({
    //     title: `Fahrenheit`,
    //     imageUrl: wikipediaFahrenheitImageUrl,
    //     text: `Daniel Gabriel Fahrenheit, invented the Fahrenheit scale (first widely used, standardized temperature scale) and the mercury thermometer.`,
    //     buttonText: 'Fahrenheit Wikipedia Page',
    //     buttonUrl: wikipediaFahrenheitUrl
    //   });
      
          agent.setContext({
      name: 'book',
      lifespan: 1,
      parameters:{temperature: temperature, unit: unit}
    });
    
    
    
        agent.add(`What commodity you want to ship ?`);
    agent.add(new Suggestion(`item1`));
    agent.add(new Suggestion(`item2`));
   
    
    
    
    } else if (unit === `Check`) {
        

    //   temperatureHistory = new Card({
    //     title: `Celsius`,
    //     imageUrl: wikipediaCelsiusImageUrl,
    //     text: `The original Celsius thermometer had a reversed scale, where 100 is the freezing point of water and 0 is its boiling point.`,
    //     buttonText: 'Celsius Wikipedia Page',
    //     buttonUrl: wikipediaCelsiusUrl
    //   });
      
          agent.setContext({
      name: 'check',
      lifespan: 1,
      parameters:{temperature: temperature, unit: unit}
    });
    
        agent.add(`What commodity you want to track ?`);
    agent.add(new Suggestion(`shoes`));
    agent.add(new Suggestion(`item2`));

    
    
    }


    // Compile and send response
    // agent.add(`${temperature}° ${unit} is  ${convertedTemp}° ${convertedUnit}`);
    // agent.add(temperatureHistory);

    
  }
  
  function bookShipment(agent){
      
       console.log(`inside  bookShipment`);
       const item = agent.parameters.item;
        //   agent.add(`item track ? ${item}`);
           
             agent.add(`What is the POL?`);
              let path = '/BotPort?porttype=test' ;



           console.log(`after  bookShipment`);
  }
  

  function convertRankineAndKelvin(agent) {
    const secondUnit = agent.parameters.absoluteTempUnit;
    const tempContext = agent.getContext('temperature');
    const originalTemp = tempContext.parameters.temperature;
    const originalUnit = tempContext.parameters.unit;

    // Convert temperature
    let convertedTemp, convertedUnit, temperatureHistoryText, temperatureHistoryImage;
    if (secondUnit === `Kelvin`) {
      convertedTemp = originalTemp === 'Celsius' ? originalTemp + 273.15 : (originalTemp-32)*(5/9) + 273.15;
      convertedUnit = `Kelvin`;
      temperatureHistoryText = 'Here is a picture of the namesake of the Rankine unit, William John Macquorn Rankine:';
      temperatureHistoryImage = new Image(wikipediaKelvinImageUrl);
    } else if (secondUnit === `Rankine`) {
      convertedTemp = originalTemp === 'Fahrenheit' ? originalTemp + 459.67 : originalTemp*(9/5) + 32 + 459.67; 
      convertedUnit = `Rankine`;
      temperatureHistoryText = 'Here is a picture of the namesake of the Kelvin unit, Lord Kelvin:';
      temperatureHistoryImage = new Image(wikipediaRankineImageUrl);
    }

    // Set `temperature` context lifetime to zero
    // to reset the conversational state and parameters
    agent.setContext({name: 'temperature', lifespan: 0});

    // Compile and send response
    agent.add(`${originalTemp}° ${originalUnit} is  ${convertedTemp}° ${convertedUnit}. ` + temperatureHistoryText);
    agent.add(new Image(temperatureHistoryImage));
    agent.add(`Go ahead and say another temperature to get the conversion.`);
    agent.add(new Suggestion(`27° Celsius`));
    agent.add(new Suggestion(`-40° Fahrenheit`));
    agent.add(new Suggestion(`Cancel`));
  }

  function fallback(agent) {
    agent.add(`Woah! Its getting a little hot in here.`);
    agent.add(`I didn't get that, can you try again?`);
  }

  let intentMap = new Map(); // Map functions to Dialogflow intent names
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('task', task);
   intentMap.set('Book Shipment', bookShipment);
  
  intentMap.set('Convert Rankine and Kelvin', convertRankineAndKelvin);
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);
});
