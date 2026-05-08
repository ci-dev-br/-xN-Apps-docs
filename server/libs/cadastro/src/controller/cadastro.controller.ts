import { Body, Controller, Inject, Optional, Post, Req, Type } from "@nestjs/common";
import { Payload } from "../dto/payload.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CadastroBase, IDynamicForm } from "../service/CadastroBase";
import { ModuleRef } from "@nestjs/core";
@ApiTags('Cadastro')
@Controller('Cadastro')
export class CadastroController {
    private services: CadastroBase[];
    constructor(
        private readonly injector: ModuleRef,
        @Optional()
        @Inject('CLIENT.MODEL.EDITABLES') private readonly _editables: string[],
        @Optional()
        @Inject('FORM_PROVIDERS') private readonly FORM_PROVIDER_SERVICES?: any[]) {
        if (this.FORM_PROVIDER_SERVICES) {
            const s = [];
            this.FORM_PROVIDER_SERVICES.forEach(e => {
                s.push(this.injector.get(e));
            })
            this.services = s;
        }
    }
    @ApiResponse({
        description: 'CadastroEditables',
        type: String,
        isArray: true,
    })
    @Post('Editables')
    @ApiOperation({
        operationId: 'EditablesCadastro',
    })
    async editables() {
        try {
            return this._editables;
        } catch (error) {
            console.trace(error);
        }
    }
    @ApiResponse({
        type: IDynamicForm,
        isArray: true,
    })
    @Post('All')
    @ApiOperation({
        description: `Retorna lista de Cadastros disponíveis para manipulação.`,
        operationId: 'GetAllCadastro',
    })
    async getAll(
        @Body()
        input?: Payload<void>,
        @Req() req?: any,
    ) {
        try {
            return this.services
                .filter(s => {
                    if (input.by && input.equals) {
                        if (s.view[input.by] === input.equals) return true;
                        return false;
                    }
                    return true;
                })
                .map(s => {
                    if (input && !!input.fields) {
                        const out: any = {};
                        for (let field of input.fields) {
                            out[field] = s.view[field];
                        }
                        return out;
                    }
                    return s.view
                });
        } catch (err) {
            console.trace(err)
        }
    }
}