document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/transaction";
    const apiCat = "http://localhost:8080/api/category";
    const descUrl = "http://localhost:8080/api/description";
    
    const addButton = document.getElementById("transaction_btn");
    const TransactionTable = document.querySelector("#TransactionTable tbody");

    function loadTransactions() {
        fetch(apiCat)
            .then(response => response.json())
            .then(data => {
                cat.innerHTML = "";
                
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "-- Select a category --";
                cat.appendChild(defaultOption);

                data.forEach(cats => {
                    const option = document.createElement("option");
                    option.value = cats.id;
                    option.textContent = cats.description;
                    cat.appendChild(option);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des catégories:", error));

        fetch(`${apiUrl}/desc`)
            .then(response => response.json())
            .then(data =>{
                Group_Description.innerHTML = "";

                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "-- Select a Description --";
                Group_Description.appendChild(defaultOption);

                data.forEach(desc => {
                    const option = document.createElement("option");
                    option.value = desc.id;
                    option.textContent = desc.description;
                    Group_Description.appendChild(option);
                })
            })

        fetch(`${apiUrl}/per-month`)
            .then(response => response.json())
            .then(async (data) => {
                TransactionTable.innerHTML = "";

                data.forEach(transaction => {
                    const row = document.createElement("tr");

                    const buttons = `
                        <button class="modify-btn" data-id="${transaction.id}">Modify</button>
                        <button class="delete-btn" data-id="${transaction.id}">Delete</button>
                    `;

                    row.innerHTML = `
                        <td>${transaction.description}</td>
                        <td>${transaction.amount} LBP</td>
                        <td>${transaction.category}</td>
                        <td>${buttons}</td>
                    `;

                    TransactionTable.appendChild(row);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des transactions:", error));
    }

    addButton.addEventListener("click", function () {
        const newTransaction = {
            descId: Group_Description.value,
            amount: amount.value,
            cat: cat.value,
            dateTransaction: transaction_date.value
        };

        console.log(newTransaction);

        if (!traid.value && Group_Description.value != '' && amount.value != '' && transaction_date.value != '' && cat.value != '') {
            fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTransaction)
            })
            .then(response => response.json())
            .then(() => {
                Group_Description.value = "";
                amount.value = "";
                transaction_date.value = "";
                cat.value = "";
                loadTransactions();
            })
            .catch(error => console.error("Erreur lors de l'ajout :", error));
        } else if (traid.value && Group_Description.value != '' && amount.value != '' && transaction_date.value != '' && cat.value != '') {
            fetch(`${apiUrl}/${traid.value}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTransaction)
            })
            .then(response => response.json())
            .then(() => {
                Group_Description.value = "";
                amount.value = "";
                transaction_date.value = "";
                traid.value = "";
                cat.value = "";
                loadTransactions();
            })
            .catch(error => console.error("Erreur lors de la mise à jour :", error));
        }
    });

    TransactionTable.addEventListener("click", function (event) {
        const transactionId = event.target.dataset.id;

        if (event.target.classList.contains("modify-btn")) {
            fetch(`${apiUrl}/${transactionId}`)
                .then(response => response.json())
                .then(existingData => {
                    Group_Description.value = existingData.descId;
                    amount.value = existingData.amount;
                    cat.value = existingData.cat;
                    traid.value = transactionId;
                    const dateStr = existingData.dateTransaction;
                if (Date.parse(dateStr)) {
                    const dateObj = new Date(dateStr);
                    transaction_date.value = dateObj.toISOString().split('T')[0];
                } else {
                    console.error("Invalid date format:", dateStr);
                }
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));
        }
        else if (event.target.classList.contains("delete-btn")){
            fetch(`${apiUrl}/${transactionId}`,{
                method: "DELETE",
            })
            .then(() => loadTransactions())
            .catch(error => console.error("Erreur lors de la suppression:", error));
        }
    });

    loadTransactions();
});
