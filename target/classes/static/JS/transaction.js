document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/transaction";
    const apiCat = "http://localhost:8080/api/category";
    const descUrl = "http://localhost:8080/api/description";
    
    const addButton = document.getElementById("transaction_btn");
    const TransactionTable = document.querySelector("#TransactionTable tbody");
    const t_date_from = document.getElementById("transaction_date_from");
    const t_date_to = document.getElementById("transaction_date_to");

    function buildQueryParams(date_from, date_to){
        const params = new URLSearchParams();
        if(date_from) params.append("date_from", date_from);
        if(date_to) params.append("date_to", date_to);
        return params.toString();
    }

    let currentPage = 1;
    const itemsPerPage = 5;
    let allData = [];

    function loadTransactions(date_from, date_to) {
        fetch(apiCat)
            .then(response => response.json())
            .then(data => {
                cat.innerHTML = "";
                
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "-- Choisir une catégorie --";
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
                defaultOption.textContent = "-- Choisir une Description --";
                Group_Description.appendChild(defaultOption);

                data.forEach(desc => {
                    const option = document.createElement("option");
                    option.value = desc.id;
                    option.textContent = desc.description;
                    Group_Description.appendChild(option);
                })
            })

        fetch(`${apiUrl}/per-month?${buildQueryParams(date_from,date_to)}`)
            .then(response => response.json())
            .then(async (data) => {
                allData = data;
                renderPage();
            })
            .catch(error => console.error("Erreur lors du chargement des transactions:", error));
    }

    function renderPage(){
        TransactionTable.innerHTML = `<tr id="no-data-message"><td colspan="5" class="text-muted">Aucun résultat disponible</td></tr>`;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = allData.slice(startIndex, endIndex);

        pageData.forEach(transaction => {
            const row = document.createElement("tr");

            const buttons = `
                <button class="modify-btn btn bg-primary" data-id="${transaction.id}">Modifier</button>
                <button class="delete-btn btn bg-primary" data-id="${transaction.id}">Supprimer</button>`;

            row.innerHTML = `
                <td>${transaction.description}</td>
                <td>${transaction.amount} LBP</td>
                <td>${transaction.date}</td>
                <td>${transaction.category}</td>
                <td>${buttons}</td>
            `;

            TransactionTable.appendChild(row);
        });

        updatePagination();
        toggleNoDataMessage();
    }

    function updatePagination() {
        const totalPages = Math.ceil(allData.length / itemsPerPage);

        document.getElementById("pageInfo").textContent =
            `Page ${totalPages === 0 ? '0' : currentPage} sur ${totalPages}`;

        const prevBtn = document.getElementById("prevPage");
        const nextBtn = document.getElementById("nextPage");

        if (totalPages === 0) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        } else {
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        }
    }

    function toggleNoDataMessage() {
        const tableBody = document.querySelector('#TransactionTable tbody');
        const noDataRow = document.getElementById('no-data-message');
        const rows = tableBody.querySelectorAll('tr:not(#no-data-message)');

        if (rows.length === 0) {
            noDataRow.style.display = '';
        } else {
            noDataRow.style.display = 'none';
        }
    }

    t_date_from.addEventListener('change', function(){
        currentPage = 1;
        loadTransactions(t_date_from.value, t_date_to.value);
    })

    t_date_to.addEventListener('change', function(){
        currentPage = 1;
        loadTransactions(t_date_from.value, t_date_to.value);
    })

    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        const totalPages = Math.ceil(allData.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    });

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
