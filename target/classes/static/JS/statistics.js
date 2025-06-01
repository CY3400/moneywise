document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/transaction";

    const statTable = document.querySelector("#statTable tbody");
    var month_select = document.getElementById("month");
    var year_select = document.getElementById("year");

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    function buildQueryParams(month, year) {
        const params = new URLSearchParams();
        if (month) params.append("month", month);
        if (year) params.append("year", year);
        return params.toString();
    }

    month_select.addEventListener("change", function () {
        getTop5Transactions(month_select.value,year_select.value);
        getMDD(month_select.value, year_select.value);
        getMC(month_select.value, year_select.value);
    });

    year_select.addEventListener("change", function () {
        getTop5Transactions(month_select.value,year_select.value);
        getMDD(month_select.value, year_select.value);
        getMC(month_select.value, year_select.value);
    });

    function loadStats(){
        fetch(`${apiUrl}/months`)
            .then(response => response.json())
            .then(data => {
                month.innerHTML = "";
                
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "-- Choisir un mois --";
                month.appendChild(defaultOption);

                data.forEach(months => {
                    const option = document.createElement("option");
                    option.value = months;
                    option.textContent = monthNames[months-1];
                    month.appendChild(option);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des catégories:", error));

            fetch(`${apiUrl}/years`)
            .then(response => response.json())
            .then(data => {
                year.innerHTML = "";
                
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "-- Choisir une année --";
                year.appendChild(defaultOption);

                data.forEach(years => {
                    const option = document.createElement("option");
                    option.value = years;
                    option.textContent = years;
                    year.appendChild(option);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des catégories:", error));
    }

    async function getTop5Transactions(month, year) {
        try{
            const response = await fetch(`${apiUrl}/top5?${buildQueryParams(month,year)}`);

            if(!response.ok){
                throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
            }
            const data = await response.json();

            statTable.innerHTML = `<tr id="no-data-message"><td colspan="2" class="text-muted">Aucun résultat disponible</td></tr>`;

            data.forEach(d => {
                const row = document.createElement("tr");

                row.innerHTML = `<td>${d.description}</td>
                <td>${d.amount} LBP</td>`;

                statTable.appendChild(row);
            });

            const tableBody = document.querySelector('#statTable tbody');
            const noDataRow = document.getElementById('no-data-message');
            const rows = tableBody.querySelectorAll('tr:not(#no-data-message)');

            if (rows.length === 0) {
                noDataRow.style.display = '';
            } else {
                noDataRow.style.display = 'none';
            }
        }
        catch(error){
            console.error(error);
        }
    }

    async function getMDD(month, year) {
        try {
            const response = await fetch(`${apiUrl}/MDD?${buildQueryParams(month,year)}`);
    
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
            }
            const data = await response.json();
    
            data.forEach(d => {
                const date = new Date(d.date);
                const day = date.getDate();
                const month = date.toLocaleString('en-US', { month: 'long' });
                const year = date.getFullYear();
    
                const formattedDate = `${day} ${month} ${year}`;
    
                MDD.innerHTML = `<b>Jour le plus dépensier:</b> ${formattedDate} (${d.amount} LBP)`;
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function getMC(month, year) {
        try {
            const response = await fetch(`${apiUrl}/MC?${buildQueryParams(month,year)}`);
    
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
            }
            const data = await response.json();
    
            data.forEach(d => {
                MC.innerHTML = `<b>Catégorie la plus présente:</b> ${d.description} (${d.count})`;
            });
        } catch (error) {
            console.error(error);
        }
    }

    loadStats();
    getTop5Transactions();
    getMDD();
    getMC();
});