const MAX_DIGIT = 16;

function addDigit(num, digit_to_add) {

    if ((num === '0' && ['0', '000'].includes(digit_to_add)) || (num.includes('.') && digit_to_add === '.') || (num.replace('-', '') + digit_to_add).length > MAX_DIGIT) return num;

    if (num === '0' && digit_to_add !== '.') num = '';

    return num += digit_to_add;
}

function factorial(num) {
    num = Math.trunc(num);

    if (num < 0) throw new Error("Factorial is undefined for negative numbers");
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
    let expressionResult = '';
    let selectedOperation = null;
    let ifError = false;
    let memoryRegister = 0;

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
    const digitButtons = document.querySelectorAll('[id ^= "btn_digit_"]');

    function getCurrentScreenValue() {
        if (selectedOperation) {
             return b === '' ? 0 : Number(b);
        }
        return a === '' ? 0 : Number(a);
    }

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
            ifError = true;
        }
    }

    Object.keys(unaryManeuvers).forEach(operationId => {
        const button = document.getElementById(operationId);
        if (button) {
            button.addEventListener('click', onUnaryButtonClicked);
        }
    })

    function onBinaryButtonClicked(event) {
        if (ifError) return;

        if (a === '') return;
        selectedOperation = event.currentTarget.id;

        displayNumber('0');
    }

    Object.keys(binaryManeuvers).forEach(operationId => {
        const button = document.getElementById(operationId);
        if (button) {
            button.addEventListener('click', onBinaryButtonClicked);
        }
    })

    function proccessResultValue(result) {
        const numResult = Number(result);
        if (Math.abs(numResult) >= Math.pow(10, MAX_DIGIT - 1)) {
            ifError = true;
            return Infinity;
        } else if (Math.abs(numResult) < Math.pow(10, -(MAX_DIGIT - 1))) {
            return 0;
        } else if (isNaN(numResult)) {
            ifError = true;
            return NaN;
        } else if (numResult.toString().length > MAX_DIGIT) {
            return Math.round(numResult, MAX_DIGIT - Math.trunc(MAX_DIGIT) - 1);
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

    function onDigitButtonClicked(digit) {
        if (ifError) return;

        if (!selectedOperation) {
            a = addDigit(a, digit);
            displayNumber(a);
        } else {
            b = addDigit(b, digit);
            displayNumber(b);
        }
    }

    digitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const digitValue = button.innerHTML;
            onDigitButtonClicked(digitValue);
        })
    })

    document.getElementById('btn_op_all_clear').addEventListener('click', function() {
        a = '';
        b = '';
        selectedOperation = '';
        expressionResult = '';
        ifError = false;
        displayNumber(a);
    })

    document.getElementById('btn_op_clear_entry').onclick = function() {
        if (!selectedOperation) {
            if (a === '') return;
            a = a.slice(0, -1);
            displayNumber(a);
        } else {
            if (b === '') return;
            b = b.slice(0, -1);
            displayNumber(b);
        }
    }

    document.getElementById('btn_op_equal').addEventListener('click', () => {
        if (ifError || a === '' || b === '' || !selectedOperation) return;

        let rawResult = 0
        try {
            rawResult = binaryManeuvers[selectedOperation](+a, +b);
        } catch (e) {
            ifError = true;
            return;
        }

        let expressionResult = proccessResultValue(rawResult);

        a = expressionResult.toString();
        b = '';
        selectedOperation = null;

        displayNumber(a);
    })

    document.getElementById('btn_mem_plus').addEventListener('click', () => {
        if (ifError) return;
        memoryRegister += getCurrentScreenValue();
    })

    document.getElementById('btn_mem_minus').addEventListener('click', () => {
        if (ifError) return;
        memoryRegister -= getCurrentScreenValue();
    })

    document.getElementById('btn_mem_clear').addEventListener('click', () => {
        memoryRegister = 0;
    })

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
    })

    const btnDisplayColor = document.getElementById('btn_display_color');

    if (btnDisplayColor) {
        btnDisplayColor.addEventListener('click', () => {
            outputElement.classList.toggle('accent-theme');
        })
    }
})
