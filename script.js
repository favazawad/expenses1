const expenseTypes = ['إيجار', 'كهرباء', 'بنزين', 'خضروات', 'مواصلات', 'طعام'];
const incomeTypes = ['راتب', 'هدية', 'استثمار', 'أرباح', 'بيع', 'مكافآت'];

let transactions = JSON.parse(localStorage.getItem('transactions')) || []; // استرجاع المعاملات المحفوظة

// تحديث جدول المعاملات
function updateTransactionTable() {
  const searchInput = document.getElementById('searchInput').value.toLowerCase();
  const filterDate = document.getElementById('filterDate').value;
  const filterType = document.getElementById('filterType').value;

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.subType.toLowerCase().includes(searchInput) ||
                          transaction.date.includes(searchInput);
    const matchesDate = filterDate ? transaction.date === filterDate : true;
    const matchesType = filterType ? transaction.type === filterType : true;
    return matchesSearch && matchesDate && matchesType;
  });

  const tableBody = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = ''; // مسح الجدول القديم

  filteredTransactions.forEach(function(transaction, index) {
    const row = tableBody.insertRow();
    row.insertCell(0).innerText = transaction.type === 'expense' ? 'مصاريف' : 'إيراد';
    row.insertCell(1).innerText = transaction.amount;
    row.insertCell(2).innerText = transaction.subType;
    row.insertCell(3).innerText = transaction.date;

    // إضافة زر حذف
    const deleteCell = row.insertCell(4);
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'حذف';
    deleteButton.style.backgroundColor = '#dc3545';
    deleteButton.addEventListener('click', function() {
      deleteTransaction(index);
    });
    deleteCell.appendChild(deleteButton);
  });
}

// إضافة معاملة جديدة
document.getElementById('addTransaction').addEventListener('click', function() {
  const type = document.getElementById('type').value;
  const subType = document.getElementById('subType').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;

  if (!subType || isNaN(amount) || !date) {
    alert("يرجى إدخال جميع البيانات بشكل صحيح.");
    return;
  }

  // إضافة المعاملة إلى المصفوفة
  transactions.push({ type, subType, amount, date });

  // حفظ البيانات في localStorage
  localStorage.setItem('transactions', JSON.stringify(transactions));

  // تحديث الجدول
  updateTransactionTable();

  // تحديث الملخص المالي
  updateFinancialSummary();

  // مسح الحقول بعد إضافة المعاملة
  document.getElementById('amount').value = '';
  document.getElementById('date').value = '';
  document.getElementById('subType').selectedIndex = 0;
});

// حذف المعاملة
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateTransactionTable();
  updateFinancialSummary();
}

// تحديث الملخص المالي
function updateFinancialSummary() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(function(transaction) {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else if (transaction.type === 'expense') {
      totalExpense += transaction.amount;
    }
  });

  document.getElementById('totalIncome').innerText = totalIncome.toFixed(2);
  document.getElementById('totalExpense').innerText = totalExpense.toFixed(2);
  document.getElementById('balance').innerText = (totalIncome - totalExpense).toFixed(2);
}

// تصدير التقرير إلى Excel
document.getElementById('exportExcel').addEventListener('click', function() {
  const filterDate = document.getElementById('filterDate').value;
  const filterType = document.getElementById('filterType').value;

  const filteredTransactions = transactions.filter(transaction => {
    const matchesDate = filterDate ? transaction.date === filterDate : true;
    const matchesType = filterType ? transaction.type === filterType : true;
    return matchesDate && matchesType;
  });

  const ws = XLSX.utils.json_to_sheet(filteredTransactions.map(transaction => ({
    "النوع": transaction.type === 'expense' ? 'مصاريف' : 'إيراد',
    "المبلغ": transaction.amount,
    "نوع المصروف / الإيراد": transaction.subType,
    "التاريخ": transaction.date
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "التقارير");
  
  XLSX.writeFile(wb, "التقارير.xlsx");
});

// البحث عند النقر على أيقونة البحث
document.getElementById('searchButton').addEventListener('click', function() {
  updateTransactionTable();
});

// تهيئة البيانات عند تحميل الصفحة
updateTransactionTable();
updateFinancialSummary();

// تغيير نوع المصروف أو الإيراد
document.getElementById('type').addEventListener('change', function() {
  const type = this.value;
  const subTypeGroup = document.getElementById('subTypeGroup');
  const subTypeSelect = document.getElementById('subType');
  
  if (type === 'expense') {
    subTypeGroup.style.display = 'block';
    subTypeSelect.innerHTML = expenseTypes.map(type => `<option value="${type}">${type}</option>`).join('');
  } else if (type === 'income') {
    subTypeGroup.style.display = 'block';
    subTypeSelect.innerHTML = incomeTypes.map(type => `<option value="${type}">${type}</option>`).join('');
  }
});
