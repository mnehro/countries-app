import { Country } from "./country.model";

export type Result = {
    error: boolean;
    msg: string;
    data: Country[]
};


export type PopulationResult = {
    error: boolean;
    msg: string;
    data: Country
};
