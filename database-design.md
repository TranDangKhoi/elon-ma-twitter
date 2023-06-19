# Thiết kế Schema Twitter bằng MongoDB

## Một số ghi chú nhỏ

- Controllers dùng để thực hiện handle logic rồi sau đó trả về data, status, ... là chủ yếu, nhưng code handle logic nên để ở services cho đỡ loạn.

- Middleware thì chạy ở trong pipeline, tức là controller sẽ được chạy sau middlewares.

- Tên collection nên được đặt theo dạng số nhiều, kiểu snake_case, ví dụ `users`, `refresh_tokens`

- Tên field nên được đặt theo dạng snake_case, ví dụ `email_verify_token`, `forgot_password_token`

- `_id` là trường được MongoDB tự động tạo ra, không cần phải thêm trường `_id` vào. Cũng không nên tìm mọi cách để đổi tên `_id` thành `id` hay thay đổi cơ chế của nó. Vì sẽ làm giảm hiệu suất của MongoDB

- Trường `created_at`, `updated_at` nên có kiểu `Date` để dễ dàng sắp xếp, tìm kiếm, lọc theo thời gian

- Trường `created_at` nên luôn luôn được thêm vào khi tạo mới document

- Trường `updated_at` thì optional

- Tất cả trường đại diện id của document thì nên có kiểu `ObjectId`

- Để biết kiểu dữ liệu mà mongo hỗ trợ thì xem tại [đây](https://docs.mongodb.com/manual/reference/bson-types/)

## Phân tích chức năng

## users

- Người dùng đăng ký nhập `name`, `email`, `day_of_birth`, `password` là được. Vậy `name`, `email`, `day_of_birth`, `password` là những trường bắt buộc phải có bên cạnh`_id` là trường tự động tạo ra bởi MongoDB

- Sau khi đăng ký xong thì sẽ có email đính kèm `email_verify_token` để xác thực email (`randomusername.com/verify-email?email_verify_token=123321123`). Mỗi user chỉ có 1 `email_verify_token` duy nhất, vì nếu user nhấn re-send email thì sẽ tạo ra `email_verify_token` mới thay thế cái cũ. Vậy nên ta lưu thêm trường `email_verify_token` vào schema `users`. Trường này có kiểu `string`, nếu user xác thực email thì ta sẽ set `''`.

- Tương tự ta có chức năng quên mật khẩu thì sẽ gửi mail về để reset mật khẩu, ta cũng dùng `forgot_password_token` để xác thực (`randomusername.com/forgot-password?forgot_password_token=123321123`). Vậy ta cũng lưu thêm trường `forgot_password_token` vào schema `users`. Trường này có kiểu `string`, nếu user reset mật khẩu thì ta sẽ set `''`.

- Nên có một trường là `verify` để biết trạng thái tài khoản của user. Ví dụ chưa xác thực email, đã xác thực, bị khóa, lên tích xanh ✅. Vậy giá trị của nó nên là enum

- Người dùng có thể update các thông tin sau vào profile: `bio`, `location`, `website`, `username`, `avatar`, `cover_photo`. Vậy ta cũng lưu các trường này vào schema `users` với kiểu là `string`. `avatar`, `cover_photo` đơn giản chi là string url thôi. Đây là những giá trị optional, tức người dùng không nhập vào thì vẫn dùng bình thường. Nhưng cũng nên lưu set `''` khi người dùng không nhập gì để tiện quản lý.

> Một số người thích lưu ảnh vào trong database dưới dạng base64 thì điều đó là không nên (ảnh mặc dù 500KB nhưng khi chuyển sang base64 có thể lên vài MB), chúng ta nên xử lý upload ảnh lên một server nào đó rồi lấy về url của ảnh lưu vào database dưới dạng string

- Cuối cùng là trường `created_at`, `updated_at` để biết thời gian tạo và cập nhật user. Vậy ta lưu thêm 2 trường này vào schema User với kiểu `Date`. 2 trường này luôn luôn có giá trị.

```ts
enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned, // bị khóa
}
interface User {
  _id: ObjectId;
  name: string;
  email: string;
  date_of_birth: Date;
  password: string;
  created_at: Date;
  updated_at: Date;
  email_verify_token: string; // jwt hoặc '' nếu đã xác thực email
  forgot_password_token: string; // jwt hoặc '' nếu đã xác thực email
  verify: UserVerifyStatus;

  bio: string; // optional
  location: string; // optional
  website: string; // optional
  username: string; // optional
  avatar: string; // optional
  cover_photo: string; // optional
}
```

## Flow xác thực người dùng với Access Token

1. Client gửi request vào tài nguyên được bảo vệ trên server. Nếu client chưa được xác thực, server trả về lỗi 401 Authorization. Client gửi username và password của họ cho server.

2. Server xác minh thông tin xác thực được cung cấp so với cơ sở dữ liệu user. Nếu thông tin xác thực khớp, server tạo ra một JWT chứa payload là user_id (hoặc trường nào đó định danh người dùng). JWT này được gọi là Access Token.

3. Server gửi access token cho client.

4. Client lưu trữ access token ở bộ nhớ thiết bị (cookie, local storage,...).

5. Đối với các yêu cầu tiếp theo, client gửi kèm access token trong header của request.

6. Server verify access token bằng secret key để kiểm tra access token có hợp lệ không.

7. Nếu hợp lệ, server cấp quyền truy cập vào tài nguyên được yêu cầu. Khi người dùng muốn đăng xuất thì chỉ cần xóa access token ở bộ nhớ thiết bị là được.

8. Khi access token hết hạn thì server sẽ từ chối yêu cầu của client, client lúc này sẽ xóa access token ở bộ nhớ thiết bị và chuyển sang trạng thái bị logout.

## Vấn đề của Access Token

Như flow trên thì chúng ta không lưu access token ở trên server, mà lưu ở trên client. Điều này gọi là stateless, tức là server không lưu trữ trạng thái nào của người dùng nào cả.

Khuyết điểm của nó là chúng ta không thể thu hồi access token được. Các bạn có thể xem một số ví dụ dưới đây.

Ví dụ 1: Ở server, chúng ta muốn chủ động đăng xuất một người dùng thì không được, vì không có cách nào xóa access token ở thiết bị client được.

Ví dụ 2: Client bị hack dẫn đến làm lộ access token, hacker lấy được access token và có thể truy cập vào tài nguyên được bảo vệ. Dù cho server biết điều đấy nhưng không thể từ chối access token bị hack đó được, vì chúng ta chỉ verify access token có đúng hay không chứ không có cơ chế kiểm tra access token có nằm trong danh sách blacklist hay không.

Với ví dụ thứ 2, chúng ta có thể thiết lập thời gian hiệu lực của access token ngắn, ví dụ là 5 phút, thì nếu access token bị lộ thì hacker cũng có ít thời gian để xâm nhập vào tài nguyên của chúng ta hơn => giảm thiểu rủi ro.

Nhưng mà cách này không hay lắm, vì nó sẽ làm cho người dùng bị logout và phải login sau mỗi 5 phút, rất khó chịu về trải nghiệm người dùng.

Lúc này người ta mới nghĩ ra ra một cách để giảm thiểu những vấn đề trên, đó là sử dụng thêm Refresh Token.

## refresh_tokens

Hệ thống sẽ dùng JWT để xác thực người dùng. Vậy mỗi lần người dùng đăng nhập thành công thì sẽ tạo ra 1 JWT access token và 1 refresh token.

- JWT access token thì không cần lưu vào database, vì chúng ta sẽ cho nó stateless
- Còn refresh token thì cần lưu vào database để tăng tính bảo mật.

Một user thì có thể có nhiều refresh token (không giới hạn), nên không thể lưu hết vào trong collection `users` được => Quan hệ 1 - rất nhiều

Và đôi lúc chúng ta chỉ quan tâm đến refresh token mà không cần biết user là ai. Vậy nên ta tạo ra một collection riêng để lưu refresh token.

```ts
interface RefreshToken {
  _id: ObjectId;
  token: string;
  created_at: Date;
  user_id: ObjectId;
}
```

## followers

Một người dùng có thể follow rất nhiều user khác, nếu dùng 1 mảng `followings` chứa ObjectId trong collection `users` thì sẽ không tối ưu. Vì dễ chạm đến giới hạn 16MB của MongoDB.

Chưa hết, nếu dùng mảng `followings` thì khi muốn tìm kiếm user A đang follow ai rất dễ nhưng ngược lại, tìm kiếm ai đang follow user A thì lại rất khó.

Vậy nên ta tạo ra một collection riêng để lưu các mối quan hệ follow giữa các user là hợp lý hơn cả.

1 user có rất nhiều follower, và 1 follower cũng có rất nhiều user khác follow lại => Quan hệ rất nhiều - rất nhiều

```ts
interface Follower {
  _id: ObjectId;
  user_id: ObjectId;
  followed_user_id: ObjectId;
  created_at: Date;
}
```

## tweets

Chúng ta sẽ chọn ra những tính năng chính của tweet để clone

1. Tweet có thể chứa text, hashtags, metions, ảnh, video
2. Tweet có thể hiển thị cho everyone hoặc Twitter Circle
3. Tweet có thể quy định người reply (everyone, người mà chúng ta follow , người chúng ta metion)

- Tweet sẽ có nested tweet, nghĩa là tweet có thể chứa tweet con bên trong. Nếu dùng theo kiểu nested object sẽ không phù hợp, vì sớm thôi, nó sẽ chạm đến giới hạn. Chưa kể query thông tin 1 tweet con rất khó.

Vậy nên ta sẽ lưu trường `parent_id` để biết tweet này là con của ai. Nếu `parent_id` là `null` thì đó là tweet gốc.

- Nếu là tweet bình thường thì sẽ có `content` là string. Còn nếu là retweet thì sẽ không có `content` mà chỉ có `parent_id` thôi, lúc này có thể cho content là `''` hoặc `null`, như mình phân tích ở những bài trước thì mình thích để `''` hơn, đỡ phải phân tích trường hợp `null`. Vậy nên `content` có thể là `string`.

> Nếu là '' thì sẽ chiếm bộ nhớ hơn là null, nhưng điều này là không đáng kể so với lợi ích nó đem lại

- `audience` đại diện cho tính riêng tư của tweet. Ví dụ tweet có thể là public cho mọi người xem hoặc chỉ cho nhóm người nhất định. Vậy nên `visibility` có thể là `TweetAudience` enum.

- `type` đại diện cho loại tweet. Ví dụ tweet, retweet, quote tweet.

- `hashtag` là mảng chứa ObjectId của các hashtag. Vì mỗi tweet có thể có nhiều hashtag. Vậy nên `hashtag` có thể là `ObjectId[]`.

- `mentions` là mảng chứa ObjectId của các user được mention. Vì mỗi tweet có thể có nhiều user được mention. Vậy nên `mentions` có thể là `ObjectId[]`.

- `medias` là mảng chứa ObjectId của các media. Vì mỗi tweet chỉ có thể có 1 vài media. Nếu upload ảnh thì sẽ không upload được video và ngược lại. Vậy nên `medias` có thể là `Media[]`.

- Bên twitter sẽ có rất là nhiều chỉ số để phân tích lượt tiếp cận của 1 tweet. Trong giới hạn khả năng thì chúng ta chỉ phân tích lượt view thôi.

  Lượt view thì chúng ta chia ra làm 2 loại là `guest_views` là số lượng lượt xem của tweet từ người dùng không đăng nhập và `user_views` là dành cho đã đăng nhập. 2 trường này mình sẽ cho kiểu dữ liệu là `number`.

```ts
interface Tweet {
  _id: ObjectId;
  user_id: ObjectId;
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_id: null | ObjectId; //  chỉ null khi tweet gốc
  hashtags: ObjectId[]; // Vì twitter không phân biệt hashtags viết chữ thường với hoa nên hashtags ta sẽ lưu ở dạng ObjectId[] chứ không phải string[]
  mentions: ObjectId[];
  medias: Media[];
  guest_views: number;
  user_views: number;
  created_at: Date;
  updated_at: Date;
}
```

```ts
interface Media {
  url: string;
  type: MediaType; // video, image để bên FE biết cách hiển thị sao cho đúng
}
enum MediaType {
  Image,
  Video,
}
enum TweetAudience {
  Everyone, // 0
  TwitterCircle, // 1
}
enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet,
}
```

## bookmarks

Bookmark các tweet lại, mỗi user không giới hạn số lượng bookmark. Sở dĩ không cần `updated_at` là vì trong trường hợp người dùng unbookmark thì chúng ta sẽ xóa document này đi.

```ts
interface Bookmark {
  _id: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  created_at: Date;
}
```

## likes

Tương tự `bookmarks` thì chúng ta có collection `likes`

```ts
interface Like {
  _id: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  created_at: Date;
}
```

## hashtags

- Hỗ trợ tìm kiếm theo hashtag.
- Mỗi tweet có thể có ít hashtag.
- Mỗi hashtag có rất nhiều tweet.

❌Không nên làm như dưới đây

```ts
interface Tweet {
  _id: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc
  ❌hashtags:string[] // Không nên nhúng như thế này, vì sẽ gây khó khăn trong việc tìm kiếm những tweet nào có hashtag này, cũng như là gây lặp lại dữ liệu về tên hashtag
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date

}
```

=> Quan hệ ít - rất nhiều

- Lưu một array ObjectId `hashtags` trong collection `tweets`

- Tạo ra một collection riêng để lưu `hashtags` và không lưu mảng `tweet_id` vào trong collection `hashtags`. Vì nếu lưu `tweet_id` vào trong collection `hashtags` thì sẽ dễ chạm đến giới hạn 16MB của MongoDB. Và cũng không cần thiết để lưu, vì khi search các tweet liên quan đến hashtag thì chúng ta sẽ dùng id hashtag để tìm kiếm trong collection `tweets`.

```ts
interface Hashtag {
  _id: ObjectId;
  name: string;
  created_at: Date;
}
```
