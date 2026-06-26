require('dotenv').config();
const express = require('express');
const { exec, spawn } = require('child_process'); // Importe o spawn aqui
const app = express();
const PORT = process.env.PORT || 4666;

// Permite que o Express entenda requisições em JSON
app.use(express.json());

/**
 * 2. Endpoint para executar o comando de commit
 * Usa o método POST pois estamos realizando uma ação que altera o estado do sistema
 */
app.post('/commit', (req, res) => {
    // Comando solicitado. 
    // Nota: O uso do pipe (|) envia a saída do 'git add .' para o 'node commiter'. 
    const comando = 'git add . | node commiter';

    exec(comando, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro ao executar o commit: ${error.message}`);
            return res.status(500).json({ erro: 'Falha ao executar o comando', detalhes: stderr });
        }

        res.json({
            mensagem: 'Alterações catalogadas e enviadas com sucesso!',
            saida: stdout
        });
    });
});
/**
 * 1. Endpoint para obter os últimos commits estruturados (Preparado para Grafo)
 * Aceita query params: ?limit=10 & skip=0 & author=nome & all=true
 */
app.get('/commits', (req, res) => {
    // Adicionamos o parâmetro "all" para trazer commits de todas as branches
    const { limit = 10, skip = 0, author, all } = req.query;

    const parsedLimit = parseInt(limit, 10);
    const parsedSkip = parseInt(skip, 10);

    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
        return res.status(400).json({ erro: 'Os parâmetros limit e skip devem ser números válidos.' });
    }

    const delimiter = '<|||>';

    // NOVOS FORMATOS:
    // %P = hash completo dos pais (separados por espaço)
    // %p = hash curto dos pais
    // %D = referências (branches, tags, HEAD)
    const format = `%H${delimiter}%h${delimiter}%P${delimiter}%p${delimiter}%D${delimiter}%an${delimiter}%ae${delimiter}%aI${delimiter}%s`;

    // --topo-order garante que os nós filhos sempre apareçam antes dos pais (crucial para desenhar o grafo)
    let cmd = `git log -n ${parsedLimit} --skip=${parsedSkip} --pretty=format:"${format}" --topo-order`;

    // Se "all=true", o git trará a árvore de todas as branches, não apenas da branch atual
    if (all === 'true') {
        cmd += ' --all';
    }

    if (author) {
        const safeAuthor = author.replace(/"/g, '');
        cmd += ` --author="${safeAuthor}"`;
    }

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            if (stderr.includes('does not have any commits')) {
                return res.json({ parametros: req.query, total_retornado: 0, commits: [] });
            }
            console.error(`Erro ao buscar commits: ${error.message}`);
            return res.status(500).json({ erro: 'Falha ao obter commits', detalhes: stderr });
        }

        const commits = stdout.split('\n')
            .filter(linha => linha.trim() !== '')
            .map(linha => {
                const [
                    hash, short_hash,
                    parent_hashes, short_parent_hashes,
                    refs,
                    author_name, author_email,
                    date, message
                ] = linha.split(delimiter);

                // O git retorna os hashes dos pais separados por espaço. 
                // Ex: "hash_pai_1 hash_pai_2" (indicando um merge)
                const parents = parent_hashes ? parent_hashes.split(' ') : [];
                const short_parents = short_parent_hashes ? short_parent_hashes.split(' ') : [];

                // Refs trazem os nomes das branches e tags. Ex: "HEAD -> main, origin/main"
                const branches = refs ? refs.split(',').map(r => r.trim()).filter(Boolean) : [];

                return {
                    hash,
                    short_hash,
                    parents,         // Array com os hashes dos commits anteriores
                    short_parents,   // Array com os hashes curtos dos commits anteriores
                    branches,        // Array com as labels da branch atual (ex: ['HEAD -> main'])
                    author: {
                        name: author_name,
                        email: author_email
                    },
                    date,
                    message
                };
            });

        res.json({
            parametros: {
                limit: parsedLimit,
                skip: parsedSkip,
                author: author || null,
                all: all === 'true'
            },
            total_retornado: commits.length,
            commits
        });
    });
});
/**
 * 3. Homepage (Acesso via Navegador) - Tema Dark Premium Glass + App Control
 */
app.get('/', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dashboard Hub</title>
            <style>
                :root {
                    --glass-bg: rgba(255, 255, 255, 0.03);
                    --glass-border: rgba(255, 255, 255, 0.08);
                    --text-main: #f8fafc;
                    --text-muted: #94a3b8;
                    --accent-blue: #3b82f6;
                    --accent-green: #10b981;
                    --accent-red: #ef4444;
                    --accent-orange: #f59e0b;
                }

                * { box-sizing: border-box; }

                body { 
                    font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif; 
                    background: linear-gradient(135deg, #0f172a, #1e1b4b, #09090b);
                    background-size: 300% 300%;
                    animation: gradientBG 15s ease infinite;
                    color: var(--text-main); 
                    margin: 0; 
                    padding: 40px 20px; 
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }

                @keyframes gradientBG {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .container { 
                    background: var(--glass-bg); 
                    backdrop-filter: blur(16px); 
                    border: 1px solid var(--glass-border); 
                    border-radius: 16px; 
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); 
                    padding: 40px; 
                    width: 100%;
                    max-width: 1000px; 
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                h1 { font-weight: 300; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
                h2 { font-size: 1.2rem; font-weight: 400; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px; margin: 0 0 15px 0; color: #e2e8f0; }

                .panel {
                    background: rgba(0,0,0,0.2);
                    padding: 25px;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                }

                .controls-grid { display: grid; grid-template-columns: 1fr auto; gap: 20px; }
                .input-group { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
                label { color: var(--text-muted); font-size: 0.9rem; }
                
                input[type="number"], input[type="text"] { 
                    background: rgba(0, 0, 0, 0.3); 
                    border: 1px solid var(--glass-border); 
                    border-radius: 8px; 
                    color: var(--text-main);
                    padding: 8px 12px; 
                    font-size: 0.9rem;
                    outline: none;
                }
                
                .checkbox-wrapper { display: flex; align-items: center; gap: 5px; cursor: pointer; }

                .btn { 
                    background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); 
                    border-radius: 8px; padding: 10px 24px; cursor: pointer; 
                    font-size: 0.9rem; font-weight: 500; color: var(--text-main); transition: all 0.2s ease;
                }

                .btn:hover { transform: translateY(-2px); }
                .btn-blue { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.4); }
                .btn-blue:hover { border-color: var(--accent-blue); text-shadow: 0 0 8px rgba(59, 130, 246, 0.6); }
                .btn-green { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.4); }
                .btn-green:hover { border-color: var(--accent-green); text-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }
                .btn-red { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.4); }
                .btn-red:hover { border-color: var(--accent-red); text-shadow: 0 0 8px rgba(239, 68, 68, 0.6); }

                /* Status Indicator */
                .status-badge {
                    padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-flex; align-items: center; gap: 6px;
                }
                .status-offline { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1); }
                .status-starting { background: rgba(245, 158, 11, 0.1); color: var(--accent-orange); border: 1px solid var(--accent-orange); }
                .status-online { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); border: 1px solid var(--accent-green); }
                
                .dot { width: 8px; height: 8px; border-radius: 50%; }
                .status-offline .dot { background: var(--text-muted); }
                .status-starting .dot { background: var(--accent-orange); animation: pulse 1s infinite; }
                .status-online .dot { background: var(--accent-green); box-shadow: 0 0 8px var(--accent-green); }

                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

                .terminal-box {
                    background: rgba(0, 0, 0, 0.6); border: 1px solid var(--glass-border);
                    padding: 15px; border-radius: 8px; font-family: monospace; font-size: 0.85rem;
                    height: 150px; overflow-y: auto; color: #a3be8c; margin-top: 15px;
                }

                /* Grafo CSS omitido por brevidade mas igual ao anterior */
                .graph-panel { display: flex; background: rgba(0, 0, 0, 0.5); border: 1px solid var(--glass-border); border-radius: 12px; padding: 20px 0; margin-top: 15px; overflow-x: auto; min-height: 250px; }
                .canvas-container { flex-shrink: 0; padding-left: 10px; }
                .commit-list { flex-grow: 1; display: flex; flex-direction: column; min-width: 600px; padding-right: 20px; }
                .commit-row { display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); box-sizing: border-box; }
                .commit-hash { font-family: monospace; font-size: 0.85rem; width: 80px; flex-shrink: 0; }
                .commit-msg { flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 15px; font-size: 0.9rem; }
                .commit-author { width: 120px; flex-shrink: 0; font-size: 0.8rem; color: var(--text-muted); text-align: right; }
                .branch-tag { background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-right: 8px; color: var(--accent-green); font-weight: bold; }

                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>⚙️ Dashboard Hub | Backdoor</h1>
                
                <!-- PAINEL NG SERVE -->
                <div class="panel">
                    <h2>🚀 App Server (ng serve)</h2>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div class="input-group">
                            <label>Porta:</label>
                            <input type="number" id="app-port" value="4200" style="width: 80px;">
                            <button class="btn btn-green" onclick="startApp()">▶ Iniciar</button>
                            <button class="btn btn-red" onclick="stopApp()">⏹ Parar</button>
                        </div>
                        <div id="app-badge" class="status-badge status-offline">
                            <div class="dot"></div> <span id="app-status-text">OFFLINE</span>
                        </div>
                    </div>
                    <div class="terminal-box" id="app-terminal">Aguardando comandos...</div>
                </div>

                <!-- PAINEL GIT -->
                <div class="panel">
                    <h2>🌳 Git Tree</h2>
                    <div class="controls-grid">
                        <div class="input-group">
                            <input type="number" id="param-limit" value="10" style="width: 60px;" title="Limite">
                            <label class="checkbox-wrapper">
                                <input type="checkbox" id="param-all" checked> --all
                            </label>
                            <button class="btn btn-blue" onclick="buscarEDesenharGrafo()">Renderizar Grafo</button>
                        </div>
                        <button class="btn btn-green" onclick="fazerCommit()">git add . && commit</button>
                    </div>
                    <div class="graph-panel" id="graph-panel" style="display: none;">
                        <div class="canvas-container"><canvas id="git-canvas"></canvas></div>
                        <div class="commit-list" id="commit-list"></div>
                    </div>
                </div>
            </div>

            <script>
                // --- LÓGICA DO NG SERVE ---
                const termEl = document.getElementById('app-terminal');
                const badgeEl = document.getElementById('app-badge');
                const statusTextEl = document.getElementById('app-status-text');

                async function startApp() {
                    const port = document.getElementById('app-port').value;
                    await fetch('/app/start', { 
                        method: 'POST', 
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ port })
                    });
                    checkStatus();
                }

                async function stopApp() {
                    await fetch('/app/stop', { method: 'POST' });
                    checkStatus();
                }

                async function checkStatus() {
                    try {
                        const res = await fetch('/app/status');
                        const data = await res.json();
                        
                        // Atualiza a UI do badge
                        badgeEl.className = 'status-badge status-' + data.status;
                        statusTextEl.textContent = data.status === 'offline' ? 'OFFLINE' : data.status + (data.porta ? ' :' + data.porta : '');

                        // Atualiza logs se houver
                        if (data.logs && data.logs.length > 0) {
                            termEl.innerHTML = data.logs.join('<br>');
                            termEl.scrollTop = termEl.scrollHeight; // Auto-scroll pro final
                        }
                    } catch (e) {
                        console.error('Erro ao buscar status', e);
                    }
                }

                // Faz polling do status a cada 2 segundos
                setInterval(checkStatus, 2000);
                checkStatus();


                // --- LÓGICA DO GRAFO GIT (Mantida igual a anterior) ---
                const ROW_HEIGHT = 40, DOT_RADIUS = 5, TRACK_WIDTH = 20;
                const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

                async function buscarEDesenharGrafo() {
                    const limit = document.getElementById('param-limit').value;
                    const all = document.getElementById('param-all').checked;
                    const params = new URLSearchParams({ limit, skip: 0, all });

                    const response = await fetch('/commits?' + params.toString());
                    const data = await response.json();
                    
                    if (data.commits && data.commits.length > 0) {
                        document.getElementById('graph-panel').style.display = 'flex';
                        desenharGrafo(data.commits);
                    }
                }

                function desenharGrafo(commits) {
                    const canvas = document.getElementById('git-canvas');
                    const ctx = canvas.getContext('2d');
                    const listEl = document.getElementById('commit-list');
                    listEl.innerHTML = '';

                    let tracks = [], nodes = [], maxTrackIndex = 0;

                    commits.forEach((commit, i) => {
                        let trackIndex = tracks.indexOf(commit.hash);
                        if (trackIndex === -1) {
                            trackIndex = tracks.findIndex(t => t === null);
                            if (trackIndex === -1) trackIndex = tracks.length;
                        }
                        if (trackIndex > maxTrackIndex) maxTrackIndex = trackIndex;

                        nodes.push({ commit, x: 20 + trackIndex * TRACK_WIDTH, y: i * ROW_HEIGHT + ROW_HEIGHT / 2, color: COLORS[trackIndex % COLORS.length], trackIndex });

                        if (commit.parents.length > 0) {
                            tracks[trackIndex] = commit.parents[0];
                            for (let p = 1; p < commit.parents.length; p++) tracks.push(commit.parents[p]);
                        } else tracks[trackIndex] = null;
                    });

                    canvas.width = 40 + maxTrackIndex * TRACK_WIDTH;
                    canvas.height = commits.length * ROW_HEIGHT;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.lineWidth = 2;

                    nodes.forEach(node => {
                        node.commit.parents.forEach((parentHash, pIndex) => {
                            const parentNode = nodes.find(n => n.commit.hash === parentHash);
                            ctx.beginPath(); ctx.moveTo(node.x, node.y);
                            if (parentNode) {
                                ctx.bezierCurveTo(node.x, node.y + ROW_HEIGHT / 2, parentNode.x, parentNode.y - ROW_HEIGHT / 2, parentNode.x, parentNode.y);
                                ctx.strokeStyle = (pIndex === 0) ? node.color : parentNode.color;
                            } else {
                                ctx.lineTo(node.x, node.y + ROW_HEIGHT); ctx.strokeStyle = node.color; ctx.globalAlpha = 0.3;
                            }
                            ctx.stroke(); ctx.globalAlpha = 1.0;
                        });
                    });

                    nodes.forEach(node => {
                        ctx.beginPath(); ctx.arc(node.x, node.y, DOT_RADIUS, 0, 2 * Math.PI);
                        ctx.fillStyle = '#0f172a'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = node.color; ctx.stroke();

                        const row = document.createElement('div');
                        row.className = 'commit-row'; row.style.height = \`\${ROW_HEIGHT}px\`;
                        const tagsHtml = node.commit.branches.map(b => \`<span class="branch-tag">\${b}</span>\`).join('');
                        row.innerHTML = \`<div class="commit-hash" style="color: \${node.color}">\${node.commit.short_hash}</div><div class="commit-msg">\${tagsHtml} \${node.commit.message}</div><div class="commit-author">\${node.commit.author.name}</div>\`;
                        listEl.appendChild(row);
                    });
                }

                async function fazerCommit() {
                    await fetch('/commit', { method: 'POST' });
                    buscarEDesenharGrafo();
                }

                window.onload = buscarEDesenharGrafo;
            </script>
        </body>
        </html>
    `;

    res.send(html);
});

// --- ESTADO DO NG SERVE ---
let ngProcess = null;        // Guarda a instância do processo
let ngStatus = 'offline';    // 'offline', 'starting', 'online', 'error'
let ngPort = null;           // Porta atual
let ngLogs = [];             // Guarda as últimas 50 linhas de log

/**
 * 4. Iniciar ng serve
 * POST /app/start
 * Aceita body ou query: { port: 4200 }
 */
app.post('/app/start', (req, res) => {
    try {
        const port = req.body.port || req.query.port;

        if (ngProcess) {
            return res.status(400).json({ erro: 'O ng serve já está rodando!', porta: ngPort });
        }

        ngStatus = 'starting';
        ngPort = port;
        ngLogs = ['Iniciando ng serve...'];

        // Tratamento multiplataforma para o comando do Angular
        const isWin = process.platform === "win32";
        const cmd = isWin ? 'powershell' : 'powershell';

        // ngProcess = spawn(cmd, ['npm', 'install', '-g', 'pnpm'], { cwd: './apps' });
        // Inicia o processo na pasta ./apps
        ngProcess = spawn(cmd, ['node', './node_modules/@angular/cli/bin/ng.js', 'serve', ...(!!ngPort ? ['--port', ngPort] : [])], { cwd: './apps' });

        // Captura os logs normais (stdout)
        ngProcess.stdout.on('data', (data) => {
            const log = data.toString().trim();
            if (log) {
                ngLogs.push(log);
                if (ngLogs.length > 50) ngLogs.shift(); // Mantém apenas as últimas 50 linhas

                // Verifica se terminou de compilar
                if (log.includes('Compiled successfully') || log.includes('Application bundle generation complete')) {
                    ngStatus = 'online';
                }
            }
        });

        // Captura logs de erro (stderr)
        ngProcess.stderr.on('data', (data) => {
            const log = data.toString().trim();
            if (log) {
                ngLogs.push(`[ERRO]: ${log}`);
                if (ngLogs.length > 50) ngLogs.shift();
            }
        });

        // Evento disparado quando o processo é fechado/morto
        ngProcess.on('close', (code) => {
            ngProcess = null;
            ngStatus = 'offline';
            ngPort = null;
            ngLogs.push(`Processo finalizado com código ${code}`);
        });

        res.json({ mensagem: `Comando disparado na porta ${port}`, status: ngStatus });
    } catch (error) {
        res.json({ mensagem: error });
    }
});

/**
 * 5. Parar ng serve
 * POST /app/stop
 */
app.post('/app/stop', (req, res) => {
    if (!ngProcess) {
        return res.status(400).json({ erro: 'Nenhum servidor rodando no momento.' });
    }

    // Envia o sinal para derrubar o processo
    ngProcess.kill('SIGINT');

    // Força a limpeza das variáveis imediatamente
    ngProcess = null;
    ngStatus = 'offline';
    ngPort = null;

    res.json({ mensagem: 'Servidor de desenvolvimento interrompido com sucesso.' });
});

/**
 * 6. Status do ng serve
 * GET /app/status
 */
app.get('/app/status', (req, res) => {
    res.json({
        status: ngStatus,
        porta: ngPort,
        logs: ngLogs
    });
});

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`🚀 Backdoor DevTools has online at ${PORT}`);
});