# วิธีแก้ไข Nginx 413 Content Too Large

1. เข้าไปที่ Server ของคุณผ่าน SSH
2. เปิดไฟล์ตั้งค่าของ Nginx:
```bash
sudo nano /etc/nginx/sites-available/kaichon-plus
# หรือถ้าใช้ default:
# sudo nano /etc/nginx/sites-available/default
```

3. เพิ่มคำสั่ง `client_max_body_size 50M;` ลงในบล็อก `server { ... }` 
เพื่อให้ Nginx ยอมรับไฟล์ขนาดใหญ่ได้สูงสุด 50MB (ปกติมันตั้งไว้แค่ 1MB รูปจากไอโฟนเลยอัปโหลดไม่ได้):

```nginx
server {
    listen 80;
    server_name kaichon-plus.com;

    client_max_body_size 50M;  # <--- เพิ่มบรรทัดนี้

    location / {
        # ...
    }
}
```

4. บันทึกไฟล์ (กด `Ctrl+O`, `Enter`, `Ctrl+X`)
5. รีสตาร์ท Nginx:
```bash
sudo systemctl restart nginx
```
