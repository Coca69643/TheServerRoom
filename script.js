// === CONFIGURAÇÕES DO JOGO ===
const HEAT_INCREASE_RATE = 0.5; // Calor aumenta 0.5% por segundo com câmera aberta
const HEAT_DECREASE_RATE = 1.5; // Calor diminui 1.5% por segundo com câmera fechada
const MAX_HEAT = 100;
const OVERHEAT_COOLDOWN_TIME = 3000; // 3 segundos de cooldown

// === ESTADO DO JOGO ===
let gameState = {
    currentCamera: null,
    monitorOpen: false,
    heat: 0,
    isOverheated: false,
    gameStartTime: Date.now(),
    lastUpdateTime: Date.now()
};

// === DADOS DAS CÂMERAS ===
const cameras = {
    1: {
        name: "ENTRADA",
        description: "Porta principal do Data Center. Acesso bloqueado.",
        hasEntity: false
    },
    2: {
        name: "CORREDOR A",
        description: "Corredor leste. Iluminação intermitente.",
        hasEntity: false
    },
    3: {
        name: "SALA SERVIDORES",
        description: "Núcleo principal. Racks ativos detectados.",
        hasEntity: false
    },
    4: {
        name: "CORREDOR B",
        description: "Corredor oeste. Temperatura elevada.",
        hasEntity: false
    },
    5: {
        name: "DEPÓSITO",
        description: "Área de armazenamento. Movimento detectado.",
        hasEntity: true // Byte pode aparecer aqui
    }
};

// === ELEMENTOS DOM ===
const elements = {
    heatBar: document.getElementById('heatBar'),
    heatValue: document.getElementById('heatValue'),
    gameTime: document.getElementById('gameTime'),
    cameraLabel: document.getElementById('cameraLabel'),
    cameraTime: document.getElementById('cameraTime'),
    cameraView: document.getElementById('cameraView'),
    overheatWarning: document.getElementById('overheatWarning'),
    cooldownBar: document.getElementById('cooldownBar'),
    closeMonitor: document.getElementById('closeMonitor'),
    camButtons: document.querySelectorAll('.cam-button')
};

// === INICIALIZAÇÃO ===
function init() {
    setupEventListeners();
    startGameLoop();
    updateTime();
    setInterval(updateTime, 1000);
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    // Botões de câmera
    elements.camButtons.forEach(button => {
        button.addEventListener('click', () => {
            const camNumber = parseInt(button.dataset.cam);
            switchCamera(camNumber);
        });
    });
    
    // Botão fechar monitor
    elements.closeMonitor.addEventListener('click', closeMonitor);
}

// === TROCA DE CÂMERA ===
function switchCamera(camNumber) {
    if (gameState.isOverheated) return;
    
    gameState.currentCamera = camNumber;
    gameState.monitorOpen = true;
    
    const camera = cameras[camNumber];
    
    // Atualiza interface
    elements.cameraLabel.textContent = `CAM ${String(camNumber).padStart(2, '0')} - ${camera.name}`;
    updateCameraTime();
    
    // Atualiza visualização
    elements.cameraView.innerHTML = `
        <div class="camera-active">
            <div style="text-align: center; padding: 20px;">
                <p style="font-size: 16px; margin-bottom: 15px; text-shadow: 0 0 10px #00ff00;">
                    ${camera.description}
                </p>
                <div style="border: 1px solid #00ff00; padding: 15px; margin-top: 20px; background: rgba(0, 255, 0, 0.05);">
                    <p style="font-size: 12px; margin-bottom: 8px;">STATUS: ATIVO</p>
                    <p style="font-size: 12px; margin-bottom: 8px;">RESOLUÇÃO: 640x480</p>
                    <p style="font-size: 12px;">MODO: INFRARED</p>
                </div>
                ${camera.hasEntity ? `
                    <div style="margin-top: 20px; padding: 10px; border: 2px solid #ff0000; background: rgba(255, 0, 0, 0.1);">
                        <p style="color: #ff0000; font-size: 14px; text-shadow: 0 0 8px #ff0000; animation: blink 1s infinite;">
                            ⚠ MOVIMENTO DETECTADO ⚠
                        </p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Feedback tátil (se disponível)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// === FECHAR MONITOR ===
function closeMonitor() {
    gameState.monitorOpen = false;
    gameState.currentCamera = null;
    
    elements.cameraLabel.textContent = 'SYSTEM OFFLINE';
    elements.cameraTime.textContent = '--:--';
    
    elements.cameraView.innerHTML = `
        <div class="boot-screen">
            <pre class="ascii-art">
███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ 
██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
            </pre>
            <p class="boot-text">SECURITY MONITORING SYSTEM v1.4</p>
            <p class="boot-text blink">PRESS ANY CAMERA TO BEGIN...</p>
        </div>
    `;
    
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
}

// === ATUALIZAÇÃO DE CALOR ===
function updateHeat(deltaTime) {
    if (gameState.isOverheated) return;
    
    const deltaSeconds = deltaTime / 1000;
    
    if (gameState.monitorOpen) {
        // Aumenta calor quando monitor está aberto
        gameState.heat = Math.min(MAX_HEAT, gameState.heat + (HEAT_INCREASE_RATE * deltaSeconds));
    } else {
        // Diminui calor quando monitor está fechado
        gameState.heat = Math.max(0, gameState.heat - (HEAT_DECREASE_RATE * deltaSeconds));
    }
    
    // Atualiza UI
    const heatPercent = Math.round(gameState.heat);
    elements.heatBar.style.width = heatPercent + '%';
    elements.heatValue.textContent = heatPercent + '%';
    
    // Verifica superaquecimento
    if (gameState.heat >= MAX_HEAT) {
        triggerOverheat();
    }
}

// === SUPERAQUECIMENTO ===
function triggerOverheat() {
    gameState.isOverheated = true;
    gameState.monitorOpen = false;
    
    elements.overheatWarning.classList.add('active');
    
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
    }
    
    // Animação de cooldown
    let cooldownProgress = 0;
    const cooldownInterval = setInterval(() => {
        cooldownProgress += 100;
        const percent = (cooldownProgress / OVERHEAT_COOLDOWN_TIME) * 100;
        elements.cooldownBar.style.width = percent + '%';
        
        if (cooldownProgress >= OVERHEAT_COOLDOWN_TIME) {
            clearInterval(cooldownInterval);
            endOverheat();
        }
    }, 100);
}

function endOverheat() {
    gameState.isOverheated = false;
    gameState.heat = 0;
    
    elements.overheatWarning.classList.remove('active');
    elements.cooldownBar.style.width = '0%';
    
    closeMonitor();
}

// === ATUALIZAÇÃO DE TEMPO ===
function updateTime() {
    const elapsed = Date.now() - gameState.gameStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    elements.gameTime.textContent = 
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function updateCameraTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    elements.cameraTime.textContent = `${hours}:${minutes}`;
}

// === LOOP PRINCIPAL ===
function startGameLoop() {
    function gameLoop() {
        const currentTime = Date.now();
        const deltaTime = currentTime - gameState.lastUpdateTime;
        
        updateHeat(deltaTime);
        
        if (gameState.monitorOpen) {
            updateCameraTime();
        }
        
        gameState.lastUpdateTime = currentTime;
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

// === INICIAR JOGO ===
init();

// Motor de IA do Byte - The Server Room
class ByteAIMotor {
    constructor() {
        this.aiLevelByte = 2; // Nível da IA na Noite 1
        this.byteLocation = 5; // Começa na CAM 05
        this.bytePath = [5, 4, 3, 2, 1, "ATAQUE"]; // Caminho linear
        this.currentPathIndex = 0; // Índice no caminho
        this.movementInterval = null;
        this.isActive = false;
        
        // Verificar se a variável global das câmeras existe
        if (typeof currentCamera === 'undefined') {
            console.warn('Variável currentCamera não encontrada. Criando fallback.');
            window.currentCamera = 1; // Fallback
        }
        
        this.setupMovementSystem();
    }
    
    setupMovementSystem() {
        console.log('Motor Byte inicializado. Posição inicial: CAM 05');
    }
    
    // Lógica principal de movimento
    attemptMovement() {
        if (this.byteLocation === "ATAQUE" || this.currentPathIndex >= this.bytePath.length - 1) {
            console.log('Byte já está em posição de ataque!');
            this.stopMovement();
            return;
        }
        
        let successThreshold = this.aiLevelByte;
        
        // Efeito de congelamento - jogador olhando para a câmera
        if (currentCamera === this.byteLocation) {
            successThreshold = Math.floor(this.aiLevelByte * 0.5); // Redução de 50%
            console.log(`Byte congelado na CAM ${this.byteLocation.toString().padStart(2, '0')}! Chance reduzida.`);
        }
        
        // Gerar número aleatório de 1 a 20
        const randomRoll = Math.floor(Math.random() * 20) + 1;
        
        console.log(`Tentativa de movimento: Roll=${randomRoll}, Threshold=${successThreshold}`);
        
        // Verificar se o movimento é bem-sucedido
        if (randomRoll <= successThreshold) {
            this.moveToNextRoom();
        } else {
            console.log(`Byte falhou ao se mover da CAM ${this.byteLocation.toString().padStart(2, '0')}`);
        }
    }
    
    // Movimentar para a próxima sala
    moveToNextRoom() {
        this.currentPathIndex++;
        
        // Verificar se chegou ao ataque
        if (this.currentPathIndex >= this.bytePath.length - 1) {
            this.byteLocation = "ATAQUE";
            console.log('⚠️⚠️⚠️ Byte INVADIU o ESCRITÓRIO! ⚠️⚠️⚠️');
            this.triggerAttack();
            return;
        }
        
        // Atualizar localização
        this.byteLocation = this.bytePath[this.currentPathIndex];
        
        // Log formatado para fácil leitura no console
        const camId = this.byteLocation.toString().padStart(2, '0');
        console.log(`Byte se moveu para -> CAM ${camId}`);
        
        // Evento customizado para integração com o sistema de câmeras
        this.dispatchByteMovementEvent();
    }
    
    // Disparar evento de movimento (para integração)
    dispatchByteMovementEvent() {
        try {
            const event = new CustomEvent('byteMovement', {
                detail: {
                    location: this.byteLocation,
                    cameraId: this.byteLocation,
                    timestamp: Date.now()
                }
            });
            window.dispatchEvent(event);
        } catch (e) {
            console.log('Evento de movimento disparado:', this.byteLocation);
        }
    }
    
    // Trigger de ataque
    triggerAttack() {
        const attackEvent = new CustomEvent('byteAttack', {
            detail: {
                time: Date.now(),
                aiLevel: this.aiLevelByte
            }
        });
        window.dispatchEvent(attackEvent);
        this.stopMovement();
    }
    
    // Iniciar ciclo de decisão
    startMovement() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('Ciclo de decisão do Byte INICIADO (10s interval)');
        
        // Primeira tentativa imediata
        this.attemptMovement();
        
        // Configurar intervalo de 10 segundos
        this.movementInterval = setInterval(() => {
            if (this.byteLocation === "ATAQUE") {
                this.stopMovement();
                return;
            }
            this.attemptMovement();
        }, 10000); // 10 segundos
    }
    
    // Parar movimento
    stopMovement() {
        if (this.movementInterval) {
            clearInterval(this.movementInterval);
            this.movementInterval = null;
        }
        this.isActive = false;
        console.log('Ciclo de decisão do Byte PARADO');
    }
    
    // Reiniciar para posição inicial
    reset() {
        this.stopMovement();
        this.byteLocation = 5;
        this.currentPathIndex = 0;
        console.log('Byte resetado para CAM 05');
    }
    
    // Métodos utilitários para debug
    getStatus() {
        return {
            location: this.byteLocation,
            aiLevel: this.aiLevelByte,
            isActive: this.isActive,
            nextRoom: this.bytePath[this.currentPathIndex + 1] || "ATAQUE"
        };
    }
    
    // Forçar movimento (para testes)
    forceMove() {
        this.moveToNextRoom();
    }
    
    // Atualizar nível da IA (para noites futuras)
    setAILevel(level) {
        this.aiLevelByte = level;
        console.log(`Nível da IA do Byte atualizado para: ${level}`);
    }
}

// Instância global do Byte
let byteAIMotor = null;

// Inicialização segura
function initializeByteAI() {
    if (!byteAIMotor) {
        byteAIMotor = new ByteAIMotor();
    }
    return byteAIMotor;
}

// Funções globais para controle (integração fácil)
window.ByteAI = {
    init: () => initializeByteAI(),
    start: () => byteAIMotor?.startMovement(),
    stop: () => byteAIMotor?.stopMovement(),
    reset: () => byteAIMotor?.reset(),
    status: () => byteAIMotor?.getStatus(),
    forceMove: () => byteAIMotor?.forceMove(),
    setLevel: (level) => byteAIMotor?.setAILevel(level)
};

// Auto-inicialização quando o script carrega
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeByteAI();
        console.log('Byte AI Motor carregado e pronto.');
        console.log('Use ByteAI.start() para iniciar o ciclo de decisão.');
    }, 1000);
});

// Fallback para Acode (execução imediata se DOM já carregado)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeByteAI);
} else {
    setTimeout(initializeByteAI, 500);
}