import React from 'react';

const DEFAULTURL = "data/sample.mp4"

export const VideoInput = (props)=>{
    const inputRef = React.useRef(undefined)
    const [urlCheck,setUrlCheck] = React.useState(false)
    const [value,setValue] = React.useState(DEFAULTURL)
    const { videoUrl, setVideoUrl } = props;

    React.useEffect(()=>{
        setUrlCheck(true)
        setVideoUrl(DEFAULTURL);
    },[])

    React.useEffect(()=>{
        if(videoUrl === undefined){
            setValue("")
        }else{
            setValue(videoUrl)
        }
    },[videoUrl])

    const onClick = ()=>{
        const videoUrl = inputRef.current.value
        const result = (videoUrl !== "") ///^https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+/.test(videoUrl)
        setUrlCheck(result)
        console.log("SetURL:",result, videoUrl);
        if(result){
            setVideoUrl(videoUrl);
        }else{
            setVideoUrl(undefined);
        }
    };

    const onChange = (e)=>{
        const checkStr = e.target.value
        const result = (checkStr !== "" && checkStr !== undefined) ///^https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+/.test(checkStr)
        setUrlCheck(result)
        if(result){
            setValue(checkStr)
        }else{
            setValue("")
        }
    };

    return (
        <>
            <li className="flex_row">
                <input type="url" ref={inputRef} style={{'width':'100%'}}
                onChange={onChange} value={value}/>
            </li>
            <li className="flex_row">
                <button onClick={onClick} style={{'width':'100%'}}
                    className="harmovis_button">{urlCheck?'Set URL':'Please enter URL'}</button>
            </li>
        </>
    );
}
