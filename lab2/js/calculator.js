const MAX_DIGIT = 16;

function addDigit(num, digit_to_add) {
    if ((num === '0' && ['0', '000'].includes(digit_to_add)) || (num.includes('.') && digit_to_add === '.') || (num.replace('-', '') + digit_to_add).length > MAX_DIGIT) return num;
    if (num === '0' && digit_to_add !== '.') num = '';
    return num += digit_to_add;
}

function factorial(num) {
    num = Math.trunc(num);
    if (num < 0) return NaN;
    if (num === 0 || num === 1) return 1;
    let result = num;
    while (num > 1) {
        num--;
        result *= num;
    }
    return result;
}

document.addEventListener('DOMContentLoaded', () => {
    let a = '0';
    let b = '0';
    let selectedOperation = null;
    let ifError = false;
    let memoryRegister = 0;
    let expressionHistory = '';

    const binaryManeuvers = {
        'btn_op_plus': (x, y) => x + y,
        'btn_op_minus': (x, y) => x - y,
        'btn_op_mult': (x, y) => x * y,
        'btn_op_div': (x, y) => x / y,
        'btn_op_percent': (x, y) => x / 100 * y,
    };

    const unaryManeuvers = {
        'btn_op_sign': x => x * -1,
        'btn_op_sqrt': x => Math.sqrt(x),
        'btn_op_x2': x => x * x,
        'btn_op_factorial': x => factorial(x),
        'btn_op_d2s': x => x / 1.02749
    };

    const errorElement = document.getElementById('error');
    const outputElement = document.getElementById('result');
    const historyElement = document.getElementById('history_display');
    const digitButtons = document.querySelectorAll('[id ^= "btn_digit_"]');

    function updateHistoryDisplay() {
        if (!historyElement) return;

        if (expressionHistory.includes('=')) {
            historyElement.textContent = expressionHistory;
        } else {
            let isValidOp = selectedOperation === 'btn_op_plus' || selectedOperation === 'btn_op_minus';
            let activeInput = (isValidOp && b !== '') ? b : '';
            historyElement.textContent = expressionHistory + activeInput;
        }
    }

    function getCurrentScreenValue() {
        if (selectedOperation) {
             return b === '' ? 0 : Number(b);
        }
        return a === '' ? 0 : Number(a);
    }

    function proccessResultValue(result) {
        const numResult = Number(result);
        if (Math.abs(numResult) >= Math.pow(10, MAX_DIGIT - 1)) {
            ifError = true;
            return Infinity;
        } else if (Math.abs(numResult) > 0 && Math.abs(numResult) < Math.pow(10, -(MAX_DIGIT - 1))) {
            return 0;
        } else if (isNaN(numResult)) {
            ifError = true;
            return NaN;
        } else if (numResult.toString().length > MAX_DIGIT) {
            let intLength = Math.trunc(numResult).toString().length;
            return Number(numResult.toFixed(Math.max(0, MAX_DIGIT - intLength - 1)));
        } else {
            return numResult;
        }
    }

    function displayNumber(number) {
        if (ifError) {
            errorElement.classList.add('show');
        } else {
            errorElement.classList.remove('show');
        }
        outputElement.textContent = (number !== '') ? (number) : '0';
    }

    // --- CONTROLLERS ---
    function onUnaryButtonClicked(event) {
        if (ifError) return;

        try {
            if (selectedOperation) {
                if (b === '') return;
                let rawResult = unaryManeuvers[event.currentTarget.id](+b);
                b = proccessResultValue(rawResult).toString();
                displayNumber(b);
            } else {
                if (a === '') return;
                let rawResult = unaryManeuvers[event.currentTarget.id](+a);
                a = proccessResultValue(rawResult).toString();
                displayNumber(a);
            }
        } catch (e) {
            console.error("Системный сбой:", e);
            ifError = true;
            displayNumber('0');
        }
        updateHistoryDisplay();
    }

    Object.keys(unaryManeuvers).forEach(operationId => {
        const button = document.getElementById(operationId);
        if (button) button.addEventListener('click', onUnaryButtonClicked);
    });

    function onBinaryButtonClicked(event) {
        if (ifError) return;
        if (a === '') return;

        const newOp = event.currentTarget.id;
        const opSymbol = newOp === 'btn_op_plus' ? '+' : (newOp === 'btn_op_minus' ? '-' : null);

        // 1. Модель Истории
        if (opSymbol) {
            if (expressionHistory === '' || expressionHistory.includes('=')) {
                expressionHistory = `${a} ${opSymbol} `;
            } else if (b !== '') {
                expressionHistory += `${b} ${opSymbol} `;
            } else {
                expressionHistory = expressionHistory.slice(0, -2) + opSymbol + ' ';
            }
        }

        if (a !== '' && b !== '' && selectedOperation) {
            try {
                let rawResult = binaryManeuvers[selectedOperation](+a, +b);
                a = proccessResultValue(rawResult).toString();
                b = '';
            } catch (e) {
                console.error("Системный сбой:", e);
                ifError = true;
                return;
            }
        }

        selectedOperation = newOp;
        updateHistoryDisplay();
        displayNumber('0');
    }

    Object.keys(binaryManeuvers).forEach(operationId => {
        const button = document.getElementById(operationId);
        if (button) button.addEventListener('click', onBinaryButtonClicked);
    });

    function onDigitButtonClicked(digit) {
        if (ifError) return;

        if (!selectedOperation) {
            if (expressionHistory.includes('=')) {
                expressionHistory = '';
                a = '0';
            }
            a = addDigit(a, digit);
            displayNumber(a);
        } else {
            b = addDigit(b, digit);
            displayNumber(b);
        }
        updateHistoryDisplay();
    }

    digitButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            onDigitButtonClicked(event.target.textContent);
        });
    });

    document.getElementById('btn_op_all_clear').addEventListener('click', () => {
        a = '0';
        b = '0';
        selectedOperation = null;
        ifError = false;
        expressionHistory = '';
        displayNumber(a);
        updateHistoryDisplay();
    });

    document.getElementById('btn_op_clear_entry').addEventListener('click', () => {
        if (ifError) return;
        if (!selectedOperation) {
            a = a.slice(0, -1) || '0';
            displayNumber(a);
        } else {
            b = b.slice(0, -1) || '0';
            displayNumber(b);
        }
        updateHistoryDisplay();
    });

    document.getElementById('btn_op_equal').addEventListener('click', () => {
        if (ifError || a === '' || b === '' || !selectedOperation) return;

        let rawResult = 0;
        try {
            rawResult = binaryManeuvers[selectedOperation](+a, +b);
        } catch (e) {
            console.error("Системный сбой:", e);
            ifError = true;
            return;
        }

        let expressionResult = proccessResultValue(rawResult);

        if (selectedOperation === 'btn_op_plus' || selectedOperation === 'btn_op_minus') {
            expressionHistory += `${b} = ${expressionResult}`;
            updateHistoryDisplay();
        }

        a = expressionResult.toString();
        b = '';
        selectedOperation = null;
        displayNumber(a);
    });

    document.getElementById('btn_mem_plus').addEventListener('click', () => {
        if (ifError) return;
        memoryRegister += getCurrentScreenValue();
    });

    document.getElementById('btn_mem_minus').addEventListener('click', () => {
        if (ifError) return;
        memoryRegister -= getCurrentScreenValue();
    });

    document.getElementById('btn_mem_clear').addEventListener('click', () => {
        memoryRegister = 0;
    });

    document.getElementById('btn_mem_recall').addEventListener('click', () => {
        if (ifError) return;
        let memString = memoryRegister.toString();
        if (!selectedOperation) {
            a = memString;
            displayNumber(a);
        } else {
            b = memString;
            displayNumber(b);
        }
        updateHistoryDisplay();
    });

    const btnDisplayColor = document.getElementById('btn_display_color');
    if (btnDisplayColor) {
        btnDisplayColor.addEventListener('click', () => {
            outputElement.classList.toggle('accent-theme');
        });
    }
});
