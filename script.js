let editingIndex = -1; // Global variable to track the index of the expense being edited
let selectedMonth = ''; // Global variable to track the selected month
const expenses = []; // Global array to store expenses

// This is the function to add and update a expenses
function addOrUpdateExpense(event) {
    event.preventDefault();

    // Get selected month
    selectedMonth = document.getElementById('monthSelect').value;

    // Retrieve form values
    const date = document.getElementById('date').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    // Retrieve existing expenses for the selected month from local storage
    let expenses = JSON.parse(localStorage.getItem(selectedMonth)) || [];

    // Check if we are editing an existing expense
    if (editingIndex > -1) {
        // Update the existing expense
        expenses[editingIndex] = { date, amount, description, category };
        editingIndex = -1; // Reset the editing index
    } else {
        // Create new expense object
        const expense = { date, amount, description, category };
        // Add new expense to the array
        expenses.push(expense);
    }

    // Save updated expenses to local storage
    localStorage.setItem(selectedMonth, JSON.stringify(expenses));

    // Refresh expense list and total
    displayExpenses(selectedMonth);
    calculateTotal(selectedMonth);

    document.getElementById('expenseForm').reset();
}

// Function to display expenses for the selected month
function displayExpenses(month) {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';

    // Retrieve expenses for the selected month from local storage
    const expenses = JSON.parse(localStorage.getItem(month)) || [];

    // Get the selected filter category
    const filterCategory = document.getElementById('filterCategory').value;

    // Filter expenses based on selected category
    const filteredExpenses = filterCategory === 'all' ? expenses : expenses.filter(expense => expense.category === filterCategory);

    // Display each expense in the list
    filteredExpenses.forEach((expense, index) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');

        const row = document.createElement('div');
        row.classList.add('row', 'align-items-center');

        // Expense information column
        const infoColumn = document.createElement('div');
        infoColumn.classList.add('col');
        infoColumn.textContent = `${expense.description} : $${expense.amount.toFixed(2)} - ${expense.category} - ${expense.date}`;
        row.appendChild(infoColumn);

        // Buttons column
        const buttonsColumn = document.createElement('div');
        buttonsColumn.classList.add('col-auto');

        // Create edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('btn', 'btn-secondary', 'btn-sm', 'me-2');
        editButton.onclick = () => showEditModal(month, index);
        buttonsColumn.appendChild(editButton);

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
        deleteButton.onclick = () => deleteExpense(month, index);
        buttonsColumn.appendChild(deleteButton);

        row.appendChild(buttonsColumn);
        li.appendChild(row);
        expenseList.appendChild(li);
    });

    // Calculate and display the total expenses for the filtered list
    calculateFilteredTotal(filteredExpenses);
}

// Function to show the edit modal
function showEditModal(month, index) {
    const expenses = JSON.parse(localStorage.getItem(month)) || [];
    const expense = expenses[index];

    // Populate modal fields with expense data
    document.getElementById('editDate').value = expense.date;
    document.getElementById('editAmount').value = expense.amount;
    document.getElementById('editDescription').value = expense.description;
    document.getElementById('editCategory').value = expense.category;

    // Set the editing index to the current index
    editingIndex = index;

    // Show the modal
    $('#editExpenseModal').modal('show');
}

// Function to handle save changes in modal - for the update function
function saveChanges(event) {
    event.preventDefault();

    // Get form values from modal
    const date = document.getElementById('editDate').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const description = document.getElementById('editDescription').value;
    const category = document.getElementById('editCategory').value;

    // Retrieve existing expenses for the selected month from local storage
    let expenses = JSON.parse(localStorage.getItem(selectedMonth)) || [];

    // Update the existing expense
    expenses[editingIndex] = { date, amount, description, category };

    // Save updated expenses to local storage
    localStorage.setItem(selectedMonth, JSON.stringify(expenses));

    // Refresh expense list and total
    displayExpenses(selectedMonth);
    calculateTotal(selectedMonth);

    // Hide the modal
    $('#editExpenseModal').modal('hide');
}

// Function to delete expense
function deleteExpense(month, index) {
    let expenses = JSON.parse(localStorage.getItem(month)) || [];

    // Remove expense from array
    expenses.splice(index, 1);

    // Save updated expenses to local storage
    localStorage.setItem(month, JSON.stringify(expenses));

    // Refresh expense list
    displayExpenses(month);
    calculateTotal(month);
}

// Function to calculate total expenses for the selected month
function calculateTotal(month) {
    let total = 0;

    // Retrieve expenses for the selected month from local storage
    const expenses = JSON.parse(localStorage.getItem(month)) || [];

    // Calculate total expenses
    expenses.forEach(expense => {
        total += expense.amount;
    });

    // Display total expenses
    const totalElement = document.getElementById('total');
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Function to calculate total expenses for the filtered list
function calculateFilteredTotal(filteredExpenses) {
    let total = 0;

    // Calculate total expenses
    filteredExpenses.forEach(expense => {
        total += expense.amount;
    });

    // Display total expenses
    const totalElement = document.getElementById('total');
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Function to populate month selection dropdown
function populateMonthSelect() {
    const monthSelect = document.getElementById('monthSelect');
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const months = [];

    // Generate list of months for the current year and previous year
    for (let i = 0; i < 12; i++) {
        const month = new Date(currentYear, currentDate.getMonth() - i, 1);
        months.push({
            value: month.toLocaleString('default', { month: 'long' }) + '-' + month.getFullYear(),
            label: month.toLocaleString('default', { month: 'long' }) + ' ' + month.getFullYear()
        });
    }

    // Populate month selection dropdown
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month.value;
        option.textContent = month.label;
        monthSelect.appendChild(option);
    });

    // Set default selected month to current month
    monthSelect.value = currentMonth + '-' + currentYear;

    selectedMonth = document.getElementById('monthSelect').value;
    displayExpenses(selectedMonth);
    calculateTotal(selectedMonth);
}


// FILTER FUNCTION FOR CATEGORY

function generatePDF() { 
    const selectedMonth = document.getElementById('monthSelect').value;
    const expen = JSON.parse(localStorage.getItem(selectedMonth)) || [];

    const totalExpense = document.getElementById('total').textContent;

    const tableData = expen.map(expense => [
        { content: expense.date, styles: { halign: 'center' } },
        { content: expense.description, styles: { halign: 'center' } },
        { content: expense.amount, styles: { halign: 'center' } },
        { content: expense.category, styles: { halign: 'center' } }
    ]);

    const stringMonth = document.getElementById('monthSelect');

    var props = {
        outputType: jsPDFInvoiceTemplate.OutputType.Save,
        returnJsPDFDocObject: true,
        fileName: "Invoice " + stringMonth.value,
        orientationLandscape: false,
        compress: true,
        logo: {
            src: "https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/logo.png",
            type: 'PNG',
            width: 53.33,
            height: 26.66,
            margin: {
                top: 0,
                left: 0
            }
        },
        stamp: {
            inAllPages: true,
            src: "https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/qr_code.jpg",
            type: 'JPG',
            width: 20,
            height: 20,
            margin: {
                top: 0,
                left: 0
            }
        },
        business: {
            name: "Business Name",
            address: "Albania, Tirane ish-Dogana, Durres 2001",
            phone: "(+355) 069 11 11 111",
            email: "email@example.com",
            email_1: "info@example.al",
            website: "www.example.al",
        },
        contact: {
            label: "Invoice issued for:",
            name: "Client Name",
            address: "Albania, Tirane, Astir",
            phone: "(+355) 069 22 22 222",
            email: "client@website.al",
            otherInfo: "www.website.al",
        },
        invoice: {
            label: "Budget Expense: ",
            num: stringMonth.value ,
            invDate: "Payment Date: 01/01/2021 18:12",
            invGenDate: "Invoice Date: 02/02/2021 10:17",
            headerBorder: false,
            tableBodyBorder: false,
            header: [
                { title: "Date", style: { width: 30 } }, 
                { title: "Description", style: { width: 80 } }, 
                { title: "Amount", style: { width: 30 } }, 
                { title: "Category", style: { width: 50 } }
            ],
            table: tableData.map(row => row.map(cell => cell.content)),
            invDescLabel: "Invoice Note -- Total Expense: " + totalExpense,
            invDesc: "There are many",
        },
        footer: {
            text: "The invoice is created on a computer and is valid without the signature and stamp.",
        },
        pageEnable: true,
        pageLabel: "Page ",
    };

    var pdfObject = jsPDFInvoiceTemplate.default(props);

    console.log("Object created: ", pdfObject); 
}

document.getElementById('filterCategory').addEventListener('change', function() {
    displayExpenses(selectedMonth);
});

// Display existing expenses when the page loads
window.onload = function() {
    populateMonthSelect();
};

// Event listener for month selection change
document.getElementById('monthSelect').addEventListener('change', function() {
    selectedMonth = document.getElementById('monthSelect').value;
    displayExpenses(selectedMonth);
    calculateTotal(selectedMonth);
});

// Event listener for expense form submission
document.getElementById('expenseForm').addEventListener('submit', addOrUpdateExpense);

// Event listener for edit expense form submission
document.getElementById('editExpenseForm').addEventListener('submit', saveChanges);
