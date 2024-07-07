import { Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class IDynamicFormControl {
    label?: string;
    placeholder?: string;
    maxLenght?: number;
    minLenght?: number;
    max?: number | Date;
    min?: number | Date;
    options?: string[];
}

export class IDynamicForm {
    @ApiProperty({ nullable: true, required: false })
    controls?: { [key: string]: IDynamicFormControl };
    @ApiProperty({ nullable: true, required: false })
    title?: string;
    @ApiProperty({ nullable: true, required: false })
    description?: string;
}

@Injectable()
export abstract class CadastroBase {
    abstract view: IDynamicForm;
}