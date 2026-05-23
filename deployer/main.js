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
 * 3. Homepage (Acesso via Navegador) - Tema Dark Premium Glass
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
                    max-width: 850px; 
                }

                h1 { 
                    font-weight: 300; 
                    letter-spacing: 1px; 
                    margin-top: 0; 
                    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }

                h3 { 
                    border-bottom: 1px solid var(--glass-border); 
                    padding-bottom: 10px; 
                    color: var(--text-muted); 
                    margin-top: 35px; 
                    font-weight: 400; 
                    font-size: 1.1rem;
                }

                .input-group { 
                    display: flex; 
                    gap: 15px; 
                    margin-bottom: 20px; 
                    align-items: center; 
                    flex-wrap: wrap;
                }

                label { color: var(--text-muted); font-size: 0.9rem; }

                input { 
                    background: rgba(0, 0, 0, 0.3); 
                    border: 1px solid var(--glass-border); 
                    border-radius: 8px; 
                    color: var(--text-main);
                    padding: 10px 14px; 
                    font-size: 0.9rem;
                    outline: none;
                    transition: all 0.3s ease;
                }

                input:focus {
                    border-color: rgba(255, 255, 255, 0.2);
                    background: rgba(0, 0, 0, 0.5);
                    box-shadow: 0 0 0 2px rgba(255,255,255,0.05);
                }

                input::placeholder { color: #475569; }

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
                    letter-spacing: 0.5px;
                    backdrop-filter: blur(5px);
                }

                .btn:hover { 
                    transform: translateY(-2px); 
                    box-shadow: 0 8px 20px rgba(0,0,0,0.4); 
                }

                .btn:active { transform: translateY(0); }

                .btn-blue:hover { 
                    border-color: var(--accent-blue); 
                    text-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
                    background: rgba(59, 130, 246, 0.1);
                }

                .btn-green:hover { 
                    border-color: var(--accent-green); 
                    text-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
                    background: rgba(16, 185, 129, 0.1);
                }

                pre { 
                    background: rgba(0, 0, 0, 0.6); 
                    border: 1px solid var(--glass-border); 
                    color: var(--accent-green); 
                    padding: 20px; 
                    border-radius: 12px; 
                    overflow-x: auto; 
                    white-space: pre-wrap; 
                    margin-top: 25px; 
                    max-height: 400px; 
                    overflow-y: auto;
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                    font-size: 0.9rem;
                    box-shadow: inset 0 2px 15px rgba(0,0,0,0.5);
                    line-height: 1.5;
                }

                /* Scrollbar Customizada */
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Git Dashboard</h1>
                
                <h3>Buscar Commits (GET)</h3>
                <div class="input-group">
                    <label for="param-limit">Limite:</label>
                    <input type="number" id="param-limit" value="5" style="width: 70px;">
                    
                    <label for="param-skip">Skip:</label>
                    <input type="number" id="param-skip" value="0" style="width: 70px;">
                    
                    <label for="param-author">Autor:</label>
                    <input type="text" id="param-author" placeholder="Ex: plhx">
                    
                    <button class="btn btn-blue" onclick="buscarCommits()">📋 Buscar</button>
                </div>

                <h3>Ações (POST)</h3>
                <button class="btn btn-green" onclick="fazerCommit()">🚀 Executar Script de Commit</button>

                <pre id="resultado">// O output do terminal aparecerá aqui...</pre>
            </div>

            <script>
                const resultadoEl = document.getElementById('resultado');

                async function buscarCommits() {
                    resultadoEl.style.color = '#94a3b8';
                    resultadoEl.textContent = 'Processando...';
                    
                    const limit = document.getElementById('param-limit').value;
                    const skip = document.getElementById('param-skip').value;
                    const author = document.getElementById('param-author').value;
                    
                    const params = new URLSearchParams({ limit, skip });
                    if (author) params.append('author', author);

                    try {
                        const response = await fetch('/commits?' + params.toString());
                        const data = await response.json();
                        resultadoEl.style.color = '#10b981';
                        resultadoEl.textContent = JSON.stringify(data, null, 2);
                    } catch (error) {
                        resultadoEl.style.color = '#ef4444';
                        resultadoEl.textContent = 'Erro: ' + error.message;
                    }
                }

                async function fazerCommit() {
                    resultadoEl.style.color = '#94a3b8';
                    resultadoEl.textContent = 'Executando pipeline de commit...';
                    try {
                        const response = await fetch('/commit', { method: 'POST' });
                        const data = await response.json();
                        resultadoEl.style.color = '#3b82f6';
                        resultadoEl.textContent = JSON.stringify(data, null, 2);
                    } catch (error) {
                        resultadoEl.style.color = '#ef4444';
                        resultadoEl.textContent = 'Erro: ' + error.message;
                    }
                }
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