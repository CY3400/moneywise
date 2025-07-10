document.addEventListener("DOMContentLoaded", function () {
    const apiBudget = "http://localhost:8080/api/budget";
    const apiSubscription = "http://localhost:8080/api/subscription";
    const apiTransaction = "http://localhost:8080/api/transaction/category";
    const apiToday = "http://localhost:8080/api/transaction/today";

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Séptembre", "Octobre", "Novembre", "Décembre"];
    let budgets = 0;
    let sum_sub = 0;
    let tra = 0;
    let exp = 0;
    let sav = 0;
    let bE = 0;
    let date;
    let month;
    let year;
    let monthName;
    const today = new Date();
    const currentDay = today.getDate();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const nb_days = lastDay - currentDay + 1;

    function load() {

        Promise.all([
            fetch(`${apiBudget}/per-month`).then(response => response.json()),
            fetch(`${apiSubscription}/per-month`).then(response => response.json()),
            fetch(`${apiTransaction}/1`).then(response => response.json()),
            fetch(`${apiTransaction}/4`).then(response => response.json())
        ])
        .then(([budgetData, subscriptionData, transactionData, bEData]) => {
            if (budgetData.length > 0) {
                date = new Date(budgetData[budgetData.length - 1].date);
                month = date.getMonth();
                year = date.getFullYear();
                monthName = monthNames[month];

                if(bEData.length > 0){
                    bEData.forEach(element => {
                        bE += element.amount;
                    });
                }

                B_E.innerHTML=`<b>Big Expenses:</b> ${bE} LBP`;

                if(transactionData.length > 0){
                    transactionData.forEach(element => {
                        tra += element.amount;
                    });
                }
                budgets = budgetData[budgetData.length - 1].budget;
                Total_Gain.innerHTML = `<b>Total Gains:</b> ${tra} LBP`;

                h2_budget.innerHTML += ` (${monthName} ${year})`;
                h2_sub.innerHTML += ` (${monthName} ${year})`;
                h2_exp.innerHTML += ` (${monthName} ${year})`;
                h2_money.innerHTML += ` (${monthName} ${year})`;
                Month_Budget.innerHTML = `<b>Total Budget:</b> ${budgets} LBP`;
            }

            if (subscriptionData.length > 0) {

                subscriptionData.forEach(element => {
                    sum_sub += element.amount;
                });

                Total_Subscription.innerHTML = `<b>Total Subscriptions:</b> ${sum_sub} LBP`;
                Total_Sub.innerHTML = Total_Subscription.innerHTML;
            }

            const BL = budgets + tra - sum_sub;
            exp = (tra-sum_sub)/2;
            sav = BL - exp*2 - bE;
            Budget_Left.innerHTML = `<b>Budget Left:</b> ${BL} LBP`;
            Savings.innerHTML = `<b>Savings:</b> ${sav} LBP`;
            Money_Saving.innerHTML = Savings.innerHTML;
            U_Exp.innerHTML = `<b>Unexpected Expenses:</b> ${exp} LBP`;
            P_Exp.innerHTML = `<b>Personal Expenses:</b> ${exp} LBP`;
            Total_Exp_U.innerHTML = U_Exp.innerHTML
            Total_Exp_P.innerHTML = P_Exp.innerHTML

            getExp(2);
            getExp(3);
            getTotal();
        })
        .catch(error => console.error("Erreur lors du chargement :", error));
        
    }

    async function getTotal(){
        let tP;
        let result;
        let today;
        let i;
        let total = 0;
        let bE = 0;
        let totalPaid = await getTotalPaid(0);

        console.log(totalPaid);

        for(i=2; i <= 3; i++){
            tP = 0;
            result = 0;
            today = await getToday(i);

            await fetch(`${apiTransaction}/${i}`)
                .then(response => response.json())
                .then(existingData => {
                    existingData.forEach(element => {
                        tP += element.amount;
                    });

                    result = exp - tP;
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));

            total += result;
        }
        
        Money_Total.innerHTML = `<b>Total Money Left:</b> ${total+sav-bE+totalPaid} LBP`;
    }

    async function getTotalPaid(p){
        let totalPaid = 0;
        const apiSubPaid = `${apiSubscription}/paid/${p}`;
    
        try {
            const response = await fetch(apiSubPaid);
            const existingData = await response.json();
    
            existingData.forEach(element => {
                totalPaid += element.amount;
            });
    
            if(p == 1){
                Total_Paid.innerHTML = `<b>Total Subscription Paid: </b>${totalPaid} LBP`;
            } else {
                Total_Not_Paid.innerHTML = `<b>Total Subscription Unpaid: </b>${totalPaid} LBP`;
                Money_S.innerHTML = Total_Not_Paid.innerHTML;
            }
    
            return totalPaid;
    
        } catch(error) {
            console.error("Erreur lors de la récupération :", error);
            return 0;
        }
    }    

    async function getExp(p){
        let totalPaid = 0;
        let result = 0;
        let today = await getToday(p);

        fetch(`${apiTransaction}/${p}`)
                .then(response => response.json())
                .then(existingData => {
                    existingData.forEach(element => {
                        totalPaid += element.amount;
                    });

                    result = exp - totalPaid;

                    let result2 = (result + today)/nb_days;

                    result2 -= result2%5000;

                    result2 -= today;

                    if (result2 < 0){
                        result2 = 0;
                    }

                    if(p==2){
                        Exp_U.innerHTML = `<b>Unexpected Expenses Paid: </b>${totalPaid} LBP`;
                        Prcnt_Exp_U.innerHTML = `<b>Unexpected Expenses Left: </b>${result} LBP`;
                        Money_U.innerHTML = Prcnt_Exp_U.innerHTML;
                        Daily_U.innerHTML = `<b>Unexpected Expenses Recommended Today: </b>${result2} LBP`;
                    }
                    else{
                        Exp_P.innerHTML = `<b>Personal Expenses Paid: </b>${totalPaid} LBP`;
                        Prcnt_Exp_P.innerHTML = `<b>Personal Expenses Left: </b>${result} LBP`;
                        Money_P.innerHTML = Prcnt_Exp_P.innerHTML;
                        Daily_P.innerHTML = `<b>Personal Expenses Recommended Today: </b>${(result2)} LBP`;
                    }
                })
                .catch(error => console.error("Erreur lors de la récupération :", error));
    }

    async function getToday(t){
        var total_today = 0;

        try{
            const response = await fetch(`${apiToday}/${t}`);
            const existingData = await response.json();

            existingData.forEach(element => {
                total_today += element.amount;
            });
        }
        catch(error){
            console.error("Erreur lors de la récupération :", error);
        };

        return total_today;
    }

    load();
    getTotalPaid(1);
    getTotalPaid(0);
});