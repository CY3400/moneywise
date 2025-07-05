document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/subscription";
    const descUrl = "http://localhost:8080/api/description";

    const addButton=document.getElementById("subscription_btn");
    const SubscriptionTable = document.querySelector("#SubscriptionTable tbody");

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

    addButton.addEventListener("click", function () {
        var notNull = checkNull(Group_Description.value,amount.value,subscription_date.value);

        if (notNull == 1){
            const newSubscription = {
                descId: Group_Description.value,
                amount: amount.value,
                paid: 0,
                date_finance: subscription_date.value,
                repeat: is_Repeat.value
            };
    
            fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSubscription)
            })
            .then(response => response.json())
            .then(() => loadSubscriptions())
            .then(() => {
                Group_Description.value = "";
                amount.value = "";
                subscription_date.value = "";
                is_Repeat.value = "";
                showToast('successToast');
            })
            .catch(() => showToast('errorToast'));
        }
    });

    function loadSubscriptions() {
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
            
        fetch(`${apiUrl}/per-month`)
            .then(response => response.json())
            .then(async (data) => {
                allData = data;
                renderPage();
            })
        .catch(error => console.error("Erreur lors du chargement des transactions:", error));
    }

    async function generateSelect(tId, tDescId) {
        let select = `<select data-id="${tId}" data-original=${tDescId} class="type-select">`;

        const response = await fetch(`${apiUrl}/desc`);
        const data = await response.json();

        data.forEach(desc => {
            const selected = desc.id === tDescId ? 'selected' : '';
            select += `<option value="${desc.id}" ${selected}>${desc.description}</option>`;
        });

        select += `</select>`;
        return select;
    }

    async function renderPage(){
        SubscriptionTable.innerHTML = `<tr id="no-data-message"><td colspan="6" class="text-muted">Aucun résultat disponible</td></tr>`;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = allData.slice(startIndex, endIndex);

        for (const subscription of pageData) {
            const row = document.createElement("tr");
            var paid;
            var buttons;
            var rep;
            var rep2;

            const selectHTML = await generateSelect(subscription.id,subscription.descId);

            if(subscription.paid == 0){
                paid = `<button class="paid-btn btn bg-primary" data-id="${subscription.id}">Payer</button>`;
                buttons = `<button class="modify-btn btn bg-primary" data-id="${subscription.id}" data-value="1">Modifier</button>
                        <button class="delete-btn btn bg-primary" data-id="${subscription.id}">Supprimer</button>`
            }
            else{
                paid = 'Payé';
                buttons = `<button class="modify-btn btn bg-primary" data-id="${subscription.id}" data-value="2">Modifier</button>`;
            }

            rep = `<select data-id="${subscription.id}" data-original=${subscription.repeat} class="repeat-select">
                <option value="1" ${subscription.repeat === 1 ? 'selected' : ''}>Oui</option>
                <option value="0" ${subscription.repeat === 0 ? 'selected' : ''}>Non</option>
            </select>`;

            if(subscription.repeat == 1){
                rep2 = 'Oui';
            }
            else{
                rep2 = 'Non';
            }

            row.innerHTML = `
                <td>${subscription.paid === 0 ? selectHTML : subscription.description}</td>
                <td contenteditable="${subscription.paid === 0 ? true : false}" spellcheck="false" data-id="${subscription.id}" data-original="${subscription.amount}" class="editable-amount">${subscription.amount}</td>
                <td>${paid}</td>
                <td>${subscription.paid === 1 ? `<input type="date" class="form-control subscription-date" data-id="${subscription.id}" data-original="${subscription.datePaid}" value="${subscription.datePaid}">` : ''}</td>
                <td>${subscription.paid === 0 ? rep : rep2}</td>
                <td>${buttons}</td>
            `;
            SubscriptionTable.appendChild(row);
        };

        updatePagination();
        toggleNoDataMessage();
        attachAmountImputValidation();
    }

    function attachAmountImputValidation() {
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
        })
    }

    function updatePagination() {
        const totalPages = Math.ceil(allData.length / itemsPerPage);

        document.getElementById("pageInfo").textContent = `Page ${totalPages === 0 ? '0' : currentPage} sur ${totalPages}`;

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
        const tableBody = document.querySelector("#SubscriptionTable tbody");
        const noDataRow = document.getElementById('no-data-message');
        const rows = tableBody.querySelectorAll('tr:not(#no-data-message)');

        if (rows.length === 0) {
            noDataRow.style.display = '';
        } else {
            noDataRow.style.display = 'none';
        }
    }

    SubscriptionTable.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-btn")) {
            const subscriptionId = event.target.dataset.id;

            fetch(`${apiUrl}/${subscriptionId}`, {
                method: "DELETE",
            })
                .then(() => loadSubscriptions())
                .catch(error => console.error("Erreur lors de la suppression:", error));
        }
    });

    document.getElementById("prevPage").addEventListener("click", () => {
        if(currentPage > 1) {
            currentPage --;
            renderPage();
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        if(currentPage < totalPages) {
            currentPage ++;
            renderPage();
        }
    });

    function checkNull (desc, amounts, dates) {
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
            subscription_date.classList.add('border','border-danger');
            date_label.classList.add('text-danger');
            result = 0;
        }
        else {
            date_error.classList.add("d-none");
            subscription_date.classList.remove('border','border-danger');
            date_label.classList.remove('text-danger');
        }

        return result;
    }

    function updateRowModificationStatus(row){
        const amountCell = row.querySelector(".editable-amount");
        const typeCell = row.querySelector(".type-select");
        const typeTd = typeCell !== null ? typeCell.closest("td") : null;
        const repeatCell = row.querySelector(".repeat-select");
        const repeatTd = repeatCell !== null ? repeatCell.closest("td") : null;
        const dateCell = row.querySelector(".subscription-date");
        const dateTd = dateCell !== null ? dateCell.closest("td") : null;

        const originalAmount = amountCell.dataset.original;
        const currentAmount = amountCell.textContent;

        const originalType = typeCell !== null ? typeCell.dataset.original : null;
        const currentType = typeCell !== null ? typeCell.value : null;

        const originalRepeat = repeatCell !== null ? repeatCell.dataset.original : null;
        const currentRepeat = repeatCell !== null ? repeatCell.value : null;

        const originalDate = dateCell !== null ? dateCell.dataset.original : null;
        const currentDate = dateCell !== null ? dateCell.value : null;

        const amountChanged = originalAmount != currentAmount;
        const typeChanged = originalType != currentType;
        const repeatChanged = originalRepeat != currentRepeat;
        const dateChanged = originalDate != currentDate;

        if(amountChanged || typeChanged || repeatChanged || dateChanged){
            row.classList.add("modified-row");
        }
        else{
            row.classList.remove("modified-row");
        }

        amountCell.classList.toggle("modified-cell", amountChanged);

        if (typeTd !== null) {
            typeTd.classList.toggle("modified-cell", typeChanged);
        }

        if (repeatTd !== null) {
            repeatTd.classList.toggle("modified-cell", repeatChanged);
        }

        if (dateTd !== null) {
            dateTd.classList.toggle("modified-cell", dateChanged);
        }
    }

    SubscriptionTable.addEventListener("click", function (event) {
        if (event.target.classList.contains("paid-btn")) {
            const today = new Date();
            const subscriptionId = event.target.dataset.id;

            fetch(`${apiUrl}/${subscriptionId}`)
                .then(response => response.json())
                .then(existingData => {
                    const updatedSubscription = {
                        ...existingData,
                        paid: 1,
                        paidDate: today.toISOString().split('T')[0]
                    };
                    return fetch(`${apiUrl}/${subscriptionId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedSubscription)
                    });
                })
                .then(response => response.json())
                .then(() => loadSubscriptions())
                .catch(error => console.error("Erreur lors de la mise à jour :", error));
        }
    });

    SubscriptionTable.addEventListener("click", function (event) {
        const subscriptionId = event.target.dataset.id;

        const value = event.target.dataset.value;

        if (event.target.classList.contains("modify-btn")) {
            const row = event.target.closest("tr");

            var amountCell, newAmount, typeCell, newType, repeatCell, newRepeat, dateCell, newDate;

            if (value == 1) {
                amountCell = row.querySelector(".editable-amount");
                newAmount = amountCell.textContent.trim();
                typeCell = row.querySelector(".type-select");
                newType = parseInt(typeCell.value);
                repeatCell = row.querySelector(".repeat-select");
                newRepeat = parseInt(repeatCell.value);
            }
            else {
                dateCell = row.querySelector(".subscription-date");
                newDate = dateCell.value;
            }

            if((newAmount == "" && value == 1) || (newDate == "" && value == 2)){
                return;
            }

            if (value == 1) {
                amountCell.classList.remove("modified-cell");
                typeCell.classList.remove("modified-cell");
                repeatCell.classList.remove("modified-cell");

                fetch(`${apiUrl}/${subscriptionId}`)
                .then(response => response.json())
                .then(existingData => {
                    const updatedData = {
                        ...existingData,
                        descId: newType,
                        amount: newAmount,
                        repeat: newRepeat
                    };

                    return fetch(`${apiUrl}/${subscriptionId}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(updatedData)
                    })
                })
                .then(() => {
                    loadSubscriptions();
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));
            }
            else {
                dateCell.classList.remove("modified-cell");

                fetch(`${apiUrl}/${subscriptionId}`)
                .then(response => response.json())
                .then(existingData => {
                    const updatedData = {
                        ...existingData,
                        paidDate: newDate
                    };

                    return fetch(`${apiUrl}/${subscriptionId}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(updatedData)
                    })
                })
                .then(() => {
                    loadSubscriptions();
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));
            }
        
            row.classList.remove("modified-row");
        }
    });

    SubscriptionTable.addEventListener("input", (event) => {
        if(event.target.classList.contains("editable-amount")){
            updateRowModificationStatus(event.target.closest("tr"));
        }
    });

    SubscriptionTable.addEventListener("change", (event) => {
        if(event.target.classList.contains("type-select") || event.target.classList.contains("repeat-select") || event.target.classList.contains("subscription-date")){
            updateRowModificationStatus(event.target.closest("tr"));
        }
    });

    function showToast(toasting) {
        const toastElement = document.getElementById(toasting);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    loadSubscriptions();
});