import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

export function templateHtml(template_name: string, data: any) {
    const candidates = [
        join(process.cwd(), 'templates', `${template_name}.html`),
        join(process.cwd(), 'server', 'templates', `${template_name}.html`),
        join(__dirname, '..', 'templates', `${template_name}.html`),
        join(__dirname, '..', '..', '..', '..', 'templates', `${template_name}.html`),
        resolve(__dirname, '..', '..', '..', '..', '..', 'templates', `${template_name}.html`),
    ];
    const foundPath = candidates.find(p => existsSync(p));
    let template_html = foundPath
        ? readFileSync(foundPath, 'utf-8')
        : `<html><body><h1>Olá {{nome}}</h1><p>Acesse o link de convite: <a href="{{link_aceitar_convite}}">{{link_aceitar_convite}}</a></p><p>Invite Hash: <strong>{{invite_hash}}</strong></p></body></html>`;

    Object.keys(data || {}).forEach(property_name => {
        const val = data[property_name] ?? '';
        template_html = template_html.replaceAll(`{{${property_name}}}`, String(val));
    });
    return template_html;
}