import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Photo, PhotoService, User, UserService as UserApiService } from '@portal/api';
import { lastValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MD5 } from 'crypto-js';

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
        let w = video.videoWidth;
        let h = video.videoHeight;

        canvas.width = w;
        canvas.height = h;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '';
          context.fillRect(w, h, canvas.width, canvas.height);
          context.drawImage(video, 0, 0, w, h);
          this.mediaStream?.getTracks()?.map(t => t.stop());
          const data = canvas.toDataURL("image/jpeg", 1.0);
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
      const u8 = new Uint8Array((this.user?.value?.photo?.originalFile as any).data);
      this.profilePhotoUser = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' +
        btoa(this.Uint8ToString(u8))
      )
    }
  }
  private Uint8ToString(u8a: any) {
    var CHUNK_SZ = 0x8000;
    var c = [];
    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return c.join("");
  }
  private async saveProfilePhotoUser(data: string) {
    if (this.user.value) {
      // data;
      const buffer_size = 100000;
      const data_hash_md5 = MD5(data).toString();
      const total_parts = Math.ceil(data.length / buffer_size);
      let photo_result: Photo | undefined;
      for (let index = 0; index < total_parts; index++) {
        const data_part = data.substring(index * buffer_size, index * buffer_size + buffer_size);
        const data_part_md5 = MD5(data_part).toString();
        const part = index;

        const r = await lastValueFrom(this.photoService.sendPartPhoto({
          body: {
            currentPart: part,
            md5Part: data_part_md5,
            md5Full: data_hash_md5,
            TotalParts: total_parts,
            partialBase64: data_part
          }
        }));
        if (!!r) photo_result = r;
      }
      if (photo_result !== undefined) await lastValueFrom(this.userApiService.syncUser({ body: { id: this.user.value.id, photo: { internalId: photo_result.internalId } } }));
    }
  }
}