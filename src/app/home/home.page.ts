import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForward, heart } from 'ionicons/icons';
import { CountryService } from '../services/country.service';
import { Country, GroupedCountry } from '../models/country.model';


addIcons({
  'heart': heart,
  'arrow-forward': arrowForward
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage implements OnInit {
  public letters: string[] = [];

  public countries: Country[] = [];
  public groupedCountries: GroupedCountry = {};

  public isHomePage: boolean = true;
  public isLoading: boolean = false;
  public isLoaded: boolean = false;

  public loadingItem: Country | null = null;
  public loadedItem: Country | null = null;


  constructor(private countryService: CountryService) { }

  ngOnInit(): void {
    this.countryService.getCountries().subscribe(result => {
      if (!result.error) {
        this.countries = result.data;
        this.groupCountries();
        this.createLetters();
      }
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

  public viewMore(item: Country): void {
    this.loadingItem = item;
    this.isLoading = true;

    let cachedData = localStorage.getItem(`population_${item.iso3}`);

    if (cachedData) {
      item.population = JSON.parse(cachedData);
      this.isLoading = false;
      this.isLoaded = true;
      this.loadedItem = item;
    } else {
      this.countryService.getSingleCountryPopulation(item.iso3).subscribe({
        next: (result) => {
          if (!result.error) {
            item.population = result.data.populationCounts?.slice(-1)[0];
            localStorage.setItem(`population_${item.iso3}`, JSON.stringify(result.data.populationCounts?.slice(-1)[0]));
            this.loadedItem = item;
          }
        },
        error: (e) => {
          console.error('Error fetching population', e);
          item.population = {
            value : 0
          };
          this.isLoaded = true
          this.isLoading = false;
          this.loadedItem = item;
        },
        complete: () => {
          this.isLoaded = true;
          this.isLoading = false;
          this.loadingItem = null;
        }
      });
    }
  }
  public onImageError(event: any) {
    event.target.src = 'assets/default-flag.png';
  }
}
