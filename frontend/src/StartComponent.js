import { Map, TileLayer, MapContainer, FeatureGroup, Circle } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import { Card, CardContent } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import React, {Component} from 'react';
import Button from '@mui/material/Button';
import axios from 'axios';


function StartComponent(props) {
    const [images, setImages] = React.useState({"image": "", "output": ""});
    const [trainPolygon, setPolygon] = React.useState([]);
    const [evalPolygon, setEvalPolygon] = React.useState([]);

    const handlePolygon = (e) => {
        e.layers.eachLayer(a => {
            if (a.options["color"] == "red"){
                let tempPolygon = evalPolygon
                let northEast = a._bounds._northEast
                let southWest = a._bounds._southWest
                tempPolygon.push([southWest["lat"], southWest["lng"], northEast["lat"], northEast["lng"]])
                setEvalPolygon(tempPolygon)
            }

            else{
                let tempPolygon = trainPolygon
                let northEast = a._bounds._northEast
                let southWest = a._bounds._southWest
                tempPolygon.push([southWest["lat"], southWest["lng"], northEast["lat"], northEast["lng"]])
                setPolygon(tempPolygon)
            }

        })
    }

    const handleChange = (event) => {
        let temp = images
        temp[event.target.name] = event.target.value
        setImages(temp);
      };

      const handleSubmit = () => {
        const request = {
            id: "testJob",
            image: images["image"],
            output: images["output"],
            trainPoly: trainPolygon,
            evalPoly: evalPolygon,
          }
        axios.put("http://localhost:5000/process", request).then((res) => {   
            console.log(res);
            props.setStep("DOWNLOADING")
      })
    }

    const shapeOptions = {
        set: "val",
        color: "red"
      };
    
    return(
        <Box sx = {{display:"flex", flexDirection:"row", justifyContent:"space-evenly", alignItems:"center"}}>
        <Card sx={{display:"flex", minHeight: 250, padding: 5, flexDirection:"column", justifyContent:"space-evenly"}}>
        <TextField name="image" label="image" variant="outlined" onChange={handleChange}/>
        <TextField name="output" label="output" variant="outlined" onChange={handleChange}/>
        <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </Card>
        <Card sx={{display: "inline-block", margin: "3%", padding: 2}}>
        <MapContainer style={{backgroundColor: "white", height: "80vh", width: "50vw"}} center={{lat: 35.938, lng:-79.81}} zoom={8}>
            <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
       <FeatureGroup>
            <EditControl
                id="train"
                position="topright"
                //this is the necessary function. It goes through each layer
                //and runs my save function on the layer, converted to GeoJSON 
                //which is an organic function of leaflet layers.

                onEdited={handlePolygon}

                edit={{ remove: true}}
                draw={{
                    marker: false,
                    circle: false,
                    rectangle: true,
                    polygon: true,
                    polyline: false,
                    circlemarker: false
                }}
            />
        </FeatureGroup>
        
        <FeatureGroup>
        <EditControl
                id="eval"
                position="bottomright"

                //this is the necessary function. It goes through each layer
                //and runs my save function on the layer, converted to GeoJSON 
                //which is an organic function of leaflet layers.
                edit={{ remove: true }}
                draw={{
                    marker: false,
                    circle: false,
                    rectangle: {shapeOptions},
                    polygon: true,
                    polyline: false,
                    circlemarker: false
                }}
            />
            </FeatureGroup>
            {/* <Polygon positions={[positions(this.props)]} />; */}
        
    </MapContainer>
    </Card>
    </Box>
);

    
}

export default StartComponent;