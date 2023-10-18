import React from 'react';
import Plyr from 'plyr';

export default class VideoController extends React.Component {
    constructor(props){
        super(props)
        this.videoRef = React.createRef()
        this.player = undefined
    }

    componentDidMount(){
        if(this.videoRef.current){
            if(this.player === undefined){
                this.player = new Plyr(this.videoRef.current,{controls:[]});
                this.player.speed = 1
                this.player.loop = true;
            }
        }
    }
    componentDidUpdate(prevProps){
        if(this.videoRef.current){
            if(this.player === undefined){
                this.player = new Plyr(this.videoRef.current,{controls:[]});
                this.player.speed = 1
                this.player.loop = true;
            }
        }
        if(prevProps.videoUrl !== this.props.videoUrl){
            if(this.player !== undefined && this.props.videoUrl){
                this.player.source = this.props.videoUrl
                this.player.loop = true;
                this.player.restart()
            }
        }
    }

    render(){
        if(this.props.videoUrl){
            const videoWidth = (this.videoRef.current ? this.videoRef.current.videoWidth:0)*0.05
            const videoHeight = (this.videoRef.current ? this.videoRef.current.videoHeight:0)*0.05
            const left = 10 //((window.innerWidth - videoWidth) / 2) + this.props.shift_x
            const bottom = 30 //((window.innerHeight - videoHeight) / 2) + this.props.shift_y
            return (
                <video ref={this.videoRef} width={videoWidth} height={videoHeight}
                    id={this.props.id} muted={true} loop={this.props.loop}
                    style={{"position":"fixed","bottom":`${bottom}px`,"left":`${left}px`}}
                    autoPlay controls={this.props.controls}
                    src={this.props.videoUrl}>
                    非対応の動画データ
                </video>
            )
        }else{
            return (<video ref={this.videoRef} width={0} height={0} id={this.props.id} src={""}/>)
        }
    }
}
VideoController.defaultProps = {
    id:'videoplayer',
    controls: false,
    loop: false,
    rate: 1,
    shift_x:0,
    shift_y:0,
}
