
/*Mục đích: Quản lý và cập nhật giao diện người dùng (UI) dựa trên trạng thái của ứng dụng.
Toàn bộ logic xử lý cho Menu, Tabs (History/Memory) cũng nên ở đây.*/


// =================================================================
//  CÁC HÀM CẬP NHẬT GIAO DIỆN (UI/DOM FUNCTIONS)
// =================================================================

/** Cập nhật toàn bộ màn hình hiển thị của máy tính */
const updateDisplay = () => {
    // Cập nhật màn hình chính và phụ
    const currentEl = document.getElementById('current-operand');
    const previousEl = document.getElementById('previous-operand');
    currentEl.innerText = formatNumber(currentOperand) || '0';
    if (operation != null) {
        previousEl.innerText = `${formatNumber(previousOperand)} ${getDisplayOperator(operation)}`;
    } else {
        previousEl.innerText = '';
    }

    // Cập nhật chỉ báo Memory "M"
    const memoryIndicatorEl = document.getElementById('memory-indicator');
    if (memoryValue !== 0) {
        memoryIndicatorEl.innerText = 'M';
    } else {
        memoryIndicatorEl.innerText = '';
    }
    
    // Cập nhật panel Memory
    updateMemoryPanel();

    // Cập nhật trạng thái các nút (khóa khi là Infinity)
    const num = parseFloat(currentOperand);
    if (!isFinite(num) && !isNaN(num)) {
        updateButtonStates('infinity');
    } else {
        updateButtonStates('normal');
    }
};

/** Định dạng số để hiển thị (thêm dấu phẩy, ký hiệu khoa học) */
const formatNumber = (number) => {
    if (number === '' || number == null) return '';
    const num = parseFloat(number);
    if (isNaN(num)) return 'Error';

    const upperThreshold = 1e12; 
    const lowerThreshold = 1e-6;

    if (num !== 0 && (Math.abs(num) >= upperThreshold || Math.abs(num) < lowerThreshold)) {
        return num.toExponential(6);
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
};

/** Chuyển ký hiệu toán tử sang dạng hiển thị đẹp hơn */
const getDisplayOperator = (op) => {
    switch(op) {
        case '*': return '×';
        case '/': return '÷';
        default: return op;
    }
};

/** Thêm một mục mới vào panel Lịch sử */
const addToHistory = (expression, result) => {
    const historyContentEl = document.getElementById('history-content');
    const initialMessage = historyContentEl.querySelector('p');
    if (initialMessage) {
        initialMessage.remove();
    }
    const historyItem = document.createElement('div');
    historyItem.classList.add('text-right', 'p-2', 'rounded-md', 'hover:bg-gray-300', 'dark:hover:bg-gray-700', 'cursor-pointer');
    historyItem.innerHTML = `
        <p class="text-gray-600 dark:text-gray-400 text-sm">${expression}</p>
        <p class="text-gray-900 dark:text-gray-100 text-2xl font-semibold">${result}</p>
    `;
    historyContentEl.prepend(historyItem);
};

/** Cập nhật giao diện của panel Memory */
const updateMemoryPanel = () => {
    const memoryContentEl = document.getElementById('memory-content');
    memoryContentEl.innerHTML = ''; // Xóa nội dung cũ

    if (memoryValue === 0) {
        memoryContentEl.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">There\'s nothing saved in memory</p>';
    } else {
        const memoryItem = document.createElement('div');
        memoryItem.classList.add('text-right', 'p-2', 'rounded-md', 'cursor-pointer', 'hover:bg-gray-300', 'dark:hover:bg-gray-700');
        memoryItem.innerHTML = `<p class="text-gray-900 dark:text-gray-100 text-2xl font-semibold">${formatNumber(memoryValue)}</p>`;
        
        memoryItem.addEventListener('click', () => {
            currentOperand = memoryValue.toString();
            resultDisplayed = true; 
            updateDisplay();
        });

        memoryContentEl.appendChild(memoryItem);
    }
};

/** Bật/tắt các nút dựa trên trạng thái (bình thường hoặc vô cực) */
const updateButtonStates = (state) => {
    const buttonsToToggle = document.querySelectorAll(
        'button:not([data-action="clear"]):not([data-action="clear-entry"])'
    );
    const shouldDisable = (state === 'infinity');

    buttonsToToggle.forEach(button => {
        button.disabled = shouldDisable;
        if (shouldDisable) {
            button.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            button.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
};