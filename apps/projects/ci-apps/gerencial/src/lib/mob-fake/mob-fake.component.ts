import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export class InnerService {
  status: 'offline' | 'online' | 'connecting' = 'offline';
  deviceConnection: any;
  mem: any = {};
  constructor(private url: String) { }
  async conectar(http: HttpClient) {
    try {
      this.status = 'connecting';
      this.deviceConnection = await lastValueFrom(
        http.post(this.url + 'Device/Connect', {
          id: 'F0:F0:F0:F0:00:D1',
          name: 'Fake',
          applicationId: 'd88bf688-c885-4a7d-86d9-b2c84037ec52'
        }));
      this.status = 'online';
    } catch (error) {
      this.status = 'offline';
    }
  }
  async Pool(http: HttpClient) {
    let pool = await lastValueFrom(http.post<any>(this.url + 'Device/Pool', {
      id: this.deviceConnection.id
    }));
    this.readPool(pool);
    return pool;
  }
  async readPool(pool: any) {
    Object.assign(this.mem, pool);
  }
}

@Component({
  selector: 'ci-mob-fake',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './mob-fake.component.html',
  styleUrl: './mob-fake.component.scss'
})
export class MobFakeComponent implements OnDestroy {
  private previous_title = document.title;
  form: FormGroup = this.fb.group({
    url: ['https://apps.ci.dev.br:446/', [Validators.required, Validators.max(512)]]
  });
  services?: InnerService[];
  // service?: FakeService;
  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpClient,
  ) {
    document.title = '[Fake] Mobile'
  }
  ngOnDestroy(): void {
    document.title = this.previous_title;
  }
  status: 'off-line' | 'online' | 'conectando' = 'off-line';
  async conectar() {
    if (this.status === 'off-line')
      this.status = 'conectando';

    const service = new InnerService(this.form.get('url')?.value);
    this.addService(service);
    await service.conectar(this.http);
  }
  addService(service: InnerService) {
    if (!this.services) this.services = [];
    this.services.push(service);
  }
  disconnect(service: InnerService) {
    service.status = 'offline';
  }
  connect(service: InnerService) {
    service.status = 'online';

    const ever = async () => {
      if (service.status === 'online') {
        try {
          await service.Pool(this.http);
          if (service.status !== 'online')
            service.status = 'online';
        } catch (error) {
          service.status = 'offline';
        }
      }
      setTimeout(() => {
        ever();
      }, 250);
    }
    ever();
  }
  remove(service: InnerService) {
    let pos = (this.services ?? []).indexOf(service);
    if (pos > -1) {
      this.disconnect(service);
      this.services?.splice(pos, 1);
    }
  }
}
