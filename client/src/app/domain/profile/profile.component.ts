import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { UserService as UserApiService } from '@portal/api';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'ci-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  user = this.userService.user;
  editingField?: string;
  constructor(
    private readonly userService: UserService,
    private readonly userApiService: UserApiService
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