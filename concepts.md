## Refresh Token là gì?

Refresh Token là một chuỗi token khác, được tạo ra cùng lúc với Access Token. Refresh Token có thời gian hiệu lực lâu hơn Access Token, ví dụ như 1 tuần, 1 tháng, 1 năm...

Flow xác thực với access token và refresh token sẽ được cập nhật như sau:

- Client gửi request vào tài nguyên được bảo vệ trên server. Nếu client chưa được xác thực, server trả về lỗi 401 Authorization. Client gửi username và password của họ cho server.

- Server xác minh thông tin xác thực được cung cấp so với cơ sở dữ liệu user. Nếu thông tin xác thực khớp, server tạo ra 2 JWT khác nhau là Access Token và Refresh Token chứa payload là user_id (hoặc trường nào đó định danh người dùng). Access Token có thời gian ngắn (cỡ 5 phút). Refresh Token có thời gian dài hơn (cỡ 1 năm). Refresh Token sẽ được lưu vào cơ sở dữ liệu, còn Access Token thì không.

- Server trả về access token và refresh token cho client.

- Client lưu trữ access token và refresh token ở bộ nhớ thiết bị (cookie, local storage,...).

- Đối với các yêu cầu tiếp theo, client gửi kèm access token trong header của request.

- Server verify access token bằng secret key để kiểm tra access token có hợp lệ không.

- Nếu hợp lệ, server cấp quyền truy cập vào tài nguyên được yêu cầu.

- Khi access token hết hạn, client gửi refresh token lên server để lấy access token mới.

- Server kiểm tra refresh token có hợp lệ không, có tồn tại trong cơ sở dữ liệu hay không. Nếu ok, server sẽ xóa refresh token cũ và tạo ra refresh token mới với expire date như cũ (ví dụ cái cũ hết hạn vào 5/10/2023 thì cái mới cũng hết hạn vào 5/10/2023) lưu vào cơ sở dữ liệu, tạo thêm access token mới.

- Server trả về access token mới và refresh token mới cho client.

- Client lưu trữ access token và refresh token mới ở bộ nhớ thiết bị (cookie, local storage,...).

- Client có thể thực hiện các yêu cầu tiếp theo với access token mới (quá trình refresh token diễn ra ngầm nên client sẽ không bị logout).

- Khi người dùng muốn đăng xuất thì gọi API logout, server sẽ xóa refresh token trong cơ sở dữ liệu, đồng thời client phải thực hiện xóa access token và refresh token ở bộ nhớ thiết bị.

- Khi refresh token hết hạn (hoặc không hợp lệ) thì server sẽ từ chối yêu cầu của client, client lúc này sẽ xóa access token và refresh token ở bộ nhớ thiết bị và chuyển sang trạng thái bị logout.

## Vấn đề bất cập giữa lý thuyết và thực tế

Mong muốn của việc xác thực bằng JWT là stateless, nhưng ở trên các bạn để ý mình lưu refresh token vào cơ sở dữ liệu, điều này làm cho server phải lưu trữ trạng thái của người dùng, tức là không còn stateless nữa.

Chúng ta muốn bảo mật hơn thì chúng ta không thể cứng nhắc cứ stateless được, vậy nên kết hợp stateless và stateful lại với nhau có vẻ hợp lý hơn. Access Token thì stateless, còn Refresh Token thì stateful.

Đây là lý do mình nói có sự mâu thuẫn giữa lý thuyết và thực tế áp dụng, khó mà áp dụng hoàn toàn stateless cho JWT trong thực tế được.

Và có một lý do nữa tại sao mình lưu refresh token trong database đó là refresh token thì có thời gian tồn tại rất là lâu, nếu biết ai bị lô refresh token thì mình có thể xóa những cái refresh token của user đó trong database, điều này sẽ làm cho hệ thống an toàn hơn.

Tương tự nếu mình muốn logout một người dùng nào đó thì mình cũng có thể xóa refresh token của người đó trong database. Sau khoản thời gian access token họ hết hạn thì họ thực hiện refresh token sẽ không thành công và họ sẽ bị logout. Có điều là nó không tức thời, mà phải đợi đến khi access token hết hạn thì mới logout được.

Chúng ta cũng có thể cải thiện thêm bằng cách cho thời gian hết hạn access token ngắn lại và dùng websocket để thông báo cho client logout ngay lập tức.

## Tại sao lại tạo một refresh token mới khi chúng ta thực hiện refresh token?

Vì nếu refresh token bị lộ, hacker có thể sử dụng nó để lấy access token mới, điều này khá nguy hiểm. Vậy nên dù refresh token có thời gian tồn tại rất lâu, nhưng cứ sau vài phút khi access token hết hạn và thực hiện refresh token thì mình lại tạo một refresh token mới và xóa refresh token cũ.

Lưu ý là cái Refresh Token mới vẫn giữ nguyên ngày giờ hết hạn của Refresh Token cũ. Cái cũ hết hạn vào 5/10/2023 thì cái mới cũng hết hạn vào 5/10/2023.

Cái này gọi là **`refresh token rotation`**.

## Làm thế nào để revoke (thu hồi) một access token?

Các bạn có thể hiểu revoke ở đây nghĩa là thu hồi hoặc vô hiệu hóa

Như mình đã nói ở trên thì access token chúng ta thiết kế nó là stateless, nên không có cách nào revoke ngay lập tức đúng nghĩa được mà chúng ta phải chữa cháy thông qua websocket và revoke refresh token

Còn nếu bạn muốn revoke ngay thì bạn phải lưu access token vào trong database, khi muốn revoke thì xóa nó trong database là được, nhưng điều này sẽ làm access token không còn stateless nữa.

## Có khi nào có 2 JWT trùng nhau hay không?

Có! Nếu payload và secret key giống nhau thì 2 JWT sẽ giống nhau.

Các bạn để ý thì trong payload JWT sẽ có trường iat (issued at) là thời gian tạo ra JWT (đây là trường mặc định, trừ khi bạn disable nó). Và trường iat nó được tính bằng giây.

Vậy nên nếu chúng ta tạo ra 2 JWT trong cùng 1 giây thì lúc này trường iat của 2 JWT này sẽ giống nhau, cộng với việc payload các bạn truyền vào giống nhau nữa thì sẽ cho ra 2 JWT giống nhau.

## Ở client thì nên lưu access token và refresh token ở đâu?

Nếu trình duyệt thì các bạn lưu ở cookie hay local storage đều được, mỗi cái đều có ưu nhược điểm riêng. Nhưng cookie sẽ có phần chiếm ưu thế hơn "1 tí xíu" về độ bảo mật.

Còn nếu là mobile app thì các bạn lưu ở bộ nhớ của thiết bị.

## Gửi access token lên server như thế nào?

Sẽ có 2 trường hợp

- Lưu cookie: Nó sẽ tự động gửi mỗi khi request đến server, không cần quan tâm nó.
- Lưu local storage: Các bạn thêm vào header với key là Authorization và giá trị là Bearer <access_token>.

## Tại sao phải thêm Bearer vào trước access token?

Thực ra bạn thêm hay không thêm thì phụ thuộc vào cách server backend họ code như thế nào.

Để mà code api authentication chuẩn, thì server nên yêu cầu client phải thêm Bearer vào trước access token. Mục đích để nói xác thực là "Bearer Authentication" (xác thực dựa trên token).

Bearer Authentication được đặt tên dựa trên từ "bearer" có nghĩa là "người mang" - tức là bất kỳ ai có token này sẽ được coi là người có quyền truy cập vào tài nguyên được yêu cầu. Điều này khác với các phương pháp xác thực khác như "Basic Authentication" (xác thực cơ bản) hay "Digest Authentication" (xác thực băm), cần sử dụng thông tin đăng nhập người dùng.

Việc thêm "Bearer" vào trước access token có một số mục đích chính:

1. Xác định loại xác thực: Cung cấp thông tin cho máy chủ về phương thức xác thực mà ứng dụng khách muốn sử dụng. Điều này giúp máy chủ xử lý yêu cầu một cách chính xác hơn.

2. Tính chuẩn mực: Sử dụng tiền tố "Bearer" giúp đảm bảo rằng các ứng dụng và máy chủ tuân theo các quy tắc chuẩn trong cách sử dụng và xử lý token.

3. Dễ phân biệt: Thêm "Bearer" giúp phân biệt giữa các loại token và xác thực khác nhau. Ví dụ, nếu máy chủ hỗ trợ nhiều phương thức xác thực, từ "Bearer" sẽ giúp máy chủ xác định loại xác thực đang được sử dụng dựa trên token.

## Khi tôi logout, tôi chỉ cần xóa access token và refresh token ở bộ nhớ của client là được chứ?

Nếu bạn không gọi api logout mà đơn thuần chỉ xóa access token và refresh token ở bộ nhớ của client thì bạn vẫn sẽ logout được, nhưng sẽ không tốt cho hệ thống về mặt bảo mật. Vì refresh token vẫn còn tồn tại ở database, nếu hacker có thể lấy được refresh token của bạn thì họ vẫn có thể lấy được access token mới.

## Tôi có nghe về OAuth 2.0, vậy nó là gì?

OAuth 2.0 là một giao thức xác thực và ủy quyền tiêu chuẩn dành cho ứng dụng web, di động và máy tính để bàn. Nó cho phép ứng dụng của bên thứ ba (còn gọi là ứng dụng khách) truy cập dữ liệu và tài nguyên của người dùng từ một dịch vụ nhà cung cấp (như Google, Facebook, Twitter, ...) mà không cần biết thông tin đăng nhập của người dùng.

Nói đơn giản, nó chỉ là một giao thức thôi, ứng dụng là làm mấy chức năng như đăng nhập bằng google, facebook trên chính website chúng ta á 😂.

Về cái này mình sẽ có một bài viết riêng luôn, vẫn trong series này nhé.

Cre: duthanhduoc
