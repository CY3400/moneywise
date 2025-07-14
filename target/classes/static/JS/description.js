document.addEventListener("DOMContentLoaded", function(){
    const apiUrl = "http://localhost:8080/api/description";

    const addButton=document.getElementById("description_btn");
    const DescriptionTable = document.querySelector("#DescriptionTable tbody");
    const description = document.getElementById("description");
    const desc_error = document.getElementById("desc_error");
    const desc_label = document.getElementById("desc_label");
    const type_error = document.getElementById("type_error");
    const type_label = document.getElementById("type_label");
    let currentPage = 1;
    const itemsPerPage = 5;
    let allData = [];

    function getSelectedType() {
        return document.querySelector('input[name="types"]:checked');
    }

    function resetForm(){
        description.value = "";
        document.querySelectorAll('input[name="types"]').forEach(radio => radio.checked = false);

    }

    function buildQueryParams(description, type) {
        const params = new URLSearchParams();
        if (description) params.append("description", description);
        if (type) params.append("type", type);
        return params.toString();
    }

    function loadDescriptions(description,type) {
        fetch(`${apiUrl}/filter?${buildQueryParams(description,type)}`)
            .then(response => response.json())
            .then(data => {
                allData = data;
                renderPage();
            })
            .catch(error => console.error("Erreur lors du chargement des descriptions:", error));
    }

    function renderPage() {
        DescriptionTable.innerHTML = `<tr id="no-data-message">
                                        <td colspan="3" class="text-muted">Aucun résultat disponible</td>
                                    </tr>`;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = allData.slice(startIndex, endIndex);

        pageData.forEach(description => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td contenteditable="true" spellcheck="false" data-id=${description.id} data-original=${description.description.replace(/\s+/g, '')} class="editable-name">${description.description}</td>
                <td>
                    <select class="type-select" data-id="${description.id}" data-original=${description.type}>
                        <option value="1" ${description.type == 1 ? "selected" : ""}>Transaction</option>
                        <option value="2" ${description.type == 2 ? "selected" : ""}>Abonnement</option>
                        <option value="3" ${description.type == 3 ? "selected" : ""}>Les deux</option>
                    </select>
                </td>
                <td>
                    <button class="modify-btn btn bg-primary" data-id="${description.id}" aria-label="Modifier la catégorie ${description.description}" title="Modifier la description ${description.description}">Modifier</button>
                    <button class="toggle-btn btn bg-primary" data-value="${description.status}" data-id="${description.id}" title="${description.status == 2 ? 'Désactiver' : 'Activer'} la description ${description.description}" aria-label="${description.status == 2 ? 'Désactiver' : 'Activer'} la description ${description.description}">${description.status == 2 ? 'Désactiver' : 'Activer'}</button>
                </td>
            `;
            DescriptionTable.appendChild(row);
        });

        updatePagination();
        toggleNoDataMessage();
    }

    function updatePagination() {
        const totalPages = Math.ceil(allData.length / itemsPerPage);

        document.getElementById("pageInfo").textContent = `Page ${totalPages === 0 ? '0' : currentPage} sur ${totalPages}`;

        const prevBtn = document.getElementById("prevPage");
        const nextBtn = document.getElementById("nextPage");

        prevBtn.classList.toggle("d-none", totalPages <= 1);
        nextBtn.classList.toggle("d-none", totalPages <= 1);

        if (totalPages === 0) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        } else {
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        }
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

        const selectedType = getSelectedType();

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
                .then(() => loadDescriptions(description.value,getSelectedType()?.value || null))
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
                    loadDescriptions(description.value,getSelectedType()?.value || null);
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

    function normalizeText(text) {
        return text.replace(/\s+/g, '');
    }

    function updateRowModificationStatus(row) {
        const nameCell = row.querySelector(".editable-name");
        const typeSelect = row.querySelector(".type-select");
        const typeTd = typeSelect.closest("td");

        const originalName = normalizeText(nameCell.dataset.original);
        const currentName = normalizeText(nameCell.textContent);

        const originalType = typeSelect.dataset.original;
        const currentType = typeSelect.value;

        const nameChanged = originalName.toLowerCase() != currentName.toLowerCase();
        const typeChanged = originalType != currentType;

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
        var isValid = true;

        if(desc == ""){
            desc_error.classList.remove("d-none");
            description.classList.add('border','border-danger');
            desc_label.classList.add('text-danger');
            isValid = false;
        }
        else{
            desc_error.classList.add("d-none");
            description.classList.remove('border','border-danger');
            desc_label.classList.remove('text-danger');
        }

        if(!type){
            type_error.classList.remove("d-none");
            type_label.classList.add('text-danger');
            isValid = false;
        }
        else{
            type_error.classList.add("d-none");
            type_label.classList.remove('text-danger');
        }

        return isValid;
    }

    addButton.addEventListener("click", function () {
        const selectedType = getSelectedType();

        if(checkNull(description.value, selectedType)){
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
                resetForm();
                loadDescriptions("", "");
                showToast('successToast');
            })
            .catch(() => showToast('errorToast'));
        }
    });

    description.addEventListener("keyup", function(){
        const selectedType = getSelectedType();

        currentPage = 1;

        loadDescriptions(description.value,selectedType ? selectedType.value : null);
    });

    document.querySelectorAll('input[name="types"]').forEach(radio => {
        radio.addEventListener('change', function () {
            currentPage = 1;
            loadDescriptions(description.value,this.value);
        });
    });

    function toggleNoDataMessage() {
        const tableBody = document.querySelector('#DescriptionTable tbody');
        const noDataRow = document.getElementById('no-data-message');
        const rows = tableBody.querySelectorAll('tr:not(#no-data-message)');

        if (rows.length === 0) {
            noDataRow.style.display = '';
        } else {
            noDataRow.style.display = 'none';
        }
    }

    function showToast(toasting) {
        const toastElement = document.getElementById(toasting);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    loadDescriptions("", "");
})