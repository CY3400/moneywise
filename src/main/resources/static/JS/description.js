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
            const row = document.createElement("tr");
            row.innerHTML = `
                <td contenteditable="true" spellcheck="false" data-id=${description.id} data-original=${description.description} class="editable-name">${description.description}</td>
                <td>
                    <select class="type-select" data-id="${description.id}" data-original=${description.type}>
                        <option value="1" ${description.type == 1 ? "selected" : ""}>Transaction</option>
                        <option value="2" ${description.type == 2 ? "selected" : ""}>Abonnement</option>
                        <option value="3" ${description.type == 3 ? "selected" : ""}>Les deux</option>
                    </select>
                </td>
                <td>
                    <button class="modify-btn btn bg-primary" data-id="${description.id}">Modifier</button>
                    <button class="toggle-btn btn bg-primary" data-value="${description.status}" data-id="${description.id}">${description.status == 2 ? 'Désactiver' : 'Activer'}</button>
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
        let descId, descValue, status = null;

        const selectedType = document.querySelector('input[name="types"]:checked');

        if (event.target.classList.contains("toggle-btn")) {
            descId = event.target.dataset.id;
            descValue = event.target.dataset.value;

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
                .then(() => loadDescriptions(description.value,selectedType ? selectedType.value : null))
                .catch(error => console.error("Erreur lors de la mise à jour :", error));
        }
        else if (event.target.classList.contains("modify-btn")) {
            descId = event.target.dataset.id;
            const row = event.target.closest("tr");
            const nameCell = row.querySelector(".editable-name");
            const newDescription = nameCell.textContent.trim();
            const typeSelect = row.querySelector(".type-select");
            const newType = parseInt(typeSelect.value);

            if(newDescription === ""){
                return;
            }

            nameCell.classList.remove("modified-cell");
            typeSelect.classList.remove("modified-cell");
            row.classList.remove("modified-row");

            fetch(`${apiUrl}/${descId}`)
                .then(response => response.json())
                .then(existingData => {
                    const updatedData = {
                        ...existingData,
                        description: newDescription,
                        type: newType
                    };
                    
                    return fetch(`${apiUrl}/${descId}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(updatedData)
                    })
                })
                .then(() => {
                    loadDescriptions(description.value,selectedType ? selectedType.value : null);
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));
        }

        const td = event.target.closest("td");

        if(td){
            const select = td.querySelector("select");

            if(select){
                select.focus();
                select.click();
            }
        }
    });

    function updateRowModificationStatus(row) {
        const nameCell = row.querySelector(".editable-name");
        const typeSelect = row.querySelector(".type-select");
        const typeTd = typeSelect.closest("td");

        const originalName = nameCell.dataset.original.trim();
        const currentName = nameCell.textContent.trim();

        const originalType = typeSelect.dataset.original;
        const currentType = typeSelect.value;

        const nameChanged = originalName !== currentName;
        const typeChanged = originalType !== currentType;

        if (nameChanged || typeChanged) {
            row.classList.add("modified-row");
        } else {
            row.classList.remove("modified-row");
        }

        nameCell.classList.toggle("modified-cell", nameChanged);
        typeTd.classList.toggle("modified-cell", typeChanged);
    }


    DescriptionTable.addEventListener("input", (event) =>{
        if(event.target.classList.contains("editable-name")){
            updateRowModificationStatus(event.target.closest("tr"));
        }
    });

    DescriptionTable.addEventListener("change", function(event) {
        if (event.target.classList.contains("type-select")) {
            updateRowModificationStatus(event.target.closest("tr"));
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
    });

    description.addEventListener("keyup", function(){
        const selectedType = document.querySelector('input[name="types"]:checked');

        currentPage = 1;

        loadDescriptions(description.value,selectedType ? selectedType.value : null);
    });

    document.querySelectorAll('input[name="types"]').forEach(radio => {
        radio.addEventListener('change', function () {
            currentPage = 1;
            loadDescriptions(description.value,this.value);
        });
    });

    loadDescriptions(null, null);
})