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
            })
            .catch(error => console.error("Erreur lors de l'ajout :", error));
        }
        /*else if (subid.value != '' && Group_Description.value != '' && amount.value != '' && subscription_date.value != '' && is_Repeat.value != ''){
            fetch(`${apiUrl}/${subid.value}`)
                .then(response => response.json())
                .then(newData => {
                    const updatedSubscription = {
                        descId: Group_Description.value,
                        amount: amount.value,
                        paid: 0,
                        date_finance: subscription_date.value,
                        repeat: is_Repeat.value
                    };
                    return fetch(`${apiUrl}/${subid.value}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedSubscription)
                    });
                })
                .then(response => response.json())
                .then(() => loadSubscriptions())
                .then(() => {
                    Group_Description.value = "";
                    amount.value = "";
                    subscription_date.value = "";
                    subid.value = "";
                    is_Repeat.value = "";
                })
                .catch(error => console.error("Erreur lors de la mise à jour :", error));
        }*/
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

    async function renderPage(){
        SubscriptionTable.innerHTML = `<tr id="no-data-message"><td colspan="5" class="text-muted">Aucun résultat disponible</td></tr>`;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = allData.slice(startIndex, endIndex);

        for (const subscription of pageData) {
            const row = document.createElement("tr");
            var paid;
            var buttons;
            var rep;

            if(subscription.paid == 0){
                paid = `<button class="paid-btn btn bg-primary" data-id="${subscription.id}">Payer</button>`;
                buttons = `<button class="modify-btn btn bg-primary" data-id="${subscription.id}">Modifier</button>
                        <button class="delete-btn btn bg-primary" data-id="${subscription.id}">Supprimer</button>`
            }
            else{
                paid = 'Payé';
                buttons = "";
            }

            if(subscription.repeat == 1){
                rep = 'Oui';
            }
            else{
                rep= 'Non';
            }
            row.innerHTML = `
                <td>${subscription.description}</td>
                <td>${subscription.amount} LBP</td>
                <td>${paid}</td>
                <td>${rep}</td>
                <td>${buttons}</td>
            `;
            SubscriptionTable.appendChild(row);
        };

        updatePagination();
        toggleNoDataMessage();
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

        if (event.target.classList.contains("modify-btn")) {
            fetch(`${apiUrl}/${subscriptionId}`)
                .then(response => response.json())
                .then(existingData => {
                    Group_Description.value = existingData.descId;
                    amount.value = existingData.amount;
                    const dateObj = new Date(existingData.date_finance);
                    subscription_date.value = dateObj.toISOString().split('T')[0];
                    subid.value = subscriptionId;
                    is_Repeat.value = existingData.repeat;
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));
        }
    });

    loadSubscriptions();
});