import { getWaterDensity } from '../../scripts/get_water_density.js';
import { generatePDF } from '../../scripts/generate_pdf.js';
import { scrollToBottom, scrollToTop } from '../../scripts/scrolls.js';
import { changeLanguage } from '../../scripts/language.js';
import {getAirDensity} from "../../scripts/get_air_density.js";

document.addEventListener("DOMContentLoaded", function() {

    const ductTypeSelect = document.getElementById("duct-type");

    ductTypeSelect.addEventListener("change", function() {
        const b = document.getElementById("b_label");
        const h = document.getElementById("h_label");
        const hGroup = document.getElementById("h_group");
        if(ductTypeSelect.value === "circle"){
            b.textContent = "Діаметр";
            hGroup.style.display = "none";
        }
        if(ductTypeSelect.value === "rectangle"){
            b.textContent = "Ширина";
            h.textContent = "Висота";
            hGroup.style.display = "flex";
        }
        if(ductTypeSelect.value === "oval") {
            b.textContent = "Велика вісь";
            h.textContent = "Мала вісь";
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
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('results-loader').style.display = 'block';
    scrollToBottom();
    //--КОНСТАНТИ-----------------------------------------------------
    const PI = Math.PI;
    const G = 9.81;
    const ATMOSPHERIC_PRESSURE = 101325;
    const GAS_CONSTANT = 287.4;
    //----------------------------------------------------------------

    //--ВХІДНІ ДАНІ---------------------------------------------------
    const airFlowRate = parseFloat(document.getElementById('rv').value); // витрата повітря
    const maxVelocity = parseFloat(document.getElementById('v_max').value); // максимальна швидкість
    const airTemperature = parseFloat(document.getElementById('t').value); // температура повітря
    const ductType = document.getElementById('duct-type').value; // тип повітропроводу
    const ductMaterial = document.getElementById('duct-material').value; // матеріал повітропроводу
    const width = parseFloat(document.getElementById('b').value) / 1000; // ширина (в метрах)
    const height = parseFloat(document.getElementById('h').value) / 1000; // висота (в метрах)
    //----------------------------------------------------------------

    saveValues(airFlowRate, maxVelocity, airTemperature, width*1000, height*1000, ductType, ductMaterial);

    //--ДОДАТКОВІ ЗМІННІ---------------------------------------------
    const airDensity = getAirDensity(airTemperature); // густина повітря
    let equivalentDiameter = 0; // еквівалентний діаметр
    let crossSectionArea = 0; // площа перерізу
    let airVelocity = 0; // швидкість повітря
    //----------------------------------------------------------------

    //--ДОДАТКОВІ ЗМІННІ ДЛЯ РОЗРАХУНКУ ГІДРАВЛІЧНОГО ОПОРУ------------
    let dynamicViscosity = 0; // динамічна в'язкість повітря
    let kinematicViscosity = 0; // кінематична в'язкість повітря
    let dynamicPressure = 0; // динамічний тиск
    let reynoldsNumber = 0; // число Рейнольдса
    let roughness = 0; // шорсткість
    let frictionFactor = 0; // коефіцієнт гідравлічного опору
    //-------------------------------------------------------------------

    //--ВИБІР МАТЕРІАЛУ---------------------------------------------------
    roughness = getRoughness(ductMaterial);
    //-------------------------------------------------------------------

    //--РОЗРАХУНОК ПЛОЩІ ПЕРЕРІЗУ ТА ЕКВІВАЛЕНТНОГО ДІАМЕТРА------------
    crossSectionArea = calculateCrossSectionArea(ductType, width, height);
    equivalentDiameter = calculateEquivalentDiameter(ductType, width, height);
    //-------------------------------------------------------------------

    airVelocity = airFlowRate / (crossSectionArea * 3600);

    //--ПРОМІЖНІ РОЗРАХУНКИ ДЛЯ РЕЗУЛЬТАТУ--------------------------
    dynamicViscosity = 1.717 * Math.pow(10, -5) * Math.pow((273 + airTemperature) / 273, 0.683);
    kinematicViscosity = dynamicViscosity / airDensity;
    dynamicPressure = (airDensity * Math.pow(airVelocity, 2)) / 2;
    reynoldsNumber = (airVelocity * equivalentDiameter) / kinematicViscosity;
    frictionFactor = 0.11 * Math.pow((roughness / 1000) / equivalentDiameter + 68 / reynoldsNumber, 0.25);
    const specificHydraulicResistance = (frictionFactor / equivalentDiameter) * dynamicPressure;
    //-------------------------------------------------------------------

    //--ВИВЕДЕННЯ РЕЗУЛЬТАТІВ------------------------------------------
    displayResults(crossSectionArea, equivalentDiameter, airVelocity, specificHydraulicResistance, maxVelocity);
    //-------------------------------------------------------------------
}

function getRoughness(material) {       // ОТРИМАННЯ ШОРСТКОСТІ ЗА МАТЕРІАЛОМ
    switch (material) {
        case 'steel': return 0.1; // сталь
        case 'brick': return 4; // цегла
        case 'slabs': return 1.5; // залізобетонні плити
        case 'plaster': return 10; // штукатурка по металевій сітці
        default: return 0.1; // значення за замовчуванням (сталь)
    }
}

function calculateCrossSectionArea(type, width, height) {           // РОЗРАХУНОК ПЛОЩІ ЗАЛЕЖНО ВІД ТИПУ ПЕРЕРІЗУ
    const PI = Math.PI;
    switch (type) {
        case 'circle': return (PI * Math.pow(width, 2)) / 4; // круглий переріз
        case 'rectangle': return width * height; // прямокутний переріз
        case 'oval': return ((PI * Math.pow(height, 2)) / 4) + (height * (width - height)); // плоскоовальний переріз
        default: return 0;
    }
}

function calculateEquivalentDiameter(type, width, height) {
    switch (type) {
        case 'circle': return width; // круглий переріз
        case 'rectangle':
        case 'oval': return (2 * width * height) / (width + height); // прямокутний і плоскоовальний переріз
        default: return 0;
    }
}

function displayResults(area, diameter, velocity, resistance, maxVelocity) {
    document.getElementById('v_result').style.color = "black";
    document.getElementById('v_result_label').style.color = "#d4d4d4";

    document.getElementById('s_result').value = `${area.toFixed(7)} м²`;
    document.getElementById('d_result').value = `${diameter.toFixed(3)} м`;
    document.getElementById('v_result').value = `${velocity.toFixed(2)} м/с`;
    document.getElementById('resist_result').value = `${resistance.toFixed(2)} Па/м`;

    if (velocity > maxVelocity) {
        document.getElementById('v_result').style.color = "#b80c00";
        document.getElementById('v_result_label').style.color = "#b80c00";
    }

    setTimeout(function(){
        document.getElementById('results-loader').style.display = 'none';
        document.getElementById('results-container').style.display = 'block';
        scrollToBottom();
    },1000);
}

function generatePDFButtonHandler() {
    const loadingOverlay = document.getElementById('pdf-loading');
    scrollToTop();
    loadingOverlay.classList.add('show');
    document.body.classList.add('no-scroll');

    const airFlowRate = parseFloat(document.getElementById('rv').value);
    const maxVelocity = parseFloat(document.getElementById('v_max').value);
    const airTemperature = parseFloat(document.getElementById('t').value);
    const ductType = document.getElementById('duct-type').options[document.getElementById('duct-type').selectedIndex].text;
    const ductMaterial = document.getElementById('duct-material').options[document.getElementById('duct-material').selectedIndex].text;
    const width = parseFloat(document.getElementById('b').value);
    const height = parseFloat(document.getElementById('h').value);
    const v_result = parseFloat(document.getElementById('v_result').value);
    const s_result = parseFloat(document.getElementById('s_result').value);
    const d_result = parseFloat(document.getElementById('d_result').value);
    const resist_result = parseFloat(document.getElementById('resist_result').value);

    let input = `Тип повітропроводу: ${ductType}\n` +
        `Матеріал повітропроводу: ${ductMaterial}\n` +
        `Витрата повітря: ${airFlowRate} м3/год\n` +
        `Ширина: ${width} мм\n` +
        `Висота: ${height} мм\n` +
        `Максимальна швидкість: ${maxVelocity} м/с\n` +
        `Температура повітря: ${airTemperature} °С\n`;

    let output = `Швидкість у перерізі: ${v_result} м/с\n` +
        `Площа перерізу: ${s_result} м2\n` +
        `Еквівалентний діаметр: ${d_result} м\n` +
        `Питоме гідравлічне опір: ${resist_result} Па/м\n`;

    let footer = 'Розрахунок виконано на сайті buildpatrol.com';
    let filename = "Швидкість у перерізі_buildpatrol_com.pdf";

    setTimeout(function(){
        generatePDF('Розрахунок швидкості у перерізі', 'Результати розрахунків', input, output, footer, filename, 30, 45, 125, 140);
        loadingOverlay.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }, 2050);
}

function generateLink() {
    const airFlowRate = parseFloat(document.getElementById('rv').value);
    const maxVelocity = parseFloat(document.getElementById('v_max').value);
    const airTemperature = parseFloat(document.getElementById('t').value);
    const ductType = document.getElementById('duct-type').value;
    const ductMaterial = document.getElementById('duct-material').value;
    const width = parseFloat(document.getElementById('b').value);
    const height = parseFloat(document.getElementById('h').value);

    let link_value = `${airFlowRate}&${maxVelocity}&${airTemperature}&${ductType}&${ductMaterial}&${width}&${height}`;
    let encoded_link_value = window.btoa(link_value);
    encoded_link_value = encoded_link_value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const currentUrl = window.location.origin + '/uk/cross-section-speed';

    let link = currentUrl + '#' + encoded_link_value;
    navigator.clipboard.writeText(link).then(function () {
        document.getElementById('link').style.backgroundImage = 'url("../../src/checkmark.png")';
        setTimeout(function() {
            document.getElementById('link').style.backgroundImage = 'url("../../src/link.png")';
        }, 500);
    }).catch(function (error) {
        console.error('Error copying the link:', error);
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

            if (decoded_input.length === 7) {
                document.getElementById('rv').value = decoded_input[0];
                document.getElementById('v_max').value = decoded_input[1];
                document.getElementById('t').value = decoded_input[2];
                document.getElementById('duct-type').value = decoded_input[3];
                document.getElementById('duct-material').value = decoded_input[4];
                document.getElementById('b').value = decoded_input[5];
                document.getElementById('h').value = decoded_input[6];

                calculateResults();
            }

            history.pushState({}, '', window.location.origin + '/uk/cross-section-speed/');
        } catch (error) {
            console.error('Error decoding the input:', error);
        }
    }
}

function saveValues(rv, v_max, t, b, h, duct_type, duct_material){
    localStorage.setItem('cross-section-rv', rv);
    localStorage.setItem('cross-section-v_max', v_max);
    localStorage.setItem('cross-section-t', t);
    localStorage.setItem('cross-section-b', b);
    localStorage.setItem('cross-section-h', h);
    localStorage.setItem('cross-section-duct-type', duct_type);
    localStorage.setItem('cross-section-duct-material', duct_material);
}

function loadValues(){
    document.getElementById('rv').value = localStorage.getItem('cross-section-rv');
    document.getElementById('v_max').value = localStorage.getItem('cross-section-v_max');
    document.getElementById('t').value = localStorage.getItem('cross-section-t');
    document.getElementById('b').value = localStorage.getItem('cross-section-b');
    document.getElementById('h').value = localStorage.getItem('cross-section-h');
    document.getElementById('duct-type').value = localStorage.getItem('cross-section-duct-type');
    document.getElementById('duct-material').value = localStorage.getItem('cross-section-duct-material');
}

function clearInputs(){
    document.getElementById('rv').value = '';
    document.getElementById('v_max').value = '';
    document.getElementById('t').value = '';
    document.getElementById('b').value = '';
    document.getElementById('h').value = '';
}

window.onload = function() {
    loadValues();
    checkLink();
}
