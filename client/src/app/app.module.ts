import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServicesModule } from './services/services.module';
import { CoreModule } from './core/core.module';
import { ContextmenuModule } from './components/contextmenu/contextmenu.module';
import { PaginaErroComponent } from './views/pagina-erro/pagina-erro.component';
import { OrganizacaoService } from './services/organizacao.service';

@NgModule({
  declarations: [
    AppComponent,
    PaginaErroComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ServicesModule,
    ContextmenuModule.forRoot(),
    MonacoEditorModule.forRoot(),
    FontAwesomeModule, // use forRoot() in main app module only.
  ],
  providers: [
    provideClientHydration(),
    OrganizacaoService,
  ],
  bootstrap: [
    AppComponent,
  ]
})
export class AppModule { }
