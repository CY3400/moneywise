document.addEventListener("DOMContentLoaded", function(){
    const apiUrl = "http://localhost:8080/api/description";

    const addButton=document.getElementById("description_btn");
    const DescriptionTable = document.querySelector("#DescriptionTable tbody");
    const description = document.getElementById("description");
    const desc_error = document.getElementById("desc_error");
    const desc_label = document.getElementById("desc_label");
    const type_error = document.getElementById("type_error");
    const type_label = document.getElementById("type_label");

    function buildQueryParams(description, type) {
        const params = new URLSearchParams();
        if (description) params.append("description", description);
        if (type) params.append("type", type);
        return params.toString();
    }
    
    var type =""

    let currentPage = 1;
    const itemsPerPage = 5;
    let allData = [];

    function loadDescriptions(description,type) {
        fetch(`${apiUrl}/filter?${buildQueryParams(description,type)}`)
            .then(response => response.json())
            .then(data => {
                allData = data;
                renderPage();
            })
            .catch(error => console.error("Erreur lors du chargement des transactions:", error));
    }

    function renderPage() {
        DescriptionTable.innerHTML = "";

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = allData.slice(startIndex, endIndex);

        pageData.forEach(description => {
            let type = "";
            if (description.type == 1) {
                type = "Transaction";
            } else if (description.type == 2) {
                type = "Abonnement";
            } else {
                type = "Les deux";
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${description.description}</td>
                <td>${type}</td>
                <td>
                    <button class="modify-btn btn bg-primary" data-id="${description.id}">Modifier</button>
                    <button class="delete-btn btn bg-primary" data-value="${description.status}" data-id="${description.id}">${description.status == 2 ? 'Désactiver' : 'Activer'}</button>
                </td>
            `;
            DescriptionTable.appendChild(row);
        });

        updatePagination();
    }

    function updatePagination() {
        const totalPages = Math.ceil(allData.length / itemsPerPage);
        document.getElementById("pageInfo").textContent = `Page ${currentPage} sur ${totalPages}`;

        document.getElementById("prevPage").disabled = currentPage === 1;
        document.getElementById("nextPage").disabled = currentPage === totalPages;
    }

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


    DescriptionTable.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-btn")) {
            const descId = event.target.dataset.id;
            const descValue = event.target.dataset.value;

            var status = "";

            descValue == 1 ? status = 2 : status = 1;

            fetch(`${apiUrl}/${descId}`)
                .then(response => response.json())
                .then(newData => {
                    const updatedDescription = {
                        ...newData,
                        status: status
                    };
                    return fetch(`${apiUrl}/${descId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedDescription)
                    });
                })
                .then(response => response.json())
                .then(() => loadDescriptions())
                .catch(error => console.error("Erreur lors de la mise à jour :", error));
        }
    });

    DescriptionTable.addEventListener("click", function (event) {
        const descId = event.target.dataset.id;

        if (event.target.classList.contains("modify-btn")) {
            fetch(`${apiUrl}/${descId}`)
                .then(response => response.json())
                .then(existingData => {
                    description.value = existingData.description;
                    descid.value = descId;
                    document.querySelectorAll('input[name="types"]').forEach(radio => {
                        radio.checked = radio.value === String(existingData.type);
                    });
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));
        }
    });

    function checkNull(desc, type){
        var result = 1;

        if(desc == ""){
            desc_error.style.display='contents';
            description.classList.add('border','border-danger');
            desc_label.classList.add('text-danger');
            result = 0;
        }
        else{
            desc_error.style.display='none';
            description.classList.remove('border','border-danger');
            desc_label.classList.remove('text-danger');
        }

        if(!type){
            type_error.style.display='contents';
            type_label.classList.add('text-danger');
            result = 0;
        }
        else{
            type_error.style.display='none';
            type_label.classList.remove('text-danger');
        }

        return result;
    }

    addButton.addEventListener("click", function () {
        const selectedType = document.querySelector('input[name="types"]:checked');

        var notNull = checkNull(description.value, selectedType);

        if(notNull == 1){
            if (descid.value == "") {
                const newDescription = {
                    description: description.value,
                    type: selectedType.value,
                    status: 2
                };
        
                fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newDescription)
                })
                .then(response => response.json())
                .then(() => {
                    description.value = "";
                    document.querySelectorAll('input[name="types"]').forEach(radio => radio.checked = false);
                    loadDescriptions();
                })
                .catch(error => console.error("Erreur lors de l'ajout :", error));
            }
            else {
                fetch(`${apiUrl}/${descid.value}`)
                    .then(response => response.json())
                    .then(newData => {
                        const updatedDescription = {
                            ...newData,
                            description: description.value,
                            type: selectedType.value
                        };
                        return fetch(`${apiUrl}/${descid.value}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(updatedDescription)
                        });
                    })
                    .then(response => response.json())
                    .then(() => loadDescriptions())
                    .then(() => {
                        description.value = "";
                        document.querySelectorAll('input[name="types"]').forEach(radio => radio.checked = false);
                        descid.value = "";
                    })
                    .catch(error => console.error("Erreur lors de la mise à jour :", error));
            }
        }
    });

    description.addEventListener("keyup", function(){
        const selectedType = document.querySelector('input[name="types"]:checked');

        loadDescriptions(description.value,selectedType ? selectedType.value : null);
    });

    document.querySelectorAll('input[name="types"]').forEach(radio => {
        radio.addEventListener('change', function () {
            loadDescriptions(description.value,this.value);
        });
    });

    loadDescriptions(null, null);
})