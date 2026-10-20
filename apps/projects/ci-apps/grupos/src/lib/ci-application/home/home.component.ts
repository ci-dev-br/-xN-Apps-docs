import { Component, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { GroupItem, GroupService } from '@ci/portal-api';
import { UserAuthenticationService } from '@ci/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'ci-grupos-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent implements OnInit {
  selectedTab = 0;
  termoBusca = '';
  grupos: GroupItem[] = [];
  meusGrupos: GroupItem[] = [];
  loading = false;
  loadingMeus = false;
  isLoggedIn = false;
  currentUserId?: string;

  constructor(
    private groupService: GroupService,
    private router: Router,
    private snackBar: MatSnackBar,
    @Optional() private userService?: UserAuthenticationService
  ) {}

  ngOnInit() {
    this.userService?.user.subscribe((u: any) => {
      this.isLoggedIn = !!u?.id;
      this.currentUserId = u?.id;
      if (this.isLoggedIn) {
        this.carregarMeusGrupos();
      }
    });

    this.carregarGrupos();
  }

  carregarGrupos() {
    this.loading = true;
    this.groupService.listarGrupos(this.termoBusca).subscribe({
      next: (res) => {
        this.grupos = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao listar grupos:', err);
        this.loading = false;
      }
    });
  }

  carregarMeusGrupos() {
    this.loadingMeus = true;
    this.groupService.meusGrupos().subscribe({
      next: (res) => {
        this.meusGrupos = res;
        this.loadingMeus = false;
      },
      error: (err) => {
        console.error('Erro ao carregar meus grupos:', err);
        this.loadingMeus = false;
      }
    });
  }

  onTabChange(index: number) {
    this.selectedTab = index;
    if (index === 0) {
      this.carregarGrupos();
    } else if (index === 1 && this.isLoggedIn) {
      this.carregarMeusGrupos();
    }
  }

  onBuscar() {
    this.carregarGrupos();
  }

  acessarGrupo(grupo: GroupItem) {
    this.router.navigate(['/Grupos', grupo.id]);
  }

  solicitarParticipacao(grupo: GroupItem, event?: Event) {
    event?.stopPropagation();
    if (!this.isLoggedIn) {
      this.snackBar.open('Faça login para participar de comunidades.', 'Ok', { duration: 3500 });
      return;
    }

    this.groupService.solicitarParticipacao(grupo.id).subscribe({
      next: (res) => {
        grupo.userStatus = (res.status === 'APPROVED' ? 'MEMBER' : 'PENDING');
        this.snackBar.open(res.message, 'Ok', { duration: 4000 });
        this.carregarMeusGrupos();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erro ao solicitar participação', 'Fechar', { duration: 3500 });
      }
    });
  }

  getGroupInitials(name?: string): string {
    if (!name) return 'GP';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
