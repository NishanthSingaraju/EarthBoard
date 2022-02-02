import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Select from '@mui/material/Select';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

const defaultValues = {
    "NOAA/GFS0P25" : 
        {   
            imageCollection: "NOAA/GFS0P25",
            start: "2018-12-22",
            end: "2018-12-23",
            bands: ["temperature_2m_above_ground"],
            min_val: -40,
            max: 35,
            palette: ['blue', 'purple', 'cyan', 'green', 'yellow', 'red'],
            animate: "true"
        },
    
    "LANDSAT/LC08/C01/T1_TOA" : 
        {   
            imageCollection: "LANDSAT/LC08/C01/T1_TOA",
            start: "2017-12-15",
            end: "2017-12-31",
            bands: ["B3"],
            min_val: 0.0,
            max: 25000.0,
            palette: ['black', 'green'],
            animate: "false"
        }
  };

export default function FormDialog({addMap}) {
  const [open, setOpen] = React.useState(false);
  const [imageCollection, setCollection] = React.useState("NOAA/GFS0P25");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
      addMap(defaultValues[imageCollection])
      handleClose()
  }

  const handleChange = (event) => {
    setCollection(event.target.value);
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
        <DialogContent>
            <Box component="form" sx={{display: 'flex', flexDirection: 'row' }}>
                <Select
                    native
                    id="Image Collection"
                    value={imageCollection}
                    label="ImageCollection"
                    onChange={handleChange}
                >
                    <option value={"NOAA/GFS0P25"}>NOAA/GFS0P25</option>
                    <option value={"LANDSAT/LC08/C01/T1_TOA"}>LANDSAT/LC08/C01/T1_TOA</option>
                </Select>
            </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
