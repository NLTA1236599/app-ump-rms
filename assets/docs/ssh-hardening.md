# T03 — Cứng hóa SSH (VPS, thao tác thủ công)

> Cursor **không** tự chạy các lệnh này. Giữ **một phiên SSH đang mở** trong lúc thay đổi, và kiểm tra đăng nhập bằng key ở phiên **thứ hai** trước khi tắt mật khẩu.

## 1. Đảm bảo đã có SSH key

```bash
# Trên máy cá nhân (nếu chưa có key)
ssh-keygen -t ed25519 -C "annie@ump-rms"

# Copy key lên VPS (phiên hiện tại vẫn dùng mật khẩu được)
ssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@103.159.50.23

# Kiểm tra đăng nhập bằng key ở phiên thứ hai (đừng đóng phiên cũ)
ssh -o PreferredAuthentications=publickey deploy@103.159.50.23
```

## 2. Tắt đăng nhập bằng mật khẩu

Tạo `/etc/ssh/sshd_config.d/99-hardening.conf`:

```
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
```

Ubuntu 24.04 có thể có file khác (ví dụ `50-cloud-init.conf`) đặt lại `PasswordAuthentication yes`. Kiểm tra giá trị hiệu lực:

```bash
sudo sshd -T | grep -i -E "passwordauthentication|permitrootlogin|kbdinteractiveauthentication"
sudo sshd -t
sudo systemctl reload ssh
```

## 3. fail2ban

```bash
sudo apt install -y fail2ban
sudo tee /etc/fail2ban/jail.local >/dev/null <<'EOF'
[sshd]
enabled = true
maxretry = 5
bantime = 1h
findtime = 10m
EOF
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

## Nghiệm thu

```bash
# Phải bị từ chối, không còn "password" trong danh sách
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no deploy@103.159.50.23

# Đăng nhập bằng key vẫn hoạt động
ssh deploy@103.159.50.23
```
