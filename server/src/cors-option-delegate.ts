
import { DomainService } from '@ci/manager';

export const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    if (DomainService.whitelist.indexOf(req.header('Origin')) === -1) DomainService.requestWhitelist(req.header('Origin'));
    let whitelist = DomainService.whitelist;
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = {
            origin: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
        };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};