//(File chính/khởi tạo): File này đóng vai trò là "chất kết dính". Nó sẽ khởi tạo ứng dụng, lấy các phần tử HTML, và gắn các sự kiện (event listener) để kết nối các nút bấm trên giao diện với các hàm logic tương ứng.
/*

Mục đích: Khởi chạy ứng dụng và kết nối mọi thứ lại với nhau.

Nội dung nên có trong file này:

Toàn bộ khối document.addEventListener('DOMContentLoaded', ...)

Việc khai báo các hằng số tham chiếu đến phần tử HTML (ví dụ: const currentOperandEl = ...).

Toàn bộ phần "Event Listeners" (document.querySelectorAll(...)).
*/
// Toàn bộ mã sẽ chỉ chạy sau khi trang web đã tải xong hoàn toàn.
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    //  1. THAM CHIẾU ĐẾN CÁC PHẦN TỬ GIAO DIỆN (HTML ELEMENTS)
    // =================================================================
    
    // Màn hình hiển thị
    const currentOperandEl = document.getElementById('current-operand');
    const previousOperandEl = document.getElementById('previous-operand');
    const memoryIndicatorEl = document.getElementById('memory-indicator');

    // Panel Lịch sử & Bộ nhớ
    const historyContentEl = document.getElementById('history-content');
    const memoryContentEl = document.getElementById('memory-content');
    const clearHistoryButton = document.getElementById('clear-history-button');

    // Menu và các nút điều khiển giao diện
    const menuButton = document.getElementById('menu-button');
    const menuPanel = document.getElementById('menu-panel');
    const historyToggleButton = document.getElementById('history-toggle-button');
    const historyPanel = document.getElementById('history-panel');
    const tabs = document.querySelectorAll('.history-tab-button');
    

    // =================================================================
    //  2. GẮN CÁC BỘ LẮNG NGHE SỰ KIỆN (EVENT LISTENERS)
    // =================================================================

    // Gắn sự kiện cho các nút số (0-9 và .)
    document.querySelectorAll('.btn-num').forEach(button => {
        button.addEventListener('click', () => {
            appendNumber(button.innerText);
            updateDisplay();
        });
    });

    // Gắn sự kiện cho các nút toán tử và chức năng
    document.querySelectorAll('.btn-op').forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (target.dataset.operator) {
                chooseOperation(target.dataset.operator);
            } else if (target.dataset.action) {
                handleSpecialAction(target.dataset.action);
            }
            updateDisplay();
        });
    });

    // Gắn sự kiện riêng cho nút bằng (=)
    document.querySelector('[data-action="equals"]').addEventListener('click', () => {
        handleSpecialAction('equals');
        updateDisplay();
    });
    
    // Gắn sự kiện cho nút xóa lịch sử
    clearHistoryButton.addEventListener('click', () => {
        historyContentEl.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">There\'s no history yet</p>';
    });

    // --- Logic cho các thành phần giao diện phụ ---

    // Mở/đóng Menu chế độ
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        menuPanel.classList.toggle('hidden');
    });

    // Mở/đóng panel Lịch sử trên di động
    historyToggleButton.addEventListener('click', () => {
        historyPanel.classList.toggle('hidden');
        historyPanel.classList.toggle('flex');
    });
    
    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!menuPanel.contains(e.target) && !menuButton.contains(e.target)) {
            menuPanel.classList.add('hidden');
        }
    });

    // Chuyển đổi giữa tab History và Memory
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('text-blue-600', 'dark:text-blue-400', 'border-b-2', 'border-blue-600', 'dark:border-blue-400');
                t.classList.add('text-gray-500', 'dark:text-gray-400');
            });
            tab.classList.add('text-blue-600', 'dark:text-blue-400', 'border-b-2', 'border-blue-600', 'dark:border-blue-400');
            tab.classList.remove('text-gray-500', 'dark:text-gray-400');
            
            if(tab.dataset.tab === 'history') {
                historyContentEl.classList.remove('hidden');
                memoryContentEl.classList.add('hidden');
                clearHistoryButton.style.display = 'block';
            } else {
                historyContentEl.classList.add('hidden');
                memoryContentEl.classList.remove('hidden');
                clearHistoryButton.style.display = 'none';
            }
        });
    });

     // Logic chuyển đổi chế độ (Stub)
    document.querySelectorAll('.mode-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newMode = e.target.closest('a').dataset.mode;
            menuPanel.classList.add('hidden');
            alert(`Switched to ${newMode} mode. UI for this mode has not been implemented yet.`);
        });
    });

    // =================================================================
    //  3. KHỞI TẠO ỨNG DỤNG
    // =================================================================
    clear(); // Đặt lại máy tính về trạng thái ban đầu khi tải trang
});