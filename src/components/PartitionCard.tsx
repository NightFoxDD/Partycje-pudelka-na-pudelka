import React, { useRef } from 'react';
import { Paper, Box, Typography, Chip } from '@mui/material';
import { View } from '@react-three/drei';
import type { Partition } from '../class/CuboidPartitioner';
import { getBlockColor } from '../utils/colors';
import { Scene } from './Scene';

interface PartitionCardProps {
    partition: Partition;
    index: number;
    dim: { m: number; n: number; k: number };
}

export const PartitionCard: React.FC<PartitionCardProps> = ({ partition, index, dim }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Group dimensions for chips
    const dimCounts: Record<string, { count: number, dims: [number, number, number] }> = {};
    partition.dims.forEach(b => {
        const key = `${b[0]}x${b[1]}x${b[2]}`;
        if (!dimCounts[key]) {
            dimCounts[key] = { count: 0, dims: b };
        }
        dimCounts[key].count++;
    });

    return (
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box 
                ref={containerRef} 
                sx={{ 
                    width: '100%', 
                    height: 300, 
                    backgroundColor: '#2e2e2e',
                    position: 'relative'
                }}
            >
                {/* 
                  The View component from @react-three/drei portalizes the scene into the global Canvas. 
                  It tracks its parent container via DOM element.
                */}
                <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <Scene partition={partition} dim={dim} />
                </View>
            </Box>

            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Partycja {index + 1}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Liczba klocków: {partition.dims.length}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {Object.values(dimCounts).map((info, idx) => {
                        const color = getBlockColor(info.dims[0], info.dims[1], info.dims[2]);
                        return (
                            <Chip 
                                key={idx}
                                label={`${info.dims[0]}x${info.dims[1]}x${info.dims[2]} (${info.count}x)`}
                                sx={{ 
                                    backgroundColor: color, 
                                    color: 'white',
                                    fontWeight: 'bold',
                                    textShadow: '0px 0px 3px rgba(0,0,0,0.8)'
                                }}
                                size="small"
                            />
                        );
                    })}
                </Box>
            </Box>
        </Paper>
    );
};
