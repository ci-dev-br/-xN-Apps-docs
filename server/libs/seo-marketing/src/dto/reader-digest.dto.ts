import { ApiProperty } from '@nestjs/swagger';

export class ReaderNewsDigestItemDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty({ description: 'Autor ou veículo original da notícia' })
    author: string;

    @ApiProperty({ description: 'Link original da notícia' })
    originalUrl: string;

    @ApiProperty({ description: 'Data/hora de publicação ou coleta da notícia' })
    publishedAt: Date;

    @ApiProperty({ description: 'Total de curtidas (votos UP)' })
    likes: number;

    @ApiProperty({ description: 'Total de votos negativos (DOWN)' })
    dislikes: number;

    @ApiProperty({ required: false })
    category?: string;

    @ApiProperty({ required: false })
    snippet?: string;
}

export class ReaderNewsClusterDto {
    @ApiProperty()
    clusterId: string;

    @ApiProperty({ description: 'Tema representativo do agrupamento por similaridade' })
    topic: string;

    @ApiProperty({ type: [String] })
    keywords: string[];

    @ApiProperty()
    totalLikes: number;

    @ApiProperty()
    newsCount: number;

    @ApiProperty()
    latestPublishedAt: Date;

    @ApiProperty()
    oldestPublishedAt: Date;

    @ApiProperty({ type: [ReaderNewsDigestItemDto] })
    items: ReaderNewsDigestItemDto[];
}

export class ReaderNewsDigestDto {
    @ApiProperty()
    digestId: string;

    @ApiProperty()
    generatedAt: Date;

    @ApiProperty()
    windowHours: number;

    @ApiProperty({ example: 'READER' })
    targetRole: string;

    @ApiProperty()
    totalNews: number;

    @ApiProperty()
    totalClusters: number;

    @ApiProperty()
    notifiedReadersCount: number;

    @ApiProperty({ type: [ReaderNewsClusterDto] })
    groups: ReaderNewsClusterDto[];
}
