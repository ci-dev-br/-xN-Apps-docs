import { Builder, By, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

export abstract class BaseCrawler {
  protected visitedUrls: Set<string> = new Set();
  protected queue: string[] = [];

  /**
   * (Abstract) Define as regras para considerar a página válida para o escopo do Crawler.
   */
  protected abstract evaluatePage(url: string, title: string, content: string): boolean;

  /**
   * (Abstract) Define o que fazer quando uma página passa na avaliação (ex: salvar no banco).
   */
  protected abstract onPageMatched(url: string, title: string, content: string): Promise<void>;

  /**
   * Inicia o motor de crawling.
   */
  public async start(initialUrls: string[]): Promise<void> {
    this.queue.push(...initialUrls);
    
    const options = new chrome.Options().addArguments('--headless', '--disable-gpu');
    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options as any).build();

    try {
      while (this.queue.length > 0) {
        const currentUrl = this.queue.shift();
        
        if (!currentUrl || this.visitedUrls.has(currentUrl)) {
          continue;
        }

        this.visitedUrls.add(currentUrl);
        await this.processUrl(driver, currentUrl);
      }
    } finally {
      await driver.quit();
    }
  }

  private async processUrl(driver: WebDriver, url: string): Promise<void> {
    try {
      console.log(`[BaseCrawler] Rastreando: ${url}`);
      await driver.get(url);

      const title = await driver.getTitle();
      const bodyText = await driver.findElement(By.css('body')).getText();

      // O Template Method em ação: delega a decisão para a implementação concreta
      if (this.evaluatePage(url, title, bodyText)) {
        await this.onPageMatched(url, title, bodyText);
        // Só extrai os links se a página atual for relevante (Opcional: você pode mover isso para fora do IF se quiser mapear toda a web)
        await this.extractAndQueueLinks(driver); 
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`[BaseCrawler] Falha ao processar ${url}:`, errorMessage);
    }
  }

  private async extractAndQueueLinks(driver: WebDriver): Promise<void> {
    const linkElements = await driver.findElements(By.css('a'));
    
    for (const element of linkElements) {
      try {
        const href = await element.getAttribute('href');
        
        if (this.isValidUrl(href) && !this.visitedUrls.has(href) && !this.queue.includes(href)) {
          this.queue.push(href);
        }
      } catch (e) {
        // Silencia erros de DOM obsoleto (StaleElementReferenceException)
      }
    }
  }

  private isValidUrl(url: string | null): url is string {
    return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
  }
}