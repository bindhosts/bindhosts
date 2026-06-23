# Hướng dẫn sử dụng

## Sử dụng qua Terminal

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/terminal_usage.png';" 
width="100%" alt="Terminal Usage Screenshot">

Bạn có thể sử dụng các tùy chọn khác nhau như trong hình dành cho bindhosts trên Magisk/KernelSU/APatch

- qua Termux (hoặc một loại terminal phổ biến tương tự)
    ```shell
    > su
    > bindhosts
    ```

- qua công cụ SDK (root shell)
    ```shell
    > adb shell
    > su
    > bindhosts
    ```

### Ví dụ

```
    bindhosts --action          Lệnh này sẽ mô phỏng hành động của bindhosts để lấy địa chỉ IP hoặc đặt lại file hosts, tùy thuộc vào trạng thái hiện tại của bindhosts
    bindhosts --tcpdump         Sẽ bắt gói tin (sniff) các địa chỉ IP đang hoạt động trên chế độ mạng của bạn (Wi-Fi hoặc dữ liệu di động, hãy đảm bảo không sử dụng các dịch vụ DNS như cloudflare, v.v.)
    bindhosts --query <URL>          Kiểm tra file hosts để tìm kiếm mẫu (pattern) phù hợp
    bindhosts --force-update    Ép buộc cập nhật
    bindhosts --force-reset     Sẽ ép buộc đặt lại bindhosts, đồng nghĩa với việc đặt lại file hosts về mức không chứa IP nào
    bindhosts --custom-cron     Định nghĩa thời gian trong ngày để chạy một tác vụ tự động (cronjob) cho bindhosts
    bindhosts --enable-cron     Kích hoạt tác vụ cronjob để bindhosts tự động cập nhật IP từ các danh sách bạn đang sử dụng vào lúc 10 giờ sáng (thời gian mặc định)
    bindhosts --disable-cron    Vô hiệu hóa và xóa tác vụ cronjob đã thiết lập trước đó cho bindhosts
    bindhosts --help            Lệnh này sẽ hiển thị toàn bộ nội dung hướng dẫn như trong hình ảnh và văn bản ở trên
```

## Hành động

nhấn nút hành động để bật/tắt và reset

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_action.gif';" 
width="100%" alt="Manager Action">

## WebUI

thêm quy tắc, nguồn, danh sách cho phép hoặc danh sách đen cho riêng mình

<img src="https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif" 
onerror="this.onerror=null;this.src='https://gh.sevencdn.com/https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/screenshots/manager_webui.gif';" 
width="100%" alt="Manager WebUI">
