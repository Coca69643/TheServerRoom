const GameState = {
    currentScreen: 'menu',
    isPaused: false,
    gameStarted: false,
    introCompleted: false,
    saveExists: false,
    difficulty: 'normal'
};

// ===============================
// 2. SISTEMA DE CONFIGURAÇÕES
// ===============================
const Settings = {
    // Gráficos
    crtEffect: true,
    scanlines: true,
    showFPS: false,
    
    // Áudio
    masterVolume: 100,
    musicVolume: 80,
    sfxVolume: 90,
    
    // Interface
    vibration: true,
    uiScale: 100,
    
    // Jogabilidade
    difficulty: 'normal',
    
    // Salvar configurações
    save: function() {
        localStorage.setItem('serverRoomSettings', JSON.stringify({
            crtEffect: this.crtEffect,
            scanlines: this.scanlines,
            showFPS: this.showFPS,
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            vibration: this.vibration,
            uiScale: this.uiScale,
            difficulty: this.difficulty
        }));
    },
    
    // Carregar configurações
    load: function() {
        const saved = localStorage.getItem('serverRoomSettings');
        if (saved) {
            const config = JSON.parse(saved);
            Object.assign(this, config);
            console.log('Configurações carregadas:', config);
        }
        return this;
    },
    
    // Aplicar configurações no DOM
    apply: function() {
        // Aplicar efeitos visuais
        document.body.classList.toggle('crt-effect', this.crtEffect);
        document.body.classList.toggle('scanlines', this.scanlines);
        
        // Aplicar volume
        if (window.audioManager) {
            audioManager.setVolume('master', this.masterVolume);
            audioManager.setVolume('music', this.musicVolume);
            audioManager.setVolume('sfx', this.sfxVolume);
        }
        
        // Atualizar dificuldade do jogo
        GameState.difficulty = this.difficulty;
        this.applyDifficulty();
    },
    
    // Aplicar configurações de dificuldade
    applyDifficulty: function() {
        const difficulties = {
            'easy': { aiLevel: 1, movementInterval: 15000 },
            'normal': { aiLevel: 2, movementInterval: 10000 },
            'hard': { aiLevel: 3, movementInterval: 7000 }
        };
        
        const config = difficulties[this.difficulty];
        if (config && window.byteAIMotor) {
            byteAIMotor.setAILevel(config.aiLevel);
            byteAIMotor.movementInterval = config.movementInterval;
        }
    }
};

// ===============================
// 3. SISTEMA DE MENU PRINCIPAL
// ===============================
class MainMenu {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.checkSave();
    }
    
    initElements() {
        this.elements = {
            menuScreen: document.getElementById('menuScreen'),
            settingsPanel: document.getElementById('settingsPanel'),
            introScreen: document.getElementById('introScreen'),
            gameScreen: document.getElementById('gameScreen'),
            
            // Botões do menu
            newGameBtn: document.getElementById('newGameBtn'),
            continueBtn: document.getElementById('continueBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            
            // Configurações
            closeSettingsBtn: document.getElementById('closeSettings'),
            settingsTabs: document.querySelectorAll('.settings-tab'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // Toggles
            crtToggle: document.getElementById('crtToggle'),
            scanlinesToggle: document.getElementById('scanlinesToggle'),
            fpsToggle: document.getElementById('fpsToggle'),
            vibrationToggle: document.getElementById('vibrationToggle'),
            
            // Sliders
            difficultySlider: document.getElementById('difficultySlider'),
            difficultyValue: document.getElementById('difficultyValue'),
            masterVolumeSlider: document.getElementById('masterVolume'),
            musicVolumeSlider: document.getElementById('musicVolume'),
            sfxVolumeSlider: document.getElementById('sfxVolume'),
            uiScaleSlider: document.getElementById('uiScale'),
            
            // Valores dos sliders
            masterValue: document.getElementById('masterValue'),
            musicValue: document.getElementById('musicValue'),
            sfxValue: document.getElementById('sfxValue'),
            uiScaleValue: document.getElementById('uiScaleValue'),
            
            // Intro
            introText: document.getElementById('introText'),
            acceptBtn: document.getElementById('acceptBtn')
        };
    }
    
    bindEvents() {
        // Menu principal
        this.elements.newGameBtn?.addEventListener('click', () => this.showIntro());
        this.elements.continueBtn?.addEventListener('click', () => this.continueGame());
        this.elements.settingsBtn?.addEventListener('click', () => this.showSettings());
        
        // Configurações
        this.elements.closeSettingsBtn?.addEventListener('click', () => this.hideSettings());
        
        // Tabs das configurações
        this.elements.settingsTabs?.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e));
        });
        
        // Toggles
        this.bindToggle('crtToggle', 'crtEffect', () => {
            document.body.classList.toggle('crt-effect', Settings.crtEffect);
        });
        
        this.bindToggle('scanlinesToggle', 'scanlines', () => {
            document.body.classList.toggle('scanlines', Settings.scanlines);
        });
        
        this.bindToggle('fpsToggle', 'showFPS', this.toggleFPS);
        this.bindToggle('vibrationToggle', 'vibration');
        
        // Sliders
        this.bindSlider('difficultySlider', 'difficulty', (value) => {
            const difficulties = ['Fácil', 'Normal', 'Difícil'];
            this.elements.difficultyValue.textContent = difficulties[value - 1];
            Settings.difficulty = ['easy', 'normal', 'hard'][value - 1];
            Settings.applyDifficulty();
        });
        
        this.bindSlider('masterVolume', 'masterVolume', (value) => {
            this.elements.masterValue.textContent = `${value}%`;
        });
        
        this.bindSlider('musicVolume', 'musicVolume', (value) => {
            this.elements.musicValue.textContent = `${value}%`;
        });
        
        this.bindSlider('sfxVolume', 'sfxVolume', (value) => {
            this.elements.sfxValue.textContent = `${value}%`;
        });
        
        this.bindSlider('uiScale', 'uiScale', (value) => {
            this.elements.uiScaleValue.textContent = `${value}%`;
            document.documentElement.style.setProperty('--ui-scale', `${value/100}`);
        });
        
        // Intro
        this.elements.acceptBtn?.addEventListener('click', () => this.startGame());
    }
    
    bindToggle(elementId, settingKey, callback = null) {
        const element = this.elements[elementId];
        if (!element) return;
        
        element.addEventListener('change', () => {
            Settings[settingKey] = element.checked;
            Settings.save();
            if (callback) callback();
        });
    }
    
    bindSlider(elementId, settingKey, updateCallback = null) {
        const element = this.elements[elementId];
        if (!element) return;
        
        element.addEventListener('input', () => {
            Settings[settingKey] = parseInt(element.value);
            Settings.save();
            if (updateCallback) updateCallback(Settings[settingKey]);
        });
    }
    
    checkSave() {
        // Verificar se há save game
        const saveData = localStorage.getItem('serverRoomSave');
        this.elements.continueBtn.disabled = !saveData;
        GameState.saveExists = !!saveData;
    }
    
    showScreen(screenId) {
        // Esconder todas as telas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar tela desejada
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            GameState.currentScreen = screenId;
        }
    }
    
    showIntro() {
        this.showScreen('introScreen');
        this.startTypewriter();
    }
    
    continueGame() {
        if (!GameState.saveExists) return;
        
        // Carregar save game
        const saveData = JSON.parse(localStorage.getItem('serverRoomSave'));
        console.log('Save carregado:', saveData);
        
        // Iniciar jogo diretamente
        this.startGame();
    }
    
    showSettings() {
        this.elements.settingsPanel.classList.add('active');
        this.loadSettingsToUI();
    }
    
    hideSettings() {
        this.elements.settingsPanel.classList.remove('active');
        Settings.apply();
    }
    
    switchTab(e) {
        const tabId = e.target.dataset.tab;
        
        // Ativar tab
        this.elements.settingsTabs?.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        
        // Mostrar conteúdo
        this.elements.tabContents?.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}Tab`);
        });
    }
    
    loadSettingsToUI() {
        // Carregar toggles
        this.elements.crtToggle.checked = Settings.crtEffect;
        this.elements.scanlinesToggle.checked = Settings.scanlines;
        this.elements.fpsToggle.checked = Settings.showFPS;
        this.elements.vibrationToggle.checked = Settings.vibration;
        
        // Carregar sliders
        this.elements.difficultySlider.value = 
            Settings.difficulty === 'easy' ? 1 : 
            Settings.difficulty === 'normal' ? 2 : 3;
        
        this.elements.masterVolumeSlider.value = Settings.masterVolume;
        this.elements.musicVolumeSlider.value = Settings.musicVolume;
        this.elements.sfxVolumeSlider.value = Settings.sfxVolume;
        this.elements.uiScaleSlider.value = Settings.uiScale;
        
        // Atualizar labels
        const difficulties = ['Fácil', 'Normal', 'Difícil'];
        this.elements.difficultyValue.textContent = 
            difficulties[this.elements.difficultySlider.value - 1];
        
        this.elements.masterValue.textContent = `${Settings.masterVolume}%`;
        this.elements.musicValue.textContent = `${Settings.musicVolume}%`;
        this.elements.sfxValue.textContent = `${Settings.sfxVolume}%`;
        this.elements.uiScaleValue.textContent = `${Settings.uiScale}%`;
    }
    
    // ===============================
    // 4. INTRO COM TYPEWRITER EFFECT
    // ===============================
    startTypewriter() {
        const textElement = this.elements.introText;
        const acceptButton = this.elements.acceptBtn;
        
        // Texto do termo de compromisso
        const introText = `SERVIDOR 05 - TERMO DE COMPROMISSO

BEM-VINDO AO SISTEMA DE VIGILÂNCIA
-----------------------------------
CARGO: TÉCNICO DE SEGURANÇA NOTURNO
LOCAL: SALA DO SERVIDOR 05
PERÍODO: 00:00 - 06:00

TERMOS E CONDIÇÕES:
1. VOCÊ DEVE MONITORAR 5 CÂMERAS
2. NENHUM ACESSO EXTERNO PERMITIDO
3. BYTE (UNIDADE DE MANUTENÇÃO) PODE SE TORNAR HOSTIL
4. RELATAR QUALQUER ANORMALIDADE
5. NÃO ABANDONAR O POSTO

AVISO DE SEGURANÇA:
O SISTEMA BYTE PODE APRESENTAR
COMPORTAMENTOS IMPREVISÍVEIS À NOITE.
MANTENHA VIGILÂNCIA CONSTANTE.

ACEITAR ESTE TERMO INDICA QUE VOCÊ
COMPREENDE OS RISCOS E ASSUME TODA
RESPONSABILIDADE POR EVENTUAIS
INCIDENTES.

PRESSIONE "ACEITAR RISCOS" PARA INICIAR.`;
        
        textElement.textContent = '';
        acceptButton.style.opacity = '0';
        acceptButton.style.pointerEvents = 'none';
        
        let i = 0;
        const speed = 30; // ms por caractere
        
        function typeWriter() {
            if (i < introText.length) {
                const char = introText.charAt(i);
                textElement.textContent += char;
                
                // Efeito sonoro (opcional)
                if (char !== ' ' && i % 3 === 0) {
                    playTypeSound();
                }
                
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // Texto completo - mostrar botão
                acceptButton.style.opacity = '1';
                acceptButton.style.pointerEvents = 'auto';
                acceptButton.classList.add('pulse');
            }
        }
        
        typeWriter();
    }
    
    startGame() {
        this.showScreen('gameScreen');
        GameState.gameStarted = true;
        GameState.introCompleted = true;
        
        // Inicializar motor do Byte
        initializeByteAI();
        
        // Aplicar configurações
        Settings.apply();
        Settings.applyDifficulty();
        
        // Iniciar sistema de câmeras (se existir)
        if (window.startCameraSystem) {
            startCameraSystem();
        }
        
        // Mostrar notificação
        this.showGameNotification('Sistema de vigilância ativado. Boa sorte.');
        
        // Salvar progresso
        this.saveGame();
    }
    
    showGameNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 20, 0, 0.9);
            color: #0f0;
            padding: 15px;
            border: 2px solid #0f0;
            border-radius: 5px;
            font-family: monospace;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    saveGame() {
        const saveData = {
            timestamp: Date.now(),
            difficulty: GameState.difficulty,
            introCompleted: true,
            night: 1
        };
        
        localStorage.setItem('serverRoomSave', JSON.stringify(saveData));
        this.checkSave(); // Atualizar botão CONTINUAR
    }
    
    toggleFPS() {
        if (Settings.showFPS) {
            if (!window.fpsCounter) {
                this.createFPSCounter();
            } else {
                window.fpsCounter.style.display = 'block';
            }
        } else {
            if (window.fpsCounter) {
                window.fpsCounter.style.display = 'none';
            }
        }
    }
    
    createFPSCounter() {
        const fpsCounter = document.createElement('div');
        fpsCounter.id = 'fpsCounter';
        fpsCounter.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #0f0;
            padding: 5px 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            border: 1px solid #0f0;
        `;
        
        document.body.appendChild(fpsCounter);
        window.fpsCounter = fpsCounter;
        
        let frameCount = 0;
        let lastTime = performance.now();
        
        function updateFPS() {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                fpsCounter.textContent = `FPS: ${Math.round((frameCount * 1000) / (currentTime - lastTime))}`;
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (Settings.showFPS) {
                requestAnimationFrame(updateFPS);
            }
        }
        
        updateFPS();
    }
}

// ===============================
// 5. SISTEMA DE ÁUDIO (SIMPLIFICADO)
// ===============================
const audioManager = {
    sounds: {},
    
    init: function() {
        // Criar elementos de áudio
        this.sounds = {
            typewriter: this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ'),
            click: this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ'),
            cameraSwitch: this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ')
        };
    },
    
    createSound: function(src) {
        const audio = new Audio();
        audio.src = src;
        audio.preload = 'auto';
        return audio;
    },
    
    play: function(soundName) {
        if (this.sounds[soundName] && Settings.sfxVolume > 0) {
            const audio = this.sounds[soundName].cloneNode();
            audio.volume = Settings.sfxVolume / 100 * Settings.masterVolume / 100;
            audio.play().catch(e => console.log('Audio error:', e));
        }
    },
    
    setVolume: function(type, value) {
        if (type === 'master') {
            Settings.masterVolume = value;
        } else if (type === 'music') {
            Settings.musicVolume = value;
        } else if (type === 'sfx') {
            Settings.sfxVolume = value;
        }
        Settings.save();
    }
};

// ===============================
// 6. FUNÇÕES AUXILIARES
// ===============================
function playTypeSound() {
    if (audioManager && Settings.sfxVolume > 0) {
        audioManager.play('typewriter');
    }
}

function vibrate(pattern = 50) {
    if (Settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// ===============================
// 7. INICIALIZAÇÃO DO JOGO
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    console.log('The Server Room - Inicializando...');
    
    // Carregar configurações
    Settings.load();
    
    // Inicializar sistema de áudio
    audioManager.init();
    
    // Inicializar menu principal
    window.mainMenu = new MainMenu();
    
    // Aplicar configurações iniciais
    Settings.apply();
    
    // Verificar e inicializar FPS counter se necessário
    if (Settings.showFPS) {
        setTimeout(() => mainMenu.toggleFPS(), 1000);
    }
    
    // Efeito de inicialização
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('Jogo inicializado com sucesso!');
});

// ===============================
// 8. EVENT LISTENERS GLOBAIS
// ===============================
// Fechar configurações com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel?.classList.contains('active')) {
            window.mainMenu?.hideSettings();
        }
    }
});

// Click sound em botões
document.addEventListener('click', function(e) {
    if (e.target.matches('button, .btn, .toggle, .tab')) {
        vibrate(30);
        audioManager.play('click');
    }
});

// ===============================
// 9. ESTILOS DINÂMICOS (CSS Variables)
// ===============================
const style = document.createElement('style');
style.textContent = `
    :root {
        --ui-scale: 1;
    }
    
    .crt-effect::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
      height: 100%;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
        background-size: 100% 4px;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.3;
    }
    
    .scanlines::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15) 0px,
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
        );
        pointer-events: none;
        z-index: 9998;
    }
    
    .game-notification {
        animation: fadeInOut 3s ease-in-out;
    }
    
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        15% { opacity: 1; transform: translateY(0); }
        85% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
    
    .pulse {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
    }
    
    /* Ajuste de escala da UI */
    .screen {
        transform: scale(var(--ui-scale));
        transform-origin: center;
        transition: transform 0.3s ease;
    }
`;

document.head.appendChild(style);

// ===============================
// 10. INTEGRAÇÃO COM MOTOR BYTE
// ===============================
// O motor Byte (código anterior) deve ser incluído aqui ou em arquivo separado
// Inicializamos quando o jogo começa
```
// ============================================================
//  MÓDULO — FLUXO DE INTRODUÇÃO + CENA 3D
//  Duck Dream Studios — The Server Room
//  Desenvolvedor Sênior
//  REGRA: Não interfere no código do Deep Seek acima
// ============================================================

// === UTILITÁRIO DE TELAS ===
function showScreen(id) {
    const screens = [
        'mainMenu',
        'settingsPanel',
        'introScreen',
        'sceneContainer',
        'gameContainer'
    ];

    screens.forEach(screenId => {
        const el = document.getElementById(screenId);
        if (!el) return;

        if (screenId === id) {
            el.classList.add('active');
        } else {
            // Protege o gameContainer do Deep Seek
            if (screenId === 'gameContainer' && id !== 'gameContainer') return;
            el.classList.remove('active');
        }
    });
}

// === DATA/HORA NO CABEÇALHO DO E-MAIL ===
function setEmailDate() {
    const el = document.getElementById('emailDate');
    if (!el) return;

    const now = new Date();
    const dd   = String(now.getDate()).padStart(2, '0');
    const mm   = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh   = String(now.getHours()).padStart(2, '0');
    const min  = String(now.getMinutes()).padStart(2, '0');

    el.textContent = `${dd}/${mm}/${yyyy}  ${hh}:${min}`;
}

// === TEXTO DO E-MAIL ===
const EMAIL_TEXT =
`Prezado(a) Técnico(a) de Plantão,

Você foi designado(a) para o turno noturno no Data Center
Setor 7 — Instalação AEC-BR-09.

Suas responsabilidades incluem:

  [1] Monitoramento contínuo dos servidores ativos.
  [2] Verificação dos sistemas de refrigeração.
  [3] Registro de qualquer anomalia no terminal local.

AVISO IMPORTANTE:

A Aether Computing Corp isenta-se de qualquer
responsabilidade por danos físicos, psicológicos
ou existenciais decorrentes de contato direto ou
indireto com a entidade catalogada sob o código:

            B . Y . T . E

Este protocolo foi homologado pelo Departamento
Jurídico em 14/03/2019 e está em conformidade
com a Cláusula 7-Ω do seu contrato de trabalho.

Não tente desligar o sistema.
Não tente sair pelo acesso principal.
Siga as câmeras.

Atenciosamente,
Departamento de Recursos Humanos
Aether Computing Corp`;

// === EFEITO TYPEWRITER ===
function startTypewriter(text, targetId, cursorId, onComplete) {
    const target = document.getElementById(targetId);
    const cursor = document.getElementById(cursorId);
    if (!target) return;

    let index = 0;
    target.textContent = '';

    // Velocidade variável: pausa em pontuação
    function getDelay(char) {
        if (['.', '!', '?'].includes(char)) return 120;
        if ([',', ';', ':'].includes(char)) return 60;
        if (char === '\n') return 40;
        return 22;
    }

    function type() {
        if (index < text.length) {
            target.textContent += text[index];
            index++;

            // Auto-scroll suave
            const body = document.getElementById('emailBody');
            if (body) body.scrollTop = body.scrollHeight;

            setTimeout(type, getDelay(text[index - 1]));
        } else {
            // Typewriter concluído
            if (cursor) cursor.style.display = 'none';
            if (onComplete) onComplete();
        }
    }

    type();
}

// === BOTÃO CONFIRMAR RECEBIMENTO ===
function showConfirmButton() {
    const btn = document.getElementById('confirmBtn');
    if (!btn) return;

    btn.style.display = 'block';
    btn.style.opacity = '0';
    btn.style.transition = 'opacity 0.8s ease';

    // Pequeno delay para o fade-in ser perceptível
    setTimeout(() => {
        btn.style.opacity = '1';
    }, 100);

    btn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(60);
        initThreeScene();
    }, { once: true });
}

// === INICIAR INTRO SCREEN ===
function startIntroScreen() {
    showScreen('introScreen');
    setEmailDate();

    // Pequeno delay antes de começar a digitar
    setTimeout(() => {
        startTypewriter(
            EMAIL_TEXT,
            'typewriterText',
            'typewriterCursor',
            showConfirmButton
        );
    }, 600);
}

// === BOTÃO NOVO JOGO (MENU PRINCIPAL) ===
const newGameBtn = document.getElementById('newGameBtn');
if (newGameBtn) {
    newGameBtn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(40);
        startIntroScreen();
    });
}

// ============================================================
//  CENA THREE.JS — ESTACIONAMENTO DA AETHER CORP
// ============================================================

function initThreeScene() {
    showScreen('sceneContainer');

    // Carrega Three.js dinamicamente (sem biblioteca local)
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = buildScene;
    script.onerror = () => {
        console.warn('Three.js não carregou. Verifique conexão.');
    };
    document.head.appendChild(script);
}

function buildScene() {
    const canvas  = document.getElementById('threeCanvas');
    const W       = window.innerWidth;
    const H       = window.innerHeight;

    // --- RENDERER ---
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x050a05);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- CENA ---
    const scene = new THREE.Scene();
    scene.fog   = new THREE.FogExp2(0x050a05, 0.07);

    // --- CÂMERA ---
    const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 80);
    camera.position.set(0, 1.7, 0);

    // -------------------------------------------------------
    //  GEOMETRIAS
    // -------------------------------------------------------

    // Asfalto molhado
    const floorGeo = new THREE.PlaneGeometry(80, 80, 30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x080808,
        roughness: 0.1,
        metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Reflexo verde no asfalto (overlay plano)
    const reflectGeo = new THREE.PlaneGeometry(80, 80);
    const reflectMat = new THREE.MeshBasicMaterial({
        color: 0x001a00,
        transparent: true,
        opacity: 0.35
    });
    const reflect = new THREE.Mesh(reflectGeo, reflectMat);
    reflect.rotation.x = -Math.PI / 2;
    reflect.position.y = 0.01;
    scene.add(reflect);

    // Função para criar postes de luz verde ao longe
    function createLampPost(x, z) {
        const group = new THREE.Group();

        // Poste
        const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 4, 6);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const post    = new THREE.Mesh(postGeo, postMat);
        post.position.y = 2;
        group.add(post);

        // Cúpula da lâmpada
        const domeGeo = new THREE.SphereGeometry(0.18, 8, 8);
        const domeMat = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff44,
            emissiveIntensity: 2
        });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = 4.2;
        group.add(dome);

        // Luz pontual
        const light = new THREE.PointLight(0x00ff44, 1.2, 12);
        light.position.y = 4.1;
        light.castShadow = true;
        group.add(light);

        group.position.set(x, 0, z);
        scene.add(group);
    }

    // Postes ao longo do estacionamento
    createLampPost(-6,  -8);
    createLampPost( 6,  -8);
    createLampPost(-6, -18);
    createLampPost( 6, -18);
    createLampPost(-6, -28);
    createLampPost( 6, -28);

    // Luz ambiente fraquíssima
    const ambientLight = new THREE.AmbientLight(0x001a00, 0.4);
    scene.add(ambientLight);

    // Luz direcional suave (simula luar neblina)
    const dirLight = new THREE.DirectionalLight(0x003311, 0.3);
    dirLight.position.set(0, 10, -5);
    scene.add(dirLight);

    // Cercas / muros ao fundo
    function createWall(x, z, w, h, d) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.9
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, h / 2, z);
        mesh.receiveShadow = true;
        mesh.castShadow    = true;
        scene.add(mesh);
    }

    createWall(0,   -38, 40, 3, 0.5);  // Muro fundo
    createWall(-20, -20,  0.5, 3, 20); // Muro esquerdo
    createWall( 20, -20,  0.5, 3, 20); // Muro direito

    // Partículas de neblina / chuva fina
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = Math.random() * 6;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
        color: 0x00ff44,
        size: 0.04,
        transparent: true,
        opacity: 0.25
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // -------------------------------------------------------
    //  CONTROLES TOUCH MOBILE
    // -------------------------------------------------------
    const input = {
        moving:      false,
        looking:     false,
        lookDeltaX:  0,
        lastTouchX:  0
    };

    const touchLeft  = document.getElementById('touchLeft');
    const touchRight = document.getElementById('touchRight');

    // Zona esquerda — andar
    touchLeft.addEventListener('touchstart', e => {
        e.preventDefault();
        input.moving = true;
    }, { passive: false });

    touchLeft.addEventListener('touchend', () => {
        input.moving = false;
    });

    // Zona direita — olhar
    touchRight.addEventListener('touchstart', e => {
        e.preventDefault();
        input.looking    = true;
        input.lastTouchX = e.touches[0].clientX;
    }, { passive: false });

    touchRight.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!input.looking) return;
        const deltaX     = e.touches[0].clientX - input.lastTouchX;
        input.lookDeltaX = deltaX;
        input.lastTouchX = e.touches[0].clientX;
    }, { passive: false });

    touchRight.addEventListener('touchend', () => {
        input.looking    = false;
        input.lookDeltaX = 0;
    });

    // -------------------------------------------------------
    //  ESTADO DA CÂMERA
    // -------------------------------------------------------
    let yaw = 0; // Rotação horizontal acumulada

    // -------------------------------------------------------
    //  LOOP DE ANIMAÇÃO
    // -------------------------------------------------------
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        // Andar para frente
        if (input.moving) {
            const speed    = 3.5 * delta;
            camera.position.x -= Math.sin(yaw) * speed;
            camera.position.z -= Math.cos(yaw) * speed;

            // Limite da cena
            camera.position.z = Math.max(camera.position.z, -34);
        }

        // Girar câmera (olhar)
        if (input.looking && Math.abs(input.lookDeltaX) > 0.5) {
            yaw -= input.lookDeltaX * 0.003;
            camera.rotation.y = yaw;
            input.lookDeltaX  = 0;
        }

        // Animar partículas (chuva leve caindo)
        const pos = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3 + 1] -= 0.03;
            if (pos[i * 3 + 1] < 0) {
                pos[i * 3 + 1] = 6;
            }
        }
        particleGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();

    // Resize responsivo
    window.addEventListener('resize', () => {
        const nW = window.innerWidth;
        const nH = window.innerHeight;
        camera.aspect = nW / nH;
        camera.updateProjectionMatrix();
        renderer.setSize(nW, nH);
    });
}