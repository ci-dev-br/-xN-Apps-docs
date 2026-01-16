class ROLE {
    constructor(valueOf: string) { }
}
export const roles = {
    ADMIN: new ROLE('ADMIN'),
    DEVELOPER: new ROLE('DEVELOPER'),
    SYSADMIN: new ROLE('SYSADMIN'),
}