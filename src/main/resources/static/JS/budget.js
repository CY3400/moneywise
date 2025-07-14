document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/budget";
    const desc_error = document.getElementById("desc_error");
    const startbudget = document.getElementById("startbudget");
    const desc_label = document.getElementById("desc_label");
    const date_error = document.getElementById("date_error");
    const budgetdate = document.getElementById("budgetdate");
    const date_label = document.getElementById("date_label");
    const allowedInputRegex = /[0-9]/;
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    const addButton=document.getElementById("addBudget");

    function validate(element) {
        element.addEventListener("input", function () {
            validateBudgetFormFields(startbudget.value, budgetdate.value);
        });
    }

    validate(startbudget);
    validate(budgetdate);

    startbudget.addEventListener("keydown", function (e) {
        if (e.ctrlKey || e.metaKey) return;

        if (!allowedKeys.includes(e.key) && !allowedInputRegex.test(e.key)) {
            e.preventDefault();
        }
    });

    startbudget.addEventListener("paste", function (e) {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData("text");
        const sanitized = [...pasted].filter(c => allowedInputRegex.test(c)).join("");
        document.execCommand("insertText", false, sanitized);
    });

    function toggleFieldError(field, label, errorElement, isEmpty) {
        errorElement.classList.toggle("d-none", !isEmpty);
        field.classList.toggle("border", isEmpty);
        field.classList.toggle("border-danger", isEmpty);
        label.classList.toggle("text-danger", isEmpty);
    }

    function validateBudgetFormFields(amount, date){
        const isAmountEmpty = amount === "";
        toggleFieldError(startbudget, desc_label, desc_error, isAmountEmpty);

        const isDateEmpty = date === "";
        toggleFieldError(budgetdate, date_label, date_error, isDateEmpty);

        return !isAmountEmpty && !isDateEmpty;
    }

    addButton.addEventListener("click", function () {
        if(validateBudgetFormFields(startbudget.value, budgetdate.value)){
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
