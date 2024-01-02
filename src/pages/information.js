import React from 'react';
import Heart from "../components/heart"
import Ecg from "../components/ecg"

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import MuiAlert from '@material-ui/lab/Alert';

import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Snackbar from '@mui/material/Snackbar';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

class Information extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      currentBpm: "80",
      open: false,
      bpm: "",
      phone: "",
      email: ""
    }
  }

  handleChangeField = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({open: false});
  };

  handleSave = () => {
    this.setState({open: true});
    console.log(this.state)
    this.props.socket.emit("set:information", {
      bpm: this.state.bpm,
      phone: this.state.phone,
      email: this.state.email
    })
  };

  setMessages = (message) => {
    this.setState({currentBpm: message})
  }

  componentDidMount = () => {
    this.props.socket.emit("get:information");
    this.props.socket.on('post:information', (information) => {
      console.log("Bonjour")
      this.setState({
        bpm: information.bpm,
        phone: information.phone,
        email: information.email
      });
    });
    this.props.socket.on("messages", data => {
      console.log("messages")
      this.setMessages(data);
    })
  }

  render(){
    const { socket } = this.props;

    return(
      <div>
        <div className="flex-display-information">
          <div className='flex-display-box'>
            <Heart bpm={parseInt(this.state.currentBpm)}/>
            <Typography variant="h2" gutterBottom>
              BPM : {this.state.currentBpm}
            </Typography>
          </div>
          <div className='flex-display-box'>
            <TextField onChange={e => this.handleChangeField(e)} value={this.state.bpm} name="bpm" className='input-form' id="standard-basic" label="BPM Maximum" variant="standard" />
            <TextField onChange={e => this.handleChangeField(e)} value={this.state.email} name="email" className='input-form' id="standard-basic" label="E-mail" variant="standard" />
            <TextField onChange={e => this.handleChangeField(e)} value={this.state.phone} name="phone" className='input-form' id="standard-basic" label="Numéro de téléphone" variant="standard" />
            <Button onClick={this.handleSave} className="button-information-enregistrer" color='primary' variant="contained">Enregistrer</Button>
          </div>
        </div>
        
        <Snackbar anchorOrigin={{ vertical: "top", horizontal: "right" }} open={this.state.open} autoHideDuration={6000} onClose={this.handleClose}>
          <Alert onClose={this.handleClose} severity="success" sx={{ width: '100%' }}>
            Vos informations ont été enregistrées.
          </Alert>
        </Snackbar>
        {/* <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>ECG</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Ecg socket={socket}/>
          </AccordionDetails>
        </Accordion> */}
        
      </div>
    );
  }
}

export default Information;
