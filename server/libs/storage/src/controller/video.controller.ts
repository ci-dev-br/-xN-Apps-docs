import { Role } from "@ci/auth/decorators/role.decorator";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { VideoGetInput } from "./dto/video-get.input";
import { createReadStream, statSync } from "fs";

@Role('MASTER')
@ApiTags('Video')
@Controller('Video')
export class VideoController {
    @Post('Get')
    async Get(@Body() input: VideoGetInput) {
        const videoPath = input.videoPath;
        const videoSize = statSync(videoPath).size;
        const CHUNK_SIZE = 10 ** 6;
        const start = Number(input.range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };
        const videoStream = createReadStream(videoPath, { start, end });
        // videoStream.pipe(res);
        return videoStream;
    }
}