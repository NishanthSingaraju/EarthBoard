import { Card, CardContent } from '@mui/material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

function MapCard(key, children){
    return (
      <Card key= {key} className="card_map">
          <CardContent>
            <div className="mapping-container">
                {children[1]}
              </div>
              <Box tm={1} bm={0} pt={2} display="flex" sx={{flexFlow:"row nowrap", justifyContent:"space-evenly"}} >
                <Typography variant="h5" fontWeight='bold'>
                    {children[0]}
                </Typography>
                <Button variant="contained" style={{ background: '#13A053' }}>Analyze</Button>
            </Box>
            </CardContent>
        </Card>
    )
  }

  export default MapCard
