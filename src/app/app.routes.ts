import { Routes } from '@angular/router';
import { Login } from './components/login/login'; 
import { ListComunity } from './components/list-comunity/list-comunity';
import { Home } from './components/home/home';
import { PersonList } from './components/person-list/person-list';
import { PersonForm } from './components/person-form/person-form';
import { CouncilList } from './components/council-list/council-list';
import { authGuard, publicGuard } from './guards/auth.guards'; 
import { CommitteeList } from './components/committee-list/committee-list';

export const routes: Routes = [
    
    { path: 'login', component: Login, canActivate: [publicGuard] },
    
    { path: 'home', component: Home, canActivate: [authGuard] },

    {   path: 'person', component: PersonList,
        canActivate: [authGuard],
        data: {roles: ['ADMINISTRADOR', 'LIDER DE COMUNA']} 
    },

    {    path: 'personForm',component: PersonForm,
        canActivate: [authGuard],
        data:{roles:['ADMINISTRADOR', 'LIDER DE COMUNA']} 
    },

    { path: 'comunity', component: ListComunity,
         canActivate: [authGuard],
        data:{roles:['ADMINISTRADOR', 'LIDER DE COMUNA', 'VOCERO']}
     },

    {   path: 'council', component: CouncilList,
         canActivate: [authGuard],
        data:{roles:['ADMINISTRADOR', 'LIDER DE COMUNA', 'VOCERO']}
    },
    
    { path: 'committee', component: CommitteeList,
         canActivate:[authGuard],
        data:{roles:['ADMINISTRADOR','LIDER DE COMUNA', 'VOCERO']}
    },
         
    
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' } 
];