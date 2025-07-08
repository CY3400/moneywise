document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/budget";

    const addButton=document.getElementById("addBudget");

    function checkNull(desc, date){
        var result = 1;

        if(desc == ""){
            desc_error.classList.remove("d-none");
            startbudget.classList.add('border','border-danger');
            desc_label.classList.add('text-danger');
            result = 0;
        }
        else{
            desc_error.classList.add("d-none");
            startbudget.classList.remove('border','border-danger');
            desc_label.classList.remove('text-danger');
        }

        if(date == ""){
            date_error.classList.remove("d-none");
            budgetdate.classList.add('border','border-danger');
            date_label.classList.add('text-danger');
            result = 0;
        }
        else{
            date_error.classList.add("d-none");
            budgetdate.classList.remove('border','border-danger');
            date_label.classList.remove('text-danger');
        }

        return result;
    }

    addButton.addEventListener("click", function () {
        var notNull = checkNull(startbudget.value, budgetdate.value);

        if(notNull == 1){
            const newBudget = {
                budget: startbudget.value,
                date: budgetdate.value
            };

            fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBudget)
            })
            .then(response => response.json())
            .then(() => {
                startbudget.value = "";
                budgetdate.value = "";
                window.location.href = "/";
            })
            .catch(error => console.error("Erreur lors de l'ajout :", error));
        }
    });
});
