import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
//import { AuthService } from './services/auth.service';


export enum UserRole {
  User = 'user',
  Admin = 'admin',
  Tablet = 'tablet',
}

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const claims = localStorage.getItem('claims');
    const id = localStorage.getItem('id');
    //const userRole = this.authService.getUserRole();//added
    const role = localStorage.getItem('role');
    
    const allowedRoles: UserRole[] | undefined = route.data['allowedRoles'];


    //console.log('Claims:', claims);
    //console.log('ID:', id);
    //console.log('Role:', role);
   // console.log('User Role from Storage:', role);
    //console.log('Expected Allowed Roles:', allowedRoles);

    if (claims && id && role) {
      //console.log('User has claims, id, and role');
      const userRole = role as UserRole;
      const allowedRoles = route.data['allowedRoles'] as UserRole[];
      
      if (allowedRoles.includes(userRole)) { 
        return true;
      } else {
        //console.log('Role not allowed, redirecting to access-denied');
        this.router.navigate(['/**']);
        return false;
      }
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
