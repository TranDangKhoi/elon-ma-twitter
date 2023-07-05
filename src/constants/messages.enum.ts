export enum ValidationMessage {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  ACCESS_TOKEN_INVALID = "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi access token)",
  REFRESH_TOKEN_INVALID = "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi refresh_token)",
  REFRESH_TOKEN_IS_REQUIRED = "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống refresh token)",
  EMAIL_VERIFY_TOKEN_INVALID = "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi email verify token)",
  EMAIL_VERIFY_TOKEN_IS_REQUIRED = "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống email verify token)",
  EMAIL_VERIFY_TOKEN_IS_VERIFIED = "Email đã được xác minh trước đó",
  EMAIL_OR_PASSWORD_IS_INCORRECT = "E-mail hoặc mật khẩu không chính xác",
  NAME_IS_REQUIRED = "Không được để trống tên người dùng",
  NAME_LENGTH_IS_INVALID = "Tên người dùng phải có độ dài từ 1 đến 100 ký tự",
  EMAIL_IS_REQUIRED = "Không được để trống địa chỉ e-mail",
  EMAIL_IS_INVALID = "Địa chỉ e-mail không hợp lệ",
  EMAIL_ALREADY_EXISTS = "Địa chỉ e-mail đã tồn tại, vui lòng sử dụng một e-mail khác",
  PASSWORD_IS_REQUIRED = "Không được để trống mật khẩu",
  PASSWORD_LENGTH_INVALID = "Mật khẩu phải có độ dài từ 6 đến 50 ký tự",
  PASSWORD_MUST_BE_STRONG = "Mật khẩu cần có ít nhất 6 ký tự và chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
  CONFIRM_PASSWORD_IS_REQUIRED = "Không được để trống mật khẩu xác thực",
  CONFIRM_PASSWORD_LENGTH_INVALID = "Mật khẩu xác thực phải có độ dài từ 6 đến 50 ký tự",
  CONFIRM_PASSWORD_INVALID = "Mật khẩu xác thực không khớp",
  CONFIRM_PASSWORD_MUST_BE_STRONG = "Mật khẩu xác thực cần có ít nhất 6 ký tự và chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
}
