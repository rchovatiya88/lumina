import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

// Helper to calculate wall transforms from start/end points
const Wall = ({ start, end, height = 3, thickness = 0.2 }: { start: [number, number], end: [number, number], height?: number, thickness?: number }) => {
    const length = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
    const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
    const midX = (start[0] + end[0]) / 2;
    const midZ = (start[1] + end[1]) / 2;

    return (
        <mesh position={[midX, height / 2, midZ]} rotation={[0, -angle, 0]} receiveShadow castShadow>
            <boxGeometry args={[length, height, thickness]} />
            <meshStandardMaterial color="#e5e5e5" />
        </mesh>
    );
};

const RoomFloor = ({ position, args, color, textureUrl, name }: { position: [number, number, number], args: [number, number], color: string, textureUrl?: string, name: string }) => {
    // Placeholder for texture loading if we had actual assets
    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={args} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Room Label */}
            {/* <Text position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.5} color="black">{name}</Text> */}
        </group>
    );
};

export const ApartmentComplex = ({ styles }: { styles?: any }) => {
    // Default Styles
    const s = {
        living: { floor: '#d4b483', wall: '#e5e5e5', ...styles?.living },
        master: { floor: '#a8a29e', wall: '#e5e5e5', ...styles?.master },
        guest: { floor: '#a8a29e', wall: '#e5e5e5', ...styles?.guest },
        yard: { floor: '#86efac', wall: '#ffffff', ...styles?.yard }
    };

    return (
        <group>
            {/* --- FLOORS --- */}
            
            {/* Living Room (Center) */}
            <RoomFloor position={[0, 0.01, 0]} args={[6, 8]} color={s.living.floor} name="Living Room" />
            
            {/* Master Bedroom (Left) */}
            <RoomFloor position={[-5, 0.01, 0]} args={[4, 5]} color={s.master.floor} name="Master Bed" />
            
            {/* Master Bath (Far Left, Top) */}
            <RoomFloor position={[-5, 0.01, -4]} args={[4, 3]} color="#f0f9ff" name="Master Bath" />

            {/* Guest Bedroom (Right) */}
            <RoomFloor position={[5, 0.01, 0]} args={[4, 5]} color={s.guest.floor} name="Guest Bed" />

            {/* Guest Bath (Right, Top) */}
            <RoomFloor position={[5, 0.01, -4]} args={[4, 3]} color="#f0f9ff" name="Guest Bath" />

            {/* Front Yard (Bottom) */}
            <RoomFloor position={[0, 0.01, 6.5]} args={[14, 5]} color={s.yard.floor} name="Front Yard" />
            <RoomFloor position={[0, 0.005, 9]} args={[2, 4]} color="#9ca3af" name="Walkway" />


            {/* --- WALLS --- */}
            
            {/* Living Room Walls */}
            <Wall start={[-3, -4]} end={[-3, 4]} />
            <Wall start={[3, -4]} end={[3, 4]} />
            <Wall start={[-3, -4]} end={[3, -4]} />
            <Wall start={[-3, 4]} end={[-1, 4]} />
            <Wall start={[1, 4]} end={[3, 4]} />

            {/* Master Wing */}
            <Wall start={[-7, -5.5]} end={[-7, 2.5]} />
            <Wall start={[-7, 2.5]} end={[-3, 2.5]} />
            <Wall start={[-7, -5.5]} end={[-3, -5.5]} />
            <Wall start={[-7, -2.5]} end={[-5, -2.5]} />
            <Wall start={[-4, -2.5]} end={[-3, -2.5]} />

            {/* Guest Wing */}
            <Wall start={[7, -5.5]} end={[7, 2.5]} />
            <Wall start={[3, 2.5]} end={[7, 2.5]} />
            <Wall start={[3, -5.5]} end={[7, -5.5]} />
            <Wall start={[3, -2.5]} end={[4, -2.5]} />
            <Wall start={[5, -2.5]} end={[7, -2.5]} />

            {/* Front Yard Fence */}
            <Wall start={[-7, 4]} end={[-7, 9]} height={1} />
            <Wall start={[7, 4]} end={[7, 9]} height={1} />
            <Wall start={[-7, 9]} end={[7, 9]} height={1} />

        </group>
    );
};
