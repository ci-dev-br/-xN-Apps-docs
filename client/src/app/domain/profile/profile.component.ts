import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { UserService as UserApiService } from '@portal/api';
import { lastValueFrom } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ci-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  profilePhotoUser?: any;
  obtendoFoto = false;
  @ViewChild('profileVideo')
  profileVideo?: ElementRef<HTMLVideoElement>;
  user = this.userService.user;
  editingField?: string;
  constructor(
    private readonly userService: UserService,
    private readonly userApiService: UserApiService,
    private readonly sanitizer: DomSanitizer,
  ) { }

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
      const _user = this.user.value;
      if (_user) {
        _user.fullName = el.innerText;
        this.editingField = undefined;

        this.userService.identificarUsuario(
          await lastValueFrom(this.userApiService.syncUser({ body: _user }))
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
          video.width = 140;
          video.height = 140;
          video.play();
        }
      } catch (error) {
        console.log('Não há permissões para acessar a webcam')
      }
    } else {
      const video = this.profileVideo?.nativeElement;
      if (video) {
        const canvas = document.createElement('canvas');
        canvas.width = 140;
        canvas.height = 140;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = ''
          context.fillRect(140, 140, canvas.width, canvas.height);
          context.drawImage(video, 0, 0, 140, 140);
          const data = canvas.toDataURL("image/png");
          // console.log(data);
          this.profilePhotoUser = this.sanitizer.bypassSecurityTrustResourceUrl(data);
        }
        video.src = '';
        this.obtendoFoto = false;
      }
    }
  }
}
/* email
fullName
id
password
permission
phone
refreshToken
roles
username */