
const mqtt = require("mqtt");  // works under webpack?-> yes!

console.log("Worker start!");

addEventListener('message', e=>{
    console.log("Worker!",e);
    // ここでメインスレッドとの通信を行う！

});


console.log("MQTT worker loaded?",mqtt);

const client = mqtt.connect("ws://192.168.197.14:1884");

client.on('connect', ()=>{
    console.log("MQTT Client Connected");
    client.subscribe("/controller/left", (err)=>{
        if( !err){
            console.log("Subscribed!");
        }
    })
});

client.on('message', (topic,message)=>{
    console.log("Message",topic.toString(),message.toString());

    self.postMessage(message);
    // ここでメインスレッド側に通知する
});

