import React from 'react';
import DeckGL from '@deck.gl/react';
import {EarthEngineLayer} from '@unfolded.gl/earthengine-layers';
import ee from '@google/earthengine';

export default class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {eeObject: null};
  }

  async _onLoginSuccess(user, loginProvider) {
    const token = 'Google OAuth2 access token'
    await EarthEngineLayer.initializeEEApi({clientId: "nishant.singaraju@gmail.com"});
    this.setState({eeObject: ee.Image('CGIAR/SRTM90_V4')});
  }

  render() {
    const {viewport} = this.props;
    const {eeObject} = this.state;
    const visParams = {
      min: 0,
      max: 4000,
      palette: ['006633', 'E5FFCC', '662A00', 'D8D8D8', 'F5F5F5']
    };
    const layers = [new EarthEngineLayer({eeObject, visParams})];
    return (
        <DeckGL controller {...viewport} layers={layers}/>
    );
  }
}