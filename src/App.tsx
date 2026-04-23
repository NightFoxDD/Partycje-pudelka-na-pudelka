import { useState, useMemo, useRef } from 'react';
import { Container, Grid, Typography, ThemeProvider, createTheme, CssBaseline, Box, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { CuboidPartitioner } from './class/CuboidPartitioner';
import { Controls } from './components/Controls';
import { Statistics } from './components/Statistics';
import { PartitionCard } from './components/PartitionCard';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        primary: {
            main: '#90caf9',
        },
    },
});

function App() {
    const [dim, setDim] = useState({ m: 2, n: 2, k: 2 });
    const [submittedDim, setSubmittedDim] = useState<{ m: number; n: number; k: number } | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const mainRef = useRef<HTMLDivElement>(null);

    const { partitions, stats } = useMemo(() => {
        if (!submittedDim || submittedDim.m < 1 || submittedDim.n < 1 || submittedDim.k < 1) {
            return { partitions: [], stats: { compTime: 0, avgBlocks: 0, mostCommon: 'N/A' } };
        }
        
        const start = performance.now();
        const partitioner = new CuboidPartitioner(submittedDim.m, submittedDim.n, submittedDim.k);
        const results = partitioner.run();

        const end = performance.now();
        
        let totalBlocks = 0;
        const sizeCounts: Record<string, number> = {};
        
        results.forEach(p => {
            totalBlocks += p.dims.length;
            p.dims.forEach(d => {
                const key = `${d[0]}x${d[1]}x${d[2]}`;
                sizeCounts[key] = (sizeCounts[key] || 0) + 1;
            });
        });
        
        const avgBlocks = results.length > 0 ? totalBlocks / results.length : 0;
        let mostCommon = 'N/A';
        let maxCount = 0;
        for (const [size, count] of Object.entries(sizeCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = `${size} (${count}x)`;
            }
        }
        
        return { 
            partitions: results, 
            stats: { compTime: end - start, avgBlocks, mostCommon, sizeCounts } 
        };
    }, [submittedDim]);

    const sortedPartitions = useMemo(() => {
        const sorted = [...partitions].sort((a, b) => a.dims.length - b.dims.length);
        if (sortOrder === 'desc') {
            sorted.reverse();
        }
        return sorted;
    }, [partitions, sortOrder]);

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div ref={mainRef} style={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
                        Wizualizator Partycji Prostopadłościanu
                    </Typography>
                    <Box sx={{ mb: 4 }}>
                        <Controls dim={dim} setDim={setDim} onGenerate={() => setSubmittedDim(dim)} />
                        <Statistics 
                            totalPartitions={partitions.length} 
                            averageBlocks={stats.avgBlocks} 
                            mostCommonSize={stats.mostCommon} 
                            computationTime={stats.compTime} 
                            allSizeCounts={stats.sizeCounts || {}}
                        />
                    </Box>
                    
                    {partitions.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SortIcon color="action" /> Znalezione Partycje ({partitions.length})
                            </Typography>
                            <ToggleButtonGroup
                                color="primary"
                                value={sortOrder}
                                exclusive
                                onChange={(e, newValue) => {
                                    if (newValue) setSortOrder(newValue);
                                }}
                                size="small"
                                sx={{ backgroundColor: 'background.paper' }}
                            >
                                <Tooltip title="Najmniej klocków (Rosnąco)">
                                    <ToggleButton value="asc" aria-label="Rosnąco">
                                        <ArrowUpwardIcon fontSize="small" />
                                    </ToggleButton>
                                </Tooltip>
                                <Tooltip title="Najwięcej klocków (Malejąco)">
                                    <ToggleButton value="desc" aria-label="Malejąco">
                                        <ArrowDownwardIcon fontSize="small" />
                                    </ToggleButton>
                                </Tooltip>
                            </ToggleButtonGroup>
                        </Box>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
                        {sortedPartitions.map((partition, index) => (
                            <Box key={index}>
                                {/* Używamy submittedDim w PartitionCard, bo partycje odpowiadają wygenerowanym wymiarom */}
                                <PartitionCard partition={partition} index={index} dim={submittedDim!} />
                            </Box>
                        ))}
                    </Box>
                    
                </Container>
                
                {/* Global Canvas for all 3D Views */}
                <Canvas
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 1000 }}
                    eventSource={document.getElementById('root') || undefined}
                >
                    <View.Port />
                </Canvas>
            </div>
        </ThemeProvider>
    );
}

export default App;