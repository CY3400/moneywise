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
        let select = `<select data-id="${tId}" data-original="${tCatId}" class="type-select">`;

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
                <td><input type="date" class="form-control transaction-date" data-id="${transaction.id}" value="${transaction.date}"></td>
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

            cell.addEventListener("paste", function(e) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData("text");
                const sanitized = text.replace(/[^0-9.]/g, "");

                const firstDot = sanitized.indexOf(".");
                const withoutExtraDots = sanitized
                    .split("")
                    .filter((c, i) => c !== "." || i === firstDot)
                    .join("");

                document.execCommand("insertText", false, withoutExtraDots);
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
