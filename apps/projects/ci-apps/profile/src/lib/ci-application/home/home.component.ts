import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { InputModule } from '@ci/components';
import { CoreModule, DaoService, IChangeable } from '@ci/core';
import { User, UserService } from '@ci/portal-api';
import { AuthModule, AuthUserService as AuthUserService } from '@ci/auth';
import { lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
export interface IResume {
    title?: string;
    description?: string;
}
@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CoreModule,
        InputModule,
        MatCardModule,
        ReactiveFormsModule,
        AuthModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        RouterModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
    protected user?: User;
    protected profileImage?: string;
    form: FormGroup = this.formBuilder.group({
        fullName: [],
        email: [],
        emailVerificado: [],
        id: [],
        permission: [],
        phone: [],
        photo: [],
        refreshToken: [],
        roles: [],
        tenants: [],
        username: [],
        surname: [],
    })
    protected resumes?: IResume[];
    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly daos: DaoService,
        private readonly userService: UserService,
        private readonly authUserService: AuthUserService,
    ) { }
    ngOnInit(): void {
        this.authUserService.user.subscribe(user => { this.hasUser(user || undefined) })
    }
    hasUser(user?: User) {
        if (!!user) {
            if (this.user?.photo && this.user?.photo.format) {
                this.profileImage = this.user.photo.format! + 'base64,' + this.user.photo.originalFile;
            }
            // TODO: separar bloco
            this.daos.prepareToEdit(user);
            this.daos.bindDataForm(user, this.form);
            this.daos.confirmation(user)?.subscribe(async data => {
                try {
                    if (user && data) {
                        let _data: any = Object.assign(user,
                            await lastValueFrom(this.userService.sync({ body: user }))
                        );
                        delete (_data as IChangeable).__pre;
                        this.daos.prepareToEdit(_data);
                        this.daos.bindDataForm(_data, this.form);
                        this.user = _data;
                    }
                } catch (error) {
                    console.trace(error);
                }
            });

            this.user = user;
        } else {
            this.user = undefined;
        }
    }
    async saveProfile() {
        if (this.user && this.form.valid) {
            await this.daos.confirmChanges(this.user);
        } else {
            this.form.markAllAsTouched();
        }
    }
    /**
     * Take photo from webcam
     */
    async takeAPhoto() {
        this.retakePhoto();
    }
    /**
     * Upload a local image/photo file
     */
    async uploadPhoto() {
        // TODO: take a local file
    }
    @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
    @ViewChild('canvasElement') canvasElement?: ElementRef<HTMLCanvasElement>;
    videoStream: MediaStream | null = null;
    capturedImage: string | null = null;
    isCameraActive = false;
    // Inicia a webcam
    async startCamera() {
        this.isCameraActive = true;
        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 400, height: 400 } // Define a resolução preferida
            });
            const video = this.videoElement?.nativeElement;
            if (!video) throw new Error('Falha ao montar')
            video.srcObject = this.videoStream;
            video.play();
            this.capturedImage = null; // Limpa a foto anterior, se houver
        } catch (error) {
            console.error('Erro ao acessar a webcam: ', error);
            alert('Não foi possível acessar a câmera. Verifique as permissões.');
        }
    }
    // Captura o frame atual do vídeo
    capturePhoto() {
        if (!this.isCameraActive) return;
        const video = this.videoElement?.nativeElement;
        if (!video) throw new Error('Falha ao montar');
        const canvas = this.canvasElement?.nativeElement;
        if (!canvas) throw new Error('Falha ao montar');
        const context = canvas.getContext('2d');
        if (context) {
            // Ajusta o tamanho do canvas para o tamanho do vídeo
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            // Desenha o frame atual no canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Converte o canvas para uma imagem Base64 (formato JPEG)
            this.capturedImage = canvas.toDataURL('image/jpeg');
            this.profileImage = this.capturedImage;
            this.form.get('photo')?.setValue({
                format: this.capturedImage.split('base64,')[0],
                originalFile: this.capturedImage.split('base64,')[1],
            });
            // Opcional: Desliga a câmera após tirar a foto
            this.stopCamera();
        }
    }
    // Encerra a transmissão e desliga a webcam
    stopCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        this.isCameraActive = false;
    }
    // Remove a foto capturada
    retakePhoto() {
        this.isCameraActive = false;
        this.capturedImage = null;
        this.startCamera();
    }
    // Garante que a câmera seja desligada se o componente for destruído (ex: navegação)
    ngOnDestroy() {
        this.stopCamera();
    }
}
