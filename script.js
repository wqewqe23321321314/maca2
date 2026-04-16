// Элементы DOM
const nameInput = document.getElementById('nameInput');
const budgetInput = document.getElementById('budgetInput');
const expensesList = document.getElementById('expensesList');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const calcBtn = document.getElementById('calcBtn');
const resultText = document.getElementById('resultText');

// Функция форматирования рублей
function formatRub(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
}

// Функция обновления состояния кнопок удаления (первую нельзя удалить)
function updateRemoveButtons() {
    const removeBtns = document.querySelectorAll('.remove-expense');
    removeBtns.forEach((btn, idx) => {
        if (idx === 0) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    });
}

// Создание нового элемента траты
function createExpenseItem(nameValue = '', amountValue = '') {
    const div = document.createElement('div');
    div.className = 'expense-item';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'expense-name';
    nameInput.placeholder = 'На что';
    nameInput.value = nameValue;
    
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.className = 'expense-amount';
    amountInput.placeholder = 'Сумма';
    amountInput.value = amountValue;
    amountInput.step = '100';
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✖';
    removeBtn.className = 'remove-expense';
    removeBtn.addEventListener('click', () => {
        div.remove();
        updateRemoveButtons();
    });
    
    div.appendChild(nameInput);
    div.appendChild(amountInput);
    div.appendChild(removeBtn);
    return div;
}

// Добавление новой траты
addExpenseBtn.addEventListener('click', () => {
    const newItem = createExpenseItem('', '0');
    expensesList.appendChild(newItem);
    updateRemoveButtons();
});

// Основной расчёт
function calculateAndShow() {
    // Получаем имя
    let name = nameInput.value.trim();
    if (name === '') name = 'Гость';
    
    // Получаем бюджет
    let budget = parseFloat(budgetInput.value);
    if (isNaN(budget)) budget = 0;
    budget = Math.floor(budget * 100) / 100;
    
    // Собираем траты
    const expenseItems = document.querySelectorAll('.expense-item');
    let totalExpenses = 0;
    const expensesListDetailed = [];
    
    expenseItems.forEach(item => {
        const nameField = item.querySelector('.expense-name');
        const amountField = item.querySelector('.expense-amount');
        let expName = nameField.value.trim();
        if (expName === '') expName = 'трата';
        let expAmount = parseFloat(amountField.value);
        if (isNaN(expAmount)) expAmount = 0;
        expAmount = Math.floor(expAmount * 100) / 100;
        
        totalExpenses += expAmount;
        if (expAmount !== 0) {
            expensesListDetailed.push({ name: expName, amount: expAmount });
        }
    });
    
    // Остаток
    const remainder = budget - totalExpenses;
    const percentSpent = budget > 0 ? (totalExpenses / budget * 100).toFixed(1) : 0;
    
    // Формируем вывод
    let output = `✨ <strong>${name}</strong>, ваш бюджет: <strong>${formatRub(budget)}</strong> ✨<br><br>`;
    
    if (expensesListDetailed.length > 0) {
        output += `📋 <u>Ваши траты:</u><br>`;
        expensesListDetailed.forEach(exp => {
            output += `• ${exp.name}: ${formatRub(exp.amount)}<br>`;
        });
        output += `<br>💸 <strong>Всего потрачено: ${formatRub(totalExpenses)}</strong><br>`;
        output += `📊 Процент бюджета: ${percentSpent}%<br><br>`;
    } else {
        output += `🚫 Трат не введено.<br><br>`;
    }
    
    // Остаток с цветовым акцентом
    if (remainder > 0) {
        output += `✅ <strong style="color:#a5d6a5;">Остаток: ${formatRub(remainder)}</strong> 👍<br>`;
        output += `🎉 Можете отложить или порадовать себя!`;
    } else if (remainder === 0) {
        output += `⚠️ <strong>Остаток: ${formatRub(remainder)}</strong> — точное попадание в ноль.<br>`;
        output += `📌 Бюджет полностью потрачен.`;
    } else {
        output += `❌ <strong style="color:#ffb3b3;">Перерасход: ${formatRub(Math.abs(remainder))}</strong><br>`;
        output += `😟 Вы потратили больше бюджета на ${formatRub(Math.abs(remainder))}. Стоит пересмотреть траты.`;
    }
    
    resultText.innerHTML = output;
    
    // Анимация
    const card = document.querySelector('.result-card');
    card.style.transform = 'scale(0.98)';
    setTimeout(() => card.style.transform = 'scale(1)', 150);
}

// Обработчики
calcBtn.addEventListener('click', calculateAndShow);
nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculateAndShow(); });
budgetInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculateAndShow(); });

// Инициализация: обновляем кнопки удаления (первая заблокирована)
updateRemoveButtons();

// При загрузке показать пример
window.addEventListener('DOMContentLoaded', () => {
    nameInput.value = '';
    budgetInput.value = '10000';
    // Очищаем лишние траты, оставляем одну с примером
    while (expensesList.children.length > 1) {
        expensesList.lastChild.remove();
    }
    const firstItem = expensesList.querySelector('.expense-item');
    if (firstItem) {
        firstItem.querySelector('.expense-name').value = 'Продукты';
        firstItem.querySelector('.expense-amount').value = '3500';
    }
    calculateAndShow();
});
