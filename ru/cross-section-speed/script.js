import { getWaterDensity } from '../../scripts/get_water_density.js';
import { generatePDF } from '../../scripts/generate_pdf.js';
import { scrollToBottom, scrollToTop } from '../../scripts/scrolls.js';
import { changeLanguage } from '../../scripts/language.js';

document.addEventListener("DOMContentLoaded", function() {

    const ductTypeSelect = document.getElementById("duct-type");

    ductTypeSelect.addEventListener("change", function() {
        const b = document.getElementById("b_label");
        const h = document.getElementById("h_label");
        const hGroup = document.getElementById("h_group");
        if(ductTypeSelect.value === "circle"){
            b.textContent = "Диаметр";
            hGroup.style.display = "none";
        }
        if(ductTypeSelect.value === "rectangle"){
            b.textContent = "Ширина";
            h.textContent = "Высота";
            hGroup.style.display = "flex";
        }
        if(ductTypeSelect.value === "oval") {
            b.textContent = "Большая ось";
            h.textContent = "Малая ось";
            hGroup.style.display = "flex";
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
    //--КОНСТАНТЫ-----------------------------------------------------
    const PI = Math.PI;
    const G = 9.81;
    const ATMOSPHERIC_PRESSURE = 101325;
    const GAS_CONSTANT = 287.4;
    //----------------------------------------------------------------

    //--ВВОДНЫЕ ДАННЫЕ-------------------------------------------------------------------
    const airFlowRate = parseFloat(document.getElementById('rv').value); // расход воздуха
    const maxVelocity = parseFloat(document.getElementById('v_max').value); // максимальная скорость
    const airTemperature = parseFloat(document.getElementById('t').value); // температура воздуха
    const ductType = document.getElementById('duct-type').value; // тип воздуховода
    const ductMaterial = document.getElementById('duct-material').value; // материал воздуховода
    const width = parseFloat(document.getElementById('b').value) / 1000; // ширина (в метрах)
    const height = parseFloat(document.getElementById('h').value) / 1000; // высота (в метрах)
    //----------------------------------------------------------------------------------

    //--ОСНОВНЫЕ ВСПОМОГАТЕЛЬНЫЕ ПЕРЕМЕННЫЕ---------------------------------------------
    const airDensity = getWaterDensity(airTemperature); // плотность воздуха
    let equivalentDiameter = 0; // эквивалентный диаметр
    let crossSectionArea = 0; // площадь сечения
    let airVelocity = 0; // скорость воздуха
    //----------------------------------------------------------------------------------

    //--ВСПОМОГАТЕЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ РАСЧЕТА УДЕЛЬНОГО ГИДРАВЛИЧЕСКОГО СОПРОТИВЛЕНИЯ----
    let dynamicViscosity = 0; // динамическая вязкость воздуха
    let kinematicViscosity = 0; // кинематическая вязкость воздуха
    let dynamicPressure = 0; // динамическое давление
    let reynoldsNumber = 0; // критерий Рейнольдса
    let roughness = 0; // шероховатость
    let frictionFactor = 0; // коэффициент гидравлического сопротивления
    //-----------------------------------------------------------------------------------

    //---ВЫБОР МАТЕРИАЛА----------------------------------------------------------
    roughness = getRoughness(ductMaterial);
    //----------------------------------------------------------------------------

    //---ВЫЧИСЛЕНИЕ ПЛОЩАДИ СЕЧЕНИЯ И ЭКВИВАЛЕНТНОГО ДИАМЕТРА-----------------------
    crossSectionArea = calculateCrossSectionArea(ductType, width, height);
    equivalentDiameter = calculateEquivalentDiameter(ductType, width, height);
    //----------------------------------------------------------------------------

    airVelocity = airFlowRate / (crossSectionArea * 3600);

    //--ПРОМЕЖУТОЧНЫЕ РАСЧЕТЫ ДЛЯ ОТВЕТА------------------------------------------
    dynamicViscosity = 1.717 * Math.pow(10, -5) * Math.pow((273 + airTemperature) / 273, 0.683);
    kinematicViscosity = dynamicViscosity / airDensity;
    dynamicPressure = (airDensity * Math.pow(airVelocity, 2)) / 2;
    reynoldsNumber = (airVelocity * equivalentDiameter) / kinematicViscosity;
    frictionFactor = 0.11 * Math.pow((roughness / 1000) / equivalentDiameter + 68 / reynoldsNumber, 0.25);
    const specificHydraulicResistance = (frictionFactor / equivalentDiameter) * dynamicPressure;
    //----------------------------------------------------------------------------

    //-----ВЫВОД РЕЗУЛЬТАТОВ-----------------------------------------------------
    displayResults(crossSectionArea, equivalentDiameter, airVelocity, specificHydraulicResistance, maxVelocity);
    //----------------------------------------------------------------------------
}

function getRoughness(material) {
    switch (material) {
        case 'steel': return 0.1; // сталь
        case 'brick': return 4; // кирпич
        case 'slabs': return 1.5; // шлакобетонные плиты
        case 'plaster': return 10; // штукатурка по мет. сетке
        default: return 0.1; // значение по умолчанию (сталь)
    }
}

function calculateCrossSectionArea(type, width, height) {
    const PI = Math.PI;
    switch (type) {
        case 'circle': return (PI * Math.pow(width, 2)) / 4; // круглое сечение
        case 'rectangle': return width * height; // прямоугольное сечение
        case 'oval': return ((PI * Math.pow(height, 2)) / 4) + (height * (width - height)); // плоскоовальное сечение
        default: return 0;
    }
}

function calculateEquivalentDiameter(type, width, height) {
    switch (type) {
        case 'circle': return width; // круглое сечение
        case 'rectangle':
        case 'oval': return (2 * width * height) / (width + height); // прямоугольное и плоскоовальное сечение
        default: return 0;
    }
}

function displayResults(area, diameter, velocity, resistance, maxVelocity) {
    document.getElementById('v_result').style.color = "black";


    document.getElementById('s_result').value = `${area.toFixed(7)} м²`;
    document.getElementById('d_result').value = `${diameter.toFixed(3)} м`;
    document.getElementById('v_result').value = `${velocity.toFixed(2)} м/с`;
    document.getElementById('resist_result').value = `${resistance.toFixed(2)} Па/м`;

    if (velocity > maxVelocity) {
        document.getElementById('v_result').style.color = "red";
    }

    setTimeout(function(){
        document.getElementById('results-loader').style.display = 'none';
        document.getElementById('results-container').style.display = 'block';
        scrollToBottom();
    },1000);
}

    function checkErrors(tnv, tpv, rv, recovery, tpt, tot){
    if(tnv >= tpv){
        window.alert("Температура наружного воздуха не может превышать температуру наружного");
        return false;
    }
    if(tnv < -73 || tnv > 1227 || tpv < -73 || tpv > 1227 || tpt < -73 || tpt > 1227 || tot < -73 || tot > 1227){
        window.alert("Расчет достоверен при нормальном атмосферном давлении сухого воздуха, в диапазоне температур: [-73°С;1227°С]");
        return false;
    }
    if(tot<45){
        window.alert("Температура обратки теплоносителя не может быть менее 45°С");
        return false;
    }
    if(tot-tpv<20){
        window.alert("Температура обратки теплоносителя должна быть на 20°C выше температуры подготовленного воздуха");
        return false;
    }
    if(tot>tpt){
        window.alert("Температура обратки теплоносителя должна быть меньше температуры подачи теплоносителя");
        return false;
    }
    if(recovery<0){
        window.alert("Процент рекуперации вытяжного воздуха не может быть отрицательным");
        return false;
    }
    if(rv<=0){
        window.alert("Расход воздуха должен быть больше нуля");
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


    let tnv = parseFloat(document.getElementById('tnv').value) || 0;  //температура наружного воздуха
    let tpv = parseFloat(document.getElementById('tpv').value) || 0;  //температура подготовленног овоздуха
    let rv = parseFloat(document.getElementById('rv').value) || 0;    //расход воздуха
    let air_recovery = parseFloat(document.getElementById('air_recovery').value) || 0;    //Процент рекуперации вытяжного воздуха
    let tpt = parseFloat(document.getElementById('tpt').value) || 0;    //"Температура подачи теплоносителя
    let tot = parseFloat(document.getElementById('tot').value) || 0;    //Температура обратки теплоносителя
    let n_mass = parseFloat(document.getElementById('n_mass_result').value) || 0;
    let n_space = parseFloat(document.getElementById('n_space_result').value) || 0;
    let rashod_teplonos_mass = parseFloat(document.getElementById('rashod-teplonos-mass').value) || 0;;
    let rashod_teplono_space = parseFloat(document.getElementById('rashod-teplonos-space').value) || 0;
    let rashod_zabor = parseFloat(document.getElementById('rashod-zabor').value) || 0;

    var title1 = 'Расчет мощности нагревателя';
    var title2 = 'Результаты расчетов';

    var input = `Температура наружного воздуха: ${tnv} °С\n` +
        `Температура подготовленного воздуха: ${tpv} °С\n` +
        `Расход воздуха: ${rv} м3/ч\n` +
        `Процент рекуперации вытяжного воздуха: ${air_recovery} %\n` +
        `Температура подачи теплоносителя: ${tpt} °С\n` +
        `Температура обратки теплоносителя: ${tot} °С\n`

    var output = `Мощность по массовому расходу: ${n_mass} кВт\n` +
        `Мощность по объемному расходу: ${n_space} кВТ\n` +
        `Расход теплоносителя: ${rashod_teplonos_mass} кг/ч   |    ${rashod_teplono_space} м3/ч\n` +
        `Расход заборного наружного воздуха: ${rashod_zabor} м3/ч\n`

    var footer = 'Расчет выполнен на сайте buildpatrol.com.ua'
    var filename = "Мощность нагревателя_buildpatrol_com_ua.pdf"

    setTimeout(function(){
        generatePDF(title1, title2, input, output, footer, filename, 30, 45, 125, 140)
        loadingOverlay.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }, 2050);

}



function generateLink() {
    let tnv = parseFloat(document.getElementById('tnv').value) || 0;  //температура наружного воздуха
    let tpv = parseFloat(document.getElementById('tpv').value) || 0;  //температура подготовленног овоздуха
    let rv = parseFloat(document.getElementById('rv').value) || 0;    //расход воздуха
    let air_recovery = parseFloat(document.getElementById('air_recovery').value) || 0;    //Процент рекуперации вытяжного воздуха
    let tpt = parseFloat(document.getElementById('tpt').value) || 0;    //Температура подачи теплоносителя
    let tot = parseFloat(document.getElementById('tot').value) || 0;    //Температура обратки теплоносителя

    let link_value = `${tnv}&${tpv}&${rv}&${air_recovery}&${tpt}&${tot}`;
    let encoded_link_value = window.btoa(link_value);
    encoded_link_value = encoded_link_value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const currentUrl = window.location.origin + '/ru/heater-power/';

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

            history.pushState({}, '', window.location.origin + '/ru/heater-power/');
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
        outputElement1.value = "ρ воздуха";
    }
    else{
        outputElement1.value = `ρ = ${result} кг/м3`;
    }

    result = (353.089/(parseFloat(inputElement2.value)+273.15)).toFixed(3);
    if(isNaN(result)){
        outputElement2.value = "ρ воздуха";
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