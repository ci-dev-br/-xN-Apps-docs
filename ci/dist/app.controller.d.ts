export declare class AppController {
    root(): {
        message: string;
    };
    getLoginPage(): {
        year: number;
        title: string;
    };
    getRegisterPage(): {
        year: number;
        title: string;
    };
    getDashboard(): {
        user: {
            name: string;
            avatar: string;
        };
        systemStatus: {
            uptime: string;
            latency: string;
            activeModules: number;
            totalMemory: string;
        };
        modules: {
            name: string;
            version: string;
            status: string;
            ram: string;
            uptime: string;
        }[];
    };
}
