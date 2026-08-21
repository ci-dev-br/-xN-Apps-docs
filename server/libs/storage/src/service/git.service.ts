import simpleGit from "simple-git";
import { FileDto } from "../controller/dto/file-dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GitService {
    constructor(
    ) { }
    async status(input: FileDto, request: any) {
        try {
            console.log('GitService.status called with path:', input.path);
            const git = simpleGit(input.path.split('\\').slice(0, -1).join('\\')); // Get the parent directory of the file
            const statusSummary = await git.status();
            return statusSummary;
        } catch (error) {
            console.trace(error);
            return { error: error.message };
        }
    }
    async log(input: FileDto, request: any) {
        try {
            const git = simpleGit(input.path);
            const logSummary = await git.log();
            return logSummary;
        } catch (error) {
            console.trace(error);
            return { error: error.message };
        }
    }
}