# 🔀 GIT WORKFLOW GUIDE - FOODFAST TEAM

## 📌 QUY TẮC CƠ BẢN

### ✅ DO:
- Commit code thường xuyên (mỗi feature nhỏ)
- Viết commit message rõ ràng
- Pull code từ main trước khi bắt đầu làm việc
- Tạo branch mới cho mỗi feature
- Review code của nhau trước khi merge
- Test kỹ trước khi push

### ❌ DON'T:
- **KHÔNG BAO GIỜ** commit trực tiếp lên `main`
- **KHÔNG** push code chưa test
- **KHÔNG** commit files nhạy cảm (.env, node_modules, ...)
- **KHÔNG** force push (`git push -f`) trừ khi biết chắc mình đang làm gì
- **KHÔNG** commit code có lỗi syntax

---

## 🌳 BRANCH NAMING CONVENTION

### Format:
```
<type>/<short-description>
```

### Types:
- `feature/` - Tính năng mới
- `bugfix/` - Sửa lỗi
- `hotfix/` - Sửa lỗi khẩn cấp
- `refactor/` - Refactor code
- `docs/` - Cập nhật documentation
- `test/` - Thêm tests

### Examples:
```bash
feature/client-homepage
feature/api-orders
bugfix/cart-quantity-update
hotfix/payment-error
refactor/drone-service
docs/api-documentation
```

---

## 📝 COMMIT MESSAGE CONVENTION

### Format:
```
<type>(<scope>): <subject>

[optional body]
[optional footer]
```

### Types:
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật tài liệu
- `style`: Format code (không thay đổi logic)
- `refactor`: Refactor code
- `test`: Thêm/sửa tests
- `chore`: Công việc maintenance (update dependencies, ...)

### Examples:
```bash
feat(client): add homepage with product carousel
fix(api): resolve order creation validation error
docs(readme): update installation instructions
style(client): format code with prettier
refactor(server): optimize drone assignment algorithm
test(api): add unit tests for product controller
chore(deps): update react to v18.3.0
```

### Good Commit Messages:
✅ `feat(client): implement real-time order tracking with socket.io`
✅ `fix(api): handle null restaurant error in order creation`
✅ `refactor(server): extract drone logic to separate service`

### Bad Commit Messages:
❌ `update code`
❌ `fix bug`
❌ `wip`
❌ `asdfasdf`

---

## 🚀 WORKFLOW HẰNG NGÀY

### 1️⃣ BẮT ĐẦU NGÀY LÀM VIỆC

```bash
# 1. Đảm bảo bạn ở branch main
git checkout main

# 2. Lấy code mới nhất từ remote
git pull origin main

# 3. Tạo branch mới cho feature
git checkout -b feature/ten-feature-cua-ban

# Example:
git checkout -b feature/client-cart-page
```

### 2️⃣ TRONG QUÁ TRÌNH LÀM VIỆC

```bash
# 1. Kiểm tra files đã thay đổi
git status

# 2. Xem chi tiết thay đổi
git diff

# 3. Add files vào staging
git add .
# Hoặc add từng file cụ thể:
git add client_app/src/pages/Cart/CartPage.jsx

# 4. Commit với message rõ ràng
git commit -m "feat(client): implement cart page with quantity controls"

# 5. Push lên remote (lần đầu)
git push -u origin feature/client-cart-page

# 6. Push lần sau (đã set upstream)
git push
```

### 3️⃣ COMMIT THƯỜNG XUYÊN

**Nên commit khi:**
- Hoàn thành một sub-task nhỏ
- Trước khi nghỉ trưa/tan làm
- Sau mỗi 1-2 giờ làm việc
- Code đang chạy tốt (không lỗi)

```bash
# Example workflow trong 1 ngày:
10:00 - git commit -m "feat(client): add cart page structure"
11:30 - git commit -m "feat(client): implement add to cart functionality"
14:00 - git commit -m "feat(client): add quantity increase/decrease buttons"
16:00 - git commit -m "feat(client): integrate cart with Redux store"
17:30 - git commit -m "style(client): improve cart page responsive design"
```

### 4️⃣ SYNC CODE TỪ MAIN (Mỗi ngày hoặc trước khi tạo PR)

```bash
# 1. Commit tất cả thay đổi hiện tại
git add .
git commit -m "feat(client): work in progress on cart page"

# 2. Chuyển về main và pull
git checkout main
git pull origin main

# 3. Quay lại branch của bạn
git checkout feature/client-cart-page

# 4. Merge main vào branch của bạn
git merge main

# 5. Giải quyết conflicts (nếu có) - xem section dưới
# 6. Push code đã merge
git push
```

### 5️⃣ TẠO PULL REQUEST

```bash
# 1. Push branch lên remote (nếu chưa)
git push -u origin feature/client-cart-page

# 2. Vào GitHub/GitLab và tạo Pull Request
# - Base branch: main
# - Compare branch: feature/client-cart-page
# - Title: feat(client): Implement cart page
# - Description: Chi tiết về những gì đã làm

# 3. Assign reviewer (người còn lại trong team)
# 4. Đợi review & approval
# 5. Merge vào main (sau khi được approve)
```

### 6️⃣ SAU KHI MERGE

```bash
# 1. Chuyển về main
git checkout main

# 2. Pull code mới (đã có feature của bạn)
git pull origin main

# 3. Xóa branch cũ (local)
git branch -d feature/client-cart-page

# 4. Xóa branch trên remote (optional)
git push origin --delete feature/client-cart-page
```

---

## 🔧 XỬ LÝ CONFLICTS

### Khi nào xảy ra conflict?
- Cả 2 người sửa cùng 1 file, cùng 1 vị trí
- Merge main vào branch của bạn

### Cách giải quyết:

```bash
# 1. Khi merge bị conflict
git merge main
# Output: CONFLICT (content): Merge conflict in client_app/src/App.jsx

# 2. Kiểm tra files bị conflict
git status
# Output: both modified: client_app/src/App.jsx

# 3. Mở file và tìm các dấu hiệu conflict:
```

```javascript
// File: client_app/src/App.jsx
<<<<<<< HEAD
// Code của bạn
const [count, setCount] = useState(0)
=======
// Code từ main
const [counter, setCounter] = useState(0)
>>>>>>> main
```

**Cách sửa:**
- Giữ code của bạn: Xóa tất cả trừ phần `<<<<<<< HEAD` và `=======` đầu tiên
- Giữ code từ main: Xóa tất cả trừ phần `=======` và `>>>>>>> main` cuối cùng
- Giữ cả 2: Merge thủ công cả 2 phần code
- Viết lại: Viết code mới hoàn toàn

```javascript
// Sau khi resolve:
const [count, setCount] = useState(0)
const [counter, setCounter] = useState(0)
```

```bash
# 4. Sau khi sửa xong, add file
git add client_app/src/App.jsx

# 5. Commit merge
git commit -m "merge: resolve conflicts from main"

# 6. Push
git push
```

### Tips tránh conflicts:
- ✅ Sync code từ main thường xuyên (mỗi ngày)
- ✅ Phân chia rõ ràng ai làm file nào
- ✅ Không sửa files của người khác trừ khi cần thiết
- ✅ Thông báo trước khi sửa shared files (.env, package.json, ...)

---

## 🆘 CÁC TÌNH HUỐNG THƯỜNG GẶP

### 1. Commit nhầm vào main

```bash
# Nếu chưa push:
git reset HEAD~1  # Undo commit, giữ nguyên changes
git checkout -b feature/my-feature  # Tạo branch mới
git add .
git commit -m "feat: correct commit message"

# Nếu đã push (NGUY HIỂM - hỏi team trước):
# Liên hệ người còn lại để xử lý
```

### 2. Muốn undo commit cuối cùng

```bash
# Undo commit nhưng giữ changes
git reset --soft HEAD~1

# Undo commit và xóa changes (NGUY HIỂM)
git reset --hard HEAD~1
```

### 3. Muốn discard tất cả changes chưa commit

```bash
# Xem changes sẽ bị mất
git diff

# Discard tất cả (KHÔNG THỂ UNDO)
git checkout .

# Hoặc
git restore .
```

### 4. Muốn stash (tạm cất) changes

```bash
# Stash changes
git stash

# Xem danh sách stashes
git stash list

# Apply stash gần nhất
git stash pop

# Apply stash cụ thể
git stash apply stash@{0}
```

### 5. Muốn xem history commits

```bash
# Xem log đơn giản
git log --oneline

# Xem log với graph
git log --oneline --graph --all

# Xem log của 1 file
git log -- client_app/src/App.jsx
```

### 6. Muốn xem ai sửa dòng code nào

```bash
git blame client_app/src/App.jsx
```

### 7. Branch bị lỗi, muốn bắt đầu lại

```bash
# Commit hoặc stash changes hiện tại
git add .
git commit -m "wip: save current work"

# Quay lại main
git checkout main
git pull origin main

# Tạo branch mới
git checkout -b feature/my-feature-v2

# Copy code từ branch cũ (nếu cần)
git cherry-pick <commit-hash>
```

---

## 📦 FILES KHÔNG NÊN COMMIT

### Tạo/Cập nhật `.gitignore`

```bash
# .gitignore content
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.production

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/

# Misc
*.bak
*.tmp
```

### Nếu đã commit nhầm:

```bash
# Xóa file khỏi Git nhưng giữ local
git rm --cached .env
git commit -m "chore: remove .env from tracking"

# Thêm vào .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: update gitignore"
```

---

## 🔍 REVIEW CODE CHECKLIST

### Reviewer (Người review):
- [ ] Code có chạy không?
- [ ] Code có follow convention không?
- [ ] Có test không?
- [ ] Có comments cho code phức tạp không?
- [ ] Có bugs tiềm ẩn không?
- [ ] Performance có vấn đề không?
- [ ] Security có lỗ hổng không?

### Author (Người tạo PR):
- [ ] Code đã test kỹ chưa?
- [ ] Có conflicts không?
- [ ] Có lint errors không?
- [ ] Description PR đã rõ ràng chưa?
- [ ] Screenshots (nếu là UI) đã đính kèm chưa?

---

## 📊 EXAMPLE: FULL WORKFLOW CHO 1 FEATURE

**Feature:** Implement Cart Page

```bash
# Day 1 - Morning
git checkout main
git pull origin main
git checkout -b feature/client-cart-page

# ... Code cart page structure ...
git add client_app/src/pages/Cart/
git commit -m "feat(client): add cart page structure with basic layout"
git push -u origin feature/client-cart-page

# Day 1 - Afternoon
# ... Code cart logic ...
git add client_app/src/pages/Cart/
git add client_app/src/redux/slices/cartSlice.js
git commit -m "feat(client): implement cart quantity controls and total calculation"
git push

# Day 2 - Morning
# Sync from main first
git checkout main
git pull origin main
git checkout feature/client-cart-page
git merge main
# ... Resolve conflicts if any ...
git push

# ... Continue coding ...
git add .
git commit -m "feat(client): add cart item removal functionality"
git push

# Day 2 - Afternoon
# ... Finish feature ...
git add .
git commit -m "style(client): improve cart page responsive design"
git commit -m "test(client): test cart page on mobile devices"
git push

# Create Pull Request on GitHub
# Title: feat(client): Implement cart page with full functionality
# Description:
# - Cart page structure
# - Quantity controls
# - Remove items
# - Total calculation
# - Responsive design
# 
# Screenshots: [attach screenshots]

# After review & merge
git checkout main
git pull origin main
git branch -d feature/client-cart-page
```

---

## 🎓 LEARNING RESOURCES

### Git Commands Cheat Sheet:
```bash
# Branch
git branch                    # List branches
git branch <name>             # Create branch
git checkout <branch>         # Switch branch
git checkout -b <branch>      # Create & switch
git branch -d <branch>        # Delete branch

# Changes
git status                    # Check status
git diff                      # See changes
git add <file>                # Stage file
git add .                     # Stage all
git commit -m "message"       # Commit
git push                      # Push to remote

# History
git log                       # View history
git log --oneline             # Compact log
git show <commit>             # Show commit details

# Sync
git pull                      # Fetch & merge
git fetch                     # Fetch only
git merge <branch>            # Merge branch

# Undo
git reset HEAD~1              # Undo commit
git checkout .                # Discard changes
git stash                     # Stash changes
```

### Git Visual Guide:
```
main     ─────●────●────●────●────●
              │              ↑     
              │              merge  
              ↓              │     
feature  ─────●────●────●────●     
         (branch) (commits)
```

---

## 💡 PRO TIPS

1. **Commit often, push once:** Commit nhỏ local, rồi push 1 lần khi xong feature
2. **Write meaningful commits:** Commit message giúp bạn và team hiểu code sau này
3. **Review before push:** Luôn `git diff` trước khi commit
4. **Test before commit:** Đảm bảo code chạy được
5. **Communicate:** Thông báo với team khi sửa shared files
6. **Backup:** Push code lên remote thường xuyên (backup online)
7. **Learn from mistakes:** Sai là bình thường, quan trọng là học được từ nó

---

## 🆘 KHI CẦN GIÚP ĐỠ

1. **Git error không hiểu:** Google error message
2. **Conflict phức tạp:** Hỏi người còn lại trong team
3. **Mất code:** Kiểm tra `git reflog` (có thể recover)
4. **Không chắc:** Tạo backup branch trước khi thử lệnh mới

```bash
# Tạo backup branch
git checkout -b backup-just-in-case
git checkout feature/original-branch
# ... try risky command ...
```

---

**Remember:** Git là công cụ, quan trọng là communication trong team! 💪

**Happy Coding!** 🚀
