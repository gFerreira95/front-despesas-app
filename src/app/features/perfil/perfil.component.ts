import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
// Importação corrigida com base na sua imagem
import { UsuarioService, Perfil } from '../../core/services/usuario/usuario.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);

  perfilForm!: FormGroup;
  fotoPreview: string | null = null;
  isLoading = false;
  gastosAtuaisMensais = 0; 

  ngOnInit(): void {
    this.perfilForm = this.fb.group({
      rendaMensalBruta: [0, [Validators.required, Validators.min(0)]],
      limiteGastos: [0, [Validators.required, Validators.min(0)]],
      fotoPerfilBase64: [null]
    });

    this.carregarPerfil();
  }

  carregarPerfil(): void {
    this.usuarioService.buscarPerfil().subscribe({
      next: (dados: Perfil) => {
        this.perfilForm.patchValue({
          rendaMensalBruta: dados.rendaMensalBruta,
          limiteGastos: dados.limiteGastos,
          fotoPerfilBase64: dados.fotoPerfilBase64
        });
        
        if (dados.fotoPerfilBase64) {
          this.fotoPreview = dados.fotoPerfilBase64;
        }
      },
      error: (err) => console.error('Erro ao carregar perfil:', err)
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.fotoPreview = base64String;
        this.perfilForm.patchValue({ fotoPerfilBase64: base64String });
      };
      reader.readAsDataURL(file);
    }
  }

  get percentualGasto(): number {
    const limite = this.perfilForm.get('limiteGastos')?.value;
    if (!limite || limite === 0) return 0;
    return Math.min((this.gastosAtuaisMensais / limite) * 100, 100);
  }

  get alertaLimite(): boolean {
    return this.percentualGasto >= 85; 
  }

  salvarPerfil(): void {
    if (this.perfilForm.invalid) return;
    
    this.isLoading = true;
    this.usuarioService.atualizarPerfil(this.perfilForm.value)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => alert('Perfil atualizado com sucesso!'),
        error: (err) => console.error('Erro ao salvar perfil:', err)
      });
  }
}