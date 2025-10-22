
# BÁO CÁO DỰ ÁN WEB CALCULATOR

## 1. Giới thiệu

**Web Calculator** là dự án máy tính web mô phỏng chức năng và giao diện của ứng dụng máy tính hiện đại được sử dụng trong hệ điều hành Window (phiên bản Window 11).

- **Công nghệ chính:** HTML, Tailwind CSS, JavaScript.
- **Công cụ hỗ trợ:**
    - **GitHub:** Quản lý mã nguồn và kiểm soát phiên bản.
    - **Gemini 2.5 Pro:** Trợ lý AI hỗ trợ khởi tạo, gỡ lỗi và tối ưu hóa mã nguồn.

---

## 2. Quá trình Sửa lỗi cùng Gemini 2.5 Pro

### 🐞 Vấn đề 1: Xử lý trạng thái Vô cực (Overflow)

- **Lỗi:** Ứng dụng cho phép tiếp tục tính toán với kết quả `Infinity`, gây ra lỗi.
- **Quá trình Fix:**
    1.  Mô tả vấn đề cho Gemini, đề xuất ý tưởng khóa các nút không cần thiết.
    2.  Gemini gợi ý tạo hàm `updateButtonStates(state)` để quản lý việc bật/tắt nút.
    3.  Cập nhật hàm `updateDisplay()` để kiểm tra `Infinity` và gọi hàm trên.
- **✅ Giải pháp:** Triển khai hàm `updateButtonStates` để vô hiệu hóa tất cả các nút trừ "C" và "CE" khi kết quả là `Infinity`.


### 🐞 Vấn đề 2: Chức năng nghịch đảo (1/x) hoạt động sai

- **Lỗi:** Khi tính `1/x` với số rất nhỏ, màn hình hiển thị kết quả không chính xác.
- **Quá trình Fix:**
    1.  Xác nhận logic tính toán `1 / current` là đúng.
    2.  Gemini đồng tình rằng đây là lỗi **hiển thị**, không phải lỗi **tính toán**.
    3.  Kết luận "thủ phạm" chính là hàm `formatNumber` yếu kém ban đầu.
- **✅ Giải pháp:** Vấn đề được tự động khắc phục sau khi áp dụng giải pháp cho **Vấn đề 3**. Việc sửa chữa hàm `formatNumber` cốt lõi đã sửa tất cả các chức năng phụ thuộc vào nó.
### 🐞 Vấn đề 3: Lỗi hiển thị số siêu nhỏ (Floating Point)

- **Lỗi:** Hàm `formatNumber` định dạng số không nhất quán, làm tròn sai các số rất nhỏ và hiển thị lỗi do vấn đề floating point.
- **Quá trình Fix:**
    1.  Cung cấp các ví dụ lỗi và nêu nghi vấn về hàm `formatNumber` cho Gemini.
    2.  Gemini xác nhận logic `split('.')` cũ không thể xử lý số ở dạng khoa học (`1e-8`).
    3.  Gemini đề xuất viết lại hoàn toàn logic của hàm `formatNumber`.
- **✅ Giải pháp:** Thiết kế lại hàm `formatNumber` để sử dụng `toExponential()` cho các số siêu lớn/nhỏ và `toLocaleString()` cho các số thông thường, đảm bảo định dạng chính xác.
