require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');

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
 * 3. Homepage (Acesso via Navegador) - Tema Dark Premium Glass + Visualizador de Grafo
 */
app.get('/', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Painel do Git</title>
            <style>
                :root {
                    --glass-bg: rgba(255, 255, 255, 0.03);
                    --glass-border: rgba(255, 255, 255, 0.08);
                    --text-main: #f8fafc;
                    --text-muted: #94a3b8;
                    --accent-blue: #3b82f6;
                    --accent-green: #10b981;
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
                    align-items: center;
                }

                @keyframes gradientBG {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .container { 
                    background: var(--glass-bg); 
                    backdrop-filter: blur(16px); 
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid var(--glass-border); 
                    border-radius: 16px; 
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); 
                    padding: 40px; 
                    width: 100%;
                    max-width: 1000px; 
                }

                h1 { font-weight: 300; margin-top: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }

                .controls-grid {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 20px;
                    margin-bottom: 25px;
                    background: rgba(0,0,0,0.2);
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                }

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
                
                input:focus { border-color: rgba(255, 255, 255, 0.2); }

                .checkbox-wrapper { display: flex; align-items: center; gap: 5px; cursor: pointer; }

                .btn { 
                    background: rgba(255, 255, 255, 0.05); 
                    border: 1px solid var(--glass-border); 
                    border-radius: 8px; 
                    padding: 10px 24px; 
                    cursor: pointer; 
                    font-size: 0.9rem; 
                    font-weight: 500; 
                    color: var(--text-main); 
                    transition: all 0.3s ease;
                }

                .btn:hover { transform: translateY(-2px); }
                .btn-blue { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.4); }
                .btn-blue:hover { border-color: var(--accent-blue); text-shadow: 0 0 8px rgba(59, 130, 246, 0.6); }
                .btn-green { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.4); }
                .btn-green:hover { border-color: var(--accent-green); text-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }

                #status-msg { margin-top: 10px; font-size: 0.85rem; color: var(--text-muted); }

                /* Painel do Grafo */
                .graph-panel {
                    display: flex;
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 20px 0;
                    margin-top: 20px;
                    overflow-x: auto;
                    box-shadow: inset 0 2px 15px rgba(0,0,0,0.5);
                    min-height: 300px;
                }

                .canvas-container { flex-shrink: 0; padding-left: 10px; }
                .commit-list { flex-grow: 1; display: flex; flex-direction: column; min-width: 600px; padding-right: 20px; }
                
                .commit-row { 
                    display: flex; 
                    align-items: center; 
                    border-bottom: 1px solid rgba(255,255,255,0.03); 
                    box-sizing: border-box;
                }
                .commit-row:hover { background: rgba(255,255,255,0.02); }

                .commit-hash { font-family: monospace; font-size: 0.85rem; width: 80px; flex-shrink: 0; }
                .commit-msg { flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 15px; font-size: 0.9rem; }
                .commit-author { width: 120px; flex-shrink: 0; font-size: 0.8rem; color: var(--text-muted); text-align: right; }
                
                .branch-tag { 
                    background: rgba(255,255,255,0.1); 
                    border: 1px solid var(--glass-border); 
                    padding: 2px 6px; 
                    border-radius: 4px; 
                    font-size: 0.7rem; 
                    margin-right: 8px; 
                    color: var(--accent-green);
                    font-weight: bold;
                }

                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Git Tree Dashboard</h1>
                
                <div class="controls-grid">
                    <div class="input-group">
                        <label>Limite:</label>
                        <input type="number" id="param-limit" value="20" style="width: 70px;">
                        
                        <label>Skip:</label>
                        <input type="number" id="param-skip" value="0" style="width: 70px;">
                        
                        <label class="checkbox-wrapper">
                            <input type="checkbox" id="param-all" checked> Todas as Branches (--all)
                        </label>

                        <button class="btn btn-blue" onclick="buscarEDesenharGrafo()">🌳 Renderizar Grafo</button>
                    </div>
                    <div>
                        <button class="btn btn-green" onclick="fazerCommit()">🚀 git add . && commit</button>
                    </div>
                </div>

                <div id="status-msg">Pronto.</div>

                <div class="graph-panel" id="graph-panel" style="display: none;">
                    <div class="canvas-container">
                        <canvas id="git-canvas"></canvas>
                    </div>
                    <div class="commit-list" id="commit-list"></div>
                </div>
            </div>

            <script>
                const statusEl = document.getElementById('status-msg');
                const panelEl = document.getElementById('graph-panel');

                // Configurações visuais do grafo
                const ROW_HEIGHT = 40;
                const DOT_RADIUS = 5;
                const TRACK_WIDTH = 20;
                const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9'];

                async function buscarEDesenharGrafo() {
                    statusEl.textContent = 'Buscando árvore de commits...';
                    
                    const limit = document.getElementById('param-limit').value;
                    const skip = document.getElementById('param-skip').value;
                    const all = document.getElementById('param-all').checked;
                    
                    const params = new URLSearchParams({ limit, skip, all });

                    try {
                        const response = await fetch('/commits?' + params.toString());
                        const data = await response.json();
                        
                        if (data.commits && data.commits.length > 0) {
                            panelEl.style.display = 'flex';
                            desenharGrafo(data.commits);
                            statusEl.textContent = \`Grafo renderizado com \${data.commits.length} commits.\`;
                        } else {
                            statusEl.textContent = 'Nenhum commit encontrado no repositório.';
                        }
                    } catch (error) {
                        statusEl.textContent = 'Erro ao buscar commits: ' + error.message;
                    }
                }

                function desenharGrafo(commits) {
                    const canvas = document.getElementById('git-canvas');
                    const ctx = canvas.getContext('2d');
                    const listEl = document.getElementById('commit-list');
                    listEl.innerHTML = '';

                    // Lógica para definir a trilha (track X) de cada commit
                    let tracks = []; 
                    let nodes = [];
                    let maxTrackIndex = 0;

                    commits.forEach((commit, i) => {
                        let trackIndex = tracks.indexOf(commit.hash);
                        
                        // Se não encontrou uma trilha aguardando esse commit, cria uma nova
                        if (trackIndex === -1) {
                            trackIndex = tracks.findIndex(t => t === null); // reaproveita trilha morta
                            if (trackIndex === -1) {
                                trackIndex = tracks.length;
                            }
                        }

                        if (trackIndex > maxTrackIndex) maxTrackIndex = trackIndex;

                        nodes.push({
                            commit,
                            x: 20 + trackIndex * TRACK_WIDTH,
                            y: i * ROW_HEIGHT + ROW_HEIGHT / 2,
                            color: COLORS[trackIndex % COLORS.length],
                            trackIndex
                        });

                        // Atualiza as trilhas aguardando os próximos nós (pais)
                        if (commit.parents.length > 0) {
                            tracks[trackIndex] = commit.parents[0];
                            // Se for merge, cria trilhas pros outros pais
                            for (let p = 1; p < commit.parents.length; p++) {
                                tracks.push(commit.parents[p]);
                            }
                        } else {
                            tracks[trackIndex] = null; // Fim da trilha (initial commit)
                        }
                    });

                    // Ajusta o tamanho do canvas com base nas trilhas e nós
                    canvas.width = 40 + maxTrackIndex * TRACK_WIDTH;
                    canvas.height = commits.length * ROW_HEIGHT;
                    
                    // Limpeza
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.lineWidth = 2;

                    // 1. Desenhar as Linhas (Edges)
                    nodes.forEach(node => {
                        node.commit.parents.forEach((parentHash, pIndex) => {
                            const parentNode = nodes.find(n => n.commit.hash === parentHash);
                            
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);

                            if (parentNode) {
                                // Curva Bezier para transição suave entre trilhas
                                ctx.bezierCurveTo(
                                    node.x, node.y + ROW_HEIGHT / 2,
                                    parentNode.x, parentNode.y - ROW_HEIGHT / 2,
                                    parentNode.x, parentNode.y
                                );
                                ctx.strokeStyle = (pIndex === 0) ? node.color : parentNode.color;
                            } else {
                                // Pai não está na página atual (paginação), linha reta para baixo e some
                                ctx.lineTo(node.x, node.y + ROW_HEIGHT);
                                ctx.strokeStyle = node.color;
                                ctx.globalAlpha = 0.3;
                            }
                            
                            ctx.stroke();
                            ctx.globalAlpha = 1.0;
                        });
                    });

                    // 2. Desenhar os Pontos (Nodes) e injetar HTML
                    nodes.forEach(node => {
                        // Círculo
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, DOT_RADIUS, 0, 2 * Math.PI);
                        ctx.fillStyle = '#0f172a'; // Cor de fundo para furar a linha
                        ctx.fill();
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = node.color;
                        ctx.stroke();

                        // Lista HTML
                        const row = document.createElement('div');
                        row.className = 'commit-row';
                        row.style.height = \`\${ROW_HEIGHT}px\`;

                        const tagsHtml = node.commit.branches
                            .map(b => \`<span class="branch-tag">\${b}</span>\`)
                            .join('');

                        row.innerHTML = \`
                            <div class="commit-hash" style="color: \${node.color}">\${node.commit.short_hash}</div>
                            <div class="commit-msg">\${tagsHtml} \${node.commit.message}</div>
                            <div class="commit-author">\${node.commit.author.name}</div>
                        \`;
                        listEl.appendChild(row);
                    });
                }

                async function fazerCommit() {
                    statusEl.textContent = 'Executando pipeline de commit...';
                    try {
                        const response = await fetch('/commit', { method: 'POST' });
                        const data = await response.json();
                        statusEl.textContent = 'Commit finalizado. Saída: ' + (data.saida || 'Sucesso.');
                        buscarEDesenharGrafo(); // Recarrega o grafo
                    } catch (error) {
                        statusEl.textContent = 'Erro ao fazer commit: ' + error.message;
                    }
                }

                // Carrega o grafo automaticamente ao abrir
                window.onload = buscarEDesenharGrafo;
            </script>
        </body>
        </html>
    `;

    res.send(html);
});
// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`👉 GET /commits - Para ver os últimos commits`);
    console.log(`👉 POST /commit - Para enviar as alterações`);
});