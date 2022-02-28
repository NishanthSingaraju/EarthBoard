import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FormDialog from './FormDialog'
import { Link } from "react-router-dom";
import PsychologyIcon from '@mui/icons-material/Psychology';


export default function ButtonAppBar({loginPane, handleClick}) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: '#13A053'}}>
        <Toolbar>
          {loginPane}
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Earth Board
          </Typography>
          <Link to="/ml"><IconButton sx={{color:"white"}}><PsychologyIcon></PsychologyIcon></IconButton></Link>
          <FormDialog addMap={handleClick}/>
        </Toolbar>
      </AppBar>
    </Box>
  );
}