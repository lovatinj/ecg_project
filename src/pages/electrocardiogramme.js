import React from 'react';

import Ecg from "../components/ecg"

class Electrocardiogramme extends React.Component {
  constructor(props){
    super(props)
    this.state = {
    }
  }


  render(){
    const { socket } = this.props;

    return(
      <div>
        <Ecg socket={socket}/>
      </div>
    );
  }
}

export default Electrocardiogramme;
