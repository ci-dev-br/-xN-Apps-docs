export class X509KeyInfoProvider {
    private certificatePem: string;

    constructor(certificatePem: string) {
        this.certificatePem = certificatePem;
    }

    getKeyInfo(key: any, prefix: string): string {
        prefix = prefix ? prefix + ':' : '';
        // Remove os cabeçalhos do PEM para deixar apenas o Base64 puro exigido pela SEFAZ
        const certB64 = this.certificatePem
            .replace('-----BEGIN CERTIFICATE-----', '')
            .replace('-----END CERTIFICATE-----', '')
            .replace(/[\r\n]/g, '');

        return `<${prefix}X509Data><${prefix}X509Certificate>${certB64}</${prefix}X509Certificate></${prefix}X509Data>`;
    }

    getKey(): any {
        return this.certificatePem;
    }
}