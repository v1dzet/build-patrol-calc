export function getAirDensity(temperature) {
    let T = temperature + 273.15;
    return (353.089 / T);
}