export type Country = {
    name: string;
    iso2: string;
    iso3: string;
    flag: string;
    population?: PopulationCount,
    populationCounts?: PopulationCount[]
};

export type PopulationCount = {
    value: number;
}


export type GroupedCountry = {
    [letter: string]: Country[];
}