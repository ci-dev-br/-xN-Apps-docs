import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { UserAuthenticationService } from '@ci/auth';
import { FileExplorerService, User } from '@ci/portal-api';
import { CardTerminalComponent } from './terminal.card';

describe('CardTerminalComponent', () => {
    let fixture: ComponentFixture<CardTerminalComponent>;
    let component: CardTerminalComponent;
    let user$: BehaviorSubject<User | undefined>;
    let fileExplorerSpy: jasmine.SpyObj<FileExplorerService> | any;

    beforeEach(async () => {
        user$ = new BehaviorSubject<User | undefined>(undefined);
        fileExplorerSpy = {
            myPermissions: jasmine.createSpy('myPermissions').and.returnValue(of({
                authorizedPaths: ['./apps'],
                permissions: [{ path: './apps', role: 'GRANT', status: 'GRANTED' }],
                pendingRequests: [],
            })),
            readDirectory: jasmine.createSpy('readDirectory').and.returnValue(of([
                { name: 'src', path: './apps/src', isDirectory: true, isFile: false },
                { name: 'README.md', path: './apps/README.md', isDirectory: false, isFile: true },
            ])),
            readFile: jasmine.createSpy('readFile').and.returnValue(of({
                path: './apps/README.md',
                data: 'Hello Terminal',
            })),
            requestPermission: jasmine.createSpy('requestPermission').and.returnValue(of({
                requested: true,
                path: './restricted',
                status: 'PENDING',
                emailsSent: 1,
                sysadminCount: 1,
                message: 'Solicitação enviada aos SYSADMINs.',
            })),
        };

        await TestBed.configureTestingModule({
            imports: [CardTerminalComponent],
            providers: [
                { provide: UserAuthenticationService, useValue: { user: user$ } },
                { provide: FileExplorerService, useValue: fileExplorerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CardTerminalComponent);
        component = fixture.componentInstance;
    });

    it('deve bloquear acesso para usuário sem role SYSADMIN', () => {
        user$.next({ id: 'u1', username: 'user1', roles: ['USER'] });
        fixture.detectChanges();

        expect(component.isSysAdmin).toBe(false);
        expect(component.isFolderAuthorized).toBe(false);
        expect(fileExplorerSpy.readDirectory).not.toHaveBeenCalled();
    });

    it('deve liberar terminal para usuário SYSADMIN com pasta autorizada no FileExplorerService', async () => {
        component.authorizedPath = './apps';
        user$.next({ id: 'sys1', username: 'admin', roles: ['SYSADMIN'] });
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.isSysAdmin).toBe(true);
        expect(component.isFolderAuthorized).toBe(true);
        expect(component.authorizedRoot).toBe('./apps');
        expect(fileExplorerSpy.readDirectory).toHaveBeenCalledWith({ body: { path: './apps' } });
    });

    it('deve permitir solicitar permissão quando a pasta não está autorizada', async () => {
        fileExplorerSpy.myPermissions.and.returnValue(of({
            authorizedPaths: [],
            permissions: [],
            pendingRequests: [],
        }));
        fileExplorerSpy.readDirectory.and.returnValue(of(null));

        component.authorizedPath = './restricted';
        user$.next({ id: 'sys1', username: 'admin', roles: ['SYSADMIN'] });
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.isSysAdmin).toBe(true);
        expect(component.isFolderAuthorized).toBe(false);

        await component.solicitarPermissao();
        expect(fileExplorerSpy.requestPermission).toHaveBeenCalledWith({
            path: './restricted',
            reason: 'Solicitação via TerminalCard (SYSADMIN)',
        });
        expect(component.requestFeedback).toContain('Solicitação enviada');
    });
});
