import { Component, Input, OnChanges, ElementRef, ViewChild, AfterViewInit, SimpleChanges } from '@angular/core';
import mermaid, { MermaidConfig } from 'mermaid';
import * as babelParser from '@babel/parser';
import { CiCdkModule, JsonToTsService } from '@ci/cdk';

@Component({
    selector: 'uml-viewer',
    standalone: true,
    imports: [
        CiCdkModule,
    ],
    templateUrl: 'uml-viewer.html',
    styleUrls: ['uml-viewer.scss'],
})
export class UmlViewer implements OnChanges, AfterViewInit {
    @Input({ required: true }) javascriptCode?: string;
    @ViewChild('mermaidContainer') mermaidContainer!: ElementRef<HTMLDivElement>;

    error: string | null = null;
    private isViewInit = false;
    scale = 2;
    translateX = 0;
    translateY = 0;
    isDragging = false;
    private startX = 0;
    private startY = 0;
    constructor(
        public jsonToTs: JsonToTsService
    ) {
        //   jsonToTs = jsonToTs || jsonToTs;
        // Inicializa as configurações do Mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            useMaxWidth: false
        } as MermaidConfig & { useMaxWidth?: boolean });
    }

    get transformStyle(): string {
        // Aplica o translate e depois o scale
        return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }

    onWheel(event: WheelEvent): void {
        event.preventDefault(); // Evita que a página role junto com o zoom do gráfico

        const zoomSensitivity = 0.1;
        // Identifica a direção do scroll
        const delta = Math.sign(event.deltaY) > 0 ? -zoomSensitivity : zoomSensitivity;

        // Limita o zoom entre 0.2x e 5x para não sumir na tela ou estourar a memória
        this.scale = Math.max(0.2, Math.min(this.scale + delta, 5));

        let r = false;
        setTimeout(() => {
            if (!!r) return; r = true
            this.renderDiagram();
        }, 100);
    }

    onMouseDown(event: MouseEvent): void {
        event.preventDefault();
        this.isDragging = true;
        // Salva a posição inicial compensando o offset atual
        this.startX = event.clientX - this.translateX;
        this.startY = event.clientY - this.translateY;
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.isDragging) return;
        event.preventDefault();

        // Atualiza a translação baseada na movimentação do mouse
        this.translateX = event.clientX - this.startX;
        this.translateY = event.clientY - this.startY;

    }

    onMouseUp(): void {
        this.isDragging = false;
        let r = false;
        setTimeout(() => {
            if (!!r) return; r = true
            this.renderDiagram();
        }, 100);

    }

    ngAfterViewInit(): void {
        this.isViewInit = true;
        this.renderDiagram();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['javascriptCode'] && this.isViewInit) {

            // this.scale = 2;
            this.translateX = 175;
            this.translateY = 280;
            this.isDragging = false;
            this.startX = 0;
            this.startY = 0;

            this.renderDiagram();
        }
    }

    private async renderDiagram(): Promise<void> {
        if (!this.javascriptCode?.trim()) return;
        try {
            this.error = null;
            let code_for_generate_diagram = this.javascriptCode;
            try {
                //  if (this.javascriptCode.trim().indexOf('{') === 0) {
                const json_parsed = JSON.parse(this.javascriptCode.trim());
                if (!json_parsed) throw new Error(`não é json`);
                const ts_class_converted = this.jsonToTs.convert(this.javascriptCode.trim());
                code_for_generate_diagram = ts_class_converted;
                // }
            } catch (error) {
                console.info(error);
            }
            /// feat: Adicionar importações inline dos arquivos existentes....
            let adicionar_modulos_importados = true;
            if (adicionar_modulos_importados) {

            }
            const mermaidSyntax = this.generateMermaidClassDiagram(code_for_generate_diagram);

            // Gera um ID único para a renderização do SVG
            const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;

            // Pede ao Mermaid para converter a sintaxe em um SVG
            const { svg } = await mermaid.render(id, mermaidSyntax);
            this.mermaidContainer.nativeElement.innerHTML = svg;

        } catch (err: any) {
            this.error = err.message || 'Falha ao converter código em UML.';
            this.mermaidContainer.nativeElement.innerHTML = '';
        }
    }

    private generateMermaidClassDiagram(code: string): string {
        try {
            const ast = babelParser.parse(code, {
                sourceType: 'module',
                plugins: ['typescript', 'decorators-legacy', 'jsx', 'moduleBlocks'],
            });

            let classBlocks = '';
            let relationships = '';
            let hasClassesOrInterfaces = false;

            const fileImports = new Map<string, string>();
            const usedImports = new Map<string, string>();

            // 1. Coletar todas as declarações de importação
            const body = ast.program.body;
            for (const node of body) {
                if (node.type === 'ImportDeclaration') {
                    const source = node.source.value;
                    for (const specifier of node.specifiers) {
                        if (specifier.local && specifier.local.name) {
                            fileImports.set(specifier.local.name, source);
                        }
                    }
                }
            }

            const getType = (typeNode: any): string => {
                if (!typeNode) return '';
                const t = typeNode.typeAnnotation || typeNode;

                switch (t.type) {
                    case 'TSStringKeyword': return 'String';
                    case 'TSNumberKeyword': return 'Number';
                    case 'TSBooleanKeyword': return 'Boolean';
                    case 'TSAnyKeyword': return 'Any';
                    case 'TSVoidKeyword': return 'Void';
                    case 'TSTypeReference': {
                        let name = t.typeName?.name || 'Unknown';
                        if (t.typeParameters && t.typeParameters.params) {
                            const params = t.typeParameters.params.map(getType).join(', ');
                            name += `~${params}~`;
                        }
                        return name;
                    }
                    case 'TSArrayType': return `${getType(t.elementType)}[]`;
                    case 'TSUnionType': return t.types.map(getType).join('|');
                    default: return '';
                }
            };

            const getVisibility = (acc: string) => {
                if (acc === 'private') return '-';
                if (acc === 'protected') return '#';
                return '+'; // Default public para interfaces e omitidos
            };

            const findIdentifiers = (node: any, found: Set<string>) => {
                if (!node || typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    for (const item of node) findIdentifiers(item, found);
                    return;
                }
                if (node.type === 'Identifier' && node.name) {
                    found.add(node.name);
                }
                for (const key of Object.keys(node)) {
                    if (!['loc', 'range', 'tokens', 'comments'].includes(key)) {
                        findIdentifiers(node[key], found);
                    }
                }
            };

            for (const node of body) {
                const classNode =
                    node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration'
                        ? (node.declaration as any)
                        : node;

                if (!classNode) continue;

                const isClass = classNode.type === 'ClassDeclaration';
                const isInterface = classNode.type === 'TSInterfaceDeclaration';

                if (isClass || isInterface) {
                    hasClassesOrInterfaces = true;
                    const className = classNode.id?.name || 'AnonymousEntity';
                    let classBlock = `  class ${className} {\n`;
                    const classConnections = new Set<string>();

                    // Marcação no Mermaid
                    if (isInterface) {
                        classBlock += `    <<Interface>>\n`;
                    } else if (classNode.abstract) {
                        classBlock += `    <<Abstract>>\n`;
                    }

                    // Herança de Classes (extends)
                    if (isClass && classNode.superClass && classNode.superClass.type === 'Identifier') {
                        const superName = classNode.superClass.name;
                        relationships += `  ${superName} <|-- ${className}\n`;
                        classConnections.add(superName);
                    }

                    // Herança de Interfaces (extends)
                    if (isInterface && classNode.extends) {
                        for (const ext of classNode.extends) {
                            if (ext.expression && ext.expression.type === 'Identifier') {
                                const superName = ext.expression.name;
                                relationships += `  ${superName} <|-- ${className}\n`;
                                classConnections.add(superName);
                            }
                        }
                    }

                    // Implementação de Interfaces pelas Classes (implements)
                    if (isClass && classNode.implements) {
                        for (const impl of classNode.implements) {
                            if (impl.type === 'TSExpressionWithTypeArguments' && impl.expression.type === 'Identifier') {
                                const interfaceName = impl.expression.name;
                                relationships += `  ${interfaceName} <|.. ${className}\n`;
                                classConnections.add(interfaceName);
                            }
                        }
                    }

                    // Iteração sobre membros (body da Classe ou Interface)
                    const members = classNode.body?.body || [];

                    for (const member of members) {
                        const visibility = getVisibility(member.accessibility);
                        const modifier = member.static ? '$' : (member.abstract ? '*' : '');

                        const isProperty = member.type === 'ClassProperty' || member.type === 'TSPropertySignature';
                        const isMethod = member.type === 'ClassMethod' || member.type === 'TSMethodSignature';

                        if (isProperty && member.key.type === 'Identifier') {
                            const propName = member.key.name;
                            const typeStr = getType(member.typeAnnotation);
                            const typePrefix = typeStr ? `${typeStr} ` : '';

                            classBlock += `    ${visibility}${typePrefix}${propName}${modifier}\n`;

                            if (typeStr && /^[A-Z]/.test(typeStr) && !['String', 'Number', 'Boolean', 'Any', 'Void'].includes(typeStr)) {
                                const cleanType = typeStr.replace(/\[\]/g, '').replace(/~.*~/g, '');
                                if (cleanType && cleanType !== className) {
                                    relationships += `  ${className} --> ${cleanType} : ${propName}\n`;
                                    classConnections.add(cleanType);
                                }
                            }
                        } else if (isMethod) {
                            const isConstructor = member.kind === 'constructor';
                            const methodName = isConstructor ? 'constructor' : (member.key.name || 'method');

                            const rawReturnType = member.returnType || member.typeAnnotation;
                            const returnType = isConstructor ? '' : getType(rawReturnType);
                            const returnSuffix = returnType ? ` ${returnType}` : '';

                            const methodParams = member.params || member.parameters || [];

                            const params = methodParams.map((p: any) => {
                                let pName = 'param';
                                let pType = '';

                                if (p.type === 'TSParameterProperty') {
                                    pName = p.parameter.name;
                                    pType = getType(p.parameter.typeAnnotation);
                                } else if (p.type === 'Identifier') {
                                    pName = p.name;
                                    pType = getType(p.typeAnnotation);
                                } else if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') {
                                    pName = p.left.name;
                                    pType = getType(p.left.typeAnnotation);
                                }

                                if (isConstructor && pType && /^[A-Z]/.test(pType)) {
                                    const cleanType = pType.replace(/\[\]/g, '').replace(/~.*~/g, '');
                                    if (cleanType && cleanType !== className) {
                                        relationships += `  ${className} ..> ${cleanType} : injects\n`;
                                        classConnections.add(cleanType);
                                    }
                                }

                                return pType ? `${pType} ${pName}` : pName;
                            }).join(', ');

                            classBlock += `    ${visibility}${methodName}(${params})${modifier}${returnSuffix}\n`;
                        }
                    }

                    classBlock += `  }\n`;
                    classBlocks += classBlock;

                    // 2. Resolver dependências baseadas em uso
                    const identifiersInClass = new Set<string>();
                    findIdentifiers(classNode, identifiersInClass);

                    fileImports.forEach((source, importName) => {
                        if (identifiersInClass.has(importName)) {
                            usedImports.set(importName, source);
                            if (!classConnections.has(importName)) {
                                relationships += `  ${className} ..> ${importName} : use\n`;
                                classConnections.add(importName);
                            }
                        }
                    });
                }
            }

            if (!hasClassesOrInterfaces) {
                throw new Error('Nenhuma classe ou interface TypeScript encontrada no arquivo.');
            }

            // 3. Agrupar imports em pacotes (namespaces do Mermaid)
            const packages = new Map<string, string[]>();

            usedImports.forEach((source, importName) => {
                // Se o from for relativo, cai no pacote 'Main' (pacote principal)
                const isRelative = source.startsWith('.');
                const packageName = isRelative ? 'Main' : source;

                if (!packages.has(packageName)) {
                    packages.set(packageName, []);
                }
                packages.get(packageName)!.push(importName);
            });

            let importBlocks = '';

            packages.forEach((classes, pkgName) => {
                // Mermaid não aceita caracteres especiais (@, /, ., -) no nome do namespace
                const safePkgName = pkgName.replace(/[^a-zA-Z0-9_]/g, '_');

                importBlocks += `  namespace ${safePkgName} {\n`;
                classes.forEach(className => {
                    importBlocks += `    class ${className} {\n  }\n`;/*      <<Import>>\n    */
                });
                importBlocks += `  }\n`;
            });

            const mermaidConfig = `%%{init: {"useMaxWidth": false, "theme": "default"}}%%`;

            return `${mermaidConfig}\nclassDiagram\n${classBlocks}\n${importBlocks}\n${relationships}`;
        } catch (error) {
            console.error('Falha ao gerar diagrama:', error);
            throw new Error('Falha ao converter código em UML.');
        }
    }
}