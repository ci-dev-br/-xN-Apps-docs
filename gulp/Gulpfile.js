const { src, dest, parallel, series } = require('gulp');
const { execSync } = require('child_process');
require('dotenv').config();
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
    if (!!R734 && !!R348) src(R734 + '**').pipe(dest(R348, { overwrite: true }));
    cb();
}

// Deploy FTP's application
function DeployFTPApplications(cb) {
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