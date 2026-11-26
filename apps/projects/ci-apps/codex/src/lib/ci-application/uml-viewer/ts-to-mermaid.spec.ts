import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import mermaid from 'mermaid';
import { JsonToTsService } from '@ci/cdk';
import {
    extractMethodParam,
    extractReferencedTypeNames,
    formatTsTypeToMermaid,
    formatUmlTranscriptionError,
    parseTypeScriptSafely,
    sanitizeMermaidNote,
    toMermaidId,
} from './ts-to-mermaid';
import { UmlViewer } from './uml-viewer';

describe('UmlViewer e Transcrição TypeScript -> Mermaid', () => {
    it('deve sanitizar identificadores reservados, notas e tipos complexos sem aninhar ~...~', () => {
        expect(toMermaidId('default')).toBe('default_');
        expect(toMermaidId('123Model')).toBe('C_123Model');
        expect(toMermaidId('@ci/core')).toBe('_ci_core');

        const note = sanitizeMermaidNote('Texto com "aspas", `crase`, {chaves};\nnova linha');
        expect(note).not.toContain('"');
        expect(note).not.toContain('{');
        expect(note).not.toContain('`');
        expect(note).toContain('<br>');

        const { ast } = parseTypeScriptSafely(`
            export class Demo {
                public items: Promise<Map<string, UserItem[] | null>>;
                public cb: (id: number) => void;
            }
        `);
        const cls = ast.program.body[0].declaration;
        const propItems = cls.body.body[0];
        const propCb = cls.body.body[1];

        const itemsType = formatTsTypeToMermaid(propItems.typeAnnotation);
        expect(itemsType).not.toMatch(/~[^~]*~[^~]*~/);
        expect(itemsType).toContain('Promise~');

        const refs = extractReferencedTypeNames(propItems.typeAnnotation);
        expect(refs).toEqual(['UserItem']);

        expect(formatTsTypeToMermaid(propCb.typeAnnotation)).toBe('Function');
    });

    it('deve extrair parâmetros com default assignment, destructuring e rest sem quebrar', () => {
        const { ast } = parseTypeScriptSafely(`
            export class Service {
                constructor(
                    private readonly repo: RepoService = null as any,
                    { timeout, retry }: RequestOpts = {} as any,
                    [first]: PairType,
                    ...tags: string[]
                ) {}
            }
        `);
        const ctor = ast.program.body[0].declaration.body.body[0];
        const extracted = ctor.params.map((p: any, i: number) => extractMethodParam(p, i));

        expect(extracted[0].safeName).toBe('repo');
        expect(extracted[0].referencedTypes).toEqual(['RepoService']);
        expect(extracted[1].safeName).toBe('options1');
        expect(extracted[1].referencedTypes).toEqual(['RequestOpts']);
        expect(extracted[2].safeName).toBe('items2');
        expect(extracted[2].referencedTypes).toEqual(['PairType']);
        expect(extracted[3].safeName).toBe('tags');
        expect(extracted[3].typeStr).toBe('String[]');
    });

    describe('UmlViewer', () => {
        let fixture: ComponentFixture<UmlViewer>;
        let component: UmlViewer;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [UmlViewer, NoopAnimationsModule],
                providers: [
                    { provide: JsonToTsService, useValue: { convert: (s: string) => s } },
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(UmlViewer);
            component = fixture.componentInstance;
        });

        it('deve gerar sintaxe Mermaid válida para TS complexo (generics aninhados, unions, getters, enums e types)', async () => {
            const complexTs = `
                import { of, inject, signal } from '@angular/core';
                import { OrderItem } from './order-item';

                /**
                 * Serviço com "aspas", {chaves} e dependências variadas
                 */
                export enum OrderStatus {
                    PENDING = 'PENDING',
                    DONE = 'DONE'
                }

                export type OrderSummary = {
                    total: number;
                    owner: UserModel | null;
                };

                export class link extends BaseEntity implements IProcessor {
                    private readonly #secretKey: string = '';
                    public items$: Observable<Map<string, OrderItem[]>>;
                    public 'kebab-prop'?: { nested: boolean };

                    constructor(
                        private readonly orderItem: OrderItem = null as any,
                        { force }: { force: boolean } = { force: false }
                    ) {}

                    get statusLabel(): OrderStatus | string {
                        return 'ok';
                    }

                    public execute(cb: (err?: Error) => void, ...tags: string[]): Promise<UserModel | null> {
                        return Promise.resolve(null);
                    }
                }
            `;

            const { fullSyntax, fallbackSyntax, astErrors } = await component.buildMermaidDiagrams(complexTs);
            expect(astErrors.length).toBe(0);

            // Não deve emitir classes stub minúsculas de operadores/funções nem relações UserModel|Null
            expect(fullSyntax).not.toContain('..> of : use');
            expect(fullSyntax).not.toContain('--> UserModel|Null');
            expect(fullSyntax).toContain('OrderStatus');
            expect(fullSyntax).toContain('OrderSummary');
            expect(fullSyntax).toContain('link_');

            // Valida com o parser real do Mermaid
            const parsedFull = await mermaid.parse(fullSyntax);
            expect(parsedFull).toBeTruthy();

            const parsedFallback = await mermaid.parse(fallbackSyntax);
            expect(parsedFallback).toBeTruthy();
        });

        it('deve recuperar diagrama válido mesmo com erro de sintaxe parcial durante edição no CodeX', async () => {
            const brokenMidEditTs = `
                export class PedidoService {
                    public total: number = 10;
                    public brokenField:
                    public listar(id: string): PedidoItem[] {
                        return [];
                    }
                }
            `;

            const { fullSyntax, fallbackSyntax, astErrors } = await component.buildMermaidDiagrams(brokenMidEditTs);
            expect(astErrors.length).toBeGreaterThan(0);

            const parsedFull = await mermaid.parse(fullSyntax);
            expect(parsedFull).toBeTruthy();

            const parsedFallback = await mermaid.parse(fallbackSyntax);
            expect(parsedFallback).toBeTruthy();

            const friendly = formatUmlTranscriptionError(null, astErrors);
            expect(friendly).toContain('Erro de sintaxe TypeScript');
        });

        it('deve usar modo simplificado (fallback) automaticamente quando mermaid.render falhar na sintaxe completa', async () => {
            spyOn(component, 'buildMermaidDiagrams').and.resolveTo({
                fullSyntax: 'classDiagram\n  INVALID MERMAID %%% SYNTAX',
                fallbackSyntax: 'classDiagram\n  class SafeEntity {\n    +id\n  }',
                astErrors: [],
            });
            const renderSpy = spyOn(mermaid, 'render').and.callFake(async (_id: string, syntax: string) => {
                if (syntax.includes('INVALID MERMAID')) {
                    throw new Error('Parse error on line 2');
                }
                return {
                    svg: '<svg viewBox="0 0 200 100"><g id="classId-SafeEntity"><text>SafeEntity</text></g></svg>',
                    diagramType: 'class',
                } as any;
            });

            component.javascriptCode = 'export class SafeEntity { id: string; }';
            await (component as any).renderDiagram();

            expect(renderSpy).toHaveBeenCalledTimes(2);
            expect(component.errorSeverity).toBe('warning');
            expect(component.error).toContain('Modo simplificado exibido');
            expect(component.mermaidContainerRef.nativeElement.querySelector('svg')).not.toBeNull();
        });
    });
});
