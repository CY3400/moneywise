document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/budget";

    fetch("../components/navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-container").innerHTML = data;
        })
        .catch(error => console.error("Erreur lors du chargement de la navbar :", error));

    function showBudget() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const budgetId = document.getElementById("budget");
                if (data.length > 0) {
                    budgetId.style.display = 'none';
                }
            })
            .catch(error => console.error("Erreur lors du chargement du budget :", error));
    }

    const checkElementInterval = setInterval(function() {
        const budgetId = document.getElementById("budget");
        if (budgetId) {
            clearInterval(checkElementInterval);
            showBudget();
        }
    }, 1);
});
