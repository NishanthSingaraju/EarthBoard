import './App.css';
import React, {Component} from 'react';
import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import {EarthEngineLayer} from '@unfolded.gl/earthengine-layers';
import ee from '@google/earthengine';
import  GoogleLoginProvider from './GoogleLoginProvider.js'
import GoogleLoginPane from "./LoginPane.js"
import MapCard from "./MapCard"
import ButtonAppBar from "./NavBar.js"
import EarthEngineMap from "./Map.js"
import axios from 'axios'


const EE_CLIENT_ID = '783199902705-6380kgt5hno2jk7depl3pr4cmj0qdspt.apps.googleusercontent.com'

const INITIAL_VIEW_STATE = {
  longitude: -80.41669,
  latitude: 37.7853,
  zoom: 3,
  pitch: 0,
  bearing: 0
};

class Dashboard extends Component{
  constructor(props){
    super(props);
    this.state = {firstObject: null, eeObjects: []};
    this.loginProvider = new GoogleLoginProvider({
      scopes: ['https://www.googleapis.com/auth/earthengine'],
      clientId: EE_CLIENT_ID,
      onLoginChange: this._onLoginSuccess.bind(this)
    });
    this.addMap = this.addMap.bind(this)
    this.addEarthMap = this.addEarthMap.bind(this)
  }

  async _onLoginSuccess(user, loginProvider) {
    await EarthEngineLayer.initializeEEApi({clientId: EE_CLIENT_ID}).then((data) => {  
      console.log('Data:' + data);  
    }).catch((error) => {  
      console.log('Error:' + error);  
    });

    const descriptors = {
            imageCollection: "NOAA/GFS0P25",
            start: "2018-12-22",
            end: "2018-12-23",
            bands: ["temperature_2m_above_ground"],
            min: -40,
            max: 35,
            palette: ['blue', 'purple', 'cyan', 'green', 'yellow', 'red'],
            animate: true
    }
    this.addEarthMap(descriptors)
  }

  addEarthMap(descriptors){
    const eeObject = ee
      .ImageCollection(descriptors["imageCollection"])
      .filterDate(descriptors["start"], descriptors["end"])
      .limit(24)
      .select(descriptors["bands"]);
    
    const visParams = {
        min: descriptors["min"],
        max: descriptors["max"],
        palette: descriptors["palette"]
      };
  
    const layer = [new EarthEngineLayer({eeObject, visParams, animate: descriptors["animate"]})];
    
    const deckGL = [descriptors["imageCollection"], <DeckGL 
                    controller={true} 
                    views={new MapView({repeat: true})} 
                    initialViewState={INITIAL_VIEW_STATE} 
                    layers={layer}> 
                  </DeckGL>]
    
    this.setState({
      eeObjects: [...this.state.eeObjects, deckGL]
    })
  }

  addMap(parameters){
    const request = {
                      ic: parameters["ic"], 
                      reducer: parameters["reducer"], 
                      start: parameters["start"], 
                      end: parameters["end"], 
                      vizParams: parameters["vizParams"]
                    }
    console.log(request)
    axios.get("http://localhost:5000/api/map", request).then((res) => {
      let map = [parameters["ic"] , <EarthEngineMap url= {res.data.url}></EarthEngineMap>]             
      this.setState({
        eeObjects: [...this.state.eeObjects, map]
      })
  })

}

  render() {
    const eeObjects = this.state.eeObjects;  

    return (
        <div className="App">
          <ButtonAppBar 
          loginPane = {<GoogleLoginPane loginProvider={this.loginProvider}></GoogleLoginPane>} 
          handleClick={this.addMap}>
          </ButtonAppBar>
          <div className="container">
            {eeObjects.map((deck, id) =>
              MapCard(id, deck)
            )}
          </div>
        </div>
      );
}
}

export default Dashboard;