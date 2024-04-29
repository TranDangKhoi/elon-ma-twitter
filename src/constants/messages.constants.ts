import { TweetAudienceEnum } from "~/constants/enums";
import { enumValuesToArray } from "~/utils/enumsToArray";

export const UserMessage = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  USER_NOT_FOUND: "Không tìm thấy người dùng",
  USER_FOUND: "Lấy thông tin người dùng thành công",
  USER_ALREADY_FOLLOWED: "Người dùng đã được theo dõi trước đó",
  OBJECT_ID_INVALID: "ID người dùng không hợp lệ",
  ACCESS_TOKEN_INVALID: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi access token)",
  REFRESH_TOKEN_SUCCESSFULLY: "Refresh token thành công",
  REFRESH_TOKEN_INVALID: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi refresh_token)",
  REFRESH_TOKEN_IS_REQUIRED: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống refresh token)",
  USERNAME_VALIDATION_ERROR:
    "Username cần có độ dài từ 4 tới 15 kí tự và chỉ được có chữ, số, dấu gạch dưới. Và không được chỉ có mỗi số",
  USERNAME_ALREADY_EXISTS: "Username đã có người sử dụng, vui lòng sử dụng một cái khác",
  EMAIL_VERIFY_TOKEN_INVALID: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi email verify token)",
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống email verify token)",
  GMAIL_NOT_VERIFIED: "Tài khoản Google của bạn chưa được xác  thực, vui lòng xác thực trước khi tiếp tục",
  FORGOT_PASSWORD_TOKEN_INVALID: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi sai forgot password token)",
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống forgot password token)",
  EMAIL_VERIFY_TOKEN_IS_VERIFIED: "Email đã được xác minh trước đó",
  EMAIL_OR_PASSWORD_IS_INCORRECT: "E-mail hoặc mật khẩu không chính xác",
  NAME_IS_REQUIRED: "Không được để trống tên người dùng",
  NAME_LENGTH_IS_INVALID: "Tên người dùng phải có độ dài từ 1 đến 100 ký tự",
  EMAIL_IS_REQUIRED: "Không được để trống địa chỉ e-mail",
  EMAIL_IS_INVALID: "Địa chỉ e-mail không hợp lệ",
  EMAIL_ALREADY_EXISTS: "Địa chỉ e-mail đã tồn tại, vui lòng sử dụng một e-mail khác",
  EMAIL_DOES_NOT_EXIST: "Địa chỉ e-mail không tồn tại, vui lòng kiểm tra lại",
  PASSWORD_IS_REQUIRED: "Không được để trống mật khẩu",
  PASSWORD_LENGTH_INVALID: "Mật khẩu phải có độ dài từ 6 đến 50 ký tự",
  PASSWORD_MUST_BE_STRONG:
    "Mật khẩu cần có ít nhất 6 ký tự và chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
  CHANGE_PASSWORD_SUCCESSFULLY: "Thay đổi mật khẩu thành công!",
  OLD_PASSWORD_IS_MISMATCHED: "Mật khẩu cũ không đúng, vui lòng nhập lại",
  CONFIRM_PASSWORD_IS_REQUIRED: "Không được để trống mật khẩu xác thực",
  CONFIRM_PASSWORD_LENGTH_INVALID: "Mật khẩu xác thực phải có độ dài từ 6 đến 50 ký tự",
  CONFIRM_PASSWORD_INVALID: "Mật khẩu xác thực không khớp",
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    "Mật khẩu xác thực cần có ít nhất 6 ký tự và chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
} as const;

export const FollowMessage = {
  NEED_TO_FOLLOW_FIRST: "Bạn cần theo dõi người dùng hiện tại nếu muốn hủy theo dõi họ",
  FOLLOW_SUCCESSFULLY: "Theo dõi người dùng thành công",
  UNFOLLOW_SUCCESSFULLY: "Bỏ theo dõi người dùng thành công",
} as const;

export const MediaMessage = {
  UPLOAD_IMAGE_SUCCESSFULLY: "Upload ảnh thành công",
  UPLOAD_VIDEO_SUCCESSFULLY: "Upload video thành công",
} as const;

export const TweetMessage = {
  TWEET_SUCCESSFULLY: "Tạo tweet thành công",
  DELETE_TWEET_SUCCESSFULLY: "Xóa tweet thành công",
  TWEET_TYPE_INVALID: `Đối tượng xem tweet phải là một trong các giá trị sau: ${enumValuesToArray(
    TweetAudienceEnum,
  ).join(", ")}`,
} as const;