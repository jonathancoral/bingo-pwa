// Engine for Bingo PWA
class BingoEngine {
    constructor() {
        this.masks = {
            cruz: this._generateCruzMask(),
            x: this._generateXMask(),
            contorno: this._generateContornoMask(),
            cuatro_esquinas: this._generateCuatroEsquinasMask(),
            cuadro_pequeno: this._generateCuadroPequenoMask(),
            letra_l: this._generateLetraLMask(),
            letra_t: this._generateLetraTMask()
        };
    }

    _generateCruzMask() {
        let mask = Array(5).fill(null).map(() => Array(5).fill(false));
        for (let i = 0; i < 5; i++) {
            mask[2][i] = true; // fila 2
            mask[i][2] = true; // col 2
        }
        mask[2][2] = false; // El centro siempre es libre
        return mask;
    }

    _generateXMask() {
        let mask = Array(5).fill(null).map(() => Array(5).fill(false));
        for (let i = 0; i < 5; i++) {
            mask[i][i] = true; // diagonal principal
            mask[i][4 - i] = true; // diagonal inversa
        }
        mask[2][2] = false;
        return mask;
    }

    _generateContornoMask() {
        let mask = Array(5).fill(null).map(() => Array(5).fill(false));
        for (let i = 0; i < 5; i++) {
            mask[0][i] = true; // fila 0
            mask[4][i] = true; // fila 4
            mask[i][0] = true; // col 0
            mask[i][4] = true; // col 4
        }
        return mask;
    }

    _generateCuatroEsquinasMask() {
        let mask = Array(5).fill(null).map(() => Array(5).fill(false));
        mask[0][0] = true;
        mask[0][4] = true;
        mask[4][0] = true;
        mask[4][4] = true;
        return mask;
    }

    _generateCuadroPequenoMask() {
        let mask = Array(5).fill(null).map(() => Array(5).fill(false));
        // O central (8 casillas rodeando el centro libre)
        mask[1][1] = true; mask[1][2] = true; mask[1][3] = true;
        mask[2][1] = true;                    mask[2][3] = true;
        mask[3][1] = true; mask[3][2] = true; mask[3][3] = true;
        return mask;
    }

    _generateLetraLMask() {
        let mask = Array(5).fill(null).map(() => Array(5).fill(false));
        for (let i = 0; i < 5; i++) {
            mask[i][0] = true; // Columna B entera
            mask[4][i] = true; // Fila inferior entera
        }
        return mask;
    }

    _generateLetraTMask() {
        let mask = Array(5).fill(null).map(() => Array(5).fill(false));
        for (let i = 0; i < 5; i++) {
            mask[0][i] = true; // Fila superior entera
            mask[i][2] = true; // Columna N entera
        }
        return mask;
    }

    /**
     * Valida si un cartón es ganador dado un set de balotas.
     * @param {Array} matriz - 5x5
     * @param {Set} balotasCantadas - Set de números
     * @param {String} modo - 'tabla_llena', 'cruz', 'x', 'contorno', 'personalizado'
     * @param {Array} mascaraPersonalizada - 5x5 boolean mask
     */
    checkWin(matriz, balotasCantadas, modo, mascaraPersonalizada = null, colIndex = null) {
        if (modo === 'salado') return false; // Salado usa checkSalado

        let maskToCheck = null;
        if (modo === 'cruz') maskToCheck = this.masks.cruz;
        else if (modo === 'x') maskToCheck = this.masks.x;
        else if (modo === 'contorno') maskToCheck = this.masks.contorno;
        else if (modo === 'cuatro_esquinas') maskToCheck = this.masks.cuatro_esquinas;
        else if (modo === 'cuadro_pequeno') maskToCheck = this.masks.cuadro_pequeno;
        else if (modo === 'letra_l') maskToCheck = this.masks.letra_l;
        else if (modo === 'letra_t') maskToCheck = this.masks.letra_t;
        else if (modo === 'columna_fija' && colIndex !== null) maskToCheck = this.getColumnaFijaMask(colIndex);
        else if (modo === 'personalizado') maskToCheck = mascaraPersonalizada;
        
        // Tabla llena no usa máscara predefinida de booleanos de la misma forma,
        // o podemos pensar que la máscara es "true" para todo excepto [2][2]
        
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (r === 2 && c === 2) continue; // Centro libre
                
                let num = matriz[r][c];

                if (modo === 'tabla_llena') {
                    if (!balotasCantadas.has(num)) return false;
                } else if (maskToCheck) {
                    if (maskToCheck[r][c]) { // Si la máscara requiere esta posición
                        if (!balotasCantadas.has(num)) return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Devuelve una máscara para una columna fija (0=B, 1=I, 2=N, 3=G, 4=O)
     */
    getColumnaFijaMask(colIndex) {
        let mask = [
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]
        ];
        for (let r = 0; r < 5; r++) {
            mask[r][colIndex] = 1;
        }
        return mask;
    }

    /**
     * Revisa si un cartón debe ser eliminado en MODO SALADO.
     * Si la última balota cantada está en el cartón, es eliminado.
     * @param {Array} matriz - 5x5
     * @param {Number} ultimaBalota 
     */
    checkSalado(matriz, ultimaBalota) {
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (r === 2 && c === 2) continue; // Centro ignorado
                if (matriz[r][c] === ultimaBalota) {
                    return true; // Contiene la balota, muere
                }
            }
        }
        return false;
    }

    /**
     * Calcula cuántas balotas le faltan a este cartón para ganar.
     * Retorna { missingCount: N, missingNumbers: [x,y,z] }
     */
    getDistanceToWin(matriz, balotasCantadas, modo, mascaraPersonalizada = null, colIndex = null) {
        if (modo === 'salado') return null; // No aplica

        let maskToCheck = null;
        if (modo === 'cruz') maskToCheck = this.masks.cruz;
        else if (modo === 'x') maskToCheck = this.masks.x;
        else if (modo === 'contorno') maskToCheck = this.masks.contorno;
        else if (modo === 'cuatro_esquinas') maskToCheck = this.masks.cuatro_esquinas;
        else if (modo === 'cuadro_pequeno') maskToCheck = this.masks.cuadro_pequeno;
        else if (modo === 'letra_l') maskToCheck = this.masks.letra_l;
        else if (modo === 'letra_t') maskToCheck = this.masks.letra_t;
        else if (modo === 'columna_fija' && colIndex !== null) maskToCheck = this.getColumnaFijaMask(colIndex);
        else if (modo === 'personalizado') maskToCheck = mascaraPersonalizada;

        let missingNumbers = [];

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (r === 2 && c === 2) continue; // Centro libre
                
                let num = matriz[r][c];

                if (modo === 'tabla_llena') {
                    if (!balotasCantadas.has(num)) missingNumbers.push(num);
                } else if (maskToCheck) {
                    if (maskToCheck[r][c]) {
                        if (!balotasCantadas.has(num)) missingNumbers.push(num);
                    }
                }
            }
        }
        return { missingCount: missingNumbers.length, missingNumbers };
    }

    /**
     * Procesa JSON ingresado por el usuario y asigna id_interno y estado.
     */
    processIngest(jsonString, startId = 1) {
        try {
            let parsed = JSON.parse(jsonString);
            if (!Array.isArray(parsed)) throw new Error("Debe ser un array JSON");
            
            return parsed.map((carton, index) => {
                return {
                    id_interno: startId + index,
                    serial_impreso: carton.serial_impreso || 'N/A',
                    estado: 'activo',
                    victorias: 0,
                    matriz: carton.matriz
                };
            });
        } catch (e) {
            console.error("Error al parsear cartones:", e);
            return null; // Indica error
        }
    }
}

const engine = new BingoEngine();
window.engine = engine;
