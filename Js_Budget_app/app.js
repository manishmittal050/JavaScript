var budgetController = (function () {

    var Expense = function (id, desc, value) {
        this.id = id;
        this.description = desc;
        this.value = value;
        this.percentage = -1;
    };


    Expense.prototype.calculatePercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, desc, value) {
        this.id = id;
        this.description = desc;
        this.value = value;
    };


    // var totalExpenses = 0;
    var calculateTotal = function (type) {

        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        });
        data.total[type] = sum;
    }



    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        total: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function (type, des, value) {
            var newItem, ID;

            console.log(type);
            //create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }



            //create new item based on exp and inc
            if (type === 'exp') {
                newItem = new Expense(ID, des, value);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, des, value);
            }

            //pushing the item into the list
            data.allItems[type].push(newItem);

            //returning new element
            return newItem;

        },
        deleteItem: function (type, id) {

            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.total.inc - data.total.exp;

            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }


        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (cur) {

                cur.calculatePercentage(data.total.inc);
            });


        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {

            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage,

            }
        },

        testing: function () {
            console.log(data);
        }
    };



}());




var uiController = (function () {

    var DomStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel:'.budget__title--month',
    };
    var formatNumber= function(num, type) {

        var numSplit, int, dec;

        console.log('type'+type)
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }


        return (type === 'exp' ? '-' : '+') + ' ' + int +'.' +dec;

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getIntput: function () {

            return {
                type: document.querySelector(DomStrings.inputType).value,
                description: document.querySelector(DomStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DomStrings.inputValue).value),
            }
        },

        addListItems: function (obj, type) {

            var html, newHtml, element;

            if (type == 'inc') {
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-' + obj.id + '"><div class="item__description">' + obj.description + '</div><div class="right clearfix">' +
                    '<div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"' +
                    '><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp') {
                element = DomStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-' + obj.id + '"><div class="item__description">' + obj.description + '</div><div class="right clearfix">' +
                    '<div class="item__value">%value%</div><div class="item__percentage">21%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div></div></div>';
            };

            console.log(obj.description);

            newHtml = html.replace('%id%', obj.id);
            newHtml = html.replace("%description%", obj.description);
            newHtml = html.replace('%value%', formatNumber(obj.value,type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        deleteListItems: function (selectorID) {

            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);


        },

        clearFields: function () {

            var fields, fieldArr;

            fields = document.querySelectorAll(DomStrings.inputDescription + ', ' + DomStrings.inputValue);

            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldArr[0].focus();

        },

        getDisplayBudget: function (obj) {

            var type;
            obj.budget>0?type='inc':type='exp';

            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp,type);

            if (obj.percentage > 0) {
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DomStrings.percentageLabel).textContent = '---';
            }

        },
        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DomStrings.expensesPercLabel);

  

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function(){
            var now,year,month,months;

            now=new Date();

            months=['January','February','March','April','May','Jun','July','August','September','Octobar','November','December'];
            year=now.getFullYear();
            month=now.getMonth();

            document.querySelector(DomStrings.dateLabel).textContent=months[month]+' '+year;
        },

        changedType:function(){

            var fields = document.querySelectorAll(
                DomStrings.inputType+','+DomStrings.inputDescription+','+DomStrings.inputValue);

                nodeListForEach(fields,function(cur){
                    cur.classList.toggle('red-focus');
                });
                document.querySelector(DomStrings.inputButton).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DomStrings;
        }
    };


}());


//GLOBAL APP CONTROLLER

var eventController = (function (budgetCtrl, uiCtrl) {

    var setupEventListener = function () {

        var DOM = uiCtrl.getDOMStrings();

        //for detecting the clcik of enter
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',uiCtrl.changedType);

    };


    var updatePercentage = function () {

        //calculate percentage

        budgetCtrl.calculatePercentages();

        //read percentage from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //show updated percentage on ui
        // console.log(percentages);

        uiCtrl.displayPercentages(percentages);



    };



    var updateBudget = function () {
        //CALCULATE BUDGET
        budgetCtrl.calculateBudget();

        //UPDATE BUDGET
        var budget = budgetCtrl.getBudget();

        console.log(budget);

        //SHOW BUDGET ON UI
        uiCtrl.getDisplayBudget(budget);
    }






    var ctrlAddItem = function () {

        var input, newItem;

        // fetching field input data
        input = uiCtrl.getIntput();


        if (input.description != "" && !isNaN(input.value) && input.value > 0) {

            // here we are adding the items to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //adding item on ui
            uiCtrl.addListItems(newItem, input.type);
            //for clearing fields
            uiCtrl.clearFields();
            updateBudget();


            updatePercentage();
        }
    };

    var ctrlDeleteItem = function (event) {

        var itemID, splitID, ID, type;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        console.log(itemID);

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            console.log(type + " :: " + ID);

            //deleting the item  from data structure
            budgetCtrl.deleteItem(type, ID);

            //Delete the item from ui

            uiCtrl.deleteListItems(itemID);

            // update and show the new budget
            updateBudget();

            updatePercentage();


        }

    };

    return {
        init: function () {
            console.log('Application has started');
            uiCtrl.displayMonth();
            uiCtrl.getDisplayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListener();
        }
    }


}(budgetController, uiController));


eventController.init();