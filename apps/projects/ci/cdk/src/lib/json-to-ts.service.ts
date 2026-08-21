import { Injectable } from "@angular/core";
import * as t from '@babel/types';
import generate from '@babel/generator';
// Ajuste para lidar com a exportação padrão do @babel/generator em ambientes CommonJS/ESM
const generateCode = (generate as any).default || generate;

/**
 * origem: https://gemini.google.com/app/b8e0bb2fc0ee1862
 */
@Injectable()
export class JsonToTsService {
    constructor() { }
    // Armazena todas as classes geradas (a raiz e os objetos aninhados)
    private classes: t.ClassDeclaration[] = [];
    /**
     * Converte uma string JSON em um código de classes TypeScript
     */
    public convert(jsonString: string, rootClassName: string = 'RootClass'): string {
        const parsedJson = JSON.parse(jsonString);
        this.classes = []; // Reseta o estado

        this.generateClass(rootClassName, parsedJson);

        // Cria o programa AST exportando todas as classes criadas
        const program = t.program(
            this.classes.map(cls => t.exportNamedDeclaration(cls))
        );

        // Gera o código final a partir da AST
        const output = generateCode(program);
        return output.code;
    }

    /**
     * Gera uma classe AST e a adiciona à lista
     */
    private generateClass(className: string, obj: Record<string, any>): void {
        const properties = Object.entries(obj).map(([key, value]) => {
            const typeAnnotation = this.inferType(key, value);

            // Cria a propriedade da classe: nomeDaPropriedade: Tipo;
            const classProp = t.classProperty(
                t.identifier(key),
                null, // sem valor padrão de inicialização
                t.tsTypeAnnotation(typeAnnotation)
            );

            return classProp;
        });

        // Cria a declaração da classe: class NomeDaClasse { ... }
        const classDecl = t.classDeclaration(
            t.identifier(this.capitalize(className)),
            null,
            t.classBody(properties)
        );

        // Adiciona no início do array para que as classes aninhadas fiquem no topo
        this.classes.unshift(classDecl);
    }

    /**
     * Infere o tipo Babel correspondente ao valor do JSON
     */
    private inferType(key: string, value: any): t.TSType {
        if (value === null || value === undefined) {
            return t.tsAnyKeyword();
        }

        if (Array.isArray(value)) {
            if (value.length > 0) {
                // Pega o tipo do primeiro elemento do array como referência
                return t.tsArrayType(this.inferType(key, value[0]));
            }
            return t.tsArrayType(t.tsAnyKeyword());
        }

        if (typeof value === 'object') {
            const nestedClassName = this.capitalize(key);
            // Gera uma nova classe para o objeto aninhado
            this.generateClass(nestedClassName, value);
            return t.tsTypeReference(t.identifier(nestedClassName));
        }

        if (typeof value === 'string') return t.tsStringKeyword();
        if (typeof value === 'number') return t.tsNumberKeyword();
        if (typeof value === 'boolean') return t.tsBooleanKeyword();

        return t.tsAnyKeyword();
    }

    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

}