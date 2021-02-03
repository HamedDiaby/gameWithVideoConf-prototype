import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import { connect } from 'react-redux';

function ConfigGame({joinedRoomRedux}) {

    const[pseudo, setPseudo] = useState('');
    const[roomID, setRoomID] = useState('');
    const[joinedRoomState, setJoinedRoomState] = useState(false);

    var createRoom = ()=> {
        joinedRoomRedux({pseudo: pseudo, roomID: uuidv4()});
    };

    var joinedRoom = ()=> {
        joinedRoomRedux({pseudo: pseudo, roomID: roomID});
    };

  return (
    <div>
        <input style={{width: 200, height: 30, margin: 40, padding: 5}}
            placeholder='Pseudo'
            value={pseudo}
            onChange={e=> setPseudo(e.target.value)}
        />

        <div>
            <button style={{margin: 10, height: 30, backgroundColor: 'green', borderColor: 'green', color: 'white', cursor: 'pointer'}}
                onClick={()=> {pseudo != '' ? createRoom() : alert('Creer un peudo !')}}
            >
                <Link style={{textDecoration: 'none', color: 'white'}} 
                    to={pseudo != '' && '/Game'}
                >Creer une partie</Link>
            </button>

            <button style={{margin: 10, height: 30, backgroundColor: 'blue', borderColor: 'blue', color: 'white', cursor: 'pointer'}}
                onClick={()=> {pseudo != '' ? setJoinedRoomState(true): alert('Creer un peudo !')}}
            >Rejoindre une partie</button>
        </div>

        {
            pseudo != '' && joinedRoomState &&
            <div style={{margin: 20}}>

                <textarea cols={50} rows={3} style={{display: 'block', padding: 5}}
                    value={roomID}
                    onChange={e=> setRoomID(e.target.value)}
                />

                <button style={{margin: 10, height: 30, backgroundColor: 'blue', borderColor: 'blue', color: 'white', cursor: 'pointer'}}
                    onClick={()=> {roomID != '' ? joinedRoom(): alert('Entrez l\'ID d\'une salle !')}}
                >
                    <Link style={{textDecoration: 'none', color: 'white'}} 
                        to={roomID != '' && '/Game'}
                    >Rejoindre</Link>
                </button>
            </div>
        }
    </div>
  );
}
  
function mapDispatchToProps(dispatch) {
    return {
          joinedRoomRedux: function(data) {
            dispatch({ type: 'joinedRoom', userInfos: data });  
          },
    };
};
  
export default connect(
    null,
    mapDispatchToProps
)(ConfigGame);