
import React, {Component} from 'react';
import axios from 'axios'
import StartComponent from "./StartComponent"


class MLView extends Component{
    constructor(props){
      super(props);
      this.state = {jobId: null, step:null};
    }

    async componentDidMount(){
        const request = {
            id: "testJob"
          }
        axios.put("http://localhost:5000/create", request).then((res) => {        
        this.setState({
                "jobId": request["id"],
                "step": "STARTED"
            })
        })
    }


    render() {
    return(
    <div>
        {(() => {
            if (this.state.step == "STARTED"){
            return (
                <StartComponent></StartComponent>
            )
            } else {
            return (
                <div>catch all</div>
            )
        }
        })()}
    </div>
    )
    }  
}

export default MLView;