# Claw Quest Asset Roadmap Tasks

## Mục tiêu
Theo dõi tiến độ phát triển hình ảnh theo 3 giai đoạn chính:

1. Tháng 12/2026: Cảnh quan và bản đồ
2. Tháng 1/2027: Sinh vật và quái vật
3. Tháng 2/2027: Công cụ, vũ khí và thiết bị

---

## 1. Tháng 12/2026 — Cảnh quan và bản đồ

### Mục tiêu chính
- Thiết lập không gian chơi và cảm giác đảo hoang.
- Xây dựng hệ thống biome và terrain rõ ràng.
- Tạo nền cho các hoạt động khai thác, di chuyển và mở rộng vùng đất.

### Checklist công việc

#### Tuần 1-2: Đánh giá và phân loại map asset
- [ ] Lọc các file map hiện có trong `images/` theo nhóm bản đồ.
- [ ] Phân loại asset thành: island, terrain, tile, background, decorative.
- [ ] Chọn tối thiểu 5-8 hình ảnh làm nền chính cho bản đồ.
- [ ] Thiết lập thư mục mới: `assets/maps/terrain/`, `assets/maps/islands/`, `assets/maps/tiles/`.

#### Tuần 3-4: Hoàn thiện theme bản đồ
- [ ] Chuẩn hóa tone màu cho từng khu vực: bãi biển, rừng, mỏ đá, núi, vùng lửa, vùng băng.
- [ ] Chọn những ảnh phù hợp cho mỗi biome chính.
- [ ] Tạo sơ đồ map flow: bắt đầu -> mở rộng -> khu vực cao cấp.
- [ ] Xác định ảnh nào cần chỉnh sửa kích thước hoặc cắt crop.

#### Tuần 5: Kiểm tra giao diện và gameplay
- [ ] Đảm bảo bản đồ đọc được ở game view.
- [ ] Kiểm tra độ tương phản giữa tile và background.
- [ ] Duyệt lại các ảnh quan trọng: `starter_isle.png`, `fire_island.png`, `ice_island.png`, `cloud_island.png`, `stormpeak.png`, `crystal_atoll.png`.
- [ ] Chốt danh sách map final cho giai đoạn 1.

### File ưu tiên
- `starter_isle.png`
- `fire_island.png`
- `ice_island.png`
- `cloud_island.png`
- `crystal_atoll.png`
- `ember_isle.png`
- `stormpeak.png`
- `stone.png`
- `tree.png`
- `palm_tree.png`
- `mine_tile.png`
- `golden_plains.png`
- `sunken_temple.png`

---

## 2. Tháng 1/2027 — Sinh vật và quái vật

### Mục tiêu chính
- Làm cho thế giới có sinh vật, quái vật và nhân vật sống động.
- Tạo sự đa dạng cho hệ sinh thái đảo.
- Giúp người chơi nhận diện rõ loài vật và trạng thái hành vi.

### Checklist công việc

#### Tuần 1-2: Phân loại sinh vật
- [ ] Sắp xếp file động vật thành nhóm: động vật hoang dã, quái vật, dạng cư dân/NPC, dạng thú ngắn hạn / đồng hành.
- [ ] Kiểm tra và gom các file có chung phong cách hoặc chủ đề.
- [ ] Chia thành loại: đứng, di chuyển, tấn công, ngồi, chạy.

#### Tuần 3-4: Hoàn thiện nhân vật và quái vật
- [ ] Chọn 4-6 loài chính làm bộ sưu tập sinh vật chính.
- [ ] Tạo bộ asset cho mỗi loài: idle, walk, attack, flee.
- [ ] Kiểm tra tương phản màu và hình dạng ở kích thước nhỏ.
- [ ] Xem xét xem có cần bổ sung file mới cho trạng thái `aggressive`, `passive`, `neutral` hay không.

#### Tuần 5: Duyệt và chốt asset
- [ ] Duyệt lại toàn bộ sinh vật theo độ rõ ràng và tính gameable.
- [ ] Đảm bảo không có file trùng hoặc không dùng.
- [ ] Chốt file set chính cho các loài vật game.

### File ưu tiên
- `frog_cold.png`
- `frog_temperate.png`
- `frog_warm.png`
- `box_turtle.png`
- `arrau_turtle.png`
- `warrior_cow.png`
- `capybara.svg`
- `squirrel_rat.svg`
- `azc_jellyfish.png`
- `aggresive.png`
- `pasive.png`
- `neutral.png`
- `sit.png`
- `wander.png`
- `follow.png`

---

## 3. Tháng 2/2027 — Công cụ, vũ khí và vật dụng

### Mục tiêu chính
- Hoàn thiện hệ thống crafting, survival, chiến đấu và hỗ trợ di chuyển.
- Tạo sự phong phú cho các hành động của người chơi.

### Checklist công việc

#### Tuần 1-2: Phân loại vật dụng
- [ ] Chia asset thành 4 nhóm: vũ khí, thiết bị, dụng cụ khai thác, hiệu ứng hỗ trợ.
- [ ] Tạo các folder phù hợp trong `assets/tools/`.
- [ ] Lọc các file nào cần dùng trực tiếp trong gameplay.

#### Tuần 3-4: Hoàn thiện asset thiết bị
- [ ] Chọn các item có giá trị cao cho gameplay chính: `rod.png`, `shotgun.png`, `santiagos_axe.png`, `thery_hoe.png`.
- [ ] Chốt chất lượng hiển thị hotbar và inventory.
- [ ] Tạo file icon chuẩn hóa cho từng item.
- [ ] Kiểm tra độ rõ ràng khi hiển thị với kích thước nhỏ.

#### Tuần 5: Kiểm tra hiệu ứng và phụ kiện
- [ ] Chốt các hiệu ứng như `haste_effect.png`, `strength_effect.png`, `resistance_effect.png`, `night_vision_effect.png`.
- [ ] Đảm bảo phụ kiện như `backpack.png`, `long_helmet.png`, `selected_hotbar_slot.png` đồng bộ về tone màu.
- [ ] Duyệt lại toàn bộ asset công cụ để không trùng hoặc thiếu nhóm.

### File ưu tiên
- `rod.png`
- `shotgun.png`
- `bola.png`
- `long_helmet.png`
- `thery_hoe.png`
- `backpack.png`
- `santiagos_axe.png`
- `fish_trap_wooden.png`
- `narcotic_arrow.png`
- `selected_hotbar_slot.png`
- `strength_effect.png`
- `haste_effect.png`
- `resistance_effect.png`
- `night_vision_effect.png`

---

## 4. Cấu trúc thư mục đề xuất

```text
assets/
  maps/
    terrain/
    islands/
    tiles/
    backgrounds/
  creatures/
    animals/
    monsters/
    npcs/
    states/
  tools/
    weapons/
    equipment/
    crafting/
    utility/
  ui/
    icons/
    hotbar/
    effects/
  references/
    moodboards/
    palette/
    concept/
```

---

## 5. Tiêu chí hoàn thành
Một asset được xem là hoàn thành khi:
- [ ] Có thể dùng trực tiếp trong game.
- [ ] Có nhóm và tên file rõ ràng.
- [ ] Phù hợp với tone màu và phong cách game.
- [ ] Có độ rõ ràng khi hiển thị ở kích thước nhỏ.
- [ ] Không nằm lẫn trong thư mục tạm hoặc file thử nghiệm.

---

## 6. Mốc thời gian đề xuất

### Giai đoạn 1: 01/12/2026 - 31/12/2026
- Tập trung vào cảnh quan, map, terrain, background.

### Giai đoạn 2: 01/01/2027 - 31/01/2027
- Tập trung vào sinh vật, quái vật, trạng thái hành vi.

### Giai đoạn 3: 01/02/2027 - 28/02/2027
- Tập trung vào công cụ, vũ khí, trang bị, hiệu ứng.

---

## 7. Gợi ý thực thi cho team

- Mỗi tuần nên có 1 review ngắn 20-30 phút.
- Mỗi giai đoạn nên có 1 bản chốt asset final.
- Ưu tiên nhóm ảnh thuộc gameplay trước, ảnh tham khảo sau.
- Tách các file thử nghiệm, screenshot và ảnh dự án tạm ra thư mục `references/` hoặc `misc/`.

---

## 8. Kết luận
Kế hoạch này giúp đội ngũ làm việc theo thứ tự hợp lý, tránh rối nhóm hình ảnh và đảm bảo game có một tiến độ hình ảnh rõ ràng từ tổng thể đến chi tiết. Đây là chiến lược nền tảng để phát triển Claw Quest theo đúng logic: không gian -> sinh vật -> công cụ -> trải nghiệm người chơi.
