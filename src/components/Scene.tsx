import React from 'react';
import { OrbitControls, Edges, Environment, PerspectiveCamera } from '@react-three/drei';
import type { Partition, PlacedBox } from '../class/CuboidPartitioner';
import { getBlockColor } from '../utils/colors';

interface SceneProps {
    partition: Partition;
    dim: { m: number; n: number; k: number };
}

const CuboidBox: React.FC<{ box: PlacedBox; globalOffset: [number, number, number] }> = ({ box, globalOffset }) => {
    const posX = box.x + box.dx / 2 - globalOffset[0];
    const posY = box.y + box.dy / 2 - globalOffset[1];
    const posZ = box.z + box.dz / 2 - globalOffset[2];
    
    const color = getBlockColor(box.dx, box.dy, box.dz);

    return (
        <mesh position={[posX, posY, posZ]}>
            <boxGeometry args={[box.dx, box.dy, box.dz]} />
            <meshPhysicalMaterial 
                color={color} 
                transparent 
                opacity={0.9} 
                roughness={0.2}
                metalness={0.1}
            />
            <Edges scale={1} color="white" />
        </mesh>
    );
};

export const Scene: React.FC<SceneProps> = ({ partition, dim }) => {
    const globalOffset: [number, number, number] = [dim.m / 2, dim.n / 2, dim.k / 2];
    const maxDim = Math.max(dim.m, dim.n, dim.k);
    const camDist = maxDim * 1.8;

    return (
        <>
            <PerspectiveCamera makeDefault position={[camDist, camDist, camDist]} fov={45} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <Environment preset="city" />
            <OrbitControls makeDefault enablePan={false} />
            
            {/* Bounding box */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[dim.m, dim.n, dim.k]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.1} wireframe />
            </mesh>

            {partition.placedBoxes.map((box, idx) => (
                <CuboidBox key={idx} box={box} globalOffset={globalOffset} />
            ))}
        </>
    );
};
