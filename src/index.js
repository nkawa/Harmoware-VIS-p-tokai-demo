import { render } from 'react-dom';
import { getConfigureStore,connectToHarmowareVis } from 'harmoware-vis';

import { Provider } from 'react-redux';
import React from 'react';
import App from './containers/app';
import 'harmoware-vis/scss/harmoware.scss';
import './scss/local.scss';

//import {Callback, MqttWorker} from '../bower_components/mqtt-worker/dist/MqttWorker.js';

// WebWorker for MQTT/WebSocket
//import Worker from 'web-worker';
//const MqttWorker = require("../bower_components/mqtt-worker/dist/MqttWorker.js");
//console.log("MQTT init",MqttWorker);
//console.log(MqttWorker);
//#var mqtt = new MqttWorker('../bower_components/mqtt-worker/mqttWorker.js');
//console.log("MQTT init done");

var worker = new Worker("worker.js");
worker.postMessage("Hello");
console.log("Run worker");

const store = getConfigureStore();

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);

worker.addEventListener("message",(e)=>{
  console.log("from Worker",e);

})
