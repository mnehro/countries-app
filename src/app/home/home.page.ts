import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForward, heart, heartOutline, trash, trashOutline } from 'ionicons/icons';
import { CountryService } from '../services/country.service';
import { Country, GroupedCountry } from '../models/country.model';


addIcons({
  'heart': heart,
  'heart-outline': heartOutline,
  'trash': trash,
  'trash-outline': trashOutline,
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
  letters: string[] = [];

  countries: Country[] = [];
  baseCountries: Country[] = [];
  favourites: Country[] = [];

  groupedCountries: GroupedCountry = {};
  baseBackupGroupedCountries: GroupedCountry = {};

  isHomePage: boolean = true;
  isLoading: boolean = false;
  isLoaded: boolean = false;

  loadingItem: Country | null = null;
  loadedItem: Country | null = null;


  constructor(private countryService: CountryService) { }

  ngOnInit(): void {
    this.countryService.getCountries().subscribe(result => {
      if (!result.error) {
        this.countries = result.data;
        this.baseCountries = result.data;
        this.groupCountries();
        this.createLetters();
      }
    });
    this.baseBackupGroupedCountries = this.groupedCountries;
    this.loadFavourites();
  }
  private loadFavourites() {
    const storedFavourites = localStorage.getItem('favourites');
    if (storedFavourites) {
      this.favourites = JSON.parse(storedFavourites);
    }
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

  toggleView(): void {
    this.isHomePage = !this.isHomePage;
    if (!this.isHomePage) {
      this.groupedCountries = {};
      this.countries = this.favourites;
      this.groupCountries();
    } else {
      this.groupedCountries = this.baseBackupGroupedCountries;
    }
    this.createLetters();
  }

  viewMore(item: Country): void {
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
            value: 0
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
  onImageError(event: any): void {
    event.target.src = 'assets/default-flag.png';
  }

  onItemDrag(event: any, item: Country): void {
    const side: string = event.detail.side;
    if (side === 'end') {
      this.favourites = this.favourites.filter(c => c !== item);
      if (!this.isHomePage) {
        this.groupedCountries = {};
        this.countries = this.favourites;
        this.groupCountries();
      }
    } else if (side === 'start') {
      if (!this.favourites.includes(item))
        this.favourites.push(item);
    }
    localStorage.setItem('favourites', JSON.stringify(this.favourites));

  }
  scrollToLetter(letter: string): void {
    const el = document.getElementById(letter);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
  filterCountries(event: any): void {
    const query: string = event?.target?.value?.toLowerCase();

    if (query && query.trim() !== '') {
      this.groupedCountries = {};
      this.countries = this.baseCountries.filter(country => country.name.toLowerCase().indexOf(query) > -1);
      this.groupCountries();
    } else {
      this.groupedCountries = this.baseBackupGroupedCountries;
    }
    this.createLetters();
  }

}
