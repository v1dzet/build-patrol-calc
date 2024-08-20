

import { getWaterDensity } from '../../scripts/get_water_density.js';
import { generatePDF } from '../../scripts/generate_pdf.js';
import { scrollToBottom, scrollToTop } from '../../scripts/scrolls.js';
import { changeLanguage } from '../../scripts/language.js';


document.addEventListener("DOMContentLoaded", function() {
    const inputElement1 = document.getElementById('tnv');
    const inputElement2 = document.getElementById('tpv');
    const outputElement1 = document.getElementById('air-density-tnv');
    const outputElement2 = document.getElementById('air-density-tpv');

    inputElement1.addEventListener('input', (event) => {
        var result = (353.089/(parseFloat(inputElement1.value)+273.15)).toFixed(3);

        if(isNaN(result)){
            outputElement1.value = "Air Density";
        }
        else{
            outputElement1.value = `ρ = ${result} kg/m3`;
        }

    });

    inputElement2.addEventListener('input', (event) => {
        var result = (353.089/(parseFloat(inputElement2.value)+273.15)).toFixed(3);

        if(isNaN(result)){
            outputElement2.value = "Air Density";
        }
        else{
            outputElement2.value = `ρ = ${result} kg/m3`;
        }
    });

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

    const c = 1/3600;   // coefficient for calculation

    let tnv = parseFloat(document.getElementById('tnv').value) || 0;  //outdoor air temperature
    let tpv = parseFloat(document.getElementById('tpv').value) || 0;  //prepared air temperature
    let rv = parseFloat(document.getElementById('rv').value) || 0;    //air flow rate
    let air_recovery = parseFloat(document.getElementById('air_recovery').value) || 0;    //exhaust air recovery percentage
    let tpt = parseFloat(document.getElementById('tpt').value) || 0;    //supply water temperature
    let tot = parseFloat(document.getElementById('tot').value) || 0;    //return water temperature

    localStorage.setItem('heater-power-tnv', tnv);
    localStorage.setItem('heater-power-tpv', tpv);
    localStorage.setItem('heater-power-rv', rv);
    localStorage.setItem('heater-power-air-recovery', air_recovery);
    localStorage.setItem('heater-power-tpt', tpt);
    localStorage.setItem('heater-power-tot', tot);

    if(checkErrors(tnv,tpv,rv,air_recovery,tpt,tot)){
        document.getElementById('results-container').style.display = 'none';
        document.getElementById('results-loader').style.display = 'block';
        scrollToBottom();
        
        let ro_tnv = (353.089/(tnv+273.15));
        let ro_tpv = (353.089/(tpv+273.15));
        let ro_v_p =  getWaterDensity(tpt);
        let ro_v_o = getWaterDensity(tot);

        let n_mass = rv * c * ro_tnv * (tpv - tnv)*(1-(air_recovery/100));
        let n_space = rv * c * ro_tpv * (tpv - tnv)*(1-(air_recovery/100));
        let rashod_teplonos_mass = n_space*860.421/(tpt-tot);
        let rashod_teplono_space = (rashod_teplonos_mass/((ro_v_p+ro_v_o)/2))/1000;
        let rashod_zabor = rv * ro_tpv/ro_tnv;

        document.getElementById('n_mass_result').value = n_mass.toFixed(3) + ' kW';
        document.getElementById('n_space_result').value = n_space.toFixed(3) + ' kW';
        document.getElementById('rashod-teplonos-mass').value = rashod_teplonos_mass.toFixed(3) + ' kg/h';
        document.getElementById('rashod-teplonos-space').value = rashod_teplono_space.toFixed(3) + ' m³/h';
        document.getElementById('rashod-zabor').value = rashod_zabor.toFixed() + ' m³/h';
        setTimeout(function(){
            document.getElementById('results-loader').style.display = 'none';
            document.getElementById('results-container').style.display = 'block';
            scrollToBottom();
        }, 1000)

    }

}

function checkErrors(tnv, tpv, rv, recovery, tpt, tot){
    if(tnv >= tpv){
        window.alert("Outdoor air temperature cannot exceed prepared air temperature");
        return false;
    }
    if(tnv < -73 || tnv > 1227 || tpv < -73 || tpv > 1227 || tpt < -73 || tpt > 1227 || tot < -73 || tot > 1227){
        window.alert("Calculation is reliable at normal atmospheric pressure of dry air in the temperature range: [-73°C;1227°C]");
        return false;
    }
    if(tot<45){
        window.alert("Return water temperature cannot be less than 45°C");
        return false;
    }
    if(tot-tpv<20){
        window.alert("Return water temperature must be 20°C higher than prepared air temperature");
        return false;
    }
    if(tot>tpt){
        window.alert("Return water temperature must be lower than supply water temperature");
        return false;
    }
    if(recovery<0){
        window.alert("Exhaust air recovery percentage cannot be negative");
        return false;
    }
    if(rv<=0){
        window.alert("Air flow rate must be greater than zero");
        return false;
    }
    else{
        return true;
    }
}

function generatePDFButtonHandler() {
    const loadingOverlay = document.getElementById('pdf-loading');
    scrollToTop();
    loadingOverlay.classList.add('show');
    document.body.classList.add('no-scroll');

    let tnv = parseFloat(document.getElementById('tnv').value) || 0;  //outdoor air temperature
    let tpv = parseFloat(document.getElementById('tpv').value) || 0;  //prepared air temperature
    let rv = parseFloat(document.getElementById('rv').value) || 0;    //air flow rate
    let air_recovery = parseFloat(document.getElementById('air_recovery').value) || 0;    //exhaust air recovery percentage
    let tpt = parseFloat(document.getElementById('tpt').value) || 0;    //supply water temperature
    let tot = parseFloat(document.getElementById('tot').value) || 0;    //return water temperature
    let n_mass = parseFloat(document.getElementById('n_mass_result').value) || 0;
    let n_space = parseFloat(document.getElementById('n_space_result').value) || 0;
    let rashod_teplonos_mass = parseFloat(document.getElementById('rashod-teplonos-mass').value) || 0;;
    let rashod_teplono_space = parseFloat(document.getElementById('rashod-teplonos-space').value) || 0;
    let rashod_zabor = parseFloat(document.getElementById('rashod-zabor').value) || 0;

    var title1 = 'Heater Power Calculation';
    var title2 = 'Calculation Results';

    var input = `Outdoor Air Temperature: ${tnv} °C\n` +
        `Prepared Air Temperature: ${tpv} °C\n` +
        `Air Flow Rate: ${rv} m³/h\n` +
        `Exhaust Air Recovery Percentage: ${air_recovery} %\n` +
        `Supply Water Temperature: ${tpt} °C\n` +
        `Return Water Temperature: ${tot} °C\n`

    var output = `Power by Mass Flow: ${n_mass} kW\n` +
        `Power by Volume Flow: ${n_space} kW\n` +
        `Heat Carrier Consumption: ${rashod_teplonos_mass} kg/h   |    ${rashod_teplono_space} m³/h\n` +
        `Outdoor Air Intake Flow: ${rashod_zabor} m³/h\n`

    var footer = 'Calculation performed on buildpatrol.com.ua'
    var filename = "Heater_Power_buildpatrol_com_ua.pdf"

    setTimeout(function(){
        generatePDF(title1, title2, input, output, footer, filename, 30, 45, 125, 140)
        loadingOverlay.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }, 2050);

}

function generateLink() {
    let tnv = parseFloat(document.getElementById('tnv').value) || 0;  //outdoor air temperature
    let tpv = parseFloat(document.getElementById('tpv').value) || 0;  //prepared air temperature
    let rv = parseFloat(document.getElementById('rv').value) || 0;    //air flow rate
    let air_recovery = parseFloat(document.getElementById('air_recovery').value) || 0;    //exhaust air recovery percentage
    let tpt = parseFloat(document.getElementById('tpt').value) || 0;    //supply water temperature
    let tot = parseFloat(document.getElementById('tot').value) || 0;    //return water temperature

    let link_value = `${tnv}&${tpv}&${rv}&${air_recovery}&${tpt}&${tot}`;
    let encoded_link_value = window.btoa(link_value);
    encoded_link_value = encoded_link_value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const currentUrl = window.location.origin + '/en/heater-power/';

    let link = currentUrl + '#' + encoded_link_value;
    console.log(link_value);
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

            if (decoded_input.length === 6) {
                document.getElementById('tnv').value = decoded_input[0];
                document.getElementById('tpv').value = decoded_input[1];
                document.getElementById('rv').value = decoded_input[2];
                document.getElementById('air_recovery').value = decoded_input[3];
                document.getElementById('tpt').value = decoded_input[4];
                document.getElementById('tot').value = decoded_input[5];

                calculateResults();
            }

            history.pushState({}, '', window.location.origin + '/en/heater-power/');
        } catch (error) {
            console.error('Error decoding the input:', error);
        }
    }
}

function updateAddInputs(){
    const inputElement1 = document.getElementById('tnv');
    const inputElement2 = document.getElementById('tpv');
    const outputElement1 = document.getElementById('air-density-tnv');
    const outputElement2 = document.getElementById('air-density-tpv');
    var result = (353.089/(parseFloat(inputElement1.value)+273.15)).toFixed(3);
    if(isNaN(result)){
        outputElement1.value = "Air Density";
    }
    else{
        outputElement1.value = `ρ = ${result} kg/m3`;
    }

    result = (353.089/(parseFloat(inputElement2.value)+273.15)).toFixed(3);
    if(isNaN(result)){
        outputElement2.value = "Air Density";
    }
    else{
        outputElement2.value = `ρ = ${result} kg/m3`;
    }
}

function loadValues(){
    document.getElementById('tnv').value = localStorage.getItem('heater-power-tnv');
    document.getElementById('tpv').value = localStorage.getItem('heater-power-tpv');
    document.getElementById('rv').value = localStorage.getItem('heater-power-rv');
    document.getElementById('air_recovery').value = localStorage.getItem('heater-power-air-recovery');
    document.getElementById('tpt').value = localStorage.getItem('heater-power-tpt');
    document.getElementById('tot').value = localStorage.getItem('heater-power-tot');
}

function clearInputs(){
    document.getElementById('tnv').value = '';
    document.getElementById('tpv').value = '';
    document.getElementById('rv').value = '';
    document.getElementById('air_recovery').value = '';
    document.getElementById('tpt').value = '';
    document.getElementById('tot').value = '';
    updateAddInputs();
}

window.onload = function() {
    loadValues();
    checkLink();
    updateAddInputs();
}