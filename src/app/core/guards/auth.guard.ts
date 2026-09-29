import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token/token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.possuiToken()) {
    return true; // Permite o acesso à rota
  }

  // Bloqueia e redireciona para o login
  router.navigate(['/login']);
  return false;
};