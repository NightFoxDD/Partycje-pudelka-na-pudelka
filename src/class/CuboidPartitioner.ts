export type BoxDims = [number, number, number];
export type PlacedBox = { x: number, y: number, z: number, dx: number, dy: number, dz: number };
export type Partition = { dims: BoxDims[], placedBoxes: PlacedBox[] };

export class CuboidPartitioner {
    private m: number;
    private n: number;
    private k: number;
    private grid: boolean[][][];
    private foundPartitions: Set<string>;
    public validPartitions: Partition[];

    constructor(m: number, n: number, k: number) {
        this.m = m;
        this.n = n;
        this.k = k;
        this.validPartitions = [];
        this.foundPartitions = new Set();
        
        this.grid = Array.from({ length: m }, () =>
            Array.from({ length: n }, () =>
                Array.from({ length: k }, () => false)
            )
        );
    }

    private normalizeBox(a: number, b: number, c: number): BoxDims {
        const dims = [a, b, c].sort((x, y) => x - y);
        return [dims[0], dims[1], dims[2]];
    }

    private serializePartition(dims: BoxDims[]): string {
        const sortedPartition = [...dims].map(box => box.join('x')).sort();
        return sortedPartition.join('|');
    }

    private canPlace(x: number, y: number, z: number, dx: number, dy: number, dz: number): boolean {
        if (x + dx > this.m || y + dy > this.n || z + dz > this.k) return false;
        for (let i = x; i < x + dx; i++) {
            for (let j = y; j < y + dy; j++) {
                for (let l = z; l < z + dz; l++) {
                    if (this.grid[i][j][l]) return false;
                }
            }
        }
        return true;
    }

    private toggleBox(x: number, y: number, z: number, dx: number, dy: number, dz: number, state: boolean): void {
        for (let i = x; i < x + dx; i++) {
            for (let j = y; j < y + dy; j++) {
                for (let l = z; l < z + dz; l++) {
                    this.grid[i][j][l] = state;
                }
            }
        }
    }

    private solve(currentDims: BoxDims[], currentPlacedBoxes: PlacedBox[]): void {
        let startX = -1, startY = -1, startZ = -1;
        outer: for (let x = 0; x < this.m; x++) {
            for (let y = 0; y < this.n; y++) {
                for (let z = 0; z < this.k; z++) {
                    if (!this.grid[x][y][z]) {
                        startX = x; startY = y; startZ = z;
                        break outer;
                    }
                }
            }
        }

        if (startX === -1) {
            const signature = this.serializePartition(currentDims);
            if (!this.foundPartitions.has(signature)) {
                this.foundPartitions.add(signature);
                this.validPartitions.push({
                    dims: [...currentDims],
                    placedBoxes: [...currentPlacedBoxes]
                });
            }
            return;
        }

        for (let dx = 1; dx <= this.m - startX; dx++) {
            for (let dy = 1; dy <= this.n - startY; dy++) {
                for (let dz = 1; dz <= this.k - startZ; dz++) {
                    if (this.canPlace(startX, startY, startZ, dx, dy, dz)) {
                        this.toggleBox(startX, startY, startZ, dx, dy, dz, true);
                        const newDims = this.normalizeBox(dx, dy, dz);
                        currentDims.push(newDims);
                        currentPlacedBoxes.push({ x: startX, y: startY, z: startZ, dx, dy, dz });
                        
                        this.solve(currentDims, currentPlacedBoxes);
                        
                        currentPlacedBoxes.pop();
                        currentDims.pop();
                        this.toggleBox(startX, startY, startZ, dx, dy, dz, false);
                    }
                }
            }
        }
    }

    public run(): Partition[] {
        this.solve([], []);
        return this.validPartitions;
    }
}
