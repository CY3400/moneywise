document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/category";

    const addButton=document.getElementById("category_btn");
    const CategoryTable = document.querySelector("#CategoryTable tbody");

    addButton.addEventListener("click", function () {
        if (catid.value == "" && description.value != ""){
            const newCategory = {
                description: description.value
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
            })
            .catch(error => console.error("Erreur lors de l'ajout :", error));
        }
        else if (catid.value != "" && description.value != ""){
            fetch(`${apiUrl}/${catid.value}`)
                .then(response => response.json())
                .then(newData => {
                    const updatedCategory = {
                        description: description.value
                    };
                    return fetch(`${apiUrl}/${catid.value}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedCategory)
                    });
                })
                .then(response => response.json())
                .then(() => loadCategories())
                .then(() => {
                    description.value = "";
                    catid.value = "";
                })
                .catch(error => console.error("Erreur lors de la mise à jour :", error));
        }
    });

    function loadCategories() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                CategoryTable.innerHTML = "";
                data.forEach(category => {
                    const row = document.createElement("tr");
                    var buttons = `<button class="modify-btn" data-id="${category.id}">Modify</button>
                                <button class="delete-btn" data-id="${category.id}">Delete</button>`;
                    row.innerHTML = `
                        <td>${category.description}</td>
                        <td>${buttons}</td>
                    `;
                    CategoryTable.appendChild(row);
                });
            })
        .catch(error => console.error("Erreur lors du chargement des transactions:", error));
    }

    CategoryTable.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-btn")) {
            const categoryId = event.target.dataset.id;

            fetch(`${apiUrl}/${categoryId}`, {
                method: "DELETE",
            })
                .then(() => loadCategories())
                .catch(error => console.error("Erreur lors de la suppression:", error));
        }
    });

    CategoryTable.addEventListener("click", function (event) {
        const categoryId = event.target.dataset.id;

        if (event.target.classList.contains("modify-btn")) {
            fetch(`${apiUrl}/${categoryId}`)
                .then(response => response.json())
                .then(existingData => {
                    description.value = existingData.description;
                    catid.value = categoryId;
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));
        }
    });

    loadCategories();
});