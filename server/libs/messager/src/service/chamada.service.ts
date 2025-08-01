import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Chamada } from "../model/chamada.entity";
import { Repository } from "typeorm";
import { Builder, Browser, By, Key, until, WebDriver } from 'selenium-webdriver';
import { MailService } from "@ci/notification/services/mail.service";
const chrome = require('selenium-webdriver/chrome')
@Injectable()
export class ChamadaService {
    private _webDriver?: WebDriver;
    private async getDriver(browser: string = Browser.CHROME) {
        if (!!this._webDriver) return this._webDriver;
        const options = new chrome.Options();
        options.setUserPreferences({
            'profile.default_content_setting_values.media_stream_mic': 1 // 1 para permitir, 2 para bloquear, 0 para padrão
        });
        let driver = await new Builder()
            .forBrowser(browser)
            .setChromeOptions(options)
            .build();
        return this._webDriver = driver;
    }
    constructor(
        @InjectRepository(Chamada)
        private readonly chamadaRepository: Repository<Chamada>,
        private readonly mailService: MailService,
    ) { }
    /**
     * Retorna um objeto de atendimento que será chamado quando disponível e iniciado,
     * os atendimentos são realizados de forma assíncrona e em filas de acordo com 
     * configuirações de disponibilidade de recursos. As filas podem ser manipuladas
     * em contextos restritos. Apenas usuários gestores do número da fila é capaz de alterar
     * a ordem dos atendimentos.
     * 
     */
    async IniciarChamada() {
        try {
            const driver = await this.getDriver();
            await driver.get('https://character.ai/chat/7pdcgBSDXkva8Xv_qHQAvATA6Rp4e8nVoLf8MITzwVk');
            await driver.get('https://character.ai/chat/7pdcgBSDXkva8Xv_qHQAvATA6Rp4e8nVoLf8MITzwVk');
            await driver.wait(until.titleContains('Converse com Anna Santos'), 100);
            if ((await driver.findElement(By.css('body')).getText()).indexOf('Iniciar sessão') > -1) {
                await driver.findElement(By.css('button:nth-child(2)')).click();
                await driver.wait(until.elementTextContains(await driver.findElement(By.css('body')), 'Continuar com e-mail'));
                await driver.findElement(By.css('button:nth-child(4)')).click();
                (await driver.findElement(By.css('[role=dialog] input'))).sendKeys("allana.santos@ci.dev.br");
                try {
                    await driver.findElement(By.css('[role=dialog] .w-full button')).click();
                    await driver.wait(until.elementTextContains(await driver.findElement(By.css('body')), 'Verifique o seu email'), 3000);
                } catch (error) {
                    console.trace(error);
                }
                await (new Promise<void>((res, rej) => setTimeout(() => res(), 5000))) // wait 5 seconds 
                let link_login = await this.mailService.readMail(/(https:\/\/character\.ai\/login\/[.*\w\W]{0,})<\/code/g);
                if (!!link_login) {
                    link_login = link_login.replaceAll('\r\n', '').replace('=', "");
                    await driver.get(link_login);
                }
            }
            await driver.wait(until.titleContains('Converse com Anna Santos'));
            await (new Promise<void>((res, rej) => setTimeout(() => res(), 150)))
            await driver.findElement(By.css('[aria-label="Ver detalhes da Personagem"]')).click();
            await (new Promise<void>((res, rej) => setTimeout(() => res(), 150)))
            await driver.findElement(By.css('[role=dialog] > div + div + p + div + div button')).click();
            await (new Promise<void>((res, rej) => setTimeout(() => res(), 150)))
            await driver.findElement(By.css('[role=dialog] + div + [role=dialog] > div + div + div button')).click();
            await (new Promise<void>((res, rej) => setTimeout(() => res(), 1000)))
            await driver.findElement(By.css('[aria-label="Reproduzir voz"]')).click();
            await (new Promise<void>((res, rej) => setTimeout(() => res(), 700)))
            await driver.findElement(By.css('#chat-body > .items-center button[data-state="closed"]')).click();
        } catch (error) {
            console.trace(error);
            this._webDriver = null;
        }
    }
    async FinalizarChamada() {
    }
    async AbrirNovaSessao() {
    }
}