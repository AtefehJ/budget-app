//Budget Controller

var budgetController = (function(){
    
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
       var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
       Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage = -1;
        }  
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
     var calculateTotal = function(type){
         
         var sum = 0;
         data.allItems[type].forEach(function(cur){
             sum += cur.value;
         });
         
         data.totals[type] = sum;
     };
    
    var data = {
        allItems:{
        exp:[],
        inc:[]
          },
        totals:{
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        percentage: -1 // minus one means it doesn't exist at first
    };
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
        
            if(data.allItems[type].length>0){
    
            ID = data.allItems[type][data.allItems[type].length-1].id + 1; // ID = Last ID +1
                }else{
                 ID = 0;
                }
      
            if(type==='inc'){
                newItem = new Income(ID,des,val);
            }else if(type==='exp'){
                newItem = new Expense(ID,des,val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                     return current.id;                     
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
                
        },
        
        calculateBudget: function(){
        
        // calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');
        
        // calculate the budget : income - expenses
        data.budget = data.totals.inc - data.totals.exp;
        // calculate the percentage of income that we spent
        if(data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else{
            data.percentage = -1;
        }
      },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
             cur.calcPercentage(data.totals.inc);            
            });
        },
        
        getPercentage: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function(){
           return{
               budget: data.budget,
               totalInc: data.totals.inc,
               totalExp: data.totals.exp,
               percentage: data.percentage
           };
    },
         
    };

}) ();

//UI Controller
var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel:'.item__percentage',
        dateLabel:'.budget__title--year'
    };
    
    var formatNumber= function(num,type){
            
            var numSplit, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            
            if(int.length > 3){
                int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
            }
            dec = numSplit[1];
            
            return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;
              /* 
            1. '+' sign for income and '-' sig for expenses
            2. exactly two decimal places for numbers
            3. camma seperator for thousand
            */
        };

      var nodeListForEach = function(list , callback){
                for(var i = 0; i<list.length; i++){
                    callback(list[i],i);
                }
            };
    
    return {
        getInput: function(){
            
            return { 
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj,type){
            
            var html,newHtml,element;
            if(type === 'inc'){
                
            element = DOMstrings.incomeContainer;
                
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-close-circled"></i></button></div></div></div>';
            } else if (type === 'exp'){
                
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-close-circled"></i></button></div></div></div>';
                       }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensePercLabel);
            
            nodeListForEach(fields,function(current,index){
                   if(percentages[index]>0){
                       current.textContent = percentages[index] + '%';
                  } else{
                       current.textContent = '---';
                 } 
                
           });
        },
        
        displayDate: function(){
            var now = new Date();
            var month = now.getMonth();
            
            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            
            var year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function(){
            var fields = document.querySelectorAll(
            DOMstrings.inputType + ','+
            DOMstrings.inputDescription + ','+
            DOMstrings.inputValue);
            
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('yellow-focus');
            });  
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('yellow');
        },
                
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
    
}) ();

//Global App controller
var Controller = (function(budgetCtrl,UICtrl){
    
  var setupEventListeners = function(){
      
     var DOM = UICtrl.getDOMstrings(); 
      
     document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem); 
      
     document.addEventListener('keypress',function(event){
    if(event.keyCode === 13 || event.which === 13){
       ctrlAddItem(); 
    }
  });
      
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
};    
    
   var updateBudget = function(){
         
     budgetCtrl.calculateBudget();
     var budget = budgetCtrl.getBudget();
     UICtrl.displayBudget(budget);
         
  };
        
    var updatePercentages = function(){
        //1. Calculate Percentages
        budgetCtrl.calculatePercentages();
        //2.Read percentages from budget controller
        var percentages = budgetCtrl.getPercentage();
        //3.Update the UI with a neaw percentages
        UICtrl.displayPercentages(percentages);
    };
    
  var ctrlAddItem = function(){  
     var input, newItem;
      
     input = UICtrl.getInput();
    //console.log(input);
      
     if(input.description !== "" && !isNaN(input.value) && input.value>0){
         
       newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    
       UICtrl.addListItem(newItem,input.type);
      
       UICtrl.clearFields();
         
       updateBudget();
         
       updatePercentages();
     }
    
 };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); //convert string to an id
            
            //1. Delete the Item from data structure
            budgetController.deleteItem(type,ID);
            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new budget
            updateBudget();
            updatePercentages();
        }
    };
      
return{
    init: function(){
        console.log('Application has started.');
         UICtrl.displayDate();
         UICtrl.displayBudget({
               budget: 0,
               totalInc: 0,
               totalExp: 0,
               percentage: -1
         });
        setupEventListeners();
    }
};

}) (budgetController,UIController);

Controller.init();