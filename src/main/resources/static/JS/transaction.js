document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/transaction";
    const apiCat = "http://localhost:8080/api/category";
    
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

    amount.addEventListener("keydown", function (e) {
        const allowedKeys = [
            "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"
        ];
        const isNumber = e.key >= "0" && e.key <= "9";
        const isDot = e.key === "." && !this.value.includes(".");
        
        if (!allowedKeys.includes(e.key) && !isNumber && !isDot) {
            e.preventDefault();
        }
    });

    amount.addEventListener("input", function () {
        let cleaned = this.value.replace(/[^0-9.]/g, "");

        const parts = cleaned.split(".");
        if (parts.length > 2) {
            cleaned = parts[0] + "." + parts.slice(1).join("");
        }
        this.value = cleaned;
    });

    function loadTransactions(date_from, date_to) {
        fetch(`${apiCat}/active`)
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

    async function generateSelect(tId, tDescId) {
        let select = `<select data-id="${tId}" data-original="${tDescId}" class="type-select">`;

        const response = await fetch(`${apiUrl}/desc`);
        const data = await response.json();

        data.forEach(desc => {
            const selected = desc.id === tDescId ? 'selected' : '';
            select += `<option value="${desc.id}" ${selected}>${desc.description}</option>`;
        });

        select += `</select>`;
        return select;
    }

    async function generateCat(tId, tCatId) {
        let select = `<select data-id="${tId}" data-original="${tCatId}" class="cat-select">`;

        const response = await fetch(`${apiCat}`);
        const data = await response.json();

        data.forEach(desc => {
            const selected = desc.id === tCatId ? 'selected' : '';
            select += `<option value="${desc.id}" ${selected}>${desc.description}</option>`;
        });

        select += `</select>`;
        return select;
    }

    async function renderPage(){
        TransactionTable.innerHTML = `<tr id="no-data-message"><td colspan="5" class="text-muted">Aucun résultat disponible</td></tr>`;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = allData.slice(startIndex, endIndex);

        for(const transaction of pageData) {
            const row = document.createElement("tr");

            const selectHtml = await generateSelect(transaction.id, transaction.descId);

            const selectCat = await generateCat(transaction.id, transaction.catId);

            const buttons = `
                <button class="modify-btn btn bg-primary" data-id="${transaction.id}">Modifier</button>
                <button class="delete-btn btn bg-primary" data-id="${transaction.id}">Supprimer</button>`;

            row.innerHTML = `
                <td>${selectHtml}</td>
                <td contenteditable="true" spellcheck="false" data-id="${transaction.id}" data-original="${transaction.amount}" class="editable-amount">${transaction.amount}</td>
                <td><input type="date" class="form-control transaction-date" data-id="${transaction.id}" data-original="${transaction.date}" value="${transaction.date}"></td>
                <td>${selectCat}</td>
                <td>${buttons}</td>
            `;

            TransactionTable.appendChild(row);
        };

        updatePagination();
        toggleNoDataMessage();
        attachAmountInputValidation();
    }

    function attachAmountInputValidation() {
        document.querySelectorAll(".editable-amount").forEach(cell => {
            cell.addEventListener("keydown", function(e) {
                const allowedKeys = [
                    "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"
                ];

                if (allowedKeys.includes(e.key) || (e.key >= "0" && e.key <= "9") || (e.key === "." && !this.textContent.includes("."))) return;

                e.preventDefault();
            });

            cell.addEventListener("input", function() {
                let value = this.textContent;
                let cleaned = "";
                let hasDot = false;

                for (let char of value) {
                    if (char >= "0" && char <= "9") {
                        cleaned += char;
                    } else if (char === "." && !hasDot) {
                        cleaned += ".";
                        hasDot = true;
                    }
                }

                this.textContent = cleaned;
            });
        });
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

    function checkNull (desc,amounts,dates,cats) {
        var result = 1;

        if (desc == '') {
            desc_error.classList.remove("d-none");
            Group_Description.classList.add('border','border-danger');
            desc_label.classList.add('text-danger');
            result = 0;
        }
        else {
            desc_error.classList.add("d-none");
            Group_Description.classList.remove('border','border-danger');
            desc_label.classList.remove('text-danger');
        }

        if (amounts == '') {
            amount_error.classList.remove("d-none");
            amount.classList.add('border','border-danger');
            amount_label.classList.add('text-danger');
            result = 0;
        }
        else {
            amount_error.classList.add("d-none");
            amount.classList.remove('border','border-danger');
            amount_label.classList.remove('text-danger');
        }

        if (dates == '') {
            date_error.classList.remove("d-none");
            transaction_date.classList.add('border','border-danger');
            date_label.classList.add('text-danger');
            result = 0;
        }
        else {
            date_error.classList.add("d-none");
            transaction_date.classList.remove('border','border-danger');
            date_label.classList.remove('text-danger');
        }

        if (cats == '') {
            cat_error.classList.remove("d-none");
            cat.classList.add('border','border-danger');
            cat_label.classList.add('text-danger');
            result = 0;
        }
        else {
            cat_error.classList.add("d-none");
            cat.classList.remove('border','border-danger');
            cat_label.classList.remove('text-danger');
        }

        return result;
    }

    addButton.addEventListener("click", function () {
        var notNull = checkNull(Group_Description.value,amount.value,transaction_date.value,cat.value);

        if(notNull == 1) {
            const newTransaction = {
                descId: Group_Description.value,
                amount: amount.value,
                cat: cat.value,
                dateTransaction: transaction_date.value
            };

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
                loadTransactions(t_date_from.value, t_date_to.value);
                showToast('successToast');
            })
            .catch(() => showToast('errorToast'));
        }
    });

    function updateRowModificationStatus(row){
        const amountCell = row.querySelector(".editable-amount");
        const typeCell = row.querySelector(".type-select");
        const typeTd = typeCell.closest("td");
        const catCell = row.querySelector(".cat-select");
        const catTd = catCell.closest("td");
        const dateCell = row.querySelector(".transaction-date");
        const dateTd = dateCell.closest("td");

        const originalAmount = amountCell.dataset.original;
        const currentAmount = amountCell.textContent;

        const originalType = typeCell.dataset.original;
        const currentType = typeCell.value;

        const originalCat = catCell.dataset.original;
        const currentCat = catCell.value;

        const originalDate = dateCell.dataset.original;
        const currentDate = dateCell.value;

        const amountChanged = originalAmount != currentAmount;
        const typeChanged = originalType != currentType;
        const catChanged = originalCat != currentCat;
        const dateChanged = originalDate != currentDate;

        if(amountChanged || typeChanged || catChanged || dateChanged){
            row.classList.add("modified-row");
        }
        else{
            row.classList.remove("modified-row");
        }

        amountCell.classList.toggle("modified-cell", amountChanged);
        typeTd.classList.toggle("modified-cell", typeChanged);
        catTd.classList.toggle("modified-cell", catChanged);
        dateTd.classList.toggle("modified-cell", dateChanged);
    }

    TransactionTable.addEventListener("click", function (event) {
        const transactionId = event.target.dataset.id;

        if (event.target.classList.contains("modify-btn")) {
            descId = event.target.dataset.id;
            const row = event.target.closest("tr");
            const amountCell = row.querySelector(".editable-amount");
            const newAmount = amountCell.textContent.trim();
            const typeCell = row.querySelector(".type-select");
            const newType = parseInt(typeCell.value);
            const catCell = row.querySelector(".cat-select");
            const newCat = parseInt(catCell.value);
            const dateCell = row.querySelector(".transaction-date");
            const newDate = dateCell.value;

            if(newAmount === ""){
                return;
            }

            amountCell.classList.remove("modified-cell");
            typeCell.classList.remove("modified-cell");
            catCell.classList.remove("modified-cell");
            dateCell.classList.remove("modified-cell");
            row.classList.remove("modified-row");

            fetch(`${apiUrl}/${descId}`)
                .then(response => response.json())
                .then(existingData => {
                    const updatedData = {
                        ...existingData,
                        descId: newType,
                        amount: newAmount,
                        cat: newCat,
                        date: newDate
                    };
                    
                    return fetch(`${apiUrl}/${descId}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(updatedData)
                    })
                })
                .then(() => {
                    loadTransactions(t_date_from.value, t_date_to.value);
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));
        }
        else if (event.target.classList.contains("delete-btn")){
            fetch(`${apiUrl}/${transactionId}`,{
                method: "DELETE",
            })
            .then(() => loadTransactions(t_date_from.value, t_date_to.value))
            .catch(error => console.error("Erreur lors de la suppression:", error));
        }
    });

    TransactionTable.addEventListener("input", (event) => {
        if(event.target.classList.contains("editable-amount")){
            updateRowModificationStatus(event.target.closest("tr"));
        }
    });

    TransactionTable.addEventListener("change", (event) => {
        if(event.target.classList.contains("type-select") || event.target.classList.contains("cat-select") || event.target.classList.contains("transaction-date")){
            updateRowModificationStatus(event.target.closest("tr"));
        }
    });

    function showToast(toasting) {
        const toastElement = document.getElementById(toasting);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    loadTransactions();
});
