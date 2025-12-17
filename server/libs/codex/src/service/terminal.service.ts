import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as pty from 'node-pty';

@Injectable()
export class TerminalService {
  // Mapa para guardar a sessão de terminal de cada socket conectado
  private sessions: Map<string, IPty> = new Map();
  createSession(socketId: string, onData: (data: string) => void) {
    // Detecta o shell padrão do sistema (PowerShell no Win, Bash/Zsh no Linux/Mac)
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    // Cria o processo do terminal
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME || process.cwd(),
      env: process.env as any,
    });
    // Escuta a saída do terminal (o que o comando retorna) e envia para o callback
    ptyProcess.onData((data) => {
      onData(data);
    });
    this.sessions.set(socketId, ptyProcess);
    
    console.log(`Sessão de terminal criada para: ${socketId} (PID: ${ptyProcess.pid})`);
  }
  write(socketId: string, data: string) {
    const session = this.sessions.get(socketId);
    if (session) {
      session.write(data);
    }
  }
  resize(socketId: string, cols: number, rows: number) {
    const session = this.sessions.get(socketId);
    if (session) {
      try {
        session.resize(cols, rows);
      } catch (e) {
        console.error('Erro ao redimensionar:', e);
      }
    }
  }
  killSession(socketId: string) {
    const session = this.sessions.get(socketId);
    if (session) {
      session.kill();
      this.sessions.delete(socketId);
      console.log(`Sessão encerrada para: ${socketId}`);
    }
  }
}