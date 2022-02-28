
import axios from 'axios'
import React, {Component} from 'react';
import { Card, CardContent } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

function LoadingBar(props){
    return(
        <Card sx={{ width: 270, height: 50, margin: "2%", padding: 1, display: "flex", fontWeight: 'medium', flexDirection:"row", justifyContent:"space-evenly", alignItems:"center" }}>
            {props.task}
            <CircularProgress />
        </Card>
    )
}

function DownloadComponent(props) {
    
    const [tasks, setTasks] = React.useState([]);
    const [step, setStep] = React.useState("");
    

    React.useEffect(() => {
        const request = {
            id: "testJob"
          }

          const sse = new EventSource("http://localhost:5000/api/poll")

          function handleStream(e){
              console.log(e)
              setStep(e.data)
          }
          sse.onmessage = e => {handleStream(e)}

        axios.put("http://localhost:5000/api/tasks", request).then((res) => {   
            setTasks(res.data["tasks"])

        return () => {
            sse.close();
        };
      })

    }, []);

    return(
        <Card sx={{display: "flex", position: 'absolute', left: '33%', fontWeight: 'medium', flexDirection:"column", width: 350, padding: 2, margin: "2%"}}>
         <Typography variant="h5" component="div" sx={{padding: 1}}>
            Downloading:
        </Typography>
        {tasks.map((task, id) => 
            <LoadingBar key={id} task={task.description}></LoadingBar>)
        }
        <Typography variant="h5" component="div" sx={{padding: 1}}>
           State: {step}
        </Typography>
        </Card>
    )
}

export default DownloadComponent;