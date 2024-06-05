document.addEventListener("DOMContentLoaded", function() {
    const formGroups = document.querySelectorAll(".form-group");
    const calculateBtn = document.querySelector(".form1 .calculate-btn");
    const form1 = document.querySelector(".form1");
    const form2 = document.querySelector(".form2");

    calculateBtn.addEventListener("click", function() {
        form1.style.left = "-100%";
        form2.style.left = "0";
    });
});
