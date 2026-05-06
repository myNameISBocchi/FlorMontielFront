import { Routes } from '@angular/router';
import { Login } from './components/login/login'; 
import { ListComunity } from './components/list-comunity/list-comunity';
import { Home } from './components/home/home';
import { PersonList } from './components/person-list/person-list';
import { PersonForm } from './components/person-form/person-form';


import { authGuard, publicGuard } from './guards/auth.guards'; 

export const routes: Routes = [
    
    { path: 'login', component: Login, canActivate: [publicGuard] },
    
    { path: 'home', component: Home, canActivate: [authGuard] },
    { path: 'person', component: PersonList, canActivate: [authGuard] },
    { path: 'personForm', component: PersonForm, canActivate: [authGuard] },
    { path: 'comunity', component: ListComunity, canActivate: [authGuard] },
    
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' } 
];