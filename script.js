document.addEventListener("DOMContentLoaded", function () {
    const progressCircles = document.querySelectorAll(".progress-circle");

    progressCircles.forEach(circle => {
        let percentage = circle.getAttribute("data-percentage");
        let angle = (percentage / 100) * 360;

        let gradient = `conic-gradient(#ffcc00 ${angle}deg, #ccc ${angle}deg)`;
        circle.style.background = gradient;
        circle.querySelector("span").innerText = percentage + "%";
    });
});


const modal = document.getElementById("modules-modal");
const modulesLink = document.getElementById("modules-link");

modulesLink.onclick = function() {
    modal.style.bottom = "0"; 
};

function closeModal() {
    modal.style.bottom = "-100%"; 
}
