import { generatePDF } from '../../scripts/generate_pdf.js';
import { scrollToBottom, scrollToTop } from '../../scripts/scrolls.js';
import { changeLanguage } from '../../scripts/language.js';
import {getAirDensity} from "../../scripts/get_air_density.js";

document.addEventListener("DOMContentLoaded", function() {
    const calculateBtn = document.getElementById("calculate-btn");
    calculateBtn.addEventListener("click", function(event) {
        event.preventDefault();
        calculateResults();
    });

    const pdfBtn = document.getElementById('pdf');
    pdfBtn.addEventListener("click", function(event) {
        event.preventDefault();
        generatePDFButtonHandler();
    });

    const linkBtn = document.getElementById('link');
    linkBtn.addEventListener("click", function(event) {
        event.preventDefault();
        generateLink();
    });

    const clearBtn = document.getElementById("clear");
    clearBtn.addEventListener("click", function(event) {
        event.preventDefault();
        clearInputs();
    });

    changeLanguage();
});

function calculateResults() {
    let t = parseFloat(document.getElementById('t').value) || 0;  // температура по Цельсию
    localStorage.setItem('thermophysical-air-properties-t', t);

    if (checkErrors(t)) {
        document.getElementById('results-loader').style.display = 'block';
        document.getElementById('results-container').style.display = 'none';
        scrollToBottom();

        let T = t + 273.15;  // Температура по Кельвину
        let ro = getAirDensity(t);  // Объемная плотность
        let mu = ((17.1625 + (0.0482102 * t) + ((-2.17419 / 100000) * Math.pow(t, 2)) + ((7.06065 / 1000000000) * Math.pow(t, 3))) / 1000000);  // Динамический коэффициент вязкости
        let Cp = ((1.00564 * 1000) + (7.43322 / 1000 * t) + (5.78429 / 10000 * Math.pow(t, 2)) + (5.87508 / 10000000 * Math.pow(t, 3)) + (1.81359 / 10000000000 * Math.pow(t, 4)));  // Удельная изобарная теплоемкость
        let lambda = (((2.41822) + (7.32841 / 1000 * t) + (-2.53698 / 1000000 * Math.pow(t, 2)) + (9.34274 / 10000000000 * Math.pow(t, 3))) / 100);  // Коэффициент теплопроводности
        let nu = (mu / ro);  // Кинематический коэффициент вязкости
        let beta = (1 / T);  // Коэффициент объемного расширения
        let alpha = (lambda / (Cp * ro));  // Коэффициент температуропроводности
        let Pr = (mu * Cp / lambda);  // Число Прандтля

        document.getElementById('T_result').value = T.toFixed(3) + ' K';
        document.getElementById('ro_result').value = ro.toFixed(3) + ' kg/m³';
        document.getElementById('mu_result').value = mu.toFixed(8) + ' Pa·s';
        document.getElementById('Cp_result').value = Cp.toFixed(8) + ' J/(kg·K)';
        document.getElementById('lambda_result').value = lambda.toFixed(8) + ' W/(m·K)';
        document.getElementById('nu_result').value = nu.toFixed(8) + ' m²/s';
        document.getElementById('beta_result').value = beta.toFixed(8) + ' 1/K';
        document.getElementById('alpha_result').value = alpha.toFixed(8) + ' m²/s';
        document.getElementById('Pr_result').value = Pr.toFixed(8);

        setTimeout(function() {
            document.getElementById('results-loader').style.display = 'none';
            document.getElementById('results-container').style.display = 'block';
            scrollToBottom();
        }, 1000);
    }
}

function checkErrors(t) {
    if (t < -73 || t > 1227) {
        window.alert("Calculation is valid for dry air at normal atmospheric pressure, in the temperature range: [-73°C;1227°C]");
        return false;
    } else {
        return true;
    }
}

function generatePDFButtonHandler() {
    const loadingOverlay = document.getElementById('pdf-loading');
    scrollToTop();
    loadingOverlay.classList.add('show');
    document.body.classList.add('no-scroll');

    let t = parseFloat(document.getElementById('t').value) || 0;  // температура по Цельсию
    let T = parseFloat(document.getElementById('T_result').value) || 0;  // Температура по Кельвину
    let ro = parseFloat(document.getElementById('ro_result').value) || 0;  // Объемная плотность
    let mu = parseFloat(document.getElementById('mu_result').value) || 0;  // Динамический коэффициент вязкости
    let Cp = parseFloat(document.getElementById('Cp_result').value) || 0;  // Удельная изобарная теплоемкость
    let lambda = parseFloat(document.getElementById('lambda_result').value) || 0;  // Коэффициент теплопроводности
    let nu = parseFloat(document.getElementById('nu_result').value) || 0;  // Кинематический коэффициент вязкости
    let beta = parseFloat(document.getElementById('beta_result').value) || 0;  // Коэффициент объемного расширения
    let alpha = parseFloat(document.getElementById('alpha_result').value) || 0;  // Коэффициент температуропроводности
    let Pr = parseFloat(document.getElementById('Pr_result').value) || 0;  // Число Прандтля

    var title1 = 'Calculation of Thermophysical Properties of Air';
    var title2 = 'Calculation Results';

    var input = `Temperature in Celsius: ${t.toFixed(2)} °C\n`;

    var output = `Temperature in Kelvin: ${T.toFixed(3)} K\n` +
        `Volume Density: ${ro.toFixed(8)} kg/m³\n` +
        `Dynamic Viscosity Coefficient: ${mu.toFixed(8)} Pa·s\n` +
        `Specific Heat Capacity at Constant Pressure: ${Cp.toFixed(8)} J/(kg·K)\n` +
        `Thermal Conductivity Coefficient: ${lambda.toFixed(8)} W/(m·K)\n` +
        `Kinematic Viscosity Coefficient: ${nu.toFixed(8)} m²/s\n` +
        `Volume Expansion Coefficient: ${beta.toFixed(8)} 1/K\n` +
        `Thermal Diffusivity Coefficient: ${alpha.toFixed(8)} m²/s\n` +
        `Prandtl Number: ${Pr.toFixed(8)}`;

    var footer = 'Calculation performed on buildpatrol.com.ua';
    var filename = "Thermophysical_Properties_of_Air_buildpatrol_com_ua.pdf";

    setTimeout(function() {
        generatePDF(title1, title2, input, output, footer, filename, 30, 45, 80, 95);
        loadingOverlay.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }, 2050);
}

function generateLink() {
    let t = parseFloat(document.getElementById('t').value) || 0;  // Температура по Цельсию

    let link_value = `${t}`;
    let encoded_link_value = window.btoa(link_value);
    encoded_link_value = encoded_link_value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const currentUrl = window.location.origin + '/en/thermophysical-air-properties/';

    let link = currentUrl + '#' + encoded_link_value;
    
    navigator.clipboard.writeText(link).then(function () {
        document.getElementById('link').style.backgroundImage = 'url("../../src/checkmark.png")';
        setTimeout(function() {
            document.getElementById('link').style.backgroundImage = 'url("../../src/link.png")';
        }, 500);
    }).catch(function (error) {
        console.error('Error in copying text: ', error);
    });
}

function checkLink() {
    const currentUrl = window.location.href;
    const encoded_input = currentUrl.split('#')[1];

    if (encoded_input && encoded_input.length > 0) {
        let decoded_input = encoded_input.replace(/-/g, '+').replace(/_/g, '/');

        while (decoded_input.length % 4) {
            decoded_input += '=';
        }

        try {
            decoded_input = window.atob(decoded_input);
            decoded_input = decoded_input.split('&');

            if (decoded_input.length === 1) {
                document.getElementById('t').value = decoded_input[0];

                calculateResults();
            }

            history.pushState({}, '', window.location.origin + '/en/thermophysical-air-properties/');
        } catch (error) {
            console.error('Error decoding the input:', error);
        }
    }
}

function loadValues() {
    document.getElementById('t').value = localStorage.getItem('thermophysical-air-properties-t');
}

function clearInputs() {
    document.getElementById('t').value = '';
}

window.onload = function() {
    loadValues();
    checkLink();
}
