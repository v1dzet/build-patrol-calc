export function getWaterDensity(temperature) {
    var keys = Object.keys(densities).map(Number).sort((a, b) => a - b);
    var temp = parseFloat(temperature);
    var closest = keys.reduce(function(prev, curr) {
        return (Math.abs(curr - temp) < Math.abs(prev - temp) ? curr : prev);
    });

    return densities[closest.toString()];
}

const densities ={
    "0":0.99987,
    "1":0.99993,
    "2" : 0.99997,
    "3" : 0.99999,
    "4" : 1,
    "5" : 0.99999,
    "6" : 0.99997,
    "7" : 0.99993,
    "8" : 0.99988,
    "9" : 0.99981,
    "10" : 0.99973,
    "11" : 0.99963,
    "12" : 0.99952,
    "13" : 0.9994,
    "14" : 0.99927,
    "15" : 0.99913,
    "16" : 0.99897,
    "17" : 0.9988,
    "18" : 0.99862,
    "19" : 0.99843,
    "20" : 0.99823,
    "21" : 0.99802,
    "22" : 0.9978,
    "23" : 0.99757,
    "24" : 0.99732,
    "25" : 0.99707,
    "26" : 0.99681,
    "27" : 0.99654,
    "28" : 0.99626,
    "29" : 0.99597,
    "30" : 0.99567,
    "31" : 0.99537,
    "32" : 0.99505,
    "33" : 0.99472,
    "34" : 0.9944,
    "35" : 0.99406,
    "36" : 0.9937,
    "37" : 0.99335,
    "38" : 0.993,
    "39" : 0.9926,
    "40" : 0.9922,
    "41" : 0.9918,
    "42" : 0.9914,
    "43" : 0.991,
    "44" : 0.9906,
    "45" : 0.9902,
    "46" : 0.9898,
    "47" : 0.98935,
    "48" : 0.9889,
    "49" : 0.98845,
    "50" : 0.988,
    "51" : 0.98755,
    "52" : 0.9871,
    "53" : 0.98665,
    "54" : 0.9862,
    "55" : 0.9857,
    "56" : 0.9852,
    "57" : 0.9847,
    "58" : 0.9842,
    "59" : 0.9837,
    "60" : 0.9832,
    "61" : 0.98265,
    "62" : 0.9821,
    "63" : 0.9816,
    "64" : 0.9811,
    "65" : 0.98055,
    "66" : 0.98,
    "67" : 0.97945,
    "68" : 0.9789,
    "69" : 0.97835,
    "70" : 0.9778,
    "71" : 0.9772,
    "72" : 0.9766,
    "73" : 0.976,
    "74" : 0.9754,
    "75" : 0.9748,
    "76" : 0.9742,
    "77" : 0.9736,
    "78" : 0.973,
    "79" : 0.9724,
    "80" : 0.9718,
    "81" : 0.97115,
    "82" : 0.9705,
    "83" : 0.9699,
    "84" : 0.9693,
    "85" : 0.96855,
    "86" : 0.9678,
    "87" : 0.9672,
    "88" : 0.9666,
    "89" : 0.96595,
    "90" : 0.9653,
    "91" : 0.9646,
    "92" : 0.9639,
    "93" : 0.96325,
    "94" : 0.9626,
    "95" : 0.9619,
    "96" : 0.9612,
    "97" : 0.9605,
    "98" : 0.9598,
    "99" : 0.9591,
    "100" : 0.9584,
    "105" : 0.9545,
    "110" : 0.9507,
    "115" : 0.9468,
    "120" : 0.9429,
    "125" : 0.9388,
    "130" : 0.9346,
    "140" : 0.9258,
    "150" : 0.9168,
    "160" : 0.9073,
    "170" : 0.8973,
    "180" : 0.8869,
    "190" : 0.876,
    "200" : 0.8647,
    "210" : 0.8528,
    "220" : 0.8403,
    "230" : 0.8273,
    "240" : 0.8136,
    "250" : 0.7992,
    "260" : 0.7839,
    "270" : 0.7678,
    "280" : 0.7505,
    "290" : 0.7321,
    "300" : 0.7122,
    "305" : 0.7017,
    "310" : 0.6906,
    "315" : 0.6791,
    "320" : 0.6669,
    "325" : 0.6541,
    "330" : 0.6405,
    "335" : 0.6259,
    "340" : 0.6101,
    "345" : 0.5932,
    "350" : 0.5745,
    "355" : 0.5533,
    "360" : 0.5283,
    "362" : 0.5166,
    "364" : 0.5035,
    "366" : 0.4885,
    "367" : 0.47955,
    "368" : 0.4706,
    "370" : 0.4484,
    "371" : 0.4352,
    "372" : 0.4181,
    "373" : 0.3962,
    "374.12" : 0.3178
}