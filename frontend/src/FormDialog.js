import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';


export default function FormDialog({addMap}) {
  const [open, setOpen] = React.useState(false);
  const [collection, setCollection] = React.useState({"ic": "", "reducer": "", "start": "", "end":"", "vizParams": ""});


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
      addMap(collection)
      // setCollection({"ic": "", "reducer": "", "start": "", "end":"", "vizParams": ""})
      handleClose()
  }

  const handleChange = (event) => {
    let temp = collection
    temp[event.target.name] = event.target.value
    setCollection(temp);
    console.log(collection)
  };

  return (
    <div>
        <IconButton
            size="large"
            color="inherit"
            aria-label="add"
            sx={{ mr: 2 }}
            onClick={() => {
                {handleClickOpen()}
              }}
          >
            <AddIcon/>
        </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select Dataset</DialogTitle>
        <Box sx={{display: "flex", minWidth: 500, flexDirection: "row", justifyContent: "space-evenly", padding: 1, alignItems: "center"}}>
            <Box sx={{minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: "space-evenly", padding: 1}}>
              <TextField name="ic" label="Image Collection" variant="outlined" onChange={handleChange}/>
              <Select
                    name={"reducer"}
                    value={collection["reducer"]}
                    onChange={handleChange}
                    >
                    <MenuItem name= {"reducer"} value={"mean"}>mean</MenuItem>
                    <MenuItem name= {"reducer"} value={"max"}>max</MenuItem>
                    <MenuItem name= {"reducer"} value={"first"}>first</MenuItem>
                </Select>
                <TextField name="start" label="Start" variant="outlined" onChange={handleChange}/>
                <TextField name="end" label="End" variant="outlined" onChange={handleChange}/>
              </Box>
              <TextField name="vizParams" variant="outlined" multiline rows={12} onChange={handleChange}/>
            </Box>
        <DialogActions>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
