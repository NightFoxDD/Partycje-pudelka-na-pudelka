const COLORS = [
    '#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93',
    '#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', 
    '#43aa8b', '#577590', '#ef476f', '#ffd166', '#06d6a0', 
    '#118ab2', '#073b4c', '#e07a5f', '#3d405b', '#81b29a'
];

export const getBlockColor = (dx: number, dy: number, dz: number): string => {
    // Generate a simple deterministic hash based on dimensions
    // We sort the dimensions so 1x2x1 and 2x1x1 get the SAME color
    const sorted = [dx, dy, dz].sort((a, b) => a - b);
    
    // A simple prime-based hash function to distribute colors nicely
    const hash = (sorted[0] * 73856093) ^ (sorted[1] * 19349663) ^ (sorted[2] * 83492791);
    
    // Ensure positive index
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
};
