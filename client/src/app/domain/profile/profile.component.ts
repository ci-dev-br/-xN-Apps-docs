import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { PhotoService, User, UserService as UserApiService } from '@portal/api';
import { lastValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'ci-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnDestroy {
  profilePhotoUser?: SafeResourceUrl;
  obtendoFoto = false;
  @ViewChild('profileVideo')
  profileVideo?: ElementRef<HTMLVideoElement>;
  user = this.userService.user;
  editingField?: string;
  constructor(
    private readonly userService: UserService,
    private readonly userApiService: UserApiService,
    private readonly sanitizer: DomSanitizer,
    private readonly photoService: PhotoService,
  ) {
    this.user.subscribe(
      () =>
        this.loadPhoto()
    );
  }

  ngOnDestroy(): void {
    this.mediaStream?.getTracks()?.map(t => t.stop());
  }

  edit(toEdit: string) {
    if (!this.editingField) {
      this.editingField = toEdit;
    } else if (toEdit !== this.editingField) {
      this.editingField = undefined;
    } else {

    }
  }
  async change(event: FocusEvent | Event, propertyName: string) {
    if (event.target instanceof HTMLElement) {
      const el: HTMLElement = event.target;
      const { photo, ..._user } = this.user.value as User;
      if (_user) {
        _user.fullName = el.innerText;
        this.editingField = undefined;
        this.userService.identificarUsuario(
          { ...await lastValueFrom(this.userApiService.syncUser({ body: _user })), photo }
        );
      }
    }
  }
  private mediaStream?: MediaStream;
  async takePhoto() {
    if (!this.obtendoFoto) {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        const video = this.profileVideo?.nativeElement;
        if (video) {
          this.obtendoFoto = true;
          video.srcObject = this.mediaStream;
          // video.width = 140;
          // video.height = 140;
          video.play();
        }
      } catch (error) {
        console.log('Não há permissões para acessar a webcam')
      }
    } else {
      const video = this.profileVideo?.nativeElement;
      if (video) {
        const canvas = document.createElement('canvas');
        const w = video.videoWidth / 3;
        const h = video.videoHeight / 3;
        canvas.width = w;
        canvas.height = h;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = ''
          context.fillRect(w, h, canvas.width, canvas.height);
          context.drawImage(video, 0, 0, w, h);
          this.mediaStream?.getTracks()?.map(t => t.stop());
          const data = canvas.toDataURL("image/jpg");
          this.profilePhotoUser = this.sanitizer.bypassSecurityTrustResourceUrl(data);
          if (this.profilePhotoUser) this.saveProfilePhotoUser(data.split(',')[1]);
        }
        video.pause();
        video.srcObject = null;
        this.obtendoFoto = false;
      }
    }
  }
  private async loadPhoto() {
    if (this.user?.value?.photo?.originalFile) {
      const a: any = this.user?.value?.photo?.originalFile;
      this.profilePhotoUser = this.sanitizer.bypassSecurityTrustResourceUrl('data:image;base64,' + btoa(String.fromCharCode(...new Uint8Array(a.data))));
    }
  }
  private async saveProfilePhotoUser(data: string) {
    if (this.user.value) {
      if (!this.user?.value?.photo) this.user.value.photo = {};
      (this.user.value?.photo as any).originalFile = data;
      await lastValueFrom(this.photoService.syncPhoto({ body: this.user.value.photo }));
    }
  }
}