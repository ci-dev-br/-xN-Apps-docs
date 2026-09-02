import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
    @ApiProperty() id: string;
    @ApiProperty() title: string;
    @ApiProperty() content: string;
    @ApiProperty() link: string;
    @ApiProperty() source: string;
    @ApiProperty() date: Date;
}

export class FeedColumnDto {
    @ApiProperty()
    mainSource: string;

    @ApiProperty({ type: [PostDto] })
    posts: PostDto[];
}