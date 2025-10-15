import { createHash, Hash } from "node:crypto";

export function hashMailer(mail) {
    return createHash('sha256').update(process.env.CI_APPS_MAILER + '.' + mail + '.' + 'apps.ci.dev.br').digest('hex');
}