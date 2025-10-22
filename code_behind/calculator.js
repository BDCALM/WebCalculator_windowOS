//(Lõi tính toán): Đây là "bộ não" của ứng dụng. Nó chứa các biến trạng thái và các hàm xử lý logic tính toán thuần túy, không trực tiếp thay đổi giao diện.

/*

Các biến và hàm nên có trong file này:

Tất cả các biến trạng thái: currentOperand, previousOperand, operation, memoryValue, resultDisplayed.

Tất cả các hàm logic: calculate(), appendNumber(), chooseOperation(), clear(), clearEntry(), backspace(), handleSpecialAction().
*/
// =================================================================
//  1. KHAI BÁO CÁC BIẾN TRẠNG THÁI (STATE VARIABLES)
// =================================================================

let currentOperand = '';
let previousOperand = '';
let operation = undefined;
let memoryValue = 0;
let resultDisplayed = false;


// =================================================================
//  2. CÁC HÀM LOGIC CỐT LÕI (CORE LOGIC FUNCTIONS)
// =================================================================

/** Xóa toàn bộ trạng thái, đưa máy tính về ban đầu */
const clear = () => {
    currentOperand = '';
    previousOperand = '';
    operation = undefined;
    resultDisplayed = false;
    updateDisplay(); // Cần gọi updateDisplay để reset giao diện
};

/** Chỉ xóa ô nhập liệu hiện tại */
const clearEntry = () => {
    currentOperand = '';
};

/** Xóa ký tự cuối cùng */
const backspace = () => {
    currentOperand = currentOperand.toString().slice(0, -1);
};

/** Nối số hoặc dấu chấm vào toán hạng hiện tại */
const appendNumber = (number) => {
    if (resultDisplayed) {
        currentOperand = '';
        resultDisplayed = false;
    }
    if (number === '.' && currentOperand.includes('.')) return;
    currentOperand = currentOperand.toString() + number.toString();
};

/** Chọn một phép toán */
const chooseOperation = (op) => {
    if (currentOperand === '' && previousOperand === '') return;
    if (currentOperand === '' && previousOperand !== '') {
        operation = op;
        return;
    }
    if (previousOperand !== '') {
        calculate();
    }
    operation = op;
    previousOperand = currentOperand;
    currentOperand = '';
    resultDisplayed = false;
};

/** Thực hiện phép tính chính */
const calculate = () => {
    let computation;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return;
    
    const expression = `${formatNumber(previousOperand)} ${getDisplayOperator(operation)} ${formatNumber(current)} =`;

    switch (operation) {
        case '+': computation = prev + current; break;
        case '-': computation = prev - current; break;
        case '*': computation = prev * current; break;
        case '/': computation = prev / current; break;
        default: return;
    }
    
    addToHistory(expression, formatNumber(computation));
    currentOperand = computation.toString();
    operation = undefined;
    previousOperand = '';
    resultDisplayed = true;
};

/** Xử lý các hành động đặc biệt (%, 1/x, M+, C, CE...) */
const handleSpecialAction = (action) => {
    const current = parseFloat(currentOperand);
    if (isNaN(current) && !['clear', 'clear-entry', 'memory-recall', 'memory-clear'].includes(action)) return;

    switch(action) {
        case 'clear':
            clear();
            break;
        case 'clear-entry':
            clearEntry();
            break;
        case 'backspace':
            backspace();
            break;
        case 'equals': 
            if (operation == null || previousOperand === '') return;
            calculate();
            break;
        case 'negate':
            currentOperand = (current * -1).toString();
            break;
        case 'percent':
            currentOperand = (current / 100).toString();
            break;
        case 'reciprocal':
            currentOperand = (1 / current).toString();
            break;
        case 'square':
            currentOperand = (current * current).toString();
            break;
        case 'sqrt':
            currentOperand = Math.sqrt(current).toString();
            break;
        // Logic cho các nút Memory
        case 'memory-clear':
            memoryValue = 0;
            break;
        case 'memory-recall':
            currentOperand = memoryValue.toString();
            resultDisplayed = true;
            break;
        case 'memory-store':
            memoryValue = parseFloat(currentOperand) || 0;
            resultDisplayed = true;
            break;
        case 'memory-add':
            memoryValue += parseFloat(currentOperand) || 0;
            resultDisplayed = true;
            break;
        case 'memory-subtract':
            memoryValue -= parseFloat(currentOperand) || 0;
            resultDisplayed = true;
            break;
    }
};