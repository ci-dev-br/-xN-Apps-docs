import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export class Logger {
    private readonly error = this.console.error;
    private readonly info = this.console.info;
    private readonly log = this.console.log;
    private readonly trace = this.console.trace;
    constructor(private readonly console: Console) {
        setTimeout(() => {
            console.error = (...a) => this.errorHandler(...a);
            console.info = (...a) => this.infoHandler(...a);
            console.log = (...a) => this.logHandler(...a);
            console.trace = (...a) => this.traceHandler(...a);
        }, 10);
    }
    private errorHandler(...error: any) {
        try {
            if (this.error) this.error(...error);
        } catch (error) {

        }
        try {
            this.print('error', ...error)
        } catch (error) {

        }
    }
    private infoHandler(...info: any) {
        try {
            if (this.info) this.info(...info);
        } catch (error) {

        }
        try {
            this.print('info', ...info)
        } catch (error) {

        }
    }
    private logHandler(...log: any) {
        try {
            this.print('log', ...log)
        } catch (error) {
            error;
        }
        try {
            if (this.log) this.log(...log);
        } catch (e) {

        }
    }
    private print(a, ...log) {
        let f = '';
        const date = ((new Date()).toISOString().replace(/\D/g, '').substring(0, 11));
        const fileName = date + '-' + a + '.log';
        const file = join(__dirname, '..', 'logs', fileName);
        try {
            f = readFileSync(file).toString('utf-8') + '\n';
        } catch (error) {
            error
        }
        writeFileSync(file, f + (Array.isArray(log.map(l => String(l))) ? log.join('\n') : String(log)));
    }
    private traceHandler(...trace: any) {
        try {
            if (this.log) this.log(...trace);
        } catch (e) {

        }
        try {
            this.print('trace', ...trace)
        } catch (error) {

        }
    }
}