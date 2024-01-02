import React from 'react';
import { Switch, Route, Link, BrowserRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import io from 'socket.io-client';

import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InfoIcon from '@material-ui/icons/Info';
import HistoryIcon from '@material-ui/icons/History';

import Information from "./pages/information"
import Historique from "./pages/historique"
import Electrocardiogramme from "./pages/electrocardiogramme"

const drawerWidth = 240;
const socket = io('http://localhost:3001');

const styles = theme => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },
    drawerContainer: {
        overflow: 'auto',
    },
    toolbar: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
});

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: true,
            anchorEl: null,
            openJoinDialog: false,
            openCloseDialog: false,
            openCreateDialog: false,
            openLeaveDialog: false,
            duration: '60',
            channel: 26
        }

        this._handleToggleDrawer = this._handleToggleDrawer.bind(this);
    }

    _handleToggleDrawer(event, toggled) {
        this.setState({open: !this.state.open});
    }

    render() {
        const { classes } = this.props;
        const { open, anchorEl } = this.state;

        return (
            <div className={classes.root}>
                <CssBaseline />
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={this._handleToggleDrawer}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            ECG PROJECT
                        </Typography>
                    </Toolbar>
                </AppBar>

                <BrowserRouter>
                <Drawer
                    variant="permanent"
                    className={clsx(classes.drawer, {
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    })}
                    classes={{
                        paper: clsx({
                            [classes.drawerOpen]: open,
                            [classes.drawerClose]: !open,
                        }),
                    }}
                >
                    <Toolbar />
                    <div className={classes.toolbar}>
                        <List>
                            <ListItem button key={"Information"} component={Link} to="/information">
                                <ListItemIcon>
                                    <InfoIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Information"} />
                            </ListItem>
                            <ListItem button component={Link} to="/historique">
                                <ListItemIcon>
                                    <HistoryIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Historique"} />
                            </ListItem>
                            <ListItem button component={Link} to="/ecg">
                                <ListItemIcon>
                                    <HeartBrokenIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Ecg"} />
                            </ListItem>
                        </List>
                    </div>
                </Drawer>

                <main className={classes.content}>
                    <Toolbar />
                    <Switch>
                        <Route exact path="/" render={(props) => (<Information {...props} socket={socket}/>)} />
                        <Route path="/historique" render={(props) => (<Historique {...props} socket={socket}/>)} />
                        <Route path="/information" render={(props) => (<Information {...props} socket={socket}/>)} />
                        <Route path="/ecg" render={(props) => (<Electrocardiogramme {...props} socket={socket}/>)} />
                    </Switch>
                </main>
                </BrowserRouter>
            </div>
        );
    }
}

export default withStyles(styles)(App);
