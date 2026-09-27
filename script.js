const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let expression = '';
let shouldResetDisplay = false;

function updateDisplay(value) {
  display.textContent = value;
}

function appendValue(value) {
  if (shouldResetDisplay) {
    expression = '';
    shouldResetDisplay = false;
  }

  expression += value;
  updateDisplay(expression);
}

function handleOperator(operator) {
  if (!expression) {
    return;
  }

  const lastChar = expression.slice(-1);
  if (['+', '-', '*', '/'].includes(lastChar)) {
    expression = expression.slice(0, -1) + operator;
  } else {
    expression += operator;
  }

  updateDisplay(expression);
}

function clearAll() {
  expression = '';
  shouldResetDisplay = false;
  updateDisplay('0');
}

function deleteLast() {
  if (!expression) {
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay(expression || '0');
}

function applyPercent(currentExpression) {
  if (!currentExpression) {
    return '0';
  }

  const operatorMatch = currentExpression.match(/^(.*?)([+\-*/])([^+\-*/]+)$/);

  if (!operatorMatch) {
    return String(Number(currentExpression) / 100);
  }

  const [, leftPart, operator, rightPart] = operatorMatch;
  const leftValue = Number(leftPart);
  const rightValue = Number(rightPart);

  if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) {
    return 'Error';
  }

  const percentValue = (leftValue * rightValue) / 100;

  switch (operator) {
    case '+':
      return String(leftValue + percentValue);
    case '-':
      return String(leftValue - percentValue);
    case '*':
      return String(leftValue * (rightValue / 100));
    case '/':
      return String(leftValue / (rightValue / 100));
    default:
      return String(Number(currentExpression) / 100);
  }
}

function handlePercent() {
  if (!expression) {
    return;
  }

  const nextExpression = applyPercent(expression);
  expression = nextExpression;

  if (nextExpression === 'Error') {
    shouldResetDisplay = true;
    updateDisplay('Error');
    expression = 'Error';
    return;
  }

  shouldResetDisplay = true;
  updateDisplay(expression);
}

function calculate() {
  if (!expression) {
    return;
  }

  try {
    const result = Function(`"use strict"; return (${expression})`)();
    if (!Number.isFinite(result)) {
      throw new Error('Invalid calculation');
    }

    expression = String(result);
    updateDisplay(expression);
    shouldResetDisplay = true;
  } catch {
    updateDisplay('Error');
    expression = '';
    shouldResetDisplay = true;
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value) {
      if (value === '.' && expression.includes('.') && !/[-+*/]$/.test(expression)) {
        const lastNumber = expression.split(/[+\-*/]/).at(-1);
        if (lastNumber.includes('.')) {
          return;
        }
      }

      appendValue(value);
      return;
    }

    switch (action) {
      case 'clear':
        clearAll();
        break;
      case 'delete':
        deleteLast();
        break;
      case 'percent':
        handlePercent();
        break;
      case 'equals':
        calculate();
        break;
      default:
        break;
    }
  });
});

const operatorButtons = document.querySelectorAll('.operator');
operatorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    handleOperator(button.dataset.value);
  });
});

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    appendValue(key);
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    handleOperator(key);
    return;
  }

  if (key === '.') {
    appendValue('.');
    return;
  }

  if (key === 'Enter' || key === '=') {
    calculate();
    return;
  }

  if (key === 'Backspace') {
    deleteLast();
    return;
  }

  if (key === '%') {
    handlePercent();
    return;
  }

  if (key.toLowerCase() === 'c') {
    clearAll();
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { applyPercent };
}

updateDisplay('0');
