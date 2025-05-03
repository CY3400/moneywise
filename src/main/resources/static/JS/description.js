document.addEventListener("DOMContentLoaded", function(){
    const apiUrl = "http://localhost:8080/api/description";

    const addButton=document.getElementById("description_btn");
    const DescriptionTable = document.querySelector("#DescriptionTable tbody");
    const description = document.getElementById("description");

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
                type = "Subscription";
            } else {
                type = "Both";
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${description.description}</td>
                <td>${type}</td>
                <td>
                    <button class="modify-btn" data-id="${description.id}">Modify</button>
                    <button class="delete-btn" data-id="${description.id}">Delete</button>
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

            fetch(`${apiUrl}/${descId}`, {
                method: "DELETE",
            })
                .then(() => loadDescriptions())
                .catch(error => console.error("Erreur lors de la suppression:", error));
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

    addButton.addEventListener("click", function () {
        const selectedType = document.querySelector('input[name="types"]:checked');

        if (descid.value == "" && description.value != "" && selectedType){
            const newDescription = {
                description: description.value,
                type: selectedType.value
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
        else if (descid.value != "" && description.value != "" && selectedType){
            fetch(`${apiUrl}/${descid.value}`)
                .then(response => response.json())
                .then(newData => {
                    const updatedDescription = {
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
    });

    description.addEventListener("keyup", function(){
        const selectedType = document.querySelector('input[name="types"]:checked');

        loadDescriptions(description.value,selectedType.value);
    });

    document.querySelectorAll('input[name="types"]').forEach(radio => {
        radio.addEventListener('change', function () {
            loadDescriptions(description.value,this.value);
        });
    });

    loadDescriptions(null, null);
})