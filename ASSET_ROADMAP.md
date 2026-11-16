# Claw Quest Asset Roadmap

## Mục tiêu
Duy trì nhịp phát triển hình ảnh theo từng giai đoạn để game có trải nghiệm hình ảnh rõ ràng và hợp logic:

1. Tháng 12/2026: Cảnh quan và bản đồ
2. Tháng 1/2027: Sinh vật và môi trường sống
3. Tháng 2/2027: Công cụ, vũ khí và trang bị

Mỗi nhóm hình ảnh được sắp xếp theo cấu trúc thư mục rõ ràng để thuận tiện cho thiết kế, lập trình và cập nhật nội dung trong tương lai.

---

## 1. Cấu trúc thư mục đề xuất

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

### 1.1 Nhóm maps
- Dùng cho nền game, địa hình, cảnh quan, tile, bối cảnh đảo, các khu vực mở rộng.
- Ưu tiên xử lý trước vì nền quyết định không gian chơi và cảm giác phát triển thế giới.

### 1.2 Nhóm creatures
- Dùng cho động vật, quái vật, sinh vật biển, sinh vật hoang dã, trạng thái đi bộ/ngồi/đánh nhau.
- Dùng để tạo vẻ sống động cho khu vực và hành vi của game.

### 1.3 Nhóm tools
- Dùng cho vật dụng, vũ khí, dụng cụ nghề nghiệp, đồ lưới, đồ đi kèm để khai thác và sống sót.
- Nên làm sau khi map và sinh vật đã có nền tảng rõ ràng.

### 1.4 Nhóm ui
- Dùng cho icon, hotbar, trạng thái hiệu ứng, giao diện người chơi.
- Có thể phát triển song song nhưng nên ưu tiên sau khi asset chính ổn định.

---

## 2. Lịch triển khai theo từng tháng

## Tháng 12/2026 — Cảnh quan và bản đồ (ưu tiên số 1)

### Mục tiêu
Tạo hệ thống bản đồ và không gian sống cho game, đảm bảo người chơi có cảm giác đang khám phá đảo, bãi biển, rừng, núi, hang động, và các địa hình khác.

### Nhóm cần ưu tiên
- `maps/terrain/`
- `maps/islands/`
- `maps/tiles/`
- `maps/backgrounds/`

### File gợi ý từ repo hiện tại
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

### Yêu cầu thiết kế
- Chia thành các khu vực chính: bãi biển, rừng, núi đá, mỏ, vùng đá, vùng băng, đảo lửa.
- Tạo sự đồng bộ giữa tile, terrain và background để gameplay dễ đọc.
- Đảm bảo các ảnh có cùng tone màu và tỉ lệ hình ảnh để map có tính thống nhất.

### Kết quả mong đợi
- Người chơi thấy rõ không gian sống của đảo.
- Mỗi khu vực có bản sắc riêng.
- Hệ thống di chuyển và khai thác có nền tảng vững chắc.

---

## Tháng 1/2027 — Sinh vật và quái vật (đặt ưu tiên thứ 2)

### Mục tiêu
Tạo bộ sưu tập sinh vật, quái thú, động vật và trạng thái hành vi để làm cho thế giới không còn khô cứng.

### Nhóm cần ưu tiên
- `creatures/animals/`
- `creatures/monsters/`
- `creatures/npcs/`
- `creatures/states/`

### File gợi ý từ repo hiện tại
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

### Yêu cầu thiết kế
- Sắp xếp theo các nhóm: động vật hoang dã, quái vật ban đêm, NPC, thú nuôi/động vật đồng hành.
- Tạo nhiều trạng thái: đứng, đi, ngồi, tấn công, chạy, lùi, vui, sợ.
- Đảm bảo độ dễ nhận dạng ở kích thước nhỏ trong game.

### Kết quả mong đợi
- Thế giới sống động hơn.
- Người chơi nhận ra các loài khác nhau và cảm giác “đảo có ai đó cư ngụ”.
- Hệ thống sinh vật hỗ trợ đáp ứng tiến độ game.

---

## Tháng 2/2027 — Công cụ, vũ khí và vật dụng (đặt ưu tiên thứ 3)

### Mục tiêu
Phát triển hệ thống crafting, thu thập, bảo vệ và hỗ trợ sinh tồn trong game bằng cách làm rõ vật dụng và dụng cụ của người chơi.

### Nhóm cần ưu tiên
- `tools/weapons/`
- `tools/equipment/`
- `tools/crafting/`
- `tools/utility/`

### File gợi ý từ repo hiện tại
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
- `release.png`
- `strength_effect.png`
- `haste_effect.png`

### Yêu cầu thiết kế
- Chia theo chức năng: khai thác, săn bắn, bảo vệ, di chuyển, mang theo, hỗ trợ.
- Dùng phong cách hình ảnh rõ ràng, dễ phân biệt khi hiển thị trên hotbar hoặc trong túi đồ.
- Đảm bảo icon có hình dạng gọn, có độ tương phản màu rõ ràng.

### Kết quả mong đợi
- Người chơi thấy rõ tiến bộ trong việc thu thập, chế tạo và chiến đấu.
- Hệ thống vật dụng phù hợp với gameplay survival và crafting.
- Tạo cảm giác “đồ chơi đã có bộ đồ hoàn chỉnh”.

---

## 3. Kế hoạch tổ chức nội dung theo nhóm file

### A. maps
- Bản đồ chính và môi trường: `starter_isle.png`, `fire_island.png`, `ice_island.png`, `cloud_island.png`, `ember_isle.png`, `stormpeak.png`, `crystal_atoll.png`
- Nền và tile: `stone.png`, `tree.png`, `palm_tree.png`, `mine_tile.png`, `golden_plains.png`
- Mục tiêu: phát triển không gian chơi đầu tiên, chuẩn bị cho quá trình mở rộng.

### B. creatures
- Động vật và quái vật: `frog_*`, `box_turtle.png`, `arrau_turtle.png`, `warrior_cow.png`, `capybara.svg` 
- Trạng thái hành vi: `sit.png`, `wander.png`, `follow.png`, `aggresive.png`, `pasive.png`, `neutral.png`
- Mục tiêu: làm sống động không gian và các tương tác với thế giới.

### C. tools
- Dụng cụ và vũ khí: `rod.png`, `shotgun.png`, `bola.png`, `santiagos_axe.png`, `thery_hoe.png`, `narcotic_arrow.png`
- Trang bị: `backpack.png`, `long_helmet.png`
- Hiệu ứng hệ thống: `haste_effect.png`, `strength_effect.png`, `resistance_effect.png`, `night_vision_effect.png`
- Mục tiêu: hỗ trợ chiến đấu, sinh tồn và nâng cấp nhân vật.

### D. ui
- Icon và slot: `selected_hotbar_slot.png`, `Icon.jpg`, `Screenshot.jpg`
- Mục tiêu: giúp trải nghiệm người dùng rõ ràng và chuyên nghiệp.

---

## 4. Quy tắc sắp xếp asset cho team

1. Luôn đặt hình ảnh theo mục đích sử dụng, không phải theo tên ngẫu nhiên.
2. Hình ảnh map luôn ưu tiên trước để game có “không gian chơi”.
3. Hình ảnh sinh vật nên được nhóm theo loài và trạng thái để dễ dùng trong gameplay.
4. Hình ảnh công cụ nên được sắp xếp theo chức năng để dễ kiểm tra và chỉnh sửa.
5. Mọi hình ảnh cần có sự đồng nhất về phong cách màu sắc và tỉ lệ.
6. Nên dùng tên file rõ nghĩa, ví dụ:
   - `forest_tile_01.png`
   - `frog_warm_idle.png`
   - `shotgun_rare.png`
   - `backpack_iron.png`

---

## 5. Kết luận
Kế hoạch trên phù hợp với tiến độ game và logic phát triển sản phẩm:

- 12/2026: Xây dựng nền và bản đồ
- 01/2027: Tạo sinh vật và quái vật
- 02/2027: Xây dựng công cụ, vũ khí và trang bị

Với cách tổ chức như trên, repo sẽ trở nên rõ ràng hơn, dễ quản lý hơn, và giúp team phát triển game theo hướng tăng dần chức năng mà không mất đồng bộ hình ảnh.

---

## Đánh giá ưu tiên cuối cùng

### Ưu tiên cao
- `maps/`
- `creatures/`
- `tools/`

### Ưu tiên trung bình
- `ui/`
- `references/`

### Ưu tiên thấp
- Các file ảnh lưu trữ tạm, screenshots, ảnh thử nghiệm không cần dùng cho gameplay

---

## Ghi chú cho quản lý repo
Các file ảnh có tính chất bản mẫu, screenshot, hoặc tài liệu tham khảo nên được giữ ở các thư mục riêng để tránh làm rối asset chính. Điều này giúp team dễ dàng tách phần “asset chính” khỏi phần “tham khảo” và “dựng hình ảnh thử nghiệm”.

---

Nếu cần, bước tiếp theo có thể là:
- Tạo thêm các thư mục thật trong repo theo cấu trúc trên
- Chuyển file ảnh hiện có vào đúng nhóm
- Viết tiếp file checklist công việc từng tuần cho 3 tháng này
- Tạo file `ROADMAP_TASKS.md` để team theo dõi tiến độ
