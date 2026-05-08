import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Council } from '../../services/council';


@Component({
  selector: 'app-council-list',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './council-list.html',
  styleUrl: './council-list.css',
})
export class CouncilList {
  councils:any = [];
  councilSelect:any = null;

  constructor(private council:Council){}

  ngOnit(){
    this.getCouncils();
  }

  getCouncils(){
    this.council.findAll().subscribe((res:any) => {
      this.councils = res.results;
    });
  }

  createCouncils(event:any){
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      councilName: formData.get('councilName'),
      comunityId: formData.get('comunityId'),
      cityId: formData.get('cityId'),
      googleMaps:formData.get('googleMaps')
    };

    this.council.create(data).subscribe((res:any)=>{
      this.getCouncils();
      event.target.reset();
    });
  }

  
}
