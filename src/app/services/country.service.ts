import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PopulationResult, Result } from '../models/result.model';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private baseUrl = 'https://countriesnow.space/api/v0.1/countries';

  constructor(private http: HttpClient) { }

  getCountries(): Observable<Result> {
    return this.http.get<Result>(`${this.baseUrl}/flag/images`);
  }
  getSingleCountryPopulation(countryISO3: string): Observable<PopulationResult> {
    return this.http.post<PopulationResult>(`${this.baseUrl}/population`, {
      iso3: countryISO3
    });
  }

}
