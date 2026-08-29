Actúa como un desarrollador Frontend Senior experto en PWA (Progressive Web Apps) y lógica de estado. Tu tarea es construir una aplicación web estática para jugar Bingo. La app debe funcionar 100% offline, estar optimizada para móviles y estructurada para ser alojada en GitHub Pages.

STACK TÉCNICO:

- HTML5, CSS3, JavaScript (o el framework Frontend que mejor manejes, como React o Vue).
- Almacenamiento local mediante `localStorage` para persistencia de datos de los cartones y el estado del juego.
- PWA: Debe incluir un `manifest.json` válido y un `sw.js` (Service Worker) que cachee todos los assets para funcionar sin conexión.
- UI/UX: Interfaz oscura (Dark Mode), botones grandes y optimizada para uso táctil rápido sin errores.

ESTRUCTURA DE DATOS (JSON):
Cada cartón se guardará con este modelo:
{
"id_interno": 1, // Número secuencial autogenerado por la app al cargar.
"serial_impreso": "string", // Opcional, extraído del cartón físico.
"estado": "activo", // Estados posibles: "activo", "pausado", "inactivo".
"matriz": [[...5 elementos...], [...], [...], [...], [...]] // Matriz 5x5. El centro (2,2) siempre es 0.
}

MÓDULOS DE LA APLICACIÓN:

1. MÓDULO DE INGESTA (Carga de Cartones):

- Un área de texto grande (Textarea) donde el usuario pegará un JSON con el array de cartones.
- Un botón "Cargar Cartones". Al procesarlo, la app debe mapear el array y asignarles automáticamente un `id_interno` (1, 2, 3...) a cada uno.
- Una vista de "Mis Cartones" donde se listen los cartones cargados (id_interno y serial) para que el usuario pueda marcarlos físicamente.

2. MÓDULO DE PRE-PARTIDA (Configuración):

- Un selector de "Modo de Juego" con las siguientes opciones:
  a) Tabla Llena (Acierto de 24 números).
  b) Cruz (Fila 2 y Columna 2).
  c) La X (Diagonales principales).
  d) Contorno / La O (Fila 0, Fila 4, Columna 0, Columna 4).
  e) Personalizado (Abre una cuadrícula 5x5 interactiva donde el usuario toca las casillas para crear una "máscara booleana" personalizada).
  f) MODO SALADO (Regla especial: Si sale un número que el cartón tiene, el cartón es ELIMINADO. Gana el último cartón que quede vivo).

3. MÓDULO DE GAMEPLAY (En Vivo):

- Panel Numérico: Una cuadrícula del 1 al 75. Al tocar un número, este cambia de color y se añade a un Set de "balotas cantadas".
- Botón "Deshacer" (Undo): Elimina la última balota ingresada por si hubo un error de toque.
- Botón "Limpiar Ronda": Reinicia el Set de balotas cantadas, pero mantiene los cartones cargados.

4. MOTOR DE EVALUACIÓN Y ALERTAS:

- Cada vez que se ingresa una balota, la app debe cruzar el Set de balotas cantadas con las matrices de los cartones con estado "activo".
- Si un cartón completa el "Modo de Juego" seleccionado, debe aparecer un Modal Gigante e intrusivo con el texto: "¡BINGO! CARTÓN # [id_interno] (Serial: [serial_impreso])".
- Este modal debe tener dos botones para gestionar el estado del cartón:
  1. "Sigue Jugando" (Se mantiene "activo" por si hay desempate o cambio de premio).
  2. "Desactivar" (Pasa a "inactivo" y el motor ya no lo evalúa en esta ronda).
- Si está en MODO SALADO, el panel debe mostrar un contador gigante: "Cartones Sobrevivientes: X / Total". Y lanzar la alerta cuando quede 1 cartón (o si todos se eliminan al mismo tiempo).

Por favor, genera la estructura del proyecto, los archivos base, el Service Worker y toda la lógica de validación de matrices. Todo el código debe estar listo para copiar, pegar y funcionar estáticamente.

REQUISITOS ESTRICTOS EXCLUSIVOS PARA iPHONE 16 PRO (iOS Safari):

1. Safe Areas & Dynamic Island: En el HTML, el viewport debe ser `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">`. En el CSS, aplica padding usando `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)` al contenedor principal para evitar la Dynamic Island y el Home Indicator.
2. Prevención de Gestos: Los botones de la cuadrícula de balotas deben tener en su CSS `touch-action: manipulation;` y `user-select: none;` para evitar el delay de 300ms, el zoom accidental por doble toque rápido y la selección de texto.
3. Meta Etiquetas Apple: Incluye obligatoriamente `<meta name="apple-mobile-web-app-capable" content="yes">` y `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`.
4. Feedback Visual Extremo: Como iOS bloquea `navigator.vibrate` en Web Apps, la alerta de "¡BINGO!" debe incluir una animación CSS que haga parpadear agresivamente el fondo de la pantalla (ej. de negro a rojo/verde) para captar la atención inmediatamente.
5. Wake Lock API: Implementa `navigator.wakeLock.request('screen')`, pero asegúrate de que se ejecute o re-solicite en el evento del primer toque o clic del usuario (ej. al seleccionar la primera balota), ya que Safari bloquea su ejecución automática.
