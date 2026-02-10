// ============================================================
//  THE SERVER ROOM v1.1.0
//  Duck Dream Studios — Desenvolvedor Principal
//  Todos os módulos integrados em arquivo único
// ============================================================

// ============================================================
//  MÓDULO 1 — GERENCIADOR DE TELAS
// ============================================================

const SCREENS = [
    'mainMenu',
    'settingsPanel',
    'introScreen',
    'sceneContainer',
    'gameContainer'
];

function showScreen(id) {
    console.log('[NAV] Navegando para:', id);

    SCREENS.forEach(screenId => {
        const el = document.getElementById(screenId);
        if (!el) {
            console.warn('[NAV] Tela não encontrada:', screenId);
            return;
        }
        el.classList.remove('active');
    });

    const target = document.getElementById(id);
    if (!target) {
        console.error('[NAV] ERRO: Tela alvo não encontrada:', id);
        return;
    }

    target.classList.add('active');
    console.log('[NAV] Tela ativa:', id);
}

// ============================================================
//  MÓDULO 2 — MENU PRINCIPAL
// ============================================================

function initMenu() {
    const newGameBtn  = document.getElementById('newGameBtn');
    const continueBtn = document.getElementById('continueBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    // --- Verificação de elementos ---
    if (!newGameBtn)  console.error('[MENU] newGameBtn não encontrado no DOM');
    if (!continueBtn) console.error('[MENU] continueBtn não encontrado no DOM');
    if (!settingsBtn) console.error('[MENU] settingsBtn não encontrado no DOM');

    // --- NOVO JOGO ---
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            console.log('[MENU] Botão NOVO JOGO clicado');
            vibrate(40);
            startIntroScreen();
        });
    }

    // --- CONTINUAR (desabilitado sem save) ---
    if (continueBtn) {
        continueBtn.setAttribute('disabled', 'true');
        continueBtn.addEventListener('click', () => {
            // Bloqueado — sem save disponível
            console.log('[MENU] CONTINUAR bloqueado: sem save game');
        });
    }

    // --- CONFIGURAÇÕES ---
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            console.log('[MENU] Botão CONFIGURAÇÕES clicado');
            vibrate(30);
            showScreen('settingsPanel');
        });
    }

    console.log('[MENU] Módulo de menu iniciado');
}

// ============================================================
//  MÓDULO 3 — PAINEL DE CONFIGURAÇÕES
// ============================================================

function initSettings() {
    const closeBtn = document.getElementById('closeSettings');

    // --- Fechar painel ---
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            console.log('[SETTINGS] Painel fechado');
            vibrate(30);
            showScreen('mainMenu');
        });
    }

    // --- Sistema de abas ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            console.log('[SETTINGS] Aba selecionada:', tabId);

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            const target = document.getElementById('tab-' + tabId);
            if (target) target.classList.add('active');
        });
    });

    // --- Sliders de áudio ---
    bindSlider('masterVolume', 'masterVolValue', v => v + '%');
    bindSlider('sfxVolume',    'sfxVolValue',    v => v + '%');
    bindSlider('musicVolume',  'musicVolValue',  v => v + '%');
    bindSlider('uiScale',      'uiScaleValue',   v => v + '%');

    // --- Slider de dificuldade ---
    bindSlider('difficulty', 'difficultyValue', v => {
        const labels = ['Fácil', 'Normal', 'Difícil'];
        return labels[parseInt(v)] || 'Normal';
    });

    // --- Toggle CRT ---
    const crtToggle = document.getElementById('crtEffect');
    if (crtToggle) {
        crtToggle.addEventListener('change', () => {
            const layer = document.getElementById('crtLayer');
            if (layer) layer.style.display = crtToggle.checked ? 'block' : 'none';
            console.log('[SETTINGS] CRT:', crtToggle.checked ? 'ON' : 'OFF');
        });
    }

    // --- Toggle Scanlines ---
    const scanToggle = document.getElementById('scanlinesEffect');
    if (scanToggle) {
        scanToggle.addEventListener('change', () => {
            const layer = document.getElementById('scanlinesLayer');
            if (layer) layer.style.display = scanToggle.checked ? 'block' : 'none';
            console.log('[SETTINGS] Scanlines:', scanToggle.checked ? 'ON' : 'OFF');
        });
    }

    // --- Toggle Vibração ---
    const vibToggle = document.getElementById('vibration');
    if (vibToggle) {
        vibToggle.addEventListener('change', () => {
            console.log('[SETTINGS] Vibração:', vibToggle.checked ? 'ON' : 'OFF');
        });
    }

    console.log('[SETTINGS] Módulo de configurações iniciado');
}

function bindSlider(sliderId, displayId, formatter) {
    const slider  = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (!slider || !display) return;

    slider.addEventListener('input', () => {
        display.textContent = formatter(slider.value);
    });
}

// ============================================================
//  MÓDULO 4 — INTRO SCREEN (E-MAIL DA AETHER CORP)
// ============================================================

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

function setEmailDate() {
    const el = document.getElementById('emailDate');
    if (!el) return;

    const now  = new Date();
    const dd   = String(now.getDate()).padStart(2, '0');
    const mm   = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh   = String(now.getHours()).padStart(2, '0');
    const min  = String(now.getMinutes()).padStart(2, '0');

    el.textContent = `${dd}/${mm}/${yyyy}  ${hh}:${min}`;
}

function startTypewriter(text, targetId, cursorId, onComplete) {
    const target = document.getElementById(targetId);
    const cursor = document.getElementById(cursorId);
    if (!target) {
        console.error('[TYPEWRITER] Elemento não encontrado:', targetId);
        return;
    }

    let index = 0;
    target.textContent = '';

    function getDelay(char) {
        if (['.', '!', '?'].includes(char)) return 130;
        if ([',', ';', ':'].includes(char)) return 65;
        if (char === '\n')                  return 45;
        return 22;
    }

    function type() {
        if (index < text.length) {
            target.textContent += text[index];
            index++;

            const body = document.getElementById('emailBody');
            if (body) body.scrollTop = body.scrollHeight;

            setTimeout(type, getDelay(text[index - 1]));
        } else {
            if (cursor) cursor.style.display = 'none';
            console.log('[TYPEWRITER] Texto completo');
            if (onComplete) onComplete();
        }
    }

    type();
}

function showConfirmButton() {
    const btn = document.getElementById('confirmBtn');
    if (!btn) return;

    btn.style.display  = 'block';
    btn.style.opacity  = '0';
    btn.style.transition = 'opacity 0.8s ease';

    setTimeout(() => { btn.style.opacity = '1'; }, 80);

    btn.addEventListener('click', () => {
        console.log('[INTRO] Recebimento confirmado — iniciando cena 3D');
        vibrate(60);
        initThreeScene();
    }, { once: true });
}

function startIntroScreen() {
    console.log('[INTRO] Iniciando tela de e-mail');

    // Reseta o estado da intro para permitir replay
    const typewriterText = document.getElementById('typewriterText');
    const typewriterCursor = document.getElementById('typewriterCursor');
    const confirmBtn = document.getElementById('confirmBtn');

    if (typewriterText)   typewriterText.textContent = '';
    if (typewriterCursor) typewriterCursor.style.display = 'inline';
    if (confirmBtn)       confirmBtn.style.display = 'none';

    showScreen('introScreen');
    setEmailDate();

    setTimeout(() => {
        startTypewriter(
            EMAIL_TEXT,
            'typewriterText',
            'typewriterCursor',
            showConfirmButton
        );
    }, 500);
}

// ============================================================
//  MÓDULO 5 — CENA THREE.JS (ESTACIONAMENTO)
// ============================================================

function initThreeScene() {
    console.log('[3D] Iniciando cena Three.js');
    showScreen('sceneContainer');

    if (typeof THREE !== 'undefined') {
        console.log('[3D] Three.js já carregado');
        buildScene();
        return;
    }

    const script   = document.createElement('script');
    script.src     = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload  = () => {
        console.log('[3D] Three.js carregado com sucesso');
        buildScene();
    };
    script.onerror = () => {
        console.error('[3D] Falha ao carregar Three.js');
    };
    document.head.appendChild(script);
}

function buildScene() {
    const canvas = document.getElementById('threeCanvas');
    if (!canvas) {
        console.error('[3D] Canvas não encontrado');
        return;
    }

    const W = window.innerWidth;
    const H = window.innerHeight;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x050a05);

    // --- Cena ---
    const scene = new THREE.Scene();
    scene.fog   = new THREE.FogExp2(0x050a05, 0.07);

    // --- Câmera ---
    const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 80);
    camera.position.set(0, 1.7, 0);

    // --- Asfalto molhado ---
    const floorGeo = new THREE.PlaneGeometry(80, 80, 30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
        color:     0x080808,
        roughness: 0.1,
        metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x    = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- Reflexo verde no asfalto ---
    const reflectGeo = new THREE.PlaneGeometry(80, 80);
    const reflectMat = new THREE.MeshBasicMaterial({
        color:       0x001a00,
        transparent: true,
        opacity:     0.35
    });
    const reflect = new THREE.Mesh(reflectGeo, reflectMat);
    reflect.rotation.x = -Math.PI / 2;
    reflect.position.y = 0.01;
    scene.add(reflect);

    // --- Postes de luz verde ---
    function createLampPost(x, z) {
        const group = new THREE.Group();

        const postMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 4, 6),
            new THREE.MeshStandardMaterial({ color: 0x111111 })
        );
        postMesh.position.y = 2;
        group.add(postMesh);

        const domeMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 8, 8),
            new THREE.MeshStandardMaterial({
                color:             0x00ff88,
                emissive:          0x00ff44,
                emissiveIntensity: 2
            })
        );
        domeMesh.position.y = 4.2;
        group.add(domeMesh);

        const light = new THREE.PointLight(0x00ff44, 1.2, 12);
        light.position.y  = 4.1;
        light.castShadow  = true;
        group.add(light);

        group.position.set(x, 0, z);
        scene.add(group);
    }

    createLampPost(-6,  -8);
    createLampPost( 6,  -8);
    createLampPost(-6, -18);
    createLampPost( 6, -18);
    createLampPost(-6, -28);
    createLampPost( 6, -28);

    // --- Iluminação ambiente ---
    scene.add(new THREE.AmbientLight(0x001a00, 0.4));

    const dirLight = new THREE.DirectionalLight(0x003311, 0.3);
    dirLight.position.set(0, 10, -5);
    scene.add(dirLight);

    // --- Muros ---
    function createWall(x, z, w, h, d) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 })
        );
        mesh.position.set(x, h / 2, z);
        mesh.receiveShadow = true;
        mesh.castShadow    = true;
        scene.add(mesh);
    }

    createWall(  0, -38, 40, 3, 0.5);
    createWall(-20, -20, 0.5, 3, 20);
    createWall( 20, -20, 0.5, 3, 20);

    // --- Partículas de chuva fina ---
    const PARTICLE_COUNT = 300;
    const positions      = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = Math.random() * 6;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    );

    const particles = new THREE.Points(
        particleGeo,
        new THREE.PointsMaterial({
            color:       0x00ff44,
            size:        0.04,
            transparent: true,
            opacity:     0.25
        })
    );
    scene.add(particles);

    // --- Controles Touch ---
    const input = {
        moving:      false,
        looking:     false,
        lookDeltaX:  0,
        lastTouchX:  0
    };

    const touchLeft  = document.getElementById('touchLeft');
    const touchRight = document.getElementById('touchRight');

    if (touchLeft) {
        touchLeft.addEventListener('touchstart', e => {
            e.preventDefault();
            input.moving = true;
            console.log('[3D] Touch: andando');
        }, { passive: false });

        touchLeft.addEventListener('touchend', () => {
            input.moving = false;
        });
    }

    if (touchRight) {
        touchRight.addEventListener('touchstart', e => {
            e.preventDefault();
            input.looking    = true;
            input.lastTouchX = e.touches[0].clientX;
            console.log('[3D] Touch: olhando');
        }, { passive: false });

        touchRight.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!input.looking) return;
            input.lookDeltaX = e.touches[0].clientX - input.lastTouchX;
            input.lastTouchX = e.touches[0].clientX;
        }, { passive: false });

        touchRight.addEventListener('touchend', () => {
            input.looking    = false;
            input.lookDeltaX = 0;
        });
    }

    // --- Estado da câmera ---
    let yaw = 0;

    // --- Loop de animação ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        if (input.moving) {
            const speed = 3.5 * delta;
            camera.position.x -= Math.sin(yaw) * speed;
            camera.position.z -= Math.cos(yaw) * speed;
            camera.position.z  = Math.max(camera.position.z, -34);
        }

        if (input.looking && Math.abs(input.lookDeltaX) > 0.5) {
            yaw              -= input.lookDeltaX * 0.003;
            camera.rotation.y = yaw;
            input.lookDeltaX  = 0;
        }

        // Chuva caindo
        const pos = particleGeo.attributes.position.array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            pos[i * 3 + 1] -= 0.03;
            if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 6;
        }
        particleGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();
    console.log('[3D] Loop de animação iniciado');

    // --- Resize responsivo ---
    window.addEventListener('resize', () => {
        const nW = window.innerWidth;
        const nH = window.innerHeight;
        camera.aspect = nW / nH;
        camera.updateProjectionMatrix();
        renderer.setSize(nW, nH);
    });
}

// ============================================================
//  MÓDULO 6 — HUD DO JOGO (Deep Seek — intocado)
//  As funções abaixo são do módulo de câmeras original.
//  Preservadas sem alteração.
// ============================================================

const HEAT_INCREASE_RATE  = 0.5;
const HEAT_DECREASE_RATE  = 1.5;
const MAX_HEAT            = 100;
const OVERHEAT_COOLDOWN_TIME = 3000;

let gameState = {
    currentCamera: null,
    monitorOpen:   false,
    heat:          0,
    isOverheated:  false,
    gameStartTime: Date.now(),
    lastUpdateTime: Date.now()
};

const cameras = {
    1: { name: 'ENTRADA',         description: 'Porta principal do Data Center. Acesso bloqueado.',      hasEntity: false },
    2: { name: 'CORREDOR A',      description: 'Corredor leste. Iluminação intermitente.',               hasEntity: false },
    3: { name: 'SALA SERVIDORES', description: 'Núcleo principal. Racks ativos detectados.',             hasEntity: false },
    4: { name: 'CORREDOR B',      description: 'Corredor oeste. Temperatura elevada.',                   hasEntity: false },
    5: { name: 'DEPÓSITO',        description: 'Área de armazenamento. Movimento detectado.',            hasEntity: true  }
};

function getGameEl(id) {
    return document.getElementById(id);
}

function switchCamera(camNumber) {
    if (gameState.isOverheated) return;

    gameState.currentCamera = camNumber;
    gameState.monitorOpen   = true;

    const camera = cameras[camNumber];
    getGameEl('cameraLabel').textContent = `CAM ${String(camNumber).padStart(2, '0')} - ${camera.name}`;
    updateCameraTime();

    getGameEl('cameraView').innerHTML = `
        <div style="text-align:center; padding:20px;">
            <p style="font-size:15px; margin-bottom:15px; text-shadow:0 0 10px #00ff00;">
                ${camera.description}
            </p>
            <div style="border:1px solid #00ff00; padding:15px; margin-top:20px;
                        background:rgba(0,255,0,0.05);">
                <p style="font-size:12px; margin-bottom:8px;">STATUS: ATIVO</p>
                <p style="font-size:12px; margin-bottom:8px;">RESOLUÇÃO: 640x480</p>
                <p style="font-size:12px;">MODO: INFRARED</p>
            </div>
            ${camera.hasEntity ? `
                <div style="margin-top:20px; padding:10px; border:2px solid #ff0000;
                            background:rgba(255,0,0,0.1);">
                    <p style="color:#ff0000; font-size:14px; text-shadow:0 0 8px #ff0000;
                               animation:blink 1s infinite;">
                        ⚠ MOVIMENTO DETECTADO ⚠
                    </p>
                </div>` : ''}
        </div>`;

    vibrate(50);
}

function closeMonitorView() {
    gameState.monitorOpen   = false;
    gameState.currentCamera = null;

    getGameEl('cameraLabel').textContent = 'SYSTEM OFFLINE';
    getGameEl('cameraTime').textContent  = '--:--';

    getGameEl('cameraView').innerHTML = `
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
        </div>`;

    vibrate(30);
}

function updateHeat(deltaTime) {
    if (gameState.isOverheated) return;

    const ds = deltaTime / 1000;

    if (gameState.monitorOpen) {
        gameState.heat = Math.min(MAX_HEAT, gameState.heat + HEAT_INCREASE_RATE * ds);
    } else {
        gameState.heat = Math.max(0, gameState.heat - HEAT_DECREASE_RATE * ds);
    }

    const pct = Math.round(gameState.heat);
    getGameEl('heatBar').style.width    = pct + '%';
    getGameEl('heatValue').textContent  = pct + '%';

    if (gameState.heat >= MAX_HEAT) triggerOverheat();
}

function triggerOverheat() {
    gameState.isOverheated = true;
    gameState.monitorOpen  = false;

    getGameEl('overheatWarning').classList.add('active');
    vibrate([100, 50, 100, 50, 100]);

    let progress = 0;
    const iv = setInterval(() => {
        progress += 100;
        getGameEl('cooldownBar').style.width =
            ((progress / OVERHEAT_COOLDOWN_TIME) * 100) + '%';

        if (progress >= OVERHEAT_COOLDOWN_TIME) {
            clearInterval(iv);
            endOverheat();
        }
    }, 100);
}

function endOverheat() {
    gameState.isOverheated = false;
    gameState.heat         = 0;

    getGameEl('overheatWarning').classList.remove('active');
    getGameEl('cooldownBar').style.width = '0%';

    closeMonitorView();
}

function updateGameTime() {
    const elapsed = Date.now() - gameState.gameStartTime;
    const m = Math.floor(elapsed / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    getGameEl('gameTime').textContent =
        String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function updateCameraTime() {
    const now = new Date();
    const hh  = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    getGameEl('cameraTime').textContent = `${hh}:${min}`;
}

function startGameLoop() {
    function loop() {
        const now   = Date.now();
        const delta = now - gameState.lastUpdateTime;

        updateHeat(delta);
        if (gameState.monitorOpen) updateCameraTime();

        gameState.lastUpdateTime = now;
        requestAnimationFrame(loop);
    }
    loop();
}

function initGameHUD() {
    document.querySelectorAll('.cam-button').forEach(btn => {
        btn.addEventListener('click', () => {
            switchCamera(parseInt(btn.dataset.cam));
        });
    });

    const closeMonitorBtn = document.getElementById('closeMonitor');
    if (closeMonitorBtn) {
        closeMonitorBtn.addEventListener('click', closeMonitorView);
    }

    setInterval(updateGameTime, 1000);
    startGameLoop();

    console.log('[GAME] HUD iniciado');
}

// ============================================================
//  MÓDULO 7 — UTILITÁRIOS
// ============================================================

function vibrate(pattern) {
    const toggle = document.getElementById('vibration');
    if (!toggle || !toggle.checked) return;
    if (navigator.vibrate) navigator.vibrate(pattern);
}

// ============================================================
//  BOOT — Inicialização geral
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[BOOT] The Server Room v1.1.0 iniciando...');

    initMenu();
    initSettings();
    initGameHUD();

    // Tela inicial
    showScreen('mainMenu');

    console.log('[BOOT] Sistema pronto');
});