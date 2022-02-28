
import React, {Component} from 'react';
import axios from 'axios'
import StartComponent from "./StartComponent"
import DownloadComponent from "./Download"


class MLView extends Component{
    constructor(props){
      super(props);
      this.state = {jobId: null, step:null};
      this.setStep = this.setStep.bind(this)
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

    setStep(step) {
        this.setState({
            "step": step
        })
    }


    render() {
    return(
    <div>
        {(() => {
            if (this.state.step == "STARTED"){
            return (
                <StartComponent setStep={this.setStep}></StartComponent>
            )
        }
            else if (this.state.step == "DOWNLOADING") {
                return(
               <DownloadComponent></DownloadComponent>
                )
            }
            else {
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