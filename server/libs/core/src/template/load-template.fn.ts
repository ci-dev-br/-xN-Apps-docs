import { readFileSync } from "fs";
import { join } from "path";

export function templateHtml(template_name: string, data: any) {
    let template_html = readFileSync(join(__dirname, '/../', 'templates/' + template_name + '.html')).toString('utf-8');
    Object.keys(data).forEach(property_name => (template_html = template_html.replaceAll(`{{${property_name}}}`, data[property_name])));
    return template_html;
}