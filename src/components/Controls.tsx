import React from 'react';
import { Box, TextField, Typography, Paper, Alert, Button } from '@mui/material';

interface ControlsProps {
    dim: { m: number; n: number; k: number };
    setDim: React.Dispatch<React.SetStateAction<{ m: number; n: number; k: number }>>;
    onGenerate: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ dim, setDim, onGenerate }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDim(prev => ({ ...prev, [name]: parseInt(value) || 1 }));
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                Wymiary Prostopadłościanu
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField 
                    label="Długość (m)" 
                    type="number" 
                    name="m" 
                    value={dim.m} 
                    onChange={handleInputChange} 
                    slotProps={{ htmlInput: { min: 1, max: 5 } }}
                    fullWidth
                />
                <TextField 
                    label="Szerokość (n)" 
                    type="number" 
                    name="n" 
                    value={dim.n} 
                    onChange={handleInputChange} 
                    slotProps={{ htmlInput: { min: 1, max: 5 } }}
                    fullWidth
                />
                <TextField 
                    label="Wysokość (k)" 
                    type="number" 
                    name="k" 
                    value={dim.k} 
                    onChange={handleInputChange} 
                    slotProps={{ htmlInput: { min: 1, max: 5 } }}
                    fullWidth
                />
            </Box>
            
            <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={onGenerate} 
                sx={{ mb: 2, py: 1.5, fontWeight: 'bold' }}
            >
                Generuj Partycje
            </Button>
            {(dim.m > 3 || dim.n > 3 || dim.k > 3) && (
                <Alert severity="warning">
                    Uwaga: Dla wartości powyżej 3 czas obliczeń może znacznie wzrosnąć!
                </Alert>
            )}
        </Paper>
    );
};
