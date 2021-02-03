import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";

import ConfigGame from './Pages/configGame';
import Game from './Pages/game';

import userInfos from './Reducers/userInfos';

import {Provider} from 'react-redux';
import {createStore, combineReducers}  from 'redux';
const store = createStore(combineReducers({userInfos}));

function App() {
  return (
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={ConfigGame} />
        <Route path="/Game" exact component={Game} />
      </Switch>
    </BrowserRouter>
  </Provider>
  );
}

export default App;
