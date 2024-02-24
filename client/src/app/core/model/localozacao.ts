export class Localizacao {
    private latitude?: any;
    private longitude?: any;
    private time?: any;
    constructor(localizacao: any) {
        this.latitude = localizacao.latitude;
        this.longitude = localizacao.longitude;
        this.time = new Date();
    }
}