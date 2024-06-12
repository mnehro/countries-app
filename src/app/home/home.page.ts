import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonSearchbar } from '@ionic/angular';
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
  imports: [IonicModule, CommonModule]
})
export class HomePage implements OnInit {
  @ViewChild('searchBar', { static: false }) searchBar!: IonSearchbar;

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
    this.loadCountries();
    this.loadFavourites();
  }

  private loadCountries(): void {
    this.countryService.getCountries().subscribe(result => {
      if (!result.error) {
        this.countries = result.data;
        this.baseCountries = result.data;
        this.groupCountries();
        this.createLetters();
        this.baseBackupGroupedCountries = { ...this.groupedCountries };
      }
    });
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

  private createLetters() {
    this.letters = Object.keys(this.groupedCountries).sort();
  }

  private updatedLoadingState(item: Country): void {
    this.isLoaded = true;
    this.isLoading = false;
    this.loadedItem = item;
    this.loadingItem = null;
  }

  private addToFavorites(item: Country): void {
    if (!this.favourites.includes(item))
      this.favourites.push(item);
  }

  private removeFromFavorites(item: Country): void {
    this.favourites = this.favourites.filter(c => c !== item);
  }

  private updateView(): void {
    if (!this.isHomePage) {
      this.groupedCountries = {};
      this.countries = this.favourites;
      this.groupCountries();
      this.createLetters();
    } else {
      this.groupedCountries = this.baseBackupGroupedCountries;
    }
  }

  filterCountries(searchBarValue: string | undefined | null): void {
    const query = searchBarValue?.toLowerCase().trim();
    if (query && query !== '') {
      this.groupedCountries = {};
      this.countries = this.isHomePage ? this.baseCountries.filter(country => country.name.toLowerCase().indexOf(query) > -1)
        : this.favourites.filter(country => country.name.toLowerCase().indexOf(query) > -1);
      this.groupCountries();
    } else {
      this.updateView();
    }
    this.createLetters();
  }

  toggleView(): void {
    this.isHomePage = !this.isHomePage;
    this.filterCountries(this.searchBar.value);
  }

  viewMore(item: Country): void {
    this.loadingItem = item;
    this.isLoading = true;

    const cachedData = localStorage.getItem(`population_${item.iso3}`);
    if (cachedData) {
      item.population = JSON.parse(cachedData);
      this.updatedLoadingState(item);
    } else {
      this.countryService.getSingleCountryPopulation(item.iso3).subscribe({
        next: (result) => {
          if (!result.error) {
            item.population = result.data.populationCounts?.slice(-1)[0];
            localStorage.setItem(`population_${item.iso3}`, JSON.stringify(result.data.populationCounts?.slice(-1)[0]));
            this.updatedLoadingState(item);
          }
        },
        error: () => {
          item.population = { value: 0 };
          this.updatedLoadingState(item);
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
      this.removeFromFavorites(item);
      this.updateView();
    } else if (side === 'start') {
      this.addToFavorites(item);
    }
    this.filterCountries(this.searchBar.value);
    localStorage.setItem('favourites', JSON.stringify(this.favourites));
  }

  scrollToLetter(letter: string): void {
    const el = document.getElementById(letter);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
