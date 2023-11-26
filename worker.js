
const mqtt = require("mqtt");  // works under webpack?-> yes!

console.log("Worker start!");
//const client = mqtt.connect("ws://192.168.207.133:1884");
const client = mqtt.connect("ws://192.168.50.200:1884");



console.log("MQTT worker loaded?",mqtt);

//const client = mqtt.connect("ws://broker.emqx.io:8083");

//const client = mqtt.connect("ws://192.168.207.133:1884");

client.on('connect', ()=>{
    console.log("MQTT Client Connected");
    client.subscribe("/controller/left", (err)=>{
        if( !err){
            console.log("Subscribe! left");
        }
    })
    client.subscribe("/controller/right", (err)=>{
        if( !err){
            console.log("Subscribe right");
        }
    })
    client.subscribe("/floor/display", (err)=>{
        if( !err){
            console.log("Subscribed! floor");
        }
    })
});

client.on('message', (topic,message)=>{
// console.log("Message",topic.toString(),message.toString());
    const tpc = topic.toString();
    switch(tpc){
        case '/floor/display':
            self.postMessage("FLR "+message.toString());
            break;
        case '/controller/left':
                self.postMessage("PLL "+message.toString());
            break;
        case '/controller/right':
                self.postMessage("PLR "+message.toString());
            break;
/*     
        case '/video/querytime':// マーキング
                self.postMessage("MRK "+message.toString());
            break;
        case '/video/settime': // 時刻設定
                self.postMessage("VTM "+message.toString());
            break;
*/
        break;
    default:
            console.log("Worker:",topic.toString(),message.toString());

    }
//    self.postMessage(message);
    // ここでメインスレッド側に通知する
});


addEventListener('message', e=>{
//    console.log("FromMainThread!",e);
    // ここでメインスレッドとの通信を行う！
    // wall display だけじゃないはずだけど。。
    const tgt = e.data.substring(0,1);
    const msg = e.data.substr(1);
    switch(tgt){
        case 'W':
            client.publish('/wall/display',msg);
            break;
        case 'T':
            client.publish('/controller/tablet',msg);
            break;
    }
});
