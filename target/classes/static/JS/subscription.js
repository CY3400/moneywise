document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/subscription";
    const descUrl = "http://localhost:8080/api/description";

    const addButton=document.getElementById("subscription_btn");
    const SubscriptionTable = document.querySelector("#SubscriptionTable tbody");

    addButton.addEventListener("click", function () {
        var desc = '';
        if (description.value == ''){
            desc = Group_Description.value;
        }
        else{
            const newDescription = {
                description: description.value,
                type: 2
            }
            fetch(descUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newDescription)
            })
            .then(response => response.json())
            .then(data => {
                desc = data.id;
            })
            .catch(error => console.error("Erreur lors de l'ajout :", error));
        }
        if (subid.value == '' && (Group_Description.value != '' || description.value != '') && amount.value != '' && subscription_date.value != '' && is_Repeat.value != ''){
            const newSubscription = {
                desc_id: desc,
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
                description.value = "";
                amount.value = "";
                subscription_date.value = "";
                is_Repeat.value = "";
            })
            .catch(error => console.error("Erreur lors de l'ajout :", error));
        }
        else if (subid.value != '' && (Group_Description.value != '' || description.value != '') && amount.value != '' && subscription_date.value != '' && is_Repeat.value != ''){
            fetch(`${apiUrl}/${subid.value}`)
                .then(response => response.json())
                .then(newData => {
                    const updatedSubscription = {
                        desc_id: desc,
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
                    description.value = "";
                    amount.value = "";
                    subscription_date.value = "";
                    subid.value = "";
                    is_Repeat.value = "";
                })
                .catch(error => console.error("Erreur lors de la mise à jour :", error));
        }
    });

    function loadSubscriptions() {
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
            .then(data => {
                SubscriptionTable.innerHTML = "";
                data.forEach(subscription => {
                    const row = document.createElement("tr");
                    var paid;
                    var buttons;
                    var rep;

                    if(subscription.paid == 0){
                        paid = `<button class="paid-btn" data-id="${subscription.id}">Pay</button>`;
                        buttons = `<button class="modify-btn" data-id="${subscription.id}">Modify</button>
                                <button class="delete-btn" data-id="${subscription.id}">Delete</button>`
                    }
                    else{
                        paid = 'Paid';
                        buttons = "";
                    }

                    if(subscription.repeat == 1){
                        rep = 'Yes';
                    }
                    else{
                        rep= 'No';
                    }
                    row.innerHTML = `
                        <td>${subscription.description}</td>
                        <td>${subscription.amount} LBP</td>
                        <td>${paid}</td>
                        <td>${rep}</td>
                        <td>${buttons}</td>
                    `;
                    SubscriptionTable.appendChild(row);
                });
            })
        .catch(error => console.error("Erreur lors du chargement des transactions:", error));
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
                    description.value = existingData.description;
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