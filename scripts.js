// recipe box
var input = document.getElementById("recipe-box");
input.addEventListener("keyup", function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('recipe-links').innerHTML += "<br/> <br/>" + String(input.value);
    }
})


// video calling
let handlefail = function(err){
    console.log(err)
}

let globalStream;
let isAudioMuted= false;
let isVideoMuted= false;

function addVideoStream(streamId){
    let remoteContainer = document.getElementById("remoteStream");
    let streamDiv = document.createElement("div");
    streamDiv.id = streamId;
    streamDiv.style.cssText = 'text-align: left; margin-top: 20px; justify-self: center; margin: auto; border: 2px solid #099dfd; width: 350px; height: 250px; transform: rotateY(180deg); float: left '
    remoteContainer.appendChild(streamDiv);
}



function removeVideoStream(elementId) {
    let remoteDiv = document.getElementById(elementId);
    if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
};


document.getElementById("join").onclick = function () {
    let channelName = "cooking";
    let Username = document.getElementById("username").value;
    let appId = "5e42da1a9aa240db9b3541689381aba2";

    let client = AgoraRTC.createClient({
        mode: "live",
        codec: "h264"
    })

    client.init(appId,() => console.log("AgoraRTC Client Connected"), handlefail);

    client.join(
        null, 
        channelName, 
        Username, 
        () =>{
            var localStream = AgoraRTC.createStream({
                video: true,
                audio: true,
            })

            localStream.init(function(){
                localStream.play("SelfStream");
                client.publish(localStream);
            })

            globalStream = localStream;
        }
    )

    client.on("stream-added", function(evt){
        client.subscribe(evt.stream, handlefail)
    })

    client.on("stream-subscribed", function(evt){
        console.log("Subscribed Stream");
        let stream = evt.stream;
        addVideoStream(stream.getId());
        stream.play(stream.getId());
    })

    client.on("stream-removed", function(evt){
        let stream = evt.stream;
        let streamId = String(stream.getId());
        stream.close();
        removeVideoStream(streamId);
    });

    client.on("peer-leave", function(evt){
        let stream = evt.stream;
        let streamId = String(stream.getId());
        stream.close();
        removeVideoStream(streamId);
    });

}

function removeMyVideoStream(){
    globalStream.stop();
}

document.getElementById("leave").onclick = function () {
    client.leave(function() {
        console.log("Left!")
    },handlefail)
    removeMyVideoStream();
}

document.getElementById("video-mute").onclick = function(){
    if(!isVideoMuted){
        globalStream.muteVideo();
        isVideoMuted = true;
    }else{
        globalStream.unmuteVideo();
        isVideoMuted = false;
    }
}

document.getElementById("audio-mute").onclick = function(){
    if(!isAudioMuted){
        globalStream.muteAudio();
        isAudioMuted = true;
    }else{
        globalStream.unmuteAudio();
        isAudioMuted = false;
    }
}