## 1. Opis definicji

**Partycja (rozbicie) prostopadłościanu** o wymiarach $M \times N \times K$ to zbiór mniejszych prostopadłościanów, które całkowicie wypełniają jego objętość, a ich wnętrza są parami rozłączne. W kontekście tego zadania interesują nas unikalne podziały pod względem **multizbiorów wymiarów** użytych prostopadłościanów. Oznacza to, że dwa podziały składające się z prostopadłościanów o takich samych wymiarach (np. dwa klocki $1\times 2\times 2$ i jeden $2\times 2\times 2$), ale ułożonych w inny sposób wewnątrz dużego pudełka, są traktowane jako ta sama partycja. Wymiary każdego mniejszego klocka są sortowane (np. $2\times 1\times 1$ to to samo co $1\times 1\times 2$), aby jednoznacznie identyfikować użyte kształty.

## 2. Metoda działania programu

Program wykorzystuje **algorytm z nawrotami (backtracking)** do systematycznego przeszukiwania przestrzeni wszystkich możliwych ułożeń.

**Główne kroki algorytmu:**
1. **Reprezentacja przestrzeni:** Prostopadłościan wejściowy reprezentowany jest jako trójwymiarowa tablica wartości logicznych (boolean) o rozmiarach $M \times N \times K$, gdzie wartość `true` oznacza komórkę zajętą, a `false` wolną.
2. **Znajdowanie pustego miejsca:** W każdym kroku rekurencji algorytm znajduje pierwszą wolną komórkę (przeszukując przestrzeń iteracyjnie po współrzędnych $x, y, z$).
3. **Próba umieszczenia klocka:** Dla znalezionej pustej komórki $(x, y, z)$, algorytm próbuje umieścić w niej prostopadłościany o wszystkich możliwych wymiarach $(dx, dy, dz)$, takich że mieszczą się one w głównym pudełku i nie nakładają się na już zajęte komórki.
4. **Rekurencja i nawroty (Backtracking):** Jeśli można umieścić klocek, odpowiednie komórki w tablicy są oznaczane jako zajęte (`true`), wymiary klocka są dodawane do aktualnej listy, a funkcja wywołuje się rekurencyjnie, aby wypełnić resztę przestrzeni. Po powrocie z rekurencji komórki są z powrotem oznaczane jako wolne (`false`), a klocek usuwany z listy (nawrót - backtracking).
5. **Rejestracja unikalnych partycji:** Gdy algorytm nie znajdzie żadnej wolnej komórki, oznacza to, że cała przestrzeń została wypełniona. Tworzona jest wtedy tekstowa sygnatura partycji (posortowane wymiary połączone separatorem, np. `1x1x1|1x2x2`). Sygnatura ta jest sprawdzana w strukturze `Set`. Jeśli sygnatury tam nie ma, partycja jest uznawana za nową, unikalną i jest dodawana do ostatecznych wyników.

Dzięki temu podejściu program znajduje wszystkie możliwe ułożenia, ale dzięki filtrowaniu po sygnaturach zwraca tylko te partycje, które różnią się użytymi klockami.

## 3. Kod źródłowy (główny algorytm)

Poniżej znajduje się klasa `CuboidPartitioner` odpowiadająca za główną logikę podziału (plik `src/class/CuboidPartitioner.ts`):

```typescript
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
```
