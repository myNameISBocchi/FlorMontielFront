import { Routes } from '@angular/router';
import { Login } from './components/login/login'; 
import { ListComunity } from './components/list-comunity/list-comunity';
import { Home } from './components/home/home';
import { PersonList } from './components/person-list/person-list';
import { PersonForm } from './components/person-form/person-form';
import { CouncilList } from './components/council-list/council-list';
import { authGuard, publicGuard, hasPrivilege } from './guards/auth.guards'; 
import { CommitteeList } from './components/committee-list/committee-list';
import { Role } from './components/role/role';
import { Privilege } from './components/privilege/privilege';
import { RolePrivilege } from './components/role-privilege/role-privilege';
import { CountryList } from './components/country-list/country-list';
import { StateList } from './components/state-list/state-list';
import { CityList } from './components/city-list/city-list';

export const routes: Routes = [
    
    { path: 'login', component: Login, canActivate: [publicGuard] },
    
    { path: 'home', component: Home, canActivate: [authGuard] },

    { path: 'person', component: PersonList,
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'peoples.index'} 
    },

    { path: 'personForm', component: PersonForm,
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'peoples.store'} 
    },

    { path: 'comunity', component: ListComunity,
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'comunities.index'}
    },

    { path: 'council', component: CouncilList,
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'councils.index'}
    },
    
    { path: 'committee', component: CommitteeList,
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'committees.index'}
    },
    
    { 
        path: 'admin/roles', 
        component: Role, 
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'roles.index'}
    },
    { 
        path: 'admin/privileges', 
        component: Privilege, 
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'privileges.index'}
    },
    { 
        path: 'admin/role-privileges', 
        component: RolePrivilege, 
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'role_privileges.index'}
    },
    
    { 
        path: 'countries', 
        component: CountryList, 
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'countries.index'}
    },
    { 
        path: 'states', 
        component: StateList, 
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'states.index'}
    },
    { 
        path: 'cities', 
        component: CityList, 
        canActivate: [authGuard, hasPrivilege],
        data: {privilege: 'cities.index'}
    },
    
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' } 
];