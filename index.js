
            // Cấu hình dark mode cho Tailwind
            tailwind.config = {
                darkMode: 'class',
            }
        document.addEventListener('DOMContentLoaded', () => {
            // Lấy các phần tử HTML quan trọng và gán vào hằng số để dễ sử dụng
            const currentOperandEl = document.getElementById('current-operand');
            const previousOperandEl = document.getElementById('previous-operand');
            const historyContentEl = document.getElementById('history-content');
            const clearHistoryButton = document.getElementById('clear-history-button');

            const memoryIndicatorEl = document.getElementById('memory-indicator'); //For Memory function
            const memoryContentEl = document.getElementById('memory-content');

            // Các biến trạng thái - "bộ nhớ tạm" của máy tính
            let currentOperand = '';    // Số đang được nhập hoặc kết quả của phép tính
            let previousOperand = '';   // Số hạng đầu tiên của phép tính
            let operation = undefined;  // Phép toán được chọn (+, -, *, /)
            // Thêm dòng này vào ngay dưới `let resultDisplayed = false;`
            let memoryValue = 0;
            // *** BIẾN QUAN TRỌNG: Đánh dấu kết quả vừa được hiển thị ***
            // Giúp giải quyết vấn đề: sau khi có kết quả, bấm số mới sẽ bắt đầu phép tính mới.
            let resultDisplayed = false;

            // Thay thế hàm updateDisplay cũ bằng hàm này
            const updateDisplay = () => {
                currentOperandEl.innerText = formatNumber(currentOperand) || '0';
                if (operation != null) {
                    previousOperandEl.innerText = `${formatNumber(previousOperand)} ${getDisplayOperator(operation)}`;
                } else {
                    previousOperandEl.innerText = '';
                }

                if (memoryValue !== 0) {
                    memoryIndicatorEl.innerText = 'M';
                } else {
                    memoryIndicatorEl.innerText = '';
                }
                
                // DÒNG MỚI ĐƯỢC THÊM VÀO ĐỂ CẬP NHẬT TAB MEMORY
                updateMemoryPanel();

                const num = parseFloat(currentOperand);
                if (!isFinite(num) && !isNaN(num)) {
                    updateButtonStates('infinity');
                } else {
                    updateButtonStates('normal');
                }
            };

            const formatNumber = (number) => {
                // Bước 1: Xử lý các trường hợp đầu vào rỗng hoặc không hợp lệ
                if (number === '' || number == null) return '';
               // if (number === '.') {number = 0; return '0';}
                const num = parseFloat(number);
            
                // Bước 2: Đặt ngưỡng để quyết định khi nào dùng ký hiệu khoa học
                // Nếu lớn hơn 1 nghìn tỷ hoặc nhỏ hơn 0.000001
                const upperThreshold = 1e12; 
                const lowerThreshold = 1e-6;

                // Bước 3: Kiểm tra xem số có nằm ngoài ngưỡng hay không
                if (num !== 0 && (Math.abs(num) >= upperThreshold || Math.abs(num) < lowerThreshold)) {
                    // Nếu là số rất lớn hoặc rất nhỏ, dùng toExponential() để hiển thị dạng e^
                    // toExponential(6) sẽ làm tròn đến 6 chữ số sau dấu phẩy, cho độ chính xác tốt
                    return num.toExponential(6);
                }

                // Bước 4: Nếu là số thông thường, dùng toLocaleString để định dạng
                // Đây là cách an toàn và chuẩn xác hơn nhiều so với việc cắt chuỗi thủ công.
                // maximumFractionDigits giúp giới hạn số chữ số thập phân để không làm tràn màn hình.
                return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
            };
            
            const getDisplayOperator = (op) => {
                switch(op) {
                    case '*': return 'x';
                    case '/': return '÷';
                    default: return op;
                }
            };

            const clear = () => {
                currentOperand = '';
                previousOperand = '';
                operation = undefined;
                resultDisplayed = false;
                updateDisplay();
            };

            const clearEntry = () => {
                currentOperand = '';
                updateDisplay();
            };

            const backspace = () => {
                currentOperand = currentOperand.toString().slice(0, -1);
                updateDisplay();
            };
            
            //Được gọi khi người dùng nhấn một nút số (0-9) hoặc dấu chấm (.).
            const appendNumber = (number) => {
                // *** LOGIC CHÍNH ĐÂY ***
                // Nếu kết quả vừa được hiển thị và người dùng bấm một số mới,
                // hãy xóa trạng thái cũ và bắt đầu một phép tính hoàn toàn mới.
                if (resultDisplayed) {
                    currentOperand = '';
                    resultDisplayed = false;
                }

                if (number === '.' && currentOperand.includes('.')) return;
                currentOperand = currentOperand.toString() + number.toString();
            };

            const chooseOperation = (op) => {
                if (currentOperand === '' && previousOperand === '') return;
                if (currentOperand === '' && previousOperand !== '') {
                    operation = op;
                    updateDisplay();
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

            //Mục đích: Thực hiện phép tính khi người dùng nhấn dấu = hoặc khi một phép toán mới được chọn.
            const calculate = () => {
                let computation;
                const prev = parseFloat(previousOperand);
                const current = parseFloat(currentOperand);
                if (isNaN(prev) || isNaN(current)) return;
                
                const expression = `${formatNumber(previousOperand)} ${getDisplayOperator(operation)} ${formatNumber(currentOperand)} =`;

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
                resultDisplayed = true; // Đánh dấu là đã hiển thị kết quả
            };
            
            const updateMemoryPanel = () => {
                // Luôn xóa sạch nội dung cũ trước khi cập nhật
                memoryContentEl.innerHTML = '';

                if (memoryValue === 0) {
                    // Nếu bộ nhớ trống, hiển thị lại thông báo ban đầu
                    memoryContentEl.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">There\'s nothing saved in memory</p>';
                } else {
                    // Nếu có giá trị, tạo một thẻ div để hiển thị nó
                    const memoryItem = document.createElement('div');
                    
                    // --- THAY ĐỔI 1: THÊM CÁC CLASS ĐỂ CÓ HIỆU ỨNG KHI DI CHUỘT ---
                    // Thêm cursor-pointer để biến con trỏ thành hình bàn tay
                    // Thêm hiệu ứng hover để người dùng biết là có thể click
                    memoryItem.classList.add('text-right', 'p-2', 'rounded-md', 'cursor-pointer', 'hover:bg-gray-300', 'dark:hover:bg-gray-700');
                    
                    memoryItem.innerHTML = `<p class="text-gray-900 dark:text-gray-100 text-2xl font-semibold">${formatNumber(memoryValue)}</p>`;
                    
                    // --- THAY ĐỔI 2: THÊM BỘ LẮNG NGHE SỰ KIỆN CLICK ---
                    memoryItem.addEventListener('click', () => {
                        // Khi click, gán giá trị memory cho toán hạng hiện tại
                        currentOperand = memoryValue.toString();
                        // Đặt cờ này để nếu người dùng bấm số mới, nó sẽ bắt đầu phép tính mới
                        resultDisplayed = true; 
                        // Cập nhật lại màn hình chính để hiển thị giá trị vừa được tải
                        updateDisplay();
                    });

                    memoryContentEl.appendChild(memoryItem);
                }
            };

            const handleSpecialAction = (action) => {
                const current = parseFloat(currentOperand);
                if (isNaN(current) && action !== 'clear' && action !== 'clear-entry') return;

                switch(action) {
                    case 'clear': clear(); break;
                    case 'clear-entry': clearEntry(); break;
                    case 'backspace': backspace(); break;
                    case 'equals': 
                        if (operation == null || previousOperand === '') return;
                        calculate();
                        break;
                    case 'negate': currentOperand = (current * -1).toString(); break;
                    case 'percent': currentOperand = (current / 100).toString(); break;
                    case 'reciprocal': currentOperand = (1 / current).toString(); break;
                    case 'square': currentOperand = (current * current).toString(); break;
                    case 'sqrt': currentOperand = Math.sqrt(current).toString(); break;
                    // Thêm các case này vào trong switch của hàm handleSpecialAction
                    case 'memory-clear': // MC
                        memoryValue = 0;
                        break;
                    case 'memory-recall': // MR
                        currentOperand = memoryValue.toString();
                        resultDisplayed = true;
                        break;
                    case 'memory-store': // MS
                        memoryValue = parseFloat(currentOperand) || 0;
                        resultDisplayed = true;
                        break;
                    case 'memory-add': // M+
                        memoryValue += parseFloat(currentOperand) || 0;
                        resultDisplayed = true;
                        break;
                    case 'memory-subtract': // M-
                        memoryValue -= parseFloat(currentOperand) || 0;
                        resultDisplayed = true;
                        break;
                }
            }
            //Mục đích: Tạo ra các thẻ HTML mới và chèn chúng vào panel lịch sử (History | Memory).
            const addToHistory = (expression, result) => {
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

        //Kết nối - Gắn Sự kiện
            // Event Listeners
            document.querySelectorAll('.btn-num').forEach(button => {
                button.addEventListener('click', () => {
                    appendNumber(button.innerText);
                    updateDisplay();
                });
            });

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

            document.querySelector('[data-action="equals"]').addEventListener('click', () => {
                handleSpecialAction('equals');
                updateDisplay();
            });
            
            clearHistoryButton.addEventListener('click', () => {
                historyContentEl.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">There\'s no history yet</p>';
            });

            // Menu, History Panel Toggle Logic
            const menuButton = document.getElementById('menu-button');
            const menuPanel = document.getElementById('menu-panel');
            const historyToggleButton = document.getElementById('history-toggle-button');
            const historyPanel = document.getElementById('history-panel');

            menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                menuPanel.classList.toggle('hidden');
            });

            historyToggleButton.addEventListener('click', () => {
                historyPanel.classList.toggle('hidden');
                historyPanel.classList.toggle('flex');
            });
            //Toggle buttons to avoid the user clicking number buttons when current number is Inf
            /**
             * Cập nhật trạng thái (bật/tắt) của các nút trên máy tính.
             * @param {string} state - Trạng thái mong muốn: 'infinity' (khóa) hoặc 'normal' (bình thường).
             */
            const updateButtonStates = (state) => {
                // Selector được cập nhật để bao gồm cả các nút Memory
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

            // Close menu if clicked outside
            document.addEventListener('click', (e) => {
                if (!menuPanel.contains(e.target) && !menuButton.contains(e.target)) {
                    menuPanel.classList.add('hidden');
                }
            });

            // History/Memory Tabs
            const tabs = document.querySelectorAll('.history-tab-button');
            const historyContent = document.getElementById('history-content');
            const memoryContent = document.getElementById('memory-content');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => {
                        t.classList.remove('text-blue-600', 'dark:text-blue-400', 'border-b-2', 'border-blue-600', 'dark:border-blue-400');
                        t.classList.add('text-gray-500', 'dark:text-gray-400');
                    });
                    tab.classList.add('text-blue-600', 'dark:text-blue-400', 'border-b-2', 'border-blue-600', 'dark:border-blue-400');
                    tab.classList.remove('text-gray-500', 'dark:text-gray-400');
                    
                    if(tab.dataset.tab === 'history') {
                        historyContent.classList.remove('hidden');
                        memoryContent.classList.add('hidden');
                        clearHistoryButton.style.display = 'block';
                    } else {
                        historyContent.classList.add('hidden');
                        memoryContent.classList.remove('hidden');
                        clearHistoryButton.style.display = 'none'; // Thường thì memory có các nút riêng
                    }
                });
            });

             // Mode switching logic (Stub)
             //Stub: Chuyển đổi chế độ (chưa triển khai giao diện cụ thể)
            document.querySelectorAll('.mode-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const newMode = e.target.closest('a').dataset.mode;
                    //document.getElementById('mode-title').innerText = newMode; you will need this later when you implement different modes
                    if (newMode === 'Standard') {
                        // Default mode
                        return;
                    }
                    
                    // Reset active styles  
                    /*document.querySelectorAll('.mode-link').forEach(l => {
                        l.classList.remove('bg-blue-100', 'dark:bg-blue-800', 'text-blue-700', 'dark:text-blue-200', 'font-semibold');
                         l.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-600', 'text-gray-800', 'dark:text-gray-200');
                    });
                    */

                    // Set active style for clicked link
                    /* e.target.closest('a').classList.add('bg-blue-100', 'dark:bg-blue-800', 'text-blue-700', 'dark:text-blue-200', 'font-semibold');
                     e.target.closest('a').classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-600', 'text-gray-800', 'dark:text-gray-200');
                    */

                    menuPanel.classList.add('hidden');
                    alert(`Switched to ${newMode} mode. UI for this mode has not been implemented yet.`);
                    // In a real app, you would dynamically change the calculator's button layout here.
                });
            });

            clear(); // Initialize
        });