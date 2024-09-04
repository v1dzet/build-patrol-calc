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
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('results-loader').style.display = 'block';
    scrollToBottom();
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

    saveValues(airFlowRate, maxVelocity, airTemperature, width*1000, height*1000, ductType, ductMaterial);

    //--ОСНОВНЫЕ ВСПОМОГАТЕЛЬНЫЕ ПЕРЕМЕННЫЕ---------------------------------------------
    const airDensity = getAirDensity(airTemperature); // плотность воздуха
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

function getRoughness(material) {       //ПОЛУЧЕНИЕ ШЕРАХОВАТОСТИ ПО МАТЕРИАЛУ
    switch (material) {
        case 'steel': return 0.1; // сталь
        case 'brick': return 4; // кирпич
        case 'slabs': return 1.5; // шлакобетонные плиты
        case 'plaster': return 10; // штукатурка по мет. сетке
        default: return 0.1; // значение по умолчанию (сталь)
    }
}

function calculateCrossSectionArea(type, width, height) {           //РАСЧЕТ ПЛОЩАДИ В ЗАВИСИМОСТИ ОТ ТИПА СЕЧЕНИЯ
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


    const airFlowRate = parseFloat(document.getElementById('rv').value); // расход воздуха
    const maxVelocity = parseFloat(document.getElementById('v_max').value); // максимальная скорость
    const airTemperature = parseFloat(document.getElementById('t').value); // температура воздуха
    const ductType = document.getElementById('duct-type').options[document.getElementById('duct-type').selectedIndex].text; // тип воздуховода
    const ductMaterial = document.getElementById('duct-material').options[document.getElementById('duct-material').selectedIndex].text; // материал воздуховода
    const width = parseFloat(document.getElementById('b').value); // ширина (в метрах)
    const height = parseFloat(document.getElementById('h').value); // высота (в метрах)
    const v_result = parseFloat(document.getElementById('v_result').value); // Скорость в сечении
    const s_result = parseFloat(document.getElementById('s_result').value); // Площадь сечения
    const d_result = parseFloat(document.getElementById('d_result').value); // Эквивалентный диаметр
    const resist_result = parseFloat(document.getElementById('resist_result').value); //Удельное гидравлическое сопротивления


    var title1 = 'Расчет скорости в сечении';
    var title2 = 'Результаты расчетов';

    if(document.getElementById('duct-type').value === 'circle'){
        var input = `Тип воздуховода: ${ductType}\n` +
            `Материал воздуховода: ${ductMaterial}\n` +
            `Расход воздуха: ${airFlowRate} м3/ч\n` +
            `Диаметр: ${width} мм\n` +
            `Максимальная скорость: ${maxVelocity} м/с\n` +
            `Температура воздуха: ${airTemperature} °С\n`
    }
    else if(document.getElementById('duct-type').value === 'rectangle'){
        var input = `Тип воздуховода: ${ductType}\n` +
            `Материал воздуховода: ${ductMaterial}\n` +
            `Расход воздуха: ${airFlowRate} м3/ч\n` +
            `Ширина: ${width} мм\n` +
            `Высота: ${height} мм\n` +
            `Максимальная скорость: ${maxVelocity} м/с\n` +
            `Температура воздуха: ${airTemperature} °С\n`
    }
    else{
        var input = `Тип воздуховода: ${ductType}\n` +
            `Материал воздуховода: ${ductMaterial}\n` +
            `Расход воздуха: ${airFlowRate} м3/ч\n` +
            `Большая ось: ${width} мм\n` +
            `Малая ось: ${height} мм\n` +
            `Максимальная скорость: ${maxVelocity} м/с\n` +
            `Температура воздуха: ${airTemperature} °С\n`
    }


    var output = `Скорость в сечении: ${v_result} м/с\n` +
        `Площадь сечения: ${s_result} м2\n` +
        `Эквивалентный диаметр: ${d_result} м\n` +
        `Удельное гидравлическое сопротивление: ${resist_result} Па/м\n`

    var footer = 'Расчет выполнен на сайте buildpatrol.com.ua'
    var filename = "Скорость в сечении_buildpatrol_com_ua.pdf"

    setTimeout(function(){
        generatePDF(title1, title2, input, output, footer, filename, 30, 45, 125, 140)
        loadingOverlay.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }, 2050);

}



function generateLink() {
    const airFlowRate = parseFloat(document.getElementById('rv').value); // расход воздуха
    const maxVelocity = parseFloat(document.getElementById('v_max').value); // максимальная скорость
    const airTemperature = parseFloat(document.getElementById('t').value); // температура воздуха
    const ductType = document.getElementById('duct-type').value; // тип воздуховода
    const ductMaterial = document.getElementById('duct-material').value; // материал воздуховода
    const width = parseFloat(document.getElementById('b').value); // ширина (в метрах)
    const height = parseFloat(document.getElementById('h').value); // высота (в метрах)

    let link_value = `${airFlowRate}&${maxVelocity}&${airTemperature}&${ductType}&${ductMaterial}&${width}&${height}`;
    let encoded_link_value = window.btoa(link_value);
    encoded_link_value = encoded_link_value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const currentUrl = window.location.origin + '/ru/cross-section-speed';

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

            history.pushState({}, '', window.location.origin + '/ru/cross-section-speed/');
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