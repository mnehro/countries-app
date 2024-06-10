import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';
import { CountryService } from '../services/country.service';

addIcons({
  'heart': heart
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, NgFor],
})
export class HomePage implements OnInit {
  public letters: string[] = [];
  public isHomePage: boolean = true;
  public countries: any[] = [];
  public groupedCountries: any = {};


  constructor(private countryService: CountryService) { }

  ngOnInit(): void {
    this.countryService.getCountries().subscribe(result => {
      if (!result.error) {
        this.countries = result.data;
        this.groupCountries();
        this.createLetters();
      }
      console.log(this.groupedCountries);

      // this.sortCountries();
    });
  }
  private groupCountries(): void {
    this.countries.forEach(country => {
      const letter = country.name.charAt(0).toUpperCase();
      if (!this.groupedCountries[letter]) {
        this.groupedCountries[letter] = [];
      }

      if (country.iso3 !== 'ISR') {
        this.groupedCountries[letter].push(country);
      }
    });
  }
  createLetters() {
    this.letters = Object.keys(this.groupedCountries).sort();
  }

  public toggleView(): void {
    this.isHomePage = !this.isHomePage;
  }
  public viewMore(): void {
    console.log("population");

  }
  public onImageError(event: any) {
    event.target.src = 'assets/default-flag.png'; 
  }
}
