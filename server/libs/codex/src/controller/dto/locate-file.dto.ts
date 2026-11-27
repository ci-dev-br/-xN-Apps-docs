import { ApiProperty } from '@nestjs/swagger';

export class LocateSourceFileInputDto {
    @ApiProperty({
        description: 'Nome ou parte do nome do arquivo de código-fonte (ex: dyn-form.component.ts)',
    })
    name: string;

    @ApiProperty({
        required: false,
        type: [String],
        description: 'Lista opcional de extensões permitidas (ex: [".ts", ".html", ".scss"])',
    })
    extensions?: string[];

    @ApiProperty({
        required: false,
        description: 'Subdiretório relativo ao workspace para restringir a busca',
    })
    directory?: string;

    @ApiProperty({
        required: false,
        default: 25,
        description: 'Quantidade máxima de arquivos retornados',
    })
    limit?: number;
}

export class LocatedSourceFileDto {
    @ApiProperty()
    name: string;

    @ApiProperty({ description: 'Caminho relativo ao workspace raiz' })
    path: string;

    @ApiProperty({ description: 'Diretório relativo do arquivo' })
    directory: string;

    @ApiProperty()
    extension: string;

    @ApiProperty()
    size: number;

    @ApiProperty()
    score: number;
}

export class LocateSourceFileOutputDto {
    @ApiProperty()
    query: string;

    @ApiProperty()
    found: boolean;

    @ApiProperty()
    total: number;

    @ApiProperty({ type: () => LocatedSourceFileDto, nullable: true, required: false })
    primaryFile: LocatedSourceFileDto | null;

    @ApiProperty({ type: [LocatedSourceFileDto] })
    files: LocatedSourceFileDto[];
}
