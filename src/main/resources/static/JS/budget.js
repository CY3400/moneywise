document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/budget";

    const addButton=document.getElementById("addBudget");

    addButton.addEventListener("click", function () {
        const newBudget = {
            budget: startbudget.value,
            date: date.value
        };

        fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBudget)
        })
        .then(response => response.json())
        .then(() => {
            startbudget.value = "";
            date.value = "";
            window.location.href = "/";
        })
        .catch(error => console.error("Erreur lors de l'ajout :", error));
    });
});
