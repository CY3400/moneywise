document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/category";

    const addButton=document.getElementById("category_btn");
    const CategoryTable = document.querySelector("#CategoryTable tbody");
    const description = document.getElementById("description");
    const desc_error = document.getElementById("desc_error");
    const desc_label = document.getElementById("desc_label");
    const allowedInputRegex = /^[\p{L}\p{N}\s\-']$/u;
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    let currentPage = 1;
    const itemsPerPage = 5;
    let allData = [];

    function enforceSanitizedInput(element, regex, allowedKeys) {
        element.addEventListener("keydown", function (e) {
            if (!allowedKeys.includes(e.key) && !regex.test(e.key)) {
                e.preventDefault();
            }
        });

        element.addEventListener("paste", function (e) {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData("text");
            const sanitized = [...pasted].filter(c => regex.test(c)).join("");
            document.execCommand("insertText", false, sanitized);
        });
    }

    enforceSanitizedInput(description, allowedInputRegex, allowedKeys);
    CategoryTable.addEventListener("focusin", (e) => {
        if (e.target.classList.contains("editable-name")) {
            enforceSanitizedInput(e.target, allowedInputRegex, allowedKeys);
        }
    });

    function getTotalPages() {
        return Math.ceil(allData.length / itemsPerPage);
    }


    description.addEventListener("input", function () {
        isDescriptionValid(getCleanedDescription());
    });

    function getCleanedDescription() {
        return description.value.trim().replace(/\s+/g, ' ');
    }

    function buildQueryParams(description) {
        const desc = description?.trim();
        return desc ? new URLSearchParams({ description: desc }).toString() : "";
    }

    addButton.addEventListener("click", function () {
        if (isDescriptionValid(getCleanedDescription())){
            const newCategory = {
                description: getCleanedDescription(),
                status: 2
            };
    
            fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory)
            })
            .then(response => response.json())
            .then(() => {
                description.value = "";
                loadCategories();
                showToast('successToast');
            })
            .catch(() => showToast('errorToast'));
        }
    });

    function showToast(toasting) {
        const toastElement = document.getElementById(toasting);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    function loadCategories(description = "") {
        const endpoint = description ? `${apiUrl}/filter?${buildQueryParams(description)}` : apiUrl;

        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                allData = data;
                renderPage();
            })
        .catch(error => console.error("Erreur lors du chargement des transactions:", error));
    }

    function renderPage() {
        CategoryTable.innerHTML = `<tr id="no-data-message">
                                            <td colspan="2" class="text-muted">Aucun résultat disponible</td>
                                        </tr>`;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = allData.slice(startIndex, endIndex);

        pageData.forEach(category => {
            const row = document.createElement("tr");
            var buttons = `<button class="modify-btn btn bg-primary" data-id="${category.id}" title="Modifier la catégorie ${category.description}" aria-label="Modifier la catégorie ${category.description}">Modifier</button>
                        <button class="toggle-btn btn bg-primary" data-value="${category.status}" title="${category.status == 2 ? 'Désactiver' : 'Activer'} la catégorie ${category.description}" aria-label="${category.status == 2 ? 'Désactiver' : 'Activer'} la catégorie ${category.description}" data-id="${category.id}">${category.status == 2 ? 'Désactiver' : 'Activer'}</button>`;
            row.innerHTML = `
                <td contenteditable="true" spellcheck="false" data-id="${category.id}" data-original="${category.description.replace(/\s+/g, '')}" class="editable-name">${category.description}</td>
                <td>${buttons}</td>
            `;
            CategoryTable.appendChild(row);
        });

        updatePagination();
        toggleNoDataMessage();
    }

    function updatePagination() {
        const totalPages = getTotalPages();

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

    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        const totalPages = getTotalPages();
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    });

    function toggleNoDataMessage() {
        const tableBody = document.querySelector('#CategoryTable tbody');
        const noDataRow = document.getElementById('no-data-message');
        const rows = tableBody.querySelectorAll('tr:not(#no-data-message)');

        if (rows.length === 0) {
            noDataRow.style.display = '';
        } else {
            noDataRow.style.display = 'none';
        }
    }

    function isDescriptionValid(desc){
        const isEmpty = desc === "";
        desc_error.classList.toggle("d-none", !isEmpty);
        description.classList.toggle("border", isEmpty);
        description.classList.toggle("border-danger", isEmpty);
        desc_label.classList.toggle("text-danger", isEmpty);
        return !isEmpty;
    }

    CategoryTable.addEventListener("click", function (event) {
        const categoryId = event.target.dataset.id;

        if (event.target.classList.contains("modify-btn")) {
            const row = event.target.closest("tr");
            const nameCell = row.querySelector(".editable-name");
            const newDescription = nameCell.textContent.trim();

            if(newDescription === "") {
                return;
            }

            nameCell.classList.remove("modified-cell");
            row.classList.remove("modified-row");

            fetch(`${apiUrl}/${categoryId}`)
                .then(response => response.json())
                .then(existingData => {
                    const updatedData = {
                        ...existingData,
                        description: newDescription
                    };
                    
                    return fetch(`${apiUrl}/${categoryId}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(updatedData)
                    })
                })
                .then(() => {
                    loadCategories(getCleanedDescription());
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));
        }
        else if(event.target.classList.contains("toggle-btn")){
            const currentStatus = parseInt(event.target.dataset.value);
            const status = currentStatus === 1 ? 2 : 1;

            fetch(`${apiUrl}/${categoryId}`)
                .then(response => response.json())
                .then(existingData => {
                    const updatedDescription = {
                        ...existingData,
                        status: status
                    };
                    return fetch(`${apiUrl}/${categoryId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedDescription)
                    });
                })
                .then(response => response.json())
                .then(() => loadCategories(getCleanedDescription()))
                .catch(error => console.error("Erreur lors de la mise à jour :", error));
        }
    });

    description.addEventListener("keyup", function(){
        currentPage = 1;

        loadCategories(getCleanedDescription());
    });

    function normalizeText(text) {
        return text.trim().replace(/\s+/g, '');
    }

    function updateRowModificationStatus(row) {
        const nameCell = row.querySelector(".editable-name");

        const originalName = normalizeText(nameCell.dataset.original);
        const currentName = normalizeText(nameCell.textContent);

        const nameChanged = originalName.toLowerCase() != currentName.toLowerCase();

        if (nameChanged) {
            row.classList.add("modified-row");
        } else {
            row.classList.remove("modified-row");
        }

        nameCell.classList.toggle("modified-cell", nameChanged);
    }

    CategoryTable.addEventListener("input", function(event) {
        if (event.target.classList.contains("editable-name")) {
            updateRowModificationStatus(event.target.closest("tr"));
        }
    });

    loadCategories();
});