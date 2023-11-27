import React, { useEffect, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { LineLayer, PathLayer, COORDINATE_SYSTEM, OrbitView, BitmapLayer, SimpleMeshLayer } from 'deck.gl';
import {
  Container, connectToHarmowareVis, LoadingIcon, FpsDisplay ,DepotsLayer
} from 'harmoware-vis';
import Controller from '../components';
import VideoController from '../components/videoControl'
import {registerLoaders} from '@loaders.gl/core';
import {OBJLoader} from '@loaders.gl/obj';

registerLoaders([OBJLoader]);

/*
const INITIAL_VIEW_STATE = {
 target: [0, 0, 0],
  rotationX: 90,
  rotationOrbit: 0,
  zoom: 3.0
};
*/

const INITIAL_VIEW_STATE = {
  target: [32.69, -18.19,0],
  rotationX: 90,
  rotationOrbit: 0,
  zoom: 2.34
};


const App = (props)=>{
  const [now, setNow] = React.useState(new Date())
  const [imgdispMode, setImgdispMode] = React.useState(true)
  const [dispStart, setDispStart] = React.useState(false)
  const [dispStart2, setDispStart2] = React.useState(false)
  const [imglist, setImgList] = React.useState([])
  const [layerlist, setLayerList] = React.useState([])
  const [srclist, setSrcList] = React.useState([])
  const [opacity, setOpacity] = React.useState(0.5)
  const videoRef = React.useRef(undefined);
  const [vSzRate, setVSzRate] = React.useState(0.05)
  const [vShiftX, setVShiftX] = React.useState(0)
  const [vShiftY, setVShiftY] = React.useState(0)
  const [videoUrl, setVideoUrl] = React.useState(undefined)

  const [pathData, setPathData] = React.useState([])

  const [state,setState] = useState({ popup: [0, 0, ''] })
  const [viewState, updateViewState] = useState(INITIAL_VIEW_STATE);
  const [imgRef, setImgRef] = useState([])
  const [canvasRef, setCanvasRef] = useState([])
  const [bounds, setBounds] = useState([])
  const [context, setContext] = useState([])
  const [imgSize, setImgSize] = useState([])
  const [imgDispSize, setImgDispSize] = useState([])
  const [trimSize, setTrimSize] = useState([])
  const [imgId, setImgId] = useState(null)
  const [imgIdIdx,setImgIdIdx] = useState(-1)
  const [update, setUpdate] = useState([])
  const [size3d, setSize3d] = useState([])
  const [deg3d, setDeg3d] = useState([])
  const [pos3d, setPos3d] = useState([])
  const [aspect, setAspect] = useState([])
  const [z_order, setzOrder] = useState([])
  const [imgLock, setImgLock] = useState([])
  const [imgOpacity, setImgOpacity] = React.useState([])
  const [videospeed, setVideoSpeed] = useState(1)
  const [demoMode, setDemoMode] = useState(0)
  const [worker,setWorker] = useState(undefined)    // WebWorker (MQTT 通信用)
  const [lmarker, setLmarker] = useState(undefined) // 左マーカー位置
  const [rmarker, setRmarker] = useState(undefined) // 右マーカー位置

  const [vstartTime, setVstarttime] = useState(0) // ビデオ開始秒 (h*3600+m*60+s)
  const vStartTimeRef = useRef(vstartTime);

  useEffect(() => {
    vStartTimeRef.current = vstartTime;
  }, [vstartTime]);

  const [vendTime, setVendtime] = useState(0)     // ビデオ終了秒 

  const { actions, viewport, loading, settime, timeLength, ExtractedData:movedData, movesbase, depotsData } = props;


  // ビデオの時刻と実時刻との対応を行う必要がある
  // 本来は設定ファイルで作るべき。今回は面倒なのでやらない

  const send_timeinfo = () =>{
        // ここで、MQTT にビデオの長さと時刻を送るべき
        // ビデオの長さ（実際の）：タイムスタンプとは関係ない。videoRef.current.player.duration
        //　今回は固定で、スタート時間は　7:00:30 , 終了は 14:25:00 とする。（大人都合？）
    if (worker != undefined){
          const jsobj = 
          {
            "startTime":"2023-07-13 07:00:30",
            "endTime": "2023-07-13 14:25:00"
          }
          const st = new Date("2023-07-13 07:00:30"); // UTC?? どうする？
          const ed = new Date("2023-07-13 14:25:00"); // UTC?? どうする？
          setVstarttime(st.getTime());
          setVendtime(ed.getTime());
          console.log("Set start!")
          worker.postMessage("W"+JSON.stringify(jsobj))
    }

  }

  // MQTT で指示された時刻に設定
  const video_MQTT_SetTime = (timeStr)=>{
      const d = Date.parse(timeStr);
      const diff = d.getTime()-vstartTime; 
      const rdiff = vendTime- vstartTime;
      if(videoUrl){
        if(videoRef.current && videoRef.current.player){
          const dur = videoRef.current.player.duration;
          const setTm = dur *diff / rdiff;
          videoRef.current.player.currentTime = setTm;
        }      
      }
  }

  const video_getTime =()=>{
    if(videoUrl){
      if(videoRef.current && videoRef.current.player){
        const dur = videoRef.current.player.duration;
        const cur = videoRef.current.player.currentTime;
//        const rdiff = vendTime- vstartTime;
 //       const rdiff = 26670 // 14:25:00- 07:00:30
        const sec = 26670*cur/dur;
        const currentTime = new Date(vStartTimeRef.current + (sec*1000));
        return currentTime;
        // ここに starTime を本当は使うべき
          const h = "0"+(sec/3600|0);
          const m = "0"+((sec-h*3600)/60|0);
          const s = "0"+((sec - h*3600-m*60)|0);
          return h.slice(-2)+":"+m.slice(-2)+":"+s.slice(-2)
//        const dt = new Date(utim);
//       console.log("CurrentTime",dur,cur, rdiff,utim,dt);

//        return dt.toISOString();
      }      
    }
    return undefined;
  }

  const videoplay = ()=>{
    if(videoUrl){
      if(videoRef.current && videoRef.current.player){
        send_timeinfo();

        videoRef.current.player.play()
      }
    }else
    if(timeLength > 0){
      actions.setAnimatePause(false);
    }
  }
  const videopause = ()=>{
    if(videoUrl){
      if(videoRef.current && videoRef.current.player){
        videoRef.current.player.pause()
      }
    }else
    if(timeLength > 0){
      actions.setAnimatePause(true);
    }
  }
  const videorestart = ()=>{
    if(videoUrl){
      if(videoRef.current && videoRef.current.player){
        videoRef.current.player.restart()
      }
    }else
    if(timeLength > 0){
      actions.setTime(0)
      actions.setAnimatePause(false);
    }
  }

  const setMovesLoad = (url)=>{

    actions.setLoading(true);
    actions.setMovesBase([]);
    fetch(url)
     .then((response)=>response.json())
     .then((readdata) =>{
        console.log("ReadData",readdata);
        if (!Array.isArray(readdata)) { // Not Array?
          const { movesbase } = readdata;
          if (!movesbase) {
              actions.setLoading(false);
              window.alert(i18n.formatError);
              return;
          }
          configLoad(readdata)
          actions.setMovesBase(readdata);
        }
        actions.setAnimatePause(true);
        actions.setLoading(false);   
    })

  }

  React.useEffect(()=>{
    if (worker == undefined){
      setWorker( new Worker("worker.js"));
      console.log("Worker initialized!");
    }},[]);


  // 2つの depot marker (3D marker from MQTT) のどちらかが生きてるか。
  React.useEffect(()=>{
    const markers = [];
    if (lmarker != undefined) markers.push(lmarker);
    if (rmarker != undefined) markers.push(rmarker);
    actions.setDepotsBase(markers);
  },[lmarker,rmarker]);

    // 2つの depot marker (3D marker from MQTT) のどちらかが生きてるか。
  React.useEffect(()=>{
    console.log("Effect for vstartTime,endtime",vstartTime,vendTime)
  },[vstartTime,vendTime]);

  React.useEffect(()=>{
    if (worker != undefined){
      console.log("Worker defined and set eventlistener");
      send_timeinfo()
      worker.addEventListener("message",(e)=>{
//        console.log("from Worker",e);
        // ここでメッセージを解釈する
        const cmd = e.data.substring(0,3);
        const msg = e.data.substr(4);
//        console.log(msg);
        const js = JSON.parse(msg);
        switch(cmd){
          case 'FLR':
            console.log("floor",js)

            if (js.control.action =="setTime"){
              // video settime
                video_MQTT_SetTime(js.control.value);
            }else if (js.control.action == "prevTime"){
              const cur = videoRef.current.player.currentTime;
              actions.setTime(videoRef.current.player.currentTime-parseInt(js.control.value))                
            }else if (js.control.action == "forwardTime"){
              const cur = videoRef.current.player.currentTime;
              actions.setTime(videoRef.current.player.currentTime+parseInt(js.control.value))                
                
            
            }else if (js.control.action =="getTime"){
              if(videoRef.current && videoRef.current.player){
                 if (worker != undefined){
                    const vtime =video_getTime().toDateString();
                    const jsobj = {
                        "control": {
                          "action": "addTime",
                          "value": vtime
                        }
                    };
                    worker.postMessage("T"+JSON.stringify(jsobj));
                  }
              } 
            }else if (js.control.value=="start"){
//              console.log("VideoPlay!",videoUrl);
                videoplay();
            }else if (js.control.value =="stop"){
                videopause();
//                console.log("VideoPause!");
            }else if (js.control.value =="mode__"){ // モードはやめておく
              // モードは何種類？
              // 0. ビデオ＋Moves 稼働 
              // 1. ビデオのみ
              // 2. 空白のみ
              // 2. 空白のみ+Moves稼働
              const nextMode = (demoMode +1)%3
              setDemoMode(nextMode)
              console.log("Mode Change",nextMode);
              switch(nextMode){           // 2. 空白のみ
                case 0:
                  setVideoUrl("data/sample.mp4");
                  setMovesLoad("data/analysis.json");
//                  setMovesBase([]);
                  // 
                  break;
                case 1:
                  setVideoUrl("data/2023-07-11-noobject.mp4");
                 setMovesLoad("data/movesbase.json");
                  break;
                case 2:
                  setVideoUrl("data/2023-07-13_070200-070930.mp4");
  //                setMovesBase([]);
                  break;
                case 3:
  //                setMovesLoad("data/movesbase.json");
                  break;
              }
            }
            break;       
         
          case 'PLL':// click x, y
          // Unity XY: -0.76-0.8, Y : -0.93. 0.33
            var x = 640-(js.x+0.76)*640/1.56;
            var y = (js.y+0.93)*512/1.26;
            if (js.x == 0 && js.y ==0){
              setLmarker(undefined);
            }else if (x >=0 && y >=0 && x <= 640 && y <512){
              setLmarker({position:[x*100/640-50,40-y*80/512,0],color:[0,255,0]})
            }else{
              setLmarker(undefined);
            } 
            break;
          case 'PLR':// click x, y
              var x = 640-(js.x+0.76)*640/1.56
              var y = (js.y+0.93)*512/1.26
              if (js.x == 0 && js.y ==0){
                setRmarker(undefined);
              }else if (x >=0 && y >=0 && x <= 640 && y <512){
                setRmarker({position:[x*100/640-50,40-y*80/512,0],color:[255,0,200]})
              }else{
                setRmarker(undefined);
              } 
              break;
          case 'MRK': // 特定の時刻でマーキングしたい！
            // 現在のビデオの位置をマーキング
            if(videoRef.current && videoRef.current.player){
//              var ct = videoRef.current.player.currentTime;
              if (worker != undefined){
                const vtime =getVideoStrTime();
                const jsobj = {
                  "conttrol": {
                    "action": "addTime",
                    "value": vtime
                  }
                };
                worker.postMessage("T"+JSON.stringify(jsobj));
              } 
            }
            break;

        }
      });
    }
    return ()=>{
      if (worker != undefined){
        worker.terminate(); worker=undefined;
      }
    }
  },[worker]);
    

  React.useEffect(()=>{
    setTimeout(()=>{InitialFileRead({actions, configLoad})},1000)
  },[])

  React.useEffect(function() {
    const intervalId = setInterval(function() {
      setNow(new Date());
    }, 100);
    return function(){clearInterval(intervalId)};
  }, [now]);

  React.useEffect(()=>{
    if(imgId !== null && imgId.includes('BitmapLayer')){
      const value = parseFloat(imgId.match(/[0-9.]+/g)[0])
      setImgIdIdx(value|0)
    }else{
      setImgIdIdx(-1)
    }
  },[imgId])

  const getBounds = (size,deg,pos,imgSize,trimSize)=>{
    const {width:img_width,height:img_height} = imgSize
    const {x:trim_x,y:trim_y,width:trim_width,height:trim_height} = trimSize
    const trimpos = [
      {x:trim_x-(img_width/2),y:(img_height/2)-(trim_y+trim_height)},
      {x:trim_x-(img_width/2),y:(img_height/2)-trim_y},
      {x:(trim_x+trim_width)-(img_width/2),y:(img_height/2)-trim_y},
      {x:(trim_x+trim_width)-(img_width/2),y:(img_height/2)-(trim_y+trim_height)}
    ]
    const trimadeg = trimpos.map((e)=>Math.atan2(e.y,e.x)*180/Math.PI)
    const rate = size/img_width
    const radius = trimpos.map((e,i)=>((e.x*rate)/Math.cos(trimadeg[i]*(Math.PI/180))))
    const rotate_x = trimadeg.map((e,i)=>[radius[i]*Math.cos((deg.z+e)*(Math.PI/180)),radius[i]*Math.sin((deg.z+e)*(Math.PI/180)),0])
    const rotate_y = rotate_x.map((e)=>{
      return [e[0],e[1]*Math.cos((deg.x)*(Math.PI/180)),e[1]*Math.sin((deg.x)*(Math.PI/180))]
    })
    const r2 = rotate_y.map((e)=>Math.sqrt((e[0]**2)+(e[2]**2)))
    const deg2 = rotate_y.map((e)=>Math.atan2(e[0],e[2])*180/Math.PI)
    const rotate_z = rotate_y.map((e,i)=>{
      return [r2[i]*Math.sin((deg.y+deg2[i])*(Math.PI/180)),e[1],r2[i]*Math.cos((deg.y+deg2[i])*(Math.PI/180))]
    })
    return rotate_z.map((e)=>[e[0]+pos.x,e[1]+pos.y,e[2]+pos.z])
  }

  const initProc = ()=>{
    const worksrclist = []
    const workcanvasRef = []
    const workImgSize = []
    const workTrimmSize = []
    const workupdate = []
    const worksize3d = []
    const workdeg3d = []
    const workpos3d = []
    const workaspect = []
    const workzOrder = []
    const workimgLock = []
    const workimgOpacity = []
    for(let i=0; i<imglist.length; i=i+1){
      const img = imglist[i]
      const shift = i%10
      worksrclist.push(img.src)
      workImgSize.push({width:0,height:0})
      workTrimmSize.push(img.trim !== undefined ? img.trim : {x:0,y:0,width:0,height:0})
      workcanvasRef.push(undefined)
      workupdate.push(0)
      worksize3d.push(img.size !== undefined ? img.size : 20)
      workdeg3d.push(img.deg !== undefined ? img.deg : {x:0, y:0, z:0})
      workpos3d.push(img.pos !== undefined ? img.pos : {x:(shift*10-50), y:(shift*10-50), z:i*2})
      workaspect.push([0,0,0,0])
      workzOrder.push(100)
      workimgLock.push(false)
      workimgOpacity.push(1)
    }
    setSrcList(worksrclist)
    setCanvasRef(workcanvasRef)
    setImgSize(workImgSize)
    setImgDispSize(workImgSize)
    setTrimSize(workTrimmSize)
    setUpdate(workupdate)
    setSize3d(worksize3d)
    setDeg3d(workdeg3d)
    setPos3d(workpos3d)
    setAspect(workaspect)
    setzOrder(workzOrder)
    setImgLock(workimgLock)
    setImgOpacity(workimgOpacity)
    setImgId(null)
    setImgIdIdx(-1)
  }

  React.useEffect(()=>{
    actions.setInitialViewChange(false);
    actions.setSecPerHour(3600);
    actions.setLeading(0);
    actions.setTrailing(0);
    actions.setAnimatePause(true);
    actions.setExtractedDataFunc(getExtractedDataFunc)
    initProc()
    if(videoRef.current && videoRef.current.player){
      videoRef.current.player.on("playing",()=>{
        actions.setTimeBegin(0)
        actions.setTimeLength(videoRef.current.player.duration)
      })
      send_timeinfo()
      videoRef.current.player.on("error",(error)=>{
        console.log({error})
      })
    }
  },[worker])

  React.useEffect(()=>{
    initProc()
    if(App.timeoutID){
      clearTimeout(App.timeoutID)
      App.timeoutID = undefined
    }
    if(imglist.length > 0){
      App.timeoutID = setTimeout(()=>{setDispStart(true)},100000);
    }else{
      setDispStart(false)
    }
  },[imglist])

  React.useEffect(()=>{
    if(App.timeoutID2){
      clearTimeout(App.timeoutID2)
      App.timeoutID2 = undefined
    }
    if(dispStart){
      App.timeoutID2 = setTimeout(()=>{setDispStart2(true)},1000);
      setTimeout(()=>{layerUpdate(update)},5000);
    }else{
      setDispStart2(false)
    }
  },[dispStart])

  const layerUpdate = (update)=>{
    const wkupdate = [...update]
    const length = update.length
    for(let i=0; i<length; i=i+1){
      wkupdate[i] = update[i]?0:1
    }
    setUpdate(wkupdate)
  }

  React.useEffect(()=>{
    const wklayerlist = imglist.map((e,i)=>({idx:i,z_order:z_order[i]}))
    wklayerlist.sort((a, b) => (a.z_order - b.z_order))
    setLayerList(wklayerlist)
  },[imglist,z_order])

  React.useEffect(()=>{
    if(imgIdIdx === -1){
      const workBounds = []
      const wkupdate = [...update]
      const length = Math.min(size3d.length,deg3d.length,pos3d.length,trimSize.length,update.length)
      for(let i=0; i<length; i=i+1){
        workBounds[i] = getBounds(size3d[i],deg3d[i],pos3d[i],imgSize[i],trimSize[i])
        wkupdate[i] = update[i]?0:1
      }
      setBounds(workBounds)
      setUpdate(wkupdate)
    }else{
      const workBounds = [...bounds]
      workBounds[imgIdIdx] = getBounds(size3d[imgIdIdx],deg3d[imgIdIdx],pos3d[imgIdIdx],imgSize[imgIdIdx],trimSize[imgIdIdx])
      setBounds(workBounds)
      const wkupdate = [...update]
      wkupdate[imgIdIdx] = update[imgIdIdx]?0:1
      setUpdate(wkupdate)
    }
  },[dispStart,imgIdIdx,size3d,deg3d,pos3d,imgSize,trimSize])

  React.useEffect(()=>{
    if(imgDispSize.length === 0){
      return
    }
    if(imgDispSize.every((el)=>el.width>0 && el.height>0)){
      if(App.timeoutID){
        clearTimeout(App.timeoutID)
        App.timeoutID = undefined
      }
      if(!dispStart){
        setDispStart(true)
      }
      return
    }
    const wkImgRef = document.getElementsByClassName('img_handler')
    const workImgSize = []
    const workImgDispSize = []
    const workTrimmSize = []
    const workaspect = []
    const workzOrder = []
    const workimgLock = []
    const workimgOpacity = []
    for(let i=0; i<wkImgRef.length; i=i+1){
      workImgSize.push({width:wkImgRef[i].naturalWidth,height:wkImgRef[i].naturalHeight})
      const deg = Math.atan2(wkImgRef[i].naturalHeight,wkImgRef[i].naturalWidth)*180/Math.PI
      workaspect.push([180+deg,180-deg,deg,360-deg])
      workImgDispSize.push({width:wkImgRef[i].clientWidth,height:wkImgRef[i].clientHeight})
      workTrimmSize.push({x:0,y:0,width:wkImgRef[i].naturalWidth,height:wkImgRef[i].naturalHeight})
      workzOrder.push(100)
      workimgLock.push(false)
      workimgOpacity.push(1)
    }
    setImgRef(wkImgRef)
    setImgSize(workImgSize)
    setImgDispSize(workImgDispSize)
    for(let i=0; i<imglist.length; i=i+1){
      if(imglist[i].trim !== undefined){
        workTrimmSize[i] = imglist[i].trim
        const deg = Math.atan2(imglist[i].trim.height,imglist[i].trim.width)*180/Math.PI
        workaspect[i] = [180+deg,180-deg,deg,360-deg]
      }
      if(imglist[i].z_order !== undefined){
        workzOrder[i] = imglist[i].z_order
      }
      if(imglist[i].imgLock !== undefined){
        workimgLock[i] = imglist[i].imgLock
      }
      if(imglist[i].imgOpacity !== undefined){
        workimgOpacity[i] = imglist[i].imgOpacity
      }
    }
    setAspect(workaspect)
    setzOrder(workzOrder)
    setImgLock(workimgLock)
    setImgOpacity(workimgOpacity)
    setTrimSize(workTrimmSize)
  },[now,imglist])

  React.useEffect(()=>{
    const workCanvasRef = document.getElementsByClassName('canvas_handler')
    const workContext = []
    for(let i=0; i<workCanvasRef.length; i=i+1){
      if(workContext[i] === undefined){
        workContext[i] = workCanvasRef[i].getContext('2d');
      }
    }
    setContext(workContext)
    setCanvasRef(workCanvasRef)
  },[now,imglist])

  React.useEffect(()=>{
    if(dispStart && imgRef.length > 0 && canvasRef.length > 0 && imgRef.length === canvasRef.length){
      if(imgIdIdx === -1){
        for(let i=0; i<context.length; i=i+1){
          const {width:dspwidth,height:dspheight} = imgDispSize[i] !== undefined ? imgDispSize[i] : {width:0,height:0}
          const {x,y,width:trimwidth,height:trimheight} = trimSize[i]
          context[i].clearRect(0,0,dspwidth,dspheight)
          if(imgdispMode){
            context[i].drawImage(imgRef[i], x, y, trimwidth, trimheight, 0, 0, trimwidth, trimheight)
          }else{
            context[i].fillStyle = imgLock[i]?"green":"blue";
            context[i].fillRect(0, 0, trimwidth, trimheight)
            context[i].strokeStyle = "white"
            context[i].lineWidth = 5
            context[i].strokeRect(0, 0, trimwidth, trimheight)
            context[i].fillStyle = "white"
            context[i].font = "80px monospace"
            context[i].fillText(imglist[i].src,100,150,trimwidth-200)
            context[i].fillText(`z_order:${z_order[i]}`,100,250,trimwidth-200)
            context[i].fillText(`size:${size3d[i]}`,100,350,trimwidth-200)
            const top = trimSize[i].y
            const bottom = imgSize[i].height-trimSize[i].y-trimSize[i].height
            const left = trimSize[i].x
            const right = imgSize[i].width-trimSize[i].x-trimSize[i].width
            context[i].fillText(`trim:[${top},${bottom},${left},${right}]`,100,450,trimwidth-200)
          }
        }
      }else{
        const {width:dspwidth,height:dspheight} = imgDispSize[imgIdIdx] !== undefined ? imgDispSize[imgIdIdx] : {width:0,height:0}
        const {x,y,width:trimwidth,height:trimheight} = trimSize[imgIdIdx]
        context[imgIdIdx].clearRect(0,0,dspwidth,dspheight)
        if(imgdispMode){
          context[imgIdIdx].drawImage(imgRef[imgIdIdx], x, y, trimwidth, trimheight, 0, 0, trimwidth, trimheight)
        }else{
          context[imgIdIdx].fillStyle = imgLock[imgIdIdx]?"green":"blue";
          context[imgIdIdx].fillRect(0, 0, trimwidth, trimheight)
          context[imgIdIdx].strokeStyle = "white"
          context[imgIdIdx].lineWidth = 5
          context[imgIdIdx].strokeRect(0, 0, trimwidth, trimheight)
          context[imgIdIdx].fillStyle = "white"
          context[imgIdIdx].font = "80px monospace"
          context[imgIdIdx].fillText(imglist[imgIdIdx].src,100,150,trimwidth-200)
          context[imgIdIdx].fillText(`z_order:${z_order[imgIdIdx]}`,100,250,trimwidth-200)
          context[imgIdIdx].fillText(`size:${size3d[imgIdIdx]}`,100,350,trimwidth-200)
          const top = trimSize[imgIdIdx].y
          const bottom = imgSize[imgIdIdx].height-trimSize[imgIdIdx].y-trimSize[imgIdIdx].height
          const left = trimSize[imgIdIdx].x
          const right = imgSize[imgIdIdx].width-trimSize[imgIdIdx].x-trimSize[imgIdIdx].width
          context[imgIdIdx].fillText(`trim:[${top},${bottom},${left},${right}]`,100,450,trimwidth-200)
      }
      }
    }
  },[dispStart,dispStart2,imgDispSize,trimSize,imgdispMode,imgIdIdx,imgLock])

  React.useEffect(()=>{
    window.onkeydown = (e)=>{
      if(e.isTrusted === true && e.altKey === false && e.code === "KeyH" && e.ctrlKey === false &&
        e.key === "h" && e.repeat === false && e.shiftKey === false && e.type === "keydown"){
        App.panel = !App.panel
      }
      if(e.isTrusted === true && e.altKey === false && e.code === "KeyL" && e.ctrlKey === false &&
        e.key === "l" && e.repeat === false && e.shiftKey === false && e.type === "keydown"){
          App.pathDisp = !App.pathDisp
      }
    }
  },[])

  React.useEffect(()=>{
    if(videoUrl && videoRef.current && videoRef.current.player){
      const {currentTime} = videoRef.current.player
      if(currentTime <= timeLength){
        if(Math.abs(settime - currentTime) >= (1/120)){
          actions.setTime(currentTime)
        }
      }
    }
  })

  const getExtractedDataFunc = (props)=>{
    const { movesbase, settime, timeLength, iconGradation } = props;
    const movedData = movesbase.reduce((movedData,movesbaseElement,movesbaseidx)=>{
      const { departuretime, arrivaltime, operation, ...otherProps1 } = movesbaseElement;
      if(timeLength > 0 && departuretime <= settime && settime < arrivaltime){
        const nextidx = operation.findIndex((data)=>data.elapsedtime > settime);
        const idx = (nextidx-1)|0;
        // 副作用として現在時刻を送信
        if (worker != undefined){
          const vtime =video_getTime().toDateString();
          console.log(vtime);
          const jsobj = {
              "currentTime": vtime
          };
          worker.postMessage("W"+JSON.stringify(jsobj));
        }

        if(operation[idx].position === undefined || operation[nextidx].position === undefined){
          const {elapsedtime, ...otherProps2} = operation[idx];
          movedData.push(Object.assign({},
            otherProps1, otherProps2, { settime, movesbaseidx },
          ));
//          console.log("extract",worker,idx);

        }else{
          const { elapsedtime, position:sourcePosition,
            boxWidth:sourceBoxWidth=5, boxHeight:sourceBoxHeight=5,
            color:sourceColor=[0, 255, 0], direction=0, ...otherProps2 } = operation[idx];
          const { elapsedtime:nextelapsedtime, position:targetPosition,
            boxWidth:targetBoxWidth=5, boxHeight:targetBoxHeight=5,
            color:targetColor=[0, 255, 0] } = operation[nextidx];
          const rate = (settime - elapsedtime) / (nextelapsedtime - elapsedtime);
          const position = sourcePosition.map((sourcePos,idx)=>sourcePos-(sourcePos-targetPosition[idx])*rate)
          const boxWidth = sourceBoxWidth-(sourceBoxWidth-targetBoxWidth)*rate
          const boxHeight = sourceBoxHeight-(sourceBoxHeight-targetBoxHeight)*rate
//          console.log("extract2",worker,idx);
          if (worker != undefined){
            const obj = operation[idx]
            if (obj.type == 0 || !obj.name.startsWith('item')){
              const jsobj = 
              {"worker":{"name": obj.name, "image": obj.id,
                "x":obj.position[0],
                "y":obj.position[1],
                "dist":obj.dist,
                "time":obj.worksec,
               }}
              worker.postMessage("W"+JSON.stringify(jsobj))
            }else{
              const jsobj = 
              {"item":{"name": obj.name, "image": obj.id,
                "x":obj.position[0],
                "y":obj.position[1],
               }}
               worker.postMessage("W"+JSON.stringify(jsobj))
                            
            }
          }else{
            console.log("Worker is undefined!",worker)
          }
          const color = iconGradation ? 
            sourceColor.map((sourceCol,idx)=>(sourceCol+rate*(targetColor[idx]-sourceCol))|0) : sourceColor;
          movedData.push(Object.assign({}, otherProps1, otherProps2,
            { nextidx, position, boxWidth, boxHeight, color, movesbaseidx},
          ));
        }
      }
      return movedData;
    },[]);
    return [...movedData]
  }

  React.useEffect(()=>{
    if(App.pathDisp && movedData !== undefined && movedData.length > 0){
      const pathData = movedData.reduce((pathData,movedData)=>{
        const {movesbaseidx,nextidx} = movedData
        const {operation} = movesbase[movesbaseidx]
        for(let i=0; i<nextidx; i=i+1){
          const lineData = {}
          lineData.sourcePosition = operation[i].position
          if(i < (nextidx-1)){
            lineData.targetPosition = operation[i+1].position
          }else{
            lineData.targetPosition = movedData.position
          }
          const {color=[0, 255, 0],lineWidth=1} = operation[i]
          lineData.color = color
          lineData.lineWidth = lineWidth
          pathData.push(lineData)
        }
        return pathData
      },[])
      setPathData(pathData)
    }
  },[App.pathDisp,movedData])

  React.useEffect(()=>{
    if(!App.pathDisp){
      setPathData([])
    }
  },[App.pathDisp])

  const getRootLayers = ()=>{
    if(App.pathDisp && pathData.length > 0){
      return new LineLayer({
        id: `RootLayer`,
        data: pathData,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        widthUnits:'common',
        getColor: (x)=>[100,0,100,100],
        getWidth: (x)=>0.3,
      })
    }
    return null
  }

  const getPath = (x)=>{
    const {position:centerpos=[0,0,0],boxWidth:wd=5,boxHeight:ht=5} = x
    const pos  = [centerpos[0]-(wd/2),centerpos[1]+(ht/2),centerpos[2]]
    return [pos,[pos[0]+wd,pos[1],pos[2]],[pos[0]+wd,pos[1]-ht,pos[2]],[pos[0],pos[1]-ht,pos[2]],pos]
  }

  const getFrameLayers = ()=>{
    if(movedData !== undefined && movedData.length > 0){
      return new PathLayer({
        id: `FrameLayer`,
        data: movedData,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPath,
        getColor: (x)=>x.color || [0,255,0,255],
        getWidth: (x)=>x.lineWidth || 1,
        pickable: true,
        onHover,
      })
    }
    return null
  }
  const getDepotLayers = ()=>{
    if(depotsData.length > 0){
      return  new DepotsLayer(
      {
        depotsData,
      optionVisible: state.depotOptionVisible,
      optionChange: state.optionChange,
      iconChange: state.iconChange,
      getRadius: (i)=>1,
      onHover,
      sizeScale: 1,
      wireframe: true,
      })
    }
    
    return null
  }

  const getLayers = ()=>{
    if(dispStart2){
      return layerlist.map((e)=>{
        return new BitmapLayer({
          id: `BitmapLayer-${e.idx}-${update[e.idx]}-${imgdispMode}`,
          image: canvasRef[e.idx],
          bounds: bounds[e.idx],
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          pickable: true,
          onClick,
          opacity: imgdispMode?imgOpacity[e.idx]:0.5,
        })
      })
    }
    return null
  }

  const configLoad = (readdata)=>{
    if (Array.isArray(readdata)) {
      return
    }
    const {videoUrl,videoSizeRate,videoShiftX,videoShiftY,imageDefUrl} = readdata
    if(videoUrl !== undefined){
      if(videoUrl === ""){
        setVideoUrl(undefined)
      }else{
        setVideoUrl(videoUrl)
      }
    }
    if(videoSizeRate !== undefined){
      setVSzRate(videoSizeRate)
    }
    if(videoShiftX !== undefined){
      setVShiftX(videoShiftX)
    }
    if(videoShiftY !== undefined){
      setVShiftY(videoShiftY)
    }
    if(imageDefUrl !== undefined){
      ImageFileRead({setImgList,imageDefUrl})
    }
  }

  const getVideoLayers = ()=>{
    if(videoUrl && videoRef.current && videoRef.current.videoRef.current){
      const {videoWidth=1,videoHeight=1} = videoRef.current.videoRef.current
      const x = (videoWidth/2)*vSzRate
      const y = (videoHeight/2)*vSzRate
      return new BitmapLayer({
        id: `VideoLayer`,
        image: videoRef.current.videoRef.current,
        bounds: [[(-x)+vShiftX,(-y)+vShiftY,0],[(-x)+vShiftX,y+vShiftY,0],[x+vShiftX,y+vShiftY,0],[x+vShiftX,(-y)+vShiftY,0]],
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      })
    }
    return null
  }

  React.useEffect(()=>{
    if(videoUrl === undefined){
      actions.setTimeLength(0)
    }else{
      actions.setAnimatePause(true);
    }
  },[videoUrl])

  const videoSetTime = (setTime)=>{
    if(videoUrl){
      if(videoRef.current && videoRef.current.player){
        videoRef.current.player.currentTime = setTime
      }
    }else
    if(timeLength > 0){
      actions.setTime(setTime)
    }
  }

  const videoSetSpeed = (setSpeed)=>{
    if(videoUrl){
      if(videoRef.current && videoRef.current.player){
        setVideoSpeed(setSpeed);
        videoRef.current.player.speed = setSpeed
      }
    }
  }

  const getImgCanvas = ()=>{
    return imglist.map((element,idx)=>{
      const {width,height} = imgSize[idx] !== undefined ? imgSize[idx] : {width:0,height:0}
      const {width:dspwidth,height:dspheight} = imgDispSize[idx] !== undefined ? imgDispSize[idx] : {width:0,height:0}
      const {x,y,width:trimwidth,height:trimheight} = trimSize[idx] !== undefined ? trimSize[idx] : {x:0,y:0,width:0,height:0}
      return(<div key={idx}>
        <img draggable={false} className='img_handler' src={element.src} width={`${width?width:dspwidth}px`} height={`${height?height:dspheight}px`}/>
        <canvas className='canvas_handler' width={`${trimwidth}px`} height={`${trimheight}px`} ></canvas>
      </div>)
    })
  }

  const arrStrConv = (value)=>Array.isArray(value)?`[${value.map(el=>arrStrConv(el))}]`:value.toString()

  const onHover = (el)=>{
    if (el && el.object) {
      let disptext = '';
      const objctlist = Object.entries(el.object);
      for (let i = 0, lengthi = objctlist.length; i < lengthi; i=(i+1)|0) {
        const strvalue = arrStrConv(objctlist[i][1]);
        disptext = disptext + (i > 0 ? '\n' : '');
        disptext = disptext + (`${objctlist[i][0]}: ${strvalue}`);
      }
      setState({ ...state, popup: [el.x, el.y, disptext] });
    } else {
      setState({ ...state, popup: [0, 0, ''] });
    }
  }

  const onClick = (el)=>{
    if (el && el.layer) {
      //console.log(`el:${el}`)
      console.log({el})
      setImgId(el.layer.id)
    }
  }

  const getOutputData = ()=>{
    return imglist.map((el,idx)=>{
      const data = {src: el.src}
      data.trim = trimSize[idx]
      if(size3d[idx] !== 20){
        data.size = size3d[idx]
      }
      if(deg3d[idx].x !== 0 || deg3d[idx].y !== 0 || deg3d[idx].z !== 0){
        data.deg = deg3d[idx]
      }
      data.pos = pos3d[idx]
      if(z_order[idx] !== 100){
        data.z_order = z_order[idx]
      }
      if(imgLock[idx] === true){
        data.imgLock = imgLock[idx]
      }
      if(imgOpacity[idx] !== 1){
        data.imgOpacity = imgOpacity[idx]
      }
      return data
    })
  }

  return (
    <Container {...props}>
      <Controller {...props} updateViewState={updateViewState} viewState={viewState} setImgList={setImgList}
        imgId={imgId} setImgId={setImgId} imgIdIdx={imgIdIdx} setImgIdIdx={setImgIdIdx} imgSize={imgSize}
        size3d={size3d} setSize3d={setSize3d} deg3d={deg3d} setDeg3d={setDeg3d} pos3d={pos3d} setPos3d={setPos3d}
        trimSize={trimSize} setTrimSize={setTrimSize} update={update} setUpdate={setUpdate}
        srclist={srclist} getOutputData={getOutputData} aspect={aspect} setAspect={setAspect}
        z_order={z_order} setzOrder={setzOrder} opacity={opacity} setOpacity={setOpacity}
        imgOpacity={imgOpacity} setImgOpacity={setImgOpacity} imgLock={imgLock} setImgLock={setImgLock}
        imgdispMode={imgdispMode} setImgdispMode={setImgdispMode} panel={App.panel} configLoad={configLoad}
        videoplay={videoplay} videopause={videopause} videorestart={videorestart} videoSetTime={videoSetTime}
        videoSetSpeed={videoSetSpeed} videospeed={videospeed}
        vSzRate={vSzRate} setVSzRate={setVSzRate} videoUrl={videoUrl} setVideoUrl={setVideoUrl}
        vShiftX={vShiftX} setVShiftX={setVShiftX} vShiftY={vShiftY} setVShiftY={setVShiftY} />
      <div className="harmovis_area">

      <div className='videoArea'>
        <VideoController ref={videoRef} rate={vSzRate} shift_x={vShiftX} shift_y={vShiftY} videoUrl={videoUrl} />
      </div>

      <DeckGL
          views={new OrbitView({orbitAxis: 'Z', fov: 50})}
          viewState={viewState} controller={{scrollZoom:{smooth:true}}}
          onViewStateChange={v => updateViewState(v.viewState)}
          layers={[
              getVideoLayers(),
              getLayers(),
              getRootLayers(),
              getFrameLayers(),
              getDepotLayers(),
          ]}
      />
      </div>
      <div className="refArea">
        {getImgCanvas()}
      </div>
      <div className="harmovis_footer">
        target:{`[${viewState.target[0]},${viewState.target[1]},${viewState.target[2]}]`}&nbsp;
        rotationX:{viewState.rotationX}&nbsp;
        rotationOrbit:{viewState.rotationOrbit}&nbsp;
        zoom:{viewState.zoom}&nbsp;
      </div>
      <svg width={viewport.width} height={viewport.height} className="harmovis_overlay">
        <g fill="white" fontSize="15">
          {state.popup[2].length > 0 ?
            state.popup[2].split('\n').map((value, index) =>
              <text
                x={state.popup[0] + 10} y={state.popup[1] + (index * 15)}
                key={index.toString()}
              >{value}</text>) : null
          }
        </g>
      </svg>
      <LoadingIcon loading={loading} />
      <FpsDisplay />
    </Container>
  );
}
App.timeoutID = undefined
App.timeoutID2 = undefined
App.panel = true
App.pathDisp = true

export default connectToHarmowareVis(App);

const InitialFileRead = (props)=>{
  const { actions, configLoad } = props;
  actions.setLoading(true);
  actions.setMovesBase([]);

  const file_name = 'moveframedata.json'
  const request = new XMLHttpRequest();
  request.open('GET', `data/${file_name}`);
  request.responseType = 'text';
  request.send();
  request.onload = function() {
    let readdata = null;
    try {
      readdata = JSON.parse(request.response);
    } catch (exception) {
      console.log(file_name, {exception})
      actions.setLoading(false);
      return;
    }
    console.log({readdata})
    configLoad(readdata)
    actions.setInputFilename({ movesFileName: file_name });
    actions.setMovesBase(readdata);
    actions.setAnimatePause(true);
    actions.setLoading(false);
  }
}

const ImageFileRead = (props)=>{
  const { setImgList, imageDefUrl } = props;
  const request = new XMLHttpRequest();
  request.open('GET', imageDefUrl);
  request.responseType = 'text';
  request.send();
  request.onload = function() {
    let readdata = null;
    try {
      readdata = JSON.parse(request.response);
    } catch (exception) {
      return;
    }
    console.log({readdata})
    setImgList(readdata)
  }
}
