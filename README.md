# p-tokai-demo
Create a "data" directory and copy the image files.


To use Web-Worker MQTT, we use bower to download  library

結論として、 Web Worker 上でも MQTT は使える！
Webpack で　worker.js をコンパイルさせれば、 requireが使えた！

なので、 bower は不要になった。

npm install 
npm start で開発サーバが立ち上がる

Web Worker 上で MQTT を受信
