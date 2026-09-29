import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './../auth.service';
import { TokenService } from '../../../core/services/token/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required, Validators.minLength(3)]],
      senha: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // Assume que o back-end retorna um objeto com a propriedade 'token'
          if (response && response.token) {
            this.tokenService.salvarToken(response.token);
            // Redireciona para o dashboard após o login (rota será criada futuramente)
            this.router.navigate(['/dashboard']); 
          }
        },
        error: (erro) => {
          console.error('Falha na autenticação HTTP:', erro);
          // O tratamento visual de erro (ex: mensagem vermelha na tela) será implementado aqui
        }
      });
    }
  }
}