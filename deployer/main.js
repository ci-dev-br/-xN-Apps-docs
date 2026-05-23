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
 * 1. Endpoint para obter os últimos commits estruturados
 * Aceita query params: ?limit=10 & skip=0 & author=nome
 */
app.get('/commits', (req, res) => {
    // Pega os parâmetros da URL, com valores padrão
    const { limit = 10, skip = 0, author } = req.query;

    // Converte para inteiros para evitar injeção de comandos
    const parsedLimit = parseInt(limit, 10);
    const parsedSkip = parseInt(skip, 10);

    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
        return res.status(400).json({ erro: 'Os parâmetros limit e skip devem ser números válidos.' });
    }

    // Criamos um delimitador seguro que dificilmente alguém usaria no título do commit
    const delimiter = '<|||>';
    // %H = hash completo, %h = hash curto, %an = autor, %ae = email, %aI = data ISO, %s = subject (mensagem)
    const format = `%H${delimiter}%h${delimiter}%an${delimiter}%ae${delimiter}%aI${delimiter}%s`;

    let cmd = `git log -n ${parsedLimit} --skip=${parsedSkip} --pretty=format:"${format}"`;

    if (author) {
        // Remove aspas para evitar quebra do comando bash
        const safeAuthor = author.replace(/"/g, '');
        cmd += ` --author="${safeAuthor}"`;
    }

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            // Se o repositório estiver vazio, o git log retorna erro. 
            if (stderr.includes('does not have any commits')) {
                return res.json({ parametros: req.query, total_retornado: 0, commits: [] });
            }
            console.error(`Erro ao buscar commits: ${error.message}`);
            return res.status(500).json({ erro: 'Falha ao obter commits', detalhes: stderr });
        }

        // Separa as linhas e mapeia usando o delimitador
        const commits = stdout.split('\n')
            .filter(linha => linha.trim() !== '')
            .map(linha => {
                const [hash, short_hash, author_name, author_email, date, message] = linha.split(delimiter);
                return {
                    hash,
                    short_hash,
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
                author: author || null
            },
            total_retornado: commits.length,
            commits
        });
    });
});

/**
 * 3. Homepage (Acesso via Navegador) - Atualizada com inputs
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
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; color: #333; margin: 0; padding: 40px; }
                .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 800px; margin: auto; }
                h1 { color: #2c3e50; margin-top: 0; }
                h3 { border-bottom: 2px solid #eee; padding-bottom: 5px; color: #34495e; margin-top: 30px; }
                .input-group { display: flex; gap: 10px; margin-bottom: 15px; align-items: center; }
                input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
                .btn { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; color: white; transition: 0.2s; }
                .btn-blue { background: #0984e3; }
                .btn-blue:hover { background: #74b9ff; }
                .btn-green { background: #00b894; }
                .btn-green:hover { background: #55efc4; }
                pre { background: #2d3436; color: #55efc4; padding: 15px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; margin-top: 20px; max-height: 500px; overflow-y: auto;}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Gerenciador de Commits</h1>
                
                <h3>Buscar Commits (GET)</h3>
                <div class="input-group">
                    <label>Limite:</label>
                    <input type="number" id="param-limit" value="5" style="width: 60px;">
                    
                    <label>Pular (Skip):</label>
                    <input type="number" id="param-skip" value="0" style="width: 60px;">
                    
                    <label>Autor:</label>
                    <input type="text" id="param-author" placeholder="Ex: Paulo">
                    
                    <button class="btn btn-blue" onclick="buscarCommits()">📋 Buscar</button>
                </div>

                <h3>Executar (POST)</h3>
                <button class="btn btn-green" onclick="fazerCommit()">🚀 Executar Script de Commit</button>

                <pre id="resultado">// O resultado estruturado aparecerá aqui...</pre>
            </div>

            <script>
                const resultadoEl = document.getElementById('resultado');

                async function buscarCommits() {
                    resultadoEl.textContent = 'Buscando commits...';
                    
                    const limit = document.getElementById('param-limit').value;
                    const skip = document.getElementById('param-skip').value;
                    const author = document.getElementById('param-author').value;
                    
                    // Monta a query string
                    const params = new URLSearchParams({ limit, skip });
                    if (author) params.append('author', author);

                    try {
                        const response = await fetch('/commits?' + params.toString());
                        const data = await response.json();
                        resultadoEl.textContent = JSON.stringify(data, null, 2);
                    } catch (error) {
                        resultadoEl.textContent = 'Erro: ' + error.message;
                    }
                }

                async function fazerCommit() {
                    resultadoEl.textContent = 'Executando script de commit...';
                    try {
                        const response = await fetch('/commit', { method: 'POST' });
                        const data = await response.json();
                        resultadoEl.textContent = JSON.stringify(data, null, 2);
                    } catch (error) {
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