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
function DeployFTPApplications(cb) {
    /** @type {Array<{deployMode:string, commonName?:string, user?:string,  password?:string, host?:string}>}  */
    let clients = JSON.parse(process.env.ftp_clients).clients;
    clients.forEach(e => {
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
            });
            let globs = [];
            if (e.deployMode.indexOf('index') > -1) {
                globs.push('index.csr.html');
            }
            if (e.deployMode.indexOf('htaccess') > -1) {
                globs.push('.htaccess');
            }
            if (globs.length > 0) {
                vfs.src(globs, { cwd: R734, buffer: true, })
                    .pipe(conn.dest('/'))
                    .pipe(map((file, cbb) => {
                        console.log(e.commonName + ' 🆙 ')
                        cbb();
                    }));
            }
        }
    })
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
    DeployFTPApplications,
);