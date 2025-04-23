document.addEventListener("DOMContentLoaded", function () {
    // Animate language bars
    document.querySelectorAll('.language-bar').forEach(bar => {
        const level = bar.getAttribute('data-level');
        setTimeout(() => {
            bar.style.setProperty('--width', `${level}%`);
        }, 200);
    });
    const progressCircles = document.querySelectorAll(".progress-circle");

    progressCircles.forEach(circle => {
        const targetPercentage = parseInt(circle.getAttribute("data-percentage"));
        let currentPercentage = 0;
        
        const animate = () => {
            if (currentPercentage < targetPercentage) {
                currentPercentage++;
                let angle = (currentPercentage / 100) * 360;
                let gradient = `conic-gradient(#007bff ${angle}deg, #ccc ${angle}deg)`;
                circle.style.background = gradient;
                circle.querySelector("span").innerText = currentPercentage + "%";
                requestAnimationFrame(animate);
            }
        };
        
        animate();
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
