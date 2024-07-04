## Aggregations Pipeline trong MongoDB

Giống như trong SQL, ở trong MongoDB chúng ta cũng có cách để có thể JOIN dữ liệu của các bảng lại với nhau HOẶC là sử dụng các câu lệnh tương tự như trong SQL như WHERE, GROUP BY, HAVE, ...v.v để query và trả ra API đúng như ý muốn cho phía Front-end xử lí

1. Aggregations Pipeline là gì?

   Các bạn hiểu nôm na Aggregations Pipeline là một dây chuyền sản xuất, nơi dữ liệu đi qua nhiều giai đoạn khác nhau (gọi là "stages"), và ở mỗi giai đoạn, dữ liệu sẽ được lọc, biến đổi, và tính toán để tạo ra kết quả cuối cùng.

   Chúng ta sẽ có một ví dụ nho nhỏ, đầu tiên khi chưa chạy vào pipeline, data của API get profile sẽ có dạng như sau:

   ```json
   {
     "name": "Tran Dang Khoi",
     "username": "khoitran",
     "password": "pipeline123",
     "email": "khoi@gmail.com",
     "bio": "Why don't eggs tell jokes? They'd crack each other up",
     "forgot_password_token": "...",
     "email_verify_token": "..."
   }
   ```

   Như các bạn thấy, nếu như chúng ta chỉ cần get mỗi profile người dùng thì sẽ có rất nhiều các trường vô dụng và không cần thiết như là: `password`, `forgot_password_token` và `email_verify_token`, với lại khi get profile chúng ta cũng có thể thêm tính năng đồng thời trả ra cả các bài viết mà người dùng đã likes giống như Twitter vậy! (đương nhiên là trước khi sự kiện Elon Musk like post NSFW diễn ra).

   Ok vậy thì sau một hồi xào nấu và đi qua rất nhiều giai đoạn trong Aggregation Pipeline thì API của chúng ta sẽ có thể biến thành như sau:

   ```json
   {
   name: "Tran Dang Khoi",
   username: "khoitran",
   email: "khoi@gmail.com",
   bio: "Why don't eggs tell jokes? They'd crack each other up",
   tweets: Array(1),
   liked_tweets: Array(5)
   }
   ```

   Đó chỉ là những chức năng nhỏ mình nhắc tới thui, có gì mọi người có thể tìm hiểu thêm ha
