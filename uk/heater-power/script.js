import { getWaterDensity } from '../../scripts/get_water_density.js';
import { generatePDF } from '../../scripts/generate_pdf.js';
import { scrollToBottom, scrollToTop } from '../../scripts/scrolls.js';
import { changeLanguage } from '../../scripts/language.js';


const url = 'http://127.0.0.1:5500';

document.addEventListener("DOMContentLoaded", function() {
    const inputElement1 = document.getElementById('tnv');
    const inputElement2 = document.getElementById('tpv');
    const outputElement1 = document.getElementById('air-density-tnv');
    const outputElement2 = document.getElementById('air-density-tpv');

    inputElement1.addEventListener('input', (event) => {
        var result = (353.089/(parseFloat(inputElement1.value)+273.15)).toFixed(3);

        if(isNaN(result)){
            outputElement1.value = "Щільність повітря";
        }
        else{
            outputElement1.value = `ρ = ${result} кг/м3`;
        }

    });

    inputElement2.addEventListener('input', (event) => {
        var result = (353.089/(parseFloat(inputElement2.value)+273.15)).toFixed(3);

        if(isNaN(result)){
            outputElement2.value = "Щільність повітря";
        }
        else{
            outputElement2.value = `ρ = ${result} кг/м3`;
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

    const c = 1/3600;   // коефіцієнт для розрахунку

    let tnv = parseFloat(document.getElementById('tnv').value) || 0;  //температура зовнішнього повітря
    let tpv = parseFloat(document.getElementById('tpv').value) || 0;  //температура підготовленого повітря
    let rv = parseFloat(document.getElementById('rv').value) || 0;    //витрата повітря
    let air_recovery = parseFloat(document.getElementById('air_recovery').value) || 0;    //процент рекуперації витяжного повітря
    let tpt = parseFloat(document.getElementById('tpt').value) || 0;    //температура подачі теплоносія
    let tot = parseFloat(document.getElementById('tot').value) || 0;    //температура зворотного теплоносія

    localStorage.setItem('heater-power-tnv', tnv);
    localStorage.setItem('heater-power-tpv', tpv);
    localStorage.setItem('heater-power-rv', rv);
    localStorage.setItem('heater-power-air-recovery', air_recovery);
    localStorage.setItem('heater-power-tpt', tpt);
    localStorage.setItem('heater-power-tot', tot);

    if(checkErrors(tnv,tpv,rv,air_recovery,tpt,tot)){
        document.getElementById('results-container').style.display = 'none';
        document.getElementById('results-loader').style.display = 'block';
        
        let ro_tnv = (353.089/(tnv+273.15));
        let ro_tpv = (353.089/(tpv+273.15));
        let ro_v_p =  getWaterDensity(tpt);
        let ro_v_o = getWaterDensity(tot);

        let n_mass = rv * c * ro_tnv * (tpv - tnv)*(1-(air_recovery/100));
        let n_space = rv * c * ro_tpv * (tpv - tnv)*(1-(air_recovery/100));
        let rashod_teplonos_mass = n_space*860.421/(tpt-tot);
        let rashod_teplono_space = (rashod_teplonos_mass/((ro_v_p+ro_v_o)/2))/1000;
        let rashod_zabor = rv * ro_tpv/ro_tnv;

        document.getElementById('n_mass_result').value = n_mass.toFixed(3) + ' кВт';
        document.getElementById('n_space_result').value = n_space.toFixed(3) + ' кВт';
        document.getElementById('rashod-teplonos-mass').value = rashod_teplonos_mass.toFixed(3) + ' кг/г';
        document.getElementById('rashod-teplonos-space').value = rashod_teplono_space.toFixed(3) + ' м³/г';
        document.getElementById('rashod-zabor').value = rashod_zabor.toFixed() + ' м³/г';
        setTimeout(function(){
            document.getElementById('results-loader').style.display = 'none';
            document.getElementById('results-container').style.display = 'block';
            scrollToBottom();
        }, 1000)

    }

}

function checkErrors(tnv, tpv, rv, recovery, tpt, tot){
    if(tnv >= tpv){
        window.alert("Температура зовнішнього повітря не може перевищувати температуру підготовленого повітря");
        return false;
    }
    if(tnv < -73 || tnv > 1227 || tpv < -73 || tpv > 1227 || tpt < -73 || tpt > 1227 || tot < -73 || tot > 1227){
        window.alert("Розрахунок достовірний при нормальному атмосферному тиску сухого повітря в діапазоні температур: [-73°С;1227°С]");
        return false;
    }
    if(tot<45){
        window.alert("Температура зворотного теплоносія не може бути меншою за 45°С");
        return false;
    }
    if(tot-tpv<20){
        window.alert("Температура зворотного теплоносія повинна бути на 20°C вищою за температуру підготовленого повітря");
        return false;
    }
    if(tot>tpt){
        window.alert("Температура зворотного теплоносія повинна бути нижчою за температуру подачі теплоносія");
        return false;
    }
    if(recovery<0){
        window.alert("Процент рекуперації витяжного повітря не може бути негативним");
        return false;
    }
    if(rv<=0){
        window.alert("Витрата повітря повинна бути більшою за нуль");
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

    let tnv = parseFloat(document.getElementById('tnv').value) || 0;  //температура зовнішнього повітря
    let tpv = parseFloat(document.getElementById('tpv').value) || 0;  //температура підготовленого повітря
    let rv = parseFloat(document.getElementById('rv').value) || 0;    //витрата повітря
    let air_recovery = parseFloat(document.getElementById('air_recovery').value) || 0;    //процент рекуперації витяжного повітря
    let tpt = parseFloat(document.getElementById('tpt').value) || 0;    //температура подачі теплоносія
    let tot = parseFloat(document.getElementById('tot').value) || 0;    //температура зворотного теплоносія
    let n_mass = parseFloat(document.getElementById('n_mass_result').value) || 0;
    let n_space = parseFloat(document.getElementById('n_space_result').value) || 0;
    let rashod_teplonos_mass = parseFloat(document.getElementById('rashod-teplonos-mass').value) || 0;
    let rashod_teplono_space = parseFloat(document.getElementById('rashod-teplonos-space').value) || 0;
    let rashod_zabor = parseFloat(document.getElementById('rashod-zabor').value) || 0;

    var title1 = 'Розрахунок потужності нагрівача';
    var title2 = 'Результати розрахунків';

    var input = `Температура зовнішнього повітря: ${tnv} °С\n` +
        `Температура підготовленого повітря: ${tpv} °С\n` +
        `Витрата повітря: ${rv} м³/г\n` +
        `Процент рекуперації витяжного повітря: ${air_recovery} %\n` +
        `Температура подачі теплоносія: ${tpt} °С\n` +
        `Температура зворотного теплоносія: ${tot} °С\n`

    var output = `Потужність за масовою витратою: ${n_mass} кВт\n` +
        `Потужність за об'ємною витратою: ${n_space} кВт\n` +
        `Витрата теплоносія: ${rashod_teplonos_mass} кг/г   |    ${rashod_teplono_space} м³/г\n` +
        `Витрата заборного зовнішнього повітря: ${rashod_zabor} м³/г\n`

    var footer = 'Розрахунок виконано на сайті buildpatrol.com.ua'
    var filename = "Потужність_нагрівача_buildpatrol_com_ua.pdf"

    setTimeout(function(){
        generatePDF(title1, title2, input, output, footer, filename, 30, 45, 125, 140)
        loadingOverlay.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }, 2050);

}

function generateLink() {
    let tnv = parseFloat(document.getElementById('tnv').value) || 0;  //температура зовнішнього повітря
    let tpv = parseFloat(document.getElementById('tpv').value) || 0;  //температура підготовленого повітря
    let rv = parseFloat(document.getElementById('rv').value) || 0;    //витрата повітря
    let air_recovery = parseFloat(document.getElementById('air_recovery').value) || 0;    //процент рекуперації витяжного повітря
    let tpt = parseFloat(document.getElementById('tpt').value) || 0;    //температура подачі теплоносія
    let tot = parseFloat(document.getElementById('tot').value) || 0;    //температура зворотного теплоносія

    let link_value = `${tnv}&${tpv}&${rv}&${air_recovery}&${tpt}&${tot}`;
    let encoded_link_value = window.btoa(link_value);
    encoded_link_value = encoded_link_value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const currentUrl = window.location.origin + '/uk/heater-power/';

    let link = currentUrl + '#' + encoded_link_value;
    console.log(link_value);
    navigator.clipboard.writeText(link).then(function () {
        document.getElementById('link').style.backgroundImage = 'url("../../src/checkmark.png")';
        setTimeout(function() {
            document.getElementById('link').style.backgroundImage = 'url("../../src/link.png")';
        }, 500);
    }).catch(function (error) {
        console.error('Помилка копіювання тексту: ', error);
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

            history.pushState({}, '', window.location.origin + '/uk/heater-power/');
        } catch (error) {
            console.error('Помилка декодування введення:', error);
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
        outputElement1.value = "Щільність повітря";
    }
    else{
        outputElement1.value = `ρ = ${result} кг/м3`;
    }

    result = (353.089/(parseFloat(inputElement2.value)+273.15)).toFixed(3);
    if(isNaN(result)){
        outputElement2.value = "Щільність повітря";
    }
    else{
        outputElement2.value = `ρ = ${result} кг/м3`;
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
