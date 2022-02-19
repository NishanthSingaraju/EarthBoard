import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FormDialog from './FormDialog'


export default function ButtonAppBar({loginPane, handleClick}) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ background: '#13A053'}}>
        <Toolbar>
          {loginPane}
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Earth Board
          </Typography>
          <FormDialog addMap={handleClick}/>
        </Toolbar>
      </AppBar>
    </Box>
  );
}