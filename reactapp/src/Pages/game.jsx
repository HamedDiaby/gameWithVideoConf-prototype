import React, { useEffect, useState, useRef } from 'react';

import Peer from "simple-peer";

import { connect } from 'react-redux';
import socketIOClient from "socket.io-client";
var socket = socketIOClient("http://localhost:8000/");

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

var CreatePeerVideo = ({peer})=> {
    const ref = useRef();

    useEffect(() => {
        peer.on("stream", stream => {
            console.log(stream)
            ref.current.srcObject = stream;
            ref.current.play();
            // peerVideo.srcObject = stream;
            // peerVideo.play();
        });
    }, []);
    // console.log(peerVideo)

    return (
        <video ref={ref} style={{width: 200, height: 200}} />
    );
}

function Game({getUserInfos}) {

    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const peersRef = useRef([]);
    const roomID = getUserInfos.roomID;
    const userID = socket.id;
    const userPseudo = getUserInfos.pseudo;

    useEffect(()=> {

        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            const videoElement = document.querySelector('video#localVideo');
            videoElement.srcObject = stream;
            videoElement.muted = true;
            videoElement.play();

            socket.emit('joinRoom', {userName: userPseudo, roomId: roomID});
            socket.on('roomUserList', userList=> {
                const peers = [];
                userList.userList.map(data=> {
                    if(data.id != userID){
                        const peer = createPeer(data.id, userID, stream);
                        peersRef.current.push({
                            peerID: data.id,
                            peer,
                        })
                        peers.push(peer);
                    }
                });
                setPeers(peers);
            });

            socket.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });

            socket.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

        });

    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socket.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socket.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

  return (
    <div>
        {roomID}
        <video id="localVideo"
            style={{width: 200, height: 200}}
        />
        {
            peers.map((peer, index) => {
                if(peer.id != userID) {
                    return <CreatePeerVideo peer={peer} />;
                }
            })
        }
    </div>
  );
}

function mapStateToProps(state) {
    return { 
      getUserInfos: state.userInfos,
    }
}
  
export default connect(
    mapStateToProps,
    null
)(Game);