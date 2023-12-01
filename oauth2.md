# Các bước để có thể hoàn thành một app OAuth2 hoàn chỉnh ở cả server-side và client-side

Mình sẽ mặc định rằng mọi người đã biết a thing or two về lập trình, nên cái này chỉ tóm gọn lại flow để hoàn thiện được chức năng mình cần

## 1. Đăng ký sử dụng OAuth 2.0 từ một bên thứ ba

Đầu tiên, để sử dụng được OAuth2.0 thì đương nhiên ta sẽ phải dăng ký dịch vụ của một trong số các bên thứ ba, ví dụ như Google, Facebook, Github, ...v.v. Tùy nhu cầu sử dụng, mỗi dịch vụ nó sẽ cung cấp một số thông tin có ích nhất định để phù hợp hơn với business của trang web chúng ta. Ví dụ bạn đang tạo một trang web chuyên chia sẻ các bài viết liên quan tới công nghệ, máy móc, AI. Thì việc cho phép đăng nhập = Github sẽ lấy được một vài thông tin có ích hơn từ người dùng (mình đoán vậy).

Ở markdown này, mình sẽ chỉ viết về cách đăng ký sử dụng OAuth2.0 của Google thôi. Và cứ yên tâm rằng là, flow của tất cả bọn này đều na ná nhau hết

### Bước 1

- Vô trang web nè: https://console.cloud.google.com/
- Tạo một project bằng cách click vào New Project, nếu trước đó bạn đã từng có một project rồi thì ... chắc bạn cũng biết cách tạo một project thứ 2 như nào nhỉ

#### 1. Ở mục Quick access bên dưới: Bấm vào APIs & Services

![Step 1 screenshot](https://images.tango.us/workflows/bb3e7b4c-909a-4425-99a3-eb3a52380305/steps/4ae16831-bbdb-4f22-8386-af4699cd1fb5/30164c35-c785-4dbf-b408-1871ffbe4a20.png?crop=focalpoint&fit=crop&fp-x=0.2358&fp-y=0.6498&fp-z=2.1336&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=384&mark-y=280&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz00MzImaD0xNTQmZml0PWNyb3AmY29ybmVyLXJhZGl1cz0xMA%3D%3D)

#### 2. Bấm vào OAuth consent screen

![Step 2 screenshot](https://images.tango.us/workflows/bb3e7b4c-909a-4425-99a3-eb3a52380305/steps/db274e71-10fc-47a5-a3d6-69dc04d9ea60/2863e1a5-70f1-4dcb-8ed7-268fabd4518d.png?crop=focalpoint&fit=crop&fp-x=0.0866&fp-y=0.3179&fp-z=2.1365&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=7&mark-y=318&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz00MzEmaD03OSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

#### 3. Chỉnh sửa lại App name của bạn, lưu ý không đặt tên linh tinh, đặt đúng theo tên project của mình

![Step 3 screenshot](https://images.tango.us/workflows/bb3e7b4c-909a-4425-99a3-eb3a52380305/steps/850d0ca7-0a45-4ab5-9dd1-7205582d7d75/9f361d08-08c4-43ce-818b-a58aa0f316bf.png?crop=focalpoint&fit=crop&fp-x=0.3428&fp-y=0.3963&fp-z=1.6126&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=290&mark-y=340&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz02MTkmaD0zNSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

### 4. Thêm support email, cái này thì sử dụng e-mail hiện tại mà bạn đang đăng nhập vào

![Step 4 screenshot](https://images.tango.us/workflows/bb3e7b4c-909a-4425-99a3-eb3a52380305/steps/92e77887-f9d5-40c1-84c8-aaac867782ac/d58cba90-671c-4ded-8a27-c56fb393d419.png?crop=focalpoint&fit=crop&fp-x=0.3428&fp-y=0.4834&fp-z=1.6126&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=290&mark-y=340&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz02MTkmaD0zNSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

#### 5. Chọn và upload logo theo nhu cầu của bạn

#### 6. Update nội dung Application home page, privacy policy link, terms of service link

Các link này sẽ là domain của project bên phía FE, hiện tại nếu bạn chỉ đang học hành test tủng thì thêm vào 3 đường link theo các bước sau:

- Đầu tiên, các bạn phải xác định được URL project phía FE sẽ là gì, vì ở đây mình chỉ đang tập tành sử dụng OAuth 2.0 xem nó có cái gì hay, chứ chưa deploy lên thành một trang web thực sự. Nên ta sẽ truyền vào localhost với số port của project FE của các bạn, ví dụ FE của các bạn có port là 3000, thì sẽ viết vào là như sau:

  - Application home page: http://localhost:3000
  - Application privacy policy link: http://localhost:3000/privacy-policy (chưa có route này cũng không sao, cứ ghi vào là được)
  - Application terms of service link: http://localhost:3000/terms-of-service (chưa có route này cũng không sao, cứ ghi vào là được)

#### 7. Authorized domains

Cái này ta tạm thời bỏ qua, không cần làm gì với nó cả. Nếu bạn cần thì có thể tự vọc vạch thêm xem nó để làm gì

#### 8. Developer contact information

Thêm e-mail của các bạn vào thôi

#### 9. Save lại !!!

### 2. Tạo credentials để Google sẽ cung cấp cho bạn những thứ cần có để sử dụng được dịch vụ OAuth 2.0 của họ

Làm theo các bước sau

#### 1. Bấm vào Credentials

![Step 1 screenshot](https://images.tango.us/workflows/acadb589-1aaf-4a2e-af8d-1dfe28d632ca/steps/5c8ccc29-bd13-4b65-89e7-be56cb10fd9e/b1a8574c-a5a2-4b50-96f5-cb1f06aacfad.png?crop=focalpoint&fit=crop&fp-x=0.0866&fp-y=0.2750&fp-z=2.1365&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=7&mark-y=318&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz00MzEmaD03OSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

#### 2. Bấm vào CREATE CREDENTIALS

![Step 2 screenshot](https://images.tango.us/workflows/acadb589-1aaf-4a2e-af8d-1dfe28d632ca/steps/fe64a6d2-db2c-420b-9835-d1f68ee545b0/4bc6af98-338a-4a95-81af-8f435098b122.png?crop=focalpoint&fit=crop&fp-x=0.3246&fp-y=0.1321&fp-z=2.3802&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=428&mark-y=184&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz0zNDMmaD04MCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

#### 3. Bấm vào OAuth client ID

![Step 3 screenshot](https://images.tango.us/workflows/acadb589-1aaf-4a2e-af8d-1dfe28d632ca/steps/09c8e1f0-2007-4a77-b8ed-3a15981611d7/e092c747-6702-4564-b4a8-7a0f849fad14.png?crop=focalpoint&fit=crop&fp-x=0.4099&fp-y=0.2438&fp-z=1.6928&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=305&mark-y=256&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz01OTEmaD03OCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

#### 4. Chọn kiểu app của bạn, ở đây mình đang làm việc với website thì mình sẽ chọn Web application

![Step 4 screenshot](https://images.tango.us/workflows/acadb589-1aaf-4a2e-af8d-1dfe28d632ca/steps/dd55ac26-de58-4cf7-856f-bb42b7a80a2e/a4d3f344-d235-4b7d-9983-0438b831b0b2.png?crop=focalpoint&fit=crop&fp-x=0.3428&fp-y=0.2922&fp-z=1.6126&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=290&mark-y=319&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz02MTkmaD0zNSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

#### 5. Chọn Web application

![Step 5 screenshot](https://images.tango.us/workflows/acadb589-1aaf-4a2e-af8d-1dfe28d632ca/steps/8209fcc2-7ac5-441f-a8d9-218a59b05569/7c2209f3-f05b-45a9-8bdf-82e48f5035e1.png?crop=focalpoint&fit=crop&fp-x=0.3428&fp-y=0.3072&fp-z=1.6126&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=290&mark-y=329&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz02MTkmaD00OSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

#### 6. Gõ vào tên credential của bạn

![Step 6 screenshot](https://images.tango.us/workflows/acadb589-1aaf-4a2e-af8d-1dfe28d632ca/steps/e7da054a-26ef-4cc6-ab7c-92ff352c0b40/46e8a0e9-3a2e-4423-9efa-453950627bdf.png?crop=focalpoint&fit=crop&fp-x=0.3428&fp-y=0.3545&fp-z=1.6126&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=290&mark-y=340&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz02MTkmaD0zNSZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

#### 7. Bỏ qua mục Authorized JavaScript origins

#### 8. Bấm vào ADD URI ở mục Authorized redirect URIs

Điền vào đây một số url để Google OAuth có thể redirect về sau khi đăng nhập thành công. Mình sẽ điền API end point của mình

- Ví dụ: http://localhost:8080/users/oauth/google

![Step 7 screenshot](https://images.tango.us/workflows/acadb589-1aaf-4a2e-af8d-1dfe28d632ca/steps/2fa7c2b5-e058-4bca-a97c-6fd84d950f7c/5e3c558f-9152-4a62-94d0-b3e28c04e5ad.png?crop=focalpoint&fit=crop&fp-x=0.2064&fp-y=0.8491&fp-z=2.7773&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=500&mark-y=380&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz0yMDAmaD03MCZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

#### 8. Gõ vào đường link redirect của bạn

![Step 8 screenshot](https://images.tango.us/workflows/acadb589-1aaf-4a2e-af8d-1dfe28d632ca/steps/7b1826c5-b1a5-45b0-87f8-abf6fbff9424/95a9943f-6f2c-4b7e-adf5-73c7a20ffa23.png?crop=focalpoint&fit=crop&fp-x=0.3275&fp-y=0.8614&fp-z=1.6965&w=1200&border=2%2CF4F2F7&border-radius=8%2C8%2C8%2C8&border-radius-inner=8%2C8%2C8%2C8&blend-align=bottom&blend-mode=normal&blend-x=0&blend-w=1200&blend64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL21hZGUtd2l0aC10YW5nby13YXRlcm1hcmstdjIucG5n&mark-x=305&mark-y=528&m64=aHR0cHM6Ly9pbWFnZXMudGFuZ28udXMvc3RhdGljL2JsYW5rLnBuZz9tYXNrPWNvcm5lcnMmYm9yZGVyPTQlMkNGRjc0NDImdz01ODkmaD0zNiZmaXQ9Y3JvcCZjb3JuZXItcmFkaXVzPTEw)

Sau khi xong hết các bước trên thì lúc này ta sẽ nhận được Client ID và Client Secret, các bạn nên lưu lại tất cả mọi thứ bằng cách bấm Download JSON sau khi tạo xong credential

### 3. Đăng ký xong dịch vụ ròi thì code thôi

#### Bước 1: Thực hiện hiển thị được màn hình đăng nhập bằng Google khi click vô Login with Google bên phía FE

Các bạn có thể đọc, và làm theo tại đây:

- Phía FE: https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
- Phía BE: https://developers.google.com/identity/protocols/oauth2/web-server

- Đầu tiên, thì ta cần phải hiểu được rằng là, muốn hiển thị được màn hình đăng nhập bằng Google và có thể chọn tài khoản muốn sử dụng để đăng nhập, thì ta phải được sự chấp thuận từ phía dịch vụ của Google. Để làm được việc này thì ta cần có các thông tin như sau:

  - Sử dụng đường dẫn sau để có quyền truy cập vào Google OAuth 2.0 : https://accounts.google.com/o/oauth2/v2/auth, đường dẫn này chỉ chấp nhận kiểu giao thức HTTPS, nếu ta cố tình đổi sang http thì google sẽ refuse và đổi lại qua https
  - Sau khi có được đường dẫn rồi, thì ta cần phải thực hiện truyền một vài tham số vào URL để bên phía Google có thể xác thực rằng: "À, thằng này đã đăng kí dịch vụ OAuth 2.0 của bên mình rồi, ok tao sẽ cho nó quyền sử dụng chức năng này"
  - Thì các tham số này chính là những tham số trong file Credentials JSON mà mình đã tải về khi đăng kí sử dụng dịch vụ OAuth 2.0 bên phía Google, và những tham số này cần đc bảo mật kĩ, nên bạn hãy lưu nó vào một file .env, và gitignore nó nha

Thì đây là danh sách các tham số mà ta cần truyền vào, để Google chấp thuận chúng ta:

![Parameters](https://media.discordapp.net/attachments/1145987650222817322/1180093253828214866/image.png?ex=657c2a7c&is=6569b57c&hm=5e5a773fc2c6f3ce37e4855a7f24f95d627908c9ad4e13311cf0d940840b3881&=&format=webp&quality=lossless&width=697&height=545)

Mình sẽ giải thích tác dụng của từng params theo nghĩa mình hiểu:

- response_type: Dùng để chỉ định rõ kiểu response mà bạn muốn trả về cho server sau khi thực hiện login = google thành công, sẽ có 3 value mình có thể điền vào là "code", "token", "id_token". Ok vậy là có 3 trường hợp phải giải thích:

  - code: Flow ở phần này thì cũng khá dễ hiểu thôi. Khi chúng ta thực hiện đăng nhập = Google và được chấp nhận/thông qua cái middleware của bọn họ, thì server sẽ trả ra cho chúng ta một đoạn authorization code để mình có thể dùng nó lấy ra access token của người dùng
  - token: Flow ở phần này thì nó ngắn hơn bên trên một chút. Khi chúng ta thực hiện đăng nhập = Google và được chấp nhận/thông qua, thì server sẽ lập tức trả ra access token cho phía client luôn, không cần sử dụng authorization code để lấy được access token nữa. Chỉ dùng vào trường hợp khi mà phía client không có cách nào để có thể bảo quản được access_token ở một nơi an toàn

  Bạn có thể tìm hiểu thêm về vấn đề này qua việc đọc các bài viết liên quan tới PKCE

  - id_token: Response type này sẽ được sử dụng khi bạn làm việc với OpenID Connect (OIDC). Nó trả ra cho chúng ta một ID Token, có thể hiểu nôm na là một JWT chứa những dữ liệu chứng thực về tình trạng authentication của người dùng

Ngoài ra, bạn còn có thể kết hợp nhiều kiểu response_type cùng một lúc, bằng cách ngăn cách chúng giữa các dấu space, ví dụ như sau:

```jsx
const query = {
  client_id: VITE_GOOGLE_OAUTH_CLIENT_ID,
  redirect_uri: VITE_GOOGLE_REDIRECT_URI,
  response_type: "code id_token",
};
```
