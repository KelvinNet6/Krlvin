<script>
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
</script>
