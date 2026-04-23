import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { getBlockColor } from '../utils/colors';

interface StatisticsProps {
    totalPartitions: number;
    averageBlocks: number;
    mostCommonSize: string;
    computationTime: number;
    allSizeCounts: Record<string, number>;
}

export const Statistics: React.FC<StatisticsProps> = ({ 
    totalPartitions, 
    averageBlocks, 
    mostCommonSize, 
    computationTime,
    allSizeCounts
}) => {
    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <StatCard title="Number of Partitions" value={totalPartitions.toString()} />
                <StatCard title="Average Number of Blocks" value={averageBlocks.toFixed(1)} />
                <StatCard title="Most Common Size" value={mostCommonSize} />
                <StatCard title="Computation Time" value={`${computationTime.toFixed(0)}ms`} />
            </Box>
            
            {Object.keys(allSizeCounts).length > 0 && (
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper', borderLeft: '4px solid', borderColor: 'primary.main' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                        Łączna liczba wystąpień poszczególnych klocków we wszystkich partycjach
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {Object.entries(allSizeCounts)
                            .sort((a, b) => b[1] - a[1]) // Sort by count descending
                            .map(([size, count], idx) => {
                                const dims = size.split('x').map(Number);
                                const color = getBlockColor(dims[0], dims[1], dims[2]);
                                return (
                                    <Chip 
                                        key={idx}
                                        label={`${size} (${count}x)`}
                                        sx={{ 
                                            backgroundColor: color, 
                                            color: 'white',
                                            fontWeight: 'bold',
                                            textShadow: '0px 0px 3px rgba(0,0,0,0.8)'
                                        }}
                                        size="medium"
                                    />
                                );
                            })
                        }
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

const StatCard: React.FC<{ title: string, value: string }> = ({ title, value }) => (
    <Paper 
        elevation={1} 
        sx={{ 
            flex: '1 1 auto',
            minWidth: '150px',
            p: 2, 
            borderRadius: 2,
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            backgroundColor: 'background.paper'
        }}
    >
        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
            {title}
        </Typography>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
            {value}
        </Typography>
    </Paper>
);
