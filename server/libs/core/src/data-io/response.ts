export const response = async (call: () => Promise<any>, request?: any) => {
    // TODO: Implement a more robust error handling and logging mechanism here
    // TODO: Implementar mecanismo de contabilização de tempo de processamento por usuário, para fins de auditoria e cobrança de uso da plataforma.
    // TODO: Gerar cobrança e verificar validade de uso da plataforma, para fins de auditoria e cobrança de uso da plataforma.
    return await new Promise((resolve, reject) => {
        call().then((result) => {
            resolve({ success: true, data: result });
        }).catch((error) => {
            resolve({
                success: false,
                error: error.message || error,
                errorStack: error.stack || null,
                errorName: error.name || null,
                errorCode: error.code || null,
                errorStatus: error.status || null,
                errorResponse: error.response || null,
            });
        });
    });
}