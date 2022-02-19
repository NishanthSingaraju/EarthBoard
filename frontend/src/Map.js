import {
    MapContainer,
    TileLayer,
  } from 'react-leaflet'

import MapCard from "./MapCard"
import React, { useRef, useEffect, useState } from "react";

export default function EarthEngineMap(props) {
    return (
        <MapContainer style={{backgroundColor: "white", height: "45vh", width: "45vw"}} center={{lat: 35.938, lng:-79.81}} zoom={10}>
             <TileLayer
                url={props.url}
            />
        </MapContainer>
    )
}