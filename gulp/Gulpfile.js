const { src, dest, parallel, series } = require('gulp');
const gutil = require('gulp-util');
const ftp = require('vinyl-ftp');
const vfs = require('vinyl-fs');
const { execSync } = require('child_process');
require('dotenv').config();
const map = require('map-stream');

const {
    client_dist_static_public: R734,
    server_local_static_public: R348,
} = process.env;
const { NgBuildClientProd: C101 } = require('./ressources').CommonsCommands;
// Clean old files
function CleanOldFiles(cb) {
    cb();
}

// Build client application
function BuildPClientApplication(cb) {
    if (!!R734) execSync(C101, { cwd: R734 });
    cb();
}

// Deploy Local Client Application
function DeployLocalClient(cb) {
    // TODO: clean old public files
    if (!!R734 && !!R348) src(R734 + '**', { encoding: false }).pipe(dest(R348, { overwrite: true }));
    cb();
}

// Deploy FTP's application
async function DeployFTPApplications(cb) {
    /** @type {Array<{deployMode:string, commonName?:string, user?:string,  password?:string, host?:string}>}  */
    let clients = JSON.parse(process.env.ftp_clients).clients;
    for (const e of clients) {
        await new Promise((res, rej) => {
            if (e.deployMode.indexOf('ftp') > -1) {
                let conn = ftp.create({
                    host: e.host,
                    user: e.user,
                    password: e.password,
                    parallel: 1,
                    log: gutil.log,
                    secureOptions: { rejectUnauthorized: false },
                    secure: true,
                    reload: true,
                    idleTimeout: 20000
                });
                let globs = [];
                if (e.deployMode.indexOf('index') > -1) {
                    globs.push('index.csr.html');
                }
                if (e.deployMode.indexOf('htaccess') > -1) {
                    globs.push('.htaccess');
                }
                if (e.deployMode.indexOf('php') > -1) {
                    globs.push('index.php');
                }
                // if (e.deployMode.indexOf('mail') > -1) {
                //     globs.push('mail.php');
                // }
                if (e.deployMode.indexOf('assets') > -1) {
                    globs.push('**.txt');
                    globs.push('**.svg');
                    globs.push('**.png');
                    globs.push('**.jpg');
                    globs.push('**.css');
                }
                if (e.deployMode.indexOf('js') > -1) {
                    globs.push('**.js');
                }
                if (e.extras && Array.isArray(e.extras)) {
                    globs.push(...e.extras);
                }
                if (globs.length > 0) {
                    console.log(e.commonName + ' 🆙 ');
                    let cnt = globs.length;
                    vfs.src(globs, { cwd: R734, buffer: true })
                        .pipe(conn.dest('/', { buffer: true }))
                        .pipe(map((file, cbb) => {
                            cbb();
                            cnt--;
                            if (cnt === 0) {
                                res();
                                console.log('[end]')
                            }
                        }));
                }
            }
        });
    }
    cb();
}

/// exports gulp tasks
exports.CleanOldFiles = CleanOldFiles;
exports.BuildPClientApplication = BuildPClientApplication;
exports.DeployLocalClient = DeployLocalClient;
exports.DeployFTPApplications = DeployFTPApplications;
exports.default = series(
    CleanOldFiles,
    BuildPClientApplication,
    DeployLocalClient,
    // DeployFTPApplications,
);