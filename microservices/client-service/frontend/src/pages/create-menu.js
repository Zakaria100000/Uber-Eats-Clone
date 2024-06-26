import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { createMenu } from '../api/menu'; // import the createUser function from your API file

export default function Create() {
    const restaurant = JSON.parse(localStorage.getItem('restaurant')); // Parse restaurant data
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState();

    const handlePriceChange = (event) => {
        const inputText = event.target.value;
        // Use a regular expression to remove non-numeric characters
        const numericOnly = inputText.replace(/[^0-9]/g, '');
        setPrice(numericOnly);
    };

    const handleSubmit = () => {
        const menu = {
            name,
            description,
            price,
            restaurant: restaurant._id, // Use the ObjectId of the restaurant
        };

        // send the FormData object to the server using axios
        createMenu(menu)
            .then((res) => {
                console.log(res);
                window.alert("Menu created successfully!!!");
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <form>
            <h2>Create a new Menu</h2>
            <Box sx={{ width: '100%' }}>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6}>
                        <TextField
                            id="standard-basic"
                            label="Name"
                            variant="outlined"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            name="name"
                            required
                        />
                    </Grid>
                    <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'right' }}>
                        <TextField
                            id="standard-basic"
                            label="Description"
                            variant="outlined"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            name="description"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <TextField
                            id="standard-basic"
                            label="Price"
                            variant="outlined"
                            value={price}
                            onChange={handlePriceChange}
                            name="price"
                            required
                            InputProps={{
                                endAdornment: <InputAdornment>DZD</InputAdornment>,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button variant="contained" onClick={handleSubmit}>Create Menu</Button>
                    </Grid>
                </Grid>
            </Box>
        </form>
    );
}
