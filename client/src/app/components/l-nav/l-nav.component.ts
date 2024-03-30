import { Component, HostListener, Optional } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, ChildActivationEnd, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { lastValueFrom } from 'rxjs';
import { Application, CpuInfo, SystemService, Tenant } from '@portal/api';
import { ApplicationService } from '@portal/api';
import { ServicesService } from 'src/app/core/services/services.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { OrganizacaoService } from 'src/app/services/organizacao.service';

interface IBreadcrumb {
  name?: string;
}

@Component({
  selector: 'ci-l-nav',
  templateUrl: './l-nav.component.html',
  styleUrls: ['./l-nav.component.scss']
})
export class LNavComponent {
  apps?: Application[];
  icon?: string;
  title?: string;
  breadcrumb?: IBreadcrumb[];
  $user = this.userService.user;
  tenants?: Tenant[];
  cpuStatus?: any[];
  get appsGlobal() { return this.apps?.filter(i => i.menuGroupName === 'global') }
  get appsUser() { return this.apps?.filter(i => i.menuGroupName === 'user') }
  userPhoto?: SafeResourceUrl;
  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly applicationService: ApplicationService,
    /// private readonly http: HttpClient,
    public readonly services: ServicesService,
    private readonly sanitizer: DomSanitizer,
    private readonly system: SystemService,
    @Optional()
    private readonly organizacaoService?: OrganizacaoService,
  ) {
    this.load();
    router.events.subscribe((event: any) => {
      if (
        (
          event instanceof ActivationEnd ||
          event instanceof ChildActivationEnd
        )
        && event && event.snapshot instanceof ActivatedRouteSnapshot &&
        event?.snapshot?.data) {
        const data: { name?: string, icon?: string } = event.snapshot.data;
        if (data && 'name' in data) {
          if (!this.breadcrumb) this.breadcrumb = [];

          if (data.name) this.title = data.name;
          if (data.icon) this.icon = data.icon;

          if (!!this.breadcrumb.find(b => b.name === data.name)) return;
          this.breadcrumb = [{
            name: data.name
          }, ...this.breadcrumb];
        }
      }
    });
    userService.user.subscribe(user => {
      if (user?.photo?.originalFile) {
        const u8 = new Uint8Array((user?.photo?.originalFile as any).data);
        this.userPhoto = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' +
          btoa(this.Uint8ToString(u8))
        );
      }
    })
  }
  private async updateCpuInfo() {
    try {
      const cpu_infos = (await lastValueFrom(this.system.systemLeitura()));
      const x: any = {};
      x['user'] = { name: 'User', series: [] };
      x['system'] = { name: 'System', series: [] };
      x['heapTotal'] = { name: 'heapTotal', series: [] };
      x['heapUsed'] = { name: 'heapUsed', series: [] };
      x['rss'] = { name: 'rss', series: [] };
      x['external'] = { name: 'external', series: [] };
      cpu_infos.forEach(i => {
        x['user'].series.push({
          "value": i.user,
          "name": i.moment,
        },);
        x['system'].series.push({
          "value": i.system,
          "name": i.moment,
        },);
        x['heapTotal'].series.push({
          "value": i.heapTotal,
          "name": i.moment,
        },);
        x['heapUsed'].series.push({
          "value": i.heapUsed,
          "name": i.moment,
        },);
        x['rss'].series.push({
          "value": i.rss,
          "name": i.moment,
        },);
        x['external'].series.push({
          "value": i.external,
          "name": i.moment,
        },);
      });
      this.cpuStatus = [...Object.values(x)];
    } catch (error) {
      console.error(error);
    }
    setTimeout(() => this.updateCpuInfo(), 1000);
  }
  private Uint8ToString(u8a: any) {
    var CHUNK_SZ = 0x8000;
    var c = [];
    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return c.join("");
  }

  load() {
    (async () => {
      //try {
      this.apps = await lastValueFrom(this.applicationService.get({ body: { all: false } }))
      //} catch (error) {
      //  console.error(error);
      //  throw error;
      //}
    })();
    this.loadStatus();
    if (this.$user.value?.tenants) this.tenants = this.$user.value?.tenants;
    // this.updateCpuInfo();
  }
  sair() {
    this.userService.sair();
  }
  status_services: any = {};
  loadStatus() {
    // Ignorado até resolver https da aplicação de Check Health

    // this.http.get(`https://apps.ci.dev.br:7684/json`).subscribe(v => {
    // this.status_services = v;
    // });
    // setTimeout(() => this.loadStatus(), 10000);
  }

  @HostListener('window:wheel', ['$event'])
  fixarAoTopo(event: WheelEvent) {
    /* if (event.offsetY === 0) {
      this.of(document.getElementsByTagName('ci-l-nav')).forEach(e => {
        e.style.position = 'unset';
        e.style.top = 'unset';
      })
    } else {
      this.of(document.getElementsByTagName('ci-l-nav')).forEach(e => {
        e.style.position = 'sticky';
        e.style.top = '0px';
        e.style.zIndex = '99';
      })
    } */
  }
  private of(el: HTMLCollectionOf<any>) {
    const r = [];
    for (let index = 0; index < el.length; index++) {
      const element = el.item(index);
      r.push(element);
    }
    return r;
  }
  action(crumb: any) {
    console.log(crumb);
  }
}
