import React, { useEffect, useState, useRef } from 'react';

import Peer from "simple-peer";

import { connect } from 'react-redux';
import io from "socket.io-client";

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

var CreatePeerVideo = ({peer})=> {
    const ref = useRef();

    useEffect(() => {
        peer.on("stream", stream => {
            // console.log(stream)
            ref.current.srcObject = stream;
            ref.current.play();
        });
    }, []);

    // console.log('++++++++++++++++++++++++++>', peer)

    return (
        <video ref={ref} style={{width: 200, height: 200}} />
    );
}

function Game({getUserInfos}) {

    const [peers, setPeers] = useState([]);
    const [userlist, setUserlist] = useState([]);
    const socketRef = useRef();
    const peersRef = useRef([]);
    const roomID = getUserInfos.roomID;
    const userPseudo = getUserInfos.pseudo;

    useEffect(()=> {

        socketRef.current = io.connect("/");
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            const videoElement = document.querySelector('video#localVideo');
            videoElement.srcObject = stream;
            videoElement.muted = true;
            videoElement.play();

            socketRef.current.emit('joinRoom', {userName: userPseudo, roomId: roomID});
            socketRef.current.on('roomUserList', userList=> {
                // setUserlist(userList);
                const peers = [];
                userList.userList.map(data=> {
                    if(data.id != socketRef.current.id){
                        const peer = createPeer(data.id, socketRef.current.id, stream);
                        // console.log('====== createPeer ======', peer);
                        peersRef.current.push({
                            peerID: data.id,
                            peer,
                        })
                        peers.push({peer: peer, userID: data.id});
                        // console.log('====== 1 ======', peers);
                    }
                });
                // console.log('====== 1 ======', peers);
                setPeers(peers);
            });

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                // console.log('====== addPeer ======', peer);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, {peer: peer, userID: payload.callerID}]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

        });

        socketRef.current.on('userList', userList=> {
            setUserlist(userList.userList);
        })

    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
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
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    // console.log('====== 2 ======', peers);

  return (
    <div style={{padding: 20, display: 'grid'}}>
        {roomID}
        <div>
            <p style={{fontWeight: '600', color: 'blue'}}>{userPseudo}</p>
            <video id="localVideo"
                style={{width: 200, height: 200}}
            />
        </div>
        {
            peers.map((data, i)=> {
                if(userlist.length > 0){
                    var gest = userlist.find(user=> user.id == data.userID);
                    if(gest){
                        return  <div>
                                    <p style={{fontWeight: '600', color: 'green'}}>{gest && gest.userName}</p>
                                    <CreatePeerVideo key={i} peer={data.peer} />
                                </div>;
                    }
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
