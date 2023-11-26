import React, { useState,useMemo } from 'react';
import {PlacementInput} from './placement-input'
import {PlacementOutput} from './placement-output'
import { VideoInput } from './video-input';
import { MovesInput } from './moves-input';

export default class Controller extends React.Component {
  constructor(props){
    super(props)
    this.divRef = React.createRef();
  }

  onClick(buttonType){
    const { viewState, updateViewState } = this.props;
    switch (buttonType) {
      case 'zoom-in': {
        updateViewState({...viewState, zoom:(viewState.zoom+0.25), transitionDuration: 100,})
        break
      }
      case 'zoom-out': {
        updateViewState({...viewState, zoom:(viewState.zoom-0.25), transitionDuration: 100,})
        break
      }
      case 'reset': {
        updateViewState({
          target: [0, 0, 0],
          rotationX: 90,
          rotationOrbit: 0,
          zoom: 3.0,
          transitionDuration: 200,
        })
        break
      }
    }
  }
  setZoom(e){
    const { viewState, updateViewState } = this.props;
    const value = +e.target.value
    updateViewState({...viewState, zoom:value, transitionDuration: 100,})
  }

  componentDidUpdate(prevProps){
    if(prevProps.panel !== this.props.panel){
      this.divRef.current.hidden = !this.props.panel
    }
  }

  onChangeOpacity(e){
    const opacity = +e.target.value
    this.props.setOpacity(opacity)
  }

  setVSzRate(e){
    const vSzRate = +e.target.value
    this.props.setVSzRate(vSzRate)
  }
  setVShiftX(e){
    const vShiftX = +e.target.value
    this.props.setVShiftX(vShiftX)
  }
  setVShiftY(e){
    const vShiftY = +e.target.value
    this.props.setVShiftY(vShiftY)
  }

  onChangeSelect(e){
    const imgIdIdx = +e.target.value
    if(imgIdIdx < 0){
      this.props.setImgId(null)
    }else{
      this.props.setImgId(`BitmapLayer-${imgIdIdx}-${this.props.update[imgIdIdx]}`)
    }
  }

  videoSetTime(e){
    const setTime = +e.target.value
    this.props.videoSetTime(setTime)
  }

  videoSetSpeed(e){
    const setSpeed = +e.target.value
    this.props.videoSetSpeed(setSpeed)
  }


  allPositionController(buttonType){
    const wkpos3d = [...this.props.pos3d]
    for(let i=0; i<wkpos3d.length; i=i+1){
      switch (buttonType) {
        case 'up': {
          wkpos3d[i]['y'] = wkpos3d[i]['y'] + 0.1
          break
        }
        case 'down': {
          wkpos3d[i]['y'] = wkpos3d[i]['y'] - 0.1
          break
        }
        case 'left': {
          wkpos3d[i]['x'] = wkpos3d[i]['x'] - 0.1
          break
        }
        case 'right': {
          wkpos3d[i]['x'] = wkpos3d[i]['x'] + 0.1
          break
        }
      }
    }
    this.props.setPos3d(wkpos3d)
  }

  getImgdispModeChecked(e){
    const value = e.target.checked
    this.props.setImgdispMode(value)
  }



  render() {
    const {setImgList, getOutputData, imgIdIdx, srclist, viewState, settime, timeLength, textTime, configLoad, videospeed,
      videoplay, videopause, videorestart, vSzRate, vShiftX, vShiftY, videoUrl, setVideoUrl, actions, inputFileName } = this.props
    const { movesFileName } = inputFileName;

    const settimeToText= (t)=>{
      // 今回は決め打ちでやろう。
      const sec = (t * 5)+7*3600+30; // ここに starTime を本当は使うべき
      const h = "0"+(sec/3600|0);
      const m = "0"+((sec-h*3600)/60|0);
      const s = "0"+((sec - h*3600-m*60)|0);
      return h.slice(-2)+":"+m.slice(-2)+":"+s.slice(-2)
    }
    return (
        <div className="harmovis_controller" ref={this.divRef} >
            <ul className="flex_list">
            <li className="flex_row">「H」キーでパネル消去</li>
            <li className="flex_row">「L」キーで経路消去</li>
            <VideoInput videoUrl={videoUrl} setVideoUrl={setVideoUrl}/>
            <li className="flex_row">
              <button onClick={videoplay} className='harmovis_button'>PLAY</button>
              <button onClick={videopause} className='harmovis_button'>PAUSE</button>
              <button onClick={videorestart} className='harmovis_button'>RESTART</button>
            </li>
            <li className="flex_row">
              <label htmlFor="VideoSizeRate">{`VideoSizeRate:`}</label>
              <input type="range" value={vSzRate} min={0} max={1} step={0.001} onChange={this.setVSzRate.bind(this)}
                className="harmovis_input_range" id="VideoSizeRate" />:
              <input type="number" value={vSzRate} min={0} max={1} step={0.01} onChange={this.setVSzRate.bind(this)}
                className="harmovis_input_number" id="VideoSizeRate" />
            </li>
            <li className="flex_row">
              <label htmlFor="VideoShiftX">{`VideoShiftX:`}</label>
              <input type="range" value={vShiftX} min={-1000} max={1000} step={0.1} onChange={this.setVShiftX.bind(this)}
                className="harmovis_input_range" id="VideoShiftX" />:
              <input type="number" value={vShiftX} min={-1000} max={1000} step={1} onChange={this.setVShiftX.bind(this)}
                className="harmovis_input_number" id="VideoShiftX" />
            </li>
            <li className="flex_row">
              <label htmlFor="VideoShiftY">{`VideoShiftY:`}</label>
              <input type="range" value={vShiftY} min={-1000} max={1000} step={0.1} onChange={this.setVShiftY.bind(this)}
                className="harmovis_input_range" id="VideoShiftY" />:
              <input type="number" value={vShiftY} min={-1000} max={1000} step={1} onChange={this.setVShiftY.bind(this)}
                className="harmovis_input_number" id="VideoShiftY" />
            </li>
            <li className="flex_row"></li>
            <li className="flex_row">
              <div className="harmovis_input_button_column">
                <label htmlFor="MovesInput">{`Select Moves File`}
                  <MovesInput actions={actions} configLoad={configLoad} id="MovesInput" />
                </label>
                <div>{movesFileName||"file not selected"}</div>
              </div>
            </li>
            <li className="flex_row"></li>
            <li className="flex_row">
              <label htmlFor="currentTime">{`currentTime:`}</label>
              <input type="range" value={settime} min={0} max={timeLength} step={0.2} onChange={this.videoSetTime.bind(this)}
                className="harmovis_input_range" id="currentTime" />
            </li>
            <li className="flex_row">
{/*              <input type="number" value={settime} min={0} max={timeLength} step={0.2} onChange={this.videoSetTime.bind(this)}
                className="harmovis_input_number" id="currentTime" />*/ }
                {`2023/07/13  ${settimeToText(settime)}`}
            </li>
            <li className="flex_row">
              <label htmlFor="speed">{`speed:`}</label>
              <input type="range" value={videospeed} min={0.1} max={5} step={0.1} onChange={this.videoSetSpeed.bind(this)}
                className="harmovis_input_range" id="speed" />
              <input type="number" value={videospeed} min={0.1} max={5} step={0.1} onChange={this.videoSetSpeed.bind(this)}
                className="harmovis_input_number" id="speed" />
               
            </li>

            <li className="flex_row"></li>
            <li className="flex_row">
              <label htmlFor="Zoom">{`Zoom:`}</label>
              <input type="range" value={viewState.zoom} min={0} max={15} step={0.01} onChange={this.setZoom.bind(this)}
                className="harmovis_input_range" id="Zoom" />:
              <input type="number" value={viewState.zoom} min={0} max={15} step={0.1} onChange={this.setZoom.bind(this)}
                className="harmovis_input_number" id="Zoom" />
            </li>
            <li className="flex_row">
              <button onClick={this.onClick.bind(this,'zoom-in')} className='harmovis_button'>＋</button>
              <button onClick={this.onClick.bind(this,'zoom-out')} className='harmovis_button'>－</button>
              <button onClick={this.onClick.bind(this,'reset')} className='harmovis_button'>RESET</button>
            </li>

            <li className="flex_row"></li>
            <li className="flex_row">Select image defFile</li>
            <div className='panel'><PlacementInput setImgList={setImgList}/></div>
            {srclist.length>0?<><li className="flex_row">Save image defFile</li>
            <div className='panel'><PlacementOutput getOutputData={getOutputData}/></div></>:null}
            {/*imgIdIdx<0?
              <li className="flex_row">
                <input type="checkbox" id="imgdispMode" onChange={this.getImgdispModeChecked.bind(this)}
                  className='harmovis_input_checkbox' checked={imgdispMode} />
                <label htmlFor="imgdispMode" title="imgLock">ImgdispMode</label>
              </li>:null
            */}
            {/*<li className="flex_row">
              <label htmlFor="opacity">{`opacity :`}</label>
              <input type="range" value={opacity}
                min={0} max={1} step={0.1}
                onChange={this.onChangeOpacity.bind(this)}
                className="harmovis_input_range" id="opacity" />:
              <input type="number" value={opacity}
                min={0} max={1} step={0.1}
                onChange={this.onChangeOpacity.bind(this)}
                className="harmovis_input_number" id="opacity" />
            </li>*/}
            {srclist.length>0 && imgIdIdx<0?<>
              <li className="flex_row"><label>{`All image pos move:`}</label></li>
              <li className="flex_row">
                <button onClick={this.allPositionController.bind(this,'up')} className='harmovis_button'>↑</button>
                <button onClick={this.allPositionController.bind(this,'down')} className='harmovis_button'>↓</button>
                <button onClick={this.allPositionController.bind(this,'left')} className='harmovis_button'>←</button>
                <button onClick={this.allPositionController.bind(this,'right')} className='harmovis_button'>→</button>
              </li></>:null
            }
            </ul>
            {srclist.length>0?<div className='panel'>
              <select className='local_select' value={imgIdIdx} onChange={this.onChangeSelect.bind(this)}>
              <option value="-1">select img</option>
              {srclist.map((x,i)=><option value={i} key={i}>{x}</option>)}
              </select>
            </div>:null}
            <TransformController {...this.props}/>
        </div>
    );
  }
}
const TransformController = (props)=>{
  const {imgId, imgIdIdx, imgLock } = props

  return (<>{imgId === null || imgIdIdx === -1 ? null:
    <ul className="flex_list">
      <li className="flex_row">Image Item Control</li>
      <ImgLockController {...props} />
      <>{imgLock[imgIdIdx]?null:<>
        <ImgOpacityController {...props} />

        <Z_OrderController {...props} />

        <PositionController {...props} dim={'x'} />
        <PositionController {...props} dim={'y'} />
        <PositionController {...props} dim={'z'} />

        <DegreeController {...props} dim={'x'} />
        <DegreeController {...props} dim={'y'} />
        <DegreeController {...props} dim={'z'} />

        <SizeController {...props} />

        <TrimTopController {...props} />
        <TrimBottomController {...props} />
        <TrimLeftController {...props} />
        <TrimRightController {...props} />
      </>}</>

      <ReleaseButton {...props}/>
    </ul>
    }</>
  )
}
const ImgLockController = (props)=>{
  const { imgIdIdx, imgLock } = props

  const getImgLockChecked = (e)=>{
    const value = e.target.checked
    const wkimgLock = [...imgLock]
    wkimgLock[imgIdIdx] = value
    props.setImgLock(wkimgLock)
  }

  return(<>{useMemo(()=><>
    <li className="flex_row">
      <><input type="checkbox" id="ImgLockChecked" onChange={getImgLockChecked} className='harmovis_input_checkbox' checked={imgLock[imgIdIdx]} />
      <label htmlFor="ImgLockChecked" title="imgLock">imgLock</label></>
    </li>
  </>,[imgIdIdx, imgLock])}</>)
}
const ImgOpacityController = (props)=>{
  const { imgIdIdx, imgOpacity } = props

  const setImgOpacity = (e)=>{
    const value = +e.target.value
    const wkimgOpacity = [...imgOpacity]
    wkimgOpacity[imgIdIdx] = value
    props.setImgOpacity(wkimgOpacity)
  }

  return (<>{useMemo(()=>
    <li className="flex_row">
      <label htmlFor="imgOpacity">{`imgOpacity :`}</label>
      <input type="range" value={imgOpacity[imgIdIdx]}
        min={0} max={1} step={0.1}
        onChange={setImgOpacity}
        className="harmovis_input_range" id="imgOpacity" />:
      <input type="number" value={imgOpacity[imgIdIdx]}
        min={0} max={1} step={0.1}
        onChange={setImgOpacity}
        className="harmovis_input_number" id="imgOpacity" />
    </li>
    ,[imgOpacity[imgIdIdx],imgIdIdx])}</>
  )
}
const Z_OrderController = (props)=>{
  const { imgIdIdx, z_order } = props

  const setZ_order = (e)=>{
    const value = +e.target.value
    const wkz_order = [...z_order]
    wkz_order[imgIdIdx] = value
    props.setzOrder(wkz_order)
  }

  const setTop = ()=>{
    const max = Math.max(...z_order)
    const maxArray = z_order.filter(x=>x===max)
    if(z_order[imgIdIdx] < max || maxArray.length > 1){
      const wkz_order = [...z_order]
      wkz_order[imgIdIdx] = max+1
      props.setzOrder(wkz_order)
    }
  }

  const setBottom = ()=>{
    const min = Math.min(...z_order)
    const minArray = z_order.filter(x=>x===min)
    if(z_order[imgIdIdx] > min || minArray.length > 1){
      const wkz_order = [...z_order]
      wkz_order[imgIdIdx] = min-1
      props.setzOrder(wkz_order)
    }
  }

  return (<>{useMemo(()=>
    <>
    <li className="flex_row">
      <label htmlFor="z_order">{`z_order :`}</label>
      <input type="number" value={z_order[imgIdIdx]}
        min={0} max={200} step={1}
        onChange={setZ_order}
        className="harmovis_input_number" id="z_order" />
    </li>
    <li className="flex_row">
      <button onClick={setTop} className='harmovis_button'>z_order top</button>
      <button onClick={setBottom} className='harmovis_button'>z_order bottom</button>
    </li>
    </>
    ,[z_order,imgIdIdx])}</>
  )
}
const PositionController = (props)=>{
  const { imgIdIdx, pos3d, dim } = props

  const setPos3d = (e)=>{
    const value = +e.target.value
    const wkpos3d = [...pos3d]
    wkpos3d[imgIdIdx][dim] = value
    props.setPos3d(wkpos3d)
  }

  return (<>{useMemo(()=>
    <li className="flex_row">
      <label htmlFor={`pos_${dim}`}>{`pos_${dim} :`}</label>
      <input type="range" value={pos3d[imgIdIdx][dim]}
        min={-1000} max={1000} step={0.1}
        onChange={setPos3d}
        className="harmovis_input_range" id={`pos_${dim}`} />:
      <input type="number" value={pos3d[imgIdIdx][dim]}
        min={-1000} max={1000} step={0.1}
        onChange={setPos3d}
        className="harmovis_input_number" id={`pos_${dim}`} />
    </li>
    ,[pos3d[imgIdIdx][dim],imgIdIdx])}</>
  )
}
const DegreeController = (props)=>{
  const { imgIdIdx, deg3d, dim } = props

  const setDeg3d = (e)=>{
    const value = +e.target.value
    const wkdeg3d = [...deg3d]
    wkdeg3d[imgIdIdx][dim] = value
    props.setDeg3d(wkdeg3d)
  }

  return (<>{useMemo(()=>
    <li className="flex_row">
      <label htmlFor={`rotate_${dim}`}>{`rotate_${dim} :`}</label>
      <input type="range" value={deg3d[imgIdIdx][dim]}
        min={-180} max={180} step={1}
        onChange={setDeg3d}
        className="harmovis_input_range" id={`rotate_${dim}`} />:
      <input type="number" value={deg3d[imgIdIdx][dim]}
        min={-180} max={180} step={1}
        onChange={setDeg3d}
        className="harmovis_input_number" id={`rotate_${dim}`} />deg
    </li>
    ,[deg3d[imgIdIdx][dim],imgIdIdx])}</>
  )
}
const SizeController = (props)=>{
  const { imgIdIdx, size3d } = props

  const setSize3d = (e)=>{
    const value = +e.target.value
    const wksize3d = [...size3d]
    wksize3d[imgIdIdx] = value
    props.setSize3d(wksize3d)
  }

  return (<>{useMemo(()=>
    <li className="flex_row">
      <label htmlFor="size">{`size :`}</label>
      <input type="range" value={size3d[imgIdIdx]}
        min={0} max={1000} step={0.05}
        onChange={setSize3d}
        className="harmovis_input_range" id="size" />:
      <input type="number" value={size3d[imgIdIdx]}
        min={0} max={1000} step={0.05}
        onChange={setSize3d}
        className="harmovis_input_number" id="size" />
    </li>
    ,[size3d[imgIdIdx],imgIdIdx])}</>
  )
}
const TrimTopController = (props)=>{
  const { imgIdIdx, aspect, setAspect, imgSize, trimSize, setTrimSize } = props
  const bottom = imgSize[imgIdIdx].height-trimSize[imgIdIdx].y-trimSize[imgIdIdx].height

  const onChangeTrimTop = (e)=>{
    const top = +e.target.value
    const setTrimmSize = [...trimSize]
    setTrimmSize[imgIdIdx].y = top
    setTrimmSize[imgIdIdx].height = imgSize[imgIdIdx].height-top-bottom
    setTrimSize(setTrimmSize)
    const workaspect = [...aspect]
    const deg = Math.atan2(setTrimmSize[imgIdIdx].height,setTrimmSize[imgIdIdx].width)*180/Math.PI
    workaspect[imgIdIdx] = [180+deg,180-deg,deg,360-deg]
    setAspect(workaspect)
  }

  return (<>{useMemo(()=>
    <li className="flex_row">
      <label htmlFor="trim_top">{`trim_top :`}</label>
      <input type="range" value={trimSize[imgIdIdx].y}
        min={0} max={imgSize[imgIdIdx].height-bottom} step={1}
        onChange={onChangeTrimTop}
        className="harmovis_input_range" id="trim_top" />:
      <input type="number" value={trimSize[imgIdIdx].y}
        min={0} max={imgSize[imgIdIdx].height-bottom} step={1}
        onChange={onChangeTrimTop}
        className="harmovis_input_number" id="trim_top" />px
    </li>
    ,[trimSize[imgIdIdx].y,bottom,imgIdIdx,imgSize[imgIdIdx].height])}</>
  )
}
const TrimBottomController = (props)=>{
  const { imgIdIdx, aspect, setAspect, imgSize, trimSize, setTrimSize } = props
  const top = trimSize[imgIdIdx].y
  const dspbottom = imgSize[imgIdIdx].height-top-trimSize[imgIdIdx].height

  const onChangeTrimBottom = (e)=>{
    const bottom = +e.target.value
    const setTrimmSize = [...trimSize]
    setTrimmSize[imgIdIdx].height = imgSize[imgIdIdx].height-bottom-top
    setTrimSize(setTrimmSize)
    const workaspect = [...aspect]
    const deg = Math.atan2(setTrimmSize[imgIdIdx].height,setTrimmSize[imgIdIdx].width)*180/Math.PI
    workaspect[imgIdIdx] = [180+deg,180-deg,deg,360-deg]
    setAspect(workaspect)
  }

  return (<>{useMemo(()=>
    <li className="flex_row">
      <label htmlFor="trim_bottom">{`trim_bottom :`}</label>
      <input type="range" value={dspbottom}
        min={0} max={imgSize[imgIdIdx].height-trimSize[imgIdIdx].y} step={1}
        onChange={onChangeTrimBottom}
        className="harmovis_input_range" id="trim_bottom" />:
      <input type="number" value={dspbottom}
        min={0} max={imgSize[imgIdIdx].height-trimSize[imgIdIdx].y} step={1}
        onChange={onChangeTrimBottom}
        className="harmovis_input_number" id="trim_bottom" />px
    </li>
    ,[trimSize[imgIdIdx].y,dspbottom,imgIdIdx,imgSize[imgIdIdx].height])}</>
  )
}
const TrimLeftController = (props)=>{
  const { imgIdIdx, aspect, setAspect, imgSize, trimSize, setTrimSize } = props
  const right = imgSize[imgIdIdx].width-trimSize[imgIdIdx].x-trimSize[imgIdIdx].width

  const onChangeTrimLeft = (e)=>{
    const left = +e.target.value
    const setTrimmSize = [...trimSize]
    setTrimmSize[imgIdIdx].x = left
    setTrimmSize[imgIdIdx].width = imgSize[imgIdIdx].width-left-right
    setTrimSize(setTrimmSize)
    const workaspect = [...aspect]
    const deg = Math.atan2(setTrimmSize[imgIdIdx].height,setTrimmSize[imgIdIdx].width)*180/Math.PI
    workaspect[imgIdIdx] = [180+deg,180-deg,deg,360-deg]
    setAspect(workaspect)
  }

  return (<>{useMemo(()=>
    <li className="flex_row">
      <label htmlFor="trim_left">{`trim_left :`}</label>
      <input type="range" value={trimSize[imgIdIdx].x}
        min={0} max={imgSize[imgIdIdx].width-right} step={1}
        onChange={onChangeTrimLeft}
        className="harmovis_input_range" id="trim_left" />:
      <input type="number" value={trimSize[imgIdIdx].x}
        min={0} max={imgSize[imgIdIdx].width-right} step={1}
        onChange={onChangeTrimLeft}
        className="harmovis_input_number" id="trim_left" />px
    </li>
    ,[trimSize[imgIdIdx].x,right,imgIdIdx,imgSize[imgIdIdx].width])}</>
  )
}
const TrimRightController = (props)=>{
  const { imgIdIdx, aspect, setAspect, imgSize, trimSize, setTrimSize } = props
  const left = trimSize[imgIdIdx].x
  const dspright = imgSize[imgIdIdx].width-left-trimSize[imgIdIdx].width

  const onChangeTrimRight = (e)=>{
    const right = +e.target.value
    const setTrimmSize = [...trimSize]
    setTrimmSize[imgIdIdx].width = imgSize[imgIdIdx].width-right-left
    setTrimSize(setTrimmSize)
    const workaspect = [...aspect]
    const deg = Math.atan2(setTrimmSize[imgIdIdx].height,setTrimmSize[imgIdIdx].width)*180/Math.PI
    workaspect[imgIdIdx] = [180+deg,180-deg,deg,360-deg]
    setAspect(workaspect)
  }

  return (<>{useMemo(()=>
    <li className="flex_row">
      <label htmlFor="trim_right">{`trim_right :`}</label>
      <input type="range" value={dspright}
        min={0} max={imgSize[imgIdIdx].width-trimSize[imgIdIdx].x} step={1}
        onChange={onChangeTrimRight}
        className="harmovis_input_range" id="trim_right" />:
      <input type="number" value={dspright}
        min={0} max={imgSize[imgIdIdx].width-trimSize[imgIdIdx].x} step={1}
        onChange={onChangeTrimRight}
        className="harmovis_input_number" id="trim_right" />px
    </li>
    ,[dspright,trimSize[imgIdIdx].x,imgIdIdx,imgSize[imgIdIdx].width])}</>
  )
}
const ReleaseButton = (props)=>{
  const { setImgId } = props

  const onClick = ()=>{
    setImgId(null)
  }

  return (<>{useMemo(()=>
    <li className="flex_row">
      <button onClick={onClick} className='harmovis_button'>release</button>
    </li>
    )}</>
  )
}