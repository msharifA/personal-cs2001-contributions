import { createTheme } from '@mui/material/styles';

const theme = createTheme({
palette: {
primary: {
main: '#497bc5',
},
secondary: {
main: '#ff4081',
},
},
typography: {
fontFamily: 'Roboto, Arial, sans-serif',
},
components: {
MuiAppBar: {
styleOverrides: {
root: {
backgroundColor: '#497bc5',
width: '100%',
boxSizing: 'border-box',
position: 'fixed',
top: 0,
zIndex: 1300,
},
},
},
MuiToolbar: {
styleOverrides: {
root: {
display: 'flex',
justifyContent: 'space-between',
padding: '0 16px',
width: '100%',
boxSizing: 'border-box',
},
},
},
MuiButton: {
styleOverrides: {
root: {
color: 'black',
},
outlined: {
backgroundColor: '#4caf50',
color: '#ffffff',
border: 'none',
'&:hover': {
backgroundColor: '#388e3c',
},
},
},
},
},
});

export default theme;