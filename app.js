const STATE_KEY = 'bingo_state';

// SVG Icons para reemplazar Emojis
const ICONS = {
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; margin-right: 5px;"><path d="M20 6L9 17l-5-5"></path></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; margin-right: 5px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    alert: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; margin-right: 5px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; margin-right: 5px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    skull: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; margin-right: 5px;"><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="M8 20v2h8v-2"></path><path d="m12.5 17-.5-1-.5 1h1z"></path><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"></path></svg>',
    star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
};

document.addEventListener('DOMContentLoaded', () => {
    const STATE_KEY = 'bingo_pwa_state';
    
    // Default state
    let state = {
        cartones: [],
        modoJuego: 'tabla_llena',
        mascaraPersonalizada: Array(5).fill(null).map(() => Array(5).fill(false)),
        balotasCantadas: [],
        historialBalotas: [],
        currentView: 'ingest-module',
        columnaFijaIndex: null
    };

    let wakeLock = null;
    let balotasSet = new Set();
    
    // Elementos del DOM principales
    const modules = document.querySelectorAll('.module');
    const currentModeBadge = document.getElementById('current-mode-badge');
    
    // Módulo Ingesta
    const ingestModule = document.getElementById('ingest-module');
    const jsonInput = document.getElementById('json-input');
    const btnLoadCards = document.getElementById('btn-load-cards');
    const cardsCount = document.getElementById('cards-count');
    const cardsList = document.getElementById('cards-list');
    const btnGoConfig = document.getElementById('btn-go-config');
    const btnResumeGameIngest = document.getElementById('btn-resume-game-ingest');
    const btnCopyPrompt = document.getElementById('btn-copy-prompt');
    
    // Módulo Configuración
    const configModule = document.getElementById('config-module');
    const gameModeSelect = document.getElementById('game-mode');
    const customGridConfig = document.getElementById('custom-grid-config');
    const customGridContainer = document.getElementById('custom-grid-container');
    const colFijaConfig = document.getElementById('columna-fija-config');
    const modePreviewGrid = document.getElementById('mode-preview-grid');
    const btnCols = document.querySelectorAll('.btn-col');
    const btnStartGame = document.getElementById('btn-start-game');
    const btnResumeGame = document.getElementById('btn-resume-game');
    const btnBackIngest = document.getElementById('btn-back-ingest');
    const btnClearDb = document.getElementById('btn-clear-db');
    
    // Módulo Gameplay
    const gameplayModule = document.getElementById('gameplay-module');
    const btnUndo = document.getElementById('btn-undo');
    const btnClear = document.getElementById('btn-clear');
    const btnBackConfig = document.getElementById('btn-back-config');
    const btnBackIngestGame = document.getElementById('btn-back-ingest-game');
    const saladoCounter = document.getElementById('salado-counter');
    const aliveCountSpan = document.getElementById('alive-count');
    const totalCountSpan = document.getElementById('total-count');
    
    // Modales y Toasts
    const toastContainer = document.getElementById('toast-container');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const btnConfirmOk = document.getElementById('btn-confirm-ok');
    const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
    
    const bingoModal = document.getElementById('bingo-modal');
    const bingoCardInfoSpans = document.getElementById('bingo-card-info').querySelectorAll('span');
    const btnKeepPlaying = document.getElementById('btn-keep-playing');
    const btnDeactivate = document.getElementById('btn-deactivate');
    const gameoverModal = document.getElementById('gameover-modal');
    const btnGameoverClose = document.getElementById('btn-gameover-close');
    
    // Predictive & Preview
    const predictiveBar = document.getElementById('predictive-bar');
    const predictiveList = document.getElementById('predictive-list');
    const previewModal = document.getElementById('preview-modal');
    const previewTitleSpan = document.querySelector('#preview-title span');
    const previewGrid = document.getElementById('preview-grid');
    const btnPreviewClose = document.getElementById('btn-preview-close');
    
    let pendingBingoCard = null;
    let confirmCallback = null;
    let nearWinIds = new Set(); // Para no repetir el Toast de "A punto"

    // Inicialización
    init();

    function init() {
        loadState();
        setupEventListeners();
        renderCustomGrid();
        renderPanelNumericoBingo();
        updateUIBasedOnState();
        
        // Wake Lock
        document.body.addEventListener('click', requestWakeLock, { once: true });
        document.body.addEventListener('touchstart', requestWakeLock, { once: true });
        
        // Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').then(() => {
                console.log('Service Worker Registrado');
            }).catch(err => console.error('Error Service Worker', err));
        }
    }

    async function requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                wakeLock = await navigator.wakeLock.request('screen');
                wakeLock.addEventListener('release', () => console.log('Wake Lock liberado'));
            }
        } catch (err) {
            console.error('Error al pedir Wake Lock:', err);
        }
    }
    
    document.addEventListener('visibilitychange', async () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
            await requestWakeLock();
        }
    });

    function saveState() {
        state.balotasCantadas = Array.from(balotasSet);
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    }

    function loadState() {
        const saved = localStorage.getItem(STATE_KEY);
        if (saved) {
            try {
                let parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
                balotasSet = new Set(state.balotasCantadas);
            } catch(e) {
                console.error("Error al cargar estado", e);
            }
        }
    }

    function changeView(viewId) {
        state.currentView = viewId;
        saveState();
        updateUIBasedOnState();
    }

    function updateUIBasedOnState() {
        modules.forEach(m => m.classList.remove('active'));
        document.getElementById(state.currentView).classList.add('active');
        
        if (state.currentView === 'ingest-module') {
            renderCardsList();
            if (state.cartones.length > 0) {
                btnGoConfig.style.display = 'flex';
                if (balotasSet.size > 0) {
                    btnResumeGameIngest.style.display = 'flex';
                } else {
                    btnResumeGameIngest.style.display = 'none';
                }
            } else {
                btnGoConfig.style.display = 'none';
                btnResumeGameIngest.style.display = 'none';
            }
        } else if (state.currentView === 'config-module') {
            gameModeSelect.value = state.modoJuego;
            toggleCustomGrid();
            
            // Sync botones columna fija
            btnCols.forEach(btn => {
                if (parseInt(btn.dataset.col) === state.columnaFijaIndex) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
            
            // Si hay partida en curso, permitir continuar
            if (balotasSet.size > 0) {
                btnResumeGame.style.display = 'flex';
                btnStartGame.textContent = 'Reiniciar Partida';
                gameModeSelect.disabled = true;
                btnCols.forEach(b => {
                    b.style.pointerEvents = 'none';
                    b.style.opacity = '0.5';
                });
                customGridContainer.style.pointerEvents = 'none';
            } else {
                btnResumeGame.style.display = 'none';
                btnStartGame.textContent = 'Iniciar Partida';
                gameModeSelect.disabled = false;
                btnCols.forEach(b => {
                    b.style.pointerEvents = 'auto';
                    b.style.opacity = '1';
                });
                customGridContainer.style.pointerEvents = 'auto';
            }
            
        } else if (state.currentView === 'gameplay-module') {
            renderPanelNumericoState();
            updateSaladoCounter();
            updatePredictiveBar();
            
            let badgeText = 'Modo';
            const selectOption = gameModeSelect.options[gameModeSelect.selectedIndex];
            if (selectOption) badgeText = selectOption.text;
            
            if (state.modoJuego === 'columna_fija' && state.columnaFijaIndex !== null) {
                const letras = ['B', 'I', 'N', 'G', 'O'];
                badgeText += ` (${letras[state.columnaFijaIndex]})`;
            }
            
            currentModeBadge.textContent = badgeText;
            updateColumnsVisibility();
        }
    }

    // --- SISTEMA DE UI (Toasts & Modals) ---
    function showToast(msg) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.innerHTML = msg;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    function showConfirm(msg, callback) {
        confirmMessage.innerHTML = msg;
        confirmCallback = callback;
        confirmModal.classList.add('show');
    }
    
    btnConfirmCancel.addEventListener('click', () => {
        confirmModal.classList.remove('show');
        confirmCallback = null;
    });
    
    btnConfirmOk.addEventListener('click', () => {
        confirmModal.classList.remove('show');
        if (confirmCallback) confirmCallback();
        confirmCallback = null;
    });


    // --- INGESTA ---
    function setupEventListeners() {
        btnCopyPrompt.addEventListener('click', async () => {
            const promptText = `Extrae los números de estos cartones de Bingo. Devuelve SOLO un array de objetos JSON con esta estructura exacta:
{"serial_impreso": "numero_de_serie_del_carton", "matriz": [[B1,I1...], ...]}
Si el cartón no tiene número de serie visible, deja "serial_impreso" como un string vacío "". El centro siempre es 0.`;
            
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(promptText);
                    showToast(`${ICONS.check} Prompt copiado al portapapeles`);
                } else {
                    // Fallback clásico para Safari en iOS / HTTP (red local)
                    const textArea = document.createElement("textarea");
                    textArea.value = promptText;
                    
                    // Evitar teclado virtual y scroll en iOS
                    textArea.style.top = "0";
                    textArea.style.left = "0";
                    textArea.style.position = "fixed";
                    textArea.style.opacity = "0";
                    
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    if (successful) {
                        showToast(`${ICONS.check} Prompt copiado (Modo Compatible)`);
                    } else {
                        throw new Error("El fallback falló");
                    }
                }
            } catch (err) {
                console.error('Error al copiar:', err);
                showToast(`${ICONS.error} No se pudo copiar al portapapeles`);
            }
        });

        btnLoadCards.addEventListener('click', () => {
            const raw = jsonInput.value.trim();
            if (!raw) return;
            
            const startId = state.cartones.length > 0 ? Math.max(...state.cartones.map(c => c.id_interno)) + 1 : 1;
            const nuevosCartones = window.engine.processIngest(raw, startId);
            
            if (nuevosCartones) {
                let agregados = 0;
                let duplicados = 0;
                
                // Set con los seriales existentes (para no iterar el array cada vez)
                const serialesExistentes = new Set(state.cartones.map(c => String(c.serial_impreso)));
                
                const filtrados = nuevosCartones.filter(nc => {
                    const strSerial = String(nc.serial_impreso);
                    // Si el serial es N/A lo dejamos pasar para no bloquear cartones sin serial
                    if (strSerial !== 'N/A' && serialesExistentes.has(strSerial)) {
                        duplicados++;
                        return false;
                    }
                    serialesExistentes.add(strSerial); // Para evitar duplicados dentro del mismo nuevo lote
                    agregados++;
                    return true;
                });
                
                state.cartones = [...state.cartones, ...filtrados];
                saveState();
                renderCardsList();
                
                let msg = `${ICONS.check} ¡Se agregaron ${agregados} cartones! Total: ${state.cartones.length}.`;
                if (duplicados > 0) {
                    msg += ` Se ignoraron ${duplicados} por serial duplicado.`;
                }
                showToast(msg);
                
                jsonInput.value = ''; // Limpiar textarea
            } else {
                showToast(`${ICONS.error} JSON inválido. Verifica el formato.`);
            }
        });

        btnGoConfig.addEventListener('click', () => changeView('config-module'));
        btnResumeGameIngest.addEventListener('click', () => changeView('gameplay-module'));
        
        // --- CONFIG ---
        gameModeSelect.addEventListener('change', (e) => {
            state.modoJuego = e.target.value;
            toggleCustomGrid();
            saveState();
        });
        
        btnCols.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const col = parseInt(e.target.dataset.col);
                state.columnaFijaIndex = col;
                btnCols.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                saveState();
                renderModePreview();
            });
        });
        
        btnBackIngest.addEventListener('click', () => changeView('ingest-module'));
        
        btnResumeGame.addEventListener('click', () => changeView('gameplay-module'));
        
        btnStartGame.addEventListener('click', () => {
            if (state.cartones.length === 0) {
                showToast(`${ICONS.alert} Primero debes cargar cartones.`);
                return;
            }
            if (state.modoJuego === 'columna_fija' && state.columnaFijaIndex === null) {
                showToast(`${ICONS.alert} Selecciona qué letra jugar (B, I, N, G, u O).`);
                return;
            }
            
            if (balotasSet.size > 0) {
                showConfirm(`${ICONS.alert} Esto borrará la ronda actual. ¿Continuar?`, () => {
                    startNewGame();
                });
            } else {
                startNewGame();
            }
        });
        
        function startNewGame() {
            balotasSet.clear();
            state.historialBalotas = [];
            nearWinIds.clear();
            state.cartones.forEach(c => c.estado = 'activo');
            saveState();
            changeView('gameplay-module');
        }
        
        btnClearDb.addEventListener('click', () => {
            showConfirm(`${ICONS.alert} PELIGRO: Esto borrará ABSOLUTAMENTE TODOS los cartones cargados y la partida actual. ¿Estás 100% seguro?`, () => {
                localStorage.removeItem(STATE_KEY);
                
                // Reiniciar estado en memoria sin recargar la página (más fluido y sin fallos)
                state = {
                    cartones: [],
                    modoJuego: 'tabla_llena',
                    columnaFijaIndex: null,
                    mascaraPersonalizada: Array(5).fill(null).map(() => Array(5).fill(false)),
                    historialBalotas: [],
                    currentView: 'ingest-module'
                };
                balotasSet.clear();
                nearWinIds.clear();
                
                saveState();
                renderCardsList();
                renderModePreview();
                changeView('ingest-module');
                showToast(`${ICONS.check} Base de datos borrada exitosamente.`);
            });
        });
        
        // --- GAMEPLAY ---
        btnBackConfig.addEventListener('click', () => changeView('config-module'));
        btnBackIngestGame.addEventListener('click', () => changeView('ingest-module'));
        
        btnUndo.addEventListener('click', () => {
            if (state.historialBalotas.length > 0) {
                const last = state.historialBalotas.pop();
                balotasSet.delete(last);
                
                recalculateGameState();
                
                saveState();
                renderPanelNumericoState();
                updateSaladoCounter();
                updatePredictiveBar();
                showToast(`Deshiciste el número ${last}`);
            }
        });
        
        btnClear.addEventListener('click', () => {
            showConfirm("¿Seguro que deseas limpiar la ronda? Los cartones seguirán guardados.", () => {
                balotasSet.clear();
                state.historialBalotas = [];
                nearWinIds.clear();
                state.cartones.forEach(c => c.estado = 'activo');
                saveState();
                renderPanelNumericoState();
                updateSaladoCounter();
                updatePredictiveBar();
                showToast(`${ICONS.trash} Ronda limpia.`);
            });
        });
        
        // --- MODAL BINGO Y PREVIEW ---
        btnKeepPlaying.addEventListener('click', closeModal);
        btnPreviewClose.addEventListener('click', () => previewModal.classList.remove('show'));
        
        btnGameoverClose.addEventListener('click', () => {
            gameoverModal.classList.remove('show');
            document.body.classList.remove('gameover-flash');
        });
        
        btnDeactivate.addEventListener('click', () => {
            if (pendingBingoCard) {
                const arr = Array.isArray(pendingBingoCard) ? pendingBingoCard : [pendingBingoCard];
                arr.forEach(winCard => {
                    const idx = state.cartones.findIndex(c => c.id_interno === winCard.id_interno);
                    if (idx !== -1) {
                        state.cartones[idx].estado = 'inactivo';
                    }
                });
                saveState();
            }
            closeModal();
        });
    }

    function renderCardsList() {
        cardsList.innerHTML = '';
        cardsCount.textContent = state.cartones.length;
        
        if (state.cartones.length > 0) {
            btnGoConfig.style.display = 'flex';
            if (balotasSet.size > 0) {
                btnResumeGameIngest.style.display = 'flex';
            } else {
                btnResumeGameIngest.style.display = 'none';
            }
        } else {
            btnGoConfig.style.display = 'none';
            btnResumeGameIngest.style.display = 'none';
        }

        state.cartones.forEach(c => {
            const li = document.createElement('li');
            
            const infoSpan = document.createElement('span');
            infoSpan.innerHTML = `ID: <b style="color:var(--primary-color)">${c.id_interno}</b> <small>(Serial: ${c.serial_impreso})</small>`;
            infoSpan.style.cursor = 'pointer';
            infoSpan.addEventListener('click', () => showPreviewModal(c));
            
            const statusSpan = document.createElement('span');
            statusSpan.classList.add('status-badge', c.estado);
            statusSpan.textContent = c.estado;
            
            // Toggle Estado
            statusSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                c.estado = c.estado === 'activo' ? 'inactivo' : 'activo';
                saveState();
                renderCardsList();
            });
            
            li.appendChild(infoSpan);
            li.appendChild(statusSpan);
            cardsList.appendChild(li);
        });
    }

    function showPreviewModal(carton, missingNumbers = null) {
        previewTitleSpan.textContent = carton.id_interno;
        previewGrid.innerHTML = '';
        
        const missingSet = missingNumbers ? new Set(missingNumbers) : new Set();
        
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cell = document.createElement('div');
                cell.classList.add('preview-cell');
                
                if (r === 2 && c === 2) {
                    cell.innerHTML = ICONS.star;
                } else {
                    const num = carton.matriz[r][c];
                    cell.textContent = num;
                    
                    if (missingNumbers && missingSet.has(num)) {
                        cell.classList.add('missing');
                    } else if (missingNumbers === null && balotasSet.has(num)) {
                        cell.classList.add('found');
                    } else if (missingNumbers !== null && !missingSet.has(num) && balotasSet.has(num)) {
                        cell.classList.add('found');
                    }
                }
                previewGrid.appendChild(cell);
            }
        }
        
        previewModal.classList.add('show');
    }

    // --- CUSTOM GRID Y COLUMNA FIJA ---
    function toggleCustomGrid() {
        if (state.modoJuego === 'personalizado') {
            customGridConfig.style.display = 'grid';
            colFijaConfig.style.display = 'none';
            modePreviewGrid.style.display = 'none';
        } else if (state.modoJuego === 'columna_fija') {
            customGridConfig.style.display = 'none';
            colFijaConfig.style.display = 'block';
            modePreviewGrid.style.display = 'grid';
            renderModePreview();
        } else {
            customGridConfig.style.display = 'none';
            colFijaConfig.style.display = 'none';
            modePreviewGrid.style.display = 'grid';
            renderModePreview();
        }
    }
    
    function renderModePreview() {
        modePreviewGrid.innerHTML = '';
        
        let mask = null;
        if (state.modoJuego === 'tabla_llena' || state.modoJuego === 'salado') {
            mask = Array(5).fill(null).map(() => Array(5).fill(true));
        } else if (state.modoJuego === 'columna_fija' && state.columnaFijaIndex !== null) {
            mask = window.engine.getColumnaFijaMask(state.columnaFijaIndex);
        } else if (window.engine.masks[state.modoJuego]) {
            mask = window.engine.masks[state.modoJuego];
        }
        
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cell = document.createElement('div');
                cell.classList.add('preview-cell');
                
                if (r === 2 && c === 2) {
                    cell.innerHTML = ICONS.star;
                } else if (mask && mask[r][c]) {
                    cell.classList.add('found'); // Reutilizamos clase para iluminarlo
                }
                modePreviewGrid.appendChild(cell);
            }
        }
    }

    function renderCustomGrid() {
        customGridConfig.innerHTML = '';
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cell = document.createElement('div');
                cell.classList.add('custom-cell');
                
                if (r === 2 && c === 2) {
                    cell.classList.add('center-free');
                    cell.innerHTML = ICONS.star;
                } else {
                    if (state.mascaraPersonalizada[r][c]) {
                        cell.classList.add('selected');
                    }
                    cell.addEventListener('click', () => {
                        state.mascaraPersonalizada[r][c] = !state.mascaraPersonalizada[r][c];
                        cell.classList.toggle('selected');
                        saveState();
                    });
                }
                customGridConfig.appendChild(cell);
            }
        }
    }

    // --- PANEL NUMÉRICO (LAYOUT B-I-N-G-O) ---
    function renderPanelNumericoBingo() {
        const cols = [
            { id: 'col-B', start: 1, end: 15 },
            { id: 'col-I', start: 16, end: 30 },
            { id: 'col-N', start: 31, end: 45 },
            { id: 'col-G', start: 46, end: 60 },
            { id: 'col-O', start: 61, end: 75 },
        ];
        
        cols.forEach(colData => {
            const colContainer = document.getElementById(colData.id);
            for (let i = colData.start; i <= colData.end; i++) {
                const btn = document.createElement('div');
                btn.classList.add('balota');
                btn.textContent = i;
                btn.id = `balota-${i}`;
                
                btn.addEventListener('click', () => {
                    if (balotasSet.has(i)) {
                        // Unmark manual con confirmación
                        showConfirm(`¿Seguro que deseas desmarcar el número ${i}?`, () => {
                            balotasSet.delete(i);
                            state.historialBalotas = state.historialBalotas.filter(b => b !== i);
                            recalculateGameState();
                            saveState();
                            renderPanelNumericoState();
                            updatePredictiveBar();
                            updateSaladoCounter();
                            showToast(`Desmarcaste el número ${i}`);
                        });
                        return;
                    }
                    
                    balotasSet.add(i);
                    state.historialBalotas.push(i);
                    saveState();
                    
                    btn.classList.add('cantada');
                    evaluateEngine(i);
                    updatePredictiveBar();
                });
                colContainer.appendChild(btn);
            }
        });
    }

    function renderPanelNumericoState() {
        for (let i = 1; i <= 75; i++) {
            const btn = document.getElementById(`balota-${i}`);
            if (btn) {
                if (balotasSet.has(i)) {
                    btn.classList.add('cantada');
                } else {
                    btn.classList.remove('cantada');
                }
            }
        }
    }
    
    function updateColumnsVisibility() {
        const allCols = ['col-B', 'col-I', 'col-N', 'col-G', 'col-O'];
        let colsToKeep = allCols;
        
        if (state.modoJuego === 'cuatro_esquinas') {
            colsToKeep = ['col-B', 'col-O'];
        } else if (state.modoJuego === 'cuadro_pequeno') {
            colsToKeep = ['col-I', 'col-N', 'col-G'];
        } else if (state.modoJuego === 'x') {
            colsToKeep = ['col-B', 'col-I', 'col-G', 'col-O']; // N no juega
        } else if (state.modoJuego === 'columna_fija' && state.columnaFijaIndex !== null) {
            colsToKeep = [allCols[state.columnaFijaIndex]];
        }
        
        allCols.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (colsToKeep.includes(id)) {
                    el.classList.remove('attenuated');
                } else {
                    el.classList.add('attenuated');
                }
            }
        });
    }

    // --- EVALUACIÓN (Interacción con bingoEngine) ---
    function evaluateEngine(balota) {
        if (state.modoJuego === 'salado') {
            let activosPre = state.cartones.filter(c => c.estado === 'activo').length;
            
            state.cartones.forEach(c => {
                if (c.estado === 'activo') {
                    if (window.engine.checkSalado(c.matriz, balota)) {
                        c.estado = 'inactivo';
                        showToast(`${ICONS.skull} Cartón #${c.id_interno} eliminado`);
                    }
                }
            });
            
            saveState();
            updateSaladoCounter();
            
            let activosPost = state.cartones.filter(c => c.estado === 'activo');
            if (activosPost.length === 0 && activosPre > 0) {
                gameoverModal.classList.add('show');
                document.body.classList.add('gameover-flash');
                showToast(`${ICONS.skull} Todos tus cartones fueron eliminados.`);
            }
            
        } else {
            let ganadores = [];
            state.cartones.forEach(c => {
                if (c.estado === 'activo') {
                    if (window.engine.checkWin(c.matriz, balotasSet, state.modoJuego, state.mascaraPersonalizada, state.columnaFijaIndex)) {
                        ganadores.push(c);
                    }
                }
            });
            
            if (ganadores.length > 0) {
                triggerBingoModal(ganadores);
            }
        }
    }
    
    // Función global para recalcular estado si se desmarca algo manual o por undo
    function recalculateGameState() {
        if (state.modoJuego === 'salado') {
            state.cartones.forEach(c => c.estado = 'activo'); 
            state.historialBalotas.forEach(b => {
                state.cartones.forEach(c => {
                    if (c.estado === 'activo') {
                        if (window.engine.checkSalado(c.matriz, b)) c.estado = 'inactivo';
                    }
                });
            });
        }
        // Para modos no salados, balotasSet ya está actualizado y el predictive bar se basa en él,
        // no necesitamos reactivar cartones inactivos porque el bingo modal da la opción de desactivarlos, 
        // pero por simplicidad dejaremos que sigan como estaban.
    }

    function updateSaladoCounter() {
        if (state.modoJuego === 'salado') {
            saladoCounter.style.display = 'block';
            totalCountSpan.textContent = state.cartones.length;
            aliveCountSpan.textContent = state.cartones.filter(c => c.estado === 'activo').length;
        } else {
            saladoCounter.style.display = 'none';
        }
    }

    // --- BINGO PREDICTIVO (TOP CARTONES) ---
    function updatePredictiveBar() {
        if (state.modoJuego === 'salado') {
            const vivos = state.cartones.filter(c => c.estado === 'activo');
            if (vivos.length > 0) {
                predictiveBar.style.display = 'block';
                predictiveList.innerHTML = '';
                
                vivos.forEach(c => {
                    const chip = document.createElement('div');
                    chip.classList.add('predictive-card-chip');
                    chip.style.borderColor = 'var(--success-color)';
                    
                    const idSpan = document.createElement('span');
                    idSpan.classList.add('card-id');
                    idSpan.textContent = `#${c.id_interno}`;
                    
                    chip.appendChild(idSpan);
                    
                    chip.addEventListener('click', () => {
                        showPreviewModal(c);
                    });
                    
                    predictiveList.appendChild(chip);
                });
            } else {
                predictiveBar.style.display = 'none';
            }
            return;
        }
        
        let closeCards = [];
        
        state.cartones.forEach(c => {
            if (c.estado === 'activo') {
                const distInfo = window.engine.getDistanceToWin(c.matriz, balotasSet, state.modoJuego, state.mascaraPersonalizada, state.columnaFijaIndex);
                if (distInfo && distInfo.missingCount > 0 && distInfo.missingCount <= 2) {
                    closeCards.push({ carton: c, ...distInfo });
                    
                    // Toast Notification for Distance 1
                    if (distInfo.missingCount === 1 && !nearWinIds.has(c.id_interno)) {
                        nearWinIds.add(c.id_interno);
                        showToast(`🔥 ¡Al Cartón #${c.id_interno} le falta 1 balota!`);
                    }
                } else if (distInfo && distInfo.missingCount > 1) {
                    // Si se alejó (por ej un deshacer), lo removemos
                    nearWinIds.delete(c.id_interno);
                }
            }
        });
        
        if (closeCards.length > 0) {
            predictiveBar.style.display = 'flex';
            predictiveList.innerHTML = '';
            
            closeCards.sort((a, b) => a.missingCount - b.missingCount);
            
            closeCards.forEach(info => {
                const chip = document.createElement('div');
                chip.classList.add('predictive-card-chip');
                
                const idSpan = document.createElement('span');
                idSpan.classList.add('card-id');
                idSpan.textContent = info.carton.id_interno;
                
                const missingSpan = document.createElement('span');
                missingSpan.classList.add('missing-count');
                missingSpan.textContent = info.missingCount;
                
                chip.appendChild(idSpan);
                chip.appendChild(missingSpan);
                
                chip.addEventListener('click', () => {
                    showPreviewModal(info.carton, info.missingNumbers);
                });
                
                predictiveList.appendChild(chip);
            });
        } else {
            predictiveBar.style.display = 'none';
        }
    }
    
    function triggerBingoModal(cartones) {
        pendingBingoCard = cartones;
        
        if (Array.isArray(cartones) && cartones.length > 1) {
            // Múltiples ganadores
            bingoCardInfoSpans[0].textContent = cartones.map(c => c.id_interno).join(', ');
            bingoCardInfoSpans[1].textContent = "Múltiples";
        } else {
            // Un solo ganador (puede venir como array de 1 o como objeto dependiendo del modo)
            const winner = Array.isArray(cartones) ? cartones[0] : cartones;
            bingoCardInfoSpans[0].textContent = winner.id_interno;
            bingoCardInfoSpans[1].textContent = winner.serial_impreso;
        }
        
        bingoModal.classList.add('show');
        document.body.classList.add('bingo-flash');
        
        // Confetti!
        if (window.confetti) {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
                zIndex: 10001
            });
        }
    }

    function closeModal() {
        bingoModal.classList.remove('show');
        document.body.classList.remove('bingo-flash');
        pendingBingoCard = null;
    }
});
